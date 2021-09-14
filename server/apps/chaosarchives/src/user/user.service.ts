import { serverConfiguration } from '@app/configuration';
import { Character, Server, User } from '@app/entity';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerificationStatusDto } from '@app/shared/dto/user/verification-status.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import { getRaceById } from '@app/shared/enums/race.enum';
import { Role } from '@app/shared/enums/role.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { BadRequestException, ConflictException, GoneException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import XIVAPI, { CharacterInfo } from '@xivapi/js';
import { Connection, Repository } from 'typeorm';
import { UserInfo } from '../auth/user-info';
import db from '../common/db';
import { generateVerificationCode, hashPassword } from '../common/security';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private connection: Connection,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Character) private characterRepo: Repository<Character>,
    private mailService: MailService,
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

          const characterInfo = await this.getLodestoneCharacter(
            signupData.lodestoneId,
          );

          if (!characterInfo) {
            throw new BadRequestException('Invalid character');
          }

          if (characterInfo.Character.DC !== SharedConstants.DATACENTER) {
            throw new BadRequestException('This character is from the wrong datacenter');
          }

          const server = await em.getRepository(Server).findOne({
            name: characterInfo.Character.Server,
          });

          if (!server) {
            throw new BadRequestException('Invalid server');
          }

          const race = getRaceById(characterInfo.Character.Race);

          if (!race) {
            throw new BadRequestException('Invalid race');
          }

          const character = await em.getRepository(Character).save({
            lodestoneId: characterInfo.Character.ID,
            name: characterInfo.Character.Name,
            race,
            server,
            user,
            avatar: characterInfo.Character.Avatar,
            verificationCode: generateVerificationCode(),
          });

          return { userEntity: user, characterEntity: character };
        },
      );

      this.sendVerificationMail(userEntity, characterEntity.name); // no await
      return {
        userId: userEntity.id,
        characterVerificationCode: characterEntity.verificationCode,
      };
    } catch (e) {
      if (db.isQueryFailedError(e)) {
        if (e.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('This email or character has already been used');
        }
      }

      // default
      throw e;
    }
  }

  private async getLodestoneCharacter(
    lodestoneId: number,
  ): Promise<CharacterInfo | null> {
    try {
      const xivapi = new XIVAPI();
      return await xivapi.character.get(lodestoneId);
    } catch (e) {
      // eslint-disable-next-line prefer-destructuring
      const statusCode: number|undefined = (e as any).statusCode;
      
      if (statusCode === HttpStatus.NOT_FOUND) {
        // Character not found on Lodestone
        return null;
      } 

      throw new ServiceUnavailableException('Unable to check character on Lodestone');
    }
  }

  private async sendVerificationMail(user: User, name: string): Promise<void> {
    const link = `${serverConfiguration.frontendRoot}/confirm-email/${user.verificationCode}`;
    await this.mailService.sendUserVerificationMail(user.email, name, link);
  }

  async confirmEmail(verificationCode: string): Promise<void> {
    const user = await this.userRepo.findOne({
      verificationCode,
    });

    if (!user) {
      throw new NotFoundException('Invalid verification code');
    }

    user.verificationCode = null;
    user.verifiedAt = new Date();
    await this.userRepo.save(user);
  }

  toSession(userInfo: UserInfo): SessionDto {
    return userInfo;
  }

  async getVerificationStatus(user: UserInfo): Promise<VerificationStatusDto> {
    const userData = await this.userRepo.findOne(user.id, {
      select: [ 'id', 'verifiedAt' ],
    });

    if (!userData) {
      throw new BadRequestException();
    }

    const characterData = await this.characterRepo.findOne(user.character.id, {
      select: [ 'verificationCode', 'verifiedAt' ],
    });

    if (!characterData) {
      throw new BadRequestException();
    }

    return {
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
        lodestoneId: verifyData.lodestoneId,
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

      const characterData = await this.getLodestoneCharacter(
        verifyData.lodestoneId,
      );

      if (!characterData) {
        throw new GoneException('Character deleted');
      }

      if (!characterData.Character.Bio.includes(character.verificationCode)) {
        throw new NotFoundException('Verification string not found in character profile');
      }

      // Passed all checks - character verified!
      character.verificationCode = null;
      character.verifiedAt = new Date();
      await characterRepo.save(character);
    });
  }
}
