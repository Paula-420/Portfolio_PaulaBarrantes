#!/usr/bin/env node
/**
 * optimize-media.mjs — genera los archivos web del portafolio a partir de los originales.
 *
 *   npm install          (una vez: instala sharp + ffmpeg-static)
 *   npm run media        (solo regenera lo que falta o cuyo original cambió)
 *   npm run media:force  (regenera todo)
 *
 * Imágenes → WebP calidad 85, en dos anchos (1x y 2x para Retina) para usar con srcset.
 * Videos   → MP4 H.264 (High, yuv420p, CRF 20, preset slow), SIN audio (salvo `audio: true` → AAC 128k), con +faststart
 *            para que empiecen a reproducirse antes de descargarse enteros.
 *            Cada video genera además un póster WebP (primer fotograma útil).
 *
 * Nunca se amplía por encima de la resolución del original: si el original es pequeño
 * (p. ej. un GIF de 332 px), el script lo avisa — esa pieza necesita un original mejor.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'media');
const FORCE = process.argv.includes('--force');

/* Originales que viven fuera del proyecto (demasiado pesados para copiarlos). */
const EXTERNAL = {
  kendrickFinal: '/Users/mariapaula/Library/CloudStorage/OneDrive-MediaInvestmentOptimizationS.A/PERSONAL/PORTFOLIO_WEB/After/Lyric Video V2/XXX_lyricsV2FINAL.mp4',
  gameboyRender: '/Users/mariapaula/Library/CloudStorage/OneDrive-MediaInvestmentOptimizationS.A/PERSONAL/OneDrive UDIT/3d nintendo/20251212_155458000_iOS.MP4',
  gameboyAd: '/Users/mariapaula/Library/CloudStorage/OneDrive-MediaInvestmentOptimizationS.A/PERSONAL/OneDrive UDIT/3d nintendo/20251212_151026000_iOS.MP4'
};

/* ------------------------------------------------------------------ *
 * QUÉ SE GENERA
 * widths = [1x, 2x] en píxeles reales, pensados para el tamaño en que
 * se muestra cada pieza en una pantalla de 1440 px de ancho.
 * ------------------------------------------------------------------ */
