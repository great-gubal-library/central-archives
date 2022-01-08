export enum NoticeboardLocation {
	MULTIPLE_LOCATIONS = 'multiple_locations',
	VESPER_BAY = 'vesper_bay',
	LIMSA_LOMINSA = 'limsa_lominsa',
	GRIDANIA = 'gridania',
	ULDAH = 'uldah',
	ISHGARD = 'ishgard',
}

export const noticeboardLocations: { [k: string]: string } = {
	[NoticeboardLocation.MULTIPLE_LOCATIONS]: 'Multiple Locations',
	[NoticeboardLocation.VESPER_BAY]: 'Vesper Bay',
	[NoticeboardLocation.LIMSA_LOMINSA]: 'Limsa Lominsa',
	[NoticeboardLocation.GRIDANIA]: 'Gridania',
	[NoticeboardLocation.ULDAH]: "Ul'dah",
	[NoticeboardLocation.ISHGARD]: 'Ishgard',
};
