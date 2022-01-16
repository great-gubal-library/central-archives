<template>
  <q-page class="page-character">
		<character-profile v-if="character && character.id" :character="character" />
		<template v-else-if="notFound">
			<h2>Character not found</h2>
			<p>The character {{name}} ({{server}}) is not registered on Chaos Archives.</p>
		</template>
		<h3>{{name}}'s stories</h3>
		<story-list v-if="content.stories.length > 0" :stories="content.stories" />
		<p v-else>
			{{name}} has no stories... for now!
		</p>
		<template v-if="content.images && content.images.length > 0">
			<h3>{{name}}'s Gallery</h3>
			<thumb-gallery :images="content.images" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { CharacterContentDto } from '@app/shared/dto/characters/character-content.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import StoryList from 'components/stories/StoryList.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';
import ThumbGallery from '../components/images/ThumbGallery.vue';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

interface Content {
	name: string;
	server: string;
	character: CharacterProfileDto;
	content: CharacterContentDto;
	notFound: boolean;
}

async function load(params: RouteParams): Promise<Content> {
		const server = params.server as string;
		let name = params.character as string;

		if (!name || !server) {
			void $router.replace('/');
			throw new Error();
		}

		name = name.replace(/_/g, ' ');

		try {
			const character = await $api.characters.getCharacterProfile(name, server);

			return {
				name,
				server,
				character,
				content: await $api.characters.getCharacterContent(character.id),
				notFound: false
			}
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				return {
					name,
					server,
					character: new CharacterProfileDto(),
					content: { stories: [], images: [] },
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
		ThumbGallery,
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
	content: CharacterContentDto = { stories: [], images: [] };
	notFound = false;

	setContent(content: Content) {
		Object.assign(this, content);
	}
}
</script>

<style lang="scss">

</style>