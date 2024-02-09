<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="confirm-remove-2fa-dialog">
			<q-card-section>
				<h5>Confirm Removal of Two-Factor Authentication</h5>
				<p>
					You are about to remove two-factor authentication from your account. To proceed, type your current password.
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
        <q-btn flat color="negative" label="Remove 2FA" @click="onProceedClick" :disable="!isValid" />
      </q-card-actions>
			<q-inner-loading :showing="loading" />
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import { QInput } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';

interface DialogRef {
  show(): void;
  hide(): void;
}

@Options({
  name: 'ConfirmRemove2FADialog',
  emits: ['ok', 'hide'],
})
export default class ConfirmRemove2FADialog extends Vue {
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
			const new2FAStatus = await this.$api.user2fa.remove({ currentPassword: this.currentPassword });
			notifySuccess('Two-factor authentication has been removed from your account.');
			this.$emit('ok', new2FAStatus);
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
