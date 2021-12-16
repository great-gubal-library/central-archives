<template>
	<q-form class="change-email" @submit="onSubmit">
		<h3>Change Email</h3>
		<q-input
			class="change-email__email-field"
			v-model="currentEmail"
			label="Current email"
			auto
			readonly
		>
			<template v-slot:prepend>
				<q-icon name="email" />
			</template>
		</q-input>
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
			v-model="newEmail"
			label="New email"
			:rules="[
				$rules.required('This field is required.'),
			]"
		>
			<template v-slot:prepend>
				<q-icon name="email" />
			</template>
		</q-input>
		<p class="text-caption" v-if="success">{{ successMessage }}</p>
		<div class="change-email__button-bar">
			<q-btn
				label="Change email"
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
import { Options, Vue } from 'vue-class-component';

@Options({
	name: 'ChangeEmail',
})
export default class ChangeEmail extends Vue {
	readonly successMessage = 'An email message has been sent to your new email address. Follow its instructions to confirm the change.';

	currentEmail = ' '; // single space to prevent autofill
	currentPassword = ' '; // single space to prevent autofill
	newEmail = '';

	loading = false;
	success = false;

	async created() {
		const emailInfo = await this.$api.user.getEmail();
		this.currentEmail = emailInfo.email;
	}

	onCurrentPasswordFocus() {
		(this.$refs.currentPasswordField as QInput).select();
	}

	async onSubmit() {
		this.loading = true;

		try {
			await this.$api.user.changeEmail({
				currentPassword: this.currentPassword,
				newEmail: this.newEmail,
			});

			this.$q.notify({
        message: this.successMessage,
        type: 'positive'
      });

			this.success = true;
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
.change-email {
  max-width: 500px;
}

.change-email__email-field {
	background: #f4f4f4;
}

.change-email__button-bar {
	text-align: right;
}
</style>