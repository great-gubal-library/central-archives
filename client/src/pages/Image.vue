<template>
  <q-page class="page-image">
		<section v-if="image.mine" class="page-image__edit-bar">
			<router-link :to="`/edit-image/${image.id}`">Edit image</router-link>
			<q-btn flat color="negative" label="Delete image" @click="onDeleteClick" />
		</section>
		<h2>{{image.title}}</h2>
		<template v-if="image.id">
			<section class="text-caption page-image__subtitle row">
				<div class="page-image__posted-by">
				Posted by <router-link :to="authorLink">{{ image.author }}</router-link> on {{ date }}
				</div>
				<div class="page-image__category">
					<router-link :to="`/gallery/${image.category}`">{{ $display.imageCategories[image.category] }}</router-link>
				</div>
			</section>
			<a :href="image.url" :title="image.title" target="_blank"><q-img :src="image.url" :ratio="image.width / image.height" /></a>
			<template v-if="image.description">
				<section class="page-image__description" v-html="description"></section>
				<hr />
			</template>
			<section class="page-image__credits">
				<p><strong>Credits:</strong> {{image.credits}}</p>
				<p v-if="image.eventId"><strong>Event:</strong> <router-link :to="`/event/${image.eventId}`">{{image.eventTitle}}</router-link></p>
			</section>
		</template>
	</q-page>	
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
import html from '@app/shared/html';
import { useQuasar, createMetaMixin } from 'quasar';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

async function load(params: RouteParams): Promise<ImageDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const image = await $api.images.getImage(id);
		document.title = `${image.title} — Chaos Archives`;
		return image;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			$q.notify({
				type: 'negative',
				message: 'Image not found.'
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
	name: 'PageImage',
	async beforeRouteEnter(to, _, next) {
		const image = await load(to.params);
		next(vm => (vm as PageImage).setContent(image));
	},
	async beforeRouteUpdate(to) {
		const image = await load(to.params);
		(this as PageImage).setContent(image);
	},
	mixins: [
		createMetaMixin(function() {
			return {
				meta: {
					'ogImage': {
						property: 'og:image',
						content: (this as PageImage).image.url,
					},
					'twitterCard': {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				}
			}
		}),
	],
})
export default class PageImage extends Vue {
	image = {} as ImageDto;

	setContent(image: ImageDto) {
		this.image = image;
	}

	get description() {
		return this.image ? html.sanitize(this.image.description) : '';
	}

	get date(): string {
    return this.$display.formatDate(this.image.createdAt);
  }

  get authorLink(): string {
    const server = this.image.authorServer;
    const character = this.image.author.replace(/ /g, '_');
    return `/${server}/${character}`;
  }

	async onDeleteClick() {
		const ConfirmImageDeleteDialog = (await import('components/images/ConfirmImageDeleteDialog.vue')).default;

		this.$q.dialog({
			component: ConfirmImageDeleteDialog,
			componentProps: {
				image: this.image
			}
		}).onOk(() => {
			this.$q.notify({
				type: 'positive',
				message: 'Image deleted.'
			});
		});
	}
}
</script>

<style lang="scss">
.page-image__edit-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

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