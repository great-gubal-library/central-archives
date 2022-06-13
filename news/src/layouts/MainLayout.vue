<template>
  <section class="layout">
		<user-navigation />
		<issue-navigation />
		<site-header />
		<section class="layout__page-container">
			<router-view />
		</section>
		<site-footer />
  </section>
</template>

<script lang="ts">
import SiteFooter from 'src/components/footer/SiteFooter.vue';
import SiteHeader from 'src/components/header/SiteHeader.vue';
import IssueNavigation from 'src/components/sidebars/IssueNavigation.vue';
import UserNavigation from 'src/components/sidebars/UserNavigation.vue';
import { Vue, Options } from 'vue-class-component';

@Options({
  components: {
		UserNavigation,
		IssueNavigation,
    SiteHeader,
		SiteFooter,
  },
})
export default class MainLayout extends Vue {
  
}
</script>

<style lang="scss">
.layout {
	margin: 5rem auto;
	max-width: 1280px;
	font-size: 18px;
}
</style>
