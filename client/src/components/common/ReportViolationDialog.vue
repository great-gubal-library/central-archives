<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="report-page-dialog">
			<q-card-section>
				<h5>Diese Seite melden</h5>
				<p>
					Du bist im Inbegriff die folgende Seite zu melden:
          <strong>{{pageTitle}}</strong>
				</p>
        <p>
					Bitte erläutere kurz, wieso diese Seite gegen unsere Regeln verstößt.
				</p>
        <q-input
        type="textarea"
        outlined
        v-model="reason"
        :rules="[
          $rules.required('Dieses Feld ist erforderlich.'),
          $rules.minLength(SharedConstants.MIN_VIOLATION_REPORT_LENGTH, `Ein Minimum an ${SharedConstants.MIN_VIOLATION_REPORT_LENGTH} Zeichen ist erforderlich.`)
        ]"
      />
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Abbrechen" @click="onCancelClick" />
        <q-btn flat color="negative" label="Bericht senden" @click="onProceedClick" :disable="!isValid" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { PageType } from '@app/shared/enums/page-type.enum';
import SharedConstants from '@app/shared/SharedConstants';
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

			notifySuccess('Danke für deine Meldung. Unsere Moderatoren werden sich zeitnah darum kümmern.');
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
