<template>
  <section class="page-my-articles">
    <h2 class="with-subtitle">My Articles</h2>
    <div class="subtitle">for {{ $store.getters.character?.newsPseudonym || $store.getters.character?.name }}</div>
    <section class="page-my-articles__content">
      <p class="text-right">
        <q-btn color="secondary" label="Submit new article" icon="add" to="/create-article" />
      </p>
      <q-list bordered class="striped-list">
        <q-item v-for="article in articles" :key="article.id">
          <q-item-section>
            <q-item-label>{{ article.title }}</q-item-label>
            <q-item-label caption>{{ $display.articleStatuses[article.status] }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn v-if="article.canEdit" flat color="primary" label="Edit" :to="`/edit-article/${article.id}`" />
          </q-item-section>
        </q-item>
      </q-list>
    </section>
  </section>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { useRouter } from 'src/router';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $router = useRouter();
const $store = useStore();

async function load(): Promise<NewsArticleDto[]> {
  try {
    return await $api.news.getMyArticles($store.getters.characterId!);
  } catch (e) {
    notifyError(e);
    void $router.replace('/');
    throw e;
  }
}

@Options({
  name: 'PageMyArticles',
  async beforeRouteEnter(_, __, next) {
    const articles = await load();
    next((vm) => vm.setContent(articles));
  },
})
export default class PageMyArticles extends Vue {
  articles: NewsArticleDto[] = [];

  setContent(articles: NewsArticleDto[]) {
    this.articles = articles;
  }
}
</script>

<style lang="scss">
.page-my-articles__content {
  max-width: 700px;
  margin: auto;
}
</style>
