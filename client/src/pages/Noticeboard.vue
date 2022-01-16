<template>
  <q-page class="page-noticeboard">
		<h2>Noticeboard</h2>
		<noticeboard-item-list :noticeboard-items="noticeboardItems" />
	</q-page>	
</template>

<script lang="ts">
import { NoticeboardItemSummaryDto } from '@app/shared/dto/noticeboard/noticeboard-item-summary.dto';
import errors from '@app/shared/errors';
import NoticeboardItemList from 'components/noticeboard/NoticeboardItemList.vue';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $q = useQuasar();

@Options({
	name: 'PageNoticeboard',
	components: {
		NoticeboardItemList
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const noticeboardItems = await $api.noticeboard.getNoticeboardItems({});
      next(vm => (vm as PageNoticeboard).setContent(noticeboardItems));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageNoticeboard extends Vue {
	noticeboardItems: NoticeboardItemSummaryDto[] = [];

	setContent(noticeboardItems: NoticeboardItemSummaryDto[]) {
		this.noticeboardItems = noticeboardItems;
	}
}
</script>

<style lang="scss">

</style>