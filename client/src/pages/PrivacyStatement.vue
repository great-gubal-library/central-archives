<template>
  <q-page>
		<h2>Privacy Statement</h2>
		<div v-html="privacyStatement.replace(/%SITENAME%/g, $siteName)"></div>
	</q-page>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import privacyStatement from 'src/markdown/privacy-statement.md';

export default class PageRules extends Vue {
	readonly privacyStatement = privacyStatement;
}
</script>
