<template>
  <q-page class="page-edit-event">
    <template v-if="loaded">
      <h2>{{ eventId ? 'Edit Event' : 'Create New Event' }}</h2>
      <q-form ref="form" @submit="onSubmit">
        <template v-if="!preview">
          <section class="page-edit-event__form-controls">
            <q-input
              v-model="event.title"
              label="Title *"
              :rules="[
                $rules.required('This field is required.'),
              ]"
            />
            <q-date-time-picker
              v-if="startDateTimeVisible"
              label="Start date/time *"
              v-model="startDateTime"
              :display-value="startDateTimeDisplay"
              mode="datetime"
              first-day-of-week="1"
              format24h
              :rules="[
                $rules.required('This field is required.'),
              ]"
            />
            <q-date-time-picker
              v-if="endDateTimeVisible"
              label="End date/time"
              v-model="endDateTime"
              :display-value="endDateTimeDisplay"
              mode="datetime"
              first-day-of-week="1"
              format24h
              clearable
            />
            <h6>Location</h6>
            <q-input
              v-model="event.locationName"
              label="Name *"
              :rules="[
                $rules.required('This field is required.'),
              ]"
            />          
            <q-input
              v-model="event.locationAddress"
              label="Address"
            >
              <template v-slot:prepend>
                <q-icon name="place" />
              </template>
            </q-input>
            <q-select
              label="Server"
              icon="public"
              class="page-edit-event__server-select"
              v-model="event.locationServer"
              :options="serverOptions"
              :rules="[
                $rules.required('This field is required.'),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="public" />
              </template>
            </q-select>
            <q-input
              v-model="event.locationTags"
              label="Location tags"
            />
          </section>
          <banner-edit-section v-model="event.banner" />
          <h6>Details</h6>
          <html-editor v-model="event.details" />
          <h6>OOC Details</h6>
          <html-editor v-model="event.oocDetails" />
          <q-input
            v-model="event.link"
            label="Link"
            :rules="[
              $rules.url('Please enter a link.'),
            ]"
          />
          <q-input
            v-model="event.contact"
            label="Contact"
          />
        </template>
        <section v-else class="page-edit-event__preview">
          <event-view :event="event" :preview="true" />
        </section>
        <div class="page-edit-event__button-bar">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-event__revert-submit">
            <q-btn label="Revert" color="secondary" @click="revert" />&nbsp;
            <q-btn label="Save changes" type="submit" color="primary" />
          </div>
        </div>
        <q-inner-loading :showing="saving" />
      </q-form>
    </template>
    <q-spinner v-else />

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Do you want to revert your unsaved changes to the last saved
            version?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Keep editing" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Revert"
            color="negative"
            v-close-popup
            @click="onConfirmRevert"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { EventEditDto } from '@app/shared/dto/events/event-edit.dto';
import errors from '@app/shared/errors';
import SharedConstants from '@app/shared/SharedConstants';
import { Component as QDateTimePicker } from '@toby.mosque/quasar-ui-qdatetimepicker';
import '@toby.mosque/quasar-ui-qdatetimepicker/dist/index.css'; // Temp, move somewhere
import HtmlEditor from 'components/common/HtmlEditor.vue';
import { DateTime } from 'luxon/src/luxon';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import EventView from 'src/components/event/EventView.vue';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();
const $store = useStore();

async function load(params: RouteParams): Promise<{event: EventEditDto, eventId: number}|null> {
  if (!$store.getters.characterId) {
    throw new Error();
  }

	const id = parseInt(params.id as string, 10);

	if (!id) {
		return null;
	}

	try {
		const event = await $api.getEventForEdit(id);
		document.title = `${event.title} — Chaos Archives`;
		return { event, eventId: id };
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			$q.notify({
				type: 'negative',
				message: 'Event not found.'
			});
			void $router.replace('/');
		} else {
			$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		}

		throw e;
	}
}

