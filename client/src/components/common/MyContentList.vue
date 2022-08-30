<template>
	<section class="my-content-list">
		<q-list v-if="items.length > 0" class="my-content-list striped-list" bordered>
			<q-item
				v-for="item in items"
				:key="item.title"
				clickable
				v-ripple
				:to="getLink(item)"
			>
				<q-item-section>
						<q-item-label>{{item.title}}</q-item-label>
						<q-item-label caption>{{$display.relativeTime(item.createdAt)}}</q-item-label>
				</q-item-section>
				<q-item-section side class="my-content-list__buttons">
					<q-btn color="secondary" flat icon="edit" title="Edit" :to="getEditLink(item)" @click.prevent="onEditClick(item)" />
					<q-btn color="danger" flat icon="delete" title="Delete" @click.prevent="onDeleteClick(item)" />
				</q-item-section>
			</q-item>
		</q-list>
		<p v-else>
			You have no {{$display.pageTypesPlural[type].toLowerCase()}}.
		</p>
	</section>
</template>

<script lang="ts">
import { MyContentItemDto } from '@app/shared/dto/characters/my-content-item.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import { notifyError, notifySuccess } from 'src/common/notify';
import { getPageLink } from 'src/common/pagelinks';
import { prop, Vue } from 'vue-class-component';

class Props {
	items = prop<MyContentItemDto[]>({
		required: true,
	});

	type = prop<PageType>({
		required: true,
	});
}

export default class MyContentList extends Vue.with(Props) {
	getLink(item: MyContentItemDto) {
		return getPageLink(this.type, { id: item.id, name: item.title });
	}

	getEditLink(item: MyContentItemDto) {
		switch (this.type) {
			case PageType.EVENT:
				return `/edit-event/${item.id}`;
			case PageType.STORY:
				return `/edit-story/${item.id}`;
			case PageType.NOTICEBOARD_ITEM:
				return `/edit-noticeboard-item/${item.id}`;
			case PageType.WIKI_PAGE:
				return `/edit-wiki-page/${item.id}`;
			default:
				throw new Error('Unexpected page type');
		}
	}

	onEditClick(item: MyContentItemDto) {
		void this.$router.push(this.getEditLink(item));
	}

	onDeleteClick(item: MyContentItemDto) {
		const description = this.$display.pageTypes[this.type];

		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the ${description.toLowerCase()} “${item.title}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.delete(item);
          notifySuccess(`${description} deleted.`);
          this.items.splice(this.items.indexOf(item), 1);
				} catch (e) {
					notifyError(e);
				}
      });
	}

	async delete(item: MyContentItemDto): Promise<void> {
		switch (this.type) {
			case PageType.EVENT:
				return this.$api.events.deleteEvent(item.id);
			case PageType.STORY:
				return this.$api.stories.deleteStory(item.id);
			case PageType.NOTICEBOARD_ITEM:
				return this.$api.noticeboard.deleteNoticeboardItem(item.id);
			case PageType.WIKI_PAGE:
				return this.$api.wiki.deleteWikiPage(item.id);
			default:
				throw new Error('Unexpected page type');
		}
	}
}
</script>

<style lang="scss">
.my-content-list__buttons {
	flex-direction: row;
}
</style>
