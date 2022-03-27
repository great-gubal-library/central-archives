export function onHtmlViewClickCapture(event: Event) {
  if (event.target instanceof HTMLElement && event.target.classList.contains('hide-details__title')) {
    const detailsBox = event.target.parentElement;
		console.log('detailsBox', detailsBox);

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
