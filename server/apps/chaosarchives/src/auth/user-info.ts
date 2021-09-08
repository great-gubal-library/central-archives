import { Role } from "@app/shared/enums/role.enum";

export class UserInfo {
	readonly id: number;

	readonly role: Role;

	constructor(properties: Readonly<UserInfo>) {
		if (properties) {
			Object.assign(this, properties);
		}
	}
}
