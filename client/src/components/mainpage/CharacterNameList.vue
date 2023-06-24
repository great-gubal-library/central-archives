<template>
  <q-list class="character-name-list striped-list" bordered>
    <q-item
      v-for="profile in profiles"
      :key="`${profile.name}_${profile.server}`"
      :class="{ 'character-name-list__item_active' : profile.name === activeName && profile.server === activeServer }"
      clickable
      v-ripple
      :to="links ? getLink(profile) : null"
      @click="select(profile)"
    >
      <q-item-section side>
        <q-avatar round>
          <img :src="profile.avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
          <q-item-label>{{profile.name}}</q-item-label>
          <q-item-label caption>{{$display.races[profile.race]}}<template v-if="profile.occupation"> — {{ profile.occupation }}</template></q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  profiles = prop<CharacterSummaryDto[]>({
    required: true,
  });

  links = prop<boolean>({
    default: true,
  })

  activeName = prop<string>({
    required: false,
  })

  activeServer = prop<string>({
    required: false,
  })
}

@Options({
  emits: [ 'select' ]
})
export default class CharacterNameList extends Vue.with(Props) {
  getLink(profile: CharacterSummaryDto) {
    return `/${profile.server}/${profile.name.replace(/ /g, '_')}`
  }

  select(profile: CharacterSummaryDto) {
    this.$emit('select', profile);
  }
}
</script>

<style lang="scss">
</style>
