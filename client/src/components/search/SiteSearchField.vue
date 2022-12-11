<template>
	<q-input v-model="value" dark color="white" label="Suche" clearable @keydown="onSearchKeyDown" />
</template>

<script lang="ts">
import { toSearchKeywords } from '@app/shared/search-utils';
import { Vue } from 'vue-class-component';

export default class SiteSearchField extends Vue {
	value = '';
	
	onSearchKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			// Allow Vue to update value
			void this.$nextTick(() => {
				const keywords = toSearchKeywords(this.value);

				if (keywords.length === 0) {
					return;
				}

				void this.$router.push({
					path: '/search',
					query: { q: this.value }
				});
			});
		}
	}
}
</script>

<style lang="scss">
</style>
