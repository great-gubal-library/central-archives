<template>
  <q-page>
    <template v-if="loaded">
      <news-timeline :news="content.news" />
      <section>
        <h5>New stories</h5>
        <story-list :stories="content.newStories" />
      </section>
      <!--
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
        <h5><router-link to="/profiles">New profiles</router-link></h5>
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
import StoryList from 'src/components/stories/StoryList.vue';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';

@Options({
  components: {
    NewsTimeline,
    NewProfileList,
    StoryList,
  },
})
export default class PageIndex extends Vue {
  content: MainPageContentDto = {
    news: [],
    newsUpToDate: false,
    newProfiles: [],
    newStories: [],
  };

  loaded = false;

  async created() {
    try {
      this.content = await this.$api.getMainPageContent();
      this.loaded = true;

      if (!this.content.newsUpToDate) {
        // Update news later without blocking page load
        void this.updateNews();
      }
    } catch (e) {
      console.log(e);
      this.$q.notify({
				type: 'negative',
				message: 'Cannot retrieve main page'
			});
    }
  }

  private async updateNews() {
    this.content.news = await this.$api.getUpdatedNews();
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
