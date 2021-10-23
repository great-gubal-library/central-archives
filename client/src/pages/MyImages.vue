<template>
  <q-page>
		<h2>My Images</h2>
		<my-image v-for="image in images" :key="image.id" :image="image" />
	</q-page>	
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { useStore } from 'src/store';
import { useApi } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import MyImage from 'components/images/MyImage.vue';
import errors from '@app/shared/errors';
import { ImageDto } from '@app/shared/dto/image/image.dto';

async function load(): Promise<ImageDto[]> {
	const $api = useApi();
	const $q = useQuasar();
  const $store = useStore();
  const characterId = $store.state.user?.character.id;

	if (!characterId) {
		$q.notify({
      type: 'negative',
      message: 'Unauthorized'
    });
		throw new Error();
	}

  try {
    return await $api.getMyImages(characterId);
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: errors.getMessage(e)
    });
    throw e;
  }
}

@Options({
	name: 'PageMyImages',
	components: {
		MyImage,
	},
	async beforeRouteEnter(_, __, next) {
		const $q = useQuasar();

    try {
      const images = await load();
      next(vm => (vm as PageMyImages).setContent(images));
    } catch (e) {
      console.log(e);
      $q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
    }
  }
})
export default class PageMyImages extends Vue {
	images: ImageDto[];

	setContent(images: ImageDto[]) {
		this.images = images;
	}
}
</script>