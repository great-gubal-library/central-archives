<template>
  <section class="page-submitted">
    <h2>Submitted Articles</h2>
    <section class="page-submitted__content">
      <article-list :articles="articles" />
    </section>
  </section>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import ArticleList from 'src/components/article/ArticleList.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $router = useRouter();

async function load(): Promise<NewsArticleDto[]> {
  try {
    return await $api.news.getSubmittedArticles();
  } catch (e) {
    notifyError(e);
    void $router.replace('/');
    throw e;
  }
}

@Options({
  name: 'PageSubmitted',
  components: {
    ArticleList,
  },
  async beforeRouteEnter(_, __, next) {
    const articles = await load();
    next((vm) => (vm as PageSubmitted).setContent(articles));
  },
})
export default class PageSubmitted extends Vue {
  articles: NewsArticleDto[] = [];

  setContent(articles: NewsArticleDto[]) {
    this.articles = articles;
  }
}
</script>

<style lang="scss">
.page-submitted__content {
  max-width: 700px;
  margin: auto;
}
</style>
