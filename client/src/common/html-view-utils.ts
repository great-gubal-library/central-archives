import { useRouter } from 'src/router';

const $router = useRouter();

export interface HtmlViewClickCaptureOptions {
  links: boolean;
}

export function onHtmlViewClickCapture(event: Event, options: HtmlViewClickCaptureOptions) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }
  
  if (target.tagName.toLowerCase() === 'a') {
    if (options.links) {
      // Follow internal links without reloading the page
      const link = target as HTMLAnchorElement;

      if (link.host === window.location.host && link.pathname && !link.getAttribute('href')?.startsWith('#')) {
        event.preventDefault();
        event.stopPropagation();

        // link.pathname is guaranteed to start with /, so it's okay to pass to the router
        void $router.push(link.pathname);
      }
    }
  } else if (target.classList.contains('hide-details__title')) {
    const detailsBox = target.parentElement;

    if (detailsBox && detailsBox.classList.contains('hide-details')) {
      const visibleClassName = 'hide-details_visible';

      if (detailsBox.classList.contains(visibleClassName)) {
        detailsBox.classList.remove(visibleClassName);
      } else {
        detailsBox.classList.add(visibleClassName);
      }
    }
  }
}
