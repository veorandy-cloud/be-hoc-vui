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
page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message).split('\n').slice(0,3).join(' | ')));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

// chữ 'a' đã có điểm → không kích hoạt "cô viết mẫu trước" (demo cũng vẽ mực coral, nhiễu assertion đếm pixel)
await page.addInitScript(() => localStorage.setItem('bhv_write', '{"a":3}'));
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

// 1b. CSS variables sống (BOM lạc giữa file từng giết :root → thẻ var(--) trắng tiệp chữ trắng)
const cardBg = await page.$eval('#card-write', el => getComputedStyle(el).backgroundColor);
ok(cardBg && cardBg !== 'rgba(0, 0, 0, 0)' && !/255,\s*255,\s*255/.test(cardBg),
   `thẻ home có màu thật (--coral áp dụng: ${cardBg})`);

// 2. vào được cả 6 màn từ home + quay về
for (const id of ['scr-write', 'scr-read', 'scr-draw', 'scr-en', 'scr-quest', 'scr-music', 'scr-math']) {
  await page.click(`[data-go="${id}"]`);
  await page.waitForTimeout(450);
  ok(await page.$eval('#' + id, el => el.classList.contains('active')), 'vào màn ' + id);
  await goHome();
}
await page.click('#sticker-shelf');
await page.waitForTimeout(300);
ok(await page.$eval('#scr-stickers', el => el.classList.contains('active')), 'vào màn sticker');

// 2b. đảo sticker 3D: WebGL render ra hình (hoặc fallback tử tế nếu máy không có WebGL)
await page.click('#btn-island', { force: true });
await page.waitForTimeout(1500);
const isl = await page.evaluate(() => {
  const fb = !!document.querySelector('.island-fallback');
  let px = 0;
  const c = document.querySelector('#island-canvas');
  // không có preserveDrawingBuffer → phải render đồng bộ ngay trước khi đọc pixel (cùng task JS)
  if (c && typeof islReady !== 'undefined' && islReady) {
    try { islRenderer.render(islScene, islCam); px = c.toDataURL().length; } catch (e) { px = -1; }
  }
  return { fb, px, ready: typeof islReady !== 'undefined' && islReady };
});
ok(isl.ready && isl.px > 20000, `đảo 3D render (canvas ${isl.px}b${isl.fb ? ', FALLBACK' : ''})`);
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

// 3b. toán 0-10: menu → đếm số → chọn đáp án có phản hồi
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
await page.click('#math-menu [data-level="count"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
for (const b of await page.$$('#math-choices .choice')) { await b.click({ force: true }); await page.waitForTimeout(120); }
const mcls = await page.$$eval('#math-choices .choice', els => els.map(e => e.className).join(' '));
ok(/good/.test(mcls), 'toán: chọn đáp án có phản hồi .good');
await goHome();

// 4. tập viết: stroke data + chế độ Từng nét từ chối nét sai + Tự viết nhận nét
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(700);
const strokesN = await page.evaluate(() => typeof STROKES !== 'undefined' ? Object.keys(STROKES).length : 0);
ok(strokesN >= 76, `stroke data: ${strokesN} glyph có thứ tự nét`);
const box = await (await page.$('#write-canvas')).boundingBox();
const drawLine = async () => {
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.4);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++)
    await page.mouse.move(box.x + box.width * (0.35 + i * 0.025), box.y + box.height * (0.4 + i * 0.02));
  await page.mouse.up();
};
// mặc định = Từng nét: vẽ chéo bậy → bị từ chối, mực coral của bé phải bị xoá sạch
const inkPixels = () => page.$eval('#write-canvas', c => {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i] > 240 && d[i + 1] < 130 && d[i + 2] < 130 && d[i + 3] > 100) n++; // #FF5C5C
  return n;
});
await drawLine();
await page.waitForTimeout(500);
const inkAfterReject = await inkPixels();
ok(inkAfterReject < 50, `từng nét: nét sai bị từ chối và xoá (còn ${inkAfterReject}px mực)`);
// chuyển Tự viết: vẽ phải có nét
await page.click('[data-wmode="free"]', { force: true });
await page.waitForTimeout(500);
const before = await page.$eval('#write-canvas', c => c.toDataURL());
await drawLine();
await page.waitForTimeout(200);
const after = await page.$eval('#write-canvas', c => c.toDataURL());
ok(before !== after, 'tự viết: canvas có nét sau khi vẽ');
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
const picsN = await page.evaluate(() => PICS.length);
ok(picsN >= 32, `kho tranh tô: ${picsN} tranh`);

// 5c-guard. chưa tô gì mà bấm 💾 → bị chặn, KHÔNG reveal, không chiếm slot album
await page.click('#c-save', { force: true });
await page.waitForTimeout(400);
ok(await page.$eval('#pic-reveal', el => !el.classList.contains('show')), 'lưu tranh trắng: bị chặn, không reveal');

// 5c. tô 1 nét thật rồi lưu → reveal ảnh THẬT "sống" của thứ vừa tô
const cbox = await page.$eval('#color-paint', el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
await page.mouse.move(cbox.x + cbox.width * 0.4, cbox.y + cbox.height * 0.5);
await page.mouse.down();
for (let i = 1; i <= 8; i++)
  await page.mouse.move(cbox.x + cbox.width * (0.4 + i * 0.02), cbox.y + cbox.height * 0.5);
await page.mouse.up();
await page.waitForTimeout(300);
await page.click('#c-save', { force: true });
await page.waitForTimeout(800);
ok(await page.$eval('#pic-reveal', el => el.classList.contains('show')), 'lưu tranh tô: reveal ảnh thật hiện ra');
const prImg = await page.$eval('#pr-img', img => img.style.display !== 'none' && img.naturalWidth > 50);
ok(prImg, 'reveal: ảnh thật đã tải');
await page.click('#pr-close', { force: true });
await page.waitForTimeout(250);
await goHome();

// 5b. bài hát có nhạc đệm: bấm Hát → melody + bass/hat/kick được lên lịch
await page.click('[data-go="scr-music"]');
await page.waitForTimeout(400);
await page.click('#song-list .menu-card');
await page.waitForTimeout(400);
await page.click('#song-sing');
await page.waitForTimeout(700);
const oscN = await page.evaluate(() => songOscs.length);
ok(oscN > 30, `bài hát lên lịch ${oscN} nguồn âm (melody + nhạc đệm)`);
await page.evaluate(() => stopSong());
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

// 6b. ảnh thật: manifest + ảnh mẫu tải được + flashcard render <img>
const img = await page.evaluate(async () => {
  const man = await (await fetch('assets/images/manifest.json')).json();
  const files = Object.values(man);
  const r = await fetch('assets/images/en/' + files[0]);
  return { count: files.length, ok: r.ok };
});
ok(img.count >= 80 && img.ok, `ảnh từ vựng: ${img.count} photo, tải được`);
await page.click('[data-go="scr-en"]');
await page.waitForTimeout(600);
const flashImgs = await page.$$eval('#en-cards img.ph', els => els.length);
ok(flashImgs > 0, `flashcard hiện ảnh thật (${flashImgs} ảnh)`);
await goHome();

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
