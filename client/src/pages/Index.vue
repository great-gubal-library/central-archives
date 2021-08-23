<template>
  <q-page>
    <q-timeline>
      <q-timeline-entry heading>
        News by The Daily Moogle
      </q-timeline-entry>
      <q-timeline-entry v-for="(entry, index) in news" :key="index" :subtitle="entry.author">
        <template v-slot:title>
           <a :href="entry.link" target="_blank">{{entry.title}}</a>
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
    <section>
      <h5 style="margin: 1rem">Latest adventures</h5>
      <q-markup-table dense>
        <tbody class="index__table">
          <tr v-for="(adventure, index) in adventures" :key="index">
            <td>{{adventure.title}}</td>
            <td>{{adventure.author}}</td>
            <td>{{adventure.date}}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </section>
    <section>
      <h5 style="margin: 1rem">New artwork</h5>
      <div class="row">
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
      </div>
      <div class="row">
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image">
            </div>
          </q-responsive>
        </div>
      </div>
    </section>
    <section>
      <h5 style="margin: 1rem">Noticeboard</h5>
      <q-markup-table dense>
        <tbody class="index__table">
          <tr v-for="(adventure, index) in noticeboard" :key="index">
            <td>{{adventure.title}}<br/><small style="color: #888">{{adventure.author}}</small></td>
            <td>{{adventure.location}}</td>
            <td>{{adventure.date}}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </section>
    <section class="row">
      <div class="index__profile-fc-col">
        <h5 style="margin: 1rem">New profiles</h5>
        <q-markup-table dense>
          <tbody class="index__table">
            <tr v-for="(character, index) in newProfiles" :key="index">
              <td>{{character.name}}</td>
              <td>{{character.race}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
      <div class="index__profile-fc-col">
        <h5 style="margin: 1rem">New free companies</h5>
        <q-markup-table dense>
          <tbody class="index__table">
            <tr v-for="(fc, index) in newFCs" :key="index">
              <td>{{fc.name}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </section>
    <section>
      <h5 style="margin: 1rem">New snapshots</h5>
      <div class="row">
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
      </div>
      <div class="row">
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
        <div class="col index__image-wrapper">
          <q-responsive :ratio="1/1">
            <div class="index__image index__snapshot">
            </div>
          </q-responsive>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'

@Options({
  components: {  }
})
export default class PageIndex extends Vue {
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
      content: 'Lately the Coerthan lands held in the grip of perpetual winter have quite possibly become home to something more ominous than the biting cold. Indeed there are rumors that some lands in the Western Highlands might even be cursed!',
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

  readonly adventures = [
    { title: 'Lurkers in the Grotto', author: 'Vielle Janlenoux', date: '1 hour ago' },
    { title: 'Dressed to Call', author: 'Vielle Janlenoux', date: '2 hours ago' },
    { title: 'On to Summerford', author: 'Vielle Janlenoux', date: '3 hours ago' },
    { title: 'Close to Home', author: 'Vielle Janlenoux', date: '4 hours ago' },
  ];

  readonly noticeboard = [
    { title: 'Call to Adventure', author: 'Vielle Janlenoux', location: 'Limsa Lominsa', date: '1 hour ago' },
    { title: 'Tavern Opened', author: 'Vielle Janlenoux', location: 'Gridania', date: '2 hours ago' },
    { title: 'Travel Advisory', author: 'Vielle Janlenoux', location: 'Ul\'dah', date: '3 hours ago' },
    { title: 'Job Offer', author: 'Vielle Janlenoux', location: 'Multiple', date: '4 hours ago' },
  ];

  readonly newProfiles = [
    { name: 'Minfilia Warde', race: 'Hyur' },
    { name: 'Alphinaud Leveilleur', race: 'Elezen' },
    { name: 'Y\'shtola Rhul', race: 'Miqo\'te' },
    { name: 'Papalymo Totolymo', race: 'Lalafell' },
  ]

  readonly newFCs = [
    { name: 'Wanderer\' Alliance' },
    { name: 'Unsung Tide' },
    { name: 'Crossed Paths' },
    { name: 'The Silver Mark' },
  ];
};
</script>

<style lang="scss">
.index__table {
  background: $brown-1;
}

.index__table tr:nth-child(even) {
  background: rgba($brown-2, 0.5);
}

tbody.index__table td {
  font-size: 1rem;
}

.index__image-wrapper {
  padding-right: 12px;
  padding-bottom: 12px;
}

.index__image-wrapper:last-child {
  padding-right: 0;
}

.index__image {
  background: #a0a0a0;
}

.index__image.index__snapshot {
  background: #80a0c0;
}

.index__profile-fc-col {
  flex-basis: 0;
  flex-grow: 1;
  min-width: 350px;
}

.index__profile-fc-col:first-child {
  margin-right: 12px;
}
</style>