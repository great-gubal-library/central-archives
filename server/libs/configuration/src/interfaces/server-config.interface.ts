export interface ServerConfigInterface {
	port: number,
	frontendRoot: { [ k: string]: string },
	newsRoot: string,
	maxUploadSizeKiB: number,
	maxUploadSpacePerUserMiB: number,
	stewardWebhookPort: number,
	stewardWebhookUrl: string,
	apis: {
		rpp: boolean;
	}
}
