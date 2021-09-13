import { authConfiguration } from '@app/configuration';
import { Character, User } from '@app/entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { PublicAuthService } from './public-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Character]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: authConfiguration.jwtSecret,
        signOptions: {
          expiresIn: authConfiguration.jwtExpiry,
        }
      }),
    }),
  ],
  providers: [AuthService, PublicAuthService, LocalStrategy, JwtStrategy],
  exports: [PublicAuthService]
})
export class AuthModule {}
