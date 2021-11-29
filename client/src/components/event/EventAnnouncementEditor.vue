<template>
  <q-card class="event-announcement-editor">
    <q-card-section>
      <div>Post a Discord announcement at the following time before the event:</div>
      <div>
        <q-option-group :options="options" :model-value="minutesBefore" @update:model-value="setMinutesBefore" />
      </div>
      <q-input v-model.number="modelValue.minutesBefore" v-if="custom" label="Custom value" style="width: 200px">
        <template v-slot:after><span style="font-size: 16px">minutes</span></template>
      </q-input>
      <div>Content of the announcement post:</div>
      <q-input
				input-style="height: 300px"
        type="textarea"
        outlined
        v-model="modelValue.content"
        :rules="[ $rules.required('This field is required.') ]"
      />
      <div class="text-caption">Discord markup (Markdown) can be used. To mention a role, put an @ before it: <strong>@rp-social</strong>. To mention a user, use their Discord username <strong>@UserName#1234</strong> or server nickname in curly brackets: <strong>@{Alice Kingsleigh [Omega]}</strong>.</div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat color="negative" label="Remove" @click="onRemoveClick" />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { EventAnnouncementDto } from '@app/shared/dto/events/event-announcement.dto';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  modelValue = prop<EventAnnouncementDto>({
    required: true,
  });
}

@Options({
  emits: ['remove'],
})
export default class EventAnnouncementEditor extends Vue.with(Props) {
  readonly options = [
    {
      label: '15 minutes',
      value: 15,
    },
    {
      label: '1 hour',
      value: 60,
    },
    {
      label: 'Custom',
      value: -1,
    },
  ];

  custom = false;

  created() {
    if (this.modelValue.minutesBefore !== 15 && this.modelValue.minutesBefore !== 60) {
      this.custom = true;
    }
  }

  get minutesBefore() {
    return this.custom ? -1 : this.modelValue.minutesBefore;
  }

  setMinutesBefore(newMinutesBefore: number) {
    if (newMinutesBefore === -1) {
      this.custom = true;
    } else {
      this.custom = false;
      this.modelValue.minutesBefore = newMinutesBefore;
    }
  }

  onRemoveClick() {
    this.$emit('remove');
  }
}
</script>
