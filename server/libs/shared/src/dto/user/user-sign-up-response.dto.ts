import { SessionDto } from "./session.dto";

export interface UserSignUpResponseDto {
	characterVerificationCode: string;
	accessToken: string;
	session: SessionDto;
}
