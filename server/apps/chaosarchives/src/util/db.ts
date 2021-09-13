import { QueryFailedError } from "typeorm";

const db = {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	isQueryFailedError(err: any): err is QueryFailedError & { code: string } {
		return err instanceof QueryFailedError;
	}
}

export default db;
