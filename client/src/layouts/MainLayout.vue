<template>
  <q-layout view="hHh Lpr fff">
    <q-header elevated>
      <q-toolbar>
        <div class="layout__filler">
          <q-btn
            class="lt-md"
            flat
            dense
            no-caps
            icon="menu"
            tooltip="Menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          >
            <q-tooltip>Menu</q-tooltip>
          </q-btn>
          <div v-if="$store.state.user" class="gt-sm layout__char-name">
            <q-avatar round>
              <img :src="$store.state.user.character.avatar" />
            </q-avatar>
            <span>{{ $store.getters.characterShortName }}</span>
          </div>
        </div>

        <q-toolbar-title class="layout__toolbar-title text-center">
          <router-link to="/">
            <picture>
              <source srcset="~/assets/logo_1x.webp, ~/assets/logo_2x.webp 2x, ~/assets/logo_3x.webp 3x, ~/assets/logo_4x.webp 4x" type="image/webp" />
              <source srcset="~/assets/logo_2x.png 2x, ~/assets/logo_3x.png 3x, ~/assets/logo_4x.png 4x" />
              <img class="layout__logo" src="~/assets/logo_1x.png" />
            </picture>
          </router-link>
        </q-toolbar-title>

        <div class="layout__filler justify-end">
          <q-btn-group flat class="gt-sm">
            <q-btn v-for="link in navbarLinks" stretch flat :key="link.label" :label="link.label" :to="link.to" />
          </q-btn-group>
          <q-btn-dropdown flat class="layout__toolbar-buton-more lt-md" dropdown-icon="more_horiz">
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
          <q-btn class="lt-md" dense flat round icon="event" @click="toggleRightDrawer">
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
        <!--
        <q-item>
          <q-item-section>
            <q-input dark color="white" label="Search" />
          </q-item-section>
        </q-item>
        -->
        <q-item-label header>
          Chaos Archives
        </q-item-label>
        <q-item v-for="link in siteLinks" clickable v-ripple :key="link.label" :to="link.to">
          <q-item-section>
            <q-item-label>{{link.label}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <user-menu />
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
        <q-item clickable v-ripple tag="a" target="_blank" href="https://crescentmoonpublishing.com/events/">
          <q-item-section>
            <q-item-label>Event archive</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <!--
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
      -->
    </q-drawer>

    <q-page-container>
      <div class="layout__page-container">
        <router-view />
        </div>
    </q-page-container>

    <q-footer elevated>
      <q-toolbar>
        <div class="layout__filler text-body justify-center text-center">
          Final Fantasy XIV is © 2010&ndash;2021 Square Enix Co., Ltd. All rights reserved.<br />
          All text and images on this site are © 2021 by their respective owners.
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">

import { Vue, Options } from 'vue-class-component'
import EventList from '../components/eventbar/EventList.vue'
import UserMenu from '../components/sidebar/UserMenu.vue'
import InlineSvg from 'vue-inline-svg';

@Options({
  components: {
    EventList,
    UserMenu,
    InlineSvg,
  }
})
export default class MainLayout extends Vue {
  readonly DRAWER_BG = 'layout__drawer';
  readonly DRAWER_WIDTH = 250;

  readonly navbarLinks = [
    { label: 'Rules', to: '/rules' },
    { label: 'Contact', to: '/contact' },
  ];

  readonly siteLinks = [
    { label: 'About', to: '/about' },
    { label: 'Profiles', to: '/profiles' },
    { label: 'Stories', to: '/stories' },
    // { label: 'Free Companies', to: '' },
    // { label: 'Venues', to: '' },
    // { label: 'Noticeboard', to: '' },
  ];

  readonly createContentLinks = [
    { label: 'Adventure', to: '' },
    { label: 'Advertisement', to: '' },
    { label: 'Event', to: '' },
    { label: 'Free Company', to: '' },
    { label: 'Noticeboard item', to: '' },
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
}
</script>

<style lang="scss">
  $max-layout-width: 1280px;

  .q-layout {
    /* box-shadow: rgba(black, 0.2) 8px 0px 4px, rgba(black, 0.2) -8px 0 4px; */
    outline: 1px solid #505050;
  }

  .layout__filler {
    flex-basis: 0;
    flex-grow: 1;
    display: flex;
    flex-wrap: nowrap;
  }

  .layout__char-name {
    font-size: 1rem;
    display: flex;
    align-items: center;
  }

  .layout__char-name span {
    padding-left: 6px;
    color: #eee;
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

  .q-toolbar__title {
    font-family: Michroma, sans-serif;
    font-weight: bold;
    padding-left: 8px;
    padding-right: 8px;
  }

  .layout__toolbar-title svg {
    width: 400px;
    max-width: 100%;
  }

  .layout__toolbar-title g {
    fill: #f8f8f8!important;
  }

  .layout__toolbar-title:hover g {
    fill: #e8e8e8!important;
  }

  .layout__logo {
    width: 540px;
    max-width: 100%;
  }

  .layout__logo:hover {
    filter: saturate(1.4);
  }

  .layout__toolbar-buton-more {
    padding-left: 4px;
    padding-right: 4px;
  }

  .q-header {
    background: #1e68b6;
  }

  .q-drawer {
    background: #08589766;
  }

  @media screen and (max-width: 1023px) {
   .q-drawer {
      background: #1162ad;
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

  .layout__create-content-list {
    padding-left: 12px;
    background: #016097;
  }

  .layout__page-container {
    max-width: 800px;
    margin: auto;
    background: #fdfdffee;
  }

  .q-page {
    padding: 24px 24px 48px 24px;
  }

  @media screen and (max-width: $breakpoint-sm) {
    .q-page {
      padding: 18px 18px 36px 18px;
    }
  }

  @media screen and (max-width: $breakpoint-xs) {
    .q-page {
      padding: 12px 12px 24px 12px;
    }
  }
  
  .q-footer {
    background: #795548;
  }

  @media screen and (min-width: $max-layout-width) {
    .q-layout, .q-header {
      max-width: $max-layout-width;
      margin: auto;
    }

    .q-drawer--left {
      left: calc((100% - #{$max-layout-width}) / 2);
    }

    .q-drawer--right {
      right: calc((100% - #{$max-layout-width}) / 2);
    }
  }
</style>
