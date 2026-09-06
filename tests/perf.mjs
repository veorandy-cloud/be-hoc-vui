/* Baseline hiệu năng boot — chạy với server :8080: node tests/perf.mjs
   Đo: tổng bytes JS/CSS/font phải tải + parse khi mở app, timing điều hướng, heap.
   Mục đích: số liệu trước/sau mỗi tối ưu (lazy three.min.js...) — không assert, chỉ báo cáo. */
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();

const t0 = Date.now();
await page.goto('http://127.0.0.1:8080', { waitUntil: 'load', timeout: 20000 }); // localhost = IPv6 trên máy này, server bind 127.0.0.1
await page.waitForTimeout(1200); // cho fonts/audio-manifest fetch xong
const wall = Date.now() - t0;

const m = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const byExt = {};
  let jsMs = 0;
  for (const r of res) {
    const ext = (r.name.split('?')[0].match(/\.(\w+)(\?.*)?$/) || [,'?'])[1];
    const b = byExt[ext] ||= { bytes: 0, n: 0, ms: 0 };
    b.bytes += r.transferSize || 0; b.n++; b.ms += r.duration;
    if (ext === 'js') jsMs += r.duration;
  }
  const mem = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024) : null;
  return {
    dcl: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    jsMs: Math.round(jsMs),
    byExt: Object.fromEntries(Object.entries(byExt).sort((a,b)=>b[1].bytes-a[1]).map(([k,v])=>[k,`${(v.bytes/1024).toFixed(0)}KB/${v.n}f/${Math.round(v.ms)}ms`])),
    heapKB: mem
  };
});
console.log('wall_ms_first_paint_to_ready:', wall);
console.log('nav_dcl_ms:', m.dcl, '| nav_load_ms:', m.load, '| js_resource_ms_total:', m.jsMs, '| heap_KB:', m.heapKB);
for (const [k, v] of Object.entries(m.byExt)) console.log(`  ${k.padEnd(6)} ${v}`);
await browser.close();
