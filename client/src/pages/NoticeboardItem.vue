<template>
  <q-page class="page-noticeboardItem">
		<template v-if="noticeboardItem.id">
			<noticeboard-item-view :noticeboard-item="noticeboardItem" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { NoticeboardItemDto } from '@app/shared/dto/noticeboard/noticeboard-item.dto';
import errors from '@app/shared/errors';
import NoticeboardItemView from 'components/noticeboard/NoticeboardItemView.vue';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';

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
		NoticeboardItemView
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
	noticeboardItem: NoticeboardItemDto = new NoticeboardItemDto();
	
	setContent(story: NoticeboardItemDto) {
		this.noticeboardItem = story;
	}
}
</script>

<style lang="scss">

</style>