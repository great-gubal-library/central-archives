import { HousingArea } from '@app/shared/enums/housing-area.enum';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { noticeboardLocations } from '@app/shared/enums/noticeboard-location.enum';
import { PageType } from '@app/shared/enums/page-type.enum';
import { races } from '@app/shared/enums/race.enum';
import { StoryType } from '@app/shared/enums/story-type.enum';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { DateTime } from 'luxon';
import { boot } from 'quasar/wrappers';

// This boot file adds a $display property to all Vue components, containing human-readable display names
// for constants used in the code.

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $display: Display;
  }
}

const DATE_FORMAT = 'd MMMM yyyy';
const DATE_TIME_FORMAT = "d MMMM yyyy 'at' HH:mm";

class Display {
	readonly races = races;

	readonly storyTypes: { [k: string]: string } = {
		[StoryType.PUBLISHED_WORK]: 'Veröffentlichte Arbeit',
		[StoryType.DIARY]: 'Tagebuch',
		[StoryType.POETRY]: 'Poesi',
		[StoryType.IC_HAPPENING]: 'IC-Geschehen',
		[StoryType.CONCEPTUAL]: 'konzeptionell',
	};

	readonly noticeboardLocations = noticeboardLocations;

	readonly imageCategories: { [k: string]: string } = {
		[ImageCategory.UNLISTED]: 'Ungelistet',
		[ImageCategory.ARTWORK]: 'Kunstwerk',
		[ImageCategory.SCREENSHOT]: 'Screenshot',
	};

	readonly venueLocations: { [k: string]: string } = {
		[VenueLocation.OPEN_WORLD]: 'Offene Welt',
		[VenueLocation.HOUSE]: 'Haus',
		[VenueLocation.APARTMENT]: 'Wohnung',
	};

	readonly housingAreas: { [k: string]: string } = {
		[HousingArea.MIST]: 'Dorf des Nebels',
		[HousingArea.LAVENDER_BEDS]: 'Lavendelbeete',
		[HousingArea.GOBLET]: 'Kelchkuppe',
		[HousingArea.SHIROGANE]: 'Shirogane',
		[HousingArea.EMPYREUM]: 'Empyreum',
	};

	readonly pageTypes: { [k: string]: string } = {
		[PageType.PROFILE]: 'Profil',
		[PageType.FREE_COMPANY]: 'Freie Gesellschaft',
		[PageType.COMMUNITY]: 'Community',
		[PageType.VENUE]: 'Venue',
		[PageType.EVENT]: 'Event',
		[PageType.STORY]: 'Geschichte',
		[PageType.NOTICEBOARD_ITEM]: 'Noticeboard item',
		[PageType.WIKI_PAGE]: 'Wikibeitrag',
		[PageType.IMAGE]: 'Bild',
	};

	readonly pageTypesPlural: { [k: string]: string } = {
		[PageType.PROFILE]: 'Profile',
		[PageType.FREE_COMPANY]: 'Freie Gesellschaften',
		[PageType.COMMUNITY]: 'Communities',
		[PageType.VENUE]: 'Venues',
		[PageType.EVENT]: 'Events',
		[PageType.STORY]: 'Geschichten',
		[PageType.NOTICEBOARD_ITEM]: 'Noticeboard items',
		[PageType.WIKI_PAGE]: 'Wikibeiträge',
		[PageType.IMAGE]: 'Bilder',
	};

	relativeTime(timestamp: number) {
		const result = DateTime.fromMillis(timestamp).toRelative({
			locale: 'en',
			unit: [ 'Jahre', 'Monate', 'Tage', 'Stunden', 'Minuten' ]
		}) || '';

		return result === 'vor 0 Minuten' ? 'Gerade' : result;
	}

	formatDate(date: number|string) {
		const dateTime = typeof date === 'string' ?  DateTime.fromISO(date) : DateTime.fromMillis(date);
		return dateTime.toFormat(DATE_FORMAT, { locale: 'en-GB' });
	}

	formatDateTimeServer(timestamp: number) {
		return DateTime.fromMillis(timestamp).setZone(SharedConstants.FFXIV_SERVER_TIMEZONE).toFormat(DATE_TIME_FORMAT,
			{ locale: 'en-GB' },
		) + ' ST';
	}

	formatDateTimeLocal(timestamp: number) {
		return DateTime.fromMillis(timestamp).toFormat(DATE_TIME_FORMAT, { locale: 'en-GB' }) + ' LT';
	}

	formatFileSize(fileSize: number) {
		if (fileSize < 1024) {
			return `${fileSize} bytes`;
		} else if (fileSize < 1024 * 1024) {
			const sizeKiB = Math.round(fileSize / 1024);
			return `${sizeKiB} KiB`;
		} else {
			const sizeMiB = fileSize / (1024 * 1024);
			const sizeMiBDisplay = Math.round(sizeMiB * 100) / 100; // 2 decimal digits
			return `${sizeMiBDisplay} MiB`;
		}
	}
}

export const displayOptions = new Display();

export default boot(({ app }) => {
  app.config.globalProperties.$display = displayOptions;
});
