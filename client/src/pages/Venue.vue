<template>
  <q-page class="page-venue">
		<venue-profile v-if="venue.id" :venue="venue" />
	</q-page>	
</template>

<script lang="ts">
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import VenueProfile from 'components/venues/VenueProfile.vue';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { notifyError } from 'src/common/notify';
import { useRouter } from 'src/router';
import { MetaOptions } from 'quasar/dist/types/meta';
import { createMetaMixin } from 'quasar';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<VenueDto> {
		const id = parseInt(params.id as string, 10);

		if (!id) {
			void $router.replace('/');
			throw new Error();
		}

		try {
			return await $api.venues.getVenue(id);
		} catch (e) {			
			notifyError(e);
			throw e;
			void $router.replace('/');
		}
}

@Options({
	components: {
		VenueProfile,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageVenue).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageVenue).setContent(content);
	},
	mixins: [
		createMetaMixin(function(this: PageVenue) {
			const result: MetaOptions = {
				title: `${this.venue.name} — Chaos Archives`,
				meta: {}
			};

			if (this.venue.banner) {
				Object.assign(result.meta, {
					ogImage: {
						property: 'og:image',
						content: this.venue.banner.url,
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
export default class PageVenue extends Vue {
	venue: VenueDto = new VenueDto();

	setContent(venue: VenueDto) {
		this.venue = venue;
	}
}
</script>

<style lang="scss">

</style>