<template>
	<nav class="issue-navigation" v-show="issues.length">
		<div class="issue-navigation__label">Issues</div>
		<q-list bordered separator>
			<template v-for="issue in issues" :key="issue">
				<q-item clickable v-ripple :to="`/issue/${issue}`">
					<q-item-section>
          	<q-item-label>{{issue}}</q-item-label>
					</q-item-section>
				</q-item>
			</template>
		</q-list>
	</nav>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class IssueNavigation extends Vue {
	issues: number[] = [];

	async created() {
		this.issues = await this.$api.news.getIssues();
	}
}
</script>

<style lang="scss">
.issue-navigation {
	position: fixed;
	right: 20px;
	top: 20px;
}
</style>