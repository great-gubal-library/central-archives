import { SessionDto } from './session.dto';

export interface LoginResponseDto {
  accessToken: string;
  session: SessionDto;
}
