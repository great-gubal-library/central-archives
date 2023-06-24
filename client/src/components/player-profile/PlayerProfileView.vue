<template>
  <div class="player-profile-view">
    <div class="player-profile-view__header-subtitle">Roleplayer</div>
    <h2>{{ playerProfile.name }}</h2>
    <p v-if="mine && !playerProfile.content">
      Your player profile is blank. <router-link to="/edit-player-profile">Fill it!</router-link>
    </p>
    <html-viewer
      v-else
      class="player-profile-view__content"
      :content="playerProfile.content"
    />
    <iframe
      v-if="playerProfile.carrdProfile"
      v-iframe-resize
      :src="carrdLink"
      width="100%"
      height="500px"
      class="character-profile__carrd-iframe"
    >
    </iframe>
    <h3>Characters</h3>
    <character-name-list :profiles="playerProfile.characters" />
  </div>
</template>

<script lang="ts">
import { PlayerProfileDto } from '@app/shared/dto/player-profiles/player-profile.dto';
import { Options, prop, Vue } from 'vue-class-component';
import HtmlViewer from '../common/HtmlViewer.vue';
import CharacterNameList from '../mainpage/CharacterNameList.vue';

class Props {
  id = prop<number>({
    required: true,
  });

  playerProfile = prop<PlayerProfileDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'PlayerProfileView',
  components: {
    CharacterNameList,
    HtmlViewer,
  }
})
export default class PlayerProfileView extends Vue.with(Props) {
 
  get mine() {
    return this.id === this.$store.state.user?.id;
  }

  get carrdLink(): string {
    return `${this.$api.prefix}carrd/character/preview/${this.playerProfile.carrdProfile}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.player-profile-view__header-subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
}

</style>
