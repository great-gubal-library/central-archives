export enum Region {
  EU = 'eu',
  NA = 'na',
  JP = 'jp',
  OC = 'oc',
}

export enum SiteRegion {
  EU = 'eu',
  NA = 'na',
  GLOBAL = 'global',
}

export function asSiteRegion(region: Region): SiteRegion {
  if (Object.values(SiteRegion).includes(region as string as SiteRegion)) {
    return region as string as SiteRegion;
  }

  return SiteRegion.GLOBAL;
}

export function asRegionOrThrow(siteRegion: SiteRegion) {
  if (siteRegion !== SiteRegion.GLOBAL) {
    return siteRegion as string as Region;
  }

  throw new Error('Invalid region');
}
