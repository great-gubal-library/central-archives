import iFrameResize from 'iframe-resizer';
import { boot } from 'quasar/wrappers';

// This boot file binds the iframe-resizer library to a custom Vue directive called "v-iframe-resize".
// It is used on character profiles to automatically resize the Carrd profile iframe.

interface IFrameObject extends iFrameResize.IFrameObject {
	removeListeners(): void;
}

interface IFrameElement extends HTMLIFrameElement {
	iFrameResizer?: IFrameObject;
}

export default boot(({ app }) => {
  app.directive('iframe-resize', {
		mounted(el: IFrameElement) {
			el.addEventListener('load', () => iFrameResize.iframeResizer({}, el));
		},

		unmounted(el: IFrameElement) {
			if (el.iFrameResizer) {
				el.iFrameResizer.removeListeners();
			}
		}
	})
});
