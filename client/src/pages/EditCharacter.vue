<template>
  <q-page class="page-edit-character">
    <template v-if="character.id">
      <h2>Edit Profile</h2>
      <q-form @submit="onSubmit">
        <section class="page-edit-character__form-controls">
          <q-input
            :model-value="character.name"
            label="Name"
            readonly
          />
          <q-input
            :model-value="$display.races[character.race]"
            label="Race"
            readonly
          />
          <p></p>
          <p>All fields are optional.</p>
          <h6>Names</h6>
          <q-input
            v-model="character.title"
            label="Title"
          />
          <q-input
            v-model="character.nickname"
            label="Nickname"
          />
          <h6>Biography</h6>
          <q-input
            v-model="character.occupation"
            label="Occupation"
          />
          <q-input
            v-model="character.age"
            style="width: 200px"
            label="Age"
          />
          <q-input
            v-model="character.birthplace"
            label="Birthplace"
          />
          <q-input
            v-model="character.residence"
            label="Residence"
          />
          <h6>Personality</h6>
          <q-input
            v-model="character.motto"
            label="Motto"
          />
          <q-input
            v-model="character.loves"
            label="Loves"
          />
          <q-input
            v-model="character.hates"
            label="Hates"
          />
          <q-input
            v-model="character.motivation"
            label="Motivation"
          />
        </section>
        <h6>Appearance</h6>
        <html-editor
          v-model="character.appearance"
          style="height: 400px"
        />
        <h6>Background</h6>
        <html-editor
          v-model="character.background"
          style="height: 400px"
        />
        <div class="page-edit-character__button-bar">
          <q-btn
            label="Save changes"
            type="submit"
            color="primary"
          />
        </div>
        <q-inner-loading :showing="loading" />
      </q-form>
    </template>
    <q-spinner v-else />
  </q-page>
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import errors from '@app/shared/errors';
import { Options, Vue } from 'vue-class-component';
import HtmlEditor from '../components/common/HtmlEditor.vue';

@Options({
  components: {
    HtmlEditor
  }
})
export default class PageEditCharacter extends Vue {
  private character: CharacterProfileDto = new CharacterProfileDto();
  private saving = false;

  async created() {
		const name = this.$store.state.user?.character.name || '';
		const server = this.$store.state.user?.character.server || '';
    this.character = await this.$api.getCharacterProfile(name, server);
  }

  async onSubmit() {
    this.saving = true;

    try {
      await this.$api.saveCharacter(this.character);

      this.$q.notify({
        message: 'Character saved.',
        type: 'positive'
      });
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative'
      });
    } finally {
      this.saving = false;
    }
  }
}
</script>

<style lang="scss">
.page-edit-character__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-character__button-bar {
  margin-top: 8px;
  margin-bottom: 16px;
}
</style>
