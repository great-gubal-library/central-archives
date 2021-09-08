import { User } from '@app/entity';
import { Role } from '@app/shared/enums/role.enum';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserInfo } from './user-info';

@Injectable()
export class AuthService {
  private readonly USER_INFO_CACHE_SEC = 86400;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    @InjectRedis()
    private readonly redisService: Redis,
  ) {}

  async validateUser(username: string, password: string): Promise<UserInfo> {
    const user = await this.userRepo.findOne({ email: username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException();
    }

    return this.getAndCacheUserInfo(user);
  }

  createAccessToken(userId: number): string {
    return this.jwtService.sign({
      sub: userId,
    });
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
    const result = new UserInfo({
      id: user.id,
      role: user.role as Role,
    });

    this.redisService.set(
      `user_${user.id}`,
      JSON.stringify(result),
      'ex',
      this.USER_INFO_CACHE_SEC,
    );
    return result;
  }
}
