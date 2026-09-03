(() => {
  'use strict';

  const body = document.body;
  const preloader = document.querySelector('.preloader');
  const preloaderCount = document.querySelector('.preloader__count');
  const preloaderLine = document.querySelector('.preloader__line span');
  const cursor = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor__ring');
  const progressBar = document.querySelector('.scroll-progress span');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuPanel = document.querySelector('.menu-panel');
  const menuClose = document.querySelector('.menu-close');
  const menuLinks = document.querySelectorAll('.menu-panel__nav a');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  body.classList.add('is-loading');

  // Intro counter + curtain reveal.
  const runPreloader = () => {
    if (reducedMotion) {
      body.classList.remove('is-loading');
      body.classList.add('is-ready');
      preloader?.remove();
      return;
    }

    const duration = 1450;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(eased * 100);

      if (preloaderCount) {
        preloaderCount.textContent = String(value).padStart(3, '0');
      }

      if (preloaderLine) {
        preloaderLine.style.width = `${value}%`;
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          preloader?.classList.add('is-complete');
          body.classList.remove('is-loading');
          body.classList.add('is-ready');

          setTimeout(() => {
            preloader?.remove();
          }, 1150);
        }, 180);
      }
    };

    requestAnimationFrame(tick);
  };

  if (document.readyState === 'complete') {
    runPreloader();
  } else {
    window.addEventListener('load', runPreloader, { once: true });
  }

  // Custom cursor.
  if (
    cursor &&
    window.matchMedia('(pointer: fine)').matches &&
    !reducedMotion
  ) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      cursor.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;

      cursorRing.style.transform =
        `translate3d(${ringX - mouseX}px, ${ringY - mouseY}px, 0)
         translate(-50%, -50%)`;

      requestAnimationFrame(renderCursor);
    };

    renderCursor();

    document.querySelectorAll('a, button').forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursor.classList.add('is-link');
      });

      element.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-link');
      });
    });

    document.querySelectorAll('.cursor-view').forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursor.classList.add('is-view');
      });

      element.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-view');
      });
    });
  }

  // Magnetic buttons and links.
  if (
    !reducedMotion &&
    window.matchMedia('(pointer: fine)').matches
  ) {
    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left -
          rect.width / 2;

        const y =
          event.clientY -
          rect.top -
          rect.height / 2;

        element.style.transform =
          `translate3d(${x * 0.16}px, ${y * 0.22}px, 0)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate3d(0,0,0)';
        element.style.transition =
          'transform .55s cubic-bezier(.22,1,.36,1)';

        setTimeout(() => {
          element.style.transition = '';
        }, 560);
      });
    });
  }

  // Scroll progress + hero movement.
  const heroTitle = document.querySelector('.hero__title');

  const onScroll = () => {
    const max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const ratio =
      max > 0
        ? window.scrollY / max
        : 0;

    if (progressBar) {
      progressBar.style.width =
        `${ratio * 100}%`;
    }

    if (heroTitle && !reducedMotion) {
      const y =
        Math.min(
          window.scrollY,
          window.innerHeight
        );

      heroTitle.style.transform =
        `translate3d(-.35vw, ${y * 0.105}px, 0)
         scale(${1 - y * 0.000035})`;

      heroTitle.style.opacity =
        String(
          Math.max(
            0.14,
            1 -
            y /
            (window.innerHeight * 0.92)
          )
        );
    }
  };

  window.addEventListener(
    'scroll',
    onScroll,
    { passive: true }
  );

  onScroll();

  // Reveal animations on scroll.
  const revealItems =
    document.querySelectorAll('.reveal');

  if (
    'IntersectionObserver' in window &&
    !reducedMotion
  ) {
    const observer =
      new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -12% 0px',
          threshold: 0.08
        }
      );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });
  }

  // Image parallax.
  if (
    !reducedMotion &&
    window.matchMedia('(pointer: fine)').matches
  ) {
    document
      .querySelectorAll(
        '.project-tile, .studio__visual'
      )
      .forEach((frame) => {
        const media =
          frame.querySelector('.parallax-media');

        if (!media) return;

        frame.addEventListener(
          'mousemove',
          (event) => {
            const rect =
              frame.getBoundingClientRect();

            const px =
              (event.clientX - rect.left) /
              rect.width -
              0.5;

            const py =
              (event.clientY - rect.top) /
              rect.height -
              0.5;

            media.style.transform =
              `translate3d(
                ${px * 14}px,
                ${py * 14}px,
                0
              ) scale(1.015)`;
          }
        );

        frame.addEventListener(
          'mouseleave',
          () => {
            media.style.transition =
              'transform .8s cubic-bezier(.22,1,.36,1)';

            media.style.transform =
              'translate3d(0,0,0) scale(1)';

            setTimeout(() => {
              media.style.transition = '';
            }, 820);
          }
        );
      });
  }

  // Floating project preview.
  if (
    window.matchMedia('(pointer: fine)').matches
  ) {
    document
      .querySelectorAll('.work-row')
      .forEach((row) => {
        const preview =
          row.querySelector(
            '.work-row__preview'
          );

        if (!preview) return;

        row.addEventListener(
          'mousemove',
          (event) => {
            const x = Math.min(
              window.innerWidth -
              preview.offsetWidth * 0.56,
              Math.max(
                preview.offsetWidth * 0.56,
                event.clientX
              )
            );

            const y = Math.min(
              window.innerHeight -
              preview.offsetHeight * 0.56,
              Math.max(
                preview.offsetHeight * 0.56,
                event.clientY
              )
            );

            preview.style.left = `${x}px`;
            preview.style.top = `${y}px`;
          }
        );
      });
  }

  // Full-screen menu.
  const setMenu = (open) => {
    menuPanel?.classList.toggle(
      'is-open',
      open
    );

    menuPanel?.setAttribute(
      'aria-hidden',
      String(!open)
    );

    menuToggle?.setAttribute(
      'aria-expanded',
      String(open)
    );

    body.classList.toggle(
      'menu-open',
      open
    );
  };

  menuToggle?.addEventListener(
    'click',
    () => setMenu(true)
  );

  menuClose?.addEventListener(
    'click',
    () => setMenu(false)
  );

  menuLinks.forEach((link) => {
    link.addEventListener(
      'click',
      () => setMenu(false)
    );
  });

  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape') {
        setMenu(false);
      }
    }
  );

  // Back to top.
  document
    .querySelector('.back-to-top')
    ?.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior:
          reducedMotion
            ? 'auto'
            : 'smooth'
      });
    });
    // Client name switcher.
    const clientSwitcher =
      document.querySelector('#client-switcher');
    
    if (clientSwitcher) {
      const clients = [
        'Mahou',
        'Movistar',
        'Vivagym',
        'Carrefour',
        'Ikea'
      ];
    
      let clientIndex = 0;
    
      const changeClient = () => {
        clientSwitcher.classList.add('is-changing');
    
        setTimeout(() => {
          clientIndex =
            (clientIndex + 1) % clients.length;
    
          clientSwitcher.textContent =
            clients[clientIndex];
    
          clientSwitcher.classList.remove('is-changing');
        }, 120);
      };
    
      setInterval(changeClient, 1400);
    }
    
    // Workplace name switcher.
const workplaceSwitcher =
  document.querySelector('#workplace-switcher');

if (workplaceSwitcher) {
  const workplaces = [
    'McCann Worldgroup',
    'Super Real',
    'Coonic'
  ];

  let workplaceIndex = 0;

  const changeWorkplace = () => {
    workplaceSwitcher.classList.add(
      'is-changing-workplace'
    );

    setTimeout(() => {
      workplaceIndex =
        (workplaceIndex + 1) % workplaces.length;

      workplaceSwitcher.textContent =
        workplaces[workplaceIndex];

      workplaceSwitcher.classList.remove(
        'is-changing-workplace'
      );
    }, 180);
  };

  setInterval(changeWorkplace, 1600);
}
})();
