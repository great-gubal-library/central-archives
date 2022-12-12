<template>
  <q-page class="page-edit-character">
    <template v-if="character.id">
      <h2>Profil bearbeiten</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-banner v-if="!character.active" class="bg-dark text-white">
            Dieser Charakter wurde im Spiel umbenannt, daher musst du ein neues Profil für den umbenannten Charakter anlegen. Dieser
            Charakter ist nun inaktiv. Du kannst die Informationen nicht mehr via Lodestone aktualisieren.
          </q-banner>
          <div class="page-edit-character__lodestone-info">
            <section class="page-edit-character__form-controls">
              <q-input :model-value="character.name" label="Name" readonly />
              <q-input :model-value="$display.races[character.race]" label="Volk" readonly />
            </section>
            <section v-if="character.active">
              <q-btn outline color="secondary" @click="onRefreshClick" style="max-width: 140px"
                ><i class="material-icons q-icon">refresh</i>Aktualisiere via Lodestone</q-btn
              >
            </section>
          </div>
          <section class="page-edit-character__form-controls">
            <p></p>
            <p>Alle Felder sind optional.</p>
            <h6>Profilanzeige</h6>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.showAvatar" label="Zeige Avatar" />
              </template>
            </q-field>
            <div class="text-caption">Zeigt den Avatar des Charakters links vom Namen an.</div>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.showInfoboxes" label="Zeige Infoboxen" />
              </template>
            </q-field>
            <div class="text-caption">
              Zeigt die Charakterinformationen in Infoboxen an. Wenn nicht ausgewählt, werden alle Infoboxen von der öffentlichen Profilseite
              verborgen.
            </div>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.combinedDescription" label="Erscheinungsbild und Hintergrund verbinden" />
              </template>
            </q-field>
            <div class="text-caption">
              Wandelt die Felder für Erscheinung und Hintergrund in ein einziges Beschreibungsfeld ohne Überschrift um.
            </div>
          </section>
          <banner-edit-section v-model="character.banner" />
          <section class="page-edit-character__form-controls">
            <h6>Namen & Titel</h6>
            <q-input v-model="character.title" label="Titel" />
            <q-input v-model="character.nickname" label="Spitzname" />
            <h6>Biografie</h6>
            <q-input v-model="character.occupation" label="Profession" />
            <q-input v-model="character.age" class="page-edit-character__age" label="Alter" />
            <q-input v-model="character.birthplace" label="Geburtsort" />
            <q-input v-model="character.residence" label="Wohnort" />
            <div class="text-caption">Du kannst [[Wikilinks]], z.B. [[Charaktername]], in allen obigen Feldern nutzen.</div>
            <h6>Persönlichkeit</h6>
            <q-input v-model="character.friends" label="Freunde" />
            <q-input v-model="character.relatives" label="Verwandte" />
            <q-input v-model="character.enemies" label="Rivalen/Feinde" />
            <q-input v-model="character.loves" label="Liebt" />
            <q-input v-model="character.hates" label="Hasst" />
            <q-input v-model="character.motto" label="Motto" />
            <q-input v-model="character.motivation" label="Motivation" />
            <div class="text-caption">Du kannst [[Wikilinks]], z.B. [[Charaktername|mein bester Freund]], in allen obigen Feldern nutzen.</div>
          </section>
          <h6>{{ character.combinedDescription ? 'Beschreibung' : 'Erscheinungsbild' }}</h6>
          <html-editor v-model="character.appearance" />
          <template v-if="!character.combinedDescription">
            <h6>Hintergrund</h6>
            <html-editor v-model="character.background" />
          </template>
          <carrd-edit-section
            class="page-edit-character__form-controls"
            entity-type="character"
            v-model="character.carrdProfile"
          />
        </template>
        <section v-else class="page-edit-character__preview">
          <character-profile :character="character" :preview="true" />
        </section>
        <div class="page-edit-character__button-bar">
          <q-btn-toggle v-model="preview" :options="previewOptions" toggle-color="secondary" />
          <div class="page-edit-character__revert-submit">
            <q-btn label="Zurücksetzen" color="secondary" @click="onRevertClick" />&nbsp;
            <q-btn label="Änderungen speichern" type="submit" color="primary" />
          </div>
        </div>
        <q-inner-loading :showing="saving" />
      </q-form>
    </template>
    <q-spinner v-else />

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Möchtest du die ungespeicherten Änderungen auf die letzte gespeicherte Version zurücksetzen?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Bearbeitung fortsetzen" color="secondary" v-close-popup />
          <q-btn flat label="Zurücksetzen" color="negative" v-close-popup @click="onConfirmRevert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import SharedConstants from '@app/shared/SharedConstants';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import CarrdEditSection from 'src/components/common/CarrdEditSection.vue';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import HtmlEditor from '../components/common/HtmlEditor.vue';

const $api = useApi();

async function load(params: RouteParams): Promise<CharacterProfileDto> {
  const id = parseInt(params.id as string, 10);

  const $store = useStore();
  const character = $store.state.user!.characters.get(id)!;

  try {
    return await $api.characters.getCharacterProfile(character.name, character.server);
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

@Options({
  components: {
    HtmlEditor,
    CharacterProfile,
    BannerEditSection,
    CarrdEditSection,
  },
  async beforeRouteEnter(to, _, next) {
    const character = await load(to.params);
    next((vm) => (vm as PageEditCharacter).setContent(character));
  },
})
export default class PageEditCharacter extends Vue {
  readonly SharedConstants = SharedConstants;

  readonly previewOptions = [
    { label: 'Bearbeitung', value: false },
    { label: 'Vorschau', value: true },
  ];

  character = new CharacterProfileDto();
  characterBackup = new CharacterProfileDto();
  preview = false;
  saving = false;

  confirmRevert = false;

  setContent(character: CharacterProfileDto) {
    this.characterBackup = character;
    this.character = new CharacterProfileDto(this.characterBackup);
  }

  async onRefreshClick() {
    const RefreshCharacterDialog = (await import('src/components/character/RefreshCharacterDialog.vue')).default;

    this.$q
      .dialog({
        component: RefreshCharacterDialog,
        componentProps: {
          characterId: this.character.id,
          characterName: this.character.name,
        },
      })
      .onOk((characterData: CharacterRefreshResultDto) => {
        const { name, race, server, avatar } = characterData;
        Object.assign(this.character, { name, race, server, avatar });
      });
  }

  onRevertClick() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.character = new CharacterProfileDto(this.characterBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      await this.$api.characters.saveCharacter(this.character);
      this.characterBackup = new CharacterProfileDto(this.character);

      notifySuccess('Charakter gespeichert.', {
        label: 'Anschauen',
        color: 'white',
        handler: () => this.viewCharacter(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewCharacter() {
    const name = this.character.name || '';
    const server = this.character.server || '';
    void this.$router.push(`/${server}/${name.replace(/ /g, '_')}`);
  }
}
</script>

<style lang="scss">
.page-edit-character__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-character__lodestone-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-edit-character__checkbox .q-field__bottom {
  padding-top: 0;
}

.page-edit-character__preview {
  margin-bottom: 24px;
}

.page-edit-character__age, .page-edit-character__pronouns {
  width: 200px;
}

.page-edit-character__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-character__preview h6 {
  font-family: $header-font;
}
</style>
