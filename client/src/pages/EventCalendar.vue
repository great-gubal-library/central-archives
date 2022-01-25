<template>
  <q-page class="page-event-calendar">
    <h2>Event Calendar</h2>
		<div class="page-event-calendar__subtitle">{{ yearMonth }}</div>
		<section class="page-event-calendar__navbar">
			<div>
				<q-btn color="secondary" label="< Previous" :to="prevLink" />&nbsp;
				<q-btn color="secondary" label="Today" to="/event-calendar" />&nbsp;
				<q-btn color="secondary" label="Next >" :to="nextLink" />
			</div>
			<div>
				<q-btn v-if="$store.getters.role && $store.getters.role !== Role.UNVERIFIED" color="primary" label="New Event" icon="add" to="/create-event" />
			</div>
		</section>
    <q-calendar-month
			no-active-date
			:model-value="dateStr"
			:day-min-height="100"
			:weekdays="[1, 2, 3, 4, 5, 6, 0]"
		>
			<template v-slot:day="{ scope: { timestamp } }">
				<template
					v-for="event in eventMap[timestamp.date]"
					:key="event.id"
				>
					<div
						class="page-event-calendar__event text-caption bg-cyan-8 text-white rounded-border"
						:class=" { 'page-event-calendar__event_internal' : !event.link }"
					>
						<router-link v-if="!event.link" :to="`/event/${event.id}`">
							{{ event.startTime }}<template v-if="event.endTime"> – {{ event.endTime }}</template><br/>{{ event.title }}
						</router-link>
						<a v-else :href="event.link" target="_blank">
							{{ event.startTime }}<template v-if="event.endTime"> – {{ event.endTime }}</template><br/>{{ event.title }}
						</a>
					</div>
				</template>
			</template>
		</q-calendar-month>
  </q-page>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { QCalendarMonth } from '@quasar/quasar-ui-qcalendar/dist/QCalendarMonth.esm.js';
import SharedConstants from '@app/shared/SharedConstants';
import { DateTime } from 'luxon';
import { Role } from '@app/shared/enums/role.enum';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { useApi } from 'src/boot/axios';
import { useRouter } from 'src/router';
import { RouteParams } from 'vue-router';
import { notifyError } from 'src/common/notify';
import { createMetaMixin } from 'quasar';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<{date: DateTime, events: EventSummaryDto[]}> {
	let year = parseInt(params.year as string, 10);
	let month = parseInt(params.month as string, 10);
	let date: DateTime;

	if (!year || !month) {
		date = DateTime.now().setZone(SharedConstants.FFXIV_SERVER_TIMEZONE).set({
			day: 1
		});
	} else {
		date = DateTime.fromObject({
			year,
			month,
			day: 1
		}, { zone: SharedConstants.FFXIV_SERVER_TIMEZONE });
	}

	try {
		const events = await $api.events.getEventsForMonth(date.year, date.month);
		return { date, events };
	} catch (e) {
		notifyError(e);
		void $router.replace('/');

		throw e;
	}
}

interface EventItem {
	id: number;
	title: string;
	startTime: string;
	endTime: string|null;
	link: string;
}

@Options({
	name: 'PageEventCalendar',
	components: {
		QCalendarMonth,
	},
	async beforeRouteEnter(to, _, next) {
		const { date, events } = await load(to.params);
		next(vm => (vm as PageEventCalendar).setContent(date, events));
	},
	async beforeRouteUpdate(to) {
		const { date, events } = await load(to.params);
		(this as PageEventCalendar).setContent(date, events);
	},
	mixins: [
		createMetaMixin(function(this: PageEventCalendar) {
			return {
				title: `${this.yearMonth} events — Chaos Archives`
			}
		}),
	],
})
export default class PageEventCalendar extends Vue {
	Role = Role;

	private date: DateTime = this.getThisMonth();
	eventMap: { [ k: string ] : EventItem[] } = {};

	setContent(date: DateTime, events: EventSummaryDto[]) {
		this.date = date;
		this.eventMap = {};

		for (const event of events) {
			const startDate = DateTime.fromMillis(event.startDateTime).setZone(SharedConstants.FFXIV_SERVER_TIMEZONE);
			const endDate = event.endDateTime == null ? null :
				DateTime.fromMillis(event.endDateTime).setZone(SharedConstants.FFXIV_SERVER_TIMEZONE);
			let eventsForDay = this.eventMap[startDate.toISODate()];

			if (!eventsForDay) {
				eventsForDay = [];
				this.eventMap[startDate.toISODate()] = eventsForDay;
			}

			eventsForDay.push({
				id: event.id,
				title: event.title,
				link: event.link,
				startTime: startDate.toFormat('HH:mm'),
				endTime: endDate && endDate.toMillis() !== startDate.toMillis() ? endDate.toFormat('HH:mm') : null,
			})
		}
	}

	private getThisMonth(): DateTime {
		return DateTime.now().setZone(SharedConstants.FFXIV_SERVER_TIMEZONE).set({
			day: 1
		});
	}

	get year() {
		return this.date.year;
	}

	get month() {
		return this.date.month;
	}

	get yearMonth() {
		return this.date.toFormat('LLLL yyyy', { locale: 'en' });
	}

	get dateStr() {
		return this.date.toISODate();
	}

	get prevLink() {
		const prevDate = this.date.minus({ months: 1 });
		return `/event-calendar/${prevDate.year}/${prevDate.month}`;
	}

	get nextLink() {
		const nextDate = this.date.plus({ months: 1 });
		return `/event-calendar/${nextDate.year}/${nextDate.month}`;
	}
}
</script>

<style src="@quasar/quasar-ui-qcalendar/dist/QCalendarDay.min.css"></style>

<style lang="scss">
.page-event-calendar h2 {
  margin-bottom: 0;
}

.page-event-calendar__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}

.page-event-calendar__navbar {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16px;
}

.page-event-calendar__event {
	margin-bottom: 4px;
}

.page-event-calendar__event_internal {
	font-weight: bold;
}

.page-event-calendar__event a, .page-event-calendar__event a:visited {
	display: block;
	color: white;
}

.page-event-calendar__event a:hover {
	color: $yellow-3;
}
</style>
