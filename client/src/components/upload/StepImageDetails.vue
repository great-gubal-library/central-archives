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
    <q-select
      class="step-select-image__event-link"
      v-model="modelValue.event"
      :display-value="modelValue.event ? modelValue.event.title : null"
      :options="eventOptions"
      :option-label="(option) => `${option.title} (${$display.formatDate(option.startDateTime)})`"
      hide-dropdown-icon
      use-input
      clearable
      input-debounce="200"
      label="Event link"
      hint="Start typing, and we will attempt to find the event."
      @filter="onEventFilter"
      @update:model-value="onModelUpdated"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </q-form>
</template>

<script lang="ts">
import { EventSearchResultDto } from '@app/shared/dto/events/event-search-result.dto';
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
  name: 'StepImageDetails',
  components: {
    HtmlEditor,
  },
  emits: ['update:model-value'],
})
export default class StepImageDetails extends Vue.with(Props) {
  readonly ImageCategory = ImageCategory;

  categories: { label: string; value: ImageCategory }[];

  eventOptions: EventSearchResultDto[] = [];
  eventOptionsSearchString = '';

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

  async onEventFilter(value: string, update: () => void, abort: () => void) {
    value = value.trim();

    if (!value) {
      abort();
      return;
    }

    try {
      this.eventOptionsSearchString = value;
      const results = await this.$api.events.searchEvents(value);

      if (this.eventOptionsSearchString !== value) {
        // Too late
        return;
      }

      this.eventOptions = results;      
      update();
    } catch (e) {
      abort();
      throw e;
    }
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
