<template>
  <q-page class="page-image">
		<section v-if="image.mine" class="edit-bar">
			<router-link :to="`/edit-image/${image.id}`">Bild bearbeiten</router-link>
			<q-btn flat color="negative" label="Bild löschen" @click="onDeleteClick" />
		</section>
		<h2 class="regular-header-font">{{image.title}}</h2>
		<template v-if="image.id">
			<section class="text-caption page-image__subtitle row">
				<div class="page-image__posted-by">
				Hochgeladen von <router-link :to="authorLink">{{ image.author }}</router-link> am {{ date }}
				</div>
				<div class="page-image__category">
					<router-link :to="`/gallery/${image.category}`">{{ $display.imageCategories[image.category] }}</router-link>
				</div>
			</section>
			<a :href="image.url" :title="image.title" target="_blank"><q-img :src="image.url" :ratio="image.width / image.height" /></a>
			<template v-if="image.description">
				<html-viewer class="page-image__description" :content="image.description" />
				<hr />
			</template>
			<section class="page-image__credits">
				<p><strong>Credits:</strong> <link-field :content="image.credits" /></p>
				<p v-if="image.eventId"><strong>Event:</strong> <router-link :to="`/event/${image.eventId}`">{{image.eventTitle}}</router-link></p>
			</section>
    	<report-violation-section :pageType="PageType.IMAGE" :pageId="image.id" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import { createMetaMixin } from 'quasar';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import HtmlViewer from 'src/components/common/HtmlViewer.vue';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';
import LinkField from 'src/components/common/LinkField.vue';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<ImageDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const image = await $api.images.getImage(id);
		document.title = `${image.title} — Elpisgarten`;
		return image;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Image not found.');
			void $router.replace('/');
		} else {
			notifyError(e);
		}

		throw e;
	}
}

@Options({
	name: 'PageImage',
	components: {
		HtmlViewer,
		ReportViolationSection,
		LinkField,
	},
	async beforeRouteEnter(to, _, next) {
		const image = await load(to.params);
		next(vm => (vm as PageImage).setContent(image));
	},
	async beforeRouteUpdate(to) {
		const image = await load(to.params);
		(this as PageImage).setContent(image);
	},
	mixins: [
		createMetaMixin(function(this: PageImage) {
			return {
				meta: {
					ogImage: {
						property: 'og:image',
						content: this.image.url,
					},
					twitterCard: {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				}
			}
		}),
	],
})
export default class PageImage extends Vue {
	readonly PageType = PageType;
	
	image = {} as ImageDto;

	setContent(image: ImageDto) {
		this.image = image;
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
			notifySuccess('Bild gelöscht.');
			void this.$router.push('/');
		});
	}
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

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
