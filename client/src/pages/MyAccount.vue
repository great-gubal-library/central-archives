<template>
	<q-page class="page-my-account">
		<h2>Account Management</h2>
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
import ChangeEmail from 'src/components/account/ChangeEmail.vue';
import ChangePassword from 'src/components/account/ChangePassword.vue';
import LogoutEverywhere from 'src/components/account/LogoutEverywhere.vue';
import { Options, Vue } from 'vue-class-component';

@Options({
	name: 'PageMyAccount',
	components: {
		ChangePassword,
		ChangeEmail,
    LogoutEverywhere,
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
