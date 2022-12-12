<template>
  <q-page class="page-my-communities">
    <h2>Meine Communities</h2>
    <section>
      <div class="page-my-communities__subtitle">for {{ $store.getters.character?.name }}</div>
    </section>
    <my-community-list :communities="communities" @deleted="onCommunityDeleted" />
    <div class="page-my-communities__button-bar">
      <q-btn color="primary" icon="add" label="Neue Community" to="create-community" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { useApi } from 'src/boot/axios';
import { notifyError } from 'src/common/notify';
import { useStore } from 'src/store';
import MyCommunityList from 'components/communities/MyCommunityList.vue';
import { Options, Vue } from 'vue-class-component';

const $api = useApi();
const $store = useStore();

@Options({
  name: 'PageMyCommunities',
  components: {
    MyCommunityList,
  },
  async beforeRouteEnter(_, __, next) {
    try {
      const characterId = $store.getters.characterId!;
      const communities = await $api.communities.getMyCommunities(characterId);
      next(vm => (vm as PageMyCommunities).setContent(communities));
    } catch (e) {
      console.log(e);
      notifyError(e);
    }
  },
})
export default class PageMyCommunities extends Vue {
  communities: MyCommunitySummaryDto[] = [];
  loading = false;

  setContent(communities: MyCommunitySummaryDto[]) {
    this.communities = communities;
  }

  onCommunityDeleted(community: MyCommunitySummaryDto) {
    const index = this.communities.indexOf(community);

    if (index > 0) {
      this.communities.splice(index, 1);
    }
  }
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

.page-my-communities__button-bar {
	margin-top: 8px;
	text-align: right;
}
</style>
