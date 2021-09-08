import { User } from '@app/entity';
import { Role } from '@app/shared/enums/role.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserInfo } from './user-info';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
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
			sub: userId
		});
	}

	async getUserInfo(userId: number): Promise<UserInfo> {
		const user = await this.userRepo.findOne(userId);

		if (!user) {
			throw new UnauthorizedException();
		}

		return this.getAndCacheUserInfo(user);
	}

	private async getAndCacheUserInfo(user: User): Promise<UserInfo> {
		return new UserInfo({
			id: user.id,
			role: user.role as Role
		});
	}
}
