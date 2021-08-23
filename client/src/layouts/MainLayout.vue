<template>
  <q-layout view="hHh lpR fff">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <div class="layout__filler"></div>

        <q-toolbar-title class="layout__toolbar-title text-center">
          Chaos Archives
        </q-toolbar-title>

        <div class="layout__filler text-right">
          <q-btn-group flat class="gt-sm">
            <q-btn v-for="link in navbarLinks" stretch flat :key="link.label" :label="link.label" :to="link.to" />
          </q-btn-group>
          <q-btn-dropdown flat class="lt-md" icon="more_horiz">
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
        </div>
        <q-btn dense flat round icon="event" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      side="left"
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      show-if-above
      bordered
      side="right"
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
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
  leftDrawerOpen = false;
  rightDrawerOpen = false;
  navbarLinks = [
    { label: 'About', to: '' },
    { label: 'Terms', to: '' },
    { label: 'FAQ', to: '' },
    { label: 'Contact', to: '' },
  ];

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

  .layout__toolbar-title {
    flex-basis: inherit;
    flex-grow: 0;
  }
</style>
