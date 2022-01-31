<template>
  <q-page class="page-venue">
		<template v-if="venue.id">
			<section v-if="venue.mine" class="page-venue__edit-bar">
				<router-link :to="`/edit-venue/${venue.id}`">Edit venue</router-link>
				<q-btn flat color="negative" label="Delete venue" @click="onDeleteClick" />
			</section>
			<venue-profile :venue="venue" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import VenueProfile from 'components/venues/VenueProfile.vue';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { MetaOptions } from 'quasar/dist/types/meta';
import { createMetaMixin } from 'quasar';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<VenueDto> {
		const id = parseInt(params.id as string, 10);
		const name = params.name as string;
		const server = params.server as string;

		if (!id && !name) {
			void $router.replace('/');
			throw new Error();
		}

		try {
			if (id) {
				return await $api.venues.getVenue(id);
			} else {
				return await $api.venues.getVenueByName(name.replace(/_/g, ' '), server);
			}
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

	onDeleteClick() {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the venue “${this.venue.name}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.venues.deleteVenue(this.venue.id);

					notifySuccess('Venue deleted.');
					void this.$router.replace('/');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">
.page-venue__edit-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>