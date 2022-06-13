<template>
  <section class="page-article">
    <template v-if="article.id">
      <mounted-teleport to="#header-date">{{ $display.formatDateEorzean(article.publishedAt) }}</mounted-teleport>
      <article-view :article="article" />
    </template>
  </section>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import { useApi } from 'src/boot/axios';
import { useRouter } from 'src/router';
import { notifyError } from '@common/common/notify';
import ArticleView from 'src/components/article/ArticleView.vue';
import MountedTeleport from 'src/components/common/MountedTeleport.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<NewsArticleDto> {
  const slug = params.slug as string;

		if (!slug) {
			void $router.replace('/');
			throw new Error();
		}

  try {
    return await $api.news.getArticleBySlug(slug);
  } catch (e) {
    console.log(e);
    notifyError('Cannot retrieve main page');
    throw e;
  }
}

@Options({
  name: 'PageArticle',
  components: {
    ArticleView,
    MountedTeleport,
  },
  async beforeRouteEnter(to, _, next) {
    const content = await load(to.params);
    next(vm => (vm as PageArticle).setContent(content));
  },
  async beforeRouteUpdate(to) {
    const content = await load(to.params);
    (this as PageArticle).setContent(content);
  }
})
export default class PageArticle extends Vue {
  article: NewsArticleDto = {} as unknown as NewsArticleDto;

  setContent(content: NewsArticleDto) {
    this.article = content;
  }
}
</script>

<style lang="scss">
.page-article {
  display: flex;
  margin-right: -20px;
}

.page-article .article__content {
  columns: 2;
}
</style>
