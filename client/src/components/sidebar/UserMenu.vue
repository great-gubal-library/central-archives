<template>
  <q-list class="user-menu" dense dark>
    <template v-if="!$store.state.user">
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
        {{ $store.state.user.character.name }}
      </q-item-label>
      <!--
          <q-item v-for="link in userLinks" clickable v-ripple :key="link.label" :to="link.to">
            <q-item-section>
              <q-item-label>{{link.label}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item dense label="Create content" header-class="text-bold">
            <q-list class="layout__create-content-list" dense>
              <q-item v-for="link in createContentLinks" clickable v-ripple :key="link.label" :to="link.to">
                <q-item-section>
                  <q-item-label>{{link.label}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          -->
      <q-item
        v-if="$store.state.user.role === 'unverified'"
        clickable
        v-ripple
        to="/verify"
      >
        <q-item-section>
          <q-item-label>Account verification</q-item-label>
        </q-item-section>
      </q-item>
      <template v-if="$store.state.user.role !== 'unverified'">
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
          @click="uploadImage"
        >
          <q-item-section>
            <q-item-label>Upload image</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <q-item clickable v-ripple @click="logOut">
        <q-item-section>
          <q-item-label>Log out</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { ImageSummaryDto } from '@app/shared/dto/image/image-summary.dto';
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';
import { useApi } from 'src/boot/axios';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const $store = useStore();
const $api = useApi();
const $router = useRouter();

const myProfileLink = computed(() => {
  const server = $store.state.user?.character.server || '';
  const character = $store.state.user?.character.name.replace(' ', '_') || '';
  return `/${server}/${character}`;
});

async function uploadImage() {
  const UploadDialog = (await import('components/upload/UploadDialog.vue')).default;

  $q.dialog({
    component: UploadDialog
  }).onOk(async (image: ImageSummaryDto) => {
    console.log('onOk', image);
    const PostUploadDialog = (await import('components/upload/PostUploadDialog.vue')).default;

    $q.dialog({
      component: PostUploadDialog,
      componentProps: {
        image
      }
    });
  });
}

function logOut() {
  $store.commit('setUser', null);
  $api.setAccessToken(null);
  $q.notify({
    message: 'You have been logged out.'
  });
  void $router.push('/');
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
