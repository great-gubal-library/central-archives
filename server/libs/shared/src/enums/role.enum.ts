export enum Role {
  UNVERIFIED = 'unverified',
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export function roleImplies(actualRole: Role, impliedRole: Role): boolean {
  if (actualRole === Role.ADMIN) {
    return impliedRole !== Role.UNVERIFIED;
  }
  
  if (actualRole === Role.MODERATOR) {
    return impliedRole === Role.MODERATOR || impliedRole === Role.USER;
  }

  if (actualRole === Role.USER) {
    return impliedRole === Role.USER;
  }
  
  return impliedRole === Role.UNVERIFIED;
}
