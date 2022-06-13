import { NewsRole } from '@app/shared/enums/news-role.enum';
import { NewsStatus } from '@app/shared/enums/news-status.enum';
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

const EORZEAN_MONTH_NAMES: string[] = [];

for (const ordinal of [ 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth' ]) {
	EORZEAN_MONTH_NAMES.push(`${ordinal} Astral Moon`);
	EORZEAN_MONTH_NAMES.push(`${ordinal} Umbral Moon`);
}

class Display {
	newsRoles = {
		[NewsRole.NONE]: 'Guest',
		[NewsRole.AUTHOR]: 'Author',
		[NewsRole.EDITOR]: 'Editor',
	};

	articleStatuses = {
		[NewsStatus.DRAFT]: 'Draft',
		[NewsStatus.SUBMITTED]: 'Submitted for publication',
		[NewsStatus.PUBLISHED]: 'Published',
	}

	formatDateEorzean(date: number|string) {
		const dateTime = typeof date === 'string' ?  DateTime.fromISO(date, {
			zone: SharedConstants.FFXIV_SERVER_TIMEZONE
		}) : DateTime.fromMillis(date, {
			zone: SharedConstants.FFXIV_SERVER_TIMEZONE
		});
		
		const day = dateTime.day;
		const suffix = (day === 1 || day === 21 || day === 31) ? 'st'
			: (day === 2 || day === 22) ? 'nd'
			: (day === 3 || day === 23) ? 'rd'
			: 'th';
		const month = EORZEAN_MONTH_NAMES[dateTime.month - 1]; // January is 1

		return `${day}${suffix} Sun of the ${month}`;
	}
}

export const displayOptions = new Display();

export default boot(({ app }) => {
  app.config.globalProperties.$display = displayOptions;
});
