<template>
	<section class="report-violation-section">
		<q-btn flat color="secondary" label="Copy link" @click="copyLink" />
		<q-btn v-if="!reported" flat color="secondary" label="Report this page" @click="reportPage" />
		<q-btn v-else disable flat color="secondary" label="Page reported" />
	</section>
</template>

<script lang="ts">
import { PageType } from '@app/shared/enums/page-type.enum';
import { Options, prop, Vue } from 'vue-class-component';
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';

class Props {
	pageType = prop<PageType>({
		required: true,
	});

	pageId = prop<number>({
		required: true,
	});
}

@Options({
	name: 'ReportViolationSection'
})
export default class ReportViolationSection extends Vue.with(Props) {
	reported = false;

	async copyLink() {
		try {
			await copyToClipboard(window.location.href);
			notifySuccess('Page link copied to clipboard.');
		} catch (e) {
			notifyError('Error copying page link to clipboard.');
		}
	}

	async reportPage() {
		const ReportViolationDialog = (await import('./ReportViolationDialog.vue')).default;

    this.$q.dialog({
			component: ReportViolationDialog,
			componentProps: {
				pageType: this.pageType,
				pageId: this.pageId,
			},
		}).onOk(() => {
			this.reported = true;
		});
	}
}
</script>

<style lang="scss">
.report-violation-section {
	margin-top: 8px;
	display: flex;
	justify-content: space-between;
}
</style>
