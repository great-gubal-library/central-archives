<template>
  <header class="rss-page-header">
    <div class="layout__filler"></div>
    <h2>{{ title }}</h2>
    <div class="layout__filler rss-page-header__feed-container">
      <q-btn
        flat
        dense
        color="primary"
        title="Subscribe to RSS feed"
        icon="rss_feed"
        :href="feedLink"
        @click="copyLink"
      />
    </div>
  </header>
</template>

<script lang="ts">
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  title = prop<string>({
    required: true,
  });

  feedLink = prop<string>({
    required: true,
  });
}

@Options({
  name: 'RssPageHeader',
})
export default class RssPageHeader extends Vue.with(Props) {
  async copyLink(event: Event) {
		event.preventDefault();

    try {
      await copyToClipboard(this.feedLink);
      notifySuccess('RSS feed link copied to clipboard. You can now paste it into a feed reader, such as Feedly.');
    } catch (e) {
      notifyError('Error copying page link to clipboard.');
    }
  }
}
</script>

<style lang="scss">
.rss-page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.rss-page-header h2 {
  margin: 0;
  line-height: auto;
}

.rss-page-header__feed-container {
  display: flex;
  justify-content: end;
}
</style>
