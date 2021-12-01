<template>
	<q-page class="page-my-account">
		<h2>Account Management</h2>
		<q-card>
			<q-card-section>
				<change-password />
			</q-card-section>
		</q-card>
	</q-page>
</template>

<script lang="ts">
import ChangePassword from 'src/components/account/ChangePassword.vue';
import { Options, Vue } from 'vue-class-component';

@Options({
	components: {
		ChangePassword,
	},
})
export default class PageMyAccount extends Vue {

}
</script>

<style lang="scss">
.page-my-account .q-card__section h3 {
	margin-top: 0;
}
</style>
