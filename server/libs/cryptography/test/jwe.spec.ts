import jwe from "@app/cryptography/jwe";
import { AuthScope } from "@app/shared/enums/oauth/auth-scope.enum";
import { JWTPayload } from "jose";

it('should roundtrip encrypted JWT', async () => {
  const payload = {
    sub: 1,
    scope: AuthScope.RPP
  };

  const jwt = await jwe.encrypt(payload as unknown as JWTPayload, { expiresIn: '2h' });
  console.log('Encrypted JWT', jwt);

  const decodedJwt = await jwe.verify(jwt);

  expect(decodedJwt.sub).toEqual(payload.sub);
  expect(decodedJwt.scope).toEqual(payload.scope);
});

it('should decode legacy signed JWT', async () => {
  const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInNjb3BlIjoicnBwIiwiaWF0IjoxNzExNjMyNTYzLCJleHAiOjE3NDMxNjg1NjN9.2hZ8hsexhBwVI_IuEL-loHX6shjGk9lOHrkNms1SIBw';
  const decodedJwt = await jwe.verify(jwt);

  expect(decodedJwt.sub).toEqual(1);
  expect(decodedJwt.scope).toEqual(AuthScope.RPP);
});
