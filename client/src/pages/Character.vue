<template>
  <q-page class="page-character">
		<character-profile v-if="character && character.id" :character="character" />
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import { Options, Vue } from 'vue-class-component';

@Options({
	components: {
		CharacterProfile
	}
})
export default class PageCharacter extends Vue {
	private name: string|null = null;
	private server: string|null = null;
	private character: CharacterProfileDto|null = null;
	private notFound = false;

	async created() {
		this.server = this.$route.params.server as string;
		this.name = this.$route.params.character as string;

		if (!this.name || !this.server) {
			void this.$router.replace('/');
			return;
		}

		this.name = this.name.replace('_', ' ');

		try {
			this.character = await this.$api.getCharacterProfile(this.name, this.server);
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				this.notFound = true;
			} else {
				this.$q.notify({
					type: 'negative',
					message: errors.getMessage(e)
				});
			}
		}
	}
}
</script>

<style lang="scss">

</style>