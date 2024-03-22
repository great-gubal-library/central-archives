import { AuthScope } from "./auth-scope.enum";

export interface JwtPayload {
  sub: number;
  iat: number;
  scope?: AuthScope;
}
