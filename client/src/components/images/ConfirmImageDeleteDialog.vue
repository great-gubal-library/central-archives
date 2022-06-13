<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="confirm-image-delete-dialog">
			<h5>Confirm Image Deletion</h5>
			<q-img :src="image.url" fit="contain" />
			<p>Are you sure you want to delete this image? <strong>This operation cannot be undone.</strong></p>
      <p v-if="forceConfirming">
        <strong>{{forceConfirmMessage}}.</strong> Do you still want to delete it and unlink it from every page that uses it as a banner?
      </p>
			<q-card-actions align="right">
				<q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
				<q-btn flat color="negative" :label="!forceConfirming ? 'Delete' : 'Delete Anyway'" @click="onDeleteClick" />
			</q-card-actions>
			<q-inner-loading :showing="deleting" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
import { notifyError } from '@common/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
	image = prop<ImageDto>({
		required: true
	})
}

@Options({
  emits: ['ok', 'hide'],
})
export default class ConfirmImageDeleteDialog extends Vue.with(Props) {
  forceConfirming = false;
  forceConfirmMessage = '';
	deleting = false;

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

  async onDeleteClick() {
		try {
      this.deleting = true;

			await this.$api.images.deleteImage(this.image.id, this.forceConfirming);

      this.$emit('ok');
    	this.hide();
    } catch (e) {
      if (errors.getStatusCode(e) === 409) {
        // Conflict: used as a banner
        this.forceConfirming = true;
        this.forceConfirmMessage = errors.getMessage(e);
      } else {
        notifyError(e);
      }
    } finally {
      this.deleting = false;
    }
  }
}
</script>

<style lang="scss">
.confirm-image-delete-dialog {
	padding: 8px 24px;
}

.confirm-image-delete-dialog .q-img {
	max-height: 50vh;
	height: auto;
	margin-bottom: 16px;
}
</style>
