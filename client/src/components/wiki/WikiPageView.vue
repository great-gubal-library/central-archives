<template>
  <div class="wiki-page-view">
    <h2 class="wiki-page-view__title regular-header-font">{{ wikiPage.title }}</h2>
    <section class="text-caption wiki-page-view__subtitle row">
      <div class="wiki-page-view__posted-by">
      Posted by <router-link :to="authorLink">{{ wikiPage.author }}</router-link> on {{ date }}
      </div>
      <div class="wiki-page-view__type">
        Available under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC-BY-SA 4.0 license <q-icon class="external-link-icon" name="launch" /></a>
      </div>
    </section>
    <hr />
    <html-viewer
      class="wiki-page-view__content"
      :content="wikiPage.content"
    />
  </div>
</template>

<script lang="ts">
import { WikiPageDto } from '@app/shared/dto/wiki/wiki-page.dto';
import { Options, prop, Vue } from 'vue-class-component';
import HtmlViewer from '../common/HtmlViewer.vue';

class Props {
  wikiPage = prop<WikiPageDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'WikiPageView',
  components: {
    HtmlViewer,
  }
})
export default class WikiPageView extends Vue.with(Props) {
  get date(): string {
    return this.$display.formatDate(this.wikiPage.createdAt);
  }

  get authorLink(): string {
    const server = this.wikiPage.authorServer;
    const character = this.wikiPage.author.replace(/ /g, '_');
    return `/${server}/${character}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.wiki-page-view__subtitle {
  color: $grey-8;
}

.wiki-page-view__posted-by {
  flex-grow: 1;
  padding-right: 16px;
}

.wiki-page-view__type {
  flex-grow: 0;
  white-space: nowrap;
}
</style>
