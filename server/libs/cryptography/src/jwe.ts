import { authConfiguration } from "@app/configuration";
import { EncryptJWT, JWTPayload, decodeProtectedHeader, jwtDecrypt, jwtVerify } from "jose";


const jwe = {
  async encrypt(payload: JWTPayload, options: { expiresIn: string }): Promise<string> {
    return new EncryptJWT(payload)
      .setIssuedAt()
      .setExpirationTime(options.expiresIn)
      .setProtectedHeader({
        alg: 'dir',
        enc: 'A128GCM',
      })
      .encrypt(Buffer.from(authConfiguration.jwtSecret, 'utf-8'));
  },

  async verify(token: string): Promise<JWTPayload> {
    const header = decodeProtectedHeader(token);
    const secret = Buffer.from(authConfiguration.jwtSecret, 'utf-8');

    if (header.alg === 'HS256') {
      // Legacy signed JWT (JWS)
      return (await jwtVerify(token, secret)).payload;
    }

    // Encrypted JWT (JWE)
    return (await jwtDecrypt(token, secret)).payload;
  },
}

export default jwe;
