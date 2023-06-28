import sanitizeHtml from 'sanitize-html';

const html = {
	sanitize(input: string): string {
		return sanitizeHtml(input, {
			allowedTags: [ ...sanitizeHtml.defaults.allowedTags, 'img' ],
			allowedClasses: {
				'section': [ 'hide-details' ],
				'div': [ 'hide-details__title', 'hide-details__content' ],
			},
			allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes,
				'*': [ 'style' ],
				a: [ 'href', 'id', 'name', 'target' ],
				table: [ 'border', 'cellpadding', 'cellspacing' ],
				img: [ 'src', 'alt', 'title', 'width', 'height' ],
				h1: [ 'id' ],
				h2: [ 'id' ],
				h3: [ 'id' ],
				h4: [ 'id' ],
				h5: [ 'id' ],
				h6: [ 'id' ],
			},
		});
	},

	escape(input: string): string {
		return input.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;');
	}
};

export default html;
