import { Role } from "@app/shared/enums/role.enum";

export class UserInfo {
	readonly id: number;

	readonly role: Role;

	readonly character: {
		id: number;
		lodestoneId: number;
		name: string;
		server: string;
		avatar: string;
	};

	constructor(properties: Readonly<UserInfo>) {
		if (properties) {
			Object.assign(this, properties);
		}
	}
}
