/* ==========================================================================
   i18n — ES / EN switch for the whole site.
   - Text in projects.js can be a plain string or { es, en }  → I18N.t(value)
   - Static HTML: data-i18n="key" (text) or data-i18n-html="key" (with markup)
   - The chosen language is remembered (localStorage) and fires `langchange`.
   ========================================================================== */
(() => {
  const KEY = 'mp-lang';
  const DICT = {
    es: {
      'meta.description': 'María Paula Barrantes — Motion & Graphic Designer en Madrid.',
      'menu.works': 'Proyectos', 'menu.about': 'Sobre mí', 'menu.talk': 'Hablemos',
      'identity.lead': 'Diseñadora gráfica multidisciplinar basada en Madrid, curiosa por el <em>motion</em> y el diseño desde 2019. Transformo ideas en historias visuales en movimiento a través de motion graphics, edición, dirección de arte e IA.',
      'about.title': '¿Quién es <em>María Paula</em>?',
      'about.lead': 'Motion Designer y Editora de Video basada en Madrid, combinando diseño gráfico, dirección de arte y flujos de trabajo asistidos por IA para crear historias visuales en movimiento.',
      'about.body': 'Trabajo entre motion graphics, edición, diseño visual y experimentación con imagen, adaptando cada proyecto a su contexto, ritmo y necesidades creativas. Disfruto construir ideas junto a otras personas, compartir perspectivas y mejorar el trabajo a través del feedback.',
      'about.caption': '* IMAGEN GENERADA CON IA',
      'skill.1': 'AI & Prompting', 'skill.2': 'Dirección de arte', 'skill.3': 'Motion graphics',
      'skill.4': 'Edición de video', 'skill.5': 'Fotografía & retoque', 'skill.6': 'Web Design - Front end',
      'cta.talk': 'Hablemos ↗', 'close': 'CERRAR ×',
      // project template
      'p.features': 'Qué hice', 'p.description': 'Descripción', 'p.next': 'Siguiente proyecto',
      'p.ba': 'Antes / Después', 'p.ba.hint': 'Arrastra para comparar', 'p.ba.before': 'ANTES · ORIGINAL', 'p.ba.after': 'DESPUÉS · REDISEÑO',
      'p.visit': 'VISITAR LA WEB', 'p.play': 'Reproducir', 'p.soon': 'Video disponible pronto',
      'toggle.label': 'Cambiar idioma a inglés'
    },
    en: {
      'meta.description': 'María Paula Barrantes — Motion & Graphic Designer based in Madrid.',
      'menu.works': 'Works', 'menu.about': 'About', 'menu.talk': 'Let’s talk',
      'identity.lead': 'Multidisciplinary graphic designer based in Madrid, curious about <em>motion</em> and design since 2019. I turn ideas into visual stories in motion through motion graphics, editing, art direction and AI.',
      'about.title': 'Who is <em>María Paula</em>?',
      'about.lead': 'Motion Designer and Video Editor based in Madrid, combining graphic design, art direction and AI-assisted workflows to create visual stories in motion.',
      'about.body': 'I work across motion graphics, editing, visual design and image experimentation, adapting each project to its context, rhythm and creative needs. I enjoy building ideas with other people, sharing perspectives and improving the work through feedback.',
      'about.caption': '* AI GENERATED IMAGE',
      'skill.1': 'AI & Prompting', 'skill.2': 'Art direction', 'skill.3': 'Motion graphics',
      'skill.4': 'Video editing', 'skill.5': 'Photography & retouching', 'skill.6': 'Web Design - Front end',
      'cta.talk': 'Let’s talk ↗', 'close': 'CLOSE ×',
      'p.features': 'Features', 'p.description': 'Description', 'p.next': 'Next project',
      'p.ba': 'Before / After', 'p.ba.hint': 'Drag to compare', 'p.ba.before': 'BEFORE · ORIGINAL', 'p.ba.after': 'AFTER · REDESIGN',
      'p.visit': 'VISIT THE WEBSITE', 'p.play': 'Play', 'p.soon': 'Video coming soon',
      'toggle.label': 'Switch language to Spanish'
    }
  };

  let lang = 'es';
  try { const saved = localStorage.getItem(KEY); if (saved === 'en' || saved === 'es') lang = saved; } catch (e) {}

  const I18N = {
    get lang() { return lang; },
    /** value can be a string, { es, en }, or an array of either */
    t(v) {
      if (v == null) return v;
      if (Array.isArray(v)) return v.map(x => I18N.t(x));
      if (typeof v === 'object' && ('es' in v || 'en' in v)) return v[lang] ?? v.es ?? v.en;
      return v;
    },
    s(key) { return DICT[lang][key] ?? DICT.es[key] ?? key; },
    set(next) {
      if (next === lang) return;
      lang = next;
      try { localStorage.setItem(KEY, lang); } catch (e) {}
      apply();
      dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }
  };

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = I18N.s(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = I18N.s(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', I18N.s(el.dataset.i18nAria)));
    const meta = document.querySelector('meta[name="description"][data-i18n-meta]');
    if (meta) meta.content = I18N.s('meta.description');
    const tg = document.querySelector('[data-lang-toggle]');
    if (tg) { tg.setAttribute('aria-checked', String(lang === 'en')); tg.setAttribute('aria-label', I18N.s('toggle.label')); }
  }

  // on/off switch, injected on every page
  function mountToggle() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-toggle';
    b.setAttribute('role', 'switch');
    b.dataset.langToggle = '';
    b.innerHTML = '<span class="lang-toggle__opt" aria-hidden="true">ES</span><span class="lang-toggle__track" aria-hidden="true"><span class="lang-toggle__knob"></span></span><span class="lang-toggle__opt" aria-hidden="true">EN</span>';
    b.addEventListener('click', () => I18N.set(lang === 'en' ? 'es' : 'en'));
    document.body.appendChild(b);
  }

  window.I18N = I18N;
  const init = () => { mountToggle(); apply(); };
  // loaded at the end of <body>: the static HTML is already parsed, so translate it right away
  document.body ? init() : document.addEventListener('DOMContentLoaded', init);
  // apply as early as possible for text present in the HTML (avoid a flash of the other language)
  document.documentElement.lang = lang;
})();
