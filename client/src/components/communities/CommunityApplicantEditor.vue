<template>
    <q-table
        class="community-applicant-editor striped-list paged-link-table"
        :columns="columns"
        :rows="members"
        :pagination="{rowsPerPage: 0}"
        hide-pagination
        row-key="id"
        wrap-cells
    >
      <template v-slot:no-data>No pending applicants.</template>
      <template v-slot:header-cell-avatar="props">
        <q-th :props="props" auto-width />
      </template>
      <template v-slot:header-cell-actions="props">
        <q-th :props="props" auto-width>Actions</q-th>
      </template>
      <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <q-avatar round>
              <img :src="props.row.avatar" />
            </q-avatar>
          </router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <router-link :to="getLink(props.row)">
            <span class="community-applicant-editor__column-name">{{props.row.name}}</span>
          </router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="community-applicant-editor__cell-actions">
          <q-btn flat color="primary" label="Approve" @click="onApproveClick(props.row)" />
          <q-btn flat color="negative" label="Reject" @click="onRejectClick(props.row)" />
        </q-td>
      </template>
    </q-table>
</template>

<script lang="ts">
import { CommunityMemberDto } from '@app/shared/dto/communities/community-member.dto';
import { notifyError, notifySuccess } from '@common/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  members = prop<CommunityMemberDto[]>({
    required: true
  });

  communityId = prop<number>({
    required: true
  });
}

@Options({
  name: 'CommunityApplicantEditor',
  components: {
  },
  emits: [ 'updated' ]
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
        align: 'center',
        sortable: false,
      },
    ];
  }

  getLink(member: CommunityMemberDto) {
    return `/${member.server}/${member.name.replace(/ /g, '_')}`;
  }

  async onApproveClick(member: CommunityMemberDto) {
    try {
      await this.$api.communities.approveMember(this.communityId, member.characterId);
      notifySuccess(`Membership request for ${member.name} approved.`);
      this.$emit('updated');
    } catch (e) {
      notifyError(e);
    }
  }

  onRejectClick(member: CommunityMemberDto) {
    this.$q
      .dialog({
        title: 'Confirm Reject',
        message: `Do you want to reject ${member.name}'s membership application?`,
        ok: {
          label: 'Reject',
          color: 'negative',
          flat: true,
        },
        cancel: 'Cancel',
      })
      .onOk(async () => {
        try {
          await this.$api.communities.rejectMember(this.communityId, member.characterId);
          notifySuccess(`Membership request for ${member.name} rejected.`);
          this.$emit('updated', member);
        } catch (e) {
          notifyError(e);
        }
      });
  }
}
</script>

<style lang="scss">
.community-applicant-editor__cell-actions {
  white-space: nowrap;
}

.community-applicant-editor__column-name {
  font-size: $body-font-size;
}
</style>
