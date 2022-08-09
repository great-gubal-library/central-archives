<template>
  <q-page class="page-event">
		<section v-if="event.mine" class="edit-bar">
			<router-link :to="`/edit-event/${eventId}`">Edit event</router-link>
			<q-btn flat color="negative" label="Delete event" @click="onDeleteClick" />
		</section>
		<event-view v-if="event.title" :event="event" />
		<template v-if="event.images && event.images.length > 0">
			<h3>Images related to this event</h3>
			<thumb-gallery :images="event.images" />
		</template>
		<report-violation-section :pageType="PageType.EVENT" :pageId="eventId" />
	</q-page>	
</template>

<script lang="ts">
import { EventDto } from '@app/shared/dto/events/event.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import { createMetaMixin } from 'quasar';
import { MetaOptions } from 'quasar/dist/types/meta';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import EventView from 'src/components/event/EventView.vue';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<{event: EventDto, eventId: number}> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const event = await $api.events.getEvent(id);
		return { event, eventId: id };
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Event not found.');
			void $router.replace('/');
		} else {
			notifyError(e);
		}

		throw e;
	}
}

@Options({
	name: 'PageEvent',
	components: {
		EventView,
		ThumbGallery,
		ReportViolationSection,
	},
	async beforeRouteEnter(to, _, next) {
		const { event, eventId } = await load(to.params);
		next(vm => (vm as PageEvent).setContent(event, eventId));
	},
	async beforeRouteUpdate(to) {
		const { event, eventId } = await load(to.params);
		(this as PageEvent).setContent(event, eventId);
	},
	mixins: [
		createMetaMixin(function(this: PageEvent) {
			const result: MetaOptions = {
				title: `${this.event.title} — Chaos Archives`,
				meta: {}
			};

			if (this.event.banner) {
				Object.assign(result.meta, {
					ogImage: {
						property: 'og:image',
						content: this.event.banner.url,
					},
					twitterCard: {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				});
			}

			return result;
		}),
	],
})
export default class PageEvent extends Vue {
	readonly PageType = PageType;
	
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

					notifySuccess('Event deleted.');
					void this.$router.replace('/');
					void this.$store.dispatch('updateEvents');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">
</style>