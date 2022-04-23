<template>
  <div class="character-detail" v-show="value">
    <div class="character-detail__label" :class="{ 'character-detail__label-narrow': label && label.length > 12 } ">{{label}}</div>
    <div class="character-detail__value">
      <template v-if="link"><a :href="link">{{value}}</a></template>
      <template v-else-if="routerLink"><router-link :to="routerLink">{{value}}</router-link></template>
      <template v-else><link-field :content="value"></link-field></template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import LinkField from '../common/LinkField.vue';

class Props {
  label = prop<string>({
    required: true,
  });

  value = prop<string>({
    required: true,
  });

  link = prop<string>({
    required: false,
    default: ''
  });

  routerLink = prop<string>({
    required: false,
    default: ''
  });
}

@Options({
  name: 'CharacterDetail',
  components: {
    LinkField,
  },
})
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
  margin-bottom: -1px; /* So that odd last child doesn't have uneven borders */
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
  min-width: 110px;
  font-weight: bold;
}

.character-detail__label-narrow {
  letter-spacing: -0.3px;
}

.character-detail__value {
  flex-basis: 0;
  flex-grow: 3;
}
</style>
