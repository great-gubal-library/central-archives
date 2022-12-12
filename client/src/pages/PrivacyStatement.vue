<template>
  <q-page>
		<h2>Datenschutzerklärung</h2>
		<div v-html="privacyStatement"></div>
	</q-page>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import privacyStatement from 'src/markdown/privacy-statement.md';

export default class PageRules extends Vue {
	readonly privacyStatement = privacyStatement;
}
</script>
