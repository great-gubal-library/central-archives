<template>
  <q-page>
    <template v-if="content">
      <news-timeline :news="content.news" />
      <!--
      <section>
        <h5>Latest stories</h5>
        <q-markup-table dense>
          <tbody class="index__table">
            <tr v-for="(story, index) in stories" :key="index">
              <td>{{story.title}}</td>
              <td>{{story.author}}</td>
              <td>{{story.date}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </section>
      <section>
        <h5>New artwork</h5>
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
        <h5>Noticeboard</h5>
        <q-markup-table dense>
          <tbody class="index__table">
            <tr v-for="(adventure, index) in noticeboard" :key="index">
              <td>
                <div>{{adventure.title}}</div>
                <div style="margin-top: -8px"><small style="color: #888">{{adventure.author}}</small></div>
              </td>
              <td>{{adventure.location}}</td>
              <td>{{adventure.date}}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </section>
      -->
      <section>
        <h5>New profiles</h5>
        <new-profile-list :profiles="content.newProfiles" />
        <!--
        <div class="index__profile-fc-col">
          <h5>New free companies</h5>
          <q-markup-table dense>
            <tbody class="index__table">
              <tr v-for="(fc, index) in newFCs" :key="index">
                <td>{{fc.name}}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
        -->
      </section>
      <!--
      <section>
        <h5>New screenshots</h5>
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
      -->
    </template>
    <div class="text-center" v-else>
      <q-spinner size="lg" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import NewsTimeline from 'components/mainpage/NewsTimeline.vue';
import NewProfileList from 'components/mainpage/NewProfileList.vue';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';

@Options({
  components: {
    NewsTimeline,
    NewProfileList,
  },
})
export default class PageIndex extends Vue {
  readonly stories = [
    {
      title: 'Lurkers in the Grotto',
      author: 'Vielle Janlenoux',
      date: '1 hour ago',
    },
    {
      title: 'Dressed to Call',
      author: 'Vielle Janlenoux',
      date: '2 hours ago',
    },
    {
      title: 'On to Summerford',
      author: 'Vielle Janlenoux',
      date: '3 hours ago',
    },
    { title: 'Close to Home', author: 'Vielle Janlenoux', date: '4 hours ago' },
  ];

  readonly noticeboard = [
    {
      title: 'Call to Adventure',
      author: 'Vielle Janlenoux',
      location: 'Limsa Lominsa',
      date: '1 hour ago',
    },
    {
      title: 'Tavern Opened',
      author: 'Vielle Janlenoux',
      location: 'Gridania',
      date: '2 hours ago',
    },
    {
      title: 'Travel Advisory',
      author: 'Vielle Janlenoux',
      location: "Ul'dah",
      date: '3 hours ago',
    },
    {
      title: 'Job Offer',
      author: 'Vielle Janlenoux',
      location: 'Multiple',
      date: '4 hours ago',
    },
  ];

  readonly newFCs = [
    { name: "Wanderer' Alliance" },
    { name: 'Unsung Tide' },
    { name: 'Crossed Paths' },
    { name: 'The Silver Mark' },
  ];

  content: MainPageContentDto | null = null;

  async created() {
    try {
      this.content = await this.$api.getMainPageContent();
    } catch (e) {
      console.log(e);
      this.$q.notify({
				type: 'negative',
				message: 'Cannot retrieve main page'
			});
    }
  }
}
</script>

<style lang="scss">
.index__table {
  background: $blue-1;
}

.index__table tr:nth-child(even) {
  background: rgba($blue-2, 0.4);
}

tbody.index__table td {
  font-size: 1em;
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
