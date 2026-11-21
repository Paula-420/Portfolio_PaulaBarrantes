(() => {
  // Single source of truth: projects.js (shared with the project template)
  const t = v => (window.I18N ? I18N.t(v) : (v && typeof v === 'object' && !Array.isArray(v) ? v.es : v));
  const PROJECTS = [];
  const loadProjects = () => PROJECTS.splice(0, PROJECTS.length, ...(window.PROJECTS || []).map(p => ({
    title: p.title,
    tag: t(p.card.tag),
    img: p.card.img,
    srcset: p.card.srcset,
    video: p.card.video,
    url: `proyecto.html?p=${p.slug}`,
    desc: t(p.description)
  })));
  loadProjects();

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('nointro');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (location.search.includes('nointro')) document.documentElement.classList.add('no-anim');

  /* ---------------- Carousel ---------------- */
  const works = $('.works');
  const track = $('[data-track]');
  let cards = [];
  let cardW = 0, gap = 0, step = 0, totalW = 0, vw = innerWidth, gutter = 0;
  let target = 0, current = 0, prev = 0, velocity = 0;

  function cardHTML(p, i) {
    const idx = String((i % PROJECTS.length) + 1).padStart(2, '0');
    const title = p.title.map((t, k) => `<span><i style="--d:${0.35 + k * 0.06}s">${t}</i></span>`).join('');
    return `
      <article class="card" data-index="${i % PROJECTS.length}">
        <div class="card__clip"><div class="card__img">${p.video
          ? `<video src="${p.video}" poster="${p.img}" muted loop playsinline preload="none" draggable="false"></video>`
          : `<img src="${p.img}"${p.srcset ? ` srcset="${p.srcset}" sizes="(min-width: 1024px) 40vw, 95vw"` : ''} alt="" draggable="false" decoding="async" loading="${i < PROJECTS.length ? 'eager' : 'lazy'}">`}</div></div>
        <div class="card__meta">
          <h3 class="card__title">${title}</h3>
          <p class="card__tag"><span><i style="--d:.5s">${p.tag}</i></span></p>
        </div>
      </article>`;
  }

  function measure() {
    vw = innerWidth;
    const desktop = vw >= 1024;
    const cs = getComputedStyle(document.documentElement);
    const len = v => { const d = document.createElement('div'); d.style.cssText = `position:absolute;visibility:hidden;width:var(${v})`; document.body.appendChild(d); const w = d.offsetWidth; d.remove(); return w; };
    gutter = len('--gutter') || 10;
    gap = len('--gap') || 10;
    cardW = desktop ? Math.round(vw * 0.3) : Math.round(vw * 0.72);
    step = cardW + gap;
  }

  function build() {
    measure();
    const per = PROJECTS.length * step;
    const copies = Math.max(2, Math.ceil((vw + step * 2) / per));
    const list = [];
    for (let c = 0; c < copies; c++) PROJECTS.forEach(p => list.push(p));
    track.innerHTML = list.map(cardHTML).join('');
    track.style.setProperty('--card-w', cardW + 'px');
    cards = $$('.card', track).map((el, i) => ({ el, img: $('.card__img', el), video: $('video', el), visible: false, i }));
    cards.forEach(({ el }, i) => el.querySelector('.card__clip').style.setProperty('--d', (0.15 + Math.min(i, 5) * 0.08) + 's'));
    totalW = cards.length * step;
  }

  function render() {
    current = lerp(current, target, reduced ? 1 : 0.085);
    velocity = current - prev;
    prev = current;
    const skew = reduced ? 0 : clamp(velocity * -0.12, -7, 7);
    for (const c of cards) {
      let x = (c.i * step - current) % totalW;
      if (x < -step) x += totalW;
      if (x >= totalW - step) x -= totalW;
      x += gutter;
      c.el.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
      const center = (x + cardW / 2 - vw / 2) / vw;
      c.img.style.transform = `translate3d(${(-center * cardW * 0.14).toFixed(2)}px,0,0)`;
      // only play videos that are on screen
      const vis = x > -cardW && x < vw;
      if (c.video && vis !== c.visible) { c.visible = vis; vis ? c.video.play().catch(() => {}) : c.video.pause(); }
    }
    requestAnimationFrame(render);
  }

  // Wheel
  works.ownerDocument.addEventListener('wheel', e => {
    if (document.body.classList.contains('overlay-open')) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    target += d * (e.deltaMode === 1 ? 30 : 1);
  }, { passive: true });

  // Drag
  let dragging = false, startX = 0, lastX = 0, lastT = 0, dragV = 0, moved = 0;
  works.addEventListener('pointerdown', e => {
    dragging = true; moved = 0;
    startX = lastX = e.clientX; lastT = performance.now(); dragV = 0;
    works.classList.add('is-dragging');
    works.setPointerCapture(e.pointerId);
  });
  works.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const now = performance.now();
    dragV = dx / Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
    target -= dx * (finePointer ? 1.4 : 1.8);
  });
  const endDrag = e => {
    if (!dragging) return;
    dragging = false;
    works.classList.remove('is-dragging');
    target -= dragV * 260;
    if (moved < 6) {
      const card = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card');
      if (card) openProject(+card.dataset.index, card);
    }
  };
  works.addEventListener('pointerup', endDrag);
  works.addEventListener('pointercancel', endDrag);

  // Keyboard
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeOverlays(); toggleMenu(false); }
    if (document.body.classList.contains('overlay-open')) return;
    if (e.key === 'ArrowRight') target += step;
    if (e.key === 'ArrowLeft') target -= step;
  });

  /* ---------------- Wordmark ---------------- */
  const markWrap = $('[data-mark-wrap]');
  const mark = $('[data-mark]');
  mark.innerHTML = [...mark.textContent].map((ch, i) => `<span class="l" style="--i:${i}">${ch}</span>`).join('');
  const letters = $$('.l', mark);

  function fitMark() {
    mark.style.fontSize = '100px';
    const w = mark.scrollWidth;
    const W = markWrap.clientWidth;
    const H = markWrap.clientHeight;
    const byW = (W / w) * 100;
    const byH = H > 40 ? H / 0.78 : Infinity;
    mark.style.fontSize = Math.floor(Math.min(byW, byH)) + 'px';
    if (innerWidth < 1024) markWrap.style.height = (parseFloat(mark.style.fontSize) * 0.78) + 'px';
    else markWrap.style.height = '';
  }

  // letter push away from cursor
  if (finePointer && !reduced) {
    const identity = $('.identity');
    identity.addEventListener('mousemove', e => {
      const r = mark.getBoundingClientRect();
      const inY = e.clientY > r.top - 60 && e.clientY < r.bottom + 20;
      const R = r.height * 1.1;
      letters.forEach(l => {
        const b = l.getBoundingClientRect();
        const cx = b.left + b.width / 2 - (parseFloat(l.style.getPropertyValue('--px')) || 0);
        const dx = cx - e.clientX;
        const f = inY ? Math.max(0, 1 - Math.abs(dx) / R) : 0;
        l.style.setProperty('--px', (Math.sign(dx) * f * f * r.height * 0.12).toFixed(1) + 'px');
      });
    });
    identity.addEventListener('mouseleave', () => letters.forEach(l => l.style.setProperty('--px', '0px')));
  }

  /* ---------------- Menu ---------------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  function toggleMenu(force) {
    const open = force ?? !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  menuBtn.addEventListener('click', () => toggleMenu());
  $$('[data-nav]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    toggleMenu(false);
    if (a.dataset.nav === 'about') openOverlay($('[data-about]'));
    else closeOverlays();
  }));
  $('.logo').addEventListener('click', e => { e.preventDefault(); closeOverlays(); toggleMenu(false); });

  /* ---------------- Overlays ---------------- */
  const projectEl = $('[data-project]');
  function openOverlay(el) {
    $$('.overlay.is-open').forEach(o => o !== el && o.classList.remove('is-open'));
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    el.scrollTop = 0;
    document.body.classList.add('overlay-open');
  }
  function closeOverlays() {
    $$('.overlay.is-open').forEach(o => { o.classList.remove('is-open'); o.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('overlay-open');
    if (location.hash) history.replaceState(null, '', location.pathname);
  }
  function openProject(i, cardEl) {
    const p = PROJECTS[i];
    if (p.url) {
      const clip = cardEl?.querySelector('.card__clip');
      Transition.cover({ title: p.title, img: p.img, rect: finePointer && clip ? clip.getBoundingClientRect() : null, href: p.url });
      return;
    }
    $('[data-p-media]', projectEl).innerHTML = p.video
      ? `<video src="${p.video}" poster="${p.img}" muted loop playsinline autoplay></video>`
      : `<img src="${p.img}" alt="">`;
    $('[data-p-index]', projectEl).textContent = `${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')}`;
    $('[data-p-title]', projectEl).innerHTML = p.title.join('<br>');
    $('[data-p-tag]', projectEl).textContent = p.tag;
    $('[data-p-desc]', projectEl).textContent = p.desc;
    openOverlay(projectEl);
  }
  $$('[data-close]').forEach(b => b.addEventListener('click', closeOverlays));

  /* ---------------- Dot-matrix digits (5x7, bold dots) ---------------- */
  const DOT_GLYPHS = {
    0: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    1: ['..#..', '.##..', '#.#..', '..#..', '..#..', '..#..', '#####'],
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    3: ['.###.', '#...#', '....#', '..##.', '....#', '#...#', '.###.'],
    4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
    7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..']
  };
  const DOT_CELL = 10, DOT_R = 4.4, DOT_GAP = 1; // gap = empty columns between digits
  const dotCache = {};
  function dotDigits(str) {
    str = String(str);
    if (dotCache[str]) return dotCache[str];
    const cols = 5 + DOT_GAP;
    let circles = '';
    [...str].forEach((ch, k) => {
      (DOT_GLYPHS[ch] || []).forEach((row, y) => [...row].forEach((c, x) => {
        if (c === '#') circles += `<circle cx="${(k * cols + x) * DOT_CELL + DOT_CELL / 2}" cy="${y * DOT_CELL + DOT_CELL / 2}" r="${DOT_R}"/>`;
      }));
    });
    const w = (str.length * cols - DOT_GAP) * DOT_CELL;
    return dotCache[str] = `<svg viewBox="0 0 ${w} ${7 * DOT_CELL}" aria-hidden="true">${circles}</svg>`;
  }

  /* ---------------- About ticker: built from the skills list ---------------- */
  function buildTicker() {
    const track = $('[data-ticker]');
    const skills = $$('.about__skills li').map(li => (li.querySelector('b')?.textContent || [...li.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('')).trim()).filter(Boolean);
    if (!track || !skills.length) return;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    // twice, so the -50% loop is seamless
    track.innerHTML = [...skills, ...skills].map(s => `<span>${esc(s)}</span>`).join('');
  }
  buildTicker();

  /* ---------------- Language switch: re-render data-driven text live ---------------- */
  addEventListener('langchange', () => {
    loadProjects();
    const prog = totalW ? target / totalW : 0;
    build();
    target = current = prev = prog * totalW;
    $$('.card__title span i, .card__tag span i').forEach(i => { i.style.transition = 'none'; i.style.transform = 'none'; });
    buildTicker();
  });

  /* ---------------- Intro ---------------- */
  function intro() {
    // Arriving from a project page: open with the shared curtain instead of the black counter
    if (window.Transition && Transition.pending()) {
      const release = Transition.boot();
      document.documentElement.classList.remove('is-booting');
      const introEl = $('.intro');
      introEl.style.transition = 'none';
      document.body.classList.add('is-loaded');
      requestAnimationFrame(() => { introEl.style.display = 'none'; });
      target = -vw * 0.35; current = target - vw * 0.6; prev = current;
      const go = () => {
        release({ delay: 0.2 });
        setTimeout(() => {
          document.body.classList.add('is-ready', 'is-revealing');
          setTimeout(() => document.body.classList.remove('is-revealing'), 2000);
          target = 0;
        }, reduced ? 0 : 700);
      };
      document.fonts?.ready ? document.fonts.ready.then(go) : go();
      return;
    }
    const count = $('.intro__count');
    const imgs = PROJECTS.map(p => new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = p.img; }));
    let loaded = false;
    Promise.all(imgs).then(() => loaded = true);
    const t0 = performance.now();
    const minDur = reduced ? 0 : 1400;
    (function tick(now) {
      const t = clamp((now - t0) / minDur, 0, 1);
      const shown = Math.floor((loaded ? t : Math.min(t, 0.9)) * 100);
      count.innerHTML = dotDigits(shown);
      if (t >= 1 && loaded) {
        count.innerHTML = dotDigits(100);
        document.body.classList.add('is-loaded');
        setTimeout(() => {
          document.body.classList.add('is-ready', 'is-revealing');
          setTimeout(() => document.body.classList.remove('is-revealing'), 2000);
        }, reduced ? 0 : 450);
        return;
      }
      requestAnimationFrame(tick);
    })(t0);
    // intro starts with content slightly offset, then glides in
    target = -vw * 0.35; current = target - vw * 0.6; prev = current;
    setTimeout(() => { target = 0; }, reduced ? 0 : 1700);
  }

  /* ---------------- Init ---------------- */
  build();
  fitMark();
  intro();
  requestAnimationFrame(render);
  if (location.hash === '#about') openOverlay($('[data-about]'));
  const pParam = new URLSearchParams(location.search).get('p');
  if (pParam !== null && PROJECTS[+pParam] && !PROJECTS[+pParam].url) setTimeout(() => openProject(+pParam), reduced ? 0 : 1600);
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.add('is-loaded'); });

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const prog = totalW ? target / totalW : 0;
      build();
      target = current = prev = prog * totalW;
      fitMark();
    }, 150);
  });
  document.fonts?.ready.then(fitMark);
})();
