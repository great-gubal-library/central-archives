<template>
	<div class="step-thumbnail">
		<div class="step-thumbnail__col">
			<section class="step-thumbnail__description">
				<h6>Gesamtes Bild</h6>
				<div class="step-thumbnail__label">Das gesamte Bild wird hochgeladen.</div>
			</section>
			<section><img :src="image.src" /></section>
		</div>
		<div class="step-thumbnail__col">
			<section class="step-thumbnail__description">
				<h6>Thumbnail</h6>
				<div class="step-thumbnail__label">Das wird in deinen Inhalten und den Galerien angezeigt.</div>
			</section>
			<section style="display: inline-block"><img ref="cropper" :src="image.src" /></section>
		</div>
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
					left: Math.round(x),
					top: Math.round(y),
					width: Math.round(width)
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
.step-thumbnail {
	display: flex;
}

.step-thumbnail img {
	max-height: 50vh;
}

.step-thumbnail__col {
	padding-left: 8px;
	padding-right: 8px;
	display: flex;
	flex-direction: column;
}

.step-thumbnail__description {
	flex-basis: 0;
	flex-grow: 1;
}

.step-thumbnail__label {
	margin-bottom: 6px;
}
</style>
