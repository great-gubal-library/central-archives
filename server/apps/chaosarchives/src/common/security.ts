import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createReadStream, PathLike } from 'fs';
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

export async function hashFile(path: string | Buffer): Promise<string> {
	const hash = crypto.createHash('sha3-224');

	if (path instanceof Buffer) {
		hash.update(path);
		return hash.digest('hex');
	}

	const input = createReadStream(path);

	return new Promise((resolve, reject) => {
		input.on('readable', () => {
			try {
				const data = input.read();

				if (data) {
					hash.update(data);
				} else {
					resolve(hash.digest('hex'));
				}
			} catch (e) {
				reject(e);
			}
		});
	});
}
