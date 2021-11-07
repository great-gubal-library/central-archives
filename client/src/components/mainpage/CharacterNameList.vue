<template>
  <q-list class="character-name-list" bordered>
    <q-item
      v-for="profile in profiles"
      :key="`${profile.name}_${profile.server}`"
      clickable
      v-ripple
      :to="getLink(profile)"
    >
      <q-item-section side>
        <q-avatar round>
          <img :src="profile.avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
          <q-item-label>{{profile.name}}</q-item-label>
          <q-item-label caption>{{$display.races[profile.race]}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { prop, Vue } from 'vue-class-component';

class Props {
  profiles = prop<CharacterSummaryDto[]>({
    required: true,
  });

  links = prop<boolean>({
    default: true,
  })
}

export default class CharacterNameList extends Vue.with(Props) {
  getLink(profile: CharacterSummaryDto) {
    return `/${profile.server}/${profile.name.replace(' ', '_')}`
  }
}
</script>

<style lang="scss">
.character-name-list .q-item {
  background: $blue-1;
}

.character-name-list .q-item:nth-child(even) {
  background: rgba($blue-2, 0.4);
}
</style>
