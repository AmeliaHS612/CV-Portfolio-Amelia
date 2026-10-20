/* Experimental Home ↔ CV soft snap. Remove this file and its HTML script tag to revert. */
(() => {
  const body = document.body;
  const hero = document.querySelector('.home-page');
  const cv = document.getElementById('cv');
  const cvLink = document.querySelector('a[href="#cv"]');
  if (!hero || !cv) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cvTop = () => Math.round(cv.offsetTop);
  let zone = location.hash === '#cv' || window.scrollY >= cvTop() * .9 ? 'cv' : 'home';
  let lastY = window.scrollY;
  let settling = false;
  let animationFrame = 0;
  let lastScrollAt = performance.now();
  let scrollVelocity = 0;
  let oppositeWheel = 0;
  let lastOppositeAt = 0;
  let idleTimer = 0;
  let touching = false;

  function snapAfterScroll() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (settling || touching || body.classList.contains('portfolio-active')) return;
      const y = window.scrollY;
      const boundary = cvTop();
      // Keep the CV itself freely scrollable, but never rest in the passage.
      if (y > 0 && y < boundary) settle(y < boundary * .5 ? 'home' : 'cv');
    }, 180);
  }

  function finish(target) {
    animationFrame = 0;
    settling = false;
    zone = target;
    lastY = window.scrollY;
  }

  function settle(target, updateAddress = true) {
    clearTimeout(idleTimer);
    const destination = target === 'cv' ? cvTop() : 0;
    const origin = window.scrollY;
    const distance = destination - origin;
    zone = target;
    settling = true;
    oppositeWheel = 0;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (updateAddress) {
      const address = location.pathname + location.search + (target === 'cv' ? '#cv' : '');
      history.replaceState(null, '', address);
    }
    if (reducedMotion.matches || Math.abs(destination - origin) < 2) {
      window.scrollTo(0, destination);
      finish(target);
      return;
    }

    // Match the incoming scroll velocity, then decelerate gently to the section.
    const duration = Math.max(650, Math.min(900, 650 + Math.abs(distance) * .32));
    const initialVelocity = Math.max(0, scrollVelocity * Math.sign(distance));
    const tangent = Math.max(.7, Math.min(2.4, initialVelocity * duration / Math.abs(distance)));
    const start = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = (-2 * progress ** 3 + 3 * progress ** 2)
        + tangent * (progress ** 3 - 2 * progress ** 2 + progress);
      window.scrollTo(0, origin + distance * eased);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, destination);
        finish(target);
      }
    }
    animationFrame = requestAnimationFrame(step);
  }

  function onScroll() {
    const y = window.scrollY;
    const direction = y - lastY;
    const now = performance.now();
    const elapsed = now - lastScrollAt;
    if (!settling && elapsed > 0 && elapsed < 150 && direction) {
      const measured = direction / elapsed;
      scrollVelocity = scrollVelocity * .45 + measured * .55;
    }
    lastScrollAt = now;
    lastY = y;
    if (settling || body.classList.contains('portfolio-active')) return;
    snapAfterScroll();
    if (touching) return;

    const boundary = cvTop();
    if (zone === 'home' && direction > 0 && y >= boundary * .35 && y < boundary) {
      settle('cv');
    } else if (zone === 'cv' && direction < 0 && y <= boundary * .65 && y > 0) {
      settle('home');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
  function endTouch(event) {
    touching = event.touches.length > 0;
    snapAfterScroll();
  }
  window.addEventListener('touchend', endTouch, { passive: true });
  window.addEventListener('touchcancel', endTouch, { passive: true });
  window.addEventListener('resize', snapAfterScroll, { passive: true });
  window.addEventListener('pageshow', snapAfterScroll);
  window.addEventListener('wheel', event => {
    if (!settling || body.classList.contains('portfolio-active')) return;
    const direction = zone === 'cv' ? 1 : -1;
    if (event.deltaY * direction >= 0) {
      event.preventDefault(); // Trackpad momentum must not compete with the active animation.
      oppositeWheel = 0;
      return;
    }
    const now = performance.now();
    oppositeWheel = now - lastOppositeAt < 220 ? oppositeWheel + Math.abs(event.deltaY) : Math.abs(event.deltaY);
    lastOppositeAt = now;
    if (oppositeWheel < 85) {
      event.preventDefault(); // Ignore a small trackpad recoil, but honor a deliberate reversal.
      return;
    }
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    settling = false;
    zone = window.scrollY >= cvTop() * .5 ? 'cv' : 'home';
    scrollVelocity = 0;
    oppositeWheel = 0;
    snapAfterScroll();
  }, { passive: false });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && settling) {
      cancelAnimationFrame(animationFrame);
      window.scrollTo(0, zone === 'cv' ? cvTop() : 0);
      finish(zone);
    }
  });
  cvLink?.addEventListener('click', event => {
    event.preventDefault();
    history.pushState(null, '', location.pathname + location.search + '#cv');
    settle('cv', false);
  });

  // Shared #cv links land on the sharp, aligned section even with its entrance offset.
  if (location.hash === '#cv') {
    requestAnimationFrame(() => {
      window.scrollTo(0, cvTop());
      zone = 'cv';
      lastY = window.scrollY;
    });
  }
})();
