<template>
	<nav class="user-navigation" v-show="issues.length">
		<div class="user-navigation__label">
			<template v-if="!$store.getters.characterId">
				<q-icon name="person" size="36px" title="Not logged in" />
			</template>
			<template v-else>
				<q-avatar v-if="$store.getters.character" round size="36px" title="$store.getters.character.name">
					<img :src="$store.getters.character.avatar" />
				</q-avatar>
			</template>
		</div>
		<q-list bordered separator flat>
			<template v-if="!$store.getters.characterId">
				<q-item clickable v-ripple to="/login">
					<q-icon name="login" size="36px" title="Log in" />
				</q-item>
			</template>
			<template v-else>
			</template>
		</q-list>
	</nav>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class UserNavigation extends Vue {
	issues: number[] = [];

	async created() {
		this.issues = await this.$api.news.getIssues();
	}
}
</script>

<style lang="scss">
.user-navigation {
	position: fixed;
	left: 20px;
	top: 20px;
}

.user-navigation__label {
	text-align: center;
}

.user-navigation .q-item {
	padding: 8px;
	color: #559;
}
</style>