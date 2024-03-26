import { HousingArea } from '@app/shared/enums/housing-area.enum';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { noticeboardLocations } from '@app/shared/enums/noticeboard-location.enum';
import { PageType } from '@app/shared/enums/page-type.enum';
import { races } from '@app/shared/enums/race.enum';
import { Region } from '@app/shared/enums/region.enum';
import { StoryType } from '@app/shared/enums/story-type.enum';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import SharedConstants from '@app/shared/shared-constants';
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

interface EventInfo {
  startDateTime: number;
  endDateTime?: number | null;
}

class Display {
	readonly races = races;

	readonly storyTypes: { [k: string]: string } = {
		[StoryType.PUBLISHED_WORK]: 'Published Work',
		[StoryType.DIARY]: 'Diary',
		[StoryType.POETRY]: 'Poetry',
		[StoryType.IC_HAPPENING]: 'IC Happening',
		[StoryType.CONCEPTUAL]: 'Conceptual',
	};

	readonly noticeboardLocations = noticeboardLocations;

	readonly imageCategories: { [k: string]: string } = {
		[ImageCategory.UNLISTED]: 'Unlisted',
		[ImageCategory.ARTWORK]: 'Artwork',
		[ImageCategory.SCREENSHOT]: 'Screenshot',
	};

	readonly venueLocations: { [k: string]: string } = {
		[VenueLocation.OPEN_WORLD]: 'Open world',
		[VenueLocation.HOUSE]: 'House',
		[VenueLocation.APARTMENT]: 'Apartment',
	};

	readonly housingAreas: { [k: string]: string } = {
		[HousingArea.MIST]: 'Mist',
		[HousingArea.LAVENDER_BEDS]: 'Lavender Beds',
		[HousingArea.GOBLET]: 'The Goblet',
		[HousingArea.SHIROGANE]: 'Shirogane',
		[HousingArea.EMPYREUM]: 'Empyreum',
	};

	readonly pageTypes: { [k: string]: string } = {
		[PageType.PROFILE]: 'Profile',
		[PageType.FREE_COMPANY]: 'Free Company',
		[PageType.COMMUNITY]: 'Community',
		[PageType.VENUE]: 'Venue',
		[PageType.EVENT]: 'Event',
		[PageType.STORY]: 'Story',
		[PageType.NOTICEBOARD_ITEM]: 'Noticeboard item',
		[PageType.WIKI_PAGE]: 'Wiki page',
		[PageType.IMAGE]: 'Image',
		[PageType.PLAYER_PROFILE]: 'Player Profile',
	};

	readonly pageTypesPlural: { [k: string]: string } = {
		[PageType.PROFILE]: 'Profiles',
		[PageType.FREE_COMPANY]: 'Free Companies',
		[PageType.COMMUNITY]: 'Communities',
		[PageType.VENUE]: 'Venues',
		[PageType.EVENT]: 'Events',
		[PageType.STORY]: 'Stories',
		[PageType.NOTICEBOARD_ITEM]: 'Noticeboard items',
		[PageType.WIKI_PAGE]: 'Wiki pages',
		[PageType.IMAGE]: 'Images',
		[PageType.PLAYER_PROFILE]: 'Player Profiles',
	};

  readonly regions: { [k: string]: string } = {
		[Region.EU]: 'Europe',
    [Region.NA]: 'North America',
    [Region.JP]: 'Japan',
    [Region.OC]: 'Oceania',
	};

	relativeTime(timestamp: number) {
		const result = DateTime.fromMillis(timestamp).toRelative({
			locale: 'en',
			unit: [ 'years', 'months', 'days', 'hours', 'minutes' ]
		}) || '';

		return result === '0 minutes ago' ? 'Just now' : result;
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

  private isMultipleDays(event: EventInfo): boolean {
    if (!event.endDateTime) {
      return false;
    }

    const options = { zone: SharedConstants.FFXIV_SERVER_TIMEZONE };
    const startDateTime = DateTime.fromMillis(event.startDateTime, options);
    const endDateTime = DateTime.fromMillis(event.endDateTime, options);

    return !startDateTime.startOf('day').equals(endDateTime.startOf('day'));
  }

  formatEventServerDate(event: EventInfo, htmlBreak = false): string {
    if (this.isMultipleDays(event)) {
      const separator = htmlBreak ? '<br />' : ' ';
      return `${this.formatDateTimeServer(event.startDateTime)} –${separator}${this.formatDateTimeServer(event.endDateTime!)}`;
    }

    return this.formatDateTimeServer(event.startDateTime);
  }

  formatEventLocalDate(event: EventInfo): string {
    if (this.isMultipleDays(event)) {
      return `${this.formatDateTimeLocal(event.startDateTime)} – ${this.formatDateTimeLocal(event.endDateTime!)}`;
    }

    return this.formatDateTimeLocal(event.startDateTime);
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
