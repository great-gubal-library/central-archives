import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuardImpl } from './jwt-auth-guard.impl';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly impl: JwtAuthGuardImpl;

	constructor(private reflector: Reflector) {
		super();
    this.impl = new JwtAuthGuardImpl(reflector);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return (await super.canActivate(context)) && this.impl.canActivate(context);
	}
}
