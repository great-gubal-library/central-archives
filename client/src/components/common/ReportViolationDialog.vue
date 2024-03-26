<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="report-page-dialog">
			<q-card-section>
				<h5>Report Page</h5>
				<p>
					You are reporting the page: <strong>{{pageTitle}}</strong>
				</p>
        <p>
					Please describe in brief why this page violates our rules.
				</p>
        <q-input
        type="textarea"
        outlined
        v-model="reason"
        :rules="[
          $rules.required('This field is required.'),
          $rules.minLength(SharedConstants.MIN_VIOLATION_REPORT_LENGTH, `Please type at least ${SharedConstants.MIN_VIOLATION_REPORT_LENGTH} characters.`)
        ]"
      />
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
        <q-btn flat color="negative" label="Send Report" @click="onProceedClick" :disable="!isValid" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { PageType } from '@app/shared/enums/page-type.enum';
import SharedConstants from '@app/shared/shared-constants';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
	pageType = prop<PageType>({
		required: true,
	});

	pageId = prop<number>({
		required: true,
	});
}

@Options({
  name: 'ReportViolationDialog',
  emits: ['ok', 'hide'],
})
export default class ReportViolationDialog extends Vue.with(Props) {
  readonly SharedConstants = SharedConstants;

  pageTitle = '';
  reason = '';
	loading = false;

  created() {
    this.pageTitle = document.title;
  }

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  get isValid() {
    return this.reason.length >= SharedConstants.MIN_VIOLATION_REPORT_LENGTH;
  }

  onDialogHide() {
    this.$emit('hide');
  }

  onCancelClick() {
    this.hide();
  }

  async onProceedClick() {
		this.loading = true;

		try {
			await this.$api.violations.reportViolation({
        pageId: this.pageId,
        pageType: this.pageType,
        reason: this.reason,
      });

			notifySuccess('Thanks for your report. Our moderators will look at it soon.');
			this.$emit('ok');
			this.hide();
		} catch (e) {
			notifyError(e);
		} finally {
			this.loading = false;
		}
  }
}
</script>

<style lang="scss">
</style>
