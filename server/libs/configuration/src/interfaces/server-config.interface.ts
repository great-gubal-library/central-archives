export interface ServerConfigInterface {
	port: number,
	frontendRoot: string,
	newsRoot: string,
	maxUploadSizeKiB: number,
	maxUploadSpacePerUserMiB: number,
	stewardWebhookPort: number,
	stewardWebhookUrl: string,
	apis: {
		rpp: boolean;
	}
}
