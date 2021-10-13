<template>
  <q-list class="event-list" dark>
    <q-item-label header> Events </q-item-label>
    <q-item
      v-for="event in events"
      clickable
      v-ripple
      :key="event.name"
      tag="a"
      target="_blank"
      class="event-list__link"
      :href="event.link"
    >
      <q-item-section>
        <q-item-label>{{ event.name }}<template v-if="event.location"> — {{ event.location }}</template></q-item-label>
        <q-item-label caption>
          {{ formatDateServer(event.date) }}
          <q-tooltip>{{ formatDateLocal(event.date) }}</q-tooltip>
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
  </q-list>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import SharedConstants from '@app/shared/SharedConstants';
import { useApi } from 'src/boot/axios';

const BASIC_DATE_FORMAT_OPTIONS: DateTimeFormatOptions = Object.freeze({
  dateStyle: 'long',
  timeStyle: 'short',
});

let events = ref([] as EventDto[]);

const today = DateTime.now()
  .setZone(SharedConstants.FFXIV_SERVER_TIMEZONE)
  .startOf('day');

onBeforeMount(async () => {
  // Show only events from today and later
  events.value = (await useApi().getEvents()).filter(
    (event) =>
      DateTime.fromMillis(event.date)
        .setZone(SharedConstants.FFXIV_SERVER_TIMEZONE)
        .startOf('day') >= today
  );
});

function formatDateServer(date: number) {
  return (
    DateTime.fromMillis(date).toLocaleString(
      Object.assign(
        {
          timeZone: SharedConstants.FFXIV_SERVER_TIMEZONE,
        },
        BASIC_DATE_FORMAT_OPTIONS
      )
    ) + ' ST'
  );
}

function formatDateLocal(date: number) {
  return (
    DateTime.fromMillis(date).toLocaleString(BASIC_DATE_FORMAT_OPTIONS) +
    ' LT'
  );
}
</script>

<style lang="scss">
.event-list a.q-item:nth-of-type(even) {
  background: rgba(255, 255, 255, 0.11);
}

.event-list__link {
  border: none;
}
</style>
