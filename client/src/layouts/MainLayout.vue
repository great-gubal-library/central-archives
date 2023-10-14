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
            tooltip="User"
            aria-label="User"
            @click="toggleLeftDrawer"
          >
            <q-avatar v-if="$store.getters.character" round size="28px">
              <img :src="$store.getters.character.avatar" />
            </q-avatar>
            <q-icon v-else name="person" />
          </q-btn>
          <q-btn-dropdown
            class="layout__toolbar-buton-more lt-md"
            flat
            dense
            no-caps
            dropdown-icon="menu"
            tooltip="Menu"
            aria-label="Menu"
          >
            <q-list>
              <q-item v-for="link in siteLinks" clickable v-close-popup :key="link.label" :to="link.to">
                <q-item-section>
                  <q-item-label>{{ link.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <template v-if="$store.getters.character">
            <q-btn class="gt-sm layout__char-name" flat dense title="Switch character" @click="switchCharacter">
              <q-avatar round>
                <img :src="$store.getters.character.avatar" />
              </q-avatar>
              <span>{{ $store.getters.characterShortName }}</span>
            </q-btn>
          </template>
          <div v-else class="gt-sm layout__char-name">
            <q-icon size="28px" name="account_circle" />
            <span>A Stranger</span>
          </div>
        </div>

        <q-toolbar-title class="layout__toolbar-title text-center">
          <router-link to="/" class="gt-xs">
            <picture>
              <source
                srcset="
                  ~/assets/logo_1x.webp,
                  ~/assets/logo_2x.webp 2x,
                  ~/assets/logo_3x.webp 3x,
                  ~/assets/logo_4x.webp 4x
                "
                type="image/webp"
              />
              <source srcset="~/assets/logo_2x.png 2x, ~/assets/logo_3x.png 3x, ~/assets/logo_4x.png 4x" />
              <img class="layout__logo" src="~/assets/logo_1x.png" />
            </picture>
          </router-link>
          <router-link to="/" class="lt-sm">
            <picture>
              <source
                srcset="
                  ~/assets/logo_text_1x.webp,
                  ~/assets/logo_text_2x.webp 2x,
                  ~/assets/logo_text_3x.webp 3x,
                  ~/assets/logo_text_4x.webp 4x
                "
                type="image/webp"
              />
              <source
                srcset="~/assets/logo_text_2x.png 2x, ~/assets/logo_text_3x.png 3x, ~/assets/logo_text_4x.png 4x"
              />
              <img class="layout__logo" src="~/assets/logo_text_1x.png" />
            </picture>
          </router-link>
        </q-toolbar-title>

        <div class="layout__filler justify-end">
          <q-btn-group flat class="gt-sm">
            <q-btn v-for="link in navbarLinks" stretch flat :key="link.label" :label="link.label" :to="link.to" />
          </q-btn-group>
          <q-btn-dropdown flat class="layout__toolbar-buton-more lt-md" dropdown-icon="more_horiz">
            <q-list>
              <q-item v-for="link in navbarLinks" clickable v-close-popup :key="link.label" :to="link.to">
                <q-item-section>
                  <q-item-label>{{ link.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn class="lt-md" dense flat round icon="event" @click="toggleRightDrawer">
            <q-tooltip>Events</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
      <nav class="layout__nav-links gt-sm">
        <router-link
          v-for="link in siteLinks"
          :key="link.label"
          :to="link.to"
        >{{link.label}}</router-link>
      </nav>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above dark side="left" :class="DRAWER_BG" :width="DRAWER_WIDTH">
      <q-list dense dark>
        <q-item>
          <q-item-section>
            <site-search-field />
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator dark />
      <user-menu />
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" show-if-above dark side="right" :class="DRAWER_BG" :width="DRAWER_WIDTH">
      <event-list />
    </q-drawer>

    <q-page-container>
      <div class="layout__page-container">
        <router-view />
      </div>
    </q-page-container>

    <q-footer elevated>
      <q-toolbar>
        <div class="layout__footer text-body justify-center text-center">
          Final Fantasy XIV is © 2010&ndash;2023 Square Enix Co., Ltd. All rights reserved. Chaos Archives is a fansite
          and is not affiliated with Square Enix.<br />
          All text and images on this site are © 2021–2023 by their respective owners.
          <router-link to="/privacy-statement">(Privacy statement)</router-link>
        </div>
      </q-toolbar>
    </q-footer>

    <div class="layout__bg-left"></div>
    <div class="layout__bg-right"></div>
  </q-layout>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import EventList from '../components/eventbar/EventList.vue';
import UserMenu from '../components/sidebar/UserMenu.vue';
import InlineSvg from 'vue-inline-svg';
import SiteSearchField from 'src/components/search/SiteSearchField.vue';
import { switchCharacter } from 'src/common/switch-character';

@Options({
  components: {
    EventList,
    UserMenu,
    InlineSvg,
    SiteSearchField,
  },
})
export default class MainLayout extends Vue {
  readonly DRAWER_BG = 'layout__drawer';
  readonly DRAWER_WIDTH = 250;

  readonly navbarLinks = [
    { label: 'About', to: '/about' },
    { label: 'Rules', to: '/rules' },
    { label: 'Wiki', to: '/wiki/Chaos_Archives_Wiki' },
    { label: 'Contact', to: '/contact' },
  ];

  readonly siteLinks = [
    { label: 'Profiles', to: '/profiles' },
    { label: 'Stories', to: '/stories' },
    { label: 'Artwork', to: '/gallery/artwork' },
    { label: 'Screenshots', to: '/gallery/screenshot' },
    { label: 'Noticeboard', to: '/noticeboard' },
    { label: 'Free Companies', to: '/free-companies' },
    { label: 'Communities', to: '/communities' },
    { label: 'Venues', to: '/venues' },
  ];

  leftDrawerOpen = false;
  rightDrawerOpen = false;

  toggleLeftDrawer() {
    this.leftDrawerOpen = !this.leftDrawerOpen;
  }

  toggleRightDrawer() {
    this.rightDrawerOpen = !this.rightDrawerOpen;
  }

  async switchCharacter() {
    await switchCharacter();
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
  padding-left: 0;
  text-transform: inherit;
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
  fill: #f8f8f8 !important;
}

.layout__toolbar-title:hover g {
  fill: #e8e8e8 !important;
}

.layout__logo {
  filter: brightness(1.05);
  width: 540px;
  max-width: 100%;
  transition: all 0.3s ease;
}

.layout__logo:hover {
  filter: brightness(1.125);
}

.layout__toolbar-buton-more {
  padding-left: 4px;
  padding-right: 4px;
}

.q-header .q-toolbar {
  background: #10579e;
}

.layout__nav-links {
  background: linear-gradient(to bottom, #10579e, #1f70c1);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
}

.layout__nav-links a {
  display: inline-block;
  padding: 2px 12px 4px 12px;
  color: white;
  transition: all 0.3s ease;
}

.layout__nav-links a:hover {
  background: rgba(255, 255, 255, 0.15);
}

.layout__nav-links .router-link-active {
  color: rgb(192, 192, 192);
}

.q-drawer {
  background: #08589766;
}

@media screen and (max-width: 1023px) {
  .q-drawer {
    background: #1162ad;
  }
}

@media screen and (min-width: 1024px) {
  body {
    overflow-y: scroll;
  }
}

.q-drawer .q-item__label--header {
  font-family: Michroma, sans-serif;
  font-weight: bold;
}

.q-drawer .q-item.q-router-link--active,
.q-drawer .q-item--active {
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
  background: rgb(31, 89, 147);
}

.layout__footer {
  flex-grow: 1;
}

.layout__footer a {
  color: #bbb;
}

.layout__footer a:hover {
  color: #ccc;
}

@media screen and (min-width: $max-layout-width) {
  .q-layout,
  .q-header {
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

.layout__bg-left,
.layout__bg-right {
  position: fixed;
  top: 0;
  width: calc((100% - 1284px) / 2);
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
}

.layout__bg-left {
  left: 0;
  background-image: url(assets/bg_left_1x.jpg);
  background-position: 100% 50%;
}

.layout__bg-right {
  right: 0;
  background-image: url(assets/bg_right_1x.jpg);
  background-position: 0% 50%;
}

html.webp .layout__bg-left {
  background-image: url(assets/bg_left_1x.webp);
}

html.webp .layout__bg-right {
  background-image: url(assets/bg_right_1x.webp);
}

@media screen and(-webkit-device-pixel-ratio: 2) {
  .layout__bg-left {
    background-image: url(assets/bg_left_2x.jpg);
  }

  .layout__bg-right {
    background-image: url(assets/bg_right_2x.jpg);
  }

  html.webp .layout__bg-left {
    background-image: url(assets/bg_left_2x.webp);
  }

  html.webp .layout__bg-right {
    background-image: url(assets/bg_right_2x.webp);
  }
}

@media screen and (max-width: $breakpoint-sm) {
  .layout__bg-left,
  .layout__bg-right {
    display: none;
  }
}
</style>
