<template>
	<q-card class="my-image">
			<q-card-section>
				<div class="flex">
					<div class="my-image__thumb-column"><a class="thumb-link" :href="image.url" target="_blank"><img :src="image.thumbUrl" /></a></div>
					<div class="my-image__description-column">
						<div>
							<h5>{{image.category !== ImageCategory.UNLISTED ? image.title : 'Unlisted Image'}}</h5>
							<section v-html="description"></section>
						</div>
						<div class="text-right">
							<q-btn flat disable color="primary" label="Edit" />
							<q-btn flat color="negative" label="Delete" @click="onDeleteClick" />
						</div>
					</div>
				</div>
			</q-card-section>
		</q-card>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import { ImageDto } from '@app/shared/dto/image/image.dto';
import html from '@app/shared/html';
import { ImageCategory } from '@app/shared/enums/image-category.enum';

class Props {
	image = prop<ImageDto>({
		required: true
	})
}

@Options({
	name: 'MyImage',
	emits: [ 'deleted' ]
})
export default class MyImage extends Vue.with(Props) {
	readonly ImageCategory = ImageCategory;

	get description() {
		return html.sanitize(this.image.description);
	}

	async onDeleteClick() {
		const ConfirmImageDeleteDialog = (await import('./ConfirmImageDeleteDialog.vue')).default;

		this.$q.dialog({
			component: ConfirmImageDeleteDialog,
			componentProps: {
				image: this.image
			}
		}).onOk(() => {
			this.$emit('deleted', this.image);
		});
	}
}
</script>

<style lang="scss">
.my-image {
	margin-bottom: 16px;
}

.my-image__thumb-column {
	padding-right: 16px;
}

.my-image__description-column {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
</style>