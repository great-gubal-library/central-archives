import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPE_KEY } from '../decorators/scope.decorator';
import { AuthInfo } from '../model/auth-info';
import { AuthScope } from '../../../shared/src/enums/oauth/auth-scope.enum';

export class JwtAuthGuardImpl {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check scope, if present
    const requiredScope =
      this.reflector.getAllAndOverride<AuthScope>(SCOPE_KEY, [context.getHandler(), context.getClass()]) || null;

    const actualScope = (context.switchToHttp().getRequest().user as AuthInfo | undefined)?.scope || null;

    // Unscoped tokens have full access
    if (!actualScope) {
      return true;
    }

    return actualScope === requiredScope;
  }
}
