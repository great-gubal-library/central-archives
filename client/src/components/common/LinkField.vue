<template>
	<span v-html="html" @click.capture="onClickCapture" />
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
};

@Options({
	name: 'LinkField'
})
export default class LinkField extends Vue.with(Props) {
	get html() {
		return parseWikilinksInHtml(html.escape(this.content));
	}

	onClickCapture(event: Event) {
		onHtmlViewClickCapture(event);
	}
}
</script>

<style lang="scss">
</style>
