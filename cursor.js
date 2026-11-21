/* Pink ball cursor — follows the pointer with a soft lag, grows over anything clickable.
   Only on devices with a real mouse; touch devices keep their normal behaviour. */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('has-ball');

  const ball = document.createElement('div');
  ball.className = 'ball';
  ball.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ball);

  const HOT = 'a, button, [role="switch"], input, .card, .works, [data-ba], [data-sticker], .mac-window__play, video[controls], .p-next__media';
  const lag = reduced ? 0.01 : 0.18;
  const xTo = gsap.quickTo(ball, 'x', { duration: lag, ease: 'power3.out' });
  const yTo = gsap.quickTo(ball, 'y', { duration: lag, ease: 'power3.out' });
  gsap.set(ball, { xPercent: -50, yPercent: -50, scale: 0 });

  let shown = false, hot = false;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    if (!shown) { gsap.set(ball, { x: e.clientX, y: e.clientY }); gsap.to(ball, { scale: 1, duration: 0.3, ease: 'expoOut' }); shown = true; }
    xTo(e.clientX); yTo(e.clientY);
    const isHot = !!e.target.closest?.(HOT);
    if (isHot !== hot) { hot = isHot; ball.classList.toggle('is-hot', hot); }
  }, { passive: true });
  addEventListener('pointerdown', () => gsap.to(ball, { scale: 0.7, duration: 0.15, ease: 'power2.out' }));
  addEventListener('pointerup', () => gsap.to(ball, { scale: 1, duration: 0.4, ease: 'expoOut' }));
  document.documentElement.addEventListener('mouseleave', () => { gsap.to(ball, { scale: 0, duration: 0.25 }); shown = false; });
})();
