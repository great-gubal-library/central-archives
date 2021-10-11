<template>
  <q-page class="page-image">
		<template v-if="loaded">
			<h2>{{image.title}}</h2>
			<section class="text-caption page-image__subtitle row">
				<div class="page-image__posted-by">
				Posted by <router-link :to="authorLink">{{ image.author }}</router-link> on {{ date }}
				</div>
				<div class="page-image__category">
					{{ $display.imageCategories[image.category] }}
				</div>
			</section>
			<q-img :src="image.url" :ratio="image.width / image.height" />
			<template v-if="image.description">
				<section class="page-image__description" v-html="description"></section>
				<hr />
			</template>
			<section class="page-image__credits"><strong>Credits:</strong> {{image.credits}}</section>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
import StoryView from 'components/stories/StoryView.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import html from '@app/shared/html';

@Options({
	name: 'PageImage',
	components: {
		StoryView
	},
	beforeRouteEnter(to, _, next) {
		next(vm => (vm as PageImage).load(to.params));
	},
	async beforeRouteUpdate(to) {
		await (this as PageImage).load(to.params);
	}
})
export default class PageImage extends Vue {
	private id: number|null = null;
	private image = {} as ImageDto;
	private loaded = false;

	private async load(params: RouteParams) {
		this.id = parseInt(params.id as string, 10);

		if (!this.id) {
			void this.$router.replace('/');
			return;
		}

		try {
			this.image = await this.$api.getImage(this.id);
			document.title = `${this.image.title} — Chaos Archives`;
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

	get description() {
		return this.image ? html.sanitize(this.image.description) : '';
	}

	get date(): string {
    return this.$display.formatDate(this.image.createdAt);
  }

  get authorLink(): string {
    const server = this.image.authorServer;
    const character = this.image.author.replace(' ', '_');
    return `/${server}/${character}`;
  }
}
</script>

<style lang="scss">
.page-image__description {
	margin-top: 24px;
	margin-bottom: 24px;
}

.page-image__posted-by {
  flex-grow: 1;
  padding-right: 16px;
	padding-bottom: 8px;
}

.page-image__category {
	flex-grow: 0;
  white-space: nowrap;
}
</style>