import jwe from "@app/cryptography/jwe";
import { Injectable } from "@nestjs/common";
import { Strategy } from "passport-jwt";

type Claims = { [ k: string ] : any };
type VerifyCallback = (err: any, payload: Claims) => unknown;

// Monkey-patch passport-jwt
(Strategy as any).JwtVerifier = async (token: string, _: string, __: object, callback: VerifyCallback) => {
  try {
    callback(null, await jwe.verify(token));
  } catch (e) {
    callback(e, {});
  }
};

@Injectable()
export class JweService {
  async encrypt(claims: Claims, options: { expiresIn: string }): Promise<string> {
    return jwe.encrypt(claims, options);
  }

  async verify(token: string): Promise<Claims> {
    return jwe.verify(token);
  }
}
