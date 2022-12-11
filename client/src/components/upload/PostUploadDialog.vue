<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="post-upload-dialog">
			<h5>Bild hochgeladen!</h5>
			Dein Bild wurde erfolgreich hochgeladen. Klick hier um den URL in der Zwischenablage zu speichern.
			<q-img :src="image.url" fit="contain" @click="copyUrl" />
			<q-input
			label="Image URL"
				readonly
				filled
				dense
				:model-value="image.url"
			>
				<template v-slot:append>
					<q-btn flat dense icon="content_copy" title="In Zwischenablage speichern" @click="copyUrl" />
				</template>
			</q-input>
			<q-card-actions align="right">
				<q-btn flat color="primary" label="Schließen" @click="onCancelClick" />
			</q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
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
			notifySuccess('URL in Zwischenablage gespeichert.');
		} catch (e) {
			notifyError('Fehler beim speichern in die Zwischenablage.');
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
