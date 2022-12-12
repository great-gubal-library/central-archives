<template>
  <q-page>
    <news-timeline :news="content.news" />
    <section>
      <h5><router-link to="/stories">Neue Geschichten</router-link></h5>
      <story-list :stories="content.newStories" />
    </section>
    <section v-if="content.newArtwork.length > 0">
      <h5><router-link to="/gallery/artwork">Neue Kunstwerke</router-link></h5>
      <thumb-gallery :images="content.newArtwork" />
    </section>
    <section>
      <h5><router-link to="/noticeboard">Neue Aushänge</router-link></h5>
      <noticeboard-item-list :noticeboardItems="content.newNoticeboardItems" />
    </section>
    <section class="page-index__profiles-and-fcs">
      <section>
        <h5><router-link to="/profiles">Neue Charaktere</router-link></h5>
        <character-name-list :profiles="content.newProfiles" />
      </section>
      <section v-if="content.newFreeCompanies.length > 0">
        <h5><router-link to="/free-companies">Neue Freie Gesellschaften</router-link></h5>
        <free-company-name-list :free-companies="content.newFreeCompanies" />
      </section>
    </section>
    <section class="page-index__profiles-and-fcs">
      <section>
        <h5><router-link to="/venues">Neue Treffpunkte</router-link></h5>
        <venue-list :venues="content.newVenues" />
      </section>
      <section>
        <h5><router-link to="/communities">Neue Communities</router-link></h5>
        <community-list :communities="content.newCommunities" />
      </section>
    </section>
    <section v-if="content.newScreenshots.length > 0">
      <h5><router-link to="/gallery/screenshot">Neue Screenshots</router-link></h5>
      <thumb-gallery :images="content.newScreenshots" />
    </section>
  </q-page>
</template>

<script lang="ts">
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import ThumbGallery from 'components/images/ThumbGallery.vue';
import NewsTimeline from 'components/mainpage/NewsTimeline.vue';
import NoticeboardItemList from 'components/noticeboard/NoticeboardItemList.vue';
import StoryList from 'components/stories/StoryList.vue';
import VenueList from 'components/venues/VenueList.vue';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import CommunityList from 'src/components/communities/CommunityList.vue';
import FreeCompanyNameList from 'src/components/free-company/FreeCompanyNameList.vue';
import CharacterNameList from 'src/components/mainpage/CharacterNameList.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

async function load(): Promise<MainPageContentDto> {
  try {
    return await $api.getMainPageContent();
  } catch (e) {
    console.log(e);
    notifyError('Hauptseite konnte nicht abgerufen werden');
    throw e;
  }
}

@Options({
  name: 'PageIndex',
  components: {
    NewsTimeline,
    CharacterNameList,
    FreeCompanyNameList,
    StoryList,
    NoticeboardItemList,
    VenueList,
    CommunityList,
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
    newFreeCompanies: [],
    newCommunities: [],
    newVenues: [],
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
.page-index__profiles-and-fcs {
  display: flex;
  flex-wrap: wrap;
  margin-right: -12px;
}

.page-index__profiles-and-fcs > section {
  flex-basis: 0;
  flex-grow: 1;
  min-width: 300px;
  padding-right: 12px;
}
</style>
