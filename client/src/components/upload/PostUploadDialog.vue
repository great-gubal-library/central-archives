<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="post-upload-dialog">
			<h5>Image Uploaded!</h5>
			Your image has been successfully uploaded. Click it to copy the URL to clipboard.
			<q-img :src="image.url" fit="contain" @click="copyUrl" />
			<q-input
			label="Image URL"
				readonly
				filled
				dense
				:model-value="image.url"
			>
				<template v-slot:append>
					<q-btn flat dense icon="content_copy" title="Copy to clipboard" @click="copyUrl" />
				</template>
			</q-input>
			<q-card-actions align="right">
				<q-btn flat color="primary" label="Close" @click="onCancelClick" />
			</q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from '@common/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
	image = prop<ImageSummaryDto>({
		required: true
	})
}

@Options({
  emits: ['hide'],
})
export default class PostUploadDialog extends Vue.with(Props) {
  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  onDialogHide() {
    this.$emit('hide');
  }

  onCancelClick() {
    this.hide();
  }

	async copyUrl() {
		try {
			await copyToClipboard(this.image.url);
			notifySuccess('Image URL copied to clipboard.');
		} catch (e) {
			notifyError('Error copying image URL to clipboard.');
		}
	}
}
</script>

<style lang="scss">
.post-upload-dialog {
	padding: 8px 24px;
}

.post-upload-dialog .q-img {
	max-height: 50vh;
	height: auto;
}

.post-upload-dialog .q-img img {
	cursor: pointer;
}

</style>
