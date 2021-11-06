import { Role } from '../../enums/role.enum';
import { SessionCharacterDto } from './session-character.dto';

export interface SessionDto {
  id: number;
  role: Role;
  character: SessionCharacterDto;
}
