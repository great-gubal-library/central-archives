export class UserSignUpDto {
	email: string;

	password: string;

	confirmPassword: string;

	characterName: string;

	server: string;

	constructor(properties?: Readonly<UserSignUpDto>) {
		if (properties) {
			Object.assign(this, properties);
		}
	}
}
