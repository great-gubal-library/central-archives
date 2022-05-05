export enum NoticeboardLocation {
	MULTIPLE_LOCATIONS = 'multiple_locations',
	VESPER_BAY = 'vesper_bay',
	LIMSA_LOMINSA = 'limsa_lominsa',
	GRIDANIA = 'gridania',
	ULDAH = 'uldah',
	ISHGARD = 'ishgard',
	REVENANTS_TOLL = 'revenants_toll',
	OLD_SHARLAYAN = 'old_sharlayan',
	RADZ_AT_HAN = 'radz_at_han',
	KUGANE = 'kugane',
}

export const noticeboardLocations: { [k: string]: string } = {
	[NoticeboardLocation.MULTIPLE_LOCATIONS]: 'Multiple Locations',
	[NoticeboardLocation.VESPER_BAY]: 'Vesper Bay',
	[NoticeboardLocation.LIMSA_LOMINSA]: 'Limsa Lominsa',
	[NoticeboardLocation.GRIDANIA]: 'Gridania',
	[NoticeboardLocation.ULDAH]: "Ul'dah",
	[NoticeboardLocation.ISHGARD]: 'Ishgard',
	[NoticeboardLocation.REVENANTS_TOLL]: "Revenant's Toll",
	[NoticeboardLocation.OLD_SHARLAYAN]: 'Old Sharlayan',
	[NoticeboardLocation.RADZ_AT_HAN]: 'Radz-at-Han',
	[NoticeboardLocation.KUGANE]: 'Kugane',
};
