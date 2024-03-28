import { authConfiguration } from "@app/configuration";
import { EncryptJWT, JWTPayload, decodeProtectedHeader, jwtDecrypt, jwtVerify } from "jose";
import { range } from "lodash";

const JWE_SECRET = Uint8Array.from(range(0, Object.keys(authConfiguration.jweSecret).length)
  .map(i => authConfiguration.jweSecret[i]));

const jwe = {
  async encrypt(payload: JWTPayload, options: { expiresIn: string }): Promise<string> {
    return new EncryptJWT(payload)
      .setIssuedAt()
      .setExpirationTime(options.expiresIn)
      .setProtectedHeader({
        alg: 'dir',
        enc: 'A128CBC-HS256',
      })
      .encrypt(JWE_SECRET);
  },

  async verify(token: string): Promise<JWTPayload> {
    const header = decodeProtectedHeader(token);

    if (header.alg === 'HS256') {
      // Legacy signed JWT (JWS)
      return (await jwtVerify(token, Buffer.from(authConfiguration.jwtSecret, 'utf-8'))).payload;
    }

    // Encrypted JWT (JWE)
    return (await jwtDecrypt(token, JWE_SECRET)).payload;
  },
}

export default jwe;
