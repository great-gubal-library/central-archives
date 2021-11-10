import { Role } from '@app/shared/enums/role.enum';
import { UserCharacterInfo } from './user-character-info';

export class UserInfo {
  readonly id: number;

  readonly role: Role;

  readonly characters: UserCharacterInfo[];

  constructor(properties: Readonly<UserInfo>) {
    if (properties) {
      Object.assign(this, properties);
    }
  }
}
