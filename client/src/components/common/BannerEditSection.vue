<template>
	<section class="banner-edit-section">
		<h6>Banner</h6>
		<p class="text-caption">
			Banner sollten ein Seitenverhältnis von 4:1 breite:höhe haben. Beispielsweise ist 500&times;100 und 400&times;100 in Ordnung, aber
	    300&times;100 aber nicht.
		</p>
		<q-responsive v-if="!modelValue" class="banner-edit-section__placeholder" :ratio="4 / 1">
			<div>Kein Banner</div>
		</q-responsive>
		<q-img
			v-else
			class="banner-edit-section__banner"
			:src="modelValue.url"
			:initial-ratio="modelValue.width / modelValue.height"
		/>
		<div class="text-right">
			<q-btn
				v-if="modelValue"
				flat
				label="Entfernen"
				icon="remove"
				color="negative"
				@click="onBannerRemoveClick"
			/>&nbsp;
			<q-btn flat label="Auswählen" icon="collections" color="secondary" @click="onBannerSelectClick" />&nbsp;
			<q-btn flat label="Hochladen" icon="upload" color="secondary" @click="onBannerUploadClick" />
		</div>
	</section>
</template>

<script lang="ts">
import { BannerDto } from '@app/shared/dto/characters/banner.dto';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Options, prop, Vue } from 'vue-class-component';


class Props {
	modelValue = prop<BannerDto>({
		required: false
	});
}

@Options({
	emits: [ 'update:model-value' ]
})
export default class BannerEditSection extends Vue.with(Props) {
	async onBannerSelectClick() {
    const GalleryDialog = (await import('components/common/GalleryDialog.vue')).default;

    this.$q
      .dialog({
        component: GalleryDialog,
        componentProps: {
          banner: true,
        },
      })
      .onOk((image: ImageSummaryDto) => {
        this.setModel(new BannerDto({
          id: image.id,
          url: image.url,
          width: image.width,
          height: image.height,
        }));
      });
  }

  async onBannerUploadClick() {
    const UploadDialog = (await import('components/upload/UploadDialog.vue')).default;

    this.$q
      .dialog({
        component: UploadDialog,
        componentProps: {
          banner: true,
        },
      })
      .onOk((image: ImageSummaryDto) => {
        this.setModel(new BannerDto({
          id: image.id,
          url: image.url,
          width: image.width,
          height: image.height,
        }));
      });
  }

  onBannerRemoveClick() {
    this.setModel(null);
  }

	private setModel(model: BannerDto|null) {
		this.$emit('update:model-value', model);
	}
}
</script>

<style lang="scss">
.banner-edit-section__banner {
  margin-bottom: 16px;
}

.banner-edit-section__placeholder {
  background: #80a0c0;
  color: white;
  margin-bottom: 16px;
}

.banner-edit-section__placeholder div {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
