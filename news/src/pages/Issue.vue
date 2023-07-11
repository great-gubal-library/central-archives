<template>
  <section class="page-issue">
    <template v-if="issue">
      <mounted-teleport to="#header-date">{{ $display.formatDateEorzean(issue.publishedAt) }}</mounted-teleport>
      <article-view v-for="article in issue.articles" :article="article" :key="article.id" :class="{ 'single-article': issue.articles.length === 1 }" />
    </template>
    <template v-else>
      There are no news issues yet.
    </template>
  </section>
</template>

<script lang="ts">
import { NewsIssueDto } from '@app/shared/dto/news/news-issue.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import ArticleView from 'src/components/article/ArticleView.vue';
import MountedTeleport from 'src/components/common/MountedTeleport.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<NewsIssueDto|null> {
  const id = parseInt(params.id as string, 10);

		if (!id) {
			void $router.replace('/');
			throw new Error();
		}

  try {
    return await $api.news.getIssueById(id);
  } catch (e) {
    console.log(e);
    notifyError('Cannot retrieve main page');
    throw e;
  }
}

@Options({
  name: 'Pageissue',
  components: {
    ArticleView,
    MountedTeleport,
  },
  async beforeRouteEnter(to, _, next) {
    const content = await load(to.params);
    next(vm => (vm as PageIssue).setContent(content));
  },
  async beforeRouteUpdate(to) {
    const content = await load(to.params);
    (this as PageIssue).setContent(content);
  }
})
export default class PageIssue extends Vue {
  issue: NewsIssueDto|null = null;

  setContent(content: NewsIssueDto|null) {
    this.issue = content;
  }
}
</script>

<style lang="scss">
.page-issue {
  display: flex;
  margin-right: -20px;
}

.page-issue .single-article .article__content {
  columns: 2;
}

</style>
