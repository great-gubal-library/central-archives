<template>
  <div class="free-company-profile">
    <p v-if="!preview && freeCompany.mine">
      <router-link :to="editFCLink">Edit Free Company</router-link>
    </p>
    <banner-view :banner="freeCompany.banner" />
    <header class="free-company-profile__header">
      <div class="layout__filler">
        <free-company-crest :images="freeCompany.crest" />
      </div>
      <div class="free-company-profile__header-names">
        <h2 class="free-company-profile__header-title">{{ freeCompany.name }}</h2>
        <div v-if="freeCompany.tag" class="free-company-profile__header-subtitle">«{{ freeCompany.tag }}»</div>
      </div>
      <div class="layout__filler"></div>
    </header>
    <character-details-box class="free-company-profile__infobox">
      <character-detail label="World" :value="freeCompany.server" v-if="freeCompany.server" />
      <character-detail label="Founded" :value="$display.formatDate(freeCompany.foundedAt)" v-if="freeCompany.foundedAt" />
      <character-detail label="Website" :value="freeCompany.website" :link="freeCompany.website" v-if="freeCompany.website" />
      <character-detail label="Goal" :value="freeCompany.goal" v-if="freeCompany.goal" />
      <character-detail label="Status" :value="freeCompany.status" v-if="freeCompany.status" />
      <character-detail label="Main area of operations" :value="freeCompany.areaOfOperations" v-if="freeCompany.areaOfOperations" />
      <character-detail label="Recruiting officers" :value="freeCompany.recruitingOfficers" v-if="freeCompany.recruitingOfficers" />
    </character-details-box>
    <template v-if="!freeCompany.claimed">
      This Free Company's leader has not yet claimed it on Chaos Archives.
    </template>
    <template v-if="freeCompany.description">
      <section class="free-company-profile__appearance-background" v-html="description"></section>
    </template>
    <iframe
      v-if="freeCompany.carrdProfile"
      v-iframe-resize
      :src="carrdLink"
      width="100%"
      height="500px"
      class="free-company-profile__carrd-iframe"
    >
    </iframe>
    <template v-if="freeCompany.claimed && !freeCompany.description && !freeCompany.carrdProfile">
      No description.
    </template>
  </div>
</template>

<script lang="ts">
import { FreeCompanyDto } from '@app/shared/dto/fcs/free-company.dto';
import FreeCompanyCrest from './FreeCompanyCrest.vue';
import html from '@app/shared/html';
import { Options, prop, Vue } from 'vue-class-component';
import BannerView from '../common/BannerView.vue';
import CharacterDetail from 'components/character/CharacterDetail.vue';
import CharacterDetailsBox from 'components/character/CharacterDetailsBox.vue';

class Props {
  freeCompany = prop<FreeCompanyDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'FreeCompanyProfile',
  components: {
    CharacterDetail,
    CharacterDetailsBox,
    FreeCompanyCrest,
    BannerView,
  },
})
export default class FreeCompanyProfile extends Vue.with(Props) {
	get editFCLink() {
		const fc = this.freeCompany;
		return `/edit-free-company/${fc.server}/${fc.name.replace(/ /g, '_')}`;
	}

  get description(): string {
    return html.sanitize(this.freeCompany.description);
  }

  get carrdLink(): string {
    return `${this.$api.prefix}carrd/character/preview/${this.freeCompany.carrdProfile}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.free-company-profile__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.free-company-profile__header-title {
  margin: 0;
  line-height: auto;
}

.free-company-profile__header-names {
  text-align: center;
}

.free-company-profile__header-subtitle {
  font-family: $header-font;
  font-size: 1.6em;
}

.free-company-profile__details td {
  padding: 4px 8px;
}

.free-company-profile__details tr > td:first-child {
  font-weight: bold;
}

.free-company-profile__appearance-background {
  margin-bottom: 24px;
}

.free-company-profile__appearance-background_no-header {
  margin-top: 24px;
}

.free-company-profile__infobox {
  margin-bottom: 24px;
}

.free-company-profile__carrd-iframe {
  border: none;
}
</style>
