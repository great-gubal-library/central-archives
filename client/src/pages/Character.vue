<template>
  <q-page class="page-character">
		<template v-if="character && character.name">
			<h2>{{character.name}}</h2>
		</template>
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { CharacterProfileDto } from '@app/shared/dto/character/character-profile.dto';
import errors from '@app/shared/errors';

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