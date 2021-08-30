import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Body, Controller, Post } from '@nestjs/common';
import XIVAPI from '@xivapi/js';
import { Connection } from 'typeorm';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	private xiv: XIVAPI;

	constructor(private userService: UserService, private connection: Connection) {
		this.xiv = new XIVAPI();
	}

	@Post('signup')
	async signUp(@Body() signupData: UserSignUpDto): Promise<void> {
		const user = await this.connection.transaction(em => this.userService.withTransaction(em).signUp(signupData));
	}
}
