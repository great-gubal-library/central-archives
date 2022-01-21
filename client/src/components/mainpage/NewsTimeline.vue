<template>
  <q-timeline>
    <q-timeline-entry heading tag="div">
      <h4 class="news-timeline__header">
        News by
        <a
          class="news-timeline__link"
          href="https://crescentmoonpublishing.com/the-daily-moogle/"
          target="_blank"
          >The Daily Moogle</a
        > and <a
          class="news-timeline__link"
          href="https://news.kryst.company/"
          target="_blank"
          >Limsa Insider</a
        >
      </h4>
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
        <div class="col news-timeline__image-container">
          <q-img
            v-if="entry.image"
            :src="entry.image"
            :initial-ratio="750 / 422"
            loading="eager"    
          />
          <q-img
            v-else
            src="~/assets/news_thumbnail.jpg"
            :initial-ratio="750 / 422"
            loading="eager"    
          />
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
import { prop, Options, Vue } from 'vue-class-component';
import { NewsDto } from '@app/shared/dto/news/news.dto';

class Props {
  news = prop<NewsDto[]>({
    required: true,
  });
}

@Options({
  name: 'NewsTimeline',
})
export default class NewsTimeline extends Vue.with(Props) {}
</script>

<style lang="scss">
.news-timeline__header {
  margin-top: 0;
  margin-bottom: 0;
}

.news-timeline__link {
  text-decoration: inherit;
  border: inherit;
}

.news-timeline__blurb {
  text-align: center;
}

.row > .news-timeline__image-container {
  max-width: 250px;
  min-width: 175px;
}

.news-timeline__image-container .q-img {
  max-height: 150px;
  background: #80a0c0;
}
</style>
