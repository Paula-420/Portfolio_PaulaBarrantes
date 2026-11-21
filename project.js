/* Project page — animation system modelled on the reference (GSAP + ScrollTrigger + SplitText) */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const { scramble, placeholder, reduced } = Transition;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const OVERSHOOT = 130;

  /* ---------- render the page from projects.js ---------- */
  const LIST = window.PROJECTS || [];
  let IDX = LIST.findIndex(p => p.slug === new URLSearchParams(location.search).get('p'));
  if (IDX < 0) { location.replace('index.html'); return; } // no project given → back to the home
  const P = LIST[IDX], NEXT = LIST[(IDX + 1) % LIST.length];
  const href = p => `proyecto.html?p=${p.slug}`;
  const tr = v => (window.I18N ? I18N.t(v) : v);           // { es, en } → active language
  const S = k => (window.I18N ? I18N.s(k) : k);            // UI strings
  const esc = v => String(tr(v) ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const imgTag = (m, sizes = '100vw', lazy = true) =>
    `<img src="${m.img}"${m.srcset ? ` srcset="${m.srcset}" sizes="${m.sizes || sizes}"` : ''} alt="${esc(m.alt)}" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
  const vidTag = m => `<video src="${m.video}" poster="${m.poster}" muted loop playsinline preload="none" data-autoplay></video>`;
  const mediaTag = (m, sizes) => m.video ? vidTag(m) : imgTag(m, sizes);
  const labelTag = (t, cls = '') => { t = tr(t); return `<p class="p-label ${cls}"><span class="sr-only">${esc(t)}</span><span aria-hidden="true" data-scramble>${esc(String(t).toUpperCase())}</span></p>`; };
  const figure = (m, group, cls = '', sizes) => {
    const contain = m.fit === 'contain'; // whole piece visible: no overscan, no parallax, no crop
    return `<figure class="p-media ${cls}${contain ? ' p-media--contain' : ''}" data-media-reveal="${group}" style="--ar: ${m.ar || '4 / 5'}"><div class="p-media__in"${contain ? '' : ' data-parallax'}>${mediaTag(m, sizes)}</div></figure>`;
  };


  /* ---------- glossy wrinkled sticker with the project logo (links to the project site) ---------- */
  function stickerTag(link) {
    const words = `${link.label.toUpperCase()} ✦ ${S('p.visit')} ✦ `;
    return `<a class="sticker" href="${link.url}" target="_blank" rel="noopener" data-sticker aria-label="Visitar ${esc(link.label)} (se abre en una pestaña nueva)">
      <span class="sticker__tilt" data-sticker-tilt>
        <span class="sticker__body">
          <span class="sticker__base"></span>
          <svg class="sticker__art" viewBox="0 0 500 500" aria-hidden="true">
            <defs><path id="sticker-ring" d="M 250 250 m -196 0 a 196 196 0 1 1 392 0 a 196 196 0 1 1 -392 0"/></defs>
            <text class="sticker__text"><textPath href="#sticker-ring" textLength="1222" lengthAdjust="spacing">${esc(words.repeat(2))}</textPath></text>
          </svg>
          ${link.logo ? `<img class="sticker__logo" src="${link.logo}" alt="" decoding="async">` : ''}
          <span class="sticker__wrinkle"></span>
          <span class="sticker__crease"></span>
          <span class="sticker__gloss"></span>
          <span class="sticker__shine"></span>
        </span>
      </span>
    </a>`;
  }

  // accepts a bare ID or any youtube.com / youtu.be URL
  function ytId(v) {
    if (!v) return '';
    const m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : '';
  }

  function renderProject() {
    document.title = `${P.title.join(' ')} — María Paula`;
    $('[data-mini-title]').innerHTML = P.title.map(l => `<span>${esc(l)}</span>`).join('');
    $('[data-mini-tag]').textContent = tr(P.tag);

    const hero = $('[data-hero-media]');
    if (P.hero?.fit === 'contain') hero.classList.add('p-hero__media--contain');
    if (P.hero?.fitMobile === 'cover') hero.classList.add('p-hero__media--cover-mobile');
    if (P.hero?.video) hero.innerHTML = `<img src="${P.hero.poster}" alt="" data-hero-cover fetchpriority="high"><video src="${P.hero.video}" autoplay muted loop playsinline preload="auto" data-hero-video></video>`;
    else if (P.hero?.img) hero.innerHTML = `<img src="${P.hero.img}"${P.hero.srcset ? ` srcset="${P.hero.srcset}" sizes="120vw"` : ''} alt="" data-hero-cover fetchpriority="high"${P.hero.position ? ` style="object-position:${P.hero.position}"` : ''}>`;

    const sections = P.sections.map((s, i) => {
      const g = 's' + i;
      if (s.type === 'media') {
        const SIZES = { narrow: ['p-media--narrow', '(min-width: 1024px) 34vw, 100vw'], wide: ['p-media--wide', '(min-width: 1024px) 50vw, 100vw'],
                        large: ['p-media--large', '(min-width: 1024px) 84vw, 100vw'], full: ['p-media--full', '100vw'] };
        const [cls, sizes] = SIZES[s.size] || SIZES.wide;
        const fig = figure({ ...s.media, ar: s.ar }, g, '', sizes);
        const media = `<div class="p-stick ${cls}">${fig}${s.sticker && P.link ? stickerTag(P.link) : ''}</div>`;
        return `<section class="p-block">${media}
          ${s.label ? labelTag(s.label, 'p-block__label') : ''}
          ${s.text ? [].concat(tr(s.text)).map(t => `<p class="p-block__text" data-lines>${esc(t)}</p>`).join('') : ''}</section>`;
      }
      if (s.type === 'double') {
        if (s.layout === 'even') // two big pieces side by side, edge to edge of the grid
          return `<section class="p-double p-double--even">${figure(s.items[0], g, '', '(min-width: 1024px) 50vw, 100vw')}${figure(s.items[1], g, '', '(min-width: 1024px) 50vw, 100vw')}</section>`;
        return `<section class="p-double">${figure(s.items[0], g, '', '(min-width: 1024px) 34vw, 100vw')}${figure(s.items[1], g, 'p-media--offset', '(min-width: 1024px) 34vw, 100vw')}</section>`;
      }
      if (s.type === 'session') {
        // a photo session: title + skills, then the pieces large, in staggered pairs — no body copy
        const imgs = s.images.map((m, k) => figure({ ...m, ar: m.ar || '2 / 3' }, `${g}-${k >> 1}`, `p-session__item p-session__item--${k % 2 ? 'r' : 'l'}`, '(min-width: 1024px) 48vw, 100vw')).join('');
        return `<section class="p-session">
          <header class="p-session__head">
            ${s.note ? `<p class="p-session__note">${esc(s.note)}</p>` : ''}
            <h2 class="p-session__title" data-lines>${esc(s.title)}</h2>
            <ul class="p-session__skills">${tr(s.skills).map(k => `<li class="p-reveal-wrap"><span data-paragraph-inner>${esc(k)}</span></li>`).join('')}</ul>
          </header>
          <div class="p-session__grid">${imgs}</div>
        </section>`;
      }
      if (s.type === 'story') {
        // a short first-person text (award, press, experience) + photos in a staggered pair
        const imgs = s.images.map((m, k) => figure({ ...m, ar: m.ar || '3 / 4' }, `${g}-${k >> 1}`, `p-session__item p-session__item--${k % 2 ? 'r' : 'l'}`, '(min-width: 1024px) 33vw, 82vw')).join('');
        return `<section class="p-session p-story">
          <header class="p-session__head">
            ${s.note ? `<p class="p-session__note">${esc(tr(s.note))}</p>` : ''}
            <h2 class="p-session__title" data-lines>${esc(tr(s.title))}</h2>
            ${s.link ? `<a class="p-story__link" href="${s.link.url}" target="_blank" rel="noopener">${esc(s.link.label)} ↗</a>` : ''}
          </header>
          <div class="p-story__body">${tr(s.paragraphs).map((t, k) => `<p class="${k ? '' : 'p-story__lead'}" data-lines>${esc(t)}</p>`).join('')}</div>
          <div class="p-session__grid">${imgs}</div>
        </section>`;
      }
      if (s.type === 'window') {
        const id = s.video ? '' : ytId(s.youtube);
        const playable = !!(s.video || id);
        return `<section class="p-window">
          <div class="p-window__wrap${s.size === 'large' ? ' p-window__wrap--large' : ''}" data-media-reveal="${g}">
            <div class="mac-window">
              <div class="mac-window__bar">
                <span class="mac-window__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="mac-window__title">${esc(s.title)}</span>
              </div>
              <div class="mac-window__body">
                <button class="mac-window__play" type="button" data-yt="${esc(id)}" data-src="${esc(s.video || '')}" data-yt-title="${esc(s.title)}" aria-label="${playable ? `${S('p.play')} ${esc(s.title)}` : S('p.soon')}"${playable ? '' : ' disabled'}>
                  <img src="${s.poster}" alt="" loading="lazy" decoding="async" data-reveal-scale>
                  <span class="mac-window__btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
                </button>
              </div>
            </div>
          </div></section>`;
      }
      if (s.type === 'ba') {
        const sz = '(min-width: 1024px) 84vw, 100vw';
        return `<section class="p-ba">
          <div class="p-ba__head">${labelTag(S('p.ba'))}<p class="p-ba__hint">${S('p.ba.hint')}</p></div>
          <div class="p-ba__wrap" data-media-reveal="${g}">
            <div class="ba" data-ba style="--pos:50%">
              <div class="ba__scale" data-reveal-scale>
                <img class="ba__img" src="${s.after.img}"${s.after.srcset ? ` srcset="${s.after.srcset}" sizes="${sz}"` : ''} alt="${esc(s.after.alt)}" draggable="false" loading="lazy" decoding="async">
                <div class="ba__before"><img class="ba__img" src="${s.before.img}"${s.before.srcset ? ` srcset="${s.before.srcset}" sizes="${sz}"` : ''} alt="${esc(s.before.alt)}" draggable="false" loading="lazy" decoding="async"></div>
              </div>
              <span class="ba__tag ba__tag--l">${S('p.ba.before')}</span>
              <span class="ba__tag ba__tag--r">${S('p.ba.after')}</span>
              <div class="ba__handle" aria-hidden="true"><span>↔</span></div>
              <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Comparar antes y después">
            </div>
          </div></section>`;
      }
      return '';
    }).join('');

    const nc = NEXT.card;
    const nextMedia = nc.video ? vidTag({ video: nc.video, poster: nc.img }) : imgTag(nc, '(min-width: 1024px) 34vw, 100vw');

    $('[data-project-body]').innerHTML = `
      <div class="p-shrink-trigger" data-shrink-trigger></div>
      <div class="p-title" data-title>
        <div class="p-title__in" data-title-in>
          <h1 data-title-h1>${P.title.map(l => `<span class="p-title__line"><span data-hero-title-inner>${esc(l)}</span></span>`).join('')}</h1>
          <p class="p-title__tag" data-title-tag><span class="sr-only">${esc(P.tag)}</span><span aria-hidden="true" data-scramble>${esc(P.tag)}</span></p>
        </div>
      </div>
      <section class="p-info">
        <div class="p-info__year"><p class="p-reveal-wrap"><span data-paragraph-inner>©${esc(P.year)}</span></p></div>
        <div class="p-info__features">${labelTag(S('p.features'))}
          <ul class="p-list">${tr(P.features).map(f => `<li><span data-paragraph-inner>${esc(f)}</span></li>`).join('')}</ul>
        </div>
        <div class="p-info__desc">${labelTag(S('p.description'))}${[].concat(tr(P.description)).map(t => `<p class="p-big" data-lines>${esc(t)}</p>`).join('')}${P.link && !P.sections.some(x => x.sticker) ? stickerTag(P.link) : ''}</div>
      </section>
      ${sections}
      <section class="p-next" data-next>
        ${labelTag(S('p.next'), 'p-next__label')}
        <a class="p-next__media" href="${href(NEXT)}" data-next-link data-media-reveal="next" style="--ar: 4 / 3">
          <div class="p-media__in" data-parallax>${nextMedia}</div>
        </a>
        <a class="p-next__title" href="${href(NEXT)}" data-next-link>
          ${NEXT.title.map(l => `<span class="p-reveal-wrap"><span data-paragraph-inner data-next-line>${esc(l)}</span></span>`).join('')}
        </a>
      </section>`;
  }
  renderProject();

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- gate: things that wait for the entry sequence ---------- */
  let entered = false;
  const queue = [];
  const whenEntered = fn => entered ? fn() : queue.push(fn);
  const markEntered = () => { entered = true; queue.splice(0).forEach(fn => fn()); };

  /* ---------- initial states ---------- */
  const titleLines = $$('[data-hero-title-inner]');
  gsap.set(titleLines, { yPercent: OVERSHOOT });
  gsap.set('[data-paragraph-inner]', { yPercent: OVERSHOOT });
  const labels = $$('[data-scramble]');
  labels.forEach(el => { el.dataset.final = el.textContent; el.textContent = placeholder(el.textContent); });

  /* ---------- smooth wheel scroll (custom, like the reference) ---------- */
  const smooth = (() => {
    let target = scrollY, cur = scrollY, running = false, locked = false;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const go = d => { target = clamp(target + d, 0, max()); running = true; };
    const blockTouch = e => { if (locked) e.preventDefault(); };
    addEventListener('touchmove', blockTouch, { passive: false });
    addEventListener('wheel', e => {
      if (e.ctrlKey) return;
      if (locked) { e.preventDefault(); return; }
      if (reduced) return;
      e.preventDefault();
      go(e.deltaY * (e.deltaMode === 1 ? 40 : 1));
    }, { passive: false });
    addEventListener('keydown', e => {
      if (e.target.closest('input, textarea, select')) return;
      const map = { ArrowDown: 40, ArrowUp: -40, PageDown: innerHeight * .875, PageUp: -innerHeight * .875, ' ': (e.shiftKey ? -1 : 1) * innerHeight * .875, Home: -1e9, End: 1e9 };
      if (!(e.key in map)) return;
      e.preventDefault();
      if (locked || reduced) { if (!locked) scrollBy(0, map[e.key]); return; }
      go(map[e.key]);
    });
    addEventListener('scroll', () => { if (!running && Math.abs(scrollY - cur) > 2) target = cur = scrollY; }, { passive: true });
    gsap.ticker.add(() => {
      if (!running) return;
      cur += (target - cur) * (1 - Math.exp(-0.08 * gsap.ticker.deltaRatio(60)));
      if (Math.abs(target - cur) < 0.3) { cur = target; running = false; }
      scrollTo(0, cur);
      ScrollTrigger.update();
    });
    return { lock: v => { locked = v; }, sync: () => { target = cur = scrollY; running = false; } };
  })();

  /* ---------- measurements ---------- */
  const probe = size => { const p = document.createElement('span'); p.style.cssText = `position:absolute;visibility:hidden;font-size:var(${size})`; document.body.appendChild(p); const v = parseFloat(getComputedStyle(p).fontSize); p.remove(); return v; };
  let XL = probe('--text-xl'), MD = probe('--text-md');
  const titleBox = $('[data-title]');
  const cssLen = v => { const d = document.createElement('div'); d.style.cssText = `position:absolute;visibility:hidden;width:var(${v})`; document.body.appendChild(d); const w = d.offsetWidth; d.remove(); return w; };
  const heroIntroScroll = () => titleBox.offsetHeight + cssLen('--gutter') + 8;

  /* ---------- hero ---------- */
  const heroVideo = $('[data-hero-video]');
  const heroCover = $('[data-hero-cover]');
  if (heroVideo) {
    const showVideo = () => gsap.to(heroVideo, { opacity: 1, duration: 0.8, ease: 'expoOut', onComplete: () => { if (heroCover) heroCover.style.visibility = 'hidden'; } });
    heroVideo.readyState >= 2 ? showVideo() : heroVideo.addEventListener('loadeddata', showVideo, { once: true });
  }

  function setupScroll() {
    // hero scale + dim, scrubbed over the first viewport
    gsap.timeline({ scrollTrigger: { start: 0, end: () => innerHeight, scrub: true, invalidateOnRefresh: true } })
      .fromTo('[data-hero-media]', { scale: 1 }, { scale: 1 / 1.2, ease: 'none' }, 0)
      .fromTo('[data-hero-dim]', { autoAlpha: 0 }, { autoAlpha: 0.2, ease: 'none' }, 0);
    if (heroVideo) ScrollTrigger.create({ start: () => innerHeight * 1.5, end: 'max', onToggle: s => s.isActive ? heroVideo.pause() : heroVideo.play().catch(() => {}) });

    const miniIn = $('.p-mini__in');
    const mm = gsap.matchMedia();
    // phones/tablets: the big title scrolls away with the page; the small fixed title (above the dark band) takes over
    mm.add('(max-width: 1023px)', () => {
      gsap.set(miniIn, { y: 0, autoAlpha: 1, yPercent: -140 });
      ScrollTrigger.create({
        trigger: '[data-title]', start: 'bottom top+=70', end: 'max',
        onToggle: s => gsap.to(miniIn, { yPercent: s.isActive ? 0 : -140, duration: 0.6, ease: 'expoOut', overwrite: true })
      });
    });
    mm.add('(min-width: 1024px)', () => {
    // big title shrinks into the small-title size once it sticks
    gsap.timeline({
      scrollTrigger: { trigger: '[data-shrink-trigger]', start: 'top top+=20', end: () => '+=' + innerHeight * 0.3, scrub: true, invalidateOnRefresh: true }
    })
      .fromTo('[data-title-h1]', { fontSize: () => XL }, { fontSize: () => MD, ease: 'none' }, 0)
      .fromTo('[data-title-in]', { y: 0 }, { y: -60, ease: 'none' }, 0)
      .fromTo('[data-title-tag]', { marginTop: 20 }, { marginTop: () => 20 * MD / XL, ease: 'none' }, 0);

    // small fixed title slides away as the big one rises from the bottom
    gsap.fromTo(miniIn, { y: 0 }, {
      y: () => -(miniIn.offsetHeight + 20 + 8), ease: 'none',
      scrollTrigger: { start: 0, end: () => heroIntroScroll(), scrub: true, invalidateOnRefresh: true }
    });
    });

    // media parallax
    $$('[data-parallax]').forEach(el => {
      gsap.fromTo(el, { yPercent: -4.545 }, {
        yPercent: 4.545, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- rich text: split into masked lines ---------- */
  function setupLines() {
    $$('[data-lines]').forEach(el => {
      let revealed = false;
      const split = SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          self.masks.forEach(m => m.style.overflowClipMargin = '0.35em');
          gsap.set(self.lines, { yPercent: revealed ? 0 : OVERSHOOT });
        }
      });
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        whenEntered(() => { revealed = true; gsap.to(split.lines, { yPercent: 0, duration: 0.8, ease: 'expoOut', stagger: 0.08 }); });
      }, { rootMargin: '0px 0px -8% 0px' });
      io.observe(el);
    });
  }

  /* ---------- paragraph / list reveal ---------- */
  function setupParagraphs() {
    const groups = new Map();
    $$('[data-paragraph-inner]').forEach(el => {
      const g = el.closest('ul, .p-next__title, p, div');
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(el);
    });
    groups.forEach((items, g) => {
      const isNext = g.matches('.p-next__title');
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        whenEntered(() => {
          gsap.to(items, isNext
            ? { yPercent: 0, duration: 0.5, delay: 0.14, ease: 'expoOut', stagger: 0.14 }
            : { yPercent: 0, duration: 0.8, ease: 'expoOut', stagger: 0.12 });
          if (isNext) items.forEach((el, i) => scramble(el, { duration: 0.8, delay: 0.14 + i * 0.12, lock: false }));
        });
      }, { rootMargin: isNext ? '0px' : '0px 0px -8% 0px' });
      io.observe(g);
    });
  }

  /* ---------- scramble labels: on view, on hover, ambient pulse ---------- */
  const visibleLabels = new Set();
  function setupLabels() {
    labels.filter(el => !el.closest('[data-title]')).forEach(el => {
      let done = false;
      new IntersectionObserver(([en]) => {
        en.isIntersecting ? visibleLabels.add(el) : visibleLabels.delete(el);
        if (en.isIntersecting && !done) { done = true; whenEntered(() => scramble(el, { duration: 1 })); }
      }, { threshold: 0.1 }).observe(el);
      if (fine) el.parentElement.addEventListener('mouseenter', () => scramble(el, { delay: 0.12, duration: 0.6 }));
    });
    if (fine && !reduced) {
      let tick = 0;
      const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
      setInterval(() => {
        tick++;
        visibleLabels.forEach(el => {
          if (el._scr?.isActive()) return;
          if ((tick + Math.abs(hash(el.dataset.final))) % 10 === 0) scramble(el, { duration: 0.5 });
        });
      }, 800);
    }
  }

  /* ---------- media reveal: alternating wipe + scale ---------- */
  function setupMedia() {
    const names = [];
    $$('[data-media-reveal]').forEach(el => { if (!names.includes(el.dataset.mediaReveal)) names.push(el.dataset.mediaReveal); });
    $$('[data-media-reveal]').forEach(el => {
      const even = names.indexOf(el.dataset.mediaReveal) % 2 === 0;
      const inner = $('[data-reveal-scale]', el) || $('.p-media__in > img, .p-media__in > video', el);
      // clip an inner layer: Chrome's IntersectionObserver honours the target's own clip-path
      const clipEl = $('.p-media__in', el) || el.firstElementChild;
      gsap.set(clipEl, { clipPath: even ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' });
      gsap.set(inner, { scale: 1.2 });
      let revealed = false;
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        whenEntered(() => mediaReady(inner).then(() => {
          gsap.to(clipEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expoOut' });
          gsap.to(inner, { scale: 1, duration: 1.2, ease: 'expoOut', onComplete: () => { revealed = true; el.dispatchEvent(new Event('revealed')); } });
        }));
      }, { threshold: 0.1 });
      io.observe(el);
      if (fine && !el.hasAttribute('data-ba') && !$('[data-ba]', el) && !el.classList.contains('p-media--contain')) {
        const hoverEl = el.closest('a') || el;
        hoverEl.addEventListener('mouseenter', () => revealed && gsap.to(inner, { scale: 1.04, duration: 0.6, ease: 'expoOut' }));
        hoverEl.addEventListener('mouseleave', () => revealed && gsap.to(inner, { scale: 1, duration: 0.6, ease: 'expoOut' }));
      }
    });
  }
  function mediaReady(el) {
    const m = el.matches('img, video') ? el : $('img', el);
    if (!m) return Promise.resolve();
    const ok = m.tagName === 'VIDEO' ? m.readyState >= 2 || m.poster : m.complete && m.naturalWidth;
    if (ok) return Promise.resolve();
    if (m.loading === 'lazy') m.loading = 'eager';
    return Promise.race([
      new Promise(r => m.addEventListener(m.tagName === 'VIDEO' ? 'loadeddata' : 'load', r, { once: true })),
      new Promise(r => setTimeout(r, 3000))
    ]);
  }

  /* ---------- videos: play only near the viewport ---------- */
  function setupVideos() {
    const vio = new IntersectionObserver(entries => entries.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { v.preload = 'auto'; whenEntered(() => v.play().catch(() => {})); } else v.pause();
    }), { rootMargin: '200px 0px' });
    $$('video[data-autoplay]').forEach(v => vio.observe(v));
  }

  /* ---------- before / after ---------- */
  function setupBeforeAfter() {
    $$('[data-ba]').forEach(ba => {
      const range = $('.ba__range', ba);
      let target = 50, cur = 50, dragging = false;
      const render = () => ba.style.setProperty('--pos', cur.toFixed(2) + '%');
      const set = (v, tween = true) => {
        target = clamp(v, 0, 100); range.value = target;
        gsap.to({ v: cur }, { v: target, duration: tween ? 0.5 : 0.25, ease: 'expoOut', overwrite: true, onUpdate() { cur = this.targets()[0].v; render(); } });
      };
      const fromEvent = e => { const r = ba.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
      ba.addEventListener('pointerdown', e => { dragging = true; ba.classList.add('is-dragging'); ba.setPointerCapture(e.pointerId); set(fromEvent(e), false); e.preventDefault(); });
      ba.addEventListener('pointermove', e => { if (dragging) set(fromEvent(e), false); });
      const end = () => { dragging = false; ba.classList.remove('is-dragging'); };
      ba.addEventListener('pointerup', end); ba.addEventListener('pointercancel', end);
      range.addEventListener('input', () => set(+range.value));
      ba.closest('[data-media-reveal]').addEventListener('revealed', () => {
        if (reduced) return;
        gsap.timeline().add(() => set(72), 0.1).add(() => set(28), 0.75).add(() => set(50), 1.4);
      }, { once: true });
    });
  }

  /* ---------- YouTube window: load the player only on click (facade) ---------- */
  function setupWindows() {
    $$('[data-yt]').forEach(btn => btn.addEventListener('click', () => {
      // own video file: native player with controls, starts with sound (user clicked)
      if (btn.dataset.src) {
        $$('video').forEach(v => v.pause());
        const v = document.createElement('video');
        Object.assign(v, { src: btn.dataset.src, poster: btn.querySelector('img')?.src || '', controls: true, playsInline: true, preload: 'auto', className: 'mac-window__frame' });
        v.setAttribute('aria-label', btn.dataset.ytTitle);
        btn.replaceWith(v);
        v.play().catch(() => {});
        return;
      }
      const id = btn.dataset.yt;
      if (!id) return;
      // YouTube refuses embeds without a referring site (error 153). Opened as a local file there is none,
      // so open the video on YouTube instead; once the site is published it plays inside the window.
      if (location.protocol === 'file:') { window.open(`https://youtu.be/${id}`, '_blank', 'noopener'); return; }
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(location.origin)}`;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.title = btn.dataset.ytTitle;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.className = 'mac-window__frame';
      btn.replaceWith(f);
      $$('video').forEach(v => v.pause());
    }));
  }

  /* ---------- sticker: peel-in on view, 3D tilt + moving shine on hover ---------- */
  function setupSticker() {
    const st = $('[data-sticker]');
    if (!st) return;
    const tilt = $('[data-sticker-tilt]', st);
    gsap.set(tilt, { scale: 1.7, rotation: -38, y: -40, autoAlpha: 0 });
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      whenEntered(() => gsap.timeline({ delay: 0.5 })
        .to(tilt, { autoAlpha: 1, duration: 0.15 }, 0)
        .to(tilt, { scale: 1, rotation: 9, y: 0, duration: 0.55, ease: 'power3.in' }, 0)   // slapped on
        .to(tilt, { scale: 1.03, duration: 0.08, ease: 'power1.out', yoyo: true, repeat: 1 })); // tiny squash
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(st);
    if (!fine || reduced) return;
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'expoOut' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'expoOut' });
    st.addEventListener('pointermove', e => {
      const r = st.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      rx((0.5 - y) * 22); ry((x - 0.5) * 26);
      st.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      st.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      st.style.setProperty('--shift', ((x - 0.5) * 60).toFixed(1) + 'deg');
    });
    st.addEventListener('pointerleave', () => { rx(0); ry(0); st.style.setProperty('--shift', '0deg'); });
  }

  /* ---------- navigation (curtain out) ---------- */
  function setupNav() {
    const nextMedia = $('.p-next__media');
    $$('[data-next-link]').forEach(a => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      Transition.cover({ title: NEXT.title, img: NEXT.card.img, rect: fine ? nextMedia.getBoundingClientRect() : null, href: a.getAttribute('href') });
    }));
    $$('[data-nav-home]').forEach(a => a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      Transition.cover({ title: ['María', 'Paula'], href: a.getAttribute('href') });
    }));
  }

  /* ---------- menu ---------- */
  function setupChrome() {
    const menu = $('[data-menu]'), btn = $('[data-menu-btn]');
    const toggle = force => {
      const open = force ?? !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    btn.addEventListener('click', () => toggle());
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------- entry sequence ---------- */
  function entrySequence() {
    smooth.lock(true);
    gsap.set('.p-mini__in', { visibility: 'visible' });
    const s = { y: 0 };
    gsap.to(s, {
      y: heroIntroScroll(), duration: 1.3, ease: 'expoOut', delay: 0.2,
      onUpdate: () => { scrollTo(0, s.y); ScrollTrigger.update(); },
      onComplete: () => { smooth.sync(); smooth.lock(false); markEntered(); }
    });
    // big title intro + category scramble
    gsap.to(titleLines, { yPercent: 0, duration: 0.38, ease: 'expoOut', stagger: 0.18, delay: 0.59 });
    const tag = $('[data-title-tag] [data-scramble]');
    gsap.delayedCall(0.59 + 0.18 * titleLines.length, () => scramble(tag, { duration: 0.38 }));
  }

  /* ---------- language switch: replay the page in the other language behind the curtain ---------- */
  addEventListener('langchange', () => {
    Transition.cover({ title: P.title, img: P.card.img, href: location.href });
  });

  /* ---------- boot ---------- */
  const b = document.body;
  const release = Transition.boot({ title: P.title, img: P.card.img });
  document.documentElement.classList.remove('is-booting');
  setupChrome(); setupNav(); setupBeforeAfter(); setupVideos();

  const loaded = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }));
  Promise.race([Promise.all([document.fonts.ready, loaded]), new Promise(r => setTimeout(r, 2500))]).then(() => {
    XL = probe('--text-xl'); MD = probe('--text-md');
    setupLines(); setupParagraphs(); setupLabels(); setupMedia(); setupScroll(); setupSticker(); setupWindows();
    ScrollTrigger.refresh();
    scrollTo(0, 0);
    release({ delay: 0.2 });
    entrySequence();
  });
  addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
})();
