<template>
	<div>
		<h5>Select Image</h5>
		<q-file filled bottom-slots :model-value="modelValue.file" label="Select image" counter @update:model-value="selectFile">
			<template v-slot:prepend>
				<q-icon name="image" @click.stop />
			</template>
			<template v-slot:append>
				<q-icon name="close" @click.stop.prevent="selectFile(null)" class="cursor-pointer" />
			</template>
			<template v-slot:hint></template>
		</q-file>
		<template v-if="modelValue.image">
			<h6>Preview</h6>
			<q-img :src="modelValue.image.src" />
		</template>
		<q-banner v-if="modelValue.file && !modelValue.image" class="bg-negative text-white">
			Not an image file.
		</q-banner>
		<q-banner v-if="!modelValue.file">
			You can also drop a file here from your file manager.
		</q-banner>
	</div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import { readImage } from 'src/common/read-image';
import { ImageSelectModel } from './image-select-model';

class Props {
	modelValue = prop<ImageSelectModel>({
		default: {
			file: null,
			image: null
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
					console.log('file updated');
					void (this as StepSelectImage).selectFile(newValue.file);
				}
			}
		}
	}
})
export default class StepSelectImage extends Vue.with(Props) {
	async selectFile(file: File|null) {
		try {
			const image = await this.readImage(file);
			this.$emit('update:model-value', {
				file,
				image
			});
		} catch (e) {
			this.$emit('update:model-value', {
				file,
				image: null
			});
		}
	}

	async readImage(file: File|null): Promise<HTMLImageElement|null> {
		if (!file) {
			return null;
		}

		return readImage(file);
	}
}
</script>

<style lang="scss">

</style>
