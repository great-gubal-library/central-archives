<template>
  <q-list class="event-list" dark>
    <q-item-label header> Events </q-item-label>
    <event-item v-for="event in events" :key="event.title" :event="event" />
    <q-separator dark />
  </q-list>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { DateTime } from 'luxon';
import SharedConstants from '@app/shared/SharedConstants';
import EventItem from './EventItem.vue';

@Options({
  components: {
    EventItem
  }
})
export default class EventList extends Vue {
  events: EventSummaryDto[] = [];

  async created() {
    const today = DateTime.now()
      .setZone(SharedConstants.FFXIV_SERVER_TIMEZONE)
      .startOf('day')
      .toMillis();

    // Show only events from today and later
    this.events = (await this.$api.getEvents()).filter(
      (event) => event.startDateTime >= today
    );
  }
}
</script>

<style lang="scss">
.event-list a.q-item:nth-of-type(even) {
  background: rgba(255, 255, 255, 0.11);
}
</style>
