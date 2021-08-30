import { serverConfiguration } from '@app/configuration';
import { User } from '@app/entity';
import { UserSignUpDto } from '@app/shared/dto/user/user-sign-up.dto';
import { Role } from '@app/shared/enums/role.enum';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { TransactionFor } from 'nest-transact';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { generateVerificationCode } from '../util/verification-code';

@Injectable()
export class UserService /* extends TransactionFor<UserService> */ {
  constructor(
    moduleRef: ModuleRef,
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
  ) {
    // super(moduleRef);
  }

  async signUp(signupData: UserSignUpDto): Promise<User> {
    return this.userRepo.save({
      email: signupData.email,
      passwordHash: await bcrypt.hash(signupData.password, 10),
      role: Role.USER,
      verificationCode: generateVerificationCode(),
    });
  }

  async sendVerificationMail(user: User): Promise<void> {
		const link = `${serverConfiguration.frontendRoot}/confirm-email/${user.verificationCode}`;
		await this.mailService.sendUserVerificationMail(user.email, link);
	}
}
