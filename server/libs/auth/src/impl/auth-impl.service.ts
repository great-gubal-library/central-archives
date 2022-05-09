import { Character, User } from '@app/entity';
import { checkPassword } from '@app/security';
import { Role } from '@app/shared/enums/role.enum';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCharacterInfo } from '../model/user-character-info';
import { UserInfo } from '../model/user-info';

@Injectable()
export class AuthImplService {
  private readonly USER_INFO_CACHE_SEC = 86400;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
    @InjectRedis()
    private readonly redisService: Redis,
  ) {}

  async validateUser(username: string, password: string): Promise<UserInfo> {
    const user = await this.userRepo.findOne({ email: username });

    if (!user || !(await checkPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.getAndCacheUserInfo(user);
  }

  async getUserInfo(userId: number): Promise<UserInfo> {
    const cachedInfo = await this.redisService.get(`user_${userId}`);

    if (cachedInfo) {
      return JSON.parse(cachedInfo);
    }

    const user = await this.userRepo.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.getAndCacheUserInfo(user);
  }

  private async getAndCacheUserInfo(user: User): Promise<UserInfo> {
    const characters = await this.characterRepo.find({
      where: { user },
      relations: [ 'server' ],
    });

    if (characters.length === 0) {
      // Shouldn't happen
      throw new UnauthorizedException();
    }

    const result = new UserInfo({
      id: user.id,
      role: user.role as Role,
      characters: characters.map(character => new UserCharacterInfo({
        id: character.id,
        lodestoneId: character.lodestoneId,
        name: character.name,
        server: character.server.name,
        avatar: character.avatar,
        race: character.race,
        newsRole: character.newsRole,
        verified: character.verifiedAt !== null
      })),
    });

    void this.redisService.set(
      `user_${user.id}`,
      JSON.stringify(result),
      'ex',
      this.USER_INFO_CACHE_SEC,
    );
    return result;
  }

  async notifyUserChanged(userId: number): Promise<void> {
    try {
		  await this.redisService.del(`user_${userId}`);
    } catch (e) {
      // Do nothing
    }
	}
}
