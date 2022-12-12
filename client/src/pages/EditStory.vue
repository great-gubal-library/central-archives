<template>
  <q-page class="page-edit-story">
    <template v-if="loaded">
      <h2>{{ story.id ? 'Geschichte bearbeiten' : 'Neue Geschichte erstellen' }}</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-input
            v-model="story.title"
            label="Titel *"
            :rules="[
              $rules.required('Dieses Feld ist erforderlich.'),
            ]"
          />
          <div class="page-edit-story__type-label"><label>Art der Geschichte:</label></div>
          <q-option-group
            v-model="story.type"
            label="type"
            :options="typeOptions"
          />
          <q-input
            :model-value="tags"
            @update:model-value="onTagsChanged"
            label="Schlagworte (mit Komma getrennt)"
          />
          <h6>Inhalt *</h6>
          <html-editor v-model="story.content" />
        </template>
        <section v-else class="page-edit-story__preview">
          <story-view :story="story" :preview="true" />
        </section>
        <div class="page-edit-story__button-bar">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-story__revert-submit">
            <q-btn label="Zurücksetzen" color="secondary" @click="revert" />&nbsp;
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
          <span class="q-ml-sm"
            >Möchtest du die ungespeicherten Änderungen auf die letzte gespeicherte Version zurücksetzen?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Bearbeitung fortsetzen" color="secondary" v-close-popup />
          <q-btn
            flat
            label="Zurücksetzen"
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
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { StoryType } from '@app/shared/enums/story-type.enum';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import StoryView from 'components/stories/StoryView.vue';
import { displayOptions } from 'src/boot/display';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

@Options({
  components: {
    HtmlEditor,
    StoryView,
  },
  beforeRouteEnter(to, _, next) {
    next((vm) => (vm as PageEditStory).load(to.params));
  },
  async beforeRouteUpdate(to) {
    await (this as PageEditStory).load(to.params);
  },
})
export default class PageEditStory extends Vue {
  readonly previewOptions = [
    { label: 'Bearbeitung', value: false },
    { label: 'Vorschau', value: true },
  ];

  readonly typeOptions = Object.values(StoryType).map((storyType) => ({
    label: displayOptions.storyTypes[storyType],
    value: storyType,
  }));

  story = new StoryDto();
  storyBackup = new StoryDto();
  preview = false;
  loaded = false;
  saving = false;

  confirmRevert = false;

  private async load(params: RouteParams) {
    const id = parseInt(params.id as string, 10);
    const character = this.$store.getters.character;

    if (!character) {
      void this.$router.push('/');
      return;
    }

    if (id) {
      this.loaded = false;
      this.storyBackup = await this.$api.stories.getStory(id);
      this.loaded = true;
    } else {
      this.storyBackup = new StoryDto({
        mine: true,
        author: character.name,
        authorServer: character.server,
        createdAt: Date.now(),
        type: StoryType.PUBLISHED_WORK,
        title: '',
        content: '',
        tags: [],
      });
      this.loaded = true;
    }

    this.story = new StoryDto(this.storyBackup);
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.story = new StoryDto(this.storyBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      if (!this.story.id) {
        const { id } = await this.$api.stories.createStory(this.story);
        this.story.id = id;
        void this.$router.replace(`/edit-story/${id}`);
      } else {
        await this.$api.stories.editStory(this.story);
      }

      this.storyBackup = new StoryDto(this.story);

      notifySuccess('Story saved.', {
        label: 'View',
        color: 'white',
        handler: () => this.viewStory(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewStory() {
    if (this.story.id) {
      void this.$router.push(`/story/${this.story.id}`);
    }
  }

  get tags() {
    return this.story.tags.join(', ');
  }

  onTagsChanged(newTags: string) {
    this.story.tags = newTags.split(/,\s*/).map((tag) => tag.trim()).filter(tag => tag !== '');
  }
}
</script>

<style lang="scss">
.page-edit-story__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-story__preview {
  margin-bottom: 24px;
}

.page-edit-story__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-story__preview h6 {
  font-family: $header-font;
}

.page-edit-story__type-label {
  margin-top: 12px;
}
</style>
