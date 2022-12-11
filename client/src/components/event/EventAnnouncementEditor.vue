<template>
  <q-card class="event-announcement-editor">
    <q-card-section>
      <div>Poste eine Ankündigung auf Discord zur folgenden Zeit vor deinem Event:</div>
      <div>
        <q-option-group :options="options" :model-value="minutesBefore" @update:model-value="setMinutesBefore" />
      </div>
      <q-input v-model.number="modelValue.minutesBefore" v-if="custom" label="Benutzerdefiniert" style="width: 200px">
        <template v-slot:after><span style="font-size: 16px">Minuten</span></template>
      </q-input>
      <div>Inhalt der Ankündigung:</div>
      <q-input
				input-style="height: 300px"
        type="textarea"
        outlined
        v-model="modelValue.content"
        :rules="[ $rules.required('Dieses Feld ist erforderlich.') ]"
      />
      <div class="text-caption">Discordformatierung (Markdown) kann genutzt werden. Um eine Rolle zu erwähnen, füge ein @-Symbol vor die Rolle: <strong>@eventankündigungen</strong>. Um einen Nutzer zu erwähnen, verwende deren Discordname <strong>@UserName#1234</strong> oder Nickname auf dem Server in geschweiften Klammern: <strong>@{Sharshulam Noykin [Shiva]}</strong>.</div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat color="negative" label="Ankündigung entfernen" @click="onRemoveClick" />
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
      label: '15 Minuten',
      value: 15,
    },
    {
      label: '1 Stunde',
      value: 60,
    },
    {
      label: 'Benutzerdefiniert',
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
