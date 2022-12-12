<template>
  <q-page class="page-character">
		<character-profile v-if="character && character.id" :character="character" />		
		<template v-else-if="notFound">
			<h2>Charakter konnte nicht gefunden werden.</h2>
			<p>Der Charakter {{name}} ({{server}}) ist nicht auf <strong>Elpisgarten</strong> registriert.</p>
		</template>
		<template v-if="content.stories.length > 0">
			<h3>{{name}}'s Geschichten</h3>
			<story-list :stories="content.stories" />
		</template>
		<template v-if="content.images && content.images.length > 0">
			<h3>{{name}}'s Galerie</h3>
			<thumb-gallery :images="content.images" />
		</template>
    <report-violation-section v-if="character && character.id" :pageType="PageType.PROFILE" :pageId="character.id" />
	</q-page>	
</template>

<script lang="ts">
import { CharacterContentDto } from '@app/shared/dto/characters/character-content.dto';
import { CharacterProfileDto } from '@app/shared/dto/characters/character-profile.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import CharacterProfile from 'components/character/CharacterProfile.vue';
import StoryList from 'components/stories/StoryList.vue';
import { createMetaMixin } from 'quasar';
import { MetaOptions } from 'quasar/dist/types/meta';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ThumbGallery from '../components/images/ThumbGallery.vue';

const $api = useApi();
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
				notifyError(e);
				throw e;
			}
		}
}

@Options({
	components: {
		CharacterProfile,
		StoryList,
		ThumbGallery,
		ReportViolationSection,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageCharacter).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageCharacter).setContent(content);
	},
	mixins: [
		createMetaMixin(function(this: PageCharacter) {
			const result: MetaOptions = {
				meta: {}
			};

			if (this.character.banner) {
				Object.assign(result.meta, {
					ogImage: {
						property: 'og:image',
						content: this.character.banner.url,
					},
					twitterCard: {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				});
			}

			return result;
		}),
	],
})
export default class PageCharacter extends Vue {
	readonly PageType = PageType;

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
