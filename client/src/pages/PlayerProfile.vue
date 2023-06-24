<template>
  <q-page class="page-player-profile">
    <section v-if="enabled" class="edit-bar">
      <router-link to="/edit-player-profile">Edit player profile</router-link>
			<q-btn flat color="negative" label="Disable public player profile" @click="onDisableClick" />
		</section>
    <template v-if="mine && !enabled">
      <p>
        Your player profile is currently <strong>private</strong>.
      </p>
      <p>
        Your <em>character profiles</em> are public, but nobody except you can see which player they belong to.
      </p>
      <p>
        If you enable a public player profile, you will have a public page where you can write out of character (OOC) information about yourself as a roleplayer, rather than your character, and embed a player-wide Carrd profile if you have one. Your character profile pages will display links to that public page.
      </p>
      <p>
        If you change your mind, you can make your player profile private at any time.
      </p>
      <p>
        <q-btn color="negative" label="Enable public player profile" @click="onEnableClick" />
      </p>
      <p>
        Or perhaps you're looking for your <router-link :to="myCharacterProfileLink">public character profile</router-link> instead?
      </p>
    </template>
    <player-profile-view v-if="userId !== -1" :id="userId" :player-profile="playerProfile" :preview="false" />
    <report-violation-section :pageType="PageType.PLAYER_PROFILE" :pageId="userId" />
  </q-page>
</template>

<script lang="ts">
import { PageType } from '@app/shared/enums/page-type.enum';
import errors from '@app/shared/errors';
import PlayerProfileView from 'components/player-profile/PlayerProfileView.vue';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import { useRouter } from 'src/router';
import { Options, Vue } from 'vue-class-component';
import { RouteParams } from 'vue-router';
import ReportViolationSection from 'src/components/common/ReportViolationSection.vue';
import { PlayerProfileDto } from '@app/shared/dto/player-profiles/player-profile.dto';
import { createMetaMixin } from 'quasar';
import { useStore } from 'src/store';
import { wikify } from '@common/common/wikilinks';

const $api = useApi();
const $router = useRouter();
const $store = useStore();

interface LoadResult {
  id: number;
  playerProfile: PlayerProfileDto | null;
}

async function load(params: RouteParams): Promise<LoadResult> {
  const id = parseInt(params.id as string, 10);
  const name = params.name as string;

  if (!id) {
    void $router.replace('/');
    throw new Error();
  }

  try {
    const playerProfile = await $api.playerProfiles.getPlayerProfile(id);
    const wikifiedName = wikify(playerProfile.name);

    if (name !== wikifiedName) {
      void $router.replace(`/player/${id}/${wikifiedName}`);
    }

    return {
			id,
			playerProfile,
		};
  } catch (e) {
    if (errors.getStatusCode(e) === 404) {
			if (id === $store.state.user?.id) {
				// Own player profile missing
				return { id, playerProfile: null };
			} else {
				// Another player's profile missing
				notifyError('Player profile not found.');
      	void $router.replace('/');
			}
    } else {
      notifyError(e);
    }

    throw e;
  }
}

@Options({
  name: 'PagePlayerProfile',
  components: {
    PlayerProfileView,
    ReportViolationSection,
  },
  async beforeRouteEnter(to, _, next) {
    const playerProfile = await load(to.params);
    next((vm) => (vm as PagePlayerProfile).setContent(playerProfile));
  },
  async beforeRouteUpdate(to) {
    const playerProfile = await load(to.params);
    (this as PagePlayerProfile).setContent(playerProfile);
  },
  mixins: [
    createMetaMixin(function (this: PagePlayerProfile) {
      return {
        title: this.mine && !this.enabled ? 'My Player Profile — Chaos Archives' : `${this.playerProfile.name} — Chaos Archives`,
      };
    }),
  ],
})
export default class PagePlayerProfile extends Vue {
  readonly PageType = PageType;

  userId = -1;
  enabled = false;
  playerProfile = {} as PlayerProfileDto;

  setContent(content: LoadResult) {
    this.userId = content.id;
    this.enabled = this.mine && content.playerProfile !== null;
    this.playerProfile = content.playerProfile || ({} as PlayerProfileDto);
  }

  get mine() {
    return this.userId === this.$store.state.user?.id;
  }

  get myCharacterProfileLink() {
		const server = this.$store.getters.character?.server || '';
		const character = this.$store.getters.character?.name.replace(/ /g, '_') || '';
		return `/${server}/${character}`;
	}

  async onEnableClick() {
    try {
      this.playerProfile = await this.$api.playerProfiles.createOwnPlayerProfile();
      this.enabled = true;
      notifySuccess('Public character profile enabled.');
    } catch (e) {
      notifyError(e);
    }
  }

  onDisableClick() {
    this.$q.dialog({
        title: 'Confirm Disable',
        message: 'Do you want to disable your public player profile? Your player profile page will be hidden and your character profile pages will be unlinked from it.',
				ok: {
					label: 'Disable Public Player Profile',
					color: 'negative',
					flat: true
				},
        cancel: 'Cancel',
      }).onOk(async () => {
        try {
          await this.$api.playerProfiles.deleteOwnPlayerProfile();
          this.enabled = false;
          notifySuccess('Public character profile disabled.');
        } catch (e) {
          notifyError(e);
        }
      });    
  }
}
</script>

<style lang="scss"></style>
