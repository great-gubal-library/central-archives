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
          <q-item-label>Switch character</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator dark />
      <q-item
        v-if="$store.getters.role === Role.UNVERIFIED"
        clickable
        v-ripple
        to="/verify"
      >
        <q-item-section>
          <q-item-label>{{ $store.getters.realRole === Role.UNVERIFIED ? 'Account verification' : 'Character verification'}}</q-item-label>
        </q-item-section>
      </q-item>
      <template v-else>
        <q-item
          clickable
          v-ripple
          :to="myProfileLink"
        >
          <q-item-section>
            <q-item-label>View profile</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/edit-character"
        >
          <q-item-section>
            <q-item-label>Edit profile</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/create-story"
        >
          <q-item-section>
            <q-item-label>New story</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/create-event"
        >
          <q-item-section>
            <q-item-label>New event</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator dark />
        <q-item
          clickable
          v-ripple
          @click="uploadImage"
        >
          <q-item-section>
            <q-item-label>Upload image</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/my-images"
        >
          <q-item-section>
            <q-item-label>My images</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <q-separator dark />
      <q-item clickable v-ripple @click="logOut">
        <q-item-section>
          <q-item-label>Log out</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { Role } from '@app/shared/enums/role.enum';
import { SessionCharacterDto } from '@app/shared/dto/user/session-character.dto';

@Options({
  
})
export default class UserMenu extends Vue {
  readonly Role = Role;

  get myProfileLink() {
		const server = this.$store.getters.character?.server || '';
		const character = this.$store.getters.character?.name.replace(' ', '_') || '';
		return `/${server}/${character}`;
	}

  async switchCharacter() {
    const SwitchCharacterDialog = (await import('components/character/SwitchCharacterDialog.vue')).default;

    this.$q.dialog({
      component: SwitchCharacterDialog
    }).onOk((character: SessionCharacterDto) => {
      if (character.verified) {
        void this.$router.push('/');
      } else {
        void this.$router.push('/verify');
      }
    });
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
    this.$q.notify({
      message: 'You have been logged out.'
    });
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
</style>
