<template>
  <q-list bordered class="article-list striped-list">
    <q-item v-for="article in articles" :key="article.id">
      <q-item-section>
        <q-item-label>{{ article.title }}</q-item-label>
        <q-item-label caption>
          {{ $display.articleStatuses[article.status] }}
          <template v-if="article.status === NewsStatus.PUBLISHED">
            on {{ $display.formatDateEorzean(article.publishedAt) }}
          </template>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn v-if="article.canEdit" flat color="primary" label="Edit" :to="`/edit-article/${article.id}`" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { NewsArticleDto } from '@app/shared/dto/news/news-article.dto';
import { NewsStatus } from '@app/shared/enums/news-status.enum';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
	articles = prop<NewsArticleDto[]>({
		required: true,
	});
}

@Options({
  name: 'ArticleList',
})
export default class ArticleList extends Vue.with(Props) {
  readonly NewsStatus = NewsStatus;
}
</script>

<style lang="scss">
</style>
