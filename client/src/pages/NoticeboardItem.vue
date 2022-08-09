<template>
  <q-page class="page-noticeboardItem">
		<template v-if="noticeboardItem.id">
			<section v-if="noticeboardItem.mine" class="edit-bar">
				<router-link :to="`/edit-noticeboard-item/${noticeboardItem.id}`">Edit noticeboard item</router-link>
				<q-btn flat color="negative" label="Delete noticeboard item" @click="onDeleteClick" />
			</section>
			<noticeboard-item-view :noticeboard-item="noticeboardItem" />
    	<report-violation-section :pageType="PageType.NOTICEBOARD_ITEM" :pageId="noticeboardItem.id" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import NoticeboardItemView from 'components/noticeboard/NoticeboardItemView.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<NoticeboardItemDto> {
	const id = parseInt(params.id as string, 10);

	if (!id) {
		void $router.replace('/');
		throw new Error();
	}

	try {
		const noticeboardItem = await $api.noticeboard.getNoticeboardItem(id);
		document.title = `${noticeboardItem.title} — Chaos Archives`;
		return noticeboardItem;
	} catch (e) {
		if (errors.getStatusCode(e) === 404) {
			notifyError('Noticeboard item not found.');
			void $router.replace('/');
		} else {
			notifyError(e);
		}

		throw e;
	}
}

@Options({
	name: 'PageNoticeboardItem',
	components: {
		NoticeboardItemView,
		ReportViolationSection,
	},
	async beforeRouteEnter(to, _, next) {
		const noticeboardItem = await load(to.params);
		next(vm => (vm as PageNoticeboardItem).setContent(noticeboardItem));
	},
	async beforeRouteUpdate(to) {
		const noticeboardItem = await load(to.params);
		(this as PageNoticeboardItem).setContent(noticeboardItem);
	}
})
export default class PageNoticeboardItem extends Vue {
	readonly PageType = PageType;
	
	noticeboardItem: NoticeboardItemDto = new NoticeboardItemDto();
	
	setContent(noticeboardItem: NoticeboardItemDto) {
		this.noticeboardItem = noticeboardItem;
	}

	onDeleteClick() {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the noticeboard item “${this.noticeboardItem.title}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.noticeboard.deleteNoticeboardItem(this.noticeboardItem.id!);

					notifySuccess('Noticeboard item deleted.');
					void this.$router.replace('/');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">

</style>