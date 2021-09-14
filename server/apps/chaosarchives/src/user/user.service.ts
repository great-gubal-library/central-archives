import { serverConfiguration } from '@app/configuration';
import { Character, Server, User } from '@app/entity';
import { SessionDto } from '@app/shared/dto/user/session.dto';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { VerifyCharacterDto } from '@app/shared/dto/user/verify-character.dto';
import { getRaceById } from '@app/shared/enums/race.enum';
import { Role } from '@app/shared/enums/role.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import XIVAPI, { CharacterInfo } from '@xivapi/js';
import bcrypt from 'bcrypt';
import { Connection, Repository } from 'typeorm';
import { UserInfo } from '../auth/user-info';
import { MailService } from '../mail/mail.service';
import db from '../common/db';
import { generateVerificationCode } from '../common/verification-code';

@Injectable()
export class UserService {
  constructor(
    private connection: Connection,
    @InjectRepository(User) private userRepo: Repository<User>,
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
            passwordHash: await bcrypt.hash(signupData.password, 10),
            role: Role.UNVERIFIED,
            verificationCode: generateVerificationCode(),
          });

          const characterInfo = await this.getLodestoneCharacter(
            signupData.lodestoneId,
          );

          if (!characterInfo) {
            throw new HttpException(
              'Invalid character',
              HttpStatus.BAD_REQUEST,
            );
          }

          if (characterInfo.Character.DC !== SharedConstants.DATACENTER) {
            throw new HttpException(
              'This character is from the wrong datacenter',
              HttpStatus.BAD_REQUEST,
            );
          }

          const server = await em.getRepository(Server).findOne({
            name: characterInfo.Character.Server,
          });

          if (!server) {
            throw new HttpException('Invalid server', HttpStatus.BAD_REQUEST);
          }

          const race = getRaceById(characterInfo.Character.Race);

          if (!race) {
            throw new HttpException('Invalid race', HttpStatus.BAD_REQUEST);
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
          throw new HttpException(
            'This email or character has already been used',
            HttpStatus.CONFLICT,
          );
        }
      }

      // default
      throw e;
    }
  }

  private async getLodestoneCharacter(
    lodestoneId: number,
  ): Promise<CharacterInfo | null> {
    const xivapi = new XIVAPI();
    return xivapi.character.get(lodestoneId);
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
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.NOT_FOUND,
      );
    }

    user.verificationCode = null;
    user.verifiedAt = new Date();
    await this.userRepo.save(user);
  }

  toSession(userInfo: UserInfo): SessionDto {
    return userInfo;
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
        throw new HttpException(
          'No such character belongs to you',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!character.verificationCode) {
        throw new HttpException('Already verified', HttpStatus.BAD_REQUEST);
      }

      const characterData = await this.getLodestoneCharacter(
        verifyData.lodestoneId,
      );

      if (!characterData) {
        throw new HttpException('Character deleted', HttpStatus.GONE);
      }

      if (!characterData.Character.Bio.includes(character.verificationCode)) {
        throw new HttpException(
          'Verification string not found in character profile',
          HttpStatus.NOT_FOUND,
        );
      }

      // Passed all checks - character verified!
      character.verificationCode = null;
      character.verifiedAt = new Date();
      await characterRepo.save(character);
    });
  }
}
