<template>
	<footer class="footer">
		<hr />
		&ldquo;The Harborwatch&rdquo; is a project by the <a href="https://discord.gg/rCHdUdSVsr" target="_blank">Chaos EU roleplaying community</a>. All persons and events mentioned on this website are fictional.
		<br />
		Final Fantasy XIV is © 2010–2024 Square Enix Co., Ltd. All rights reserved.
		<hr />
	</footer>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class SiteFooter extends Vue {

}
</script>

<style lang="scss">
.footer {
	margin-top: 5rem;
	text-align: center;
	font-size: 1rem;
}

.footer hr {
	border-top: 1px solid black;
	border-bottom: 1px solid black;
	padding: 0.8px;
	color: transparent;
}
</style>
