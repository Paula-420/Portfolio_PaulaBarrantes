/* ==========================================================================
   PROYECTOS — fuente única de datos para el carrusel de la home y para la
   plantilla de proyecto (proyecto.html?p=<slug>). El orden de esta lista es
   el orden del carrusel y define el "Next project" de cada página.

   Idiomas: cualquier texto puede ser 'texto' o { es: '…', en: '…' }
   (el interruptor ES / EN elige cuál se muestra; ver i18n.js).

   Media: todo sale de `npm run media` (scripts/optimize-media.mjs).
   Tipos de sección:
     { type: 'media',  size: 'narrow' | 'wide' | 'large' | 'full', ar, media, label, text }
     { type: 'double', items: [media, media], layout?: 'even' }   ('even' = dos piezas grandes lado a lado)
     { type: 'ba',     before: media, after: media }
     { type: 'window', title, video, poster, size?: 'large' }      → ventana estilo macOS con reproductor (o youtube: '<URL>')
   media = { img, srcset?, sizes?, alt? }  ó  { video, poster }
   hero.fit / media.fit: 'contain' muestra la pieza entera, sin recortar (y sin parallax)
   ========================================================================== */
window.PROJECTS = [
  {
    slug: 'pool-sessions',
    title: ['Pool', 'Sessions'],
    tag: { es: 'Rediseño web', en: 'Web redesign' },
    year: '2026',
    card: { tag: { es: 'Rediseño web · 2026', en: 'Web redesign · 2026' }, img: 'media/cards/pool-1400.webp', srcset: 'media/cards/pool-700.webp 700w, media/cards/pool-1400.webp 1400w' },
    hero: { video: 'media/pool/hero.mp4', poster: 'media/pool/hero-poster.webp', fit: 'contain', fitMobile: 'cover' }, // vertical: entero en escritorio, a pantalla completa en móvil
    link: { url: 'https://poolsessions.mx/', label: 'poolsessions.mx', logo: 'media/pool/logo.webp' }, // pegatina con enlace
    features: {
      es: ['Rediseño web', 'Dirección de arte', 'UI / UX', 'Motion & interacción', 'Desarrollo front-end', 'Mockups & social'],
      en: ['Web redesign', 'Art direction', 'UI / UX', 'Motion & interaction', 'Front-end development', 'Mockups & social']
    },
    description: {
      es: ['Pool Sessions nace como un proyecto de sesiones musicales grabadas en vivo dentro de una piscina vacía.', 'Transformamos su vacío en un escenario íntimo, lleno de música, eco y emociones compartidas.'],
      en: ['Pool Sessions began as a project of music sessions recorded live inside an empty swimming pool.', 'We turned its emptiness into an intimate stage, full of music, echo and shared emotions.']
    },
    sections: [
      { type: 'media', size: 'wide', ar: '4691 / 5863', label: { es: 'Reto', en: 'Challenge' }, sticker: true, // la pegatina va pegada sobre esta imagen
        media: { img: 'media/pool/desktop-1800.webp', srcset: 'media/pool/desktop-900.webp 900w, media/pool/desktop-1800.webp 1800w', sizes: '(min-width: 1024px) 50vw, 100vw',
                 alt: { es: 'Mockup de la nueva web de Pool Sessions en un portátil junto a una alberca', en: 'Mockup of the new Pool Sessions website on a laptop by a pool' } },
        text: {
          es: 'Cuando tomé la primera versión de la web, sentí que se quedaba muy básica. Funcionaba, pero no le hacía justicia al proyecto: lo más especial de Pool Sessions son los visuales de cada sesión (los videos, las fotos, la alberca como escenario) y en la web casi no destacaban. También le faltaba la personalidad de la marca.',
          en: 'When I picked up the first version of the website, it felt too basic. It worked, but it didn’t do the project justice: the most special thing about Pool Sessions is the visuals of every session (the videos, the photos, the pool as a stage) and on the website they barely stood out. It was also missing the brand’s personality.'
        } },
      { type: 'ba',
        before: { img: 'media/pool/antes-2880.webp', srcset: 'media/pool/antes-1440.webp 1440w, media/pool/antes-2880.webp 2880w', alt: { es: 'Home original de Pool Sessions', en: 'Original Pool Sessions homepage' } },
        after: { img: 'media/pool/despues-2880.webp', srcset: 'media/pool/despues-1440.webp 1440w, media/pool/despues-2880.webp 2880w', alt: { es: 'Home rediseñada de Pool Sessions', en: 'Redesigned Pool Sessions homepage' } } },
      { type: 'double', items: [
        { video: 'media/pool/juegos.mp4', poster: 'media/pool/juegos-poster.webp', ar: '4 / 5' },
        { img: 'media/pool/mobile-1200.webp', srcset: 'media/pool/mobile-600.webp 600w, media/pool/mobile-1200.webp 1200w', sizes: '(min-width: 1024px) 34vw, 100vw', ar: '1133 / 1388',
          alt: { es: 'Mockup móvil de la página de boletos de Pool Sessions', en: 'Mobile mockup of the Pool Sessions tickets page' } }
      ] },
      { type: 'media', size: 'narrow', ar: '4 / 5', label: { es: 'Solución', en: 'Solution' },
        media: { video: 'media/pool/instagram.mp4', poster: 'media/pool/instagram-poster.webp' },
        text: {
          es: ['Así que la convertí en una web dinámica, con transiciones y detallitos que hacen que el proyecto se sienta mucho más vivo.', 'Mi setup fue una mezcla de Visual Studio Code y la terminal Warp conectada por MCP a Claude. Ese flujo me permitió iterar rápido: probar ideas, ajustar animaciones y pulir detalles directamente en el código, sin perder el hilo del diseño.'],
          en: ['So I turned it into a dynamic website, with transitions and little details that make the project feel much more alive.', 'My setup was a mix of Visual Studio Code and the Warp terminal connected to Claude through MCP. That workflow let me iterate fast: test ideas, tweak animations and polish details directly in the code, without losing the thread of the design.']
        } }
    ]
  },
  {
    slug: 'gameboy',
    title: ['Gameboy', '3D Animation'],
    tag: { es: 'Animación 3D', en: '3D animation' },
    year: '2025',
    card: { tag: { es: 'Animación 3D · 2025', en: '3D animation · 2025' }, img: 'media/cards/gameboy-poster.webp', video: 'media/cards/gameboy.mp4' },
    hero: { video: 'media/gameboy/hero-loop.mp4', poster: 'media/gameboy/hero-loop-poster.webp' },
    features: {
      es: ['Animación 3D', 'Cinema 4D', 'Iluminación & materiales', 'Partículas', 'After Effects', 'Motion graphics'],
      en: ['3D animation', 'Cinema 4D', 'Lighting & materials', 'Particles', 'After Effects', 'Motion graphics']
    },
    description: {
      es: 'Animación 3D de una Game Boy Color: del encendido de la consola al juego, con un cierre en forma de infomercial de los 90 y 2000.',
      en: 'A 3D animation of a Game Boy Color: from switching the console on to the game itself, closing with a 90s–2000s style infomercial.'
    },
    sections: [
      // Render completo, reproducido aquí mismo (video propio, sin YouTube)
      { type: 'window', size: 'large', title: '3D_render_animation.mov', video: 'media/gameboy/render.mp4', poster: 'media/gameboy/render-poster.webp' },
      // Renders de producto — grandes, para que la página sea más visual
      { type: 'media', size: 'full', ar: '16 / 9', label: { es: 'Renders de producto', en: 'Product renders' },
        media: { img: 'media/gameboy/still-1920.webp', srcset: 'media/gameboy/still-1280.webp 1280w, media/gameboy/still-1920.webp 1920w',
                 alt: { es: 'Render de la Game Boy Color con The Mummy en pantalla y una explosión de partículas doradas', en: 'Render of the Game Boy Color showing The Mummy on screen with a burst of golden particles' } },
        text: {
          es: 'Cada plano está iluminado para resaltar el plástico amarillo, la pantalla y los stickers, con partículas y reflejos que acompañan el movimiento de la cámara.',
          en: 'Every shot is lit to bring out the yellow plastic, the screen and the stickers, with particles and reflections that follow the camera’s movement.'
        } },
      { type: 'double', layout: 'even', items: [
        { img: 'media/gameboy/angle-1354.webp', srcset: 'media/gameboy/angle-900.webp 900w, media/gameboy/angle-1354.webp 1354w', ar: '16 / 10',
          alt: { es: 'La Game Boy Color en ángulo, iluminada de lado', en: 'The Game Boy Color at an angle, side-lit' } },
        { img: 'media/gameboy/edge-1920.webp', srcset: 'media/gameboy/edge-1280.webp 1280w, media/gameboy/edge-1920.webp 1920w', ar: '16 / 10',
          alt: { es: 'Plano bajo del canto de la Game Boy Color', en: 'Low shot of the edge of the Game Boy Color' } }
      ] },
      { type: 'media', size: 'large', ar: '16 / 9', label: { es: 'Proceso', en: 'Process' },
        media: { video: 'media/gameboy/process.mp4', poster: 'media/gameboy/process-poster.webp', fit: 'contain' },
        text: {
          es: 'Partí de un modelo 3D de la Game Boy Color de CGTrader y monté y animé toda la escena en Cinema 4D: cámara, luces, materiales y partículas. En Adobe After Effects edité el título de arranque de Game Boy y la escena final, un infomercial al estilo de los 90 y 2000.',
          en: 'I started from a Game Boy Color 3D model asset from CGTrader and built and animated the whole scene in Cinema 4D: camera, lights, materials and particles. In Adobe After Effects I edited the Game Boy opening title and the final scene, a 90s–2000s style infomercial.'
        } },
      { type: 'media', size: 'large', ar: '16 / 9', label: { es: 'Infomercial', en: 'Infomercial' },
        media: { video: 'media/gameboy/ad.mp4', poster: 'media/gameboy/ad-poster.webp', fit: 'contain' },
        text: {
          es: 'La pieza cierra con un infomercial de los 90 y 2000: precio, teléfono y letra pequeña incluidos, con el mismo acabado de cinta VHS.',
          en: 'The piece closes with a 90s–2000s infomercial: price, phone number and small print included, with the same VHS tape finish.'
        } }
    ]
  },
  {
    slug: 'xxx-kendrick-lamar',
    title: ['XXX', 'Kendrick Lamar'],
    tag: 'Lyric video',
    year: '2026',
    card: { tag: 'Lyric video · Motion graphics · 2026', img: 'media/cards/kendrick-poster.webp', video: 'media/cards/kendrick.mp4' },
    hero: { video: 'media/kendrick/hero.mp4', poster: 'media/kendrick/hero-poster.webp', fit: 'contain' },
    features: {
      es: ['Lyric video', 'Tipografía cinética', 'Collage digital', 'Texto 3D', 'After Effects', 'Premiere Pro'],
      en: ['Lyric video', 'Kinetic typography', 'Digital collage', '3D text', 'After Effects', 'Premiere Pro']
    },
    description: {
      es: 'Lyric video para “XXX.” de Kendrick Lamar. Una pieza de collage digital donde la letra se rompe, se dobla como papel y se convierte en imagen para acompañar la tensión del tema.',
      en: 'A lyric video for Kendrick Lamar’s “XXX.”. A digital collage piece where the lyrics break apart, fold like paper and turn into images to match the tension of the track.'
    },
    sections: [
      // Lyric video completo, reproducido aquí mismo
      { type: 'window', size: 'large', title: 'XXX_KDot_unofficial_LV.aep', video: 'media/kendrick/full.mp4', poster: 'media/kendrick/full-poster.webp' },
      // Mismo esquema visual que Gameboy: pieza a todo el ancho, dos grandes lado a lado y proceso amplio
      { type: 'media', size: 'full', ar: '16 / 9', label: { es: 'Fotogramas', en: 'Stills' },
        media: { video: 'media/kendrick/scene.mp4', poster: 'media/kendrick/scene-poster.webp', fit: 'contain' },
        text: {
          es: 'Cada verso tiene su propia composición: papel arrugado, recortes y tipografía condensada que se arma y se rompe al ritmo de la canción.',
          en: 'Every verse has its own composition: crumpled paper, cut-outs and condensed type that builds up and breaks apart to the rhythm of the song.'
        } },
      { type: 'double', layout: 'even', items: [
        { video: 'media/kendrick/gif1.mp4', poster: 'media/kendrick/gif1-poster.webp', ar: '16 / 9', fit: 'contain' },
        { video: 'media/kendrick/gif2.mp4', poster: 'media/kendrick/gif2-poster.webp', ar: '16 / 9', fit: 'contain' }
      ] },
      { type: 'media', size: 'large', ar: '16 / 9', label: { es: 'Proceso', en: 'Process' },
        media: { video: 'media/cards/kendrick.mp4', poster: 'media/cards/kendrick-poster.webp', fit: 'contain' },
        text: {
          es: 'Construido en After Effects a partir de composiciones de papel que se despliegan, texto en 3D y recortes de imágenes de prensa. Cada bloque de la canción tiene su propio sistema visual, sincronizado con el ritmo y los cambios de intensidad del tema.',
          en: 'Built in After Effects from unfolding paper compositions, 3D text and press image cut-outs. Each block of the song has its own visual system, synced to the rhythm and the shifts in intensity of the track.'
        } }
    ]
  },
  {
    slug: 'proyectos-fotograficos',
    title: ['Photo', 'Sessions'], // título en inglés en los dos idiomas
    tag: { es: 'Fotografía · Dirección de arte', en: 'Photography · Art direction' },
    year: '2025',
    card: { tag: { es: 'Fotografía · Dirección de arte · 2025', en: 'Photography · Art direction · 2025' },
            img: 'media/fotos/whoisshe-04-1800.webp', srcset: 'media/fotos/whoisshe-04-900.webp 900w, media/fotos/whoisshe-04-1800.webp 1800w' },
    hero: { img: 'media/fotos/whoisshe-hero-2400.webp', srcset: 'media/fotos/whoisshe-hero-1600.webp 1600w, media/fotos/whoisshe-hero-2400.webp 2400w', position: '50% 22%' },
    features: {
      es: ['Fotografía', 'Retoque fotográfico', 'Dirección de arte', 'Fotografía de pasarela'],
      en: ['Photography', 'Image retouching', 'Art direction', 'Runway photography']
    },
    description: {
      es: 'Sesiones de fotografía con retoque y dirección de arte propios.',
      en: 'Photo sessions with my own retouching and art direction.'
    },
    sections: [
      // Una sesión por bloque: título + habilidades + fotos (sin texto, que hablen las piezas).
      // Para añadir otra sesión, copia este bloque con sus fotos.
      { type: 'session', title: 'Who is She?',
        skills: { es: ['Fotografía', 'Retoque fotográfico', 'Dirección de arte'], en: ['Photography', 'Image retouching', 'Art direction'] },
        images: [
          { img: 'media/fotos/whoisshe-01-1800.webp', srcset: 'media/fotos/whoisshe-01-900.webp 900w, media/fotos/whoisshe-01-1800.webp 1800w', alt: { es: 'Retrato en primer plano con pestañas pintadas en rojo y luz rosa', en: 'Close-up portrait with red painted lashes and pink light' } },
          { img: 'media/fotos/whoisshe-02-1800.webp', srcset: 'media/fotos/whoisshe-02-900.webp 900w, media/fotos/whoisshe-02-1800.webp 1800w', alt: { es: 'Retrato mirando por encima del hombro con collares de perlas', en: 'Portrait looking over the shoulder wearing pearl necklaces' } },
          { img: 'media/fotos/whoisshe-03-1800.webp', srcset: 'media/fotos/whoisshe-03-900.webp 900w, media/fotos/whoisshe-03-1800.webp 1800w', alt: { es: 'Primer plano con pestañas gráficas negras y luz azul', en: 'Close-up with black graphic lashes and blue light' } },
          { img: 'media/fotos/whoisshe-04-1800.webp', srcset: 'media/fotos/whoisshe-04-900.webp 900w, media/fotos/whoisshe-04-1800.webp 1800w', alt: { es: 'La modelo con vestido verde de lentejuelas frente a un espejo', en: 'The model in a green sequin dress in front of a mirror' } },
          { img: 'media/fotos/whoisshe-05-1800.webp', srcset: 'media/fotos/whoisshe-05-900.webp 900w, media/fotos/whoisshe-05-1800.webp 1800w', alt: { es: 'Retrato detrás de una copa de agua que deforma el rostro', en: 'Portrait behind a glass of water that distorts the face' } },
          { img: 'media/fotos/whoisshe-06-1800.webp', srcset: 'media/fotos/whoisshe-06-900.webp 900w, media/fotos/whoisshe-06-1800.webp 1800w', alt: { es: 'De espaldas con perlas, bajo luz roja', en: 'From behind with pearls, under red light' } }
        ] },
      { type: 'session', title: 'Y2K Princess',
        note: { es: 'Participante · LensCulture Photography 2024', en: 'Participant · LensCulture Photography 2024' },
        skills: { es: ['Fotografía', 'Retoque fotográfico', 'Dirección de arte'], en: ['Photography', 'Image retouching', 'Art direction'] },
        images: [
          { img: 'media/fotos/y2k-01-1800.webp', srcset: 'media/fotos/y2k-01-900.webp 900w, media/fotos/y2k-01-1800.webp 1800w', alt: { es: 'Retrato con una cámara Kodak delante del ojo sobre fondo amarillo', en: 'Portrait holding a Kodak camera over one eye against a yellow background' } },
          { img: 'media/fotos/y2k-02-1800.webp', srcset: 'media/fotos/y2k-02-900.webp 900w, media/fotos/y2k-02-1800.webp 1800w', alt: { es: 'Retrato con orejeras blancas de peluche sobre fondo azul', en: 'Portrait with white fluffy earmuffs against a blue background' } },
          { img: 'media/fotos/y2k-03-1800.webp', srcset: 'media/fotos/y2k-03-900.webp 900w, media/fotos/y2k-03-1800.webp 1800w', alt: { es: 'Retrato sosteniendo una tableta con una boca con grillz sobre fondo naranja', en: 'Portrait holding a tablet showing a mouth with grillz against an orange background' } },
          { img: 'media/fotos/y2k-04-1800.webp', srcset: 'media/fotos/y2k-04-900.webp 900w, media/fotos/y2k-04-1800.webp 1800w', alt: { es: 'Retrato con pasamontañas negro y una manzana sobre fondo verde', en: 'Portrait in a black balaclava with an apple against a green background' } },
          { img: 'media/fotos/y2k-05-1800.webp', srcset: 'media/fotos/y2k-05-900.webp 900w, media/fotos/y2k-05-1800.webp 1800w', alt: { es: 'Retrato con gafas naranjas y pegatinas en la cara sobre fondo rosa', en: 'Portrait with orange glasses and face stickers against a pink background' } }
        ] },
      { type: 'session', title: 'Mercedes Fashion Week 2025',
        skills: { es: ['Fotografía de pasarela'], en: ['Runway photography'] },
        images: [
          { img: 'media/fotos/mbfw-01-1600.webp', srcset: 'media/fotos/mbfw-01-900.webp 900w, media/fotos/mbfw-01-1600.webp 1600w', alt: { es: 'Modelo de espaldas con prenda blanca deshilachada y pelo mojado', en: 'Model from behind in a frayed white garment with wet hair' } },
          { img: 'media/fotos/mbfw-02-1600.webp', srcset: 'media/fotos/mbfw-02-900.webp 900w, media/fotos/mbfw-02-1600.webp 1600w', alt: { es: 'Perfil de una modelo con top de tiras de tela cruda', en: 'Profile of a model in a top made of raw fabric strips' } },
          { img: 'media/fotos/mbfw-03-1600.webp', srcset: 'media/fotos/mbfw-03-900.webp 900w, media/fotos/mbfw-03-1600.webp 1600w', alt: { es: 'Modelo con capucha y top verde lima frente al público', en: 'Model in a hood and lime green top in front of the audience' } },
          { img: 'media/fotos/mbfw-04-1600.webp', srcset: 'media/fotos/mbfw-04-900.webp 900w, media/fotos/mbfw-04-1600.webp 1600w', alt: { es: 'Modelo con blusa de estampado floral y corsé rojo', en: 'Model in a floral print blouse and red corset' } },
          { img: 'media/fotos/mbfw-05-1600.webp', srcset: 'media/fotos/mbfw-05-900.webp 900w, media/fotos/mbfw-05-1600.webp 1600w', alt: { es: 'Perfil con velo de brocado dorado y drapeado blanco', en: 'Profile with a gold brocade veil and white draping' } },
          { img: 'media/fotos/mbfw-06-1600.webp', srcset: 'media/fotos/mbfw-06-900.webp 900w, media/fotos/mbfw-06-1600.webp 1600w', alt: { es: 'Modelo con corsé gris y cuello de encaje en la pasarela', en: 'Model in a grey corset with a lace collar on the runway' } },
          { img: 'media/fotos/mbfw-07-1600.webp', srcset: 'media/fotos/mbfw-07-900.webp 900w, media/fotos/mbfw-07-1600.webp 1600w', alt: { es: 'Perfil con abrigo negro cubierto de cruces plateadas', en: 'Profile in a black coat covered in silver crosses' } }
        ] }
    ]
  },
  {
    slug: 'filip-custic',
    title: ['Filip Custic', 'Selekted Bilbao'],
    tag: { es: 'Diseño de una exposición', en: 'Exhibition design' },
    year: '2025',
    card: { tag: { es: 'Dirección de arte · 2025', en: 'Art direction · 2025' }, img: 'media/cards/filip-1400.webp', srcset: 'media/cards/filip-700.webp 700w, media/cards/filip-1400.webp 1400w' },
    hero: { img: 'media/filip/hero-2400.webp', srcset: 'media/filip/hero-1600.webp 1600w, media/filip/hero-2400.webp 2400w' },
    features: { es: ['Dirección de arte'], en: ['Art direction'] },
    description: {
      es: 'Diseño de una exposición para Filip Custic / Selekted Bilbao: “pq hacemos lo que hacemos?”. Identidad, catálogo, cartel y espacio expositivo para su obra, que cruza cuerpo, imagen y tecnología.',
      en: 'Exhibition design for Filip Custic / Selekted Bilbao: “pq hacemos lo que hacemos?”. Identity, catalogue, poster and exhibition space for his work, which brings together body, image and technology.'
    },
    sections: [
      { type: 'media', size: 'full', ar: '2303 / 1294', label: { es: 'Espacio expositivo', en: 'Exhibition space' },
        media: { img: 'media/filip/sala-2303.webp', srcset: 'media/filip/sala-1400.webp 1400w, media/filip/sala-2303.webp 2303w', ar: '2303 / 1294', alt: { es: 'Render de la sala principal con el retrato doble, pantallas y cables', en: 'Render of the main room with the double portrait, screens and cables' } } },
      { type: 'double', layout: 'even', items: [
        { img: 'media/filip/sala-pantallas-2000.webp', srcset: 'media/filip/sala-pantallas-1000.webp 1000w, media/filip/sala-pantallas-2000.webp 2000w', ar: '16 / 9', alt: { es: 'Render de la instalación de pantallas y cables frente al retrato doble', en: 'Render of the screens-and-cables installation in front of the double portrait' } },
        { img: 'media/filip/sala-bolso-2000.webp', srcset: 'media/filip/sala-bolso-1000.webp 1000w, media/filip/sala-bolso-2000.webp 2000w', ar: '16 / 9', alt: { es: 'Render de una pieza expuesta sobre un pedestal blanco', en: 'Render of a piece displayed on a white plinth' } }
      ] },
      { type: 'media', size: 'large', ar: '4870 / 3247', label: { es: 'Cartel', en: 'Poster' },
        media: { img: 'media/filip/cartel-2400.webp', srcset: 'media/filip/cartel-1400.webp 1400w, media/filip/cartel-2400.webp 2400w', ar: '4870 / 3247', alt: { es: 'Cartel de la exposición en una parada de autobús', en: 'Exhibition poster at a bus stop' } } },
      { type: 'double', layout: 'even', items: [
        { img: 'media/filip/catalogo-1993-2000.webp', srcset: 'media/filip/catalogo-1993-1000.webp 1000w, media/filip/catalogo-1993-2000.webp 2000w', ar: '16 / 9', alt: { es: 'Catálogo abierto por la doble página 1993 Tenerife', en: 'Catalogue open on the 1993 Tenerife spread' } },
        { img: 'media/filip/catalogo-trayectoria-2000.webp', srcset: 'media/filip/catalogo-trayectoria-1000.webp 1000w, media/filip/catalogo-trayectoria-2000.webp 2000w', ar: '16 / 9', alt: { es: 'Catálogo abierto por la línea de tiempo de su trayectoria', en: 'Catalogue open on the career timeline spread' } }
      ] },
      { type: 'double', layout: 'even', items: [
        { img: 'media/filip/libro-2000.webp', srcset: 'media/filip/libro-1000.webp 1000w, media/filip/libro-2000.webp 2000w', ar: '4 / 3', alt: { es: 'Catálogo cerrado con la portada de Filip Custic', en: 'Closed catalogue with the Filip Custic cover' } },
        { img: 'media/filip/estuche-2000.webp', srcset: 'media/filip/estuche-1000.webp 1000w, media/filip/estuche-2000.webp 2000w', ar: '3 / 2', alt: { es: 'Estuche y libro con especificaciones de papel y acabado', en: 'Slipcase and book with paper and finish specifications' } }
      ] },
      { type: 'media', size: 'wide', ar: '1124 / 638', label: 'Selekted Bilbao-Bizkaia 2025',
        media: { img: 'media/filip/new-talents-1124.webp', alt: { es: 'New Talents Award, Selekted Bilbao-Bizkaia 2025', en: 'New Talents Award, Selekted Bilbao-Bizkaia 2025' } },
        text: { es: 'Proyecto nominado en Selekted Bilbao-Bizkaia 2025, en la categoría New Talents Award.', en: 'Project nominated at Selekted Bilbao-Bizkaia 2025, in the New Talents Award category.' } },
      { type: 'story',
        note: 'Selekted Bilbao-Bizkaia 2025 · New Talents',
        title: { es: 'Nominada en Selekted Bilbao', en: 'Nominated at Selekted Bilbao' },
        link: { label: '@filipcustic', url: 'https://www.instagram.com/filipcustic/' },
        paragraphs: {
          es: [
            'Mi proyecto “Dirección de arte para una exposición para Filip Custic” fue nominado en Selekted Bilbao-Bizkaia 2025 y publicado en su catálogo.',
            'La exposición “pq hacemos lo q hacemos” de Filip Custic explora la relación entre el cuerpo, la identidad y la tecnología en la era digital. Este proyecto presenta el diseño y la maquetación del catálogo de la exposición, así como la identidad visual aplicada a la sala y sus elementos gráficos.',
            'El objetivo es crear una experiencia visual coherente que complemente la obra del artista, integrando diseño, señalética y comunicación en un concepto unificado.',
            'Los mockups de la sala principal de lo que sería la exposición de Filip Custic están hechos por mí en Maxon Cinema 4D.'
          ],
          en: [
            'My project “Art direction for a Filip Custic exhibition” was nominated at Selekted Bilbao-Bizkaia 2025 and published in its catalogue.',
            'Filip Custic’s exhibition “pq hacemos lo q hacemos” explores the relationship between body, identity and technology in the digital age. This project presents the design and layout of the exhibition catalogue, as well as the visual identity applied to the room and its graphic elements.',
            'The goal is to create a coherent visual experience that complements the artist’s work, bringing design, wayfinding and communication together in one unified concept.',
            'The mockups of the main room of what the Filip Custic exhibition would look like were made by me in Maxon Cinema 4D.'
          ]
        },
        images: [
          { img: 'media/filip/selekted-escenario-1800.webp', srcset: 'media/filip/selekted-escenario-900.webp 900w, media/filip/selekted-escenario-1800.webp 1800w', ar: '3 / 4', alt: { es: 'María Paula en el escenario de Selekted Bilbao 2025, con su proyecto en pantalla', en: 'María Paula on the Selekted Bilbao 2025 stage, with her project on screen' } },
          { img: 'media/filip/selekted-catalogo-1800.webp', srcset: 'media/filip/selekted-catalogo-900.webp 900w, media/filip/selekted-catalogo-1800.webp 1800w', ar: '3 / 4', alt: { es: 'El proyecto publicado en el catálogo de Selekted Bilbao 2025', en: 'The project published in the Selekted Bilbao 2025 catalogue' } }
        ] }
    ]
  }
];
