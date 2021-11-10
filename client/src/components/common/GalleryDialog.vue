<template>
	<q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="gallery-dialog">
			<h5>Select Image</h5>
			<section class="gallery-dialog__image-list">
				<thumb-gallery :images="images" :links="false" @select="onImageSelect" />
			</section>
			<q-card-actions class="gallery-dialog__buttons">
				<q-btn flat color="secondary" icon="upload" label="Upload new" @click="onUploadClick" />
				<q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
			</q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import SharedConstants from '@app/shared/SharedConstants';
import { timeStamp } from 'console';
import { Options, prop, Vue } from 'vue-class-component';
import ThumbGallery from '../images/ThumbGallery.vue';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
	banner = prop<boolean>({
		default: false
	});
}

@Options({
	components: {
		ThumbGallery,
	},
  emits: ['ok', 'hide'],
})
export default class ConfirmImageDeleteDialog extends Vue.with(Props) {
	images: ImageSummaryDto[] = [];

	async created() {
		const characterId = this.$store.getters.characterId;

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

		if (this.banner) {
			this.images = this.images.filter(image => image.width / image.height >= SharedConstants.MIN_BANNER_ASPECT_RATIO);
		}
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

  async onUploadClick() {
    const UploadDialog = (await import('components/upload/UploadDialog.vue')).default;

    this.$q.dialog({
      component: UploadDialog,
			componentProps: {
				banner: this.banner
			}
    }).onOk((image: ImageSummaryDto) => {
      this.onImageSelect(image);
    });
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

.gallery-dialog__buttons {
	justify-content: space-between;
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
