import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserInfo } from './user-info';

@Injectable()
export class PublicAuthService {
  constructor(
    private jwtService: JwtService,
		private authService: AuthService,
  ) {}

	createAccessToken(userId: number): string {
		return this.jwtService.sign({
			sub: userId
		});
	}

	getUserInfo(userId: number): Promise<UserInfo> {
		return this.authService.getUserInfo(userId);
	}
}
