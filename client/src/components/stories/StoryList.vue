<template>
  <div class="story-list">
    <q-list v-if="stories.length" bordered>
      <q-item
        v-for="story in stories"
        :key="`${story.id}`"
        clickable
        v-ripple
        :to="getLink(story)"
      >
        <q-item-section>
            <q-item-label>{{story.title}}</q-item-label>
            <q-item-label caption>{{story.author}}</q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-item-label>{{$display.relativeTime(story.createdAt)}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <p v-else>
      There are no stories on Chaos Archives. Yet!
    </p>
  </div>
</template>

<script lang="ts" setup>
import { StorySummaryDto } from '@app/shared/dto/stories/story-summary.dto';

defineProps({
  stories: {
    type: Object as () => StorySummaryDto[],
    required: true,
  },
})

function getLink(story: StorySummaryDto) {
  return `/story/${story.id}`
}
</script>

<style lang="scss">
.story-list .q-item {
  background: $blue-1;
}

.story-list .q-item:nth-child(even) {
  background: rgba($blue-2, 0.4);
}
</style>
