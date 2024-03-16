import { RegionConfig } from "../region-config";
import { SiteRegion } from "./enums/region.enum";

export default Object.freeze({
	FFXIV_SERVER_TIMEZONE: 'UTC',
	PASSWORD_MIN_LENGTH: 8,
	MAX_UPLOAD_SIZE: 4 * 1024 * 1024,
	MIN_BANNER_ASPECT_RATIO: 4 / 1,
	DEFAULT_ROWS_PER_PAGE: 20,
	MAX_NEWS_ENTRIES: 3,
	MIN_VIOLATION_REPORT_LENGTH: 10,
	MAX_PRONOUNS_LENGTH: 20,

  OTP_LENGTH: 6,
  OTP_REGEX: /^[0-9]{6}$/,
  CLIENT_BACKUP_CODE_REGEX: /^[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}$/,

  regions: Object.freeze(<{ [k: string]: RegionConfig }>{
    [SiteRegion.EU]: Object.freeze({
      name: 'Chaos Archives',
      description: 'Chaos Archives, the FFXIV roleplay portal to Chaos EU',
      shortDescription: 'FFXIV roleplay portal to Chaos EU',
      domain: 'chaosarchives.org',
      newsDomain: 'theharborwatch.org',
      newsName: 'The Harborwatch',
    }),
    [SiteRegion.NA]: Object.freeze({
      name: 'Crystal Archives',
      description: 'Crystal Archives, the FFXIV roleplay portal to Crystal NA',
      shortDescription: 'FFXIV roleplay portal to Crystal NA',
      domain: 'crystalarchives.org',
    }),
    [SiteRegion.GLOBAL]: Object.freeze({
      name: 'Central Archives',
      description: 'Central Archives, FFXIV character registrations and roleplay profiles',
      shortDescription: 'FFXIV character registrations and roleplay profiles',
      domain: 'centralarchives.org',
    }),
  }),

	housing: Object.freeze({
		MIN_WARD_NUMBER: 1,
		MAX_WARD_NUMBER: 30,
		MIN_MAIN_WARD_PLOT: 1,
		MAX_MAIN_WARD_PLOT: 30,
		MIN_SUBDIVISION_PLOT: 31,
		MAX_SUBDIVISION_PLOT: 60,
		MIN_APARTMENT_NUMBER: 1,
		MAX_APARTMENT_NUMBER: 90,
	}),

	carrdDomains: Object.freeze([
		'carrd.co',
		'crd.co',
		'drr.ac',
		'ju.mp',
		'uwu.ai',
	]),

  errorCodes: Object.freeze({
    OTP_REQUIRED: 'OTP_REQUIRED',
  }),
})
