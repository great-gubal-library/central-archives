<template>
  <q-list class="character-name-list striped-list" bordered>
    <q-item
      v-for="profile in profiles"
      :key="`${profile.name}_${profile.server}`"
      :class="{ 'character-name-list__item_active' : profile.name === activeName && profile.server === activeServer }"
      clickable
      v-ripple
      @click="select(profile)"
    >
      <q-item-section side>
        <q-avatar round>
          <img :src="profile.avatar" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
          <q-item-label>{{profile.name}}</q-item-label>
          <q-item-label caption>{{$display.newsRoles[profile.newsRole || NewsRole.NONE]}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { CharacterSummaryDto } from '@app/shared/dto/characters/character-summary.dto';
import { NewsRole } from '@app/shared/enums/news-role.enum';
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
  NewsRole = NewsRole;

  select(profile: CharacterSummaryDto) {
    this.$emit('select', profile);
  }
}
</script>

<style lang="scss">
</style>
