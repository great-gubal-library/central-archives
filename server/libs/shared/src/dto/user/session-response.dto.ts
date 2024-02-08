import { SessionDto } from "./session.dto";

export interface SessionResponseDto {
	session: SessionDto;
	newAccessToken: string | null;
}
