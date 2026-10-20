(() => {
  const assetURL = src => new URL(src.replace(/^\//, ''), document.baseURI).href;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function email(text) {
    const paragraph = el('p', 'cv-email');
    const icon = el('span', 'cv-email-symbol', '✉');
    icon.setAttribute('aria-hidden', 'true');
    const link = el('a', '', text);
    // A saved email is plain text, never executable markup.
    link.href = `mailto:${encodeURIComponent(text)}`;
    paragraph.append(icon, link);
    return paragraph;
  }
  function renderPhoto(photo) {
    const container = document.querySelector('.cv-photo');
    if (!container || !photo || !/^\/uploads\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(photo.src)) return;
    const image = el('img');
    image.src = assetURL(photo.src);
    image.alt = photo.alt || 'Profile photo';
    image.addEventListener('error', () => {
      container.replaceChildren();
      container.setAttribute('role', 'img');
      container.setAttribute('aria-label', 'Profile photo placeholder');
    });
    container.removeAttribute('role');
    container.removeAttribute('aria-label');
    container.replaceChildren(image);
  }
  function renderCV(sections) {
    const container = document.querySelector('.cv-content');
    const fragment = document.createDocumentFragment();
    for (const section of sections) {
      const node = el('section', 'cv-block');
      node.append(el('h3', '', section.title));
      const entries = section.kind === 'timeline' ? el('div', 'cv-timeline') : node;
      for (const entry of section.entries) {
        const article = el('article', section.kind === 'timeline' ? 'cv-entry' : 'cv-text-entry');
        if (entry.heading) article.append(el('h4', '', entry.heading));
        for (const block of entry.blocks) {
          if (block.label) article.append(el('p', 'cv-organization', block.label));
          if (block.text) {
            if (section.kind === 'contact') article.append(email(block.text));
            else for (const paragraph of block.text.split(/\n\s*\n/)) article.append(el('p', section.kind === 'skills' ? 'cv-skills' : 'cv-copy', paragraph));
          }
          if (block.bullets.length) {
            const list = el('ul', 'cv-duties');
            list.append(...block.bullets.map(item => el('li', '', item)));
            article.append(list);
          }
        }
        entries.append(article);
      }
      if (entries !== node) node.append(entries);
      fragment.append(node);
    }
    container.replaceChildren(fragment);
  }
  function renderPortfolio(categories) {
    window.portfolioCategories = categories;
    if (window.renderPortfolioGallery) {
      window.renderPortfolioGallery(categories);
      return;
    }
    const container = document.querySelector('.portfolio-categories');
    const fragment = document.createDocumentFragment();
    for (const category of categories) {
      const section = el('section', 'portfolio-category');
      section.append(el('h3', '', category.title));
      if (category.description) section.append(el('p', '', category.description));
      if (!category.projects.length) section.append(el('p', 'portfolio-empty', 'Projects to be added.'));
      const gallery = el('div', 'portfolio-projects');
      for (const project of category.projects) {
        const article = el('article', 'portfolio-project');
        const images = el('div', 'portfolio-project-images');
        for (const image of project.images) {
          if (!/^\/uploads\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(image.src)) continue;
          const link = el('a');
          link.href = assetURL(image.src);
          link.target = '_blank';
          link.rel = 'noopener';
          const img = el('img');
          img.src = assetURL(image.src);
          img.alt = image.alt || project.title;
          img.loading = 'lazy';
          link.append(img);
          images.append(link);
        }
        article.append(images, el('h4', '', project.title));
        if (project.description) article.append(el('p', '', project.description));
        gallery.append(article);
      }
      section.append(gallery);
      fragment.append(section);
    }
    container.replaceChildren(fragment);
  }
  async function load() {
    const localFile = new URL(document.baseURI).protocol === 'file:';
    let data = localFile ? window.portfolioSavedContent : undefined;
    // Static preview servers can return HTML with status 200 for missing API routes.
    // Try the saved JSON too when the API response cannot be parsed as content.
    for (const path of ['api/content', 'data/content.json']) {
      if (data) break;
      try {
        const response = await fetch(new URL(path, document.baseURI), { cache: 'no-store' });
        if (!response.ok) continue;
        const candidate = await response.json();
        if (!Array.isArray(candidate.cv) || !Array.isArray(candidate.categories)) continue;
        data = candidate;
        break;
      } catch { /* Try the saved content in static previews. */ }
    }
    if (!data) throw new Error('Content unavailable. Open the website through its local server.');
    renderPhoto(data.photo);
    renderCV(data.cv);
    renderPortfolio(data.categories);
  }
  load().catch(error => {
    console.error(error);
    const placeholder = document.querySelector('.portfolio-empty');
    if (placeholder) placeholder.textContent = 'Open this site at http://localhost:3000 to load your saved projects. Run node server.mjs in CV-Web first.';
  });
})();
