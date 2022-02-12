<template>
  <q-page class="page-my-communities">
		<h2>My Communities</h2>
			<section>
			<div class="page-my-communities__subtitle">for {{ $store.getters.character?.name }}</div>
		</section>
	</q-page>	
</template>

<script lang="ts">
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import minXIVAPI from 'src/common/xivapi-min';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $store = useStore();

@Options({
	name: 'PageMyCommunities',
	components: {
		
	},
  async beforeRouteEnter(_, __, next) {
    try {
      // next(vm => (vm as PageMyCommunities).setContent(communities));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  }
})
export default class PageMyCommunities extends Vue {
	communities: MyCommunitySummaryDto[] = [];
	loading = false;

	
}
</script>

<style lang="scss">
.page-my-communities h2 {
  margin-bottom: 0;
}

.page-my-communities__subtitle {
  text-align: center;
  font-family: $header-font;
  font-size: 1.6em;
  margin-bottom: 24px;
}
</style>