export interface VerificationStatusDto {
	emailVerified: boolean;
	characterVerified: boolean;
	email: string;
	characterVerificationCode: string | null;
}
