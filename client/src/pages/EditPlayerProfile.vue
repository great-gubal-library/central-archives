<template>
  <q-page class="page-edit-player-profile">
    <h2>Edit Player Profile</h2>
    <q-form @submit="onSubmit">
      <section v-if="!preview">
        <section class="page-edit-player-profile__form-controls">
          <q-input v-model="playerProfile.name" label="Player profile name *"
              :rules="[
                $rules.required('This field is required.'),
                val => !!val && playerNameRegex.test(val) || 'You can have one or two names with letters and apostrophes only, each beginning with a capital letter.'
              ]"
          />
          <p class="text-caption">
            You can name your public player profile whatever you like.
          </p>
          <p class="text-caption">
            To edit your <em>character</em> profile for {{ characterName }}, <router-link :to="editCharacterLink">go here instead</router-link>.
          </p>
        </section>
        <h6>Content</h6>
        <html-editor editor-id="player-profile-content" v-model="playerProfile.content" />
        <carrd-edit-section
          class="page-edit-player-profile__form-controls"
          entity-type="character"
          v-model="playerProfile.carrdProfile"
        />
      </section>
      <section v-else class="page-edit-player-profile__preview">
        <player-profile-view :id="userId" :player-profile="playerProfile" :preview="true" />
      </section>
      <div class="page-edit-player-profile__button-bar">
        <q-btn-toggle v-model="preview" :options="previewOptions" toggle-color="secondary" />
        <div class="page-edit-player-profile__revert-submit">
          <q-btn label="Revert" color="secondary" @click="onRevertClick" />&nbsp;
          <q-btn label="Save changes" type="submit" color="primary" />
        </div>
      </div>
      <q-inner-loading :showing="saving" />
    </q-form>

    <q-dialog v-model="confirmRevert" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Do you want to revert your unsaved changes to the last saved version?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Keep editing" color="secondary" v-close-popup />
          <q-btn flat label="Revert" color="negative" v-close-popup @click="onConfirmRevert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import SharedConstants from '@app/shared/SharedConstants';
import { PlayerProfileEditDto } from '@app/shared/dto/player-profiles/player-profile-edit.dto';
import errors from '@app/shared/errors';
import { playerNameRegex } from '@app/shared/validation/validators';
import { wikify } from '@common/common/wikilinks';
import { useApi } from 'src/boot/axios';
import { notifyError, notifySuccess } from 'src/common/notify';
import CarrdEditSection from 'src/components/common/CarrdEditSection.vue';
import PlayerProfileView from 'src/components/player-profile/PlayerProfileView.vue';
import { useRouter } from 'src/router';
import { useStore } from 'src/store';
import { Options, Vue } from 'vue-class-component';
import HtmlEditor from '../components/common/HtmlEditor.vue';

const $api = useApi();
const $router = useRouter();
const $store = useStore();

async function load(): Promise<PlayerProfileEditDto> {
  const userId = $store.state.user!.id;

  try {
    return await $api.playerProfiles.getPlayerProfile(userId);
  } catch (e) {
    if (errors.getStatusCode(e) === 404) {
      // Own player profile missing
      notifyError('Your player profile is private. Enable your public player profile first.');
      void $router.replace(`/player/${userId}`);
    } else {
      notifyError(e);
    }

    throw e;
  }
}

@Options({
  name: 'PageEditPlayerProfile',
  components: {
    HtmlEditor,
    PlayerProfileView,
    CarrdEditSection,
  },
  async beforeRouteEnter(to, _, next) {
    const playerProfile = await load();
    next((vm) => (vm as PageEditPlayerProfile).setContent(playerProfile));
  },
})
export default class PageEditPlayerProfile extends Vue {
  readonly SharedConstants = SharedConstants;

  readonly playerNameRegex = playerNameRegex;

  readonly previewOptions = [
    { label: 'Edit', value: false },
    { label: 'Preview', value: true },
  ];

  playerProfile = new PlayerProfileEditDto();
  playerProfileBackup = new PlayerProfileEditDto();
  preview = false;
  saving = false;

  confirmRevert = false;

  get userId() {
    return this.$store.state.user!.id;
  }

  get characterName() {
    return this.$store.getters.character!.name;
  }

  get editCharacterLink() {
    return `/edit-character/${this.$store.getters.characterId!}`;
  }

  setContent(playerProfile: PlayerProfileEditDto) {
    this.playerProfileBackup = new PlayerProfileEditDto(playerProfile);
    this.playerProfile = new PlayerProfileEditDto(this.playerProfileBackup);
  }

  onRevertClick() {
    this.confirmRevert = true;
  }

  onConfirmRevert() {
    this.playerProfile = new PlayerProfileEditDto(this.playerProfileBackup);
  }

  async onSubmit() {
    this.saving = true;

    try {
      await this.$api.playerProfiles.updateOwnPlayerProfile(this.playerProfile);
      this.playerProfileBackup = new PlayerProfileEditDto(this.playerProfile);

      notifySuccess('PlayerProfile saved.', {
        label: 'View',
        color: 'white',
        handler: () => this.viewPlayerProfile(),
      });
    } catch (e) {
      notifyError(e);
    } finally {
      this.saving = false;
    }
  }

  viewPlayerProfile() {
    const name = this.playerProfile.name;
    void this.$router.push(`/player/${this.userId}/${wikify(name)}`);
  }
}
</script>

<style lang="scss">
.page-edit-player-profile__form-controls {
  max-width: 500px;
  flex-basis: 0;
  flex-grow: 1;
}

.page-edit-player-profile__preview {
  margin-bottom: 24px;
}

.page-edit-player-profile__button-bar {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 16px;
}

.page-edit-player-profile__preview h6 {
  font-family: $header-font;
}
</style>
