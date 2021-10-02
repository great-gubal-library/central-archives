<template>
  <q-page class="page-story">
		<story-view v-if="loaded" :story="story" />
	</q-page>	
</template>

<script lang="ts">
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import errors from '@app/shared/errors';
import StoryView from 'components/stories/StoryView.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

@Options({
	components: {
		StoryView
	},
	beforeRouteEnter(to, _, next) {
		next(vm => (vm as PageStory).load(to.params));
	},
	async beforeRouteUpdate(to) {
		await (this as PageStory).load(to.params);
	}
})
export default class PageStory extends Vue {
	private id: number|null = null;
	private story: StoryDto = new StoryDto();
	private loaded = false;

	private async load(params: RouteParams) {
		this.id = parseInt(params.id as string, 10);

		if (!this.id) {
			void this.$router.replace('/');
			return;
		}

		try {
			this.story = await this.$api.getStory(this.id);
			document.title = `${this.story.title} — Chaos Archives`;
			this.loaded = true;
		} catch (e) {
			if (errors.getStatusCode(e) === 404) {
				this.$q.notify({
					type: 'negative',
					message: 'Story not found.'
				});
				void this.$router.replace('/');
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