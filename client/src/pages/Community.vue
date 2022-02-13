<template>
  <q-page class="page-community">
    <template v-if="community.id">
      <section v-if="!community.membershipStatus" class="page-community__edit-bar">
        <q-btn flat color="primary" label="Join community" @click="onJoinClick" />
      </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.APPLIED"
        class="page-community__edit-bar page-community__membership-status"
      >
        You have applied to join this community. An officer will have to review your application before you can join.
      </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.REJECTED"
        class="page-community__edit-bar page-community__membership-status"
      >
        Your membership application has been rejected.
      </section>
      <section v-else-if="community.canEdit" class="page-community__edit-bar">
        <router-link :to="`/edit-community/${community.id}`">Edit community</router-link>
        <q-btn flat color="negative" label="Delete community" @click="onDeleteClick" />
      </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.CONFIRMED"
        class="page-community__edit-bar page-community__membership-status"
      >
        You are a member of this community.
      </section>
      <community-profile :community="community" />
      <template v-if="!community.canManageMembers">
        <h3>Members</h3>
        <character-name-list :profiles="members" />
      </template>
      <template v-else>
        <h3>Applicants</h3>
        <community-applicant-editor
          :community-id="community.id"
          :members="applicants"
          @updated="refreshEditableMembers"
        />
      </template>
    </template>
  </q-page>
</template>

<script lang="ts">
import { CommunityDto } from '@app/shared/dto/communities/community.dto';
import CommunityProfile from 'components/communities/CommunityProfile.vue';
import CharacterNameList from 'components/mainpage/CharacterNameList.vue';
import { useApi } from 'src/boot/axios';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { MetaOptions } from 'quasar/dist/types/meta';
import { createMetaMixin } from 'quasar';
import { PagingResultDto } from '@app/shared/dto/common/paging-result.dto';
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { useStore } from 'src/store';
import { MembershipStatus } from '@app/shared/enums/membership-status.enum';
import { CommunityMemberDto } from '@app/shared/dto/communities/community-member.dto';
import CommunityApplicantEditor from 'src/components/communities/CommunityApplicantEditor.vue';

const $api = useApi();
const $store = useStore();
const $router = useRouter();

async function load(
  params: RouteParams
): Promise<{ community: CommunityDto; members: PagingResultDto<CharacterSummaryDto> }> {
  const name = params.name as string;

  if (!name) {
    void $router.replace('/');
    throw new Error();
  }

  try {
    const characterId = $store.getters.characterId!;
    const community = await $api.communities.getCommunityByName(name.replace(/_/g, ' '), characterId);
    const members = await $api.characters.getCharacterProfiles({ communityId: community.id, limit: 99999 });
    return { community, members };
  } catch (e) {
    notifyError(e);
    void $router.replace('/');
    throw e;
  }
}

@Options({
  components: {
    CommunityProfile,
    CharacterNameList,
    CommunityApplicantEditor,
  },
  async beforeRouteEnter(to, _, next) {
    const { community, members } = await load(to.params);
    next((vm) => (vm as PageCommunity).setContent(community, members));
  },
  async beforeRouteUpdate(to) {
    const { community, members } = await load(to.params);
    (this as PageCommunity).setContent(community, members);
  },
  mixins: [
    createMetaMixin(function (this: PageCommunity) {
      const result: MetaOptions = {
        title: `${this.community.name} — Chaos Archives`,
        meta: {},
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
  readonly MembershipStatus = MembershipStatus;

  community: CommunityDto = new CommunityDto();
  members: CharacterSummaryDto[] = [];
  applicants: CommunityMemberDto[] = [];
  confirmedMembers: CommunityMemberDto[] = [];

  setContent(community: CommunityDto, members: PagingResultDto<CharacterSummaryDto>) {
    this.community = community;
    this.members = members.data;

    if (community.canManageMembers) {
      void this.refreshEditableMembers();
    }
  }

  async refreshEditableMembers() {
    const allMembers = await this.$api.communities.getMembers(this.community.id);
    this.applicants = allMembers.filter((member) => member.status === MembershipStatus.APPLIED);
    this.confirmedMembers = allMembers.filter((member) => member.status === MembershipStatus.CONFIRMED);
  }

  onDeleteClick() {
    this.$q
      .dialog({
        title: 'Confirm Delete',
        message: `Do you want to delete the community “${this.community.name}”?`,
        ok: {
          label: 'Delete',
          color: 'negative',
          flat: true,
        },
        cancel: 'Cancel',
      })
      .onOk(async () => {
        try {
          await this.$api.communities.deleteCommunity(this.community.id);

          notifySuccess('Community deleted.');
          void this.$router.replace('/');
        } catch (e) {
          notifyError(e);
        }
      });
  }

  onJoinClick() {
    const character = this.$store.getters.character!;

    this.$q
      .dialog({
        title: 'Confirm Join',
        message: `Do you want to apply for membership in “${this.community.name}” as ${character.name}? An officer will have to confirm your application.`,
        ok: {
          label: 'Apply',
          color: 'primary',
          flat: true,
        },
        cancel: {
          label: 'Cancel',
          color: 'secondary',
          flat: true,
        },
      })
      .onOk(async () => {
        try {
          await this.$api.communities.applyForMembership(this.community.id, character.id);
          this.community.membershipStatus = MembershipStatus.APPLIED;
          notifySuccess('You have applied for membership.');
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
