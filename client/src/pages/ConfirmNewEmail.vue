<template>
  <div class="page-confirm-email">
		
	</div>	
</template>

<script lang="ts">
import { Role } from '@app/shared/enums/role.enum';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Vue } from 'vue-class-component';

export default class PageConfirmEmail extends Vue {
	async mounted() {
		const verificationToken = this.$route.params.verificationToken as string;

		if (!verificationToken) {
			void this.$router.replace('/');
			return;
		}

		this.$q.loading.show({
			message: 'Bestätige deine neue E-Mail...'
		});
		
		try {
			await this.$api.user.confirmNewEmail({ code: verificationToken });
			notifySuccess('Deine neue E-Mail-Adresse wurde bestätigt.');
		} catch (e) {
			notifyError(e);
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
