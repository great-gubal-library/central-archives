<template>
  <q-page class="page-my-venues">
    <h2>Meine Treffpunkte</h2>
    <div class="page-my-venues__subtitle">for {{ $store.getters.character?.name }}</div>
    <venue-list v-if="venues.length > 0" :venues="venues" />
		<p v-else>Du hast noch keine Treffpunkte hinzugefügt.</p>
		<p class="page-my-venues__button-bar">
			<q-btn label="Neuer Treffpunkt" color="primary" icon="add" to="/create-venue" />
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

const $api = useApi();
const $store = useStore();

@Options({
  name: 'PageMyVenues',
  components: {
    VenueList,
  },
  async beforeRouteEnter(_, __, next) {
    try {
      const venues = await $api.venues.getVenues({ characterId: $store.getters.characterId! });
      next((vm) => (vm as PageMyVenues).setContent(venues));
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
