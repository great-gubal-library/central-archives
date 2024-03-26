import SharedConstants from "./shared-constants";
import { SiteRegion } from "./enums/region.enum";

export function getRegionByHostname(hostname: string): SiteRegion {
  for (const region of Object.values(SiteRegion)) {
    const regionConfig = SharedConstants.regions[region];

    if (regionConfig && hostname.endsWith(regionConfig.domain)) {
      return region;
    }
  }

  return SiteRegion.GLOBAL;
}
