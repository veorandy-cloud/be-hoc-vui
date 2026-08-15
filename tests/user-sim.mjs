/* Đóng vai BÉ chơi thật trên iPad landscape: bấm bằng chuột/chạm qua mọi hoạt động,
   chơi trọn vòng quiz (kể cả bấm sai như trẻ con), lưu tranh, hát, thám hiểm.
   Chạy: (server :8080) → node tests/user-sim.mjs */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:8080';
const SHOTS = process.env.SHOT_DIR || 'usersim-shots';
mkdirSync(SHOTS, { recursive: true });
let failed = 0, shotN = 0;
const ok = (cond, name) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name); if (!cond) failed++; };

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--mute-audio'] });
const page = await browser.newPage({ viewport: { width: 1180, height: 820 }, hasTouch: true }); // iPad landscape
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + (e.stack || e.message).split('\n').slice(0, 2).join(' | ')));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

const shot = name => page.screenshot({ path: `${SHOTS}/${String(++shotN).padStart(2, '0')}-${name}.png` });
/* bấm Tiếp tục tới khi overlay đóng — trúng sticker mới thì overlay quà hiện thêm 1 nhịp (đúng thiết kế) */
async function closeOverlay() {
  for (let i = 0; i < 6 && await page.isVisible('#ov-next'); i++) {
    await page.click('#ov-next', { force: true });
    await page.waitForTimeout(700);
  }
}
const active = id => page.$eval('#' + id, el => el.classList.contains('active')).catch(() => false);
async function goHome() {
  for (let i = 0; i < 4; i++) {
    await page.click('#btn-home', { force: true }).catch(() => {});
    await page.waitForTimeout(400);
    if (await active('scr-home')) return true;
  }
  return false;
}
/* chơi 1 lượt quiz như trẻ con: mỗi câu bấm lần lượt các đáp án (có bấm sai) tới khi qua câu; hết bài → overlay */
async function playQuiz(choicesSel, label, maxQ = 12) {
  for (let q = 0; q < maxQ; q++) {
    if (await page.isVisible('#ov-next')) break;
    try { await page.waitForSelector(`${choicesSel} .choice`, { timeout: 5000 }); } catch (e) { break; }
    for (const b of await page.$$(`${choicesSel} .choice`)) {
      if (await page.isVisible('#ov-next')) break;
      await b.click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1100); // chờ auto-next 800ms
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: chơi trọn lượt, bảng kết quả hiện ra`);
  await shot(label.replace(/[^a-z0-9]+/gi, '-'));
  if (done) await closeOverlay();
}

await page.goto(BASE, { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(1200);
ok(await active('scr-home'), 'mở app vào màn home');
const stars0 = await page.$eval('#star-count', el => +el.textContent);
await shot('home');

// ===== 1. TẬP ĐỌC: bé chơi 2 bài — Chữ cái và Vần cuối =====
await page.click('[data-go="scr-read"]'); await page.waitForTimeout(500);
await page.click('[data-level="letters"]', { force: true });
await playQuiz('#read-choices', 'Tập đọc - Chữ cái');
await page.click('[data-level="van2"]', { force: true });
await playQuiz('#read-choices', 'Tập đọc - Vần cuối');
ok(await goHome(), 'về home sau Tập đọc');

// ===== 2. TOÁN: Đếm số + Trộn =====
await page.click('[data-go="scr-math"]'); await page.waitForTimeout(500);
await page.click('#math-menu [data-level="count"]', { force: true });
await playQuiz('#math-choices', 'Toán - Đếm số');
const mixBtn = await page.$('#math-menu [data-level="mix"]');
if (mixBtn) { await mixBtn.click({ force: true }); await playQuiz('#math-choices', 'Toán - Trộn'); }
ok(await goHome(), 'về home sau Toán');

// ===== 3. TẬP VIẾT: bé vẽ bậy bị từ chối, rồi Tự viết + bấm chấm =====
await page.click('[data-go="scr-write"]'); await page.waitForTimeout(800);
const box = await (await page.$('#write-canvas')).boundingBox();
const scribble = async (x0, y0) => {
  await page.mouse.move(box.x + box.width * x0, box.y + box.height * y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++)
    await page.mouse.move(box.x + box.width * (x0 + i * 0.02), box.y + box.height * (y0 + i * 0.015));
  await page.mouse.up();
};
await scribble(0.3, 0.35); await page.waitForTimeout(700);
await shot('viet-tung-net');
await page.click('[data-wmode="free"]', { force: true }); await page.waitForTimeout(600);
await scribble(0.35, 0.3); await scribble(0.4, 0.5); await page.waitForTimeout(300);
await page.click('#w-grade', { force: true }); await page.waitForTimeout(900);
ok(await page.isVisible('#ov-next'), 'Tự viết: bấm ✅ ra bảng điểm');
await shot('viet-cham-diem');
await closeOverlay();
ok(await goHome(), 'về home sau Tập viết');

// ===== 4. TIẾNG ANH: chạm 2 thẻ từ, quiz nghe, game lật hình chơi tới hết =====
await page.click('[data-go="scr-en"]'); await page.waitForTimeout(600);
const flashes = await page.$$('#en-cards .flash');
ok(flashes.length >= 6, `flashcard hiện ${flashes.length} thẻ`);
await flashes[0].click(); await page.waitForTimeout(700);
await flashes[1].click(); await page.waitForTimeout(700);
await page.click('#en-g1', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Nghe chọn hình');
await page.click('#en-g3', { force: true }); await page.waitForTimeout(600);
for (let i = 0; i < 40 && !(await page.isVisible('#ov-next')); i++) {
  const cards = await page.$$('#mem-grid button:not(.done):not(.open)');
  if (cards.length < 2) { await page.waitForTimeout(400); continue; }
  await cards[0].click({ force: true }); await page.waitForTimeout(250);
  const again = await page.$$('#mem-grid button:not(.done):not(.open)');
  if (again.length) await again[Math.floor(Math.random() * again.length)].click({ force: true });
  await page.waitForTimeout(650);
}
ok(await page.isVisible('#ov-next'), 'Tìm cặp: lật hết ra bảng kết quả');
await shot('en-memory');
await closeOverlay();
ok(await goHome(), 'về home sau Tiếng Anh');

// ===== 5. VẼ & TÔ MÀU: vẽ tự do, lưu tranh trắng (phải bị chặn), tô rồi lưu (reveal) =====
await page.click('[data-go="scr-draw"]'); await page.waitForTimeout(500);
const fbox = await (await page.$('#draw-canvas')).boundingBox().catch(() => null);
if (fbox) {
  await page.mouse.move(fbox.x + fbox.width * 0.3, fbox.y + fbox.height * 0.4);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(fbox.x + fbox.width * (0.3 + i * 0.03), fbox.y + fbox.height * (0.4 + Math.sin(i / 2) * 0.1));
  await page.mouse.up();
}
await shot('ve-tu-do');
await page.click('#tab-color', { force: true }); await page.waitForTimeout(1000);
await page.click('#c-save', { force: true }); await page.waitForTimeout(500);
ok(!(await page.$eval('#pic-reveal', el => el.classList.contains('show'))), 'tranh trắng bấm 💾: bị chặn (không reveal)');
const cbox = await (await page.$('#color-paint')).boundingBox();
await page.mouse.move(cbox.x + cbox.width * 0.45, cbox.y + cbox.height * 0.5);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(cbox.x + cbox.width * (0.45 + i * 0.015), cbox.y + cbox.height * (0.5 + i * 0.01));
await page.mouse.up();
await page.waitForTimeout(400);
await page.click('#c-save', { force: true }); await page.waitForTimeout(1000);
ok(await page.$eval('#pic-reveal', el => el.classList.contains('show')), 'tô rồi lưu: reveal ảnh thật hiện ra');
await shot('to-mau-reveal');
await page.click('#pr-close', { force: true }).catch(() => {});
await page.waitForTimeout(400);
ok(await goHome(), 'về home sau Tô màu');

// ===== 6. CA HÁT: hát bài đầu (EN), dừng, mở bài dân ca VN cuối =====
await page.click('[data-go="scr-music"]'); await page.waitForTimeout(500);
await page.click('#song-list .menu-card'); await page.waitForTimeout(500);
await page.click('#song-sing'); await page.waitForTimeout(1500);
const oscN = await page.evaluate(() => songOscs.length);
ok(oscN > 30, `Hát: ban nhạc lên lịch ${oscN} nguồn âm`);
await shot('ca-hat');
await page.click('#song-stop'); await page.waitForTimeout(300);
await page.click('#song-back'); await page.waitForTimeout(400);
const songCards = await page.$$('#song-list .menu-card');
await songCards[songCards.length - 1].click(); await page.waitForTimeout(500);
await page.click('#song-sing'); await page.waitForTimeout(1200);
const viOsc = await page.evaluate(() => songOscs.length);
ok(viOsc > 10, `Hát dân ca VN: ban nhạc chạy (${viOsc} nguồn âm)`);
await page.click('#song-stop');
ok(await goHome(), 'về home sau Ca hát');

// ===== 7. THÁM HIỂM: bản đồ khoá đúng (1 trạm hiện tại, còn lại 🔒), chơi trọn trạm 1 =====
await page.click('[data-go="scr-quest"]'); await page.waitForTimeout(600);
const nCur = (await page.$$('.station.cur')).length, nLock = (await page.$$('.station.lock')).length;
ok(nCur === 1 && nLock === 24, `bản đồ khoá đúng: ${nCur} trạm hiện tại, ${nLock} trạm 🔒`);
await shot('quest-map');
// bé thử bấm trạm khoá: phải KHÔNG mở được
await page.click('.station.lock', { force: true }); await page.waitForTimeout(400);
ok(await page.$eval('#quest-play', el => el.style.display !== 'flex'), 'trạm khoá: bấm không mở được');
// chơi trạm 1 (quiz chữ cái, chạy trong #quest-play)
await page.click('.station.cur', { force: true }); await page.waitForTimeout(700);
ok(await page.$eval('#quest-play', el => el.style.display === 'flex'), 'trạm 1 mở ra quiz');
await shot('quest-tram-1');
await playQuiz('#qp-choices', 'Thám hiểm - Trạm 1');
const qDone = await page.evaluate(() => Number(localStorage.getItem('bhv_quest')) || 0);
const backOnMap = await page.$eval('#quest-map', el => el.style.display !== 'none').catch(() => false);
ok(backOnMap, `sau trạm: về bản đồ (kết quả: ${qDone ? 'QUA TRẠM, mở trạm 2' : 'chưa đủ điểm, trạm mở lại để thử tiếp'})`);
await shot('quest-sau-tram');
ok(await goHome(), 'về home sau Thám hiểm');

// ===== 8. STICKER + ĐẢO 3D =====
await page.click('#sticker-shelf'); await page.waitForTimeout(400);
ok(await active('scr-stickers'), 'mở kệ sticker');
await page.click('#btn-island', { force: true }); await page.waitForTimeout(1600);
const isl = await page.evaluate(() => {
  let px = 0;
  const c = document.querySelector('#island-canvas');
  if (c && typeof islReady !== 'undefined' && islReady) {
    try { islRenderer.render(islScene, islCam); px = c.toDataURL().length; } catch (e) { px = -1; }
  }
  return px;
});
ok(isl > 20000, `đảo 3D render (${isl}b)`);
await shot('dao-sticker');
ok(await goHome(), 'về home sau Đảo');

// ===== TỔNG KẾT =====
const stars1 = await page.$eval('#star-count', el => +el.textContent);
ok(stars1 > stars0, `bé kiếm được sao thật: ${stars0}⭐ → ${stars1}⭐`);
await shot('home-cuoi');
ok(errors.length === 0, errors.length ? `LỖI RUNTIME (${errors.length}): ${errors.slice(0, 5).join(' || ')}` : 'không lỗi console/pageerror/HTTP suốt phiên chơi');

await browser.close();
console.log(failed ? `\n${failed} FAIL` : '\nALL PASS');
process.exit(failed ? 1 : 0);
