<template>
  <q-page>
    <latest-updates v-if="$region !== 'global'" :content="content" />
    <global-welcome v-else />
  </q-page>
</template>

<script lang="ts">
import GlobalWelcome from 'src/components/mainpage/GlobalWelcome.vue';
import LatestUpdates from 'src/components/mainpage/LatestUpdates.vue';
import { Options, Vue } from 'vue-class-component';
import { MainPageContentDto } from '../../../server/libs/shared/src/dto/main-page/main-page-content.dto';
import { notifyError } from '../common/notify';
import { useApi } from '../boot/axios';
import { useRegion } from '../boot/region';
import { SiteRegion } from '../../../server/libs/shared/src/enums/region.enum';

const $api = useApi();
const $region = useRegion();

async function load(): Promise<MainPageContentDto> {
  try {
    return await $api.getMainPageContent();
  } catch (e) {
    console.log(e);
    notifyError('Cannot retrieve main page');
    throw e;
  }
}

@Options({
  name: 'PageIndex',
  components: {
    LatestUpdates,
    GlobalWelcome,
  },
  async beforeRouteEnter(_, __, next) {
    if ($region !== SiteRegion.GLOBAL) {
      const content = await load();
      next(vm => (vm as PageIndex).setContent(content));
    } else {
      next();
    }
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
</style>
