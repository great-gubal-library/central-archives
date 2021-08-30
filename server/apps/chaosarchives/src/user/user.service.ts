import { User } from '@app/entity';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionFor } from 'nest-transact';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Role } from '@app/shared/enums/role.enum';
import { generateVerificationCode } from '../util/verification-code';

@Injectable()
export class UserService extends TransactionFor<UserService> {
	constructor(moduleRef: ModuleRef, @InjectRepository(User) private userRepo: Repository<User>) {
		super(moduleRef);
	}

	async signUp(signupData: UserSignUpDto): Promise<User> {
		return this.userRepo.save({
			email: signupData.email,
			passwordHash: await bcrypt.hash(signupData.password, 10),
			role: Role.USER,
			verificationCode: generateVerificationCode()
		});
	}
}
