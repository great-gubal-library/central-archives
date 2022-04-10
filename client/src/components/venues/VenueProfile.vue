<template>
  <div class="venue-profile">
    <banner-view :banner="venue.banner" />
    <header class="venue-profile__header">
      <div class="layout__filler"></div>
      <div class="venue-profile__header-names">
        <h2 class="venue-profile__header-title">{{ venue.name }}</h2>
        <div class="venue-profile__header-subtitle">{{ address }}</div>
      </div>
      <div class="layout__filler"></div>
    </header>
    <character-details-box class="venue-profile__infobox">
      <character-detail label="World" :value="venue.server" v-if="venue.server" />
      <character-detail label="Owner" :value="venue.owner" :router-link="ownerLink" />
      <character-detail label="Founded" :value="$display.formatDate(venue.foundedAt)" v-if="venue.foundedAt" />
      <character-detail label="Website" :value="venue.website" :link="venue.website" v-if="venue.website" />
      <character-detail label="Purpose" :value="venue.purpose" v-if="venue.purpose" />
      <character-detail label="Status" :value="venue.status" v-if="venue.status" />
    </character-details-box>
    <template v-if="venue.description">
      <html-viewer class="venue-profile__description" :content="venue.description" />
    </template>
    <iframe
      v-if="venue.carrdProfile"
      v-iframe-resize
      :src="carrdLink"
      width="100%"
      height="500px"
      class="venue-profile__carrd-iframe"
    >
    </iframe>
    <template v-if="!venue.description && !venue.carrdProfile">
      No description.
    </template>
    <template v-if="venue.tags.length > 0">
      <hr />
      <strong>Tags:</strong> {{ venue.tags.join(', ') }}
    </template>
  </div>
</template>

<script lang="ts">
import { VenueDto } from '@app/shared/dto/venues/venue.dto';
import html from '@app/shared/html';
import { Options, prop, Vue } from 'vue-class-component';
import BannerView from '../common/BannerView.vue';
import CharacterDetail from 'components/character/CharacterDetail.vue';
import CharacterDetailsBox from 'components/character/CharacterDetailsBox.vue';
import { VenueLocation } from '@app/shared/enums/venue-location.enum';
import HtmlViewer from '../common/HtmlViewer.vue';

class Props {
  venue = prop<VenueDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'VenueProfile',
  components: {
    CharacterDetail,
    CharacterDetailsBox,
    BannerView,
    HtmlViewer,
  },
})
export default class VenueProfile extends Vue.with(Props) {
	get editVenueLink(): string {
		return `/edit-venue/${this.venue.id}`;
	}

  get address(): string {
    let address: string;

		if (this.venue.location === VenueLocation.OPEN_WORLD) {
			address = this.venue.address;
		} else {
			const plot = this.venue.location === VenueLocation.HOUSE ? `Plot ${this.venue.plot!}` : `Apartment ${this.venue.room!}`;
			address = `${this.$display.housingAreas[this.venue.housingArea!]}, Ward ${this.venue.ward!}, ${plot}`;

			if (this.venue.subdivision) {
				address += ' (subdivision)';
			}
		}

    return address;
  }

  get description(): string {
    return html.sanitize(this.venue.description);
  }

  get carrdLink(): string {
    return `${this.$api.prefix}carrd/character/preview/${this.venue.carrdProfile}`;
  }

  get ownerLink(): string {
    const server = this.venue.ownerServer;
    const character = this.venue.owner.replace(/ /g, '_');
    return `/${server}/${character}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.venue-profile__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.venue-profile__header-title {
  margin: 0;
  line-height: auto;
}

.venue-profile__header-names {
  text-align: center;
}

.venue-profile__header-subtitle {
  font-family: $header-font;
  font-size: 1.6em;
}

.venue-profile__details td {
  padding: 4px 8px;
}

.venue-profile__details tr > td:first-child {
  font-weight: bold;
}

.venue-profile__description {
  margin-bottom: 24px;
}

.venue-profile__description_no-header {
  margin-top: 24px;
}

.venue-profile__infobox {
  margin-bottom: 24px;
}

.venue-profile__carrd-iframe {
  border: none;
}
</style>
