<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="backup-code-dialog">
			<q-card-section>
				<h5 v-if="finishSetup">Two-Factor Authentication Added</h5>
        <h5 v-else>Your New Backup Code</h5>
        <p v-if="finishSetup">
					Your account now has two-factor authentication enabled.
				</p>
				<p>
					This is the backup code for your two-factor authentication. You can use it to log in once if you lose your authenticator app. Write it down before you close this dialog, as it will not be shown to you again.
				</p>
        <p class="backup-code-dialog__backup-code">
          {{ backupCode }}
          &nbsp;
          <q-btn flat dense color="secondary" icon="content_copy" title="Copy to clipboard" @click="copyCode" />
        </p>
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Close" @click="hide" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

class Props {
	backupCode = prop<string>({
		required: true,
	});

  finishSetup = prop<boolean>({
    required: true,
  })
}

@Options({
  name: 'ConfirmRemove2FADialog',
  emits: ['ok', 'hide'],
})
export default class ConfirmRemove2FADialog extends Vue.with(Props) {
  readonly SharedConstants = SharedConstants;

  currentPassword = ' '; // single space to prevent autofill

	loading = false;

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  onDialogHide() {
    this.$emit('hide');
  }

  async copyCode() {
		try {
			await copyToClipboard(this.backupCode);
			notifySuccess('Backup code copied to clipboard.');
		} catch (e) {
			notifyError('Error copying backup code to clipboard.');
		}
	}
}
</script>

<style lang="scss">
.backup-code-dialog__backup-code {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 0;
}
</style>
