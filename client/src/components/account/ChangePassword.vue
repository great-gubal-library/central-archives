<template>
	<q-form class="change-password" @submit="onSubmit">
		<h3>Passwort ändern</h3>
		<q-input
			ref="currentPasswordField"
			v-model="currentPassword"
			label="Aktuelles Passwort"
			auto
			type="password"
			:rules="[
				$rules.required('Dieses Feld ist erforderlich.'),
			]"
			@focus="onCurrentPasswordFocus"
		>
			<template v-slot:prepend>
				<q-icon name="password" />
			</template>
		</q-input>
		<q-input
			v-model="newPassword"
			label="Neues Passwort"
			type="password"
			:rules="[
				$rules.required('Dieses Feld ist erforderlich.'),
			]"
		>
			<template v-slot:prepend>
				<q-icon name="password" />
			</template>
		</q-input>
		<div class="change-password__button-bar">
			<q-btn
				label="Änderung bestätigen"
				type="submit"
				color="primary"
			/>
		</div>
		<q-inner-loading :showing="loading" />
	</q-form>
</template>

<script lang="ts">
import { QInput } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, Vue } from 'vue-class-component';

@Options({
	name: 'ChangePassword',
})
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

			notifySuccess('Passwort wurde geändert.');
		} catch (e) {
      notifyError(e);
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
