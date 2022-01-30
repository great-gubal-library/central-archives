<template>
  <div class="venue-list striped-list">
    <q-list v-if="venues.length" bordered>
      <q-item
        v-for="venue in venues"
        :key="`${venue.id}`"
        clickable
        v-ripple
        :to="getLink(venue)"
      >
        <q-item-section>
            <q-item-label>{{venue.name}}</q-item-label>
            <q-item-label caption><template v-if="venue.housingArea">{{ $display.housingAreas[venue.housingArea] }}, </template>{{venue.address}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <p v-else>
      There are no venues on Chaos Archives. Yet!
    </p>
  </div>
</template>

<script lang="ts">
import { VenueSummaryDto } from '@app/shared/dto/venues/venue-summary.dto';
import { prop, Options, Vue } from 'vue-class-component';

class Props {
  venues = prop<VenueSummaryDto[]>({
    required: true
  });
}

@Options({
  name: 'VenueList',
})
export default class VenueList extends Vue.with(Props) {
  getLink(venue: VenueSummaryDto) {
    return `/venue/${venue.id}`
  }
}
</script>

<style lang="scss">

</style>
