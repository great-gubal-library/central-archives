import { boot } from 'quasar/wrappers';
import {  SiteRegion } from '@app/shared/enums/region.enum';
import { RegionConfig } from '../../../server/libs/shared/region-config';
import SharedConstants from '@app/shared/SharedConstants';
import { getRegionByHostname } from '@app/shared/http';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $region: SiteRegion;
    $regionConfig: RegionConfig;
    $siteName: string;
  }
}

function determineRegion(): SiteRegion {
  const region = getRegionByHostname(window.location.hostname);

  if (!SharedConstants.regions[region]) {
    throw new Error();
  }

  return region;
}

let region = SiteRegion.GLOBAL;
let regionConfig = SharedConstants.regions[region];

export function useRegion() {
  return region;
}

export function useRegionConfig() {
  return regionConfig;
}

export function useSiteName() {
  return regionConfig.name;
}

export default boot(({ app }) => {
  region = determineRegion();
  regionConfig = SharedConstants.regions[region];
  app.config.globalProperties.$region = region;
  app.config.globalProperties.$regionConfig = regionConfig;
  app.config.globalProperties.$siteName = regionConfig.name;
  document.title = regionConfig.name;
  document.querySelectorAll('meta[name=description]').forEach(meta => meta.setAttribute('content', regionConfig.shortDescription));
  document.body.classList.add(`region-${region}`);
});
