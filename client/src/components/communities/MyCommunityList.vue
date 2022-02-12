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
          <q-btn flat icon="edit" :to="`edit-community/${community.id}`" />
          <q-btn flat icon="trash" />
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
import { prop, Options, Vue } from 'vue-class-component';

class Props {
  communities = prop<MyCommunitySummaryDto[]>({
    required: true
  });
}

@Options({
  name: 'MyCommunityList',
})
export default class MyCommunityList extends Vue.with(Props) {
  getLink(community: MyCommunitySummaryDto) {
    return `/community/${community.name.replace(/ /g, '_')}`;
  }
}
</script>

<style lang="scss">

</style>
