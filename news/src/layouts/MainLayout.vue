<template>
  <section class="layout">
		<section class="layout__page-container">
			<router-view />
		</section>
  </section>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';

@Options({
  components: {
    
  },
})
export default class MainLayout extends Vue {
  
}
</script>

<style lang="scss">
.layout {
	margin: auto;
	max-width: 1280px;
}
</style>
