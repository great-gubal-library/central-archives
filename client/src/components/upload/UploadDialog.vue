<template>
	<q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card ref="card" class="upload-dialog q-dialog-plugin" :class="{ 'upload-dialog_dragging': dragging }" @dragenter.capture="onDragEnter" @dragover.capture="onDragOver" @drop.capture="onDrop">
      <step-select-image v-if="step === Step.SELECT_IMAGE" v-model="fileModel" />
      <q-card-actions align="right">
        <q-btn flat color="secondary" label="Cancel" @click="onCancelClick" />
				<template v-if="step === Step.SELECT_IMAGE">
					<q-btn :disable="!fileModel.image" flat color="primary" label="Next >" @click="step = Step.UPLOAD" />
				</template>
				<template v-else>
        	<q-btn flat color="primary" label="Upload" @click="onOKClick" />
				</template>
      </q-card-actions>
			<div class="upload-dialog__drag-overlay" v-show="dragging" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop.capture="onDrop">
				Drop file here
			</div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import StepSelectImage from './StepSelectImage.vue';
import { ImageSelectModel } from './image-select-model';

enum Step {
	SELECT_IMAGE = 'SELECT_IMAGE',
	UPLOAD = 'UPLOAD'
}

interface DialogRef {
	show(): void;
	hide(): void;
}

@Options({
	components: {
		StepSelectImage,
	},
	emits: [
		'ok', 'hide'
	]
})
export default class UploadDialog extends Vue {
	private readonly Step = Step;

	private dragging = false;
	private step = Step.SELECT_IMAGE;
	private fileModel: ImageSelectModel = {
		file: null,
		image: null,
	};

	show () {
		(this.$refs.dialog as DialogRef).show()
	}

	hide () {
		(this.$refs.dialog as DialogRef).hide()
	}

	onDragEnter(e: DragEvent) {
		console.log('dragenter', e.target);
		this.dragging = true;
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
				image: null
			};
			this.step = Step.SELECT_IMAGE;
		}
	}

	onDialogHide() {
		this.$emit('hide')
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
