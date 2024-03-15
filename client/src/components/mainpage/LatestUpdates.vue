<template>
  <section>
    <h2>Latest Updates</h2>
    <section>
      <rss-section-header feed-link="/api/feed/stories.rss">
        <router-link to="/stories">New stories</router-link>
      </rss-section-header>
      <story-list :stories="content.newStories" />
    </section>
    <section v-if="content.newArtwork.length > 0">
      <rss-section-header feed-link="/api/feed/artwork.rss">
        <router-link to="/gallery/artwork">New artwork</router-link>
      </rss-section-header>
      <thumb-gallery :images="content.newArtwork" />
    </section>
    <section>
      <h5><router-link to="/noticeboard">Noticeboard</router-link></h5>
      <noticeboard-item-list :noticeboardItems="content.newNoticeboardItems" />
    </section>
    <section class="latest-updates__profiles-and-fcs">
      <section>
        <h5><router-link to="/profiles">New profiles</router-link></h5>
        <character-name-list :profiles="content.newProfiles" />
      </section>
      <section v-if="content.newFreeCompanies.length > 0">
        <h5><router-link to="/free-companies">New Free Companies</router-link></h5>
        <free-company-name-list :free-companies="content.newFreeCompanies" />
      </section>
    </section>
    <section class="latest-updates__profiles-and-fcs">
      <section>
        <h5><router-link to="/venues">New Venues</router-link></h5>
        <venue-list :venues="content.newVenues" />
      </section>
      <section>
        <h5><router-link to="/communities">New Communities</router-link></h5>
        <community-list :communities="content.newCommunities" />
      </section>
    </section>
    <section v-if="content.newScreenshots.length > 0">
      <rss-section-header feed-link="/api/feed/screenshots.rss">
        <router-link to="/gallery/screenshot">New screenshots</router-link>
      </rss-section-header>
      <thumb-gallery :images="content.newScreenshots" />
    </section>
  </section>
</template>

<script lang="ts">
import { MainPageContentDto } from '@app/shared/dto/main-page/main-page-content.dto';
import ThumbGallery from 'components/images/ThumbGallery.vue';
import NewsTimeline from 'components/mainpage/NewsTimeline.vue';
import NoticeboardItemList from 'components/noticeboard/NoticeboardItemList.vue';
import StoryList from 'components/stories/StoryList.vue';
import VenueList from 'components/venues/VenueList.vue';
import RssSectionHeader from 'src/components/common/RssSectionHeader.vue';
import CommunityList from 'src/components/communities/CommunityList.vue';
import FreeCompanyNameList from 'src/components/free-company/FreeCompanyNameList.vue';
import CharacterNameList from 'src/components/mainpage/CharacterNameList.vue';
import { Options, Vue, prop } from 'vue-class-component';

class Props {
  content = prop<MainPageContentDto>({
    required: true,
  })
}

@Options({
  name: 'LatestUpdates',
  components: {
    NewsTimeline,
    CharacterNameList,
    FreeCompanyNameList,
    StoryList,
    NoticeboardItemList,
    VenueList,
    CommunityList,
    ThumbGallery,
    RssSectionHeader,
  },
})
export default class LatestUpdates extends Vue.with(Props) {

}
</script>

<style lang="scss">
.latest-updates__profiles-and-fcs {
  display: flex;
  flex-wrap: wrap;
  margin-right: -12px;
}

.latest-updates__profiles-and-fcs > section {
  flex-basis: 0;
  flex-grow: 1;
  min-width: 300px;
  padding-right: 12px;
}
</style>
