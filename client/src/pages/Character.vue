<template>
  <q-page class="page-character">
		<character-profile v-if="character && character.id" :character="character" />
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
		<h3>{{name}}'s stories</h3>
		<story-list v-if="stories.length > 0" :stories="stories" />
		<p v-else>
			{{name}} has no stories... for now!
		</p>
	</q-page>	
</template>

<script lang="ts">
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import StoryList from 'components/stories/StoryList.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

interface Content {
	name: string;
	server: string;
	character: CharacterProfileDto;
	stories: StorySummaryDto[];
	notFound: boolean;
}

async function load(params: RouteParams): Promise<Content> {
		const server = params.server as string;
		let name = params.character as string;

		if (!name || !server) {
			void $router.replace('/');
			throw new Error();
		}

		name = name.replace('_', ' ');

		try {
			const character = await $api.getCharacterProfile(name, server);

			return {
				name,
				server,
				character,
				stories: await $api.getStories({ characterId: character.id }),
				notFound: false
			}
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				return {
					name,
					server,
					character: new CharacterProfileDto(),
					stories: [],
					notFound: true
				}
			} else {
				$q.notify({
					type: 'negative',
					message: errors.getMessage(e)
				});
				throw e;
			}
		}
}

@Options({
	components: {
		CharacterProfile,
		StoryList,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageCharacter).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageCharacter).setContent(content);
	}
})
export default class PageCharacter extends Vue {
	name = '';
	server = '';
	character: CharacterProfileDto = new CharacterProfileDto();
	stories: StorySummaryDto[] = [];
	notFound = false;

	setContent(content: Content) {
		Object.assign(this, content);
	}
}
</script>

<style lang="scss">

</style>