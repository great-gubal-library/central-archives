<template>
  <q-page class="page-venues">
		<h2>Treffpunkte</h2>
		<venue-list :venues="venues" />
	</q-page>	
</template>

<script lang="ts">
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import VenueList from 'src/components/venues/VenueList.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

@Options({
	name: 'PageVenues',
	components: {
		VenueList
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const venues = await $api.venues.getVenues();
      next(vm => (vm as PageVenues).setContent(venues));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageVenues extends Vue {
	venues: VenueSummaryDto[] = [];

	setContent(venues: VenueSummaryDto[]) {
		this.venues = venues;
	}
}
</script>

<style lang="scss">

</style>
