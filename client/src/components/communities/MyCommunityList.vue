<template>
  <div class="my-community-list striped-list">
    <q-list v-if="communities.length" bordered>
      <q-item
        v-for="community in communities"
        :key="`${community.id}`"
        clickable
        v-ripple
        :to="getLink(community)"
      >
        <q-item-section>
            <q-item-label>{{community.name}}</q-item-label>
            <q-item-label caption>{{community.goal}}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="community.mine">
          <q-btn flat dense icon="edit" :to="`/edit-community/${community.id}`" @click.stop="" />
          <q-btn flat dense icon="delete" @click.stop.prevent="onDeleteClick(community)" />
        </q-item-section>
      </q-item>
    </q-list>
    <p v-else>
      You are not a member of any community on Chaos Archives. Yet!
    </p>
  </div>
</template>

<script lang="ts">
import { MyCommunitySummaryDto } from '@app/shared/dto/communities/my-community-summary.dto';
import { notifyError, notifySuccess } from 'src/common/notify';
import { prop, Options, Vue } from 'vue-class-component';

class Props {
  communities = prop<MyCommunitySummaryDto[]>({
    required: true
  });
}

@Options({
  name: 'MyCommunityList',
  emits: [ 'deleted' ]
})
export default class MyCommunityList extends Vue.with(Props) {
  getLink(community: MyCommunitySummaryDto) {
    return `/community/${community.name.replace(/ /g, '_')}`;
  }

	onDeleteClick(community: MyCommunitySummaryDto) {
		this.$q.dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the community “${community.name}”?`,
				ok: {
					label: 'Delete',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
					await this.$api.communities.deleteCommunity(community.id);
          notifySuccess('Community deleted.');
          this.$emit('deleted', community);
				} catch (e) {
					notifyError(e);
				}
      });
	}
}
</script>

<style lang="scss">
.my-community-list .q-item__section--side {
  flex-direction: row;
  flex-wrap: nowrap;
}
</style>
