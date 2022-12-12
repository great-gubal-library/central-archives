<template>
  <q-page class="page-venue">
		<template v-if="venue.id">
			<section v-if="venue.mine" class="edit-bar">
				<router-link :to="`/edit-venue/${venue.id}`">Treffpunkt bearbeiten</router-link>
				<q-btn flat color="negative" label="Treffpunkt löschen" @click="onDeleteClick" />
			</section>
			<venue-profile :venue="venue" />
    	<report-violation-section :pageType="PageType.VENUE" :pageId="venue.id" />
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
import { PageType } from '@app/shared/enums/page-type.enum';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

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
		ReportViolationSection,
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
				title: `${this.venue.name} — Elpisgarten`,
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
	readonly PageType = PageType;
	
	venue: VenueDto = new VenueDto();

	setContent(venue: VenueDto) {
		this.venue = venue;
	}

	onDeleteClick() {
		this.$q.dialog({
        title: 'Löschbestätigung',
        message: `Möchtest du “${this.venue.name}” wirklich löschen?`,
				ok: {
					label: 'Löschen',
					color: 'negative',
					flat: true
				},
        cancel: 'Abbrechen',
      }).onOk(async () => {
        try {
					await this.$api.venues.deleteVenue(this.venue.id);

					notifySuccess('Treffpunkt gelöscht.');
					void this.$router.replace('/');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">
</style>
