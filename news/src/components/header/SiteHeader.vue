<template>
	<header class="header">
		<h1>The Harborwatch</h1>
		<hr />
		<section class="header__info">
			<div class="header__location">Limsa Lominsa</div>
			<div class="header__date">9<sup><small>th</small></sup> Sun of the Third Astral Moon</div>
			<div class="header__price">15 gil</div>
		</section>
		<hr />
	</header>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class SiteHeader extends Vue {
	
}
</script>

<style lang="scss">
.header {
	margin-bottom: 3rem;
}

.header h1 {
	margin-top: 0;
	margin-bottom: 2rem;
	text-align: center;
	font-family: Playfair Display SC, serif;
	text-shadow: #ddd 4px 4px;
}

.header hr {
	border-top: 1px solid black;
	border-bottom: 1px solid black;
	padding: 0.8px;
	color: transparent;
}

.header__info {
	display: flex;
	align-items: end;
	padding-bottom: 2px;
	font-size: 20px;
	text-transform: uppercase;
}

.header__location {
	flex-basis: 0;
	flex-grow: 1;
	text-align: left;
}

.header__price {
	flex-basis: 0;
	flex-grow: 1;
	text-align: right;
}
</style>
