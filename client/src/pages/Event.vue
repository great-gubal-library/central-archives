<template>
  <q-page class="page-event">
		<p v-if="event.mine">
			<router-link :to="`/edit-event/${eventId}`">Edit event</router-link>
		</p>
		<event-view v-if="event.title" :event="event" />
	</q-page>	
</template>

<script lang="ts">
import { EventDto } from '@app/shared/dto/events/event.dto';
import errors from '@app/shared/errors';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import EventView from 'src/components/event/EventView.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

async function load(params: RouteParams): Promise<{event: EventDto, eventId: number}> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const event = await $api.getEvent(id);
		document.title = `${event.title} — Chaos Archives`;
		return { event, eventId: id };
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
	components: {
		EventView,
	},
	async beforeRouteEnter(to, _, next) {
		const { event, eventId } = await load(to.params);
		next(vm => (vm as PageEvent).setContent(event, eventId));
	},
	async beforeRouteUpdate(to) {
		const { event, eventId } = await load(to.params);
		(this as PageEvent).setContent(event, eventId);
	}
})
export default class PageEvent extends Vue {
	eventId = -1;
	event = {} as EventDto;

	setContent(event: EventDto, eventId: number) {
		this.eventId = eventId;
		this.event = event;
	}
}
</script>
