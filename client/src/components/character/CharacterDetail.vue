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
  flex-grow: 0.5;
  min-width: 320px;
  border-bottom: 1px solid #ddd;
}

.character-detail:only-child {
  flex-grow: 1;
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
