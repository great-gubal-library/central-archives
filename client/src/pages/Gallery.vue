<template>
  <q-page class="page-gallery">
		<h2>{{title}}</h2>
		<thumb-gallery :images="images" />
	</q-page>	
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import errors from '@app/shared/errors';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import ThumbGallery from 'src/components/images/ThumbGallery.vue';
import { Options, Vue } from 'vue-class-component';
import { RouteParams, useRouter } from 'vue-router';

const $api = useApi();
const $q = useQuasar();
const $router = useRouter();

async function load(params: RouteParams): Promise<{ category: ImageCategory, images: ImageSummaryDto[] }> {
	const category = params.category as ImageCategory;

	if (!Object.values(ImageCategory).includes(category) || category == ImageCategory.UNLISTED) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		return { category, images: await $api.getImages({ category }) };
	} catch (e) {
		$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});

		throw e;
	}
}

@Options({
	name: 'PageGallery',
	components: {
		ThumbGallery,
	},
	async beforeRouteEnter(to, _, next) {
		const { category, images } = await load(to.params);
		next(vm => (vm as PageGallery).setContent(category, images));
	},
	async beforeRouteUpdate(to) {
		const { category, images } = await load(to.params);
		(this as PageGallery).setContent(category, images);
	}
})
export default class PageGallery extends Vue {
	category = ImageCategory.UNLISTED;
	images = [] as ImageSummaryDto[];

	setContent(category: ImageCategory, images: ImageSummaryDto[]) {
		this.category = category;
		this.images = images;
		document.title = `${this.title} — Chaos Archives`;
	}

	get title() {
		return this.$display.imageCategories[this.category] + ' Gallery';
	}
}
</script>

<style lang="scss">

</style>