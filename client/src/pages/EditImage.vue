<template>
	<q-page>
		<h2>Edit Image</h2>
		<image-editor v-if="image && image.id" v-model="image" :full-page="true" @update:model-value="onSave" />
	</q-page>
</template>

<script lang="ts">
import { ImageDto } from '@app/shared/dto/image/image.dto';
import errors from '@app/shared/errors';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { RouteParams, useRouter } from 'vue-router';
import { Options, Vue } from 'vue-class-component';
import ImageEditor from 'components/images/ImageEditor.vue';

const $api = useApi();
const $q = useQuasar();
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
			$q.notify({
				type: 'negative',
				message: 'Image not found.'
			});
			void $router.replace('/');
		} else {
			$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
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
		this.$q.notify({
			message: 'Image saved.',
			type: 'positive',
			actions: [
				{
					label: 'View',
					color: 'white',
					handler: () => this.viewImage(),
				},
			],
		});
	}

	viewImage() {
    void this.$router.push(`/image/${this.image.id}`);
  }
}
</script>

<style lang="scss">
</style>