import { User } from '@app/entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

	async validateUser(username: string, password: string): Promise<User> {
		const user = await this.userRepo.findOne({ email: username });

		if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      throw new UnauthorizedException();
    }

		return user;
	}
}
