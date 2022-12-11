<template>
	<q-form class="change-email" @submit="onSubmit">
		<h3>E-Mail-Adresse ändern</h3>
		<q-input
			class="change-email__email-field"
			v-model="currentEmail"
			label="Aktuelle E-Mail-Adresse"
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
			v-model="newEmail"
			label="Neue E-Mail-Adresse"
			:rules="[
				$rules.required('Dieses Feld ist erforderlich.'),
			]"
		>
			<template v-slot:prepend>
				<q-icon name="email" />
			</template>
		</q-input>
		<p class="text-caption" v-if="success">{{ successMessage }}</p>
		<div class="change-email__button-bar">
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
import { notifySuccess, notifyError } from 'src/common/notify';
import { QInput } from 'quasar';
import { Options, Vue } from 'vue-class-component';

@Options({
	name: 'ChangeEmail',
})
export default class ChangeEmail extends Vue {
	readonly successMessage = 'Es wurde eine Nachricht an deine neue E-Mail-Adresse gesendet. Befolge die Anweisungen um die Änderungen zu finalisieren.';

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

			notifySuccess(this.successMessage);
			this.success = true;
		} catch (e) {
      notifyError(e);
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
