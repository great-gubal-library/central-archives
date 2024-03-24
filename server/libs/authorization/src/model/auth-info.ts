import { AuthScope } from '../../../shared/src/enums/oauth/auth-scope.enum';
import { UserInfo } from './user-info';

export interface AuthInfo {
  user: UserInfo;
  scope: AuthScope | null;
}
