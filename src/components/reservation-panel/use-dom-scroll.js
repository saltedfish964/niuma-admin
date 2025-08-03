export function useDomScroll(
  containerRef,
  scrollXBarRef,
  scrollYBarRef,
  totalHeight,
  totalWidth,
  gridContainerHeight,
  gridContainerWidth,
  autoScrollIntervalId,
  lockScroll,
) {
  function handleContainerWheel(event) {
    if (!containerRef.value || !scrollYBarRef.value || !scrollXBarRef.value || lockScroll.value)
      return;
    event.preventDefault();

    // 垂直滚动
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      containerRef.value.scrollTop += event.deltaY;

      const maxContainerScroll = totalHeight.value - gridContainerHeight.value;
      const maxBarScroll = scrollYBarRef.value.scrollHeight - scrollYBarRef.value.clientHeight;
      if (maxContainerScroll <= 0) return;
      const scrollRatio = Math.min(
        1,
        Math.max(0, containerRef.value.scrollTop / maxContainerScroll),
      );
      scrollYBarRef.value.scrollTop = scrollRatio * maxBarScroll;
    } else {
      containerRef.value.scrollLeft += event.deltaX;

      const maxContainerScroll = totalWidth.value - gridContainerWidth.value;
      const maxBarScroll = scrollXBarRef.value.scrollWidth - scrollXBarRef.value.clientWidth;
      if (maxContainerScroll <= 0) return;
      const scrollRatio = Math.min(
        1,
        Math.max(0, containerRef.value.scrollLeft / maxContainerScroll),
      );
      scrollXBarRef.value.scrollLeft = scrollRatio * maxBarScroll;
    }
  }

  function handleYScroll(event) {
    if (
      !containerRef.value ||
      !scrollYBarRef.value ||
      autoScrollIntervalId.value ||
      lockScroll.value
    )
      return;
    event.preventDefault();
    const scrollPos = scrollYBarRef.value.scrollTop;
    const totalScroll = scrollYBarRef.value.scrollHeight;
    const visibleSize = scrollYBarRef.value.clientHeight;
    const maxScroll = Math.max(0, totalScroll - visibleSize);
    if (maxScroll <= 0) return 0;
    const percentage = Math.min(1, Math.max(0, scrollPos / maxScroll));
    containerRef.value.scrollTop = percentage * (totalHeight.value - gridContainerHeight.value);
  }

  function handleXScroll(event) {
    if (!containerRef.value || autoScrollIntervalId.value || lockScroll.value) return;
    event.preventDefault();
    containerRef.value.scrollLeft = event.target.scrollLeft;
  }

  return {
    handleContainerWheel,
    handleYScroll,
    handleXScroll,
  };
}
