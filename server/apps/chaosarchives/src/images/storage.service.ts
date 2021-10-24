import { s3Configuration } from '@app/configuration';
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class StorageService {
	private readonly s3: S3;

	private readonly bucketName: string;

	private readonly publicRootUrl: string;

	constructor() {
		this.s3 = new S3({
			endpoint: s3Configuration.endpoint,
			credentials: {
				accessKeyId: s3Configuration.accessKeyId,
				secretAccessKey: s3Configuration.secretAccessKey,
			}
		});

		this.bucketName = s3Configuration.bucketName;

		const publicRoot = s3Configuration.publicRootUrl;
		this.publicRootUrl = publicRoot.endsWith('/') ? publicRoot : `${publicRoot}/`;
	}

	getUrl(path: string): string {
		return `${this.publicRootUrl}${this.normalizePath(path)}`;
	}

	async uploadFile(path: string, buffer: Buffer, mimetype: string): Promise<void> {
		await this.s3.upload({
			Bucket: this.bucketName,
			ACL: 'public-read',
			ContentType: mimetype,
			ContentDisposition: 'inline',
			CacheControl: 'max-age=31536000', // cache for one year
			Body: buffer,
			Key: this.normalizePath(path),
		}).promise();
	}

	async deleteFile(path: string): Promise<void> {
		console.log('deleting ', path);
		await this.s3.deleteObject({
			Bucket: this.bucketName,
			Key: this.normalizePath(path),
		}).promise();
	}

	private normalizePath(path: string): string {
		return path.startsWith('/') ? path.substring(1) : path;
	}
}
