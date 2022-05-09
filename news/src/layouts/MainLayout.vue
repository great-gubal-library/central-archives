<template>
  <section>
		<div class="layout__page-container">
			<router-view />
		</div>
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
</style>
