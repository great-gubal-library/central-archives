<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card
      ref="card"
      class="upload-dialog q-dialog-plugin"
      :class="{ 'upload-dialog_dragging': dragging }"
      @dragenter.capture="onDragEnter"
      @dragover.capture="onDragOver"
      @drop.capture="onDrop"
    >
			<q-stepper class="upload-dialog__stepper" v-model="step" color="primary" animated>
				<q-step :name="Step.SELECT_IMAGE" title="Select image" icon="folder_open" active-icon="folder_open" :done="step !== Step.SELECT_IMAGE">
					<step-select-image
						v-model="fileModel"
					/>
				</q-step>
				<q-step :name="Step.THUMBNAIL" title="Customize thumbnail" icon="image" active-icon="image" :done="step === Step.IMAGE_DETAILS">
					<step-thumbnail
						:image="fileModel.image"
						v-model="thumbModel"
					/>
				</q-step>
				<q-step :name="Step.IMAGE_DETAILS" title="Fill in details" icon="edit" active-icon="edit">
					<step-image-details
						v-model="detailsModel"
					/>
				</q-step>
			</q-stepper>
			<q-card-actions align="right">
				<q-btn flat color="secondary" label="Cancel" @click="onCancelClick" />
				<q-btn
					v-if="canGoBack"
					flat
					color="secondary"
					label="< Back"
					@click="goBack"
				/>
				<q-btn
					v-if="step !== Step.IMAGE_DETAILS"
					:disable="!canGoNext"
					flat
					color="primary"
					label="Next >"
					@click="goNext"
				/>
				<q-btn v-else :disable="!canUpload" color="primary" label="Upload" @click="onUploadClick" />
			</q-card-actions>
      <div
        class="upload-dialog__drag-overlay"
        v-show="dragging"
        @dragenter="onDragEnter"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop.capture="onDrop"
      >
        Drop file here
      </div>
      <q-inner-loading :showing="uploading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import StepSelectImage from './StepSelectImage.vue';
import StepThumbnail from './StepThumbnail.vue';
import StepImageDetails from './StepImageDetails.vue';
import { ImageSelectModel } from './image-select-model';
import { ImageThumbModel } from './image-thumb-model';
import { ImageDetailsModel } from './image-details-model';
import { ImageCategory } from '@app/shared/enums/image-category.enum';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import errors from '@app/shared/errors';
import SharedConstants from '@app/shared/SharedConstants';

enum Step {
  SELECT_IMAGE = 'SELECT_IMAGE',
  THUMBNAIL = 'THUMBNAIL',
  IMAGE_DETAILS = 'IMAGE_DETAILS',
}

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  components: {
    StepSelectImage,
    StepThumbnail,
		StepImageDetails,
  },
  emits: ['ok', 'hide'],
})
export default class UploadDialog extends Vue {
  readonly Step = Step;

  dragging = false;
  uploading = false;

  step = Step.SELECT_IMAGE;
  fileModel: ImageSelectModel = {
    file: null,
    filename: null,
    image: null,
    originalFormat: null,
    format: null,
    convertedFile: null,
    hasTransparency: false,
  };
  thumbModel: ImageThumbModel = {
    left: -1,
    top: -1,
    width: -1,
  };
  detailsModel: ImageDetailsModel = {
		category: ImageCategory.UNLISTED,
    title: '',
		description: '',
    credits: '',
  };

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  onDragEnter(e: DragEvent) {
    const files = e.dataTransfer?.items || null;

    if (files && files.length > 0 && files[0].kind === 'file') {
      this.dragging = true;
    }

    e.stopPropagation();
    e.preventDefault();
  }

