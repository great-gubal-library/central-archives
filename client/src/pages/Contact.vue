<template>
  <q-page>
		<h2>Contact</h2>
		<p>
			The primary developer and administrator of Chaos Archives is <router-link to="/Omega/Vielle_Janlenoux">Vielle Janlenoux</router-link>, also known as Lintian Wintermist. I can be contacted on Discord as <strong>Lintian#3278</strong> or by <a href="mailto:admin@chaosarchives.org">email <q-icon name="mail_outline" /></a>.
		</p>
		<p>
			Chaos Archives are part of the <a href="https://discord.gg/ffxiv-chaos-rp" target="_blank">Chaos Roleplaying <q-icon name="discord" /></a> Discord community. Visit the <code>#gubal-dev</code> channel to discuss its development.
		</p>
		<h5>Bug reporting</h5>
		<p>
			The Chaos Archives code is open source and available <a href="https://github.com/great-gubal-library/chaos-archives" target="_blank">on GitHub <q-icon name="link" /></a>. Feel free to report any bugs there.
		</p>
	</q-page>	
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

export default class PageContact extends Vue {
	
}
</script>