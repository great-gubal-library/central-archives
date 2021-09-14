<template>
  <q-layout view="hHh LpR fff">
    <q-header elevated>
      <q-toolbar>
        <div class="layout__filler">
          <q-btn
            flat
            dense
            no-caps
            icon="menu"
            tooltip="Menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          >
            <span v-if="$store.state.user" class="gt-sm layout__char-name">{{ $store.getters.characterShortName }}</span>
            <q-tooltip>Menu</q-tooltip>
          </q-btn>
          <q-btn-group v-if="!$store.state.user" flat class="gt-sm">
            <q-btn flat label="Sign up" to="/signup" />
            <q-btn flat label="Log in" to="/login" />
          </q-btn-group>
        </div>

        <q-toolbar-title class="layout__toolbar-title text-center">
          <router-link to="/">Chaos Archives</router-link>
        </q-toolbar-title>

        <div class="layout__filler justify-end">
          <q-btn-group flat class="gt-sm">
            <q-btn v-for="link in navbarLinks" stretch flat :key="link.label" :label="link.label" :to="link.to" />
          </q-btn-group>
          <q-btn-dropdown flat class="lt-md" dropdown-icon="more_horiz">
            <q-list>
              <q-item
                v-for="link in navbarLinks"
                clickable
                v-close-popup
                :key="link.label"
                :to="link.to"
              >
                <q-item-section>
                  <q-item-label>{{link.label}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn dense flat round icon="event" @click="toggleRightDrawer">
            <q-tooltip>Events</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      dark
      side="left"
      :class="DRAWER_BG"
      :width="DRAWER_WIDTH"
    >
      
      <q-list dense dark>
        <q-item>
          <q-item-section>
            <q-input dark label="Search" />
          </q-item-section>
        </q-item>
        <q-item-label header>
          Chaos Archives
        </q-item-label>
        <q-item v-for="link in siteLinks" clickable v-ripple :key="link.label" :to="link.to">
          <q-item-section>
            <q-item-label>{{link.label}}</q-item-label>
          </q-item-section>
        </q-item>
        <template v-if="!$store.state.user">
          <q-item-label header>
            User
          </q-item-label>
          <q-item clickable v-ripple to="/signup">
            <q-item-section>
              <q-item-label>Sign up</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/login">
            <q-item-section>
              <q-item-label>Log in</q-item-label>
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
          <q-item v-if="$store.state.user.role === 'unverified'" clickable v-ripple to="/verify">
            <q-item-section>
              <q-item-label>Account verification</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="logOut">
            <q-item-section>
              <q-item-label>Log out</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      dark
      side="right"
      :class="DRAWER_BG"
      :width="DRAWER_WIDTH"
    >
      <event-list />
      <q-list dense dark>
        <q-item-label header>
          Friend activity
        </q-item-label>
        <q-item v-for="event in friendActivity" clickable v-ripple :key="event.title">
          <q-item-section>
            <q-item-label>{{event.title}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="layout__page-container">
        <router-view />
        </div>
    </q-page-container>

    <q-footer elevated>
      <q-toolbar>
        <div class="layout__filler text-body justify-center text-center">
          Final Fantasy XIV is © 2010&ndash;2021 Square Enix Holdings Co., Ltd. All rights reserved.<br />
          All text and images on this site are © 2021 by their respective owners.
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">

import { Vue, Options } from 'vue-class-component'
import EventList from '../components/eventbar/EventList.vue'

@Options({
  components: {
    EventList
  }
})
export default class MainLayout extends Vue {
  readonly DRAWER_BG = 'layout__drawer';
  readonly DRAWER_WIDTH = 250;

  readonly navbarLinks = [
    { label: 'About', to: '/about' },
    { label: 'Rules', to: '/rules' },
    // { label: 'FAQ', to: '' },
    { label: 'Contact', to: '' },
  ];

  readonly siteLinks = [
    { label: 'About', to: '/about' },
    { label: 'People', to: '' },
    { label: 'Free Companies', to: '' },
    { label: 'Noticeboard', to: '' },
    { label: 'Adventures', to: '' },
  ];

  readonly userLinks = [
    { label: 'My profile', to: '' },
    { label: 'My account', to: '' },
    { label: 'My content', to: '' },
    { label: 'My friendlist', to: '' },
    { label: 'My mailbox', to: '' },
    { label: 'Switch character', to: '' },
  ];

  readonly createContentLinks = [
    { label: 'Adventure', to: '' },
    { label: 'Advertisement', to: '' },
    { label: 'Event', to: '' },
    { label: 'Free Company', to: '' },
    { label: 'Noticeboard item', to: '' },
  ];

  readonly events = [
    { title: 'Tavern Roulette', date: '23 August 2021' },
    { title: 'Market Night', date: '24 August 2021' },
    { title: 'Eorzea Grand Prix', date: '25 August 2021' },
    { title: 'The Daily Moogle Open Doors', date: '26 August 2021' },
  ];

  readonly friendActivity = [
    { title: 'Dungeon Crawlin\' Fools' },
    { title: 'No Cure for the Paladin Blues' },
    { title: 'War and XPs' },
    { title: 'Don\'t Split the Party' },
    { title: 'Blood Runs in the Family' },
    { title: 'Utterly Dwarfed' },
  ];

  leftDrawerOpen = false;
  rightDrawerOpen = false;  

  toggleLeftDrawer () {
    this.leftDrawerOpen = !this.leftDrawerOpen
  }

  toggleRightDrawer () {
    this.rightDrawerOpen = !this.rightDrawerOpen
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
  .layout__filler {
    flex-basis: 0;
    flex-grow: 1;
    display: flex;
    flex-wrap: nowrap;
  }

  .layout__char-name {
    padding-left: 6px;
    font-size: 1rem;
  }

  .layout__toolbar-title {
    flex-basis: inherit;
    flex-grow: 0;
  }

  .layout__toolbar-title a {
    color: inherit;
    text-decoration: inherit;
	  border-bottom: none;
  }

  .layout__toolbar-title a:hover {
    color: #e8e8e8;
  }

  .q-header {
    background: rgba(#006ead, 0.8);
  }

  .q-drawer {
    background: rgba(#016097, 0.4);
  }

  @media screen and (max-width: 1023px) {
   .q-drawer {
      background: #006ead;
    } 
  }

  .q-drawer .q-item__label--header {
    font-family: Michroma, sans-serif;
    font-weight: bold;
  }

  .q-drawer .q-item.q-router-link--active, .q-drawer .q-item--active {
    color: #c0c0c0;
    font-weight: bold;
  }

  .q-drawer .q-list a {
    border-bottom: none;
  }

  .q-toolbar__title {
    font-family: Michroma, sans-serif;
    font-weight: bold;
  }

  .layout__create-content-list {
    padding-left: 12px;
    background: #016097;
  }

  .layout__page-container {
    max-width: 800px;
    padding: 16px;
    margin: auto;
    background: rgba(white, 0.9);
    box-shadow: rgba(black, 0.2) 8px 0px 4px, rgba(black, 0.2) -8px 0 4px;
  }
  
  .q-footer {
    background: #795548;
  }
</style>
