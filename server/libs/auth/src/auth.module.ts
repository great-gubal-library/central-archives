import { authConfiguration } from '@app/configuration';
import { Character, User } from '@app/entity';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthImplService } from './impl/auth-impl.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/role.guard';
import { TwoFactorAuthService } from './impl/two-factor-auth.service';
import { JwtFormStrategy } from './strategies/jwt-form.strategy';
import { JwtFormAuthGuard } from './guards/jwt-form-auth.guard';
import { JwtStrategyImpl } from './strategies/jwt-strategy.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Character]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: authConfiguration.jwtSecret,
        signOptions: {
          expiresIn: authConfiguration.jwtExpiry,
        },
      }),
    }),
  ],
  providers: [
    AuthImplService,
    TwoFactorAuthService,
    AuthService,
    JwtStrategyImpl,
    JwtStrategy,
    JwtFormStrategy,
    JwtAuthGuard,
    JwtFormAuthGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard, JwtFormAuthGuard],
})
export class AuthModule {}
