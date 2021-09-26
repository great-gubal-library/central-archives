<template>
  <div class="character-detail" v-show="value">
    <div class="character-detail__label">{{label}}</div>
    <div class="character-detail__value">{{value}}</div>
  </div>
</template>

<script lang="ts">
import { prop, Vue } from 'vue-class-component';

class Props {
  label = prop<string>({
    required: true,
  });

  value = prop<string>({
    required: true,
  });
}

export default class CharacterDetail extends Vue.with(Props) {
  
}
</script>

<style lang="scss">
.character-detail {
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
  width: 50%;
  min-width: 320px;
}

.character-detail > div {
  padding: 4px 8px;
}

.character-detail__label {
  flex-basis: 0;
  flex-grow: 1;
  min-width: 90px;
  font-weight: bold;
}

.character-detail__value {
  flex-basis: 0;
  flex-grow: 3;
}
</style>
