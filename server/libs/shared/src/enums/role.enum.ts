export enum Role {
  UNVERIFIED = 'unverified',
  USER = 'user',
  TRUSTED = 'trusted',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export function roleImplies(actualRole: Role, impliedRole: Role): boolean {
  if (actualRole === Role.ADMIN) {
    return impliedRole !== Role.UNVERIFIED;
  }
  
  if (actualRole === Role.MODERATOR) {
    return impliedRole === Role.MODERATOR || impliedRole === Role.TRUSTED || impliedRole === Role.USER;
  }

  if (actualRole === Role.TRUSTED) {
    return impliedRole === Role.TRUSTED || impliedRole === Role.USER;
  }

  if (actualRole === Role.USER) {
    return impliedRole === Role.USER;
  }
  
  return impliedRole === Role.UNVERIFIED;
}
