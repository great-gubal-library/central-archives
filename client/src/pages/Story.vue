<template>
  <q-page class="page-story">
		<template v-if="story.id">
			<section v-if="story.mine" class="edit-bar">
				<router-link :to="`/edit-story/${story.id}`">Edit story</router-link>
				<q-btn flat color="negative" label="Delete story" @click="onDeleteClick" />
			</section>
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
import { notifyError, notifySuccess } from 'src/common/notify';
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

	onDeleteClick() {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the story “${this.story.title}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.stories.deleteStory(this.story.id!);

					notifySuccess('Story deleted.');
					void this.$router.replace('/');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">

</style>