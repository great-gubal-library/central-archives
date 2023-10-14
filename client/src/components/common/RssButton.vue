<template>
	<q-btn
    flat
    dense
    color="primary"
    title="Subscribe to RSS feed"
    icon="rss_feed"
    :href="feedLink"
    @click="copyLink"
  />
</template>

<script lang="ts">
import { copyToClipboard } from 'quasar';
import { notifyError, notifySuccess } from 'src/common/notify';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
  feedLink = prop<string>({
    required: true,
  });
}

@Options({
  name: 'RssButton',
})
export default class RssButton extends Vue.with(Props) {
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

</style>
