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
				'table': [ 'border', 'cellpadding', 'cellspacing' ],
				'img': [ 'src', 'alt', 'title', 'width', 'height' ],
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
