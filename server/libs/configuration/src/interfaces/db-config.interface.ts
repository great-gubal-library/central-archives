export interface DbConfigInterface {
	type: string,
	host: string,
	port: number,
	username: string,
	password: string,
	database: string,
	synchronize: boolean,
}
