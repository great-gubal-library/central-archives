<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="get-backup-code-dialog">
			<q-card-section>
				<h5>Get New Backup Code</h5>
				<p>
					To obtain a new backup code for your two-factor authentication, enter your current password. If you have an existing backup code, it will be replaced.
				</p>
        <q-input
          ref="currentPasswordField"
          v-model="currentPassword"
          label="Current password"
          auto
          type="password"
          :rules="[
            $rules.required('This field is required.'),
            $rules.minLength(SharedConstants.PASSWORD_MIN_LENGTH, `Password must be at least ${SharedConstants.PASSWORD_MIN_LENGTH} characters long.`),
          ]"
          @focus="onCurrentPasswordFocus"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
        </q-input>
			</q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
        <q-btn flat color="negative" label="Get backup code" @click="onProceedClick" :disable="!isValid" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import { QInput } from 'quasar';
import { notifyError } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  name: 'GetBackupCodeDialog',
  emits: ['ok', 'hide'],
})
export default class GetBackupCodeDialog extends Vue {
  readonly SharedConstants = SharedConstants;

  currentPassword = ' '; // single space to prevent autofill

	loading = false;

  show() {
    (this.$refs.dialog as DialogRef).show();
  }

  hide() {
    (this.$refs.dialog as DialogRef).hide();
  }

  get isValid() {
    return this.currentPassword.trim() != '' && this.currentPassword.length >= SharedConstants.PASSWORD_MIN_LENGTH;
  }

  onCurrentPasswordFocus() {
		(this.$refs.currentPasswordField as QInput).select();
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
			const response = await this.$api.user2fa.regenerateBackupCode({ currentPassword: this.currentPassword });
			this.$emit('ok', response);
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
