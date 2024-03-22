import { User } from '@app/entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './authentication.service';
import { TwoFactorAuthenticationService } from './impl/two-factor-authentication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthenticationService,
    TwoFactorAuthenticationService,
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