const IMAGES = [
  // Tarjeta del carrusel (≈ 30vw + parallax/zoom ≈ 630 px CSS)
  { src: 'Imgs/Pool Sessions/DesktopMockup-original.jpg', out: 'cards/pool', widths: [700, 1400] },
  // Página de Pool Sessions
  { src: 'Imgs/Pool Sessions/DesktopMockup-original.jpg', out: 'pool/desktop', widths: [900, 1800] },
  { src: 'Imgs/Pool Sessions/MobileMockup.jpg', out: 'pool/mobile', widths: [600, 1200] },
  { src: 'Imgs/Pool Sessions/antes-home@2x.png', out: 'pool/antes', widths: [1440, 2880] },
  { src: 'Imgs/Pool Sessions/despues-home@2x.png', out: 'pool/despues', widths: [1440, 2880] },
  // Gameboy — fotograma fijo para el hero (1920 es el máximo del original)
  { src: 'Imgs/Gameboy 3D Animation/20251212_182347710_iOS.jpg', out: 'gameboy/still', widths: [1280, 1920] },
  // Gameboy — renders de producto (galería grande)
  { src: 'Imgs/Gameboy 3D Animation/20251212_182351766_iOS.jpg', out: 'gameboy/angle', widths: [900, 1354] },
  { src: 'Imgs/Gameboy 3D Animation/20251212_182421416_iOS.jpg', out: 'gameboy/edge', widths: [1280, 1920] },
  // Proyectos fotográficos — sesión "Who is She?" (originales 4000×6000)
  { src: 'Imgs/Proyectos fotográficos/Who is She/01.jpg', out: 'fotos/whoisshe-hero', widths: [1600, 2400] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/01.jpg', out: 'fotos/whoisshe-01', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/02.jpg', out: 'fotos/whoisshe-02', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/03.jpg', out: 'fotos/whoisshe-03', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/04.jpg', out: 'fotos/whoisshe-04', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/05.jpg', out: 'fotos/whoisshe-05', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Who is She/06.jpg', out: 'fotos/whoisshe-06', widths: [900, 1800] },
  // Proyectos fotográficos — sesión "Y2K Princess" (originales 4000×6000)
  { src: 'Imgs/Proyectos fotográficos/Y2K Princess/1.PNG', out: 'fotos/y2k-01', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Y2K Princess/2.PNG', out: 'fotos/y2k-02', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Y2K Princess/3.PNG', out: 'fotos/y2k-03', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Y2K Princess/4.PNG', out: 'fotos/y2k-04', widths: [900, 1800] },
  { src: 'Imgs/Proyectos fotográficos/Y2K Princess/5.PNG', out: 'fotos/y2k-05', widths: [900, 1800] },
  // Proyectos fotográficos — "Mercedes Fashion Week 2025" (originales 4000×6000)
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4488.png', out: 'fotos/mbfw-01', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4495.png', out: 'fotos/mbfw-02', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4562.png', out: 'fotos/mbfw-03', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4573.png', out: 'fotos/mbfw-04', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4657.png', out: 'fotos/mbfw-05', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4711.png', out: 'fotos/mbfw-06', widths: [900, 1600], quality: 74 },
  { src: 'Imgs/Proyectos fotográficos/MERCEDES BENZ FW/IMG_4773.png', out: 'fotos/mbfw-07', widths: [900, 1600], quality: 74 },
  // Filip Custic / Selekted Bilbao — diseño de exposición
  { src: 'Imgs/Filip Custic/portada_contraportada.jpg', out: 'filip/hero', widths: [1600, 2400] },
  { src: 'Imgs/Filip Custic/libro_front.jpg', out: 'cards/filip', widths: [700, 1400] },
  { src: 'Imgs/Filip Custic/RENDER_SALA_PRINCIPAL2.jpg', out: 'filip/sala', widths: [1400, 2303] },
  { src: 'Imgs/Filip Custic/RENDER_SALA_PRINCIPAL_CLOSEUP3.jpg', out: 'filip/sala-pantallas', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/RENDER_SALA_PRINCIPAL_CLOSEUP.jpg', out: 'filip/sala-bolso', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/MOCKUP CARTEL.jpg', out: 'filip/cartel', widths: [1400, 2400] },
  { src: 'Imgs/Filip Custic/abierto 3.jpg', out: 'filip/catalogo-1993', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/abierto6.jpg', out: 'filip/catalogo-trayectoria', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/libro_front.jpg', out: 'filip/libro', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/mockup libro slipcase.jpg', out: 'filip/estuche', widths: [1000, 2000] },
  { src: 'Imgs/Filip Custic/newtalents.png', out: 'filip/new-talents', widths: [1124] },
  { src: 'Imgs/Filip Custic/IMG_3837.jpg', out: 'filip/selekted-escenario', widths: [900, 1800] },
  { src: 'Imgs/Filip Custic/IMG_3795.jpg', out: 'filip/selekted-catalogo', widths: [900, 1800] },
  // About
  { src: 'Imgs/About me/Sticker Face Collage.png', out: 'about', widths: [700, 1400] }
];

const VIDEOS = [
  // Hero de Pool Sessions (se muestra a pantalla completa → el máximo que dé el original)
  { src: 'Imgs/Pool Sessions/MainSections.mp4', out: 'pool/hero', width: 2160, crf: 23 },
  { src: 'Imgs/Pool Sessions/JuegosMockup.mp4', out: 'pool/juegos', width: 1200, crf: 21 },
  { src: 'Imgs/Pool Sessions/Scene-Instagram-4x5.mp4', out: 'pool/instagram', width: 1200, crf: 21 },
  // Gameboy: render completo para verlo en la ventana (CON audio)
  { src: EXTERNAL.gameboyRender, out: 'gameboy/render', width: 1920, crf: 27, audio: true, posterAt: 18 },
  // Gameboy: título de arranque (After Effects) para el bloque Process
  { src: EXTERNAL.gameboyRender, out: 'gameboy/process', width: 1920, crf: 26, start: 2, duration: 10, posterAt: 4 },
  // Gameboy: hero en bucle (planos de la consola del render, sin audio)
  { src: EXTERNAL.gameboyRender, out: 'gameboy/hero-loop', width: 1920, crf: 26, start: 14, duration: 10, posterAt: 4 },
  // Kendrick: lyric video completo para verlo en la ventana (CON audio)
  // Kendrick: escena 1080p a todo el ancho ("I mix it with American blood")
  { src: EXTERNAL.kendrickFinal, out: 'kendrick/scene', width: 1920, crf: 26, start: 47, duration: 4.5, posterAt: 2.5 },
  { src: EXTERNAL.kendrickFinal, out: 'kendrick/full', width: 1920, crf: 28, audio: true, posterAt: 15 },
  // Gameboy: anuncio retro en bucle (del MP4 1080p, no del GIF de 400 px)
  { src: EXTERNAL.gameboyAd, fallback: 'Imgs/Gameboy 3D Animation/20251212_151026000_iOS.gif', out: 'gameboy/ad', width: 1400, crf: 28, start: 0, duration: 10, posterAt: 2 },
  // Tarjetas del carrusel
  { src: 'Imgs/Gameboy 3D Animation/20251212_183027000_iOS1-ezgif.com-video-to-gif-converter.gif', out: 'cards/gameboy', width: 1400, crf: 24 },
  // Kendrick: recorte del video final 1080p en vez del GIF (ajusta start/duration a tu gusto)
  { src: EXTERNAL.kendrickFinal, fallback: 'Imgs/Lyric Video - XXX Kendrick Lamar/gif3.gif', out: 'cards/kendrick', width: 1400, crf: 24, start: 28, duration: 9 },
  { src: 'Imgs/Proyectos fotográficos/Mercedesbenz.gif', out: 'cards/fotografia', width: 1400, crf: 22 },
  // Página de Kendrick: hero desde el video final 1080p + los otros dos GIF
  { src: EXTERNAL.kendrickFinal, fallback: 'Imgs/Lyric Video - XXX Kendrick Lamar/gif2.gif', out: 'kendrick/hero', width: 1920, crf: 28, start: 12, duration: 10 },
  { src: 'Imgs/Lyric Video - XXX Kendrick Lamar/gif 1.gif', out: 'kendrick/gif1', width: 1400, crf: 22 },
  { src: 'Imgs/Lyric Video - XXX Kendrick Lamar/gif2.gif', out: 'kendrick/gif2', width: 1400, crf: 22 }
];

/* Logos: se quita el fondo liso y queda solo el trazo claro, con transparencia,
   en el color indicado (para usarlos encima de otras piezas, p. ej. la pegatina). */
const LOGOS = [
  { src: 'Imgs/Pool Sessions/logo-pool-sessions.png', out: 'pool/logo', width: 900, color: [233, 242, 214] }
];

/* ------------------------------------------------------------------ */
const abs = p => (p.startsWith('/') ? p : resolve(ROOT, p));
const rel = p => relative(ROOT, p);
const kb = p => Math.round(statSync(p).size / 1024) + ' KB';
const ensureDir = p => mkdirSync(dirname(p), { recursive: true });
const fresh = (src, out) => !FORCE && existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;
const warnings = [];

function pickSource(job) {
  if (existsSync(abs(job.src))) return { path: abs(job.src), trimmed: true };
  if (job.fallback && existsSync(abs(job.fallback))) {
    warnings.push(`${job.out}: no encuentro ${job.src}, uso ${job.fallback}`);
    return { path: abs(job.fallback), trimmed: false };
  }
  throw new Error(`Falta el original de ${job.out}: ${job.src}`);
}

function run(args) {
  return new Promise((ok, fail) => {
    const p = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
    let err = '';
    p.stderr.on('data', d => (err += d));
    p.on('close', code => (code === 0 ? ok() : fail(new Error(err || `ffmpeg salió con ${code}`))));
  });
}

async function probeWidth(file) {
  // ffmpeg -i sin salida imprime la info del stream en stderr
  return new Promise(ok => {
    const p = spawn(ffmpegPath, ['-hide_banner', '-i', file]);
    let err = '';
    p.stderr.on('data', d => (err += d));
    p.on('close', () => {
      const m = err.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
      ok(m ? { w: +m[1], h: +m[2] } : { w: 0, h: 0 });
    });
  });
}

async function doImage(job) {
  const { path: src } = pickSource(job);
  const meta = await sharp(src).metadata();
  for (const w of job.widths) {
    const out = resolve(OUT, `${job.out}-${w}.webp`);
    if (fresh(src, out)) { console.log(`  = ${rel(out)}`); continue; }
    ensureDir(out);
    if (meta.width < w) warnings.push(`${rel(out)}: el original mide ${meta.width}px (< ${w}px); no se amplía`);
    await sharp(src)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: job.quality ?? 85, effort: 6, smartSubsample: true })
      .toFile(out);
    console.log(`  ✓ ${rel(out)}  ${kb(out)}`);
  }
}

