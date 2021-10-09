import { s3Configuration } from '@app/configuration';
import { S3ConfigInterface } from '@app/configuration/interfaces/s3-config.interface';
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
		this.publicRootUrl = publicRoot.endsWith('/') ? publicRoot.slice(0, -1) : publicRoot;
	}

	async uploadFile(path: string, buffer: Buffer): Promise<string> {
		const key = path.startsWith('/') ? path.substring(1) : path;

		await this.s3.upload({
			Bucket: this.bucketName,
			ACL: 'public-read',
			ContentDisposition: 'inline',
			Body: buffer,
			Key: key,
		}).promise();

		return `${this.publicRootUrl}/${key}`;
	}

	async deleteFile(path: string): Promise<void> {
		await this.s3.deleteObject({
			Bucket: this.bucketName,
			Key: path,
		}).promise();
	}
}
