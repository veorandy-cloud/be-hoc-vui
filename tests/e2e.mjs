/* Smoke test E2E — Edge headless qua playwright-core (channel msedge, không tải browser).
   Chạy: (server đang chạy ở :8080) → node tests/e2e.mjs
   Fail bất kỳ assertion nào → exit 1. */
import { chromium } from 'playwright-core';

const BASE = 'http://localhost:8080';
let failed = 0;
const ok = (cond, name) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
  if (!cond) failed++;
};

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--mute-audio'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

await page.goto(BASE, { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(800);

// giữa lượt chơi, bấm 🏠 lần đầu chỉ hỏi xác nhận (đúng thiết kế) — bấm tới khi về home thật
async function goHome() {
  for (let i = 0; i < 3; i++) {
    await page.click('#btn-home', { force: true }).catch(() => {});
    await page.waitForTimeout(350);
    if (await page.$eval('#scr-home', el => el.classList.contains('active'))) return;
  }
  throw new Error('không về được home');
}

// 1. app load sạch
ok(await page.title() === 'Bé Học Vui', 'title đúng');

// 2. vào được cả 6 màn từ home + quay về
for (const id of ['scr-write', 'scr-read', 'scr-draw', 'scr-en', 'scr-quest', 'scr-music']) {
  await page.click(`[data-go="${id}"]`);
  await page.waitForTimeout(450);
  ok(await page.$eval('#' + id, el => el.classList.contains('active')), 'vào màn ' + id);
  await goHome();
}
await page.click('#sticker-shelf');
await page.waitForTimeout(300);
ok(await page.$eval('#scr-stickers', el => el.classList.contains('active')), 'vào màn sticker');
await goHome();

// 3. quiz tập đọc phản hồi khi chọn đáp án
await page.click('[data-go="scr-read"]');
await page.waitForTimeout(300);
await page.click('[data-level="letters"]');
await page.waitForSelector('#read-choices .choice', { timeout: 5000 });
for (const b of await page.$$('#read-choices .choice')) { await b.click({ force: true }); await page.waitForTimeout(120); }
const cls = await page.$$eval('#read-choices .choice', els => els.map(e => e.className).join(' '));
ok(/good/.test(cls), 'quiz: chọn đáp án có phản hồi .good');
await goHome();

// 4. canvas tập viết nhận nét vẽ
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(700);
const box = await (await page.$('#write-canvas')).boundingBox();
const before = await page.$eval('#write-canvas', c => c.toDataURL());
await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.4);
await page.mouse.down();
for (let i = 1; i <= 10; i++)
  await page.mouse.move(box.x + box.width * (0.35 + i * 0.025), box.y + box.height * (0.4 + i * 0.02));
await page.mouse.up();
await page.waitForTimeout(200);
const after = await page.$eval('#write-canvas', c => c.toDataURL());
ok(before !== after, 'tập viết: canvas có nét sau khi vẽ');
await goHome();

// 5. tô màu: tranh line-art render (lineMask sẵn sàng → canvas line có pixel)
await page.click('[data-go="scr-draw"]');
await page.waitForTimeout(300);
await page.click('#tab-color');
await page.waitForTimeout(900);
const linePixels = await page.$eval('#color-line', c => {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 60) n++;
  return n;
});
ok(linePixels > 5000, `tô màu: nét tranh đã render (${linePixels} px)`);
await goHome();

// 6. audio manifest khớp số câu trong phrases.json và mp3 tải được
const audio = await page.evaluate(async () => {
  const man = await (await fetch('assets/audio/manifest.json')).json();
  const phrases = await (await fetch('scripts/phrases.json')).json();
  const keys = Object.keys(man);
  const r = await fetch('assets/audio/' + keys[0] + '.mp3');
  const size = (await r.arrayBuffer()).byteLength;
  return { count: keys.length, expect: phrases.length, ok: r.ok, size };
});
ok(audio.count === audio.expect, `audio manifest đủ ${audio.expect} câu (thấy ${audio.count})`);
ok(audio.ok && audio.size > 500, `mp3 mẫu tải được (${audio.size} bytes)`);

// 7. service worker đăng ký được (localhost = secure context)
const swReg = await page.evaluate(() =>
  Promise.race([
    navigator.serviceWorker.ready.then(() => true),
    new Promise(res => setTimeout(() => res(false), 6000))
  ])
);
ok(swReg, 'service worker đăng ký thành công');

// 8. không có lỗi console/pageerror trong toàn bộ phiên
ok(errors.length === 0, 'không có lỗi console/pageerror');
if (errors.length) errors.forEach(e => console.log('   ' + e));

await browser.close();
console.log(failed ? `\n${failed} FAIL` : '\nALL PASS');
process.exit(failed ? 1 : 0);
