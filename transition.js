/* Shared page transition + scramble helpers (needs GSAP + CustomEase) */
(() => {
  gsap.registerPlugin(CustomEase);
  CustomEase.create('expoOut', '0.19,1,.22,1');
  CustomEase.create('expoInOut', '.83,0,.17,1');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) gsap.globalTimeline.timeScale(20);
  const KEY = 'mp-curtain';
  const SHIFT = 40;

  /* ---------- Scramble (width-matched glyph pools) ---------- */
  const W_UP = 'I28 J50 L55 F57 T60 E62 Z63 S64 Y64 P65 X66 B67 K67 R68 V68 A70 C70 D71 U71 H72 N73 G74 O77 Q77 M85 W95';
  const W_LO = 'i24 l24 j25 f32 t34 r38 z48 s50 c52 k52 x52 y52 v52 a54 e55 h57 n57 o57 u57 g58 b59 d59 p59 q59 w78 m86';
  const parse = s => s.split(' ').map(t => [t[0], +t.slice(1)]);
  const pools = {};
  [parse(W_UP), parse(W_LO)].forEach(list => list.forEach(([c, w]) => {
    pools[c] = list.filter(([d]) => d !== c).sort((a, b) => Math.abs(a[1] - w) - Math.abs(b[1] - w)).slice(0, 6).map(x => x[0]);
  }));
  const DIG = '0123456789'.split('');
  const base = c => c.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const poolOf = c => /\d/.test(c) ? DIG : pools[base(c)] || null;

  function placeholder(text) {
    return [...text].map((c, i) => { const p = poolOf(c); return p ? p[i % p.length] : c; }).join('');
  }

  /* typeScramble: chars re-roll every 0.05s, resolve in random order after 30% */
  function scramble(el, { duration = 1, delay = 0, text, lock = true, mixFonts = false } = {}) {
    const final = text ?? el.dataset.final ?? el.textContent;
    el.dataset.final = final;
    const chars = [...final];
    const order = chars.map((_, i) => i).sort(() => Math.random() - 0.5);
    const rank = []; order.forEach((idx, r) => rank[idx] = r);
    let lastRoll = -1, current = chars.map(c => c);
    if (el._scr) el._scr.kill();
    if (lock) { el.style.width = el.offsetWidth + 'px'; el.style.whiteSpace = 'nowrap'; el.style.overflow = 'hidden'; el.style.display ||= 'inline-block'; }
    const state = { p: 0 };
    el._scr = gsap.to(state, {
      p: 1, duration, delay, ease: 'none',
      onUpdate() {
        const t = this.time();
        const resolved = Math.round(Math.max(0, (state.p - 0.3) / 0.7) * chars.length);
        const roll = Math.floor(t / 0.05) !== lastRoll;
        if (roll) lastRoll = Math.floor(t / 0.05);
        let html = '';
        chars.forEach((c, i) => {
          const pool = poolOf(c);
          if (!pool || rank[i] < resolved) { current[i] = c; html += mixFonts ? esc(c) : c; return; }
          if (roll) current[i] = pool[Math.random() * pool.length | 0];
          html += mixFonts ? `<span class="${Math.random() < .5 ? 'f-serif' : ''}">${esc(current[i])}</span>` : current[i];
        });
        mixFonts ? (el.innerHTML = html) : (el.textContent = html);
      },
      onComplete() {
        el.textContent = final;
        if (lock) { el.style.width = ''; el.style.whiteSpace = ''; el.style.overflow = ''; }
      }
    });
    return el._scr;
  }
  const esc = c => c === '<' ? '&lt;' : c === '&' ? '&amp;' : c;

  /* ---------- Curtain DOM ---------- */
  let curtain;
  function build({ title = [], img = '' }) {
    curtain?.remove();
    curtain = document.createElement('div');
    curtain.className = 'tc';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = `
      <div class="tc__dim"></div>
      <div class="tc__panel">
        <div class="tc__inner">
          <div class="tc__slot"${img ? '' : ' hidden'}><div class="tc__slot-in">${img ? `<img src="${img}" alt="">` : ''}</div></div>
          <div class="tc__title">${title.map(l => `<span class="tc__line"><span>${l}</span></span>`).join('')}</div>
          <div class="tc__count"><span>000</span></div>
        </div>
      </div>`;
    document.body.appendChild(curtain);
    return {
      dim: curtain.querySelector('.tc__dim'),
      panel: curtain.querySelector('.tc__panel'),
      slot: curtain.querySelector('.tc__slot'),
      slotIn: curtain.querySelector('.tc__slot-in'),
      lines: [...curtain.querySelectorAll('.tc__line > span')],
      count: curtain.querySelector('.tc__count span')
    };
  }
  const shiftTargets = () => [...document.querySelectorAll('[data-exit-shift]')];

  /* ---------- cover(): run on the page we leave ---------- */
  function cover({ title = [], img = '', rect = null, href }) {
    const els = build({ title, img });
    try { sessionStorage.setItem(KEY, JSON.stringify({ title, img })); } catch (e) {}
    document.documentElement.classList.add('is-transitioning');
    document.querySelectorAll('video').forEach(v => v.pause());

    const slotRect = els.slot.getBoundingClientRect(); // measure before the panel is pushed down
    const tl = gsap.timeline({ onComplete: () => { location.href = href; } });
    gsap.set(els.panel, { yPercent: 100, y: SHIFT });
    gsap.set(els.lines, { yPercent: 130 });
    gsap.set(els.count.parentNode, { autoAlpha: 1 });

    tl.to(els.panel, { yPercent: 0, y: 0, duration: 0.9, ease: 'expoInOut' }, 0)
      .to(shiftTargets(), { y: -SHIFT, duration: 0.9, ease: 'expoInOut' }, 0)
      .fromTo(els.dim, { opacity: 0 }, { opacity: 0.4, duration: 0.9, ease: 'none' }, 0);

    const n = els.lines.length;
    els.lines.forEach((l, i) => {
      tl.to(l, { yPercent: 0, duration: Math.max(0.4, 1 - 0.15 * (n - 1)), ease: 'expoOut' }, 0.55 + i * 0.15);
      tl.add(() => scramble(l, { duration: 0.6, lock: false, mixFonts: true }), 0.55 + i * 0.15);
    });
    const c = { v: 0 };
    tl.to(c, { v: 100, duration: 1.2, ease: 'none', onUpdate: () => els.count.textContent = String(Math.round(c.v)).padStart(3, '0') }, 0.55);

    // Shared element: clone of the card image flies into the centred slot
    if (img && rect) {
      els.slot.style.visibility = 'hidden';
      const clone = document.createElement('div');
      clone.className = 'tc__clone';
      clone.innerHTML = `<img src="${img}" alt="">`;
      Object.assign(clone.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
      document.body.appendChild(clone);
      const to = slotRect;
      tl.to(clone, { left: to.left, top: to.top, width: to.width, height: to.height, duration: 2.05, ease: 'expoOut' }, 0)
        .add(() => { els.slot.style.visibility = ''; }, 2.05);
    } else {
      gsap.set(els.slot, { yPercent: 130 });
      tl.to(els.slot, { yPercent: 0, duration: 0.9, ease: 'expoOut' }, 0.45);
    }
    tl.to({}, { duration: 0.1 });
    return tl;
  }

  /* ---------- boot(): run on the page we arrive at ---------- */
  function pending() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } }
  function boot(fallback) {
    const data = pending() || fallback;
    if (!data) return null;
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    const els = build(data);
    gsap.set(els.panel, { yPercent: 0, y: 0 });
    els.count.textContent = '100';
    gsap.set(shiftTargets(), { y: SHIFT });
    document.documentElement.classList.add('is-transitioning');

    return function release({ delay = 0.2, onComplete } = {}) {
      const tl = gsap.timeline({
        delay,
        onComplete: () => { curtain?.remove(); curtain = null; document.documentElement.classList.remove('is-transitioning'); onComplete?.(); }
      });
      tl.to(els.panel, { yPercent: -100, y: -SHIFT, duration: 0.9, ease: 'expoInOut' }, 0)
        .to([els.slotIn, ...els.lines, els.count].filter(Boolean), { yPercent: -130, duration: 0.7, ease: 'expoInOut', stagger: 0.1 }, 0)
        .to(shiftTargets(), { y: 0, duration: 0.9, ease: 'expoInOut', clearProps: 'transform' }, 0);
      return tl;
    };
  }

  window.Transition = { cover, boot, pending, scramble, placeholder, reduced };
})();
