export interface ServerConfigInterface {
	port: number,
	frontendRoot: string,
	maxUploadSizeKiB: number,
	maxUploadSpacePerUserMiB: number,
	stewardWebhookPort: number,
	stewardWebhookUrl: string,
}
