<template>
  <div class="page-error404 fullscreen text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Huch... wo sind die ganzen Blumen hin?
      </div>

      <q-btn
        class="q-mt-xl"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Zurückkehren"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'

export default class Error404 extends Vue {}
</script>

<style lang="scss">
.page-error404 {
  background: #10579e;
}
</style>
