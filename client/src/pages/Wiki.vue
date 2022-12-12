<template>
  <q-page class="page-wiki">
    <template v-if="wikiPage.id">
      <section v-if="canEdit || canDelete" class="edit-bar">
        <router-link v-if="canEdit" :to="`/edit-wiki-page/${wikiPage.id}`">Wikibeitrag bearbeiten</router-link>
        <q-btn v-if="canDelete" flat color="negative" label="Wikibeitrag löschen" @click="onDeleteClick" />
      </section>
      <wiki-page-view :wikiPage="wikiPage" />
      <report-violation-section :pageType="PageType.WIKI_PAGE" :pageId="wikiPage.id" />
    </template>
  </q-page>
</template>

<script lang="ts">
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import { EditPermission } from '@app/shared/enums/edit-permission.enum';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import { unwikify } from '@common/common/wikilinks';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';
import WikiPageView from 'src/components/wiki/WikiPageView.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<WikiPageDto> {
  let title = params.title as string;

  if (!title) {
    void $router.replace('/');
    throw new Error();
  }

  title = unwikify(title);

  try {
    const wikiPage = await $api.wiki.getWikiPageByTitle(title);
    document.title = `${wikiPage.title} — Elpisgarten`;
    return wikiPage;
  } catch (e) {
    if (errors.getStatusCode(e) === 404) {
      notifyError('Wikibeitrag konnte nicht gefunden werden.');
      void $router.replace('/');
    } else {
      notifyError(e);
    }

    throw e;
  }
}

@Options({
  name: 'PageWiki',
  components: {
    WikiPageView,
    ReportViolationSection,
  },
  async beforeRouteEnter(to, _, next) {
    const wikiPage = await load(to.params);
    next((vm) => (vm as PageWiki).setContent(wikiPage));
  },
  async beforeRouteUpdate(to) {
    const wikiPage = await load(to.params);
    (this as PageWiki).setContent(wikiPage);
  },
})
export default class PageWiki extends Vue {
  readonly PageType = PageType;

  wikiPage: WikiPageDto = new WikiPageDto();

  setContent(wikiPage: WikiPageDto) {
    this.wikiPage = wikiPage;
  }

  get canEdit(): boolean {
    return (
      this.wikiPage.mine || (this.wikiPage.editPermission === EditPermission.EVERYONE && this.$store.getters.isTrusted)
    );
  }

	get canDelete(): boolean {
		return this.wikiPage.mine;
	}

  onDeleteClick() {
    this.$q
      .dialog({
        title: 'Löschbestätigung',
        message: `Möchtest du “${this.wikiPage.title}” wirklich löschen?`,
        ok: {
          label: 'Löschen',
          color: 'negative',
          flat: true,
        },
        cancel: 'Abbrechen',
      })
      .onOk(async () => {
        try {
          await this.$api.wiki.deleteWikiPage(this.wikiPage.id!);

          notifySuccess('Wikibeitrag gelöscht.');
          void this.$router.replace('/');
        } catch (e) {
          notifyError(e);
        }
      });
  }
}
</script>

<style lang="scss"></style>
