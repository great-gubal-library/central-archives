<template>
  <q-page>
    <news-timeline :news="content.news" />
    <section>
      <h5><router-link to="/stories">New stories</router-link></h5>
      <story-list :stories="content.newStories" />
    </section>
    <section v-if="content.newArtwork.length > 0">
      <h5><router-link to="/gallery/artwork">New artwork</router-link></h5>
      <thumb-gallery :images="content.newArtwork" />
    </section>
    <section>
      <h5><router-link to="/noticeboard">Noticeboard</router-link></h5>
      <noticeboard-item-list :noticeboardItems="content.newNoticeboardItems" />
    </section>
    <section>
      <h5><router-link to="/profiles">New profiles</router-link></h5>
      <character-name-list :profiles="content.newProfiles" />
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
      <h5><router-link to="/gallery/screenshot">New screenshots</router-link></h5>
      <thumb-gallery :images="content.newScreenshots" />
    </section>
  </q-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import NewsTimeline from 'components/mainpage/NewsTimeline.vue';
import CharacterNameList from 'src/components/mainpage/CharacterNameList.vue';
import StoryList from 'components/stories/StoryList.vue';
import NoticeboardItemList from 'components/noticeboard/NoticeboardItemList.vue';
import ThumbGallery from 'components/images/ThumbGallery.vue';
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import { useApi } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const $api = useApi();
const $q = useQuasar();

async function load(): Promise<MainPageContentDto> {
  try {
    return await $api.getMainPageContent();
  } catch (e) {
    console.log(e);
    $q.notify({
      type: 'negative',
      message: 'Cannot retrieve main page'
    });
    throw e;
  }
}

@Options({
  name: 'PageIndex',
  components: {
    NewsTimeline,
    CharacterNameList,
    StoryList,
    NoticeboardItemList,
    ThumbGallery,
  },
  async beforeRouteEnter(_, __, next) {
    const content = await load();
    next(vm => (vm as PageIndex).setContent(content));
  }
})
export default class PageIndex extends Vue {
  content: MainPageContentDto = {
    news: [],
    newsUpToDate: false,
    newProfiles: [],
    newStories: [],
    newArtwork: [],
    newScreenshots: [],
    newNoticeboardItems: [],
  };

  loaded = false;

  setContent(content: MainPageContentDto) {
    this.content = content;

    if (!this.content.newsUpToDate) {
      // Update news later without blocking page load
      void this.updateNews();
    }
  }

  async updateNews() {
    this.content.news = await this.$api.getUpdatedNews();
  }
}
</script>

<style lang="scss">

</style>
