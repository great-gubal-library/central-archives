export enum Region {
  EU = 'eu',
  NA = 'na',
  JP = 'jp',
  OC = 'oc',
}

export enum SiteRegion {
  EU = 'eu',
  NA = 'na',
  JP = 'jp',
  OC = 'oc',
  GLOBAL = 'global',
}

export function asSiteRegion(region: Region): SiteRegion {
  return region as string as SiteRegion;
}
