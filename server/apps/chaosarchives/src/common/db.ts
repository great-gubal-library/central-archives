import { FindOperator, Like, QueryFailedError } from "typeorm";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isQueryFailedError(err: any): err is QueryFailedError & { code: string } {
	return err instanceof QueryFailedError;
}

export function Contains(substring: string): FindOperator<string> {
	const escapedString = substring.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
	return Like(`%${escapedString}%`);
}
