<template>
  <q-page class="page-edit-noticeboard-item">
    <template v-if="loaded">
      <h2>{{ noticeboardItem.id ? 'Aushang bearbeiten' : 'Neuen Aushang erstellen' }}</h2>
      <q-form @submit="onSubmit">
        <template v-if="!preview">
          <q-input
            v-model="noticeboardItem.title"
            label="Titel *"
            :rules="[
              $rules.required('Dieses Feld ist erforderlich.'),
            ]"
          />
          <div class="page-edit-noticeboard-item__type-label"><label>Gebiet:</label></div>
          <q-option-group
            v-model="noticeboardItem.location"
            :options="locationOptions"
          />
          <h6>Content *</h6>
          <html-editor v-model="noticeboardItem.content" />
          <template v-if="!noticeboardItem.id">
            <q-checkbox v-model="postOnDiscord" label="Auf Discord posten" />
            <div class="text-caption">Nur eingeschränkte Formatierung — fett, kursiv und Blockzitate — werden von Discord übernommen. Es ist nicht möglich den Discordpost nach der Erstellung des Aushangs zu bearbeiten.</div>
          </template>
        </template>
        <section v-else class="page-edit-noticeboard-item__preview">
          <noticeboard-item-view :noticeboard-item="noticeboardItem" :preview="true" />
        </section>
        <div class="page-edit-noticeboard-item__button-bar">
          <q-btn-toggle
            v-model="preview"
            :options="previewOptions"
            toggle-color="secondary"
          />
          <div class="page-edit-noticeboard-item__revert-submit">
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
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import { NoticeboardLocation } from '@app/shared/enums/noticeboard-location.enum';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import NoticeboardItemView from 'components/noticeboard/NoticeboardItemView.vue';
import { displayOptions } from 'src/boot/display';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

@Options({
  name: 'PageEditNoticeboardItem',
  components: {
    HtmlEditor,
    NoticeboardItemView,
  },
  beforeRouteEnter(to, _, next) {
    next((vm) => (vm as PageEditNoticeboardItem).load(to.params));
  },
  async beforeRouteUpdate(to) {
    await (this as PageEditNoticeboardItem).load(to.params);
  },
})
export default class PageEditNoticeboardItem extends Vue {
  readonly previewOptions = [
    { label: 'Bearbeitung', value: false },
    { label: 'Vorschau', value: true },
  ];

  readonly locationOptions = Object.values(NoticeboardLocation).map((location) => ({
    label: displayOptions.noticeboardLocations[location],
    value: location,
  }));

  noticeboardItem = new NoticeboardItemDto();
  noticeboardItemBackup = new NoticeboardItemDto();
  postOnDiscord = true;
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
      this.noticeboardItemBackup = await this.$api.noticeboard.getNoticeboardItem(id);
      this.loaded = true;
    } else {
      this.noticeboardItemBackup = new NoticeboardItemDto({
        mine: true,
        author: character.name,
        authorServer: character.server,
        createdAt: Date.now(),
        location: NoticeboardLocation.MULTIPLE_LOCATIONS,
        title: '',
        content: '',
      });
      this.loaded = true;
    }

    this.noticeboardItem = new NoticeboardItemDto(this.noticeboardItemBackup);
  }

  revert() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.noticeboardItem = new NoticeboardItemDto(this.noticeboardItemBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      if (!this.noticeboardItem.id) {
        const { id } = await this.$api.noticeboard.createNoticeboardItem(this.noticeboardItem, this.postOnDiscord);
        this.noticeboardItem.id = id;
        void this.$router.replace(`/edit-noticeboard-item/${id}`);
      } else {
        await this.$api.noticeboard.editNoticeboardItem(this.noticeboardItem);
      }

      this.noticeboardItemBackup = new NoticeboardItemDto(this.noticeboardItem);

      notifySuccess('Aushang gespeichert.', {
        label: 'Anschauen',
        color: 'white',
        handler: () => this.viewNoticeboardItem(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewNoticeboardItem() {
    if (this.noticeboardItem.id) {
      void this.$router.push(`/noticeboard/${this.noticeboardItem.id}`);
    }
  }
}
</script>

<style lang="scss">
.page-edit-noticeboard-item__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-noticeboard-item__preview {
  margin-bottom: 24px;
}

.page-edit-noticeboard-item__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-noticeboard-item__preview h6 {
  font-family: $header-font;
}

.page-edit-noticeboard-item__type-label {
  margin-top: 12px;
}
</style>
