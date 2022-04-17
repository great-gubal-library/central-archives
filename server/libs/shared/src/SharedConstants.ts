export default Object.freeze({
	FFXIV_SERVER_TIMEZONE: 'UTC',
	DATACENTER: 'Chaos',
	PASSWORD_MIN_LENGTH: 8,
	MAX_UPLOAD_SIZE: 1024 * 1024,
	MIN_BANNER_ASPECT_RATIO: 4 / 1,
	DEFAULT_ROWS_PER_PAGE: 20,
	MAX_NEWS_ENTRIES: 3,
	
	housing: Object.freeze({
		MIN_WARD_NUMBER: 1,
		MAX_WARD_NUMBER: 24,
		MIN_MAIN_WARD_PLOT: 1,
		MAX_MAIN_WARD_PLOT: 30,
		MIN_SUBDIVISION_PLOT: 31,
		MAX_SUBDIVISION_PLOT: 60,
		MIN_APARTMENT_NUMBER: 1,
		MAX_APARTMENT_NUMBER: 90,
	}),

	allowedServers: [
		'Cerberus',
		'Louisoix',
		'Moogle',
		'Omega',
		'Ragnarok',
		'Spriggan',
	],
})
