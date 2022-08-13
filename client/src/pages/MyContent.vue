<template>
  <q-page class="page-my-images">
		<h2>My Content</h2>
    <div class="page-my-images__subtitle">for {{ $store.getters.character?.name }}</div>
    <my-images :images="content.images" />
	</q-page>	
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import MyImages from 'components/images/MyImages.vue';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import { MyContentDto } from '@app/shared/dto/links/my-content.dto';

async function load(): Promise<MyContentDto> {
	const $api = useApi();
  const $store = useStore();
  const characterId = $store.getters.characterId;

	if (!characterId) {
		notifyError('Unauthorized');
		throw new Error();
	}

  try {
    return await $api.characters.getMyContent(characterId);
  } catch (e) {
    notifyError(e);
    throw e;
  }
}

@Options({
	name: 'PageMyContent',
	components: {
		MyImages,
	},
	async beforeRouteEnter(_, __, next) {
    try {
      const content = await load();
      next(vm => (vm as PageMyContent).setContent(content));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageMyContent extends Vue {
	content: MyContentDto = {
    events: [],
    stories: [],
    noticeboardItems: [],
    images: []
  };

	setContent(content: MyContentDto) {
		this.content = content;
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