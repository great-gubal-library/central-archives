<template>
  <section>
    <h2>Welcome!</h2>
    <p>
      Central Archives is the central place to manage your claimed FFXIV characters and their profiles.
    </p>
    <character-name-list
      v-if="$store.getters.role"
      :profiles="characters"
      :links="false"
      :activeName="activeName"
      :activeServer="activeServer"
      @select="onCharacterSelect"
    />
  </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { SessionCharacterDto } from '../../../../server/libs/shared/src/dto/user/session-character.dto';
import CharacterNameList from './CharacterNameList.vue';
import { notifySuccess } from '../../common/notify';

@Options({
  name: 'GlobalWelcome',
  components: {
    CharacterNameList,
  }
})
export default class GlobalWelcome extends Vue {
  get characters() {
    if (!this.$store.state.user) {
      return [];
    }

    return Array.from(this.$store.state.user.characters.values());
  }

  get activeName() {
		return this.$store.getters.character?.name;
	}

	get activeServer() {
		return this.$store.getters.character?.server;
	}

  onCharacterSelect(character: SessionCharacterDto) {
    const oldCharacterId = this.$store.getters.characterId;
    this.$store.commit('setCurrentCharacterId', character.id);

    if (character.id !== oldCharacterId) {
      notifySuccess(`${character.name} is now your active character.`);
    }
  }
}
</script>

<style lang="scss">
</style>
