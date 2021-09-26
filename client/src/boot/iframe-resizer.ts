import iFrameResize from 'iframe-resizer';
import { boot } from 'quasar/wrappers';

interface IFrameObject extends iFrameResize.IFrameObject {
	removeListeners(): void;
}

interface IFrameElement extends HTMLIFrameElement {
	iFrameResizer: IFrameObject;
}

export default boot(({ app }) => {
  app.directive('iframe-resize', {
		mounted(el: IFrameElement) {
			el.addEventListener('load', () => iFrameResize.iframeResizer({}, el));
		},

		unmounted(el: IFrameElement) {
			el.iFrameResizer.removeListeners();
		}
	})
});
