<template>
  <q-page class="page-edit-character">
    <template v-if="character.id">
      <h2>Edit Profile</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-banner v-if="!character.active" class="bg-dark text-white">
            This character has been renamed in-game, and you have created a new profile for the renamed character. This character is now inactive. You can no longer update their info from Lodestone.
          </q-banner>
          <div class="page-edit-character__lodestone-info">
            <section class="page-edit-character__form-controls">
              <q-input :model-value="character.name" label="Name" readonly />
              <q-input :model-value="$display.races[character.race]" label="Race" readonly />
            </section>
            <section v-if="character.active">
              <q-btn outline color="secondary" @click="onRefreshClick" style="max-width: 140px"
                ><i class="material-icons q-icon">refresh</i>Refresh from Lodestone</q-btn
              >
            </section>
          </div>
          <section class="page-edit-character__form-controls">
            <p></p>
            <p>All fields are optional.</p>
            <h6>Profile display</h6>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.showAvatar" label="Show avatar" />
              </template>
            </q-field>
            <div class="text-caption">Displays the character avatar to the left of their name.</div>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.showInfoboxes" label="Show infoboxes" />
              </template>
            </q-field>
            <div class="text-caption">
              Displays character information in infoboxes. If unchecked, all infoboxes will be hidden from the public
              profile page.
            </div>
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox v-model="character.combinedDescription" label="Merge appearance and background" />
              </template>
            </q-field>
            <div class="text-caption">
              Uses a single "Description" field with no header instead of separate "Outward appearance" and "Background"
              with headers.
            </div>
          </section>
          <banner-edit-section v-model="character.banner" />
          <section class="page-edit-character__form-controls">
            <h6>Names</h6>
            <q-input v-model="character.title" label="Title" />
            <q-input v-model="character.nickname" label="Nickname" />
            <h6>Biography</h6>
            <q-input v-model="character.occupation" label="Occupation" />
            <q-input v-model="character.age" class="page-edit-character__age" label="Age" />
            <q-input v-model="character.birthplace" label="Birthplace" />
            <q-input v-model="character.residence" label="Residence" />
            <h6>Personality</h6>
            <q-input v-model="character.loves" label="Loves" />
            <q-input v-model="character.hates" label="Hates" />
            <q-input v-model="character.motto" label="Motto" />
            <q-input v-model="character.motivation" label="Motivation" />
          </section>
          <h6>{{ character.combinedDescription ? 'Description' : 'Outward appearance' }}</h6>
          <html-editor v-model="character.appearance" />
          <template v-if="!character.combinedDescription">
            <h6>Background</h6>
            <html-editor v-model="character.background" />
          </template>
          <section class="page-edit-character__form-controls">
            <h6>Carrd integration</h6>
            <q-input
              v-model="character.carrdProfile"
              label="Carrd profile"
              hint="Leave blank if you don't have a Carrd profile or don't want to it on your page."
            >
              <template v-slot:prepend>
                <q-icon name="link" />
              </template>
              <template v-slot:after> .carrd.co </template>
            </q-input>
          </section>
        </template>
        <section v-else class="page-edit-character__preview">
          <character-profile :character="character" :preview="true" />
        </section>
        <div class="page-edit-character__button-bar">
          <q-btn-toggle v-model="preview" :options="previewOptions" toggle-color="secondary" />
          <div class="page-edit-character__revert-submit">
            <q-btn label="Revert" color="secondary" @click="onRevertClick" />&nbsp;
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
          <span class="q-ml-sm">Do you want to revert your unsaved changes to the last saved version?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Keep editing" color="secondary" v-close-popup />
          <q-btn flat label="Revert" color="negative" v-close-popup @click="onConfirmRevert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { CharacterRefreshResultDto } from '@app/shared/dto/characters/character-refresh-result.dto';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import BannerEditSection from 'src/components/common/BannerEditSection.vue';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import HtmlEditor from '../components/common/HtmlEditor.vue';

const $api = useApi();
const $q = useQuasar();

async function load(): Promise<CharacterProfileDto> {
  const $store = useStore();
  const name = $store.getters.character?.name || '';
  const server = $store.getters.character?.server || '';

  try {
    return await $api.getCharacterProfile(name, server);
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: errors.getMessage(e),
    });
    throw e;
  }
}

@Options({
  components: {
    HtmlEditor,
    CharacterProfile,
    BannerEditSection,
  },
  async beforeRouteEnter(_, __, next) {
    const character = await load();
    next((vm) => (vm as PageEditCharacter).setContent(character));
  },
})
export default class PageEditCharacter extends Vue {
  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
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
      await this.$api.saveCharacter(this.character);
      this.characterBackup = new CharacterProfileDto(this.character);

      this.$q.notify({
        message: 'Character saved.',
        type: 'positive',
        actions: [
          {
            label: 'View',
            color: 'white',
            handler: () => this.viewCharacter(),
          },
        ],
      });
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
    } finally {
      this.saving = false;
    }
  }

  viewCharacter() {
    const name = this.$store.getters.character?.name || '';
    const server = this.$store.getters.character?.server || '';
    void this.$router.push(`/${server}/${name.replace(' ', '_')}`);
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

.page-edit-character__age {
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