@Options({
  components: {
    QDateTimePicker,
    HtmlEditor,
    BannerEditSection,
    EventView,
  },
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageEditEvent).setContent(content));
	},
	async beforeRouteUpdate(to) {
		(this as PageEditEvent).setContent(await load(to.params));
	},
  watch: {
    startDateTime: {
      handler(newValue: string, oldValue: string) {
        // Workaround for validation message bug. Forces the date/time picker to be re-rendered on value change,
        // thus resetting validation error messages.
        if (newValue !== oldValue) {
          const that = this as PageEditEvent;
          that.event.startDateTime = that.toMillis(newValue)!;
          that.startDateTimeVisible = false;
          void that.$nextTick(() => that.startDateTimeVisible = true);
        }
      }
    },
    endDateTime: {
      handler(newValue: string, oldValue: string) {
        // Workaround for display bugs with the clear button
        if (newValue !== oldValue) {
          const that = this as PageEditEvent;
          that.event.endDateTime = that.toMillis(newValue)!;
          that.endDateTimeVisible = false;
          void that.$nextTick(() => that.endDateTimeVisible = true);
        }
      }
    }
  }
})
export default class PageEditEvent extends Vue {
  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  // TODO: Temp, refactor
  readonly serverOptions = [
    'Cerberus',
    'Louisoix',
    'Moogle',
    'Omega',
    'Ragnarok',
    'Spriggan',
  ];

	eventId: number|null = null;
  event = new EventEditDto();
  eventBackup = new EventEditDto();

  startDateTime: string|null = null;
  endDateTime: string|null = null;

  startDateTimeVisible = true;
  endDateTimeVisible = true;

  preview = false;
  loaded = false;
  saving = false;

  confirmRevert = false;

  setContent(content: { event: EventEditDto, eventId: number }|null) {
		if (content) {
			this.eventId = content.eventId;
			this.eventBackup = new EventEditDto(content.event);
    } else {
      this.eventBackup = new EventEditDto({
        mine: true,
        startDateTime: null as unknown as number,
        endDateTime: null,
        title: '',
        details: '',
        oocDetails: '',
        link: '',
        contact: '',
        banner: null,
        locationName: '',
        locationAddress: '',
        locationServer: 'Omega',
        locationTags: '',
        notifications: []
      });
    }

    this.loaded = true;
    this.event = new EventEditDto(this.eventBackup);
    this.startDateTime = this.fromMillis(this.event.startDateTime);
    this.endDateTime = this.fromMillis(this.event.endDateTime);
  }

  private fromMillis(value: number|null): string|null {
    if (!value) {
      return null;
    } else {
      return DateTime.fromMillis(value, {
        zone: SharedConstants.FFXIV_SERVER_TIMEZONE
      }).toISO().substring(0, 16);
    }
  }

  private toMillis(value: string|null): number|null {
    if (!value) {
      return null;
    }

    return DateTime.fromISO(value, {
      zone: SharedConstants.FFXIV_SERVER_TIMEZONE
    }).toMillis();
  }

  get startDateTimeMillis(): number|null {
    return this.toMillis(this.startDateTime);
  }

  get startDateTimeDisplay() {
    const millis = this.startDateTimeMillis;

    if (!millis) {
      return '';
    }

    return this.$display.formatDateTimeServer(millis);
  }

  get endDateTimeMillis(): number|null {
    return this.toMillis(this.endDateTime);
  }

  get endDateTimeDisplay() {
    const millis = this.endDateTimeMillis;

    if (!millis) {
      return '';
    }

    return this.$display.formatDateTimeServer(millis);
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    // We use setContent instead of just reassigning from backup
    // because startDateTime and endDateTime are not part of this.event but are part of form model
    if (this.eventId) {
      this.setContent({
        event: this.eventBackup,
        eventId: this.eventId
      });
    } else {
      this.setContent(null);
    }
  }

  async onSubmit() {
    this.saving = true;

    try {
      if (!this.eventId) {
        const characterId = this.$store.getters.characterId!;
        const { id } = await this.$api.createEvent(this.event, { characterId });
        this.eventId = id;
      } else {
        await this.$api.editEvent(this.eventId, this.event);
      }

      this.eventBackup = new EventEditDto(this.event);

      this.$q.notify({
        message: 'Event saved.',
        type: 'positive',
        actions: [
          {
            label: 'View',
            color: 'white',
            handler: () => this.viewEvent(),
          },
        ],
      });

      void this.$store.dispatch('updateEvents');
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
    } finally {
      this.saving = false;
    }
  }

  viewEvent() {
    if (this.eventId) {
      void this.$router.push(`/event/${this.eventId}`);
    }
  }
}
</script>

<style lang="scss">
.page-edit-event__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-event__preview {
  margin-bottom: 24px;
}

.page-edit-event__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-event__preview h6 {
  font-family: $header-font;
}
</style>
