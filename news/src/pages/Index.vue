<template>
  <section class="page-index">
    <template v-if="issue">
      <mounted-teleport to="#header-date">{{ $display.formatDateEorzean(issue.publishedAt) }}</mounted-teleport>
      <article-view v-for="article in issue.articles" :article="article" :key="article.id" />
    </template>
    <template v-else>
      There are no news issues yet.
    </template>
  </section>
</template>

<script lang="ts">
import { NewsIssueDto } from '@app/shared/dto/news/news-issue.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from '@common/common/notify';
import ArticleView from 'src/components/article/ArticleView.vue';
import MountedTeleport from 'src/components/common/MountedTeleport.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

async function load(): Promise<NewsIssueDto|null> {
  try {
    return await $api.news.getLatestIssue();
  } catch (e) {
    console.log(e);
    notifyError('Cannot retrieve main page');
    throw e;
  }
}

@Options({
  name: 'PageIndex',
  components: {
    ArticleView,
    MountedTeleport,
  },
  async beforeRouteEnter(_, __, next) {
    const content = await load();
    next(vm => (vm as PageIndex).setContent(content));
  }
})
export default class PageIndex extends Vue {
  issue: NewsIssueDto|null = null;

  setContent(content: NewsIssueDto|null) {
    this.issue = content;
  }
}
</script>

<style lang="scss">
.page-index {
  display: flex;
  margin-right: -20px;
}
</style>
