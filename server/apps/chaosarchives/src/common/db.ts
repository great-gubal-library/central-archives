import { FindOperator, Like, QueryFailedError, SelectQueryBuilder } from "typeorm";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isQueryFailedError(err: any): err is QueryFailedError & { code: string } {
	return err instanceof QueryFailedError;
}

export function escapeForLike(substring: string): string {
	return substring.replace('\\', '\\\\').replace('%', '\\%').replace('_', '\\_');
}

export function Contains(substring: string): FindOperator<string> {
	const escapedString = escapeForLike(substring);
	return Like(`%${escapedString}%`);
}

export function andWhereExists<T>(mainQuery: SelectQueryBuilder<T>, subQuery: SelectQueryBuilder<any>): SelectQueryBuilder<T> {
	return mainQuery.andWhere(`EXISTS (${subQuery.getQuery()})`, subQuery.getParameters());
}
