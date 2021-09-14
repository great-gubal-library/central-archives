import crypto from 'crypto';
import { base32 } from 'rfc4648';

export function generateVerificationCode(): string {
	return base32.stringify(crypto.randomBytes(20)).toLowerCase();
}
