<template>
	<div class="step-thumbnail">
		<h5>Customize Thumbnail</h5>
		<h6>Full image</h6>
		<div class="step-thumbnail__label">The full image will be uploaded.</div>
		<section><img :src="image.src" /></section>
		<h6>Thumbnail</h6>
		<div class="step-thumbnail__label">This is what will be shown on your media library page and on gallery pages.</div>
		<section style="display: inline-block"><img ref="cropper" :src="image.src" /></section>
	</div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import { ImageThumbModel } from './image-thumb-model';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

class Props {
	image = prop<HTMLImageElement>({
		required: true
	});

	modelValue = prop<ImageThumbModel>({
		default: null
	});
}

@Options({
	emits: [
		'update:model-value'
	]
})
export default class StepThumbnail extends Vue.with(Props) {
	private cropper: Cropper;

	mounted() {
		this.cropper = new Cropper(this.$refs.cropper as HTMLImageElement, {
			viewMode: 2,
			aspectRatio: 1,
			autoCropArea: 0.5,
			zoomable: false,

			ready: () => {
				if (this.modelValue.left !== -1) {
					const { left, top, width } = this.modelValue;
					this.cropper.setData({
						x: left,
						y: top,
						width,
						height: width,
					});
				}
			},

			crop: event => {
				const { x, y, width } = event.detail;
				this.$emit('update:model-value', {
					left: x,
					top: y,
					width
				});
			}
		});
	}

	unmounted() {
		if (this.cropper) {
			this.cropper.destroy();
		}
	}
}
</script>

<style lang="scss">
.step-thumbnail img {
	max-height: 30vh;
}

.step-thumbnail__label {
	margin-bottom: 6px;
}
</style>
