<template>
  <section>
    Hello World!
  </section>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  name: 'PageIndex',
  components: {
  },
  async beforeRouteEnter(_, __, next) {
    next(vm => {});
  }
})
export default class PageIndex extends Vue {
  
}
</script>

<style lang="scss">
</style>
