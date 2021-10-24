<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="confirm-image-delete-dialog">
			<h5>Confirm Image Deletion</h5>
			<q-img :src="image.url" fit="contain" />
			Are you sure you want to delete this image? <strong>This operation cannot be undone.</strong>
			<q-card-actions align="right">
				<q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
				<q-btn flat color="negative" label="Delete" @click="onDeleteClick" />
			</q-card-actions>
			<q-inner-loading v-if="deleting" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
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

			await this.$api.deleteImage(this.image.id);

      this.$emit('ok');
    	this.hide();
    } catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative',
      });
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
