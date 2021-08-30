export class UserConfirmEmailDto {
	code: string;

	constructor(properties?: Readonly<UserConfirmEmailDto>) {
		if (properties) {
			Object.assign(this, properties);
		}
	}
}
