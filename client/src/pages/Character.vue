<template>
  <q-page class="page-character">
		<character-profile v-if="character && character.id" :character="character" />
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
		<template v-if="storiesLoaded">
			<h3>{{name}}'s stories</h3>
				<story-list v-if="stories.length > 0" :stories="stories" />
				<p v-else>
					{{name}} has no stories... for now!
				</p>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import StoryList from 'components/stories/StoryList.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

@Options({
	components: {
		CharacterProfile,
		StoryList,
	},
	beforeRouteEnter(to, _, next) {
		next(vm => (vm as PageCharacter).load(to.params));
	},
	async beforeRouteUpdate(to) {
		await (this as PageCharacter).load(to.params);
	}
})
export default class PageCharacter extends Vue {
	private name: string|null = null;
	private server: string|null = null;
	private character: CharacterProfileDto = new CharacterProfileDto();
	private stories: StorySummaryDto[] = [];
	private storiesLoaded = false;
	private notFound = false;

	private async load(params: RouteParams) {
		this.server = params.server as string;
		this.name = params.character as string;

		if (!this.name || !this.server) {
			void this.$router.replace('/');
			return;
		}

		this.name = this.name.replace('_', ' ');

		try {
			this.storiesLoaded = false;
			this.stories = [];
			this.character = await this.$api.getCharacterProfile(this.name, this.server);
			this.stories = await this.$api.getStories({ characterId: this.character.id });
			this.storiesLoaded = true;
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