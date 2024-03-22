import { Role, roleImplies } from '@app/shared/enums/role.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ROLES_KEY } from '../decorators/role-required.decorator';
import { UserInfo } from '../model/user-info';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector, private jwtGuard: JwtAuthGuard) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRole = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) {
			// No role restrictions
      return true;
    }

		if (!await this.jwtGuard.canActivate(context)) {
			// Unauthenticated
			return false;
		}

		const request = context.switchToHttp().getRequest();
		const user = (request.user?.user || null) as UserInfo|null; 
		return user !== null && roleImplies(user.role, requiredRole);
	}
}
