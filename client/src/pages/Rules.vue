<template>
  <q-page>
		<h2>Rules</h2>
		<div v-html="rules"></div>
	</q-page>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import rules from 'src/markdown/rules.md';

export default class PageRules extends Vue {
	readonly rules = rules;
}
</script>
