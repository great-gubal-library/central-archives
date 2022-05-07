import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { UserInfo } from '@app/auth/model/user-info';
import { serverConfiguration } from '@app/configuration';
import { Character, User } from '@app/entity';
import { checkPassword, generateVerificationCode, hashPassword } from '@app/security';
import { ChangeEmailRequestDto } from '@app/shared/dto/user/change-email-request.dto';
import { ChangePasswordRequestDto } from '@app/shared/dto/user/change-password-request.dto';
import { ForgotPasswordRequestDto } from '@app/shared/dto/user/forgot-password-request.dto';
import { ResetPasswordRequestDto } from '@app/shared/dto/user/reset-password-request.dto';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserEmailInfoDto } from '@app/shared/dto/user/user-email.info.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import { Role } from '@app/shared/enums/role.enum';
import errors from '@app/shared/errors';
import { BadRequestException, ConflictException, GoneException, HttpService, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import parse from 'node-html-parser';
import { Connection, EntityManager, Repository } from 'typeorm';
import { CharactersService } from '../characters/characters.service';
import { isQueryFailedError } from '../../../common/db';
import { MailService } from '../../../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private connection: Connection,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private charactersService: CharactersService,
    private mailService: MailService,
    private httpService: HttpService,
  ) {}

  async signUp(
    signupData: UserSignUpDto,
  ): Promise<{ userId: number; characterVerificationCode: string }> {
    try {
      const { userEntity, characterEntity } = await this.connection.transaction(
        async (em) => {
          const user = await em.getRepository(User).save({
            email: signupData.email,
            passwordHash: await hashPassword(signupData.password),
            role: Role.UNVERIFIED,
            verificationCode: generateVerificationCode(),
          });

          const character = await this.charactersService.saveCharacterForUser(em, user, signupData.lodestoneId);

          return { userEntity: user, characterEntity: character };
        },
      );

      void this.sendVerificationMail(userEntity, characterEntity.name); // no await
      return {
        userId: userEntity.id,
        characterVerificationCode: characterEntity.verificationCode!, // set by saveCharacterForUser
      };
    } catch (e) {
      if (isQueryFailedError(e)) {
        if (e.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('This email or character has already been used');
        }
      }

      // default
      throw e;
    }
  }

  async confirmEmail(verificationCode: string): Promise<number> {
    return this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOne({
        verificationCode,
      });

      if (!user) {
        throw new NotFoundException('Invalid verification code');
      }

      user.verificationCode = null;
      user.verifiedAt = new Date();
      await userRepo.save(user);
      await this.updatePostVerifyRole(em, user);
      return user.id;
    });
  }

  async resendConfirmationEmail(user: UserInfo): Promise<void> {
    const userEntity = (await this.userRepo.findOne(user.id, {
      select: [ 'id', 'email', 'verificationCode' ]
    }))!;

    if (userEntity.verifiedAt) {
      throw new ConflictException('Email already verified');
    }

    const characterData = await this.characterRepo.findOne({
      where: {
        user: userEntity
      },
      select: [ 'id', 'name' ],
    });

    if (!characterData) {
      throw new ConflictException('User has no character? This should be impossible');
    }

    await this.sendVerificationMail(userEntity, characterData.name);
  }

  private async sendVerificationMail(user: User, name: string): Promise<void> {
    const link = `${serverConfiguration.frontendRoot}/confirm-email/${user.verificationCode}`;
    await this.mailService.sendUserVerificationMail(user.email, name, link);
  }

  toSession(userInfo: UserInfo): SessionDto {
    return userInfo;
  }

  async getVerificationStatus(user: UserInfo, characterId: number): Promise<VerificationStatusDto> {
    const userData = await this.userRepo.findOne(user.id, {
      select: [ 'email', 'verifiedAt' ],
    });

    if (!userData) {
      throw new BadRequestException(`User ${user.id} not found`);
    }

    const characterData = await this.characterRepo.findOne(characterId, {
      select: [ 'verificationCode', 'verifiedAt' ],
    });

    if (!characterData) {
      throw new BadRequestException(`Character ${characterId} not found`);
    }

    return {
      email: userData.email,
      emailVerified: userData.verifiedAt !== null,
      characterVerified: characterData.verifiedAt !== null,
      characterVerificationCode: characterData.verificationCode
    };
  }

  async verifyCharacter(
    user: UserInfo,
    verifyData: VerifyCharacterDto,
  ): Promise<void> {
    await this.connection.transaction(async (em) => {
      const characterRepo = em.getRepository(Character);
      const character = await characterRepo.findOne({
        id: verifyData.id,
        user: {
          id: user.id,
        },
      });

      if (!character) {
        throw new BadRequestException('No such character belongs to you');
      }

      if (!character.verificationCode) {
        throw new BadRequestException('Already verified');
      }

      const characterData = await this.parseLodestoneProfile(
        character.lodestoneId,
      );

      if (!characterData) {
        throw new GoneException('Character deleted');
      }

      if (!characterData.includes(character.verificationCode)) {
        throw new NotFoundException('Verification string not found in character profile');
      }

      // Passed all checks - character verified!
      character.verificationCode = null;
      character.verifiedAt = new Date();
      await characterRepo.save(character);

      const userRepo = em.getRepository(User);
      const userEntity = await userRepo.findOne(user.id);

      if (!userEntity) {
        throw new GoneException();
      }

      await this.updatePostVerifyRole(em, userEntity);
    });
  }

  private async parseLodestoneProfile(lodestoneId: number): Promise<string> {
    try {
      // We're parsing Lodestone directly in this case because XIVAPI caches the result.
      const url = `https://eu.finalfantasyxiv.com/lodestone/character/${lodestoneId}/`;
      const page = (await this.httpService.get<string>(url).toPromise()).data;
      const doc = parse(page);
      const profileField = doc.querySelector('.character__selfintroduction');

      if (!profileField) {
        throw new ServiceUnavailableException('Lodestone page structure seems to have changed');
      }

      return profileField.textContent;
    } catch (e) {
      if (errors.getStatusCode(e) === HttpStatus.NOT_FOUND) {
        throw new GoneException('Character not found on Lodestone');
      }

      throw new ServiceUnavailableException('Unable to check character on Lodestone');
    }
  }

  private async updatePostVerifyRole(em: EntityManager, user: User) {
    if (user.role !== Role.UNVERIFIED || user.verifiedAt === null) {
      return;
    }

    // Assumes one character per user. This is safe because unverified users always have exactly one character.
    const character = await em.getRepository(Character).findOne({
      where: {
        user: {
          id: user.id
        }
      },
      select: [ 'id', 'verifiedAt' ]
    });

    if (!character || character.verifiedAt === null) {
      return;
    }

    const savedUser = user;
    savedUser.role = Role.USER;
    await em.getRepository(User).save(savedUser);
  }

  async forgotPassword(request: ForgotPasswordRequestDto): Promise<void> {
    const result = await this.connection.transaction(async (em) => {
      const repo = em.getRepository(User);
      const user = await repo.findOne({
        email: request.email,
      });

      if (!user) {
        // No such email in the database. Don't do anything, but don't reveal this to the client
        return null;
      }

      // TODO: Assumes one character per user
      const character = await em.getRepository(Character).findOne({
        where: {
          user: {
            id: user.id
          },
        },
        select: [ 'name' ]
      });

      // Note that we intentionally don't check verifiedAt. If the user is unverified,
      // clicking the password reset link will silently double as email verification.
      user.verificationCode = generateVerificationCode();
      await repo.save(user);
      
      return {
        email: user.email,
        name: character ? character.name : user.email,
        verificationCode: user.verificationCode
      };
    });

    if (!result) {
      return;
    }

    const link = `${serverConfiguration.frontendRoot}/reset-password/${result.verificationCode}`;
    await this.mailService.sendPasswordResetMail(result.email, result.name, link);
  }

  async resetPassword(request: ResetPasswordRequestDto): Promise<void> {
    const verified = await this.connection.transaction(async (em) => {
      const repo = em.getRepository(User);
      const user = await repo.findOne({
        email: request.email,
        verificationCode: request.verificationCode,
      });

      if (!user) {
        throw new BadRequestException('Invalid email or verification code');
      }

      user.passwordHash = await hashPassword(request.password);

      if (user.verifiedAt !== null) {
        // User is already verified, so remove the verification code immediately so it cannot be used again.
        // Otherwise, we reuse it to also confirm the email while we're at it.
        user.verificationCode = null;
      }

      await repo.save(user);
      return user.verifiedAt !== null;
    });

    if (!verified) {
      await this.confirmEmail(request.verificationCode);
    }
  }

  async changePassword(request: ChangePasswordRequestDto, userInfo: UserInfo): Promise<void> {
    await this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = (await userRepo.findOne(userInfo.id))!;

      if (!(await checkPassword(request.currentPassword, user.passwordHash))) {
        throw new BadRequestException('Invalid current password');
      }

      user.passwordHash = await hashPassword(request.newPassword);
      await userRepo.save(user);
    });
  }

  async getEmail(@CurrentUser() user: UserInfo): Promise<UserEmailInfoDto> {
    const userData = (await this.userRepo.findOne(user.id, {
      select: [ 'email' ],
    }))!;

    return {
      email: userData.email
    };
  }
  
  async changeEmail(request: ChangeEmailRequestDto, @CurrentUser() userInfo: UserInfo): Promise<void> {
    const { userEntity, characterName } = await this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = (await userRepo.findOne(userInfo.id))!;

      if (!(await checkPassword(request.currentPassword, user.passwordHash))) {
        throw new BadRequestException('Invalid current password');
      }

      if ((await userRepo.count({ email: request.newEmail })) > 0) {
        throw new ConflictException('This email is already in use by another user');
      }

      user.newEmail = request.newEmail;
      user.newEmailVerificationCode = generateVerificationCode();
      await userRepo.save(user);

      return {
        userEntity: user,
        characterName: userInfo.characters[0].name
      };
    });

    const link = `${serverConfiguration.frontendRoot}/confirm-new-email/${userEntity.newEmailVerificationCode}`;
    await this.mailService.sendNewEmailVerificationMail(request.newEmail, characterName, link);
  }

  async confirmNewEmail(newEmailVerificationCode: string): Promise<number> {
    return this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOne({
        newEmailVerificationCode,
      });

      if (!user) {
        throw new NotFoundException('Invalid verification code');
      }

      if (!user.newEmail) {
        throw new ConflictException('No email change was requested');
      }

      // We not only verify the new email, but if the user was unverified, we mark them as verified, too.
      user.email = user.newEmail;
      user.newEmailVerificationCode = null;
      user.verificationCode = null;

      if (user.verifiedAt === null) {
        user.verifiedAt = new Date();
      }

      await userRepo.save(user);
      await this.updatePostVerifyRole(em, user);
      return user.id;
    });
  }
}
