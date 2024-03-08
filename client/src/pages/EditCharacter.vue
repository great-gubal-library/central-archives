<template>
  <q-page class="page-edit-character">
    <template v-if="character.id">
      <h2>Edit Profile</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-banner v-if="!character.active" class="bg-dark text-white">
            This character has been renamed in-game, and you have created a new profile for the renamed character. This
            character is now inactive. You can no longer update their info from Lodestone.
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
            <q-field class="page-edit-character__checkbox" borderless>
              <template v-slot:control>
                <q-checkbox
                  v-model="character.visibilityInPlayerProfile"
                  :disable="character.visibilityInPlayerProfile === VisibilityInPlayerProfile.DISABLED"
                  :true-value="VisibilityInPlayerProfile.SHOW"
                  :false-value="VisibilityInPlayerProfile.HIDE"
                  label="Show character in player profile"
                />
              </template>
            </q-field>
            <div class="text-caption" v-if="character.visibilityInPlayerProfile === VisibilityInPlayerProfile.DISABLED">
              Your <router-link :to="playerProfileLink">player profile</router-link> is private and not displayed to other users.
            </div>
            <div class="text-caption" v-else>
              Controls whether this character is displayed in the list of characters in your public <router-link :to="playerProfileLink">player profile</router-link>.
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
            <q-input v-model="character.pronouns" class="page-edit-character__pronouns" label="Pronouns" :maxlength="SharedConstants.MAX_PRONOUNS_LENGTH" />
            <q-input v-model="character.nationality" label="Nationality" />
            <q-input v-model="character.birthplace" label="Birthplace" />
            <q-input v-model="character.residence" label="Residence" />
            <div class="text-caption">You can use [[wikilinks]], e.g. [[Character Name]], in all biography fields.</div>
            <h6>Personality</h6>
            <q-input v-model="character.friends" label="Friends" />
            <q-input v-model="character.relatives" label="Relatives" />
            <q-input v-model="character.enemies" label="Rivals/Enemies" />
            <q-input v-model="character.loves" label="Loves" />
            <q-input v-model="character.hates" label="Hates" />
            <q-input v-model="character.motto" label="Motto" />
            <q-input v-model="character.motivation" label="Motivation" />
            <div class="text-caption">You can use [[wikilinks]], e.g. [[Character Name|my friend]], in all personality fields.</div>
          </section>
          <h6>{{ character.combinedDescription ? 'Description' : 'Outward appearance' }}</h6>
          <html-editor :editor-id="`character-appearance-${character.id}`" v-model="character.appearance" />
          <template v-if="!character.combinedDescription">
            <h6>Background</h6>
            <html-editor :editor-id="`character-background-${character.id}`" v-model="character.background" />
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
import { VisibilityInPlayerProfile } from '@app/shared/enums/visibility-in-player-profile.enum';

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

  readonly VisibilityInPlayerProfile = VisibilityInPlayerProfile;

  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  character = new CharacterProfileDto();
  characterBackup = new CharacterProfileDto();
  preview = false;
  saving = false;

  confirmRevert = false;

  get playerProfileLink() {
    return `/player-profile/${this.$store.state.user!.id}`;
  }

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

      notifySuccess('Character saved.', {
        label: 'View',
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
