(() => {
  const hero = document.querySelector('.home-page');
  const scene = document.querySelector('.architecture-scene');
  if (!hero || !scene) return;
  const levels = [...scene.querySelectorAll('.scene-floor, .scene-roof')];
  let area = null;
  let resetTimer = 0;
  let layoutFrame = 0;
  let inside = false;

  function followCursor(y) {
    const progress = Math.max(0, Math.min(1, (area.bottom - y) / (area.bottom - area.top)));
    levels.forEach((level, index) => {
      const amount = Math.max(0, Math.min(1, progress * levels.length - index));
      level.style.setProperty('--level-progress', amount.toFixed(3));
    });
  }

  function hide() {
    inside = false;
    scene.classList.remove('is-visible');
    clearTimeout(resetTimer);
    // Retain the construction pose until the exit fade has finished.
    resetTimer = setTimeout(() => scene.classList.remove('is-building'), 300);
  }

  function layout() {
    layoutFrame = 0;
    hide();
    const bounds = hero.getBoundingClientRect();
    const text = [...hero.querySelectorAll('.home-copy h1, .home-intro, .home-role')]
      .filter(node => node.getClientRects().length)
      .map(node => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect();
      });
    const textRight = Math.max(bounds.left, ...text.map(rect => rect.right));
    const header = hero.querySelector('.home-top').getBoundingClientRect();
    const footer = hero.querySelector('.home-bottom').getBoundingClientRect();
    const lamp = document.querySelector('.theme-lamp').getBoundingClientRect();
    const button = hero.querySelector('.portfolio-button').getBoundingClientRect();
    const previousLeft = Math.max(bounds.left + bounds.width * .52, textRight + 28);
    const previousRight = bounds.right - Math.max(64, bounds.width * .1);
    const previousTop = Math.max(header.bottom + 32, lamp.bottom + 20);
    const previousBottom = Math.min(footer.top - 28, button.top - 24);
    const desiredScale = Math.min((previousRight - previousLeft) / 600,
      (previousBottom - previousTop) / 500, .9) * 1.3 * 1.1;
    // Use more of the empty hero area, while staying clear of text and controls.
    const left = Math.max(bounds.left + bounds.width * .46, textRight + 28);
    const right = Math.min(bounds.right - 40, button.left - 24, lamp.left - 20);
    const top = header.bottom + 32;
    const bottom = footer.top - 28;
    const scale = Math.min(desiredScale, (right - left) / 600, (bottom - top) / 500);
    // Do not force artwork into a viewport without an unoccupied right side.
    area = scale >= .25 ? { left, right, top, bottom } : null;
    if (!area) return;
    const width = 600 * scale;
    const height = 500 * scale;
    Object.assign(scene.style, {
      left: `${left - bounds.left + (right - left - width) / 2}px`,
      top: `${Math.max(top, bottom - height - Math.min(64, bounds.height * .08)) - bounds.top}px`,
      width: `${width}px`, height: `${height}px`,
    });
  }
  function scheduleLayout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const active = area && !document.body.classList.contains('portfolio-active')
      && !event.target.closest('button, a, dialog')
      && event.clientX >= area.left && event.clientX <= area.right
      && event.clientY >= area.top && event.clientY <= area.bottom;
    if (active) followCursor(event.clientY);
    if (Boolean(active) === inside) return;
    if (!active) { hide(); return; }
    inside = true;
    clearTimeout(resetTimer);
    if (!scene.classList.contains('is-building')) {
      scene.classList.add('is-building');
    }
    scene.classList.add('is-visible');
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('resize', scheduleLayout, { passive: true });
  window.addEventListener('scroll', scheduleLayout, { passive: true });
  const changes = new MutationObserver(scheduleLayout);
  changes.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  changes.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.fonts?.ready.then(scheduleLayout);
  scheduleLayout();
})();
