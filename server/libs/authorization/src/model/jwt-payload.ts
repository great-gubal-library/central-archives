import { AuthScope } from "../../../shared/src/enums/oauth/auth-scope.enum";

export interface JwtPayload {
  sub: number;
  iat: number;
  scope?: AuthScope;
}
