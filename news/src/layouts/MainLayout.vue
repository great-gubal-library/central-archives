<template>
  <section class="layout">
		<site-header />
		<section class="layout__page-container">
			<router-view />
		</section>
  </section>
</template>

<script lang="ts">
import SiteHeader from 'src/components/header/SiteHeader.vue';
import { Vue, Options } from 'vue-class-component';

@Options({
  components: {
    SiteHeader,
  },
})
export default class MainLayout extends Vue {
  
}
</script>

<style lang="scss">
.layout {
	margin: auto;
	max-width: 1280px;
	font-size: 18px;
}
</style>
