export interface AuthConfigInterface {
	jwtSecret: string,
  jweSecret: Uint8Array,
	jwtExpiry: string,
	scopedJwtExpiry: string,
}
