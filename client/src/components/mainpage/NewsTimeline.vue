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
        <div class="col news-timeline__image-container">
          <q-img
            :src="entry.image"
            :initial-ratio="768 / 432"
            loading="eager"    
          >
            <div v-if="!entry.image" class="absolute-full text-subtitle2 flex flex-center">
              No picture
            </div>
          </q-img>
        </div>
        <div class="col" style="padding-left: 6px; min-width: 300px">
          {{ entry.content }}
          <p><a :href="entry.link" target="_blank">Read more...</a></p>
        </div>
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>

<script lang="ts" setup>
import { NewsDto } from '@app/shared/dto/news/news.dto';

defineProps({
  news: {
      type: Object as () => NewsDto[],
      required: true,
    },
})
</script>

<style lang="scss">
.news-timeline__header {
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
  background: #80a0c0;
}
</style>
