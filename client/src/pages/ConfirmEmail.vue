<template>
  <div class="page-confirm-email">
		
	</div>	
</template>

<script lang="ts">
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
			message: 'Bestätige deine E-Mail...'
		});
		
		try {
			await this.$api.user.confirmEmail({ code: verificationToken });
			notifySuccess('Deine E-Mail-Adresse wurde bestätigt.');
		} catch (e) {
			notifyError(e);
		} finally {
			this.$q.loading.hide();

			if (this.$store.getters.role) {
				void this.$router.replace('/verify');
			} else {
				void this.$router.replace('/login');
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
