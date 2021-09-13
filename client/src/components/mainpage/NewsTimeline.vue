<template>
  <q-timeline>
    <q-timeline-entry heading tag="div">
      <h2 class="news-timeline__header">
        <a
          class="news-timeline__link"
          href="https://crescentmoonpublishing.com/the-daily-moogle/"
          target="_blank"
          >News by The Daily Moogle</a
        >
      </h2>
      <div class="news-timeline__blurb">
        Kindly provided by
        <a
          class="news-timeline__link"
          href="https://crescentmoonpublishing.com/"
          target="_blank"
          >Crescent Moon Publishing</a
        >
        — a Final Fantasy XIV fansite, by players, for players!
      </div>
    </q-timeline-entry>
    <q-timeline-entry
      v-for="(entry, index) in news"
      :key="index"
      :subtitle="entry.author"
    >
      <template v-slot:title>
        <a class="news-timeline__link" :href="entry.link" target="_blank">{{
          entry.title
        }}</a>
      </template>
      <div class="row justify-center">
        <div class="col" style="max-width: 300px; min-width: 200px">
          <q-img :src="entry.image" />
        </div>
        <div class="col" style="padding-left: 6px; min-width: 300px">
          {{ entry.content }}
          <p><a :href="entry.link" target="_blank">Read more...</a></p>
        </div>
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { NewsDto } from '@app/shared/dto/news/news.dto';

export default class NewsTimeline extends Vue {
  news: NewsDto[] = [];

  async created() {
    this.news = await this.$api.getNews();
  }
}
</script>

<style lang="scss">
.news-timeline__header {
  margin-bottom: 0;
}

.news-timeline__link {
  color: $blue-grey-8;
  text-decoration: inherit;
  border: inherit;
}

.news-timeline__blurb {
  text-align: center;
}

.news-timeline__link:hover {
  color: $blue-grey-6;
}
</style>
