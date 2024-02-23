<template>
  <q-page class="page-my-venues">
    <h2>My Venues</h2>
    <div class="page-my-venues__subtitle">for {{ $store.getters.character?.name }}</div>
    <venue-list v-if="venues.length > 0" :venues="venues" />
		<p v-else>You have not yet registered any venues.</p>
		<p class="page-my-venues__button-bar">
			<q-btn label="New venue" color="primary" icon="add" to="/create-venue" />
		</p>
  </q-page>
</template>

<script lang="ts">
import VenueList from 'components/venues/VenueList.vue';
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import { useRouter } from 'src/router';

const $api = useApi();
const $store = useStore();
const $router = useRouter();

@Options({
  name: 'PageMyVenues',
  components: {
    VenueList,
  },
  async beforeRouteEnter(_, __, next) {
    try {
      const characterId = $store.getters.characterId;

      if (!characterId) {
			  void $router.replace('/');
        throw new Error('You must log in to view this page');
      }

      const venues = await $api.venues.getVenues({ characterId, limit: 500 });
      next((vm) => (vm as PageMyVenues).setContent(venues.data));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  },
})
export default class PageMyVenues extends Vue {
  venues: VenueSummaryDto[] = [];

  setContent(venues: VenueSummaryDto[]) {
    this.venues = venues;
  }
}
</script>

<style lang="scss">
.page-my-venues h2 {
  margin-bottom: 0;
}

.page-my-venues__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}

.page-my-venues__button-bar {
	text-align: right;
	margin-top: 8px;
}
</style>
