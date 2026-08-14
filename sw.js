/* Offline sau lần tải đầu.
   - App files: stale-while-revalidate — phát từ cache ngay, tải bản mới nền, deploy mới tự áp dụng ở lần mở sau (KHÔNG cần bump version thủ công).
   - mp3: tên file = hash CỦA TEXT (không phải nội dung audio!) → cùng câu + đổi giọng/rate = cùng tên file.
     Cache-first vĩnh viễn trong cache riêng; nếu regenerate audio với giọng/rate khác PHẢI bump AUDIO_CACHE.
     Precache toàn bộ theo manifest khi trang gửi 'warm-audio'.
   - Safari phát <audio> bằng Range request (206) — Cache API cấm put(206), nên SW tự cắt 206 từ bản full 200 trong cache.
   - Google Fonts (cross-origin) cache riêng để chữ không vỡ khi offline. */
const VERSION = 'bhv-v3'; // v3: app.js tách thành 8 module
const AUDIO_CACHE = 'bhv-audio-v1';   // giữ ổn định giữa các version app để không tải lại 8MB audio
const FONT_CACHE = 'bhv-fonts-v1';
const IMG_CACHE = 'bhv-img-v1';       // ảnh thật Phase 2 (assets/images/) — cache riêng như audio
const KEEP = [VERSION, AUDIO_CACHE, FONT_CACHE, IMG_CACHE];
const CORE = [
  '.', 'index.html', 'css/style.css',
  'js/data.js', 'js/core.js', 'js/paint.js', 'js/writing.js', 'js/reading.js',
  'js/drawing.js', 'js/english.js', 'js/music.js', 'js/quest.js',
  'manifest.webmanifest', 'assets/audio/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* tải trước toàn bộ mp3 còn thiếu (SW tự fetch → request thường 200, cache được) */
async function warmAudio() {
  try {
    const man = await (await caches.match('assets/audio/manifest.json') || await fetch('assets/audio/manifest.json')).json();
    const cache = await caches.open(AUDIO_CACHE);
    const urls = Object.keys(man).map(id => new URL('assets/audio/' + id + '.mp3', self.registration.scope).href);
    const missing = [];
    for (const u of urls) if (!(await cache.match(u))) missing.push(u);
    for (let i = 0; i < missing.length; i += 8) {
      await Promise.all(missing.slice(i, i + 8).map(u =>
        fetch(u).then(r => { if (r.status === 200) return cache.put(u, r); }).catch(() => {})
      ));
    }
  } catch (e) {}
}
async function warmImages() {
  try {
    const man = await (await fetch('assets/images/manifest.json')).json();
    const cache = await caches.open(IMG_CACHE);
    const urls = Object.values(man).map(f => new URL('assets/images/en/' + f, self.registration.scope).href);
    for (let i = 0; i < urls.length; i += 8) {
      await Promise.all(urls.slice(i, i + 8).map(async u => {
        if (await cache.match(u)) return;
        return fetch(u).then(r => { if (r.status === 200) return cache.put(u, r); }).catch(() => {});
      }));
    }
  } catch (e) {}
}
self.addEventListener('message', e => {
  if (e.data === 'warm-audio') e.waitUntil(warmAudio());
  if (e.data === 'warm-images') e.waitUntil(warmImages());
});

/* mp3: cache-first + tự dựng 206 cho Range request của Safari */
async function serveAudio(req) {
  const url = new URL(req.url); url.search = '';
  const cache = await caches.open(AUDIO_CACHE);
  let res = await cache.match(url.href);
  if (!res) {
    res = await fetch(url.href); // fetch không kèm Range → 200 full, cache được
    if (res.status === 200) await cache.put(url.href, res.clone());
    else return res;
  }
  const range = req.headers.get('range');
  if (!range) return res;
  const buf = await res.arrayBuffer();
  const len = buf.byteLength;
  let start, end;
  const suffix = /^bytes=-(\d+)$/.exec(range);   // "bytes=-500": N byte cuối
  const m = /bytes=(\d+)-(\d+)?/.exec(range);
  if (suffix) { start = Math.max(0, len - +suffix[1]); end = len - 1; }
  else if (m) { start = +m[1]; end = m[2] ? Math.min(+m[2], len - 1) : len - 1; }
  else { start = 0; end = len - 1; }
  if (start >= len) return new Response(null, {
    status: 416, statusText: 'Range Not Satisfiable',
    headers: { 'Content-Range': `bytes */${len}` }
  });
  return new Response(buf.slice(start, end + 1), {
    status: 206, statusText: 'Partial Content',
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1)
    }
  });
}

/* app files: stale-while-revalidate; fonts: cache-first + cập nhật nền */
async function serveSWR(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res && (res.status === 200 || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  if (hit) return hit;
  const res = await net;
  return res || new Response('offline', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.endsWith('.mp3')) {
      e.respondWith(serveAudio(req).catch(() => new Response('', { status: 503 })));
    } else if (url.pathname.includes('/assets/images/')) {
      e.respondWith(serveSWR(req, IMG_CACHE)); // ảnh Phase 2: cache riêng, bump VERSION không mất
    } else {
      e.respondWith(serveSWR(req, VERSION));
    }
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(serveSWR(req, FONT_CACHE));
  }
});
