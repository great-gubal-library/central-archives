import { Character, User } from '@app/entity';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationService } from './authorization.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtFormAuthGuard } from './guards/jwt-form-auth.guard';
import { RolesGuard } from './guards/role.guard';
import { AuthorizationImplService } from './impl/authorization-impl.service';
import { JweService } from './impl/jwe.service';
import { JwtFormStrategy } from './strategies/jwt-form.strategy';
import { JwtStrategyImpl } from './strategies/jwt-strategy.impl';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Character]),
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
