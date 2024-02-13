import { boot } from 'quasar/wrappers';
import {  SiteRegion } from '@app/shared/enums/region.enum';
import { RegionConfig } from '../../../server/libs/shared/region-config';
import SharedConstants from '@app/shared/SharedConstants';
import { getRegionByHostname } from '@app/shared/http';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $region: SiteRegion;
    $regionConfig: RegionConfig;
  }
}

function determineRegion(): SiteRegion {
  const region = getRegionByHostname(window.location.hostname);

  if (!SharedConstants.regions[region]) {
    throw new Error();
  }

  return region;
}

export default boot(({ app }) => {
  const region = determineRegion();
  app.config.globalProperties.$region = region;
  app.config.globalProperties.$regionConfig = SharedConstants.regions[region];
});
