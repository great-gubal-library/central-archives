<template>
  <q-page class="page-stories">
		<h2>Stories</h2>
		<story-list :stories="stories" />
	</q-page>	
</template>

<script lang="ts">
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import errors from '@app/shared/errors';
import StoryList from 'components/stories/StoryList.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $q = useQuasar();

@Options({
	name: 'PageCharacters',
	components: {
		StoryList
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const stories = await $api.getStories({});
      next(vm => (vm as PageCharacters).setContent(stories));
    } catch (e) {
      console.log(e);
      $q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
    }
  }
})
export default class PageCharacters extends Vue {
	private stories: StorySummaryDto[] = [];

	setContent(stories: StorySummaryDto[]) {
		this.stories = stories;
	}
}
</script>

<style lang="scss">

</style>