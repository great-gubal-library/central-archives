<template>
  <q-item class="event-item" :clickable="!expanded" @click="expand">
    <q-item-section>
      <q-item-label>
				<template v-if="!expanded">{{ event.title }}</template>
				<div class="event-item__expanded-label" v-else @click.stop="collapse">{{ event.title }}</div>
				</q-item-label>
      <q-item-label caption>
        <template v-if="!expanded">
          {{ formatDateServer(event.startDateTime) }}
          <q-tooltip>{{ formatDateLocal(event.startDateTime) }}</q-tooltip>
        </template>
        <template v-else>&nbsp;</template>
      </q-item-label>
      <q-slide-transition>
        <section class="event-item__details" v-if="expanded">
          <div class="event-item_button-bar">
            <q-btn
              v-if="event.link"
              class="event-item__open-link-button"
              label="Open link"
              icon="launch"
              type="a"
              target="_blank"
              :href="event.link"
            />
            <q-btn
              v-else
              class="event-item__open-link-button"
              label="View"
              icon="event"
              :to="`/event/${event.id}`"
            />
            <q-btn flat icon="expand_less" @click.stop="collapse" />
          </div>
          <dl>
            <dt><q-icon name="schedule" /> Starts</dt>
            <dd>
              {{ formatDateServer(event.startDateTime) }}
              <q-tooltip>{{ formatDateLocal(event.startDateTime) }}</q-tooltip>
            </dd>
            <template v-if="event.endDateTime">
              <dt><q-icon name="schedule" /> Ends</dt>
              <dd>
                {{ formatDateServer(event.endDateTime) }}
                <q-tooltip>{{ formatDateLocal(event.endDateTime) }}</q-tooltip>
              </dd>
            </template>
          </dl>
          <ul v-for="location in event.locations" :key="location.name">
            <li class="event-item__location_name">{{ location.name }}</li>
            <li v-if="location.address" class="event-item__icon-row">
              <q-icon name="place" />
              <div class="event-item__icon-row-text">{{ location.address }}</div>
            </li>
            <li v-if="location.server" class="event-item__icon-row">
              <q-icon name="public" />
              <div class="event-item__icon-row-text">{{ location.server }}</div>
            </li>
            <li v-if="location.tags" class="event-item__tags text-caption">{{ location.tags }}</li>
          </ul>
        </section>
      </q-slide-transition>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { EventSummaryDto } from '@app/shared/dto/events/event-summary.dto';
import { prop, Vue } from 'vue-class-component';

class Props {
  event = prop<EventSummaryDto>({
    required: true,
  });
}

export default class EventItem extends Vue.with(Props) {
  expanded = false;

  expand() {
    this.expanded = true;
  }

  collapse() {
    this.expanded = false;
  }

  formatDateServer(date: number) {
    return this.$display.formatDateTimeServer(date);
  }

  formatDateLocal(date: number) {
    return this.$display.formatDateTimeLocal(date);
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

.event-item dd, .event-item li {
	margin-left: 0;
}

.event-item__location_name {
  font-weight: bold;
}

.event-item__icon-row {
  display: flex;
}

.event-item__icon-row i {
  padding-top: 4px;
  padding-right: 4px;
}

.event-item__icon-row-text {
  flex-grow: 1;
}

.event-item dd:not(:last-child), .event-item li:not(:last-child) {
  padding-bottom: 8px;
}
</style>
