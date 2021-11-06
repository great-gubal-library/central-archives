export class UserCharacterInfo {
	readonly id: number;
	
	readonly lodestoneId: number;

	readonly name: string;

	readonly server: string;

	readonly avatar: string;

	readonly verified: boolean;

	constructor(properties: Readonly<UserCharacterInfo>) {
		if (properties) {
			Object.assign(this, properties);
		}
	}
}
