import SharedConstants from '@app/shared/shared-constants';
import { SiteRegion } from '@app/shared/enums/region.enum';

// TODO: Hardcoded for now
const isLocal = window.location.protocol === 'http:' && window.location.port === '8081';
const euDomain = SharedConstants.regions[SiteRegion.EU].domain;
const globalDomain = SharedConstants.regions[SiteRegion.GLOBAL].domain;

export const CHAOS_ARCHIVES_ROOT = isLocal ? `http://${euDomain}:8080` : `https://${euDomain}`;
export const CENTRAL_ARCHIVES_ROOT = isLocal ? `http://${globalDomain}:8080` : `https://${globalDomain}`;
