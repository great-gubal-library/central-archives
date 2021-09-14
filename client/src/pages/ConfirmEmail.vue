<template>
  <div class="page-confirm-email">
		
	</div>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import errors from '@app/shared/errors';

export default class PageConfirmEmail extends Vue {
	async mounted() {
		const verificationToken = this.$route.params.verificationToken as string;

		if (!verificationToken) {
			void this.$router.replace('/');
			return;
		}

		this.$q.loading.show({
			message: 'Confirming your email...'
		});
		
		try {
			await this.$api.confirmEmail({ code: verificationToken });
			this.$q.notify({
				type: 'positive',
				message: 'Your email address has been confirmed.'
			});
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		} finally {
			this.$q.loading.hide();
			void this.$router.replace('/verify');
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