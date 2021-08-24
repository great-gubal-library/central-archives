<template>
  <q-timeline>
      <q-timeline-entry heading>
        <div class="news-timeline__header">
          <a class="news-timeline__link" href="https://crescentmoonpublishing.com/the-daily-moogle/" target="_blank">News by The Daily Moogle</a>
          <div class="news-timeline__blurb">Kindly provided by <a class="news-timeline__link" href="https://crescentmoonpublishing.com/" target="_blank">Crescent Moon Publishing</a> — a Final Fantasy XIV fansite, by players, for players!</div>
        </div>
      </q-timeline-entry>
      <q-timeline-entry v-for="(entry, index) in news" :key="index" :subtitle="entry.author">
        <template v-slot:title>
           <a class="news-timeline__link" :href="entry.link" target="_blank">{{entry.title}}</a>
        </template>
        <div class="row justify-center">
          <div class="col" style="max-width: 300px; min-width: 200px">
            <q-img :src="entry.image" />
          </div>
          <div class="col" style="padding-left: 6px; min-width: 300px">
            {{entry.content}}
            <p><a :href="entry.link" target="_blank">Read more...</a></p>
          </div>
        </div>
      </q-timeline-entry>
    </q-timeline>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

export default class NewsTimeline extends Vue {
  readonly news = [
    {
      title: 'Travelers Be Warned, Coerthas Unsafe!',
      author: 'Kiyo Obinata',
      content: 'Lately the Coerthan lands held in the grip of perpetual winter have quite possibly become home to something more ominous than the biting cold. Indeed there are rumors that some lands in the Western Highlands might even be cursed!',
      image: 'https://crescentmoonpublishing.com/wp-content/uploads/2021/08/2021-08-18_21-30-33-156_Fairy-Gameplay.png',
      link: 'https://crescentmoonpublishing.com/travelers-be-warned-coerthas-unsafe/'
    },
    {
      title: 'Letters to the Editor',
      author: 'Jonahson Jameson',
      content: 'Editor Jonahson Jameson answers questions from our dear readers!',
      image: 'https://crescentmoonpublishing.com/wp-content/uploads/jet-engine-forms/24/2021/08/2021-04-29_20-12-29-921_Fairy_Gameplay.png',
      link: 'https://crescentmoonpublishing.com/letters-to-the-editor-2/'
    },
    {
      title: 'All things… Wes?',
      author: 'Wes, the Butterfly Man',
      content: 'The Butterfly Man answers two requests from our readers, including some questions about himself.',
      image: 'https://crescentmoonpublishing.com/wp-content/uploads/jet-engine-forms/18/2021/08/ffxiv_26062021_222206_967.png',
      link: 'https://crescentmoonpublishing.com/letters-to-the-editor-2/'
    }
  ];
}
</script>

<style lang="scss">
.news-timeline__header {
  text-align: center;
	font-size: 2.5rem;
}

.news-timeline__link {
  color: $blue-grey-8;
  text-decoration: inherit;
  border: inherit;
}

.news-timeline__blurb {
  font-family: $body-font;
  font-size: $body-font-size;
}

.news-timeline__link:hover {
  color: $blue-grey-6;
}
</style>