<template>
  <q-page class="page-about">
		<h2>About {{$siteName}}</h2>
		<p>
			{{$siteName}} is a roleplay portal for the {{ $region = 'global' ? '' : ($region === 'eu' ? 'Chaos (EU)' : 'Crystal (NA)') }} roleplaying community in Final Fantasy XIV, heavily inspired by <a href="https://www.argentarchives.org">Argent Archives <q-icon class="external-link-icon" name="launch" /></a>, but built from scratch to cater to the needs of FFXIV roleplayers.
		</p>
		<p v-if="$region === 'eu'">
			{{$siteName}} is part of the <a href="https://discord.gg/rCHdUdSVsr" target="_blank">FFXIV Chaos RP Community <q-icon name="discord" /></a>. Feel free to join us on Discord!
		</p>
		<h3>Credits</h3>
		<dl>
			<dt><router-link to="/Omega/Vielle_Janlenoux">Vielle Janlenoux</router-link> (Lintian)</dt>
			<dd>Main developer and administrator.</dd>
			<dt><a href="https://elfandorc.com" target="_blank">Diane Riondel</a> (Eepox)</dt>
			<dd>Graphics: logo and backgrounds, design feedback, beta testing.</dd>
			<dt><router-link to="/Omega/Njord_Orfeo">Njord Orfeo</router-link></dt>
			<dd>Terms of use.</dd>
		</dl>
		<p>
			And thanks to everyone who has been testing and suggesting improvements to the Archives since their inception!
		</p>
		<section v-html="faq.replace(/%SITENAME%/g, $siteName)"></section>
		<h3>Useful Links</h3>
		<dl>
      <template v-if="$region === 'eu'">
        <dt><a href="https://discord.gg/rCHdUdSVsr" target="_blank">FFXIV Chaos Roleplaying Community <q-icon name="discord" /></a></dt>
        <dd>Our Discord server.</dd>
      </template>
      <template v-if="$region === 'na'">
        <dt><a href="https://discord.com/invite/ynCTGcE" target="_blank">FFXIV Roleplaying <q-icon name="discord" /></a></dt>
        <dd>Our Discord server.</dd>
      </template>
			<dt><router-link to="/wiki/The_Role-Play_Handbook">The Role-Play Handbook</router-link></dt>
			<dd>Introduction to RP in MMO games, and in FFXIV in particular.</dd>
			<dt><router-link to="/wiki/Getting_Started_with_FFXIV_RP_for_WoW_RPers">Getting Started with FFXIV RP for WoW RPers</router-link></dt>
			<dd>Read this if you're already familiar with RP in World of Warcraft.</dd>
		</dl>
		<template v-if="statistics">
			<h3>Statistics</h3>
			<h4>Characters by race</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Race</th>
					<th class="text-right">Count</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.races" :key="row.race">
						<td>{{ $display.races[row.race] }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
			<h4>Seeker Miqo'te by tribe</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Tribe</th>
					<th class="text-right">Count</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.seekerTribes" :key="row.name">
						<td>{{ row.name }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
			<h4>Characters by world</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">World</th>
					<th class="text-right">Count</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.servers" :key="row.name">
						<td>{{ row.name }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
		</template>
	</q-page>
</template>

<script lang="ts">
import { StatisticsDto } from '@app/shared/dto/statistics/statistics.dto'
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component'
import faq from 'src/markdown/faq.md'

const $api = useApi();

async function load(): Promise<StatisticsDto> {
	return $api.statistics.getStatistics();
}

@Options({
	name: 'PageAbout',
	async beforeRouteEnter(_, __, next) {
		const statistics = await load();
		next(vm => (vm as PageAbout).setContent(statistics));
	},
})
export default class PageAbout extends Vue {
	readonly faq = faq;

	statistics: StatisticsDto | null = null;

	setContent(statistics: StatisticsDto) {
		this.statistics = statistics;
	}
}
</script>

<style lang="scss">
.page-about dd {
	margin-bottom: 0.8em;
}

.page-about th {
	background: #f0f0f0;
	font-family: $form-header-font;
}
</style>
