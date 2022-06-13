
export function wikify(name: string): string {
	return name.replace(/ /g, '_');
}

export function unwikify(name: string): string {
	return name.replace(/_/g, ' ');
}

export function parseWikilinksInHtml(html: string): string {
	return html.replace(/\[\[(.+?)\]\]/g, (_, link) => wikilinkToHtml(link));
}

function wikilinkToHtml(linkContent: string): string {
	if (linkContent.indexOf('<') !== -1 || linkContent.indexOf('>') !== -1) {
		// HTML tags in link content - this means malformed HTML editor content, so just return as is
		return linkContent;
	}

	let target: string;
	let text: string;

	const indexOfVbar = linkContent.indexOf('|');

	if (indexOfVbar === -1) {
		target = wikify(linkContent);
		text = linkContent;
	} else {
		target = wikify(linkContent.substring(0, indexOfVbar));
		text = linkContent.substring(indexOfVbar + 1);
	}

	return `<a href="/link/${target}">${text}</a>`;
}
