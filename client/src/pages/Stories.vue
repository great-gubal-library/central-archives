<template>
  <q-page class="page-stories">
		<h2>Stories</h2>
		<story-list :stories="stories" />
	</q-page>	
</template>

<script lang="ts">
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';
import errors from '@app/shared/errors';
import NewProfileList from 'components/mainpage/NewProfileList.vue';
import { Options, Vue } from 'vue-class-component';

@Options({
	components: {
		NewProfileList
	}
})
export default class PageCharacters extends Vue {
	private stories: StorySummaryDto[] = [];

	async created() {
		try {
			this.stories = await this.$api.getStories();
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		}
	}
}
</script>

<style lang="scss">

</style>