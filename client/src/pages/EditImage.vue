<template>
	<q-page>
		<h2>Bild bearbeiten</h2>
		<image-editor v-if="image && image.id" v-model="image" :full-page="true" @update:model-value="onSave" />
	</q-page>
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
import ImageEditor from 'components/images/ImageEditor.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<ImageDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const image = await $api.images.getImage(id);
		return image;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Image not found.');
			void $router.replace('/');
		} else {
			notifyError(e);
		}

		throw e;
	}
}

@Options({
	name: 'PageEditImage',
	components: {
		ImageEditor,
	},
	async beforeRouteEnter(to, _, next) {
		const image = await load(to.params);
		next(vm => (vm as PageEditImage).setContent(image));
	},
	async beforeRouteUpdate(to) {
		const image = await load(to.params);
		(this as PageEditImage).setContent(image);
	},
})
export default class PageEditImage extends Vue {
	image = {} as ImageDto;

	setContent(image: ImageDto) {
		this.image = image;
	}

	onSave() {
		notifySuccess('Bild gespeichert.', {
			label: 'Anschauen',
			color: 'white',
			handler: () => this.viewImage(),
		});
	}

	viewImage() {
    void this.$router.push(`/image/${this.image.id}`);
  }
}
</script>

<style lang="scss">
</style>
