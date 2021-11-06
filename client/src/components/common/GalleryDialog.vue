<template>
	<q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="gallery-dialog">
			<h5>Select Image</h5>
			<section class="gallery-dialog__image-list">
				<thumb-gallery :images="images" :links="false" @select="onImageSelect" />
			</section>
			<q-card-actions align="right">
				<q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
			</q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Options, Vue } from 'vue-class-component';
import ThumbGallery from '../images/ThumbGallery.vue';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
	components: {
		ThumbGallery,
	},
  emits: ['ok', 'hide'],
})
export default class ConfirmImageDeleteDialog extends Vue {
	images: ImageSummaryDto[] = [];

	async created() {
		const characterId = this.$store.state.user?.character.id;

		if (!characterId) {
			return;
		}

		this.images = (await this.$api.getMyImages(characterId)).map(image => ({
			id: image.id,
			title: image.title,
			filename: image.filename,
			thumbUrl: image.thumbUrl,
			url: image.url,
			createdAt: image.createdAt,
			width: image.width,
			height: image.height,
		}));
	}

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

	onImageSelect(image: ImageSummaryDto) {
		this.$emit('ok', image);
		this.hide();
	}
}
</script>

<style lang="scss">
.gallery-dialog {
  width: 800px;
	padding: 8px 24px;
}

@media (min-width: 1280px) {
	.q-dialog__inner--minimized > .gallery-dialog {
		max-width: 800px;
	}
}

.gallery-dialog__image-list {
	height: 50vh;
	overflow-x: hidden;
	overflow-y: auto;
}
</style>
