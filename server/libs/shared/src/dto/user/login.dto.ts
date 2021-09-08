import { SessionDto } from './session.dto';

export interface LoginDto {
  accessToken: string;
  session: SessionDto;
}
