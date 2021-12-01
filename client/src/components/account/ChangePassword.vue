<template>
	<q-form class="change-password" @submit="onSubmit">
		<h3>Change Password</h3>
		<q-input
			ref="currentPasswordField"
			v-model="currentPassword"
			label="Current password"
			auto
			type="password"
			:rules="[
				$rules.required('This field is required.'),
			]"
			@focus="onCurrentPasswordFocus"
		>
			<template v-slot:prepend>
				<q-icon name="password" />
			</template>
		</q-input>
		<q-input
			v-model="newPassword"
			label="New password"
			type="password"
			:rules="[
				$rules.required('This field is required.'),
			]"
		>
			<template v-slot:prepend>
				<q-icon name="password" />
			</template>
		</q-input>
		<div class="change-password__button-bar">
			<q-btn
				label="Change password"
				type="submit"
				color="primary"
			/>
		</div>
		<q-inner-loading :showing="loading" />
	</q-form>
</template>

<script lang="ts">
import errors from '@app/shared/errors';
import { QInput } from 'quasar';
import { Vue } from 'vue-class-component';

export default class ChangePassword extends Vue {
	currentPassword = ' '; // single space to prevent autofill
	newPassword = '';

	loading = false;

	onCurrentPasswordFocus() {
		(this.$refs.currentPasswordField as QInput).select();
	}

	async onSubmit() {
		this.loading = true;

		try {
			await this.$api.user.changePassword({
				currentPassword: this.currentPassword,
				newPassword: this.newPassword,
			});

			this.$q.notify({
        message: 'Password has been changed.',
        type: 'positive'
      });
		} catch (e) {
      this.$q.notify({
        message: errors.getMessage(e),
        type: 'negative'
      });
    } finally {
      this.loading = false;
    }
	}
}
</script>

<style lang="scss">
.change-password {
  max-width: 500px;
}

.change-password__button-bar {
	text-align: right;
}
</style>