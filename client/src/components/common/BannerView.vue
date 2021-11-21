<template>
  <div class="banner-view">
    <q-img v-if="banner" class="banner-view__banner" :src="banner.url" :initial-ratio="banner.width / banner.height" />
  </div>
</template>

<script lang="ts">
import { BannerDto } from '@app/shared/dto/characters/banner.dto';
import { prop, Vue } from 'vue-class-component';

class Props {
  banner = prop<BannerDto>({
    required: false,
  });
}

export default class BannerView extends Vue.with(Props) {}
</script>

<style lang="scss">
.banner-view__banner {
  margin-bottom: 16px;
}

.banner-view__banner div {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
