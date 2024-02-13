export interface MailConfigInterface {
	host: string,
	port?: number,
	username: string,
	password: string,
	secure: boolean,
	from: { [k: string] : string },
}