  onDragOver(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  onDragLeave(e: DragEvent) {
    console.log('dragleave', e.target);
    this.dragging = false;
    e.stopPropagation();
    e.preventDefault();
  }

  onDrop(e: DragEvent) {
    this.dragging = false;
    e.stopPropagation();
    e.preventDefault();

    const files = e.dataTransfer?.items || null;

    if (files && files.length > 0 && files[0].kind === 'file') {
      this.fileModel = {
        file: files[0].getAsFile(),
        filename: null,
        image: null,
        originalFormat: null,
        format: null,
        convertedFile: null,
        hasTransparency: false,
      };
      this.step = Step.SELECT_IMAGE;
    }
  }

	get canGoBack() {
		return this.step !== Step.SELECT_IMAGE;
	}

  goBack() {
    switch (this.step) {
      case Step.SELECT_IMAGE:
        return;
      case Step.THUMBNAIL:
        this.thumbModel = {
          left: -1,
          top: -1,
          width: -1,
        };
        this.step = Step.SELECT_IMAGE;
        return;
      case Step.IMAGE_DETAILS:
        this.step = Step.THUMBNAIL;
        return;
    }
  }

	get canGoNext() {
		switch (this.step) {
      case Step.SELECT_IMAGE:
        return !!this.fileModel.image
            && !!this.fileModel.convertedFile
            && this.fileModel.convertedFile.size <= SharedConstants.MAX_UPLOAD_SIZE;
      case Step.THUMBNAIL:
        return this.thumbModel.left !== -1;
      case Step.IMAGE_DETAILS:
        return false;
    }
	}

  goNext() {
    switch (this.step) {
      case Step.SELECT_IMAGE:
        this.step = Step.THUMBNAIL;
        return;
      case Step.THUMBNAIL:
        this.step = Step.IMAGE_DETAILS;
        return;
      case Step.IMAGE_DETAILS:
        return;
    }
  }

	get canUpload() {
		return this.step === Step.IMAGE_DETAILS
      && (this.detailsModel.category === ImageCategory.UNLISTED || !!this.detailsModel.title)
      && !!this.detailsModel.credits;
	}

  onDialogHide() {
    this.$emit('hide');
  }

  async onUploadClick() {
    try {
      this.uploading = true;

      const imageDto = await this.upload();

      this.$q.notify({
        message: 'Image uploaded.',
        type: 'positive',
      });

      this.$emit('ok', imageDto);
      this.hide();
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
    } finally {
      this.uploading = false;
    }
  }

  private async upload(): Promise<ImageSummaryDto> {
    const characterId = this.$store.getters.characterId;
    const { convertedFile, filename } = this.fileModel;

    if (!characterId || !convertedFile || !filename) {
      throw new Error();
    }

    // Converts if necessary, otherwise leaves the original file intact

    return this.$api.uploadImage({
      characterId,
      title: this.detailsModel.title,
      description: this.detailsModel.description,
      category: this.detailsModel.category,
      credits: this.detailsModel.credits,
      thumbLeft: this.thumbModel.left,
      thumbTop: this.thumbModel.top,
      thumbWidth: this.thumbModel.width,
    }, convertedFile, filename);
  }

  onCancelClick() {
    this.hide();
  }
}
</script>

<style lang="scss">
.upload-dialog {
  width: 800px;
}

@media (min-width: 1280px) {
	.q-dialog__inner--minimized > .upload-dialog {
		max-width: 800px;
	}
}

.upload-dialog .q-stepper--horizontal .q-stepper__step-inner {
	padding: 16px 24px 0px 24px;
}

.upload-dialog__stepper .q-panel.scroll {
	overflow: hidden;
}

.upload-dialog img {
  max-width: 100%;
  height: auto;
}

.upload-dialog h6 {
  font-family: $form-header-font;
  font-size: 1.2em;
}

.upload-dialog_dragging > * {
  visibility: hidden;
}

.upload-dialog__drag-overlay {
  visibility: visible;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  background: white;
  color: #777;
  outline: 2px dashed #aaa;
  outline-offset: -5px;
}

.upload-dialog .q-inner-loading {
  z-index: 2;
}
</style>
