<template>
	<q-page class="page-my-account">
		<h2>Account and Security</h2>
    <q-card>
			<q-card-section>
				<two-factor-auth />
			</q-card-section>
		</q-card>
		<q-card>
			<q-card-section>
				<change-password />
			</q-card-section>
		</q-card>
		<q-card>
			<q-card-section>
				<change-email />
			</q-card-section>
		</q-card>
		<q-card>
			<q-card-section>
				<logout-everywhere />
			</q-card-section>
		</q-card>
	</q-page>
</template>

<script lang="ts">
import { notifyError } from 'src/common/notify';
import ChangeEmail from 'src/components/account/ChangeEmail.vue';
import ChangePassword from 'src/components/account/ChangePassword.vue';
import LogoutEverywhere from 'src/components/account/LogoutEverywhere.vue';
import TwoFactorAuth from 'src/components/account/TwoFactorAuth.vue';
import { useRouter } from 'src/router';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

const $store = useStore();
const $router = useRouter();

@Options({
	name: 'PageMyAccount',
	components: {
		ChangePassword,
		ChangeEmail,
    LogoutEverywhere,
    TwoFactorAuth,
	},
  beforeRouteEnter() {
    if (!$store.state.user) {
			void $router.replace('/');
      notifyError('You must log in to view this page');
      throw new Error();
    }
  },
})
export default class PageMyAccount extends Vue {

}
</script>

<style lang="scss">
.page-my-account .q-card {
	margin-bottom: 24px;
}

.page-my-account .q-card__section h3 {
	margin-top: 0;
}
</style>
