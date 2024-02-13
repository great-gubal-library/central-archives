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
import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { isQueryFailedError } from '../../../common/db';
import { MailService } from '../../../mail/mail.service';
import { CharactersService } from '../characters/characters.service';
import { LodestoneService } from '../lodestone/lodestone.service';
import { DateTime } from 'luxon';
import utils from 'apps/chaosarchives/src/common/utils';
import { SiteRegion, asSiteRegion } from '@app/shared/enums/region.enum';

@Injectable()
export class UserService {
  constructor(
    private connection: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private charactersService: CharactersService,
    private mailService: MailService,
    private lodestoneService: LodestoneService,
  ) {}

  async signUp(
    signupData: UserSignUpDto,
    region: SiteRegion,
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

          const character = await this.charactersService.saveCharacterForUser(em, user, signupData.lodestoneId, region);

          return { userEntity: user, characterEntity: character };
        },
      );

      void this.sendVerificationMail(userEntity, region, characterEntity.name); // no await
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
      const user = await userRepo.findOneBy({
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
    const userEntity = (await this.userRepo.findOne({
      where: {
        id: user.id,
      },
      select: [ 'id', 'email', 'verificationCode' ]
    }))!;

    if (userEntity.verifiedAt) {
      throw new ConflictException('Email already verified');
    }

    const characterData = await this.characterRepo.findOne({
      where: {
        user: {
          id: userEntity.id,
        }
      },
      select: [ 'id', 'name', 'server' ],
    });

    if (!characterData) {
      throw new ConflictException('User has no character? This should be impossible');
    }

    await this.sendVerificationMail(userEntity, asSiteRegion(characterData.server.region), characterData.name);
  }

  private async sendVerificationMail(user: User, region: SiteRegion, name: string): Promise<void> {
    const link = `${serverConfiguration.frontendRoot}/confirm-email/${user.verificationCode}`;
    await this.mailService.sendUserVerificationMail(region, user.email, name, link);
  }

  toSession(userInfo: UserInfo): SessionDto {
    return {
      id: userInfo.id,
      role: userInfo.role,
      characters: userInfo.characters,
    };
  }

  async getVerificationStatus(user: UserInfo, characterId: number): Promise<VerificationStatusDto> {
    const userData = await this.userRepo.findOne({
      where: {
        id: user.id,
      },
      select: [ 'email', 'verifiedAt' ],
    });

    if (!userData) {
      throw new BadRequestException(`User ${user.id} not found`);
    }

    const characterData = await this.characterRepo.findOne({
      where: {
        id: characterId,
      },
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
      const character = await characterRepo.findOneBy({
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

      const characterData = (await this.lodestoneService.getCharacter(
        character.lodestoneId,
      ))!.Bio;

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
      const userEntity = await userRepo.findOneBy({ id: user.id });

      if (!userEntity) {
        throw new GoneException();
      }

      await this.updatePostVerifyRole(em, userEntity);
    });
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
      const user = await repo.findOneBy({
        email: request.email,
      });

      if (!user) {
        // No such email in the database. Don't do anything, but don't reveal this to the client
        return null;
      }

      // Find the user's first character for the email
      const character = await em.getRepository(Character).findOne({
        where: {
          user: {
            id: user.id
          },
        },
        select: [ 'id', 'name', 'server' ] // id is needed because of a regression in TypeORM query generation
      });

      // Note that we intentionally don't check verifiedAt. If the user is unverified,
      // clicking the password reset link will silently double as email verification.
      user.verificationCode = generateVerificationCode();
      await repo.save(user);

      return {
        email: user.email,
        name: character ? character.name : user.email,
        region: character ? asSiteRegion(character.server.region) : SiteRegion.GLOBAL,
        verificationCode: user.verificationCode
      };
    });

    if (!result) {
      return;
    }

    const link = `${serverConfiguration.frontendRoot}/reset-password/${result.verificationCode}`;
    await this.mailService.sendPasswordResetMail(result.region, result.email, result.name, link);
  }

  async resetPassword(request: ResetPasswordRequestDto): Promise<void> {
    const verified = await this.connection.transaction(async (em) => {
      const repo = em.getRepository(User);
      const user = await repo.findOneBy({
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
      const user = (await userRepo.findOneBy({ id: userInfo.id }))!;

      if (!(await checkPassword(request.currentPassword, user.passwordHash))) {
        throw new BadRequestException('Invalid current password');
      }

      user.passwordHash = await hashPassword(request.newPassword);
      await userRepo.save(user);
    });
  }

  async getEmail(@CurrentUser() user: UserInfo): Promise<UserEmailInfoDto> {
    const userData = (await this.userRepo.findOne({
      where: {
        id: user.id
      },
      select: [ 'email' ],
    }))!;

    return {
      email: userData.email
    };
  }

  async changeEmail(request: ChangeEmailRequestDto, @CurrentUser() userInfo: UserInfo): Promise<void> {
    const { userEntity, region, characterName } = await this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = (await userRepo.findOneBy({ id: userInfo.id }))!;

      if (!(await checkPassword(request.currentPassword, user.passwordHash))) {
        throw new BadRequestException('Invalid current password');
      }

      if ((await userRepo.countBy({ email: request.newEmail })) > 0) {
        throw new ConflictException('This email is already in use by another user');
      }

      user.newEmail = request.newEmail;
      user.newEmailVerificationCode = generateVerificationCode();
      await userRepo.save(user);

      return {
        userEntity: user,
        region: asSiteRegion(userInfo.characters[0].region),
        characterName: userInfo.characters[0].name
      };
    });

    const link = `${serverConfiguration.frontendRoot}/confirm-new-email/${userEntity.newEmailVerificationCode}`;
    await this.mailService.sendNewEmailVerificationMail(region, request.newEmail, characterName, link);
  }

  async confirmNewEmail(newEmailVerificationCode: string): Promise<number> {
    return this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = await userRepo.findOneBy({
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

  async logoutEverywhere(userInfo: UserInfo): Promise<void> {
    // JWT iat has seconds granularity
    const startOfNextSecond = DateTime.now().startOf('second').plus({ seconds: 1});
    await utils.delayUntil(startOfNextSecond);

    await this.connection.transaction(async (em) => {
      const userRepo = em.getRepository(User);
      const user = (await userRepo.findOneBy({ id: userInfo.id }))!;

      user.tokensValidAfter = startOfNextSecond.toJSDate();

      await userRepo.save(user);
    });
  }
}
