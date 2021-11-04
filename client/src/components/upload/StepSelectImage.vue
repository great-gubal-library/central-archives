<template>
  <div class="step-select-image">
    <q-file
      filled
      label="Select image"
      :model-value="modelValue.file"
      @update:model-value="selectFile"
    >
      <template v-slot:prepend>
        <q-icon name="image" @click.stop />
      </template>
      <template v-slot:append>
        <q-icon
          name="close"
          @click.stop.prevent="selectFile(null)"
          class="cursor-pointer"
        />
      </template>
    </q-file>
    <section v-if="!modelValue.file" class="text-caption">
			You can also drop a file here from your file manager.
		</section>
    <template v-if="modelValue.image">
      <h6>Preview</h6>
      <img :src="modelValue.image.src" />
    </template>
    <q-banner
      v-if="modelValue.file && !modelValue.image"
      class="step-select-image__not-image bg-negative text-white"
    >
      Not an image file.
    </q-banner>
    <template v-if="modelValue.file && modelValue.image">
      <section
        class="step-select-image__conversion"
        v-if="modelValue.file && modelValue.image"
      >
        <div
          class="step-select-image__conversion-switches"
          v-if="canChooseFormat"
        >
          <q-radio
            v-model="modelValue.format"
            :val="ImageFormat.PNG"
            :label="
              modelValue.originalFormat === ImageFormat.PNG
                ? 'Keep as PNG'
                : 'Convert to PNG'
            "
          />
          <q-radio
            v-model="modelValue.format"
            :val="ImageFormat.JPEG"
            label="Convert to JPEG"
          />
        </div>
        <div
          class="step-select-image__file-size"
          :class="{ 'text-negative': exceedsMaxFileSize }"
        >
          <q-icon v-if="exceedsMaxFileSize" name="error" />
          File size: {{ fileSize }} (maximum: {{ maxFileSize }})
        </div>
      </section>
      <section v-if="canChooseFormat" class="text-caption">
        PNG files are larger, but exactly preserve the original pixels. JPEG
        files are smaller and faster to download, but may have slight, often
        unnoticeable differences from the original.
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { ImageFormat } from '@app/shared/enums/image-format.enum';
import SharedConstants from '@app/shared/SharedConstants';
import { convertImageElementForUpload, hasTransparency, readImage } from 'src/common/images';
import { Options, prop, Vue } from 'vue-class-component';
import { ImageSelectModel } from './image-select-model';

interface ConversionResult {
  blob: Blob;
  filename: string;
  originalFormat: ImageFormat | null;
  newFormat: ImageFormat;
	hasTransparency: boolean;
}

class Props {
  modelValue = prop<ImageSelectModel>({
    default: {
      file: null,
      filename: null,
      image: null,
      convertedFile: null,
      originalFormat: null,
      format: null,
			hasTransparency: false,
    },
  });
}

@Options({
  emits: ['update:model-value'],
  watch: {
    modelValue: {
      handler(newValue: ImageSelectModel, oldValue: ImageSelectModel) {
        if (newValue.file && (!oldValue || newValue.file !== oldValue.file)) {
          void (this as StepSelectImage).selectFile(
            newValue.file,
            newValue.format
          );
        } else if (
          newValue.format &&
          (!oldValue || newValue.format !== oldValue.format)
        ) {
          void (this as StepSelectImage).selectFile(
            newValue.file,
            newValue.format
          );
        }
      },
    },
    'modelValue.format': {
      handler(newValue: ImageFormat | null, oldValue: ImageFormat | null) {
        if (newValue !== oldValue) {
          void (this as StepSelectImage).selectFile(
            (this as StepSelectImage).modelValue.file,
            newValue
          );
        }
      },
    },
  },
})
export default class StepSelectImage extends Vue.with(Props) {
  readonly ImageFormat = ImageFormat;

  async selectFile(file: File | null, format?: ImageFormat | null) {
    try {
      const image = await this.readImage(file);
      let blob: Blob | null = null;
      let originalFormat: ImageFormat | null = null;
      let newFormat: ImageFormat | null = null;
      let filename: string | null = null;
			let hasTransparency = false;

      if (file !== null && image !== null) {
        const result = await this.convertImage(file, image, format || null);
        blob = result.blob;
        originalFormat = result.originalFormat;
        newFormat = result.newFormat;
        filename = result.filename;
				hasTransparency = result.hasTransparency;
      }

      this.$emit('update:model-value', {
        file,
        filename,
        convertedFile: blob,
        originalFormat,
        format: newFormat,
        image,
				hasTransparency,
      });
    } catch (e) {
      console.log(e);
      this.$emit('update:model-value', {
        file,
        filename: null,
        image: null,
        convertedFile: null,
        originalFormat: null,
        format: null,
      });
    }
  }

  async readImage(file: File | null): Promise<HTMLImageElement | null> {
    if (!file) {
      return null;
    }

    return readImage(file);
  }

  async convertImage(
    file: File,
    image: HTMLImageElement,
    format: ImageFormat | null
  ): Promise<ConversionResult> {
    if (file.type === 'image/jpeg') {
      // We don't need to convert
      return {
        blob: file,
        filename: file.name,
        originalFormat: ImageFormat.JPEG,
        newFormat: ImageFormat.JPEG,
				hasTransparency: false
      };
    }

    let originalFormat: ImageFormat | null = null;

    if (file.type === 'image/png') {
      originalFormat = ImageFormat.PNG;

      if (format === ImageFormat.PNG || !format === null) {
        return {
          blob: file,
          filename: file.name,
          originalFormat: ImageFormat.PNG,
          newFormat: ImageFormat.PNG,
					hasTransparency: hasTransparency(image)
        };
      }
    }

    // We need to convert
    const newFormat = format || ImageFormat.PNG;
    let result = await convertImageElementForUpload(
      image,
      file.name,
      newFormat
    );

    return {
      blob: result.blob,
      filename: result.filename,
      originalFormat,
      newFormat,
			hasTransparency: result.hasTransparency
    };
  }

  get fileSize(): string {
    if (this.modelValue.convertedFile === null) {
      return '';
    }

    return this.$display.formatFileSize(this.modelValue.convertedFile.size);
  }

  get maxFileSize(): string {
    return this.$display.formatFileSize(SharedConstants.MAX_UPLOAD_SIZE);
  }

  get exceedsMaxFileSize(): boolean {
    return (
      !!this.modelValue.convertedFile &&
      this.modelValue.convertedFile.size > SharedConstants.MAX_UPLOAD_SIZE
    );
  }

  get canChooseFormat(): boolean {
    return this.modelValue.originalFormat !== ImageFormat.JPEG && !this.modelValue.hasTransparency;
  }
}
</script>

<style lang="scss">
.step-select-image img {
  max-height: 50vh;
}

.step-select-image__not-image {
	margin-top: 16px;
}

.step-select-image__conversion {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
