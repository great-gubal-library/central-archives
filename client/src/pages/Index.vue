<template>
  <q-page>
    <template v-if="loaded">
      <news-timeline :news="content.news" />
      <section>
        <h5><router-link to="/stories">New stories</router-link></h5>
        <story-list :stories="content.newStories" />
      </section>
      <section v-if="content.newArtwork.length > 0">
        <h5>New artwork</h5>
        <thumb-gallery :images="content.newArtwork" />
      </section>
      <!--
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
      <section v-if="content.newScreenshots.length > 0">
        <h5>New screenshots</h5>
        <thumb-gallery :images="content.newScreenshots" />
      </section>
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
import StoryList from 'components/stories/StoryList.vue';
import ThumbGallery from 'components/images/ThumbGallery.vue';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';

@Options({
  name: 'PageIndex',
  components: {
    NewsTimeline,
    NewProfileList,
    StoryList,
    ThumbGallery,
  },
})
export default class PageIndex extends Vue {
  content: MainPageContentDto = {
    news: [],
    newsUpToDate: false,
    newProfiles: [],
    newStories: [],
    newArtwork: [],
    newScreenshots: [],
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

</style>
