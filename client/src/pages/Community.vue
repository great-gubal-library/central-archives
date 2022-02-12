<template>
  <q-page class="page-community">
		<template v-if="community.id">
			<section v-if="community.mine" class="page-community__edit-bar">
				<router-link :to="`/edit-community/${community.id}`">Edit community</router-link>
				<q-btn flat color="negative" label="Delete community" @click="onDeleteClick" />
			</section>
			<community-profile :community="community" />
		</template>
	</q-page>	
</template>

<script lang="ts">
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import CommunityProfile from 'components/communities/CommunityProfile.vue';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { MetaOptions } from 'quasar/dist/types/meta';
import { createMetaMixin } from 'quasar';

const $api = useApi();
const $router = useRouter();

async function load(params: RouteParams): Promise<CommunityDto> {
		const name = params.name as string;

		if (!name) {
			void $router.replace('/');
			throw new Error();
		}

		try {
			return await $api.communities.getCommunityByName(name.replace(/_/g, ' '));
		} catch (e) {			
			notifyError(e);
			void $router.replace('/');
			throw e;
		}
}

@Options({
	components: {
		CommunityProfile,
	},
	async beforeRouteEnter(to, _, next) {
		const content = await load(to.params);
		next(vm => (vm as PageCommunity).setContent(content));
	},
	async beforeRouteUpdate(to) {
		const content = await load(to.params);
		(this as PageCommunity).setContent(content);
	},
	mixins: [
		createMetaMixin(function(this: PageCommunity) {
			const result: MetaOptions = {
				title: `${this.community.name} — Chaos Archives`,
				meta: {}
			};

			if (this.community.banner) {
				Object.assign(result.meta, {
					ogImage: {
						property: 'og:image',
						content: this.community.banner.url,
					},
					twitterCard: {
						property: 'twitter:card',
						content: 'summary_large_image',
					},
				});
			}

			return result;
		}),
	],
})
export default class PageCommunity extends Vue {
	community: CommunityDto = new CommunityDto();

	setContent(community: CommunityDto) {
		this.community = community;
	}

	onDeleteClick() {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the community “${this.community.name}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.communities.deleteCommunity(this.community.id);

					notifySuccess('Community deleted.');
					void this.$router.replace('/');
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">
.page-community__edit-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>