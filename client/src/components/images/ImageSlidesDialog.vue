<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="image-slides-dialog">
      <q-carousel
        v-model="index"
        swipeable
        animated
        arrows
        navigation
        padding
        control-type="regular"
        control-color="accent"
        transition-prev="slide-right"
        transition-next="slide-left"
      >
        <template v-for="(image, i) in images" :key="image.id">
          <q-carousel-slide :name="i" :img-src="image.url">
            <div class="absolute-top text-center custom-caption">
              <router-link :to="`/image/${image.id}`" class="image-slides-dialog__title text-subtitle1">{{
                image.title
              }}</router-link>
            </div>
          </q-carousel-slide>
        </template>

        <template v-slot:control>
          <q-carousel-control position="bottom-right" :offset="[18, 18]">
            <q-btn
              :to="`/image/${images[index].id}`"
              title="Go to image page"
              push
              round
              dense
              color="accent"
              icon="image"
            />
          </q-carousel-control>
        </template>
      </q-carousel>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
  images = prop<ImageSummaryDto[]>({
    required: true,
  });

  initialIndex = prop<number>({
    required: true,
  });
}

@Options({
  emits: ['ok', 'hide'],
})
export default class ImageSlidesDialog extends Vue.with(Props) {
  index = 0;
  fullscreen = false;

  created() {
    this.index = this.initialIndex;
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
}
</script>

<style lang="scss">
.q-dialog__inner--minimized > div.image-slides-dialog {
  width: 90vw;
  max-width: 90vw;
  height: 90vh;
}

.image-slides-dialog .q-carousel {
  width: 100%;
  height: 100%;
}

.image-slides-dialog .q-carousel__slide {
  background-color: #333;
  background-size: contain;
  background-repeat: no-repeat;
}

.image-slides-dialog .custom-caption {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.image-slides-dialog__title {
  background-color: rgba(#333, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.image-slides-dialog__title:hover {
  color: #aaa;
}
</style>
