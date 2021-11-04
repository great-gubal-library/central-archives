<template>
	<div class="step-select-image">
		<q-file filled bottom-slots :model-value="modelValue.file" label="Select image" counter @update:model-value="selectFile">
			<template v-slot:prepend>
				<q-icon name="image" @click.stop />
			</template>
			<template v-slot:append>
				<q-icon name="close" @click.stop.prevent="selectFile(null)" class="cursor-pointer" />
			</template>
			<template v-slot:hint v-if="!modelValue.file">You can also drop a file here from your file manager.</template>
			<template v-slot:counter></template>
		</q-file>
		<template v-if="modelValue.image">
			<h6>Preview</h6>
			<img :src="modelValue.image.src" />
		</template>
		<q-banner v-if="modelValue.file && !modelValue.image" class="bg-negative text-white">
			Not an image file.
		</q-banner>
		<section v-if="modelValue.file && modelValue.image">
			<template v-if="modelValue.originalFormat !== ImageFormat.JPEG">
				<q-radio v-model="modelValue.format" :val="ImageFormat.PNG" :label="modelValue.originalFormat === ImageFormat.PNG ? 'Keep as PNG': 'Convert to PNG'" />
				<q-radio v-model="modelValue.format" :val="ImageFormat.JPEG" label="Convert to JPEG" />
			</template>
			<div class="step-select-image__file-size">File size: {{fileSize}}</div>
		</section>
	</div>
</template>

<script lang="ts">
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import { convertImageElementForUpload, readImage } from 'src/common/images';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageSelectModel } from './image-select-model';

interface ConversionResult {
	blob: Blob,
	filename: string,
	originalFormat: ImageFormat|null,
	newFormat: ImageFormat,
}

class Props {
	modelValue = prop<ImageSelectModel>({
		default: {
			file: null,
			filename: null,
			image: null,
			convertedFile: null,
			originalFormat: null,
			format: null,
		}
	})
}

@Options({
	emits: [
		'update:model-value'
	],
	watch: {
		modelValue: {
			handler(newValue: ImageSelectModel, oldValue: ImageSelectModel) {
				if (newValue.file && (!oldValue || newValue.file !== oldValue.file)) {
					void (this as StepSelectImage).selectFile(newValue.file, newValue.format);
				} else if (newValue.format && (!oldValue || newValue.format !== oldValue.format)) {
					void (this as StepSelectImage).selectFile(newValue.file, newValue.format);
				}
			}
		},
		'modelValue.format': {
			handler(newValue: ImageFormat|null, oldValue: ImageFormat|null) {
				if (newValue !== oldValue) {
					void (this as StepSelectImage).selectFile((this as StepSelectImage).modelValue.file, newValue);
				}
			}
		}
	}
})
export default class StepSelectImage extends Vue.with(Props) {
	readonly ImageFormat = ImageFormat;

	async selectFile(file: File|null, format?: ImageFormat|null) {
		try {
			const image = await this.readImage(file);
			let blob: Blob|null = null;
			let originalFormat: ImageFormat|null = null;
			let newFormat: ImageFormat|null = null;
			let filename: string|null = null;

			if (file !== null && image !== null) {
				const result = await this.convertImage(file, image, format || null);
				blob = result.blob;
				originalFormat = result.originalFormat;
				newFormat = result.newFormat;
				filename = result.filename;
			}

			this.$emit('update:model-value', {
				file,
				filename,
				convertedFile: blob,
				originalFormat,
				format: newFormat,
				image
			});
		} catch (e) {
			console.log(e);
			this.$emit('update:model-value', {
				file,
				filename: null,
				image: null,
				convertedFile: null,
				originalFormat: null,
				format: null,
			});
		}
	}

	async readImage(file: File|null): Promise<HTMLImageElement|null> {
		if (!file) {
			return null;
		}

		return readImage(file);
	}

	async convertImage(file: File, image: HTMLImageElement, format: ImageFormat|null): Promise<ConversionResult> {
		if (file.type === 'image/jpeg') {
			// We don't need to convert
			return {
				blob: file,
				filename: file.name,
				originalFormat: ImageFormat.JPEG,
				newFormat: ImageFormat.JPEG
			};
		}

		let originalFormat: ImageFormat|null = null;

		if (file.type === 'image/png') {
			originalFormat = ImageFormat.PNG;
			
			if (format === ImageFormat.PNG || !format === null) {
				return {
					blob: file,
					filename: file.name,
					originalFormat: ImageFormat.PNG,
					newFormat: ImageFormat.PNG
				};
			}
		}

		// We need to convert
		const newFormat = format || ImageFormat.PNG;
		console.log('converting to ' + newFormat);
		const result = await convertImageElementForUpload(image, file.name, newFormat);

		return {
			blob: result.blob,
			filename: result.filename,
			originalFormat,
			newFormat
		};
	}

	get fileSize(): string {
		if (this.modelValue.convertedFile === null) {
			return '';
		}

		return this.$display.formatFileSize(this.modelValue.convertedFile.size);
	}
}
</script>

<style lang="scss">
.step-select-image img {
	max-height: 50vh;
}
</style>
