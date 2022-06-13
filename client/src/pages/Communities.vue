<template>
  <q-page class="page-communities">
		<h2>Communities</h2>
		<community-list :communities="communities" />
	</q-page>	
</template>

<script lang="ts">
import { CommunitySummaryDto } from '@app/shared/dto/communities/community-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from '@common/common/notify';
import CommunityList from 'components/communities/CommunityList.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();

@Options({
	name: 'PageCommunities',
	components: {
		CommunityList
	},
  async beforeRouteEnter(_, __, next) {
    try {
      const communities = await $api.communities.getCommunities();
      next(vm => (vm as PageCommunities).setContent(communities));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageCommunities extends Vue {
	communities: CommunitySummaryDto[] = [];

	setContent(communities: CommunitySummaryDto[]) {
		this.communities = communities;
	}
}
</script>

<style lang="scss">

</style>