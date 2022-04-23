<template>
  <q-page class="page-story">
		<template v-if="story.id">
			<story-view :story="story" />
    	<report-violation-section :pageType="PageType.STORY" :pageId="story.id" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import StoryView from 'components/stories/StoryView.vue';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<StoryDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const story = await $api.stories.getStory(id);
		document.title = `${story.title} — Chaos Archives`;
		return story;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Story not found.');
			void $router.replace('/');
		} else {
			notifyError(e);
		}

		throw e;
	}
}

@Options({
	name: 'PageStory',
	components: {
		StoryView,
		ReportViolationSection,
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
	readonly PageType = PageType;
	
	story: StoryDto = new StoryDto();
	
	setContent(story: StoryDto) {
		this.story = story;
	}
}
</script>

<style lang="scss">

</style>