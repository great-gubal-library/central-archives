<template>
	<div class="thumb-gallery">
		<div v-for="image in images" :key="image.id">
			<router-link class="thumb-gallery__image-wrapper" :to="`/image/${image.id}`" :title="image.title">
				<img :src="image.thumbUrl" :alt="image.title" />
			</router-link>
		</div>
	</div>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { prop, Vue } from 'vue-class-component';

class Props {
	images = prop<ImageSummaryDto[]>({
		required: true
	});
}

export default class ThumbGallery extends Vue.with(Props) {
	
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
}

.thumb-gallery img {
	background: #80a0c0;
	width: 174px;
	height: 174px;
}

@media screen and (max-width: $breakpoint-sm) {
	.thumb-gallery img {
		width: 149px;
		height: 149px;
	}
}

@media screen and (max-width: $breakpoint-xs) {
	.thumb-gallery img {
		width: 124px;
		height: 124px;
	}
}
</style>
