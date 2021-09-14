import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { base32 } from 'rfc4648';

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function checkPassword(password: string, storedHash: string): Promise<boolean> {
	return bcrypt.compare(password, storedHash);
}

export function generateVerificationCode(): string {
	return base32.stringify(crypto.randomBytes(20)).toLowerCase();
}
