<template>
	<div class="thumb-gallery">
		<div v-for="(image, index) in images" :key="image.id">
			<a v-if="links" class="thumb-gallery__image-wrapper thumb-link" :href="`/image/${image.id}`" :title="image.title" @click.prevent="openSlides(index)">
				<img :src="image.thumbUrl" :alt="image.title" />
			</a>
			<div v-else class="thumb-gallery__image-wrapper thumb-link" @click="select(image)">
				<img :src="image.thumbUrl" :alt="image.title" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
	images = prop<ImageSummaryDto[]>({
		required: true
	});
	
	links = prop<boolean>({
		default: true
	});
}

@Options({
	emits: 'select'
})
export default class ThumbGallery extends Vue.with(Props) {
	select(image: ImageSummaryDto) {
		this.$emit('select', image);
	}

	async openSlides(index: number) {
		const ImageSlidesDialog = (await import('./ImageSlidesDialog.vue')).default;

		this.$q.dialog({
			component: ImageSlidesDialog,
			componentProps: {
				images: this.images,
				initialIndex: index,
			}
		});
	}
}
</script>

<style lang="scss">
.thumb-gallery {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	margin-right: -12px;
}

.thumb-gallery__image-wrapper {
	display: flex;
	margin-right: 12px;
	margin-bottom: 12px;
	cursor: pointer;
}

.thumb-gallery img {
	background: #80a0c0;
	width: 174px;
	height: 174px;
}

.thumb-gallery img:hover {
	filter: brightness(1.2);
  transition: all 0.5s ease;
}

@media screen and (max-width: $breakpoint-sm) {
	.thumb-gallery > div {
		width: calc(((100% - 48px) / 4) + 12px);
	}

	.thumb-gallery img {
		width: 100%;
		height: auto;
	}
}

@media screen and (max-width: $breakpoint-xs) {
	.thumb-gallery {
		margin-right: -6px;
	}

	.thumb-gallery__image-wrapper {
		margin-right: 6px;
		margin-bottom: 6px;
	}

	.thumb-gallery > div {
		width: calc(((100% - 24px) / 4) + 6px);
	}

	.thumb-gallery img {
		width: 100%;
		height: auto;
	}
}
</style>
