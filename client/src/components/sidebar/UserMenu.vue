<template>
  <q-list class="user-menu" dense dark>
    <template v-if="!$store.getters.role">
      <q-item-label header> User </q-item-label>
      <q-item class="user-menu__button-bar">
        <q-item-section>
          <q-item-label>
            <q-btn class="user-menu__sign-up-button" label="Sign up" to="/signup" />&nbsp;
            <q-btn class="user-menu__log-in-button" label="Log in" to="/login" />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple to="/forgot-password">
        <q-item-section>
          <q-item-label>
            Forgot your password?
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <q-item-label header>
        {{ $store.getters.character?.name }}
      </q-item-label>
      <q-item
        clickable
        v-ripple
        @click="switchCharacter"
      >
        <q-item-section>
          <q-item-label><q-icon class="text-h6" name="swap_horiz" /> Switch character</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-if="$store.getters.role === Role.UNVERIFIED"
        clickable
        v-ripple
        to="/verify"
      >
        <q-separator dark />
        <q-item-section>
          <q-item-label><q-icon class="text-h6" name="verified" /> {{ $store.getters.realRole === Role.UNVERIFIED ? 'Account verification' : 'Character verification'}}</q-item-label>
        </q-item-section>
      </q-item>
      <template v-else>
        <q-item
          clickable
          v-ripple
          :to="myPlayerProfileLink"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="account_box" /> My player profile</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark />
        <q-item
          clickable
          v-ripple
          :to="myCharacterProfileLink"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="face" /> View character profile</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :to="`/edit-character/${$store.getters.characterId}`"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="edit" /> Edit character profile</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/my-free-company"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="" /> My Free Company</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark />
        <q-item
          clickable
          v-ripple
          to="/create-community"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="" /> Create community</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/my-communities"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="" /> My communities</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark />
        <q-item
          clickable
          v-ripple
          to="/create-venue"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="" /> Create venue</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/my-venues"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="" /> My venues</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark />
        <q-item
          clickable
          v-ripple
          to="/create-story"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="auto_stories" /> New story</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/create-event"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="event" /> New event</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/create-noticeboard-item"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="sticky_note_2" /> New noticeboard item</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-if="$store.getters.isTrusted"
          clickable
          v-ripple
          to="/create-wiki-page"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="history_edu" /> New wiki page</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="uploadImage"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="upload" /> Upload image</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/my-content"
        >
          <q-item-section>
            <q-item-label><q-icon class="text-h6" name="list" /> My content</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <q-separator dark />
      <q-item clickable v-ripple to="/my-account">
        <q-item-section>
          <q-item-label><q-icon class="text-h6" name="manage_accounts" /> Account and security</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-ripple @click="logOut">
        <q-item-section>
          <q-item-label><q-icon class="text-h6" name="logout" /> Log out</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { notifySuccess } from 'src/common/notify';
import { switchCharacter } from 'src/common/switch-character';

@Options({

})
export default class UserMenu extends Vue {
  readonly Role = Role;

  get myPlayerProfileLink() {
    return `/player/${this.$store.state.user!.id}`;
  }

  get myCharacterProfileLink() {
		const server = this.$store.getters.character?.server || '';
		const character = this.$store.getters.character?.name.replace(/ /g, '_') || '';
		return `/${server}/${character}`;
	}

  async switchCharacter() {
    await switchCharacter();
  }

  async uploadImage() {
    const UploadDialog = (await import('components/upload/UploadDialog.vue')).default;

    this.$q.dialog({
      component: UploadDialog
    }).onOk(async (image: ImageSummaryDto) => {
      const PostUploadDialog = (await import('components/upload/PostUploadDialog.vue')).default;

      this.$q.dialog({
        component: PostUploadDialog,
        componentProps: {
          image
        }
      });
    });
  }

  logOut() {
    this.$store.commit('setUser', null);
    this.$api.setAccessToken(null);
    notifySuccess('You have been logged out.');
    void this.$router.push('/');
  }
}
</script>

<style lang="scss">
.user-menu__button-bar {
  margin-bottom: 8px;
}

.user-menu__sign-up-button {
  background-color: #ae9459;
}

.user-menu__log-in-button {
  background-color: #2e95b6;
}

.user-menu .q-icon {
  margin-right: 4px;
  color: #e0e0e0;
}
</style>
