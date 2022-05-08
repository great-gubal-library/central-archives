import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { AuthScope } from '../model/auth-scope.enum';

export const SCOPE_KEY = 'authScope';

export function Scope(scope: AuthScope): CustomDecorator<string> {
	return SetMetadata(SCOPE_KEY, scope);
}
