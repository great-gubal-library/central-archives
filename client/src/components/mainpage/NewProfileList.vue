<template>
  <q-list class="new-profile-list" bordered>
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

<script lang="ts" setup>
import { NewProfileDto } from '@app/shared/dto/main-page/new-profile.dto';

defineProps({
  profiles: {
    type: Object as () => NewProfileDto[],
    required: true,
  },
})

function getLink(profile: NewProfileDto) {
  return `/${profile.server}/${profile.name.replace(' ', '_')}`
}
</script>

<style lang="scss">
.new-profile-list .q-item {
  background: $blue-1;
}

.new-profile-list .q-item:nth-child(even) {
  background: rgba($blue-2, 0.4);
}
</style>
