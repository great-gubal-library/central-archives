<template>
  <q-page class="page-community">
    <template v-if="community.id">
      <section v-if="!$store.getters.characterId"><!-- Not logged in --></section>
      <section v-else-if="!community.membershipStatus" class="page-community__join-button-bar">
        <q-btn outline color="primary" label="Community beitreten" @click="onJoinClick" />
      </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.APPLIED"
        class="page-community__edit-bar page-community__membership-status"
      >
        Du hast eine Anfrage für eine Mitgliedschaft in dieser Community gesendet. Eine Führungsperson muss deine Bewerbung überprüfen bevor du beitreten kannst.
        </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.REJECTED"
        class="page-community__edit-bar page-community__membership-status"
      >
        Deine Mitgliedschaftsanfrage wurde abgelehnt.
      </section>
      <section v-else-if="community.canEdit" class="page-community__edit-bar">
        <router-link :to="`/edit-community/${community.id}`">Community bearbeiten</router-link>
        <q-btn flat color="negative" label="Community löschen" @click="onDeleteClick" />
      </section>
      <section
        v-else-if="community.membershipStatus === MembershipStatus.CONFIRMED"
        class="page-community__edit-bar page-community__membership-status"
      >
        Du bist ein Mitglied dieser Community.
      </section>
      <community-profile :community="community" />
      <template v-if="!community.canManageMembers">
        <h3>Mitglieder</h3>
        <character-name-list :profiles="members" />
      </template>
      <template v-else>
				<template v-if="applicants.length > 0">
					<h3>Bewerber</h3>
					<community-applicant-editor
						:community-id="community.id"
						:members="applicants"
						@updated="refreshEditableMembers"
					/>
				</template>
				<h3>Mitglieder</h3>
        <community-member-editor
          :community="community"
          :members="confirmedMembers"
          @updated="refreshEditableMembers"
        />
      </template>
    	<report-violation-section :pageType="PageType.COMMUNITY" :pageId="community.id" />
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
import CommunityMemberEditor from 'src/components/communities/CommunityMemberEditor.vue';
import { PageType } from '@app/shared/enums/page-type.enum';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';

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
		CommunityMemberEditor,
		ReportViolationSection,
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
	readonly PageType = PageType;
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
        title: 'Löschbestätigung',
        message: `Möchtest du “${this.community.name}” wirklich löschen?`,
        ok: {
          label: 'Löschen',
          color: 'negative',
          flat: true,
        },
        cancel: 'Abbrechen',
      })
      .onOk(async () => {
        try {
          await this.$api.communities.deleteCommunity(this.community.id);

          notifySuccess('Community wurde gelöscht.');
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
        title: 'Mitgliedschaftsantrag',
        message: `Möchtest du dich bei “${this.community.name}” als ${character.name} bewerben? Eine Führungsperson muss deine Bewerbung bestätigen.`,
        ok: {
          label: 'Bewerben',
          color: 'primary',
          flat: true,
        },
        cancel: {
          label: 'Abbrechen',
          color: 'secondary',
          flat: true,
        },
      })
      .onOk(async () => {
        try {
          await this.$api.communities.applyForMembership(this.community.id, character.id);
          this.community.membershipStatus = MembershipStatus.APPLIED;
          notifySuccess('Du hast dich beworben.');
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

.page-community__join-button-bar {
  text-align: center;
  margin-bottom: 8px;
}
</style>
