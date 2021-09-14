export interface VerificationStatusDto {
	emailVerified: boolean;
	characterVerified: boolean;
	characterVerificationCode: string | null;
}
