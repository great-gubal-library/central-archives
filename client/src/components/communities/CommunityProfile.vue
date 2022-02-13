<template>
  <div class="community-profile">
    <banner-view :banner="community.banner" />
    <h2 class="community-profile__header-title">{{ community.name }}</h2>
    <character-details-box class="community-profile__infobox">
      <character-detail label="Founded" :value="$display.formatDate(community.foundedAt)" v-if="community.foundedAt" />
      <character-detail label="Website" :value="community.website" :link="community.website" v-if="community.website" />
      <character-detail label="Discord" :value="community.discord" :link="community.discord" v-if="community.discord" />
      <character-detail label="Goal" :value="community.goal" v-if="community.goal" />
      <character-detail label="Status" :value="community.status" v-if="community.status" />
      <character-detail label="Recruiting officers" :value="community.recruitingOfficers" v-if="community.recruitingOfficers" />
    </character-details-box>
    <template v-if="community.description">
      <section class="community-profile__description" v-html="description"></section>
    </template>
    <iframe
      v-if="community.carrdProfile"
      v-iframe-resize
      :src="carrdLink"
      width="100%"
      height="500px"
      class="community-profile__carrd-iframe"
    >
    </iframe>
    <template v-if="!community.description && !community.carrdProfile">
      No description.
    </template>
    <template v-if="community.tags.length > 0">
      <hr />
      <strong>Tags:</strong> {{ community.tags.join(', ') }}
    </template>
  </div>
</template>

<script lang="ts">
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import html from '@app/shared/html';
import { Options, prop, Vue } from 'vue-class-component';
import BannerView from '../common/BannerView.vue';
import CharacterDetail from 'components/character/CharacterDetail.vue';
import CharacterDetailsBox from 'components/character/CharacterDetailsBox.vue';

class Props {
  community = prop<CommunityDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'CommunityProfile',
  components: {
    CharacterDetail,
    CharacterDetailsBox,
    BannerView,
  },
})
export default class CommunityProfile extends Vue.with(Props) {
	get editCommunityLink(): string {
		return `/edit-community/${this.community.id}`;
	}

  get description(): string {
    return html.sanitize(this.community.description);
  }

  get carrdLink(): string {
    return `${this.$api.prefix}carrd/character/preview/${this.community.carrdProfile}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.community-profile__description {
  margin-bottom: 24px;
}

.community-profile__infobox {
  margin-bottom: 24px;
}

.community-profile__carrd-iframe {
  border: none;
}
</style>
