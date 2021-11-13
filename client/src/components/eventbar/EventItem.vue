<template>
  <q-item class="event-item" :clickable="!expanded" @click="expand">
    <q-item-section>
      <q-item-label>
				<template v-if="!expanded">{{ event.name }}</template>
				<div class="event-item__expanded-label" v-else @click.stop="collapse">{{ event.name }}</div>
				</q-item-label>
      <q-item-label caption>
        <template v-if="!expanded">
          {{ formatDateServer(event.startDate) }}
          <q-tooltip>{{ formatDateLocal(event.startDate) }}</q-tooltip>
        </template>
        <template v-else>&nbsp;</template>
      </q-item-label>
      <q-slide-transition>
        <section class="event-item__details" v-if="expanded">
          <div class="event-item_button-bar">
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
          <ul v-for="location in event.locations" :key="location.name">
            <li><q-icon name="place" /> {{ location.name }}</li>
            <li v-if="location.address"><q-icon name="home" /> {{ location.address }}</li>
            <li v-if="location.server"><q-icon name="public" /> {{ location.server }}</li>
            <li v-if="location.tags" class="event-item__tags text-caption">{{ location.tags }}</li>
          </ul>
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
.event-item__expanded-label {
	cursor: pointer;
}

.event-item__details {
  margin: 0 -8px;
  overflow: visible;
}

.event-item_button-bar {
	display: flex;
	margin-bottom: 8px;
}

.event-item__open-link-button {
	flex-grow: 1;
}

.event-item dl, .event-item ul {
  margin: 0 0 8px 0;
  padding: 8px;
  background: rgba(0, 32, 116, 0.2);
  overflow: hidden;
}

.event-item ul {
	list-style-type: none;
}

.event-item dt {
  font-weight: bold;
}

.event-item dd {
  margin-left: 0;
}

.event-item li {
	margin-left: 18px;
}

.event-item li i {
	position: absolute;
	margin-left: -18px;
	margin-top: 4px;
}

.event-item dd:not(:last-child), .event-item li:not(:last-child) {
  padding-bottom: 8px;
}

.event-item .event-item__tags {
	margin-left: 0;
}
</style>
