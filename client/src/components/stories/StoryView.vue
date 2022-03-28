<template>
  <div class="story-view">
    <p v-if="!preview && story.mine">
      <router-link :to="`/edit-story/${story.id}`">Edit story</router-link>
    </p>
    <h2 class="story-view__title regular-header-font">{{ story.title }}</h2>
    <section class="text-caption story-view__subtitle row">
      <div class="story-view__posted-by">
      Posted by <router-link :to="authorLink">{{ story.author }}</router-link> on {{ date }}
      <template v-if="story.tags.length > 0">
        in
        <template v-for="(tag, index) in story.tags" :key="tag.name">
          <template v-if="index > 0">, </template>
          <router-link :to="{ path: '/stories', query: { tag } }">{{ tag }}</router-link>
        </template>
      </template>
      </div>
      <div class="story-view__type">
        <router-link :to="{ path: '/stories', query: { type: story.type } }">{{ $display.storyTypes[story.type] }}</router-link>
      </div>
    </section>
    <hr />
    <html-viewer
      class="story-view__content"
      :content="story.content"
    />
  </div>
</template>

<script lang="ts">
import { StoryDto } from '@app/shared/dto/stories/story.dto';
import { Options, prop, Vue } from 'vue-class-component';
import HtmlViewer from '../common/HtmlViewer.vue';

class Props {
  story = prop<StoryDto>({
    required: true,
  });

  preview = prop<boolean>({
    default: false,
  });
}

@Options({
  name: 'StoryView',
  components: {
    HtmlViewer,
  }
})
export default class StoryView extends Vue.with(Props) {
  get date(): string {
    return this.$display.formatDate(this.story.createdAt);
  }

  get authorLink(): string {
    const server = this.story.authorServer;
    const character = this.story.author.replace(/ /g, '_');
    return `/${server}/${character}`;
  }
}
</script>

<style lang="scss">
@import url($extraGoogleFonts);

.story-view__subtitle {
  color: $grey-8;
}

.story-view__posted-by {
  flex-grow: 1;
  padding-right: 16px;
}

.story-view__type {
  flex-grow: 0;
  white-space: nowrap;
}
</style>
