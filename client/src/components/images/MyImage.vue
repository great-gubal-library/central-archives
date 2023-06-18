<template>
  <q-card class="my-image">
    <q-card-section>
      <template v-if="!editing">
        <div class="flex">
          <div class="my-image__thumb-column">
            <a class="thumb-link" :href="image.url" target="_blank"><img :src="image.thumbUrl" /></a>
						<q-btn flat color="secondary" icon="upload" label="Replace..." @click="onReplaceClick" />
          </div>
          <div class="my-image__description-column">
            <div>
              <h5 v-if="image.category === ImageCategory.UNLISTED">Unlisted image</h5>
              <h5 v-else>
                <a :href="`/image/${image.id}`" target="_blank">{{ image.title }}</a>
              </h5>
              <html-viewer :content="image.description" />
            </div>
            <div class="text-right">
              <q-btn flat color="primary" label="Edit" @click="onEditClick" />
              <q-btn flat color="negative" label="Delete" @click="onDeleteClick" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <image-editor :model-value="image" @update:model-value="onSaved" @cancel="onEditCancel" />
      </template>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';
import HtmlViewer from '../common/HtmlViewer.vue';
import { ImageDetailsModel } from '../upload/image-details-model';
import ImageEditor from './ImageEditor.vue';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';

class Props {
  image = prop<ImageDto>({
    required: true,
  });
}

@Options({
  name: 'MyImage',
  components: {
    HtmlViewer,
    ImageEditor,
  },
  emits: ['saved', 'deleted'],
})
export default class MyImage extends Vue.with(Props) {
  readonly ImageCategory = ImageCategory;
  imageDetails = {} as ImageDetailsModel;
  editing = false;

  onEditClick() {
    this.editing = true;
  }

  onSaved() {
    this.editing = false;
    this.$emit('saved', this.image);

    notifySuccess('Changes saved.');
  }

  onEditCancel() {
    this.editing = false;
  }

  async onDeleteClick() {
    const ConfirmImageDeleteDialog = (await import('./ConfirmImageDeleteDialog.vue')).default;

    this.$q
      .dialog({
        component: ConfirmImageDeleteDialog,
        componentProps: {
          image: this.image,
        },
      })
      .onOk(() => {
        this.$emit('deleted', this.image);
      });
  }

	async onReplaceClick() {
		const isBanner = (await this.$api.images.isBanner(this.image.id)).isBanner;
		const ReplaceImageDialog = (await import('../upload/ReplaceImageDialog.vue')).default;

		this.$q
      .dialog({
        component: ReplaceImageDialog,
        componentProps: {
          id: this.image.id,
					banner: isBanner,
        },
      })
      .onOk((result: ImageSummaryDto) => {
				Object.assign(this.image, {
					url: result.url,
					thumbUrl: result.thumbUrl,
					filename: result.filename,
					width: result.width,
					height: result.height,
				});
				
				notifySuccess('Image replaced.');
      });
	}
}
</script>

<style lang="scss">
.my-image {
  margin-bottom: 16px;
}

.my-image__thumb-column {
  padding-right: 16px;
	display: flex;
	flex-direction: column;
}

.my-image__description-column {
  flex-basis: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
