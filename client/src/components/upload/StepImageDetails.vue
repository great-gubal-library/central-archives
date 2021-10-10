<template>
	<div class="step-image-details">
		Category:
		<q-option-group
			v-model="modelValue.category"
			:options="categories"
			color="primary"
			inline
		/>
		<div class="text-caption">{{categoryHints[modelValue.category]}}</div>
		<q-slide-transition>
			<section v-if="modelValue.category !== ImageCategory.UNLISTED">
				<q-input label="Title" v-model="modelValue.title" />
				<div class="step-image-details__description-label">Description:</div>
				<html-editor v-model="modelValue.description" height="200px" />
			</section>
		</q-slide-transition>
		<q-input class="step-image-details__credits" label="Credits" v-model="modelValue.credits" />
		<div class="text-caption">Please credit the creator of the image. If you made it yourself, write “made by me” or similar. Do not post copyrighted content without permission.</div>
	</div>
</template>

<script lang="ts">
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageDetailsModel } from './image-details-model';
import HtmlEditor from 'components/common/HtmlEditor.vue';

class Props {
	modelValue = prop<ImageDetailsModel>({
		default: null
	});
}

@Options({
	components: {
		HtmlEditor,
	},
	emits: [
		'update:model-value'
	]
})
export default class StepImageDetails extends Vue.with(Props) {
	readonly ImageCategory = ImageCategory;

	categories: { label: string, value: ImageCategory }[];

	categoryHints = {
		[ImageCategory.UNLISTED]: 'Your image will not be shown on the front page and in galleries.',
		[ImageCategory.ARTWORK]: 'Your image will be shown in artwork galleries.',
		[ImageCategory.SCREENSHOT]: 'Your image will be shown in screenshot galleries.',
	};

	created() {
		this.categories = Object.keys(this.$display.imageCategories).map(category => ({
			label: this.$display.imageCategories[category],
			value: category as ImageCategory
		}));
	}
}
</script>

<style lang="scss">
.step-image-details__description-label {
		margin-top: 16px;
    margin-bottom: 8px;
}

.step-image-details__credits {
	margin-top: 8px;
}
</style>
