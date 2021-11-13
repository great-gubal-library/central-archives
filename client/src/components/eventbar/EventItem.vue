<template>
  <q-item class="event-item" :clickable="!expanded" v-ripple="!expanded" @click="expand">
    <q-item-section>
      <q-item-label>{{ event.name }}</q-item-label>
      <q-item-label caption>
        <template v-if="!expanded">
          {{ formatDateServer(event.startDate) }}
          <q-tooltip>{{ formatDateLocal(event.startDate) }}</q-tooltip>
        </template>
        <template v-else>&nbsp;</template>
      </q-item-label>
      <q-slide-transition>
        <section class="event-item__details" v-if="expanded">
          <div style="margin-bottom: 8px" class="flex">
            <q-btn
              class="event-item__open-link-button"
              label="Open link"
              icon="launch"
              type="a"
              target="_blank"
              :href="event.link"
            />
            <q-btn flat icon="expand_less" @click.stop="collapse" />
          </div>
          <dl>
            <dt><q-icon name="schedule" /> Starts</dt>
            <dd>
              {{ formatDateServer(event.startDate) }}
              <q-tooltip>{{ formatDateLocal(event.startDate) }}</q-tooltip>
            </dd>
            <template v-if="event.endDate">
              <dt><q-icon name="schedule" /> Ends</dt>
              <dd>
                {{ formatDateServer(event.endDate) }}
                <q-tooltip>{{ formatDateLocal(event.endDate) }}</q-tooltip>
              </dd>
            </template>
          </dl>
          <dl v-for="location in event.locations" :key="location.name">
            <dt><q-icon name="place" /> Location</dt>
            <dd>{{ location.name }}</dd>
            <dt><q-icon name="home" /> Address</dt>
            <dd>{{ location.address }}</dd>
            <dt><q-icon name="public" /> World</dt>
            <dd>{{ location.server }}</dd>
            <div class="text-caption">{{ location.tags }}</div>
          </dl>
        </section>
      </q-slide-transition>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { prop, Vue } from 'vue-class-component';
import { EventDto } from '@app/shared/dto/events/event.dto';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import SharedConstants from '@app/shared/SharedConstants';

class Props {
  event = prop<EventDto>({
    required: true,
  });
}

const BASIC_DATE_FORMAT_OPTIONS: DateTimeFormatOptions = Object.freeze({
  dateStyle: 'long',
  timeStyle: 'short',
});

export default class EventItem extends Vue.with(Props) {
  expanded = false;

  expand() {
    this.expanded = true;
  }

  collapse() {
    this.expanded = false;
  }

  formatDateServer(date: number) {
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

  formatDateLocal(date: number) {
    return DateTime.fromMillis(date).toLocaleString(BASIC_DATE_FORMAT_OPTIONS) + ' LT';
  }
}
</script>

<style lang="scss">
.event-list__item {
  border: none;
}

.event-item__details {
  margin: 0 -8px;
  overflow: visible;
}

.event-item__open-link-button {
	flex-grow: 1;
}

.event-item dl {
  margin: 0 0 8px 0;
  padding: 8px;
  background: rgba(0, 32, 116, 0.2);
  overflow: hidden;
}

.event-item dt {
  font-weight: bold;
}

.event-item dd {
  margin-left: 0;
}

.event-item dd:not(:last-child) {
  margin-bottom: 8px;
}
</style>