async function doLogo(job) {
  const src = abs(job.src);
  const out = resolve(OUT, `${job.out}.webp`);
  if (fresh(src, out)) { console.log(`  = ${rel(out)}`); return; }
  ensureDir(out);
  // recorta el fondo liso, pasa a luminancia y la usa como canal alfa
  const trimmed = await sharp(src).trim({ threshold: 40 }).resize({ width: job.width, withoutEnlargement: true }).toBuffer();
  const { data, info } = await sharp(trimmed).greyscale().raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = job.color;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const a = Math.max(0, Math.min(255, ((data[i] - 90) * 255) / (200 - 90)));
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(out);
  console.log(`  ✓ ${rel(out)}  ${info.width}x${info.height}  ${kb(out)}`);
}

async function doVideo(job) {
  const { path: src, trimmed } = pickSource(job);
  const out = resolve(OUT, `${job.out}.mp4`);
  const poster = resolve(OUT, `${job.out}-poster.webp`);
  if (fresh(src, out) && existsSync(poster)) { console.log(`  = ${rel(out)}`); return; }
  ensureDir(out);
  const { w: srcW } = await probeWidth(src);
  if (srcW && srcW < job.width) warnings.push(`${rel(out)}: el original mide ${srcW}px (< ${job.width}px); se queda en ${srcW}px`);
  const width = srcW ? Math.min(job.width, srcW) : job.width;
  const cut = trimmed && job.start != null ? ['-ss', String(job.start), '-t', String(job.duration)] : [];

  await run([
    ...cut, '-i', src,
    ...(job.audio ? ['-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']), // sin audio salvo que se pida
    '-vf', `scale=${width}:-2:flags=lanczos,format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', String(job.crf ?? 20),
    '-movflags', '+faststart',
    out
  ]);
  // póster: fotograma a 0.3 s (o `posterAt`) → PNG temporal → WebP 85
  const tmp = out.replace(/\.mp4$/, '.poster.png');
  await run(['-ss', String(job.posterAt ?? 0.3), '-i', out, '-frames:v', '1', tmp]);
  await sharp(tmp).webp({ quality: 85, effort: 5 }).toFile(poster);
  (await import('node:fs')).unlinkSync(tmp);
  console.log(`  ✓ ${rel(out)}  ${kb(out)}   + póster ${kb(poster)}`);
}

console.log('Imágenes → WebP 85 (1x + 2x)');
for (const j of IMAGES) await doImage(j);
console.log('Logos → WebP con transparencia');
for (const j of LOGOS) await doLogo(j);
console.log('Videos → MP4 H.264 sin audio');
for (const j of VIDEOS) await doVideo(j);

if (warnings.length) {
  console.log('\nAvisos (estas piezas necesitan un original de más resolución para verse nítidas):');
  warnings.forEach(w => console.log('  ! ' + w));
}
console.log('\nListo.');
