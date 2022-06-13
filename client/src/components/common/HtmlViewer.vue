<template>
	<section v-html="sanitizedContent" @click.capture="onClickCapture"></section>
</template>

<script lang="ts">
import html from '@app/shared/html';
import { onHtmlViewClickCapture } from 'src/common/html-view-utils';
import { parseWikilinksInHtml } from '@common/common/wikilinks';
import { Options, prop, Vue } from 'vue-class-component';

class Props {
	content = prop<string>({
		required: true
	});
}

@Options({
	name: 'HtmlViewer',
})
export default class HtmlViewer extends Vue.with(Props) {
	get sanitizedContent() {
		return parseWikilinksInHtml(html.sanitize(this.content));
	}

	onClickCapture(event: Event) {
    onHtmlViewClickCapture(event);
  }
}
</script>
