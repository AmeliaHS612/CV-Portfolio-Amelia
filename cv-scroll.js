/* Experimental scroll-linked CV passage. No scroll handling is changed. */
(() => {
  const body = document.body;
  const hero = document.querySelector('.home-page');
  if (!body.classList.contains('cv-scroll-experiment') || !hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0;

  function update() {
    frame = 0;
    if (reducedMotion.matches) {
      body.style.setProperty('--cv-frost-alpha', '0');
      body.style.setProperty('--cv-frost-blur', '0px');
      body.style.setProperty('--cv-entry-shift', '0px');
      body.style.setProperty('--cv-entry-blur', '0px');
      body.style.setProperty('--cv-entry-opacity', '1');
      return;
    }

    const boundary = hero.offsetTop + hero.offsetHeight;
    const position = window.scrollY;
    const progress = clamp(position / boundary);
    const frost = Math.sin(Math.PI * progress);
    const arrival = clamp((progress - .38) / .62);

    body.style.setProperty('--cv-frost-alpha', (frost * .075).toFixed(3));
    body.style.setProperty('--cv-frost-blur', `${(frost * 7).toFixed(2)}px`);
    body.style.setProperty('--cv-entry-shift', `${((1 - arrival) * 24).toFixed(2)}px`);
    body.style.setProperty('--cv-entry-blur', `${((1 - arrival) * 6).toFixed(2)}px`);
    body.style.setProperty('--cv-entry-opacity', (.74 + arrival * .26).toFixed(3));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', schedule);
  update();
})();
