import { authConfiguration } from '@app/configuration';
import { Character, User } from '@app/entity';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationImplService as AuthorizationImplService } from './impl/authorization-impl.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthorizationService } from './authorization.service';
import { RolesGuard } from './guards/role.guard';
import { JwtFormStrategy } from './strategies/jwt-form.strategy';
import { JwtFormAuthGuard } from './guards/jwt-form-auth.guard';
import { JwtStrategyImpl } from './strategies/jwt-strategy.impl';
import { JweService } from './impl/jwe.service';

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
    AuthorizationImplService,
    AuthorizationService,
    JwtStrategyImpl,
    JwtStrategy,
    JwtFormStrategy,
    JwtAuthGuard,
    JwtFormAuthGuard,
    JweService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthorizationService, JwtAuthGuard, JwtFormAuthGuard],
})
export class AuthorizationModule {}
