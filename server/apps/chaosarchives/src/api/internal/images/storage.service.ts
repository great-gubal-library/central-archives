import { s3Configuration } from '@app/configuration';
import { Injectable, Logger } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name);

	private readonly s3: S3;

	private readonly bucketName: string;

	private readonly publicRootUrl: string;

	constructor() {
		this.s3 = new S3({
			endpoint: s3Configuration.endpoint,
			region: s3Configuration.region || 'us-east-1', // Workaround: https://github.com/aws/aws-sdk-js-v3/issues/1845
			credentials: {
				accessKeyId: s3Configuration.accessKeyId,
				secretAccessKey: s3Configuration.secretAccessKey,
			},
			forcePathStyle: s3Configuration.endpoint.startsWith('http://localhost'),
		});

		this.bucketName = s3Configuration.bucketName;

		const publicRoot = s3Configuration.publicRootUrl;
		this.publicRootUrl = publicRoot.endsWith('/') ? publicRoot : `${publicRoot}/`;
	}

	getUrl(path: string): string {
		return `${this.publicRootUrl}${this.normalizePath(path)}`;
	}

	async uploadFile(path: string, buffer: Buffer, mimetype: string): Promise<void> {
		try {
			await this.s3.putObject({
				Bucket: this.bucketName,
				ACL: 'public-read',
				ContentType: mimetype,
				ContentDisposition: 'inline',
				CacheControl: 'max-age=31536000', // cache for one year
				Body: buffer,
				Key: this.normalizePath(path),
			});
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message, e.stack);
			} else {
				this.logger.error(e);
			}

      throw e;
		}
	}

	async deleteFile(path: string): Promise<void> {
		try {
			await this.s3.deleteObject({
				Bucket: this.bucketName,
				Key: this.normalizePath(path),
			});
		} catch (e) {
			if (e instanceof Error) {
				this.logger.error(e.message, e.stack);
			} else {
				this.logger.error(e);
			}

      throw e;
		}
	}

	private normalizePath(path: string): string {
		return path.startsWith('/') ? path.substring(1) : path;
	}
}
