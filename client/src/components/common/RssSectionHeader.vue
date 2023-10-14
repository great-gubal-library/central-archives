<template>
  <header class="rss-section-header">
    <h5><slot /></h5>
    <div class="rss-section-header__feed-container">
      <rss-button :feed-link="feedLink" />
    </div>
  </header>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component';
import RssButton from './RssButton.vue';

class Props {
  feedLink = prop<string>({
    required: true,
  });
}

@Options({
  name: 'RssSectionHeader',
  components: {
    RssButton,
  },
})
export default class RssSectionHeader extends Vue.with(Props) {
}
</script>

<style lang="scss">
.rss-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14.4px;
  margin-bottom: 9.6px;
}

.rss-section-header h5 {
  margin: 0;
  line-height: auto;
}

.rss-section-header__feed-container {
  display: flex;
  justify-content: end;
}
</style>
