<template>
	<div>
		<a class="thumb-link" :href="modelValue.url" target="_blank"><img :src="modelValue.thumbUrl" /></a>
		<step-image-details v-model="imageDetails" />
		<div class="image-editor__button-bar">
			<q-btn v-if="!fullPage" flat color="secondary" label="Abbrechen" @click="onCancelClick" />
			<q-btn :flat="!fullPage" :disable="!isValid" color="primary" label="Änderungen speichern" @click="onSaveClick" />
		</div>
		<q-inner-loading :showing="saving" />
	</div>
</template>

<script lang="ts">
import { ImageDescriptionDto } from '@app/shared/dto/image/image-desciption.dto';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { notifyError } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageDetailsModel } from '../upload/image-details-model';
import StepImageDetails from '../upload/StepImageDetails.vue';

class Props {
	modelValue = prop<ImageDto>({
		required: true
	});
	fullPage = prop<boolean>({
		default: false
	});
}

@Options({
	name: 'ImageEditor',
	components: {
		StepImageDetails,
	},
	emits: [ 'update:model-value', 'cancel' ]
})
export default class ImageEditor extends Vue.with(Props) {
	imageDetails = {} as ImageDetailsModel;
	saving = false;

	created() {
		this.imageDetails = {
			title: this.modelValue.title,
			description: this.modelValue.description,
			category: this.modelValue.category,
			credits: this.modelValue.credits,
			event: this.modelValue.eventId ? {
				id: this.modelValue.eventId,
				title: this.modelValue.eventTitle!,
				startDateTime: -1
			} : null
		};
	}

	get isValid() {
		return (this.imageDetails.category === ImageCategory.UNLISTED || !!this.imageDetails.title)
      && !!this.imageDetails.credits;
	}

	onCancelClick() {
		this.$emit('cancel');
	}

	async onSaveClick() {
		try {
      this.saving = true;

			const imageDescriptionDto = new ImageDescriptionDto({
				title: this.imageDetails.title,
				description: this.imageDetails.description,
				category: this.imageDetails.category,
				credits: this.imageDetails.credits,
			});

			if (this.imageDetails.event) {
				Object.assign(imageDescriptionDto, { eventId: this.imageDetails.event.id });
			}

      await this.$api.images.saveImage(this.modelValue.id, imageDescriptionDto);
			Object.assign(this.modelValue, imageDescriptionDto);
			
			if (this.imageDetails.event) {
				this.modelValue.eventTitle = this.imageDetails.event.title;
			} else {
				this.modelValue.eventId = null;
				this.modelValue.eventTitle = null;
			}

			this.$emit('update:model-value', this.modelValue);
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
	}
}
</script>

<style lang="scss">
.image-editor__button-bar {
	margin-top: 8px;
	text-align: right;
}
</style>
