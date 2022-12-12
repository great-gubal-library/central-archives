<template>
  <q-page class="page-edit-wiki-page">
    <template v-if="loaded">
      <h2>{{ wikiPage.id ? 'Wikibeitrag bearbeiten' : 'Neuen Wikibeitrag erstellen' }}</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-input
            v-model="wikiPage.title"
            label="Titel *"
            :rules="[
              $rules.required('Dieses Feld ist erforderlich.'),
            ]"
          />
          <h6>Content *</h6>
          <html-editor v-model="wikiPage.content" />
          <section class="page-edit-wiki-page__license text-caption">
            By submitting this material, you agree to license it under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-ShareAlike (CC-BY-SA 4.0) <q-icon class="external-link-icon" name="launch" /></a> license. This means that everyone is free to share your material and create derivative works, as long as they properly credit you and release their modifications under the same license.
          </section>
        </template>
        <section v-else class="page-edit-wiki-page__preview">
          <wiki-page-view :wikiPage="wikiPage" :preview="true" />
        </section>
        <div class="page-edit-wiki-page__button-bar">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-wiki-page__revert-submit">
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
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import { EditPermission } from '@app/shared/enums/edit-permission.enum';
import { StoryType } from '@app/shared/enums/story-type.enum';
import { wikify } from '@common/common/wikilinks';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import { displayOptions } from 'src/boot/display';
import { notifyError, notifySuccess } from 'src/common/notify';
import WikiPageView from 'src/components/wiki/WikiPageView.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

@Options({
  name: 'PageEditWikiPage',
  components: {
    HtmlEditor,
    WikiPageView,
  },
  beforeRouteEnter(to, _, next) {
    next((vm) => (vm as PageEditWikiPage).load(to.params));
  },
  async beforeRouteUpdate(to) {
    await (this as PageEditWikiPage).load(to.params);
  },
})
export default class PageEditWikiPage extends Vue {
  readonly previewOptions = [
    { label: 'Bearbeitung', value: false },
    { label: 'Vorschau', value: true },
  ];

  readonly typeOptions = Object.values(StoryType).map((storyType) => ({
    label: displayOptions.storyTypes[storyType],
    value: storyType,
  }));

  wikiPage = new WikiPageDto();
  wikiPageBackup = new WikiPageDto();
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
      this.wikiPageBackup = await this.$api.wiki.getWikiPageById(id);
      this.loaded = true;
    } else {
      this.wikiPageBackup = new WikiPageDto({
        mine: true,
        author: character.name,
        authorServer: character.server,
        createdAt: Date.now(),
        editPermission: EditPermission.ME,
        title: '',
        content: '',
      });
      this.loaded = true;
    }

    this.wikiPage = new WikiPageDto(this.wikiPageBackup);
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.wikiPage = new WikiPageDto(this.wikiPageBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      if (!this.wikiPage.id) {
        const { id } = await this.$api.wiki.createWikiPage(this.wikiPage);
        this.wikiPage.id = id;
        void this.$router.replace(`/edit-wiki-page/${id}`);
      } else {
        await this.$api.wiki.editWikiPage(this.wikiPage);
      }

      this.wikiPageBackup = new WikiPageDto(this.wikiPage);

      notifySuccess('Wikibeitrag gespeichert.', {
        label: 'Anschauen',
        color: 'white',
        handler: () => this.viewWikiPage(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewWikiPage() {
    if (this.wikiPage.id) {
      void this.$router.push(`/wiki/${encodeURIComponent(wikify(this.wikiPage.title))}`);
    }
  }
}
</script>

<style lang="scss">
.page-edit-wiki-page__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-wiki-page__preview {
  margin-bottom: 24px;
}

.page-edit-wiki-page__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-wiki-page__preview h6 {
  font-family: $header-font;
}

.page-edit-wiki-page__license {
  margin-top: 12px;
}
</style>
