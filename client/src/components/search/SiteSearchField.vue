<template>
	<q-input v-model="value" dark color="white" label="Search" @keydown="onSearchKeyDown" />
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class SiteSearchField extends Vue {
	value = '';
	
	onSearchKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			// Allow Vue to update value
			void this.$nextTick(() => {
				void this.$router.push({
					path: 'search',
					query: { q: this.value }
				});
			});
		}
	}
}
</script>

<style lang="scss">
</style>
