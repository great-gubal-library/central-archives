<template>
    <q-table
        class="community-member-editor striped-list"
        :columns="columns"
        :rows="members"
        row-key="id"
        wrap-cells
    >
    <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <q-avatar round>
            <img :src="props.row.avatar" />
          </q-avatar>
        </q-td>
      </template>
    </q-table>
</template>

<script lang="ts">
import { CommunityMemberDto } from '@app/shared/dto/communities/community-member.dto';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  members = prop<CommunityMemberDto[]>({
    required: true
  });
}

@Options({
  name: 'CommunityApplicantEditor',
  components: {
  },
})
export default class CommunityApplicantEditor extends Vue.with(Props) {
  members: CommunityMemberDto[] = [];

  get columns() {
    return [
      {
        name: 'avatar',
        field: 'avatar',
        label: '',
        align: 'left',
        sortable: false,
      },
      {
        name: 'name',
        field: 'name',
        label: 'Name',
        align: 'left',
        sortable: false,
      },
      {
        name: 'actions',
        field: 'status',
        label: 'Actions',
        align: 'left',
        sortable: false,
      },
    ];
  }
}
</script>

<style lang="scss">

</style>
