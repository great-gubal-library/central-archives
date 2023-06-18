<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card
      ref="card"
      class="replace-image-dialog q-dialog-plugin"
      :class="{ 'replace-image-dialog_dragging': dragging }"
      @dragenter.capture="onDragEnter"
      @dragover.capture="onDragOver"
      @drop.capture="onDrop"
    >
      <h5>{{ banner ? 'Replace Banner' : 'Replace Image' }}</h5>
			<q-stepper class="replace-image-dialog__stepper" v-model="step" color="primary" animated>
				<q-step :name="Step.SELECT_IMAGE" title="Select new image" icon="folder_open" active-icon="folder_open" :done="step !== Step.SELECT_IMAGE">
					<step-select-image
            :banner="banner"
						v-model="fileModel"
					/>
				</q-step>
				<q-step :name="Step.THUMBNAIL" title="Customize thumbnail" icon="image" active-icon="image">
					<step-thumbnail
						:image="fileModel.image"
						v-model="thumbModel"
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
					v-if="step !== Step.THUMBNAIL"
					:disable="!canGoNext"
					flat
					color="primary"
					label="Next >"
					@click="goNext"
				/>
				<q-btn v-else :disable="!canReplaceImage" color="primary" label="Replace image" @click="onReplaceImageClick" />
			</q-card-actions>
      <div
        class="replace-image-dialog__drag-overlay"
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
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageSelectModel, defaultImageSelectModel } from './image-select-model';
import { ImageThumbModel } from './image-thumb-model';
import StepImageDetails from './StepImageDetails.vue';
import StepSelectImage from './StepSelectImage.vue';
import StepThumbnail from './StepThumbnail.vue';
import { ImageReplaceRequestDto } from '@app/shared/dto/image/image-replace-request.dto';

enum Step {
  SELECT_IMAGE = 'SELECT_IMAGE',
  THUMBNAIL = 'THUMBNAIL',
}

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
  id = prop<number>({
    required: true
  })

	banner = prop<boolean>({
		default: false
	});
}

const MIN_BANNER_ASPECT_RATIO = SharedConstants.MIN_BANNER_ASPECT_RATIO;

@Options({
  components: {
    StepSelectImage,
    StepThumbnail,
		StepImageDetails,
  },
  emits: ['ok', 'hide'],
})
export default class ReplaceImageDialog extends Vue.with(Props) {
  readonly Step = Step;

  dragging = false;
  uploading = false;

  step = Step.SELECT_IMAGE;
  fileModel: ImageSelectModel = defaultImageSelectModel();
  thumbModel: ImageThumbModel = {
    left: -1,
    top: -1,
    width: -1,
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
    }
  }

	get canGoNext() {
		switch (this.step) {
      case Step.SELECT_IMAGE:
        return !!this.fileModel.image
            && !!this.fileModel.convertedFile
            && this.fileModel.convertedFile.size <= SharedConstants.MAX_UPLOAD_SIZE
            && (!this.banner || (this.fileModel.image.width / this.fileModel.image.height >= MIN_BANNER_ASPECT_RATIO));
      case Step.THUMBNAIL:
        return false;
    }
	}

  goNext() {
    switch (this.step) {
      case Step.SELECT_IMAGE:
        this.step = Step.THUMBNAIL;
        return;
      case Step.THUMBNAIL:
        return;
    }
  }

	get canReplaceImage() {
		return this.step === Step.THUMBNAIL && this.thumbModel.left !== -1;
	}

  onDialogHide() {
    this.$emit('hide');
  }

  async onReplaceImageClick() {
    try {
      this.uploading = true;

      const imageDto = await this.replaceImage();

      notifySuccess('Image replaced.');
      this.$emit('ok', imageDto);
      this.hide();
    } catch (e) {
      notifyError(e);
    } finally {
      this.uploading = false;
    }
  }

  private async replaceImage(): Promise<ImageSummaryDto> {
    const characterId = this.$store.getters.characterId;
    const { convertedFile, filename } = this.fileModel;

    if (!characterId || !convertedFile || !filename) {
      throw new Error();
    }

    // Converts if necessary, otherwise leaves the original file intact
    const imageDto: ImageReplaceRequestDto = {
      thumbLeft: this.thumbModel.left,
      thumbTop: this.thumbModel.top,
      thumbWidth: this.thumbModel.width,
    };

    return this.$api.images.replaceImage(this.id, imageDto, convertedFile, filename);
  }

  onCancelClick() {
    this.hide();
  }
}
</script>

<style lang="scss">
.replace-image-dialog {
  width: 800px;
}

@media (min-width: 1280px) {
	.q-dialog__inner--minimized > .replace-image-dialog {
		max-width: 800px;
	}
}

.replace-image-dialog h5 {
  margin-left: 20px;
}

.replace-image-dialog .q-stepper--horizontal .q-stepper__step-inner {
	padding: 16px 24px 0px 24px;
}

.replace-image-dialog__stepper .q-panel.scroll {
	overflow: hidden;
}

.replace-image-dialog img {
  max-width: 100%;
  height: auto;
}

.replace-image-dialog h6 {
  font-family: $form-header-font;
  font-size: 1.2em;
}

.replace-image-dialog_dragging > * {
  visibility: hidden;
}

.replace-image-dialog__drag-overlay {
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

.replace-image-dialog .q-inner-loading {
  z-index: 2;
}
</style>
