import { Role } from '@app/shared/enums/role.enum';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'role';

export function RoleRequired(role: Role): CustomDecorator<string> {
	return SetMetadata(ROLES_KEY, role);
}
