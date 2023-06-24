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
  </div>
</template>

<script lang="ts">
import { PlayerProfileDto } from '@app/shared/dto/player-profiles/player-profile.dto';
import { Options, prop, Vue } from 'vue-class-component';
import HtmlViewer from '../common/HtmlViewer.vue';

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
    HtmlViewer,
  }
})
export default class PlayerProfileView extends Vue.with(Props) {
 
  get mine() {
    return this.id === this.$store.state.user?.id;
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
