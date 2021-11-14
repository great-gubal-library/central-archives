<template>
  <q-page class="page-event">
		<h2>{{event.title}}</h2>
		<template v-if="event.title">
			<p>
				<strong>Starts:</strong> {{$display.formatDateTimeServer(event.startDateTime)}}
				<span class="page-event__local-time">({{$display.formatDateTimeLocal(event.startDateTime)}})</span>
				<template v-if="event.endDateTime">
					<br />
					<strong>Ends:</strong> {{$display.formatDateTimeServer(event.endDateTime)}}
				<span class="page-event__local-time">({{$display.formatDateTimeLocal(event.endDateTime)}})</span>
				</template>
			</p>
			<p v-if="event.locationName">
				<strong>Location:</strong> {{event.locationName}}
				<template v-if="event.locationAddress">
					<br />
					<strong>Address:</strong> <template v-if="event.locationServer">{{event.locationServer}}, </template> {{event.locationAddress}}
				</template>
				<template v-if="event.locationTags">
					<br />
					<strong>Tags:</strong> {{event.locationTags}}
				</template>
			</p>
			<section v-if="event.details" v-html="details"></section>
			<template v-if="event.oocDetails">
				<h3>OOC Details</h3>
				<section v-html="oocDetails"></section>
			</template>
			<hr />
			<p v-if="event.link"><strong>Link: </strong> <a :href="event.link">{{ event.link }}</a></p>
			<p v-if="event.contact"><strong>Contact: </strong> {{event.contact}}</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { EventDto } from '@app/shared/dto/events/event.dto';
import errors from '@app/shared/errors';
import html from '@app/shared/html';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

async function load(params: RouteParams): Promise<EventDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const event = await $api.getEvent(id);
		document.title = `${event.title} — Chaos Archives`;
		return event;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			$q.notify({
				type: 'negative',
				message: 'Event not found.'
			});
			void $router.replace('/');
		} else {
			$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		}

		throw e;
	}
}

@Options({
	name: 'PageEvent',
	async beforeRouteEnter(to, _, next) {
		const event = await load(to.params);
		next(vm => (vm as PageEvent).setContent(event));
	},
	async beforeRouteUpdate(to) {
		const event = await load(to.params);
		(this as PageEvent).setContent(event);
	}
})
export default class PageEvent extends Vue {
	event = {} as EventDto;

	setContent(event: EventDto) {
		this.event = event;
	}

	get details() {
		return this.event ? html.sanitize(this.event.details) : '';
	}

	get oocDetails() {
		return this.event ? html.sanitize(this.event.details) : '';
	}

	get startDateTime(): string {
    return this.$display.formatDateTimeServer(this.event.startDateTime);
  }

	get endDateTime(): string {
    return this.event.endDateTime ? this.$display.formatDateTimeServer(this.event.startDateTime) : '';
  }

	/*
  get authorLink(): string {
    const server = this.image.authorServer;
    const character = this.image.author.replace(' ', '_');
    return `/${server}/${character}`;
  }
	*/
}
</script>

<style lang="scss">
.page-event__local-time {
	color: #888;
}
</style>
