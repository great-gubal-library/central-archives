export default Object.freeze({
	FFXIV_SERVER_TIMEZONE: 'UTC',
	DATACENTERS: [ 'Chaos', 'Light' ],
	PASSWORD_MIN_LENGTH: 8,
	MAX_UPLOAD_SIZE: 4 * 1024 * 1024,
	MIN_BANNER_ASPECT_RATIO: 4 / 1,
	DEFAULT_ROWS_PER_PAGE: 20,
	MAX_NEWS_ENTRIES: 3,
	MIN_VIOLATION_REPORT_LENGTH: 10,
	MAX_PRONOUNS_LENGTH: 20,

  OTP_REGEX: /^[0-9]{6}$/,
  CLIENT_BACKUP_CODE_REGEX: /^[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}$/,

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
