<template>
  <q-page class="page-about">
		<h2>Über Elpisgarten</h2>
		<p>
			Elpisgarten ist ein Rollenspielportal für die deutschsprachige Rollenspielcommunity in Final Fantasy XIV, basierend auf <a href="https://chaosarchives.org/">Chaos Archives <q-icon class="external-link-icon" name="launch" /></a>.
		</p>
    <h3>Team</h3>
      <dt>Queen</dt>
			<dd>Moderator</dd>
      <dt>Veemi</dt>
			<dd>Moderator</dd>
		<h3>Credits</h3>
		<dl>
			<dt>Noires</dt>
			<dd>Main developer and administrator.</dd>
			</dl>
		<p>
			And thanks to everyone who has been testing and suggesting improvements to the Archives since their inception!
		</p>
		<section v-html="faq"></section>
		<h3>Nützliche Links</h3>
		<dl>
			<dt><a href="https://discord.gg/rCHdUdSVsr" target="_blank">FFXIV Chaos Roleplaying Community <q-icon name="discord" /></a></dt>
			<dd>Our Discord server.</dd>
			<dt><a href="https://ffxiv-roleplayers.com/topic/1674-the-role-play-handbook/" target="_blank">The Role-Play Handbook <q-icon class="external-link-icon" name="launch" /></a></dt>
			<dd>Introduction to RP in MMO games, and in FFXIV in particular.</dd>
			<dt><router-link to="/wiki/Getting_Started_with_FFXIV_RP_for_WoW_RPers">Getting Started with FFXIV RP for WoW RPers</router-link></dt>
			<dd>Read this if you're already familiar with RP in World of Warcraft.</dd>
		</dl>
		<template v-if="statistics">
			<h3>Statistiken</h3>
			<h4>Charaktere nach Volk</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Volk</th>
					<th class="text-right">Anzahl</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.races" :key="row.race">
						<td>{{ $display.races[row.race] }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
      <h4>Charaktere nach Welt</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Welt</th>
					<th class="text-right">Anzahl</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.servers" :key="row.name">
						<td>{{ row.name }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
			<h4>Miqo'te Goldtatzen-Stämme</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Stamm</th>
					<th class="text-right">Anzahl</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.seekerTribes" :key="row.name">
						<td>{{ row.name }}</td>
						<td class="text-right">{{ row.count }}</td>
					</tr>
				</tbody>
			</q-markup-table>
      <h4>Au Ra Xaela-Stämme</h4>
			<q-markup-table class="striped-list">
				<thead>
					<th class="text-left">Stamm</th>
					<th class="text-right">Anzahl</th>
				</thead>
				<tbody>
					<tr v-for="row in statistics.seekerTribes" :key="row.name">
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
