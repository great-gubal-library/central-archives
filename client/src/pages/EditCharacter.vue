<template>
  <q-page class="page-edit-character">
    <template v-if="character.id">
      <h2>Edit Profile</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <section class="page-edit-character__form-controls">
            <q-input :model-value="character.name" label="Name" readonly />
            <q-input
              :model-value="$display.races[character.race]"
              label="Race"
              readonly
            />
            <p></p>
            <p>All fields are optional.</p>
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
          <h6>Appearance</h6>
          <html-editor v-model="character.appearance" style="height: 400px" />
          <h6>Background</h6>
          <html-editor v-model="character.background" style="height: 400px" />
        </template>
        <section v-else class="page-edit-character__preview">
          <character-profile :character="character" :show-edit-link="false" />
        </section>
        <div class="page-edit-character__button-bar">
          <q-btn-toggle v-model="preview" :options="previewOptions" toggle-color="secondary" />
          <div class="page-edit-character__revert-submit">
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
import errors from '@app/shared/errors';
import { Options, Vue } from 'vue-class-component';
import HtmlEditor from '../components/common/HtmlEditor.vue';
import CharacterProfile from 'components/character/CharacterProfile.vue';

@Options({
  components: {
    HtmlEditor,
    CharacterProfile,
  },
})
export default class PageEditCharacter extends Vue {
  private readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  private character = new CharacterProfileDto();
  private characterBackup = new CharacterProfileDto();
  private preview = false;
  private saving = false;

  private confirmRevert = false;

  async created() {
    const name = this.$store.state.user?.character.name || '';
    const server = this.$store.state.user?.character.server || '';
    this.characterBackup = await this.$api.getCharacterProfile(name, server);
    this.character = new CharacterProfileDto(this.characterBackup);
  }

  revert() {
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
            handler: () => this.viewCharacter()
          }
        ]
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
    const name = this.$store.state.user?.character.name || '';
    const server = this.$store.state.user?.character.server || '';
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

.page-edit-character__preview {
  margin-bottom: 24px;
}

.page-edit-character__age {
  width: 200px;
}

.page-edit-character__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  margin-bottom: 16px;
}

.page-edit-character__preview h6 {
  font-family: $header-font;
}
</style>
