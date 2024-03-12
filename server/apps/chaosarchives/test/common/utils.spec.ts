import utils from './utils';

describe('utils', () => {
	describe('htmlToText', () => {
		it('should strip image tags', () => {
			const html = "Front text <img src='https://example.com/image.png' /> Back text";

			expect(utils.htmlToText(html)).toEqual('Front text Back text');
		})
	});
});
