<template>
  <q-page class="page-my-images">
		<h2>My Images</h2>
    <div class="page-my-images__subtitle">for {{ $store.getters.character?.name }}</div>
    <transition
      v-for="image in images" :key="image.id"
      leave-active-class="animated fadeOut"
    >
		  <my-image v-show="!deleted[image.id]" :image="image" @deleted="onImageDeleted" />
    </transition>
	</q-page>	
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import MyImage from 'components/images/MyImage.vue';
import { useApi } from 'src/boot/axios';
import { notifyError } from '@common/common/notify';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

async function load(): Promise<ImageDto[]> {
	const $api = useApi();
  const $store = useStore();
  const characterId = $store.getters.characterId;

	if (!characterId) {
		notifyError('Unauthorized');
		throw new Error();
	}

  try {
    return await $api.characters.getMyImages(characterId);
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

@Options({
	name: 'PageMyImages',
	components: {
		MyImage,
	},
	async beforeRouteEnter(_, __, next) {
    try {
      const images = await load();
      next(vm => (vm as PageMyImages).setContent(images));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageMyImages extends Vue {
	images: ImageDto[] = [];
  deleted: { [k: number]: boolean } = {};

	setContent(images: ImageDto[]) {
		this.images = images;
	}

  onImageDeleted(image: ImageDto) {
    this.deleted[image.id] = true;
  }
}
</script>

<style lang="scss">
.page-my-images h2 {
  margin-bottom: 0;
}

.page-my-images__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}
</style>