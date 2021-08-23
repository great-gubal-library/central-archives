<template>
  <q-layout view="hHh lpR fff">
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
            <span class="gt-sm layout__char-name">Vielle</span>
            <q-tooltip>Menu</q-tooltip>
          </q-btn>
        </div>

        <q-toolbar-title class="layout__toolbar-title text-center">
          Chaos Archives
        </q-toolbar-title>

        <div class="layout__filler text-right">
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
      bordered
      side="left"
      :class="DRAWER_BG"
    >
      
      <q-list dense>
        <q-item-label header>
          <q-input label="Search" />
        </q-item-label>
        <q-item-label header>
          Chaos Archives
        </q-item-label>
        <q-item v-for="link in siteLinks" clickable v-ripple :key="link.label" :to="link.to">
          <q-item-section>
            <q-item-label>{{link.label}}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item-label header>
          Vielle Janlenoux
        </q-item-label>
        <q-item v-for="link in userLinks" clickable v-ripple :key="link.label" :to="link.to">
          <q-item-section>
            <q-item-label>{{link.label}}</q-item-label>
          </q-item-section>
        </q-item>
        <q-expansion-item dense label="Create content">
          <q-list class="bg-brown-2 layout__create-content-list" dense>
            <q-item v-for="link in createContentLinks" clickable v-ripple :key="link.label" :to="link.to">
              <q-item-section>
                <q-item-label>{{link.label}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
         <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Log out</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      side="right"
      :class="DRAWER_BG"
    >
      <q-list>
        <q-item-label header>
          Events
        </q-item-label>
        <q-item v-for="event in events" clickable v-ripple :key="event.title">
          <q-item-section>
            <q-item-label>{{event.title}}</q-item-label>
            <q-item-label caption>{{event.date}}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Event archive</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">

import { Vue, Options } from 'vue-class-component'

@Options({
  components: { }
})
export default class MainLayout extends Vue {
  readonly DRAWER_BG = 'bg-brown-1';

  readonly navbarLinks = [
    { label: 'About', to: '' },
    { label: 'Terms', to: '' },
    { label: 'FAQ', to: '' },
    { label: 'Contact', to: '' },
  ];

  readonly siteLinks = [
    { label: 'About', to: '' },
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
  ]

  leftDrawerOpen = false;
  rightDrawerOpen = false;  

  toggleLeftDrawer () {
    this.leftDrawerOpen = !this.leftDrawerOpen
  }

  toggleRightDrawer () {
    this.rightDrawerOpen = !this.rightDrawerOpen
  }
}
</script>

<style>
  .layout__filler {
    flex-basis: 0;
    flex-grow: 1;
  }

  .layout__char-name {
    padding-left: 6px;
    font-size: 1rem;
  }

  .layout__toolbar-title {
    flex-basis: inherit;
    flex-grow: 0;
  }

  .layout__create-content-list {
    padding-left: 12px;
  }
</style>
