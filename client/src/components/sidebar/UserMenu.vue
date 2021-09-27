<template>
  <q-list class="user-menu" dense dark>
    <template v-if="!$store.state.user">
      <q-item-label header> User </q-item-label>
      <q-item class="user-menu__button-bar">
        <q-item-section>
          <q-item-label>
            <q-btn color="green-7" label="Sign up" to="/signup" />&nbsp;
            <q-btn color="grey-7" label="Log in" to="/login" />
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
      <q-item
        v-if="$store.state.user.role !== 'unverified'"
        clickable
        v-ripple
        :to="myProfileLink"
      >
        <q-item-section>
          <q-item-label>View profile</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-if="$store.state.user.role !== 'unverified'"
        clickable
        v-ripple
        to="/edit-character"
      >
        <q-item-section>
          <q-item-label>Edit profile</q-item-label>
        </q-item-section>
      </q-item>
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

@Options({
  
})
export default class UserMenu extends Vue {
  get myProfileLink() {
		const server = this.$store.state.user?.character.server || '';
		const character = this.$store.state.user?.character.name.replace(' ', '_') || '';
		return `/${server}/${character}`;
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
</style>
