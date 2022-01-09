<template>
  <q-page class="page-my-communities">
		<h2>My Communities</h2>
			<section>
			<div class="page-my-communities__subtitle">for {{ $store.getters.character?.name }}</div>
			<h3>Free Company</h3>
			<section class="page-my-communities__fc" v-if="communities.freeCompany">
				<free-company-crest :images="communities.freeCompany.crest" />
				<div class="page-my-communities__fc-info">
					<p class="page-my-communities__fc-name">
						<router-link :to="fcLink">{{communities.freeCompany.name}}</router-link>
						<template v-if="communities.freeCompany.isLeader">
						— Leader <router-link :to="editFCLink">(Edit Free Company)</router-link>
						</template>
					</p>
					<p v-if="communities.freeCompany.goal"><strong>Goal:</strong> {{communities.freeCompany.goal}}</p>
				</div>
			</section>
			<section v-else>
				<p>You are not listed a member of a Free Company.</p>
			</section>
			<p>
			<q-btn color="secondary" icon="refresh" label="Set Free Company from Lodestone" @click="onSetFCFromLodestoneClick" />
			</p>
			<q-inner-loading :showing="loading" />
		</section>
	</q-page>	
</template>

<script lang="ts">
import errors from '@app/shared/errors';
import FreeCompanyCrest from 'components/free-company/FreeCompanyCrest.vue';
import { MyCommunitiesInfoDto } from '@app/shared/dto/communities/my-communities-info.dto';
import { useQuasar } from 'quasar';
import minXIVAPI from 'src/common/xivapi-min';
import { useApi } from 'src/boot/axios';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $q = useQuasar();
const $store = useStore();

@Options({
	name: 'PageMyCommunities',
	components: {
		FreeCompanyCrest
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const communities = await $api.communities.getMyCommunities($store.getters.characterId!);
      next(vm => (vm as PageMyCommunities).setContent(communities));
    } catch (e) {
      console.log(e);
      $q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
    }
  }
})
export default class PageMyCommunities extends Vue {
	communities: MyCommunitiesInfoDto = { freeCompany: null };
	loading = false;

	get fcLink() {
		const fc = this.communities.freeCompany;
		return fc == null ? null : `/fc/${fc.server}/${fc.name.replace(' ', '_')}`;
	}

	get editFCLink() {
		const fc = this.communities.freeCompany;
		return fc == null ? null : `/edit-free-company/${fc.server}/${fc.name.replace(' ', '_')}`;
	}

	setContent(communities: MyCommunitiesInfoDto) {
		this.communities = communities;
	}

	async onSetFCFromLodestoneClick() {
		const lodestoneId = this.$store.getters.character!.lodestoneId;
		const characterInfo = await minXIVAPI.character.get(lodestoneId);
		const fcName = characterInfo.Character.FreeCompanyName!;

		let message;

		if (characterInfo.Character.FreeCompanyName) {
			message = `Lodestone reports you are a member of ${fcName}. Set that as your Free Company?`;
		} else {
			message = 'Lodestone reports you are not a member of any Free Company. Remove your Free Company association?';
		}

		this.$q.dialog({
			title: 'Confirm Setting Free Company',
			message,
			ok: {
				label: fcName ? 'Set Free Company' : 'Unset Free Company',
				flat: true
			},
			cancel: 'Cancel',
		}).onOk(() => this.setFCFromLodestone());
	}

	async setFCFromLodestone() {
		this.loading = true;

		try {
			const fc = await this.$api.communities.setFCFromLodestone($store.getters.characterId!);
			this.communities.freeCompany = fc;

			this.$q.notify({
				type: 'positive',
				message: 'Free Company set.'
			});
		} catch (e) {
			this.$q.notify({
				type: 'negative',
				message: errors.getMessage(e)
			});
		} finally {
			this.loading = false;
		}
	}
}
</script>

<style lang="scss">
.page-my-communities h2 {
  margin-bottom: 0;
}

.page-my-communities__fc {
	display: flex;
	align-items: center;
	margin-bottom: 24px;
}

.page-my-communities__fc-info {
	padding-left: 12px;
}

.page-my-communities__fc-name {
	font-size: 1.2em;
	font-weight: bold;
}

.page-my-communities__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}
</style>