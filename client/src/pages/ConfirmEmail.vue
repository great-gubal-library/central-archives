<template>
  <div class="page-confirm-email">
		
	</div>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import errors from '@app/shared/errors';
import { notifyError, notifySuccess } from 'src/common/notify';

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
			await this.$api.user.confirmEmail({ code: verificationToken });
			notifySuccess('Your email address has been confirmed.');
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