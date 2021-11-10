import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthImplService } from './impl/auth-impl.service';
import { UserInfo } from './model/user-info';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
		private authService: AuthImplService,
  ) {}

	createAccessToken(userId: number): string {
		return this.jwtService.sign({
			sub: userId
		});
	}

	getUserInfo(userId: number): Promise<UserInfo> {
		return this.authService.getUserInfo(userId);
	}

	async notifyUserChanged(userId: number): Promise<void> {
		await this.authService.notifyUserChanged(userId);
	}
}
