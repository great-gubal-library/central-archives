import { FindOperator, Like, ObjectLiteral, QueryFailedError, SelectQueryBuilder } from 'typeorm';

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

export function andWhereExists<T extends ObjectLiteral>(
  mainQuery: SelectQueryBuilder<T>,
  subQuery: SelectQueryBuilder<any>,
): SelectQueryBuilder<T> {
  return mainQuery.andWhere(`EXISTS (${subQuery.getQuery()})`, subQuery.getParameters());
}

export function andWhereMatches<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  properties: string[],
  keywords: string[],
): SelectQueryBuilder<T> {
  const expandedProperties = properties.map((property) => `${alias}.${property}`).join(', ');
  const matchQuery = keywords.map((keyword) => `+${keyword}`).join(' ');

  return qb.andWhere(`MATCH (${expandedProperties}) AGAINST (:_matchQuery IN BOOLEAN MODE)`, {
    _matchQuery: matchQuery,
  });
}
