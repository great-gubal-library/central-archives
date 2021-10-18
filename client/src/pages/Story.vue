<template>
  <q-page class="page-story">
		<story-view :story="story" />
	</q-page>	
</template>

<script lang="ts">
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import errors from '@app/shared/errors';
import StoryView from 'components/stories/StoryView.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { useRouter } from 'vue-router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

async function load(params: RouteParams): Promise<StoryDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const story = await $api.getStory(id);
		document.title = `${story.title} — Chaos Archives`;
		return story;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			$q.notify({
				type: 'negative',
				message: 'Story not found.'
			});
			void $router.replace('/');
		} else {
			$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		}

		throw e;
	}
}

@Options({
	components: {
		StoryView
	},
	async beforeRouteEnter(to, _, next) {
		const story = await load(to.params);
		next(vm => (vm as PageStory).setContent(story));
	},
	async beforeRouteUpdate(to) {
		const story = await load(to.params);
		(this as PageStory).setContent(story);
	}
})
export default class PageStory extends Vue {
	story: StoryDto = new StoryDto();
	
	setContent(story: StoryDto) {
		this.story = story;
	}
}
</script>

<style lang="scss">

</style>