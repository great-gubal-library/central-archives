<template>
  <q-page class="page-event">
		<section v-if="event.mine" class="page-event__edit-bar">
			<router-link :to="`/edit-event/${eventId}`">Edit event</router-link>
			<q-btn flat color="negative" label="Delete event" @click="onDeleteClick" />
		</section>
		<event-view v-if="event.title" :event="event" />
		<template v-if="event.images && event.images.length > 0">
			<h3>Images related to this event</h3>
			<thumb-gallery :images="event.images" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { EventDto } from '@app/shared/dto/events/event.dto';
import errors from '@app/shared/errors';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import EventView from 'src/components/event/EventView.vue';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
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
		const event = await $api.events.getEvent(id);
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
		ThumbGallery,
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

	onDeleteClick() {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the event “${this.event.title}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.events.deleteEvent(this.eventId);

					this.$q.notify({
						type: 'positive',
						message: 'Event deleted.'
					});

					void this.$router.replace('/');
					void this.$store.dispatch('updateEvents');
				} catch (e) {
					this.$q.notify({
						type: 'negative',
						message: errors.getMessage(e)
					});
				}
      });
	}
}
</script>

<style lang="scss">
.page-event__edit-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>