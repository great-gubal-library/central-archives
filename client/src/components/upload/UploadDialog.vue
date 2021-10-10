<template>
	<q-dialog ref="dialog" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="upload-dialog q-dialog-plugin">
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
</style>
