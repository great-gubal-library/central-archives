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
            <div class="image-slides-dialog__caption-wrapper absolute-top text-center custom-caption">
              <div class="image-slides-dialog__caption">
                <router-link :to="`/image/${image.id}`" class="image-slides-dialog__title"
                  ><h6>{{ image.title }}</h6></router-link
                >
                <template v-if="image.owner">
                  <router-link v-if="image.ownerServer" :to="getOwnerLink(image)" class="image-slides-dialog__owner">{{
                    image.owner
                  }}</router-link>
                  <span v-else class="image-slides-dialog__owner">{{ image.owner }}</span>
                </template>
              </div>
            </div>
            <div
              v-if="image.description"
              class="image-slides-dialog__description-wrapper absolute-bottom custom-caption"
            >
              <div class="image-slides-dialog__description image-slides-dialog__caption">
                {{ image.description }}
                <q-tooltip v-if="image.description" anchor="top middle" self="bottom middle">{{
                  image.description
                }}</q-tooltip>
              </div>
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
import { wikify } from '@common/common/wikilinks';
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

  getOwnerLink(image: ImageSummaryDto): string {
    return `/${image.ownerServer!}/${wikify(image.owner!)}`;
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

.image-slides-dialog__caption-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.image-slides-dialog__caption {
  background-color: rgba(#333, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.image-slides-dialog__caption a {
  color: white;
}

.image-slides-dialog__caption h6 {
  margin: 0;
}

.image-slides-dialog__caption a:hover {
  color: #aaa;
}

.image-slides-dialog__description-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: calc(2em + 32px);
}

.image-slides-dialog__description {
  max-width: 90%;
  max-height: calc(1.2em + 16px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.image-slides-dialog .q-carousel__navigation--bottom::-webkit-scrollbar {
  height: 6px;
}
</style>
