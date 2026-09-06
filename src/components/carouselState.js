export function getCarouselState(scrollWidth, clientWidth, scrollLeft = 0) {
  const maxScroll = Math.max(0, Number(scrollWidth) - Number(clientWidth));
  return {
    hasOverflow: maxScroll > 2,
    atStart: Number(scrollLeft) <= 2,
    atEnd: Number(scrollLeft) >= maxScroll - 2,
    maxScroll,
  };
}
