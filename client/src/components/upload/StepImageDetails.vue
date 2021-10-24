<template>
  <q-form class="step-image-details">
    Category:
    <q-option-group
      v-model="modelValue.category"
      :options="categories"
      color="primary"
      inline
      @update:model-value="onModelUpdated"
    />
    <div class="text-caption">{{ categoryHints[modelValue.category] }}</div>
    <q-slide-transition>
      <section v-if="modelValue.category !== ImageCategory.UNLISTED">
        <q-input
          label="Title *"
          v-model="modelValue.title"
          :rules="[$rules.required('This field is required.')]"
          @update:model-value="onModelUpdated"
        />
        <div class="step-image-details__description-label">Description:</div>
        <html-editor
          v-model="modelValue.description"
          :allow-images="false"
          height="200px"
          @update:model-value="onModelUpdated"
        />
      </section>
    </q-slide-transition>
    <q-input
      class="step-image-details__credits"
      label="Credits *"
      v-model="modelValue.credits"
      :rules="[$rules.required('This field is required.')]"
      @update:model-value="onModelUpdated"
    />
    <div class="text-caption">
      Please credit the creator of the image. If you made it yourself, write
      “made by me” or similar. Do not post copyrighted content without
      permission.
    </div>
  </q-form>
</template>

<script lang="ts">
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import HtmlEditor from 'components/common/HtmlEditor.vue';
import { QForm } from 'quasar';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageDetailsModel } from './image-details-model';

class Props {
  modelValue = prop<ImageDetailsModel>({
    default: null,
  });
}

@Options({
  components: {
    HtmlEditor,
  },
  emits: ['update:model-value'],
})
export default class StepImageDetails extends Vue.with(Props) {
  readonly ImageCategory = ImageCategory;

  categories: { label: string; value: ImageCategory }[];

  categoryHints = {
    [ImageCategory.UNLISTED]:
      'Your image will not be shown on the front page and in galleries.',
    [ImageCategory.ARTWORK]: 'Your image will be shown in artwork galleries.',
    [ImageCategory.SCREENSHOT]:
      'Your image will be shown in screenshot galleries.',
  };

  created() {
    this.categories = Object.keys(this.$display.imageCategories).map(
      (category) => ({
        label: this.$display.imageCategories[category],
        value: category as ImageCategory,
      })
    );
  }

	onModelUpdated() {
		this.$emit('update:model-value', this.modelValue);
	}

  validate(): Promise<boolean> {
    return (this.$refs.form as QForm).validate();
  }
}
</script>

<style lang="scss">
.step-image-details__description-label {
  margin-top: 8px;
  margin-bottom: 8px;
}

.step-image-details__credits {
  margin-top: 8px;
}
</style>
