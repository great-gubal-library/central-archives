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
      <step-select-image
        v-if="step === Step.SELECT_IMAGE"
        v-model="fileModel"
      />
      <step-thumbnail
        v-else-if="step === Step.THUMBNAIL"
        :image="fileModel.image"
        v-model="thumbModel"
      />
			<div v-else></div>
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
          v-if="!canUpload"
          :disable="!canGoNext"
          flat
          color="primary"
          label="Next >"
          @click="goNext"
        />
        <q-btn v-else flat color="primary" label="Upload" @click="onOKClick" />
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
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import StepSelectImage from './StepSelectImage.vue';
import StepThumbnail from './StepThumbnail.vue';
import { ImageSelectModel } from './image-select-model';
import { ImageThumbModel } from './image-thumb-model';

enum Step {
  SELECT_IMAGE = 'SELECT_IMAGE',
  THUMBNAIL = 'THUMBNAIL',
  IMAGE_INFO = 'IMAGE_INFO',
}

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  components: {
    StepSelectImage,
    StepThumbnail,
  },
  emits: ['ok', 'hide'],
})
export default class UploadDialog extends Vue {
  private readonly Step = Step;

  private dragging = false;
  private step = Step.SELECT_IMAGE;
  private fileModel: ImageSelectModel = {
    file: null,
    image: null,
  };
  private thumbModel: ImageThumbModel = {
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
        image: null,
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
      case Step.IMAGE_INFO:
        this.step = Step.THUMBNAIL;
        return;
    }
  }

	get canGoNext() {
		switch (this.step) {
      case Step.SELECT_IMAGE:
        return !!this.fileModel.image;
      case Step.THUMBNAIL:
        return this.thumbModel.left !== -1;
      case Step.IMAGE_INFO:
        return true; // temp
    }
	}

  goNext() {
    switch (this.step) {
      case Step.SELECT_IMAGE:
        this.step = Step.THUMBNAIL;
        return;
      case Step.THUMBNAIL:
        this.step = Step.IMAGE_INFO;
        return;
      case Step.IMAGE_INFO:
        return;
    }
  }

	get canUpload() {
		return this.step === Step.IMAGE_INFO;
	}

  onDialogHide() {
    this.$emit('hide');
  }

  onOKClick() {
    this.$emit('ok');
    this.hide();
  }

  onCancelClick() {
    this.hide();
  }
}
</script>

<style lang="scss">
.upload-dialog {
  padding-left: 16px;
  padding-right: 16px;
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
</style>
