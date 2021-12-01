<template>
  <div class="page-confirm-email">
		
	</div>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import errors from '@app/shared/errors';
import { Role } from '@app/shared/enums/role.enum';

export default class PageConfirmEmail extends Vue {
	async mounted() {
		const verificationToken = this.$route.params.verificationToken as string;

		if (!verificationToken) {
			void this.$router.replace('/');
			return;
		}

		this.$q.loading.show({
			message: 'Confirming your new email...'
		});
		
		try {
			await this.$api.user.confirmNewEmail({ code: verificationToken });
			this.$q.notify({
				type: 'positive',
				message: 'Your new email address has been confirmed.'
			});
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		} finally {
			this.$q.loading.hide();

			const role = this.$store.getters.role;

			if (!role) {
				void this.$router.replace('/login');
			} else if (role === Role.UNVERIFIED) {
				void this.$router.replace('/verify');
			} else {
				void this.$router.replace('/my-account');
			}
		}
	}
}
</script>

<style lang="scss">
.page-confirm-email {
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}
</style>