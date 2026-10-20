(() => {
  const sheet = document.querySelector('#portfolioPanel');
  const gallery = document.querySelector('#projectGallery');
  const viewport = document.querySelector('#storyViewport');
  const track = document.querySelector('#storyTrack');
  const back = sheet.querySelector('.project-back');
  const footer = sheet.querySelector('.sheet-bottom');
  const nav = sheet.querySelector('.story-nav');
  const lightbox = document.querySelector('.image-lightbox');
  const mobile = () => matchMedia('(max-width: 700px)').matches;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const validImage = image => /^\/uploads\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(image.src);
  let lastCard;
  function fitPageText() {
    if (!viewport.clientHeight) return;
    for (const copy of track.querySelectorAll('.project-info, .story-copy')) {
      copy.style.setProperty('--copy-fit', '1');
      if (copy.scrollHeight <= copy.clientHeight + 1) continue;
      let low = .1;
      let high = 1;
      for (let i = 0; i < 10; i++) {
        const scale = (low + high) / 2;
        copy.style.setProperty('--copy-fit', String(scale));
        if (copy.scrollHeight <= copy.clientHeight + 1) low = scale;
        else high = scale;
      }
      copy.style.setProperty('--copy-fit', String(low));
    }
  }
  window.fitPortfolioText = fitPageText;
  new ResizeObserver(fitPageText).observe(viewport);
  function picture(image, fallback, zoom = false) {
    const img = el('img');
    img.src = new URL(image.src.replace(/^\//, ''), document.baseURI).href;
    img.alt = image.alt || fallback;
    img.loading = 'lazy';
    img.draggable = false;
    if (image.appearance) {
      const { zoom: scale = 100, x = 50, y = 50, fit } = image.appearance;
      if (fit) img.style.objectFit = fit;
      img.style.objectPosition = `${x}% ${y}%`;
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = `scale(${scale / 100})`;
    }
    if (!zoom) {
      const frame = el('span', 'portfolio-photo-frame');
      frame.append(img);
      return frame;
    }
    const button = el('button', 'story-image-button');
    button.type = 'button';
    button.setAttribute('aria-label', `Enlarge ${img.alt}`);
    button.append(img);
    button.addEventListener('click', () => {
      lightbox.querySelector('img').src = img.src;
      lightbox.querySelector('img').alt = img.alt;
      lightbox.querySelector('p').textContent = image.caption || img.alt;
      lightbox.showModal();
    });
    return button;
  }
  function showGallery() {
    gallery.hidden = false;
    viewport.hidden = back.hidden = footer.hidden = true;
  }
  function currentSection() {
    return Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth));
  }
  function updateSection() {
    const index = currentSection();
    sheet.querySelector('.section-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(track.children.length).padStart(2, '0')}`;
    [...nav.children].forEach((button, i) => {
      button.classList.toggle('is-current', i === index);
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    const activeStep = nav.children[index];
    if (activeStep) nav.scrollTo({ left: activeStep.offsetLeft - nav.offsetLeft - (nav.clientWidth - activeStep.offsetWidth) / 2, behavior: 'instant' });
    footer.querySelector('.story-arrows button:first-child').disabled = index === 0;
    footer.querySelector('.story-arrows button:last-child').disabled = index === track.children.length - 1;
  }
  function go(index) {
    index = Math.max(0, Math.min(track.children.length - 1, index));
    const behavior = reduced() ? 'instant' : 'smooth';
    viewport.scrollTo({ left: index * viewport.clientWidth, behavior });
  }
  function showProject(project, category, index, card) {
    lastCard = card;
    track.replaceChildren();
    nav.replaceChildren();
    gallery.hidden = true;
    viewport.hidden = back.hidden = footer.hidden = false;
    const images = project.images.filter(validImage);
    const overview = el('article', 'story-panel');
    const layout = el('div', 'intro-layout');
    const cover = el('div', 'cover-wrap');
    if (images[0]) cover.append(picture(images[0], project.title, true));
    else cover.append(el('span', 'cover-placeholder', 'Images to be added'));
    const info = el('div', 'project-info');
    info.append(el('span', 'project-index-large', String(index + 1).padStart(2, '0')), el('span', 'project-kicker', category.title), el('h3', '', project.title));
    const meta = el('div', 'meta-list');
    for (const [key, label] of [['year', 'YEAR'], ['location', 'LOCATION'], ['function', 'FUNCTION']]) {
      if (!project[key]) continue;
      const item = el('div', 'meta-item');
      item.append(el('span', 'meta-label', label), el('span', 'meta-value', project[key]));
      meta.append(item);
    }
    if (meta.children.length) info.append(meta);
    if (project.description) info.append(el('p', 'project-description', project.description));
    if (images.length > 1) {
      const explore = el('button', 'explore-project', 'EXPLORE PROJECT →');
      explore.type = 'button'; explore.addEventListener('click', () => go(1)); info.append(explore);
    }
    layout.append(cover, info); overview.append(layout); track.append(overview);
    images.slice(1).forEach((image, i) => {
      const panel = el('article', 'story-panel');
      const type = image.layout || 'standard';
      if (['image', 'drawing'].includes(type) || (!image.heading && !image.body)) {
        const wrap = el('figure', `content-image image-${type}`);
        wrap.append(picture(image, project.title, true));
        if (image.caption) wrap.append(el('figcaption', 'panel-caption', image.caption));
        panel.append(wrap);
      } else {
        const wrap = el('div', `story-composition story-${type}`);
        const media = el('figure', 'story-media');
        media.append(picture(image, project.title, true));
        if (image.caption) media.append(el('figcaption', 'panel-caption', image.caption));
        const copy = el('div', 'story-copy');
        copy.append(el('span', 'story-number', String(i + 1).padStart(2, '0')));
        if (image.heading) copy.append(el('h3', '', image.heading));
        if (image.body) copy.append(el('p', '', image.body));
        wrap.append(media, copy); panel.append(wrap);
      }
      track.append(panel);
    });
    [...track.children].forEach((panel, i) => {
      const button = el('button', 'story-step', String(i + 1).padStart(2, '0'));
      button.type = 'button'; button.setAttribute('aria-label', i === 0 ? 'Overview' : images[i].heading || images[i].caption || `Image ${i}`);
      button.addEventListener('click', () => go(i)); nav.append(button);
    });
    viewport.scrollLeft = viewport.scrollTop = 0;
    fitPageText();
    updateSection(); viewport.focus({ preventScroll: true });
  }
  window.renderPortfolioGallery = categories => {
    gallery.replaceChildren();
    for (const category of categories) {
      const section = el('section', 'project-category');
      section.dataset.category = category.id;
      section.append(el('h3', 'category-title', category.title));
      if (category.description) section.append(el('p', 'category-note', category.description));
      const grid = el('div', 'category-projects');
      category.projects.forEach((project, i) => {
        const card = el('button', 'project-card'); card.type = 'button';
        const cover = project.images.find(validImage);
        if (cover) card.append(picture(cover, project.title));
        else card.append(el('span', 'cover-placeholder', 'Images to be added'));
        card.append(el('span', 'project-card-number', String(i + 1).padStart(2, '0')));
        if (project.year) card.append(el('span', 'project-card-meta', project.year));
        card.append(el('span', 'project-card-title', project.title), el('span', 'project-card-link', 'EXPLORE PROJECT →'));
        card.addEventListener('click', () => showProject(project, category, i, card)); grid.append(card);
      });
      if (!category.projects.length) grid.append(el('p', 'category-empty', 'Projects to be added.'));
      section.append(grid); gallery.append(section);
    }
    showGallery();
  };
  back.addEventListener('click', () => { showGallery(); lastCard?.focus({ preventScroll: true }); });
  sheet.addEventListener('close', showGallery);
  viewport.addEventListener('scroll', updateSection, { passive: true });
  window.addEventListener('resize', () => { if (!viewport.hidden) { fitPageText(); updateSection(); } });
  viewport.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); go(currentSection() + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewport.addEventListener('wheel', event => {
    if (mobile() || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || viewport.scrollWidth <= viewport.clientWidth) return;
    event.preventDefault(); viewport.scrollLeft += event.deltaY;
  }, { passive: false });
  let drag;
  viewport.addEventListener('pointerdown', event => {
    if (mobile() || event.pointerType === 'touch' || event.button !== 0 || event.target.closest('button, a')) return;
    drag = { x: event.clientX, left: viewport.scrollLeft };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove', event => { if (drag) viewport.scrollLeft = drag.left - (event.clientX - drag.x); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) viewport.addEventListener(name, () => { drag = null; viewport.classList.remove('dragging'); });
  footer.querySelector('.story-arrows button:first-child').addEventListener('click', () => go(currentSection() - 1));
  footer.querySelector('.story-arrows button:last-child').addEventListener('click', () => go(currentSection() + 1));
  lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  if (window.portfolioCategories) window.renderPortfolioGallery(window.portfolioCategories);
})();
