<template>
  <q-page class="page-about">
		<h2>About Chaos Archives</h2>
		<p>
			Chaos Archives is a roleplaying portal for the Chaos (EU) roleplaying community in Final Fantasy XIV, heavily inspired by <a href="https://www.argentarchives.org">Argent Archives <q-icon class="external-link-icon" name="launch" /></a>, but built from scratch to cater to the needs of FFXIV roleplayers.
		</p>
		<p>
			Chaos Archives is part of the <a href="https://discord.gg/ffxiv-chaos-rp" target="_blank">FFXIV Chaos Roleplaying Community <q-icon name="discord" /></a>. Feel free to join us on Discord!
		</p>
		<h3>Credits</h3>
		<dl>
			<dt><router-link to="/Omega/Vielle_Janlenoux">Vielle Janlenoux</router-link> (Lintian)</dt>
			<dd>Main developer and administrator.</dd>
			<dt><a href="https://elfandorc.com">Diane Riondel</a> (Eepox)</dt>
			<dd>Graphics: logo and backgrounds, design feedback, beta testing.</dd>
			<dt><router-link to="/Omega/Njord_Orfeo">Njord Orfeo</router-link></dt>
			<dd>Terms of use.</dd>
		</dl>
		<p>
			And thanks to everyone who has been testing and suggesting improvements to the Archives since their inception!
		</p>
		<h3>Useful Links</h3>
		<dl>
			<dt><a href="https://discord.gg/ffxiv-chaos-rp" target="_blank">FFXIV Chaos Roleplaying Community <q-icon name="discord" /></a></dt>
			<dd>Our Discord server.</dd>
			<dt><a href="https://ffxiv-roleplayers.com/topic/1674-the-role-play-handbook/">The Role-Play Handbook <q-icon class="external-link-icon" name="launch" /></a></dt>
			<dd>Introduction to RP in MMO games, and in FFXIV in particular.</dd>
			<dt><a href="https://ffxiv-roleplayers.com/topic/24360-getting-started-with-ffxiv-rp-for-wow-rpers/">Getting Started with FFXIV RP for WoW RPers <q-icon class="external-link-icon" name="launch" /></a></dt>
			<dd>Read this if you're already familiar with RP in World of Warcraft.</dd>
		</dl>
	</q-page>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

export default class PageAbout extends Vue {
	
}
</script>

<style lang="scss">
.page-about dd {
	margin-bottom: 0.8em;
}
</style>
