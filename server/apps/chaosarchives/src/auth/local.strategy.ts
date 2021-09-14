import { UserLogInDto } from '@app/shared/dto/user/user-log-in.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { UserInfo } from './user-info';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<UserInfo> {
    const dto = new UserLogInDto({ email, password });
    // We can't use the validation pipe, so we reimplement the class validation logic here manually.
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}))
        .reduce((array1, array2) => array1.concat(array2));
      throw new UnauthorizedException(errorMessages);
    }

    return this.authService.validateUser(dto.email, dto.password);
  }
}
