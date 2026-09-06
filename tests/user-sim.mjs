/* Đóng vai BÉ chơi thật trên iPad landscape: bấm bằng chuột/chạm qua MỌI hoạt động,
   chơi trọn vòng quiz của mọi mục đọc/toán/tiếng Anh (kể cả bấm sai như trẻ con), lưu tranh, hát, đàn, gõ nhịp,
   rồi THÁM HIỂM HẾT 40 TRẠM (bé "thông minh": biết đáp án, đồ nét theo mẫu) tới cúp 🏆.
   Chạy: (server :8080) → node tests/user-sim.mjs   (~13 phút — 144 assertion) */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://127.0.0.1:8080';
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

const shot = name => page.screenshot({ path: `${SHOTS}/${String(++shotN).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-')}.png` });
/* bấm Tiếp tục tới khi overlay đóng — trúng sticker mới thì overlay quà hiện thêm 1 nhịp (đúng thiết kế) */
async function closeOverlay() {
  for (let i = 0; i < 8 && await page.isVisible('#ov-next'); i++) {
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
/* chờ sang câu mới (progress đổi) hoặc bảng kết quả — cô đọc đáp án xong mới sang câu nên không dùng sleep cố định */
const progressOf = sel => page.$eval(sel.replace('-choices', '-progress'), el => el.textContent).catch(() => '');
async function waitNext(choicesSel, before, ms = 6000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.isVisible('#ov-next')) return true;
    if ((await progressOf(choicesSel)) !== before) return true;
    await page.waitForTimeout(150);
  }
  return false;
}
/* chơi 1 lượt quiz như trẻ con: mỗi câu bấm lần lượt các đáp án (có bấm sai) tới khi qua câu; hết bài → overlay */
async function playQuiz(choicesSel, label, maxQ = 30) { // câu sai được hỏi lại (+3/lượt); ôn từ yếu tới 23 câu
  for (let q = 0; q < maxQ; q++) {
    if (await page.isVisible('#ov-next')) break;
    try { await page.waitForSelector(`${choicesSel} .choice`, { timeout: 5000 }); } catch (e) { break; }
    const before = await progressOf(choicesSel);
    for (const b of await page.$$(`${choicesSel} .choice`)) {
      if (await page.isVisible('#ov-next')) break;
      if ((await progressOf(choicesSel)) !== before) break; // đã sang câu mới (bấm trúng sớm) — đừng bấm nhầm câu sau
      await b.click({ force: true }).catch(() => {});
      await page.waitForTimeout(250);
    }
    await waitNext(choicesSel, before);
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: chơi trọn lượt, bảng kết quả hiện ra`);
  await shot(label);
  if (done) await closeOverlay();
}
/* bé "thông minh" (dùng cho thám hiểm — phải QUA trạm): hook runQuiz để biết đáp án, bấm đúng ngay lần đầu */
async function hookQuiz() {
  await page.evaluate(() => {
    if (window.__hooked) return;
    const orig = runQuiz;
    window.runQuiz = function (cfg) { window.__quiz = cfg; return orig(cfg); };
    window.__hooked = true;
  });
}
async function smartQuiz(choicesSel, label, maxQ = 20) {
  for (let q = 0; q < maxQ; q++) {
    if (await page.isVisible('#ov-next')) break;
    try { await page.waitForSelector(`${choicesSel} .choice`, { timeout: 5000 }); } catch (e) { break; }
    const idx = await page.evaluate(() => {
      const cfg = window.__quiz; if (!cfg) return -1;
      const m = (cfg.progressEl.textContent || '').match(/Câu (\d+)/);
      const qq = cfg.questions[m ? +m[1] - 1 : 0]; if (!qq) return -1;
      const ans = qq.choices.find(c => c.correct); if (!ans) return -1;
      const tmp = document.createElement('div'); tmp.innerHTML = ans.html;
      return [...cfg.choicesEl.querySelectorAll('.choice')].findIndex(b => b.innerHTML === tmp.innerHTML);
    });
    const before = await progressOf(choicesSel);
    const btns = await page.$$(`${choicesSel} .choice`);
    await (btns[idx >= 0 ? idx : 0]).click({ force: true }).catch(() => {});
    await waitNext(choicesSel, before); // cô đọc đáp án xong mới sang câu
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: chơi trọn lượt`);
  if (done) await closeOverlay();
  return done;
}
/* lật hình có trí nhớ như bé thật: cặp = emoji ↔ từ cùng item (đọc EN_THEMES), nhớ label thẻ đã lật */
async function solveMemory(label) {
  const pairOf = await page.evaluate(() => {
    const m = {};
    EN_THEMES[enTheme].forEach(it => { m[it.em] = it.w; m[it.w] = it.em; });
    return m;
  });
  const known = {};
  const readCard = i => page.$eval(`#mem-grid .mem-card:nth-child(${i + 1})`, e => e.textContent);
  for (let iter = 0; iter < 30 && !(await page.isVisible('#ov-next')); iter++) {
    const states = await page.$$eval('#mem-grid .mem-card', els => els.map(e => e.classList.contains('done')));
    const els = await page.$$('#mem-grid .mem-card');
    let a = null, b = null;
    for (const [i, l] of Object.entries(known)) {
      if (states[+i]) continue;
      const j = Object.keys(known).find(j => +j !== +i && !states[+j] && pairOf[l] === known[j]);
      if (j !== undefined) { a = +i; b = +j; break; }
    }
    if (a !== null) {
      await els[a].click({ force: true }); await page.waitForTimeout(300);
      await els[b].click({ force: true }); await page.waitForTimeout(800);
      continue;
    }
    const u1 = states.findIndex((d, i) => !d && !(i in known));
    if (u1 < 0) { await page.waitForTimeout(500); continue; }
    await els[u1].click({ force: true }); await page.waitForTimeout(300);
    known[u1] = await readCard(u1);
    const mate = Object.keys(known).find(j => +j !== u1 && !states[+j] && pairOf[known[u1]] === known[j]);
    let u2 = mate !== undefined ? +mate : states.findIndex((d, i) => !d && !(i in known) && i !== u1);
    if (u2 < 0) u2 = states.findIndex((d, i) => !d && i !== u1);
    await els[u2].click({ force: true }); await page.waitForTimeout(300);
    known[u2] = await readCard(u2);
    await page.waitForTimeout(1000); // chờ flip-back nếu lật sai
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: lật hết ra bảng kết quả`);
  await shot(label);
  if (done) await closeOverlay();
  return done;
}
/* đánh vần EN: đọc từ từ ảnh (alt) hoặc emoji, bấm thẻ đúng thứ tự */
async function solveSpell(label) {
  for (let w = 0; w < 5; w++) {
    if (await page.isVisible('#ov-next')) break;
    try { await page.waitForSelector('#en-choices .spell-tile', { timeout: 5000 }); } catch (e) { break; }
    const word = await page.evaluate(() => {
      const img = document.querySelector('#en-prompt img'); if (img) return img.alt;
      const em = (document.querySelector('#en-prompt .em') || {}).textContent;
      const it = enSpellWords().find(x => x.em === em); return it ? it.w : null;
    });
    if (!word) break;
    for (const L of word) {
      for (const t of await page.$$('#en-choices .spell-tile:not(.used)')) {
        if ((await t.textContent()) === L) { await t.click({ force: true }); await page.waitForTimeout(150); break; }
      }
    }
    await page.waitForTimeout(1900);
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: đánh vần trọn lượt`);
  await shot(label);
  if (done) await closeOverlay();
  return done;
}
/* tập viết Từng nét: đồ đúng theo nét mẫu (glyphStrokes) — nét nào chưa đậu thì đồ lại, tối đa 40 lượt */
async function traceWrite(label) {
  await page.waitForTimeout(4000); // chữ chưa từng đạt → cô viết mẫu trước
  const box = await (await page.$('#write-canvas')).boundingBox();
  for (let tries = 0; tries < 40; tries++) {
    if (await page.isVisible('#ov-next')) break;
    const st = await page.evaluate(() => {
      const g = glyphStrokes();
      return { cur: gStroke, n: g ? g.strokes.length : 0, pts: g ? (g.strokes[gStroke] || null) : null };
    });
    if (!st.n || !st.pts) break;
    await page.mouse.move(box.x + st.pts[0][0], box.y + st.pts[0][1]);
    await page.mouse.down();
    for (const p of st.pts.slice(1)) await page.mouse.move(box.x + p[0], box.y + p[1]);
    await page.mouse.up();
    await page.waitForTimeout(450);
  }
  const done = await page.isVisible('#ov-next');
  ok(done, `${label}: đồ đủ nét theo mẫu → bảng điểm`);
  await shot(label);
  if (done) await closeOverlay();
  return done;
}

await page.goto(BASE, { waitUntil: 'load', timeout: 15000 });
await page.waitForTimeout(1200);
ok(await active('scr-home'), 'mở app vào màn home');
const stars0 = await page.$eval('#star-count', el => +el.textContent);
await shot('home');

// ===== 1. TẬP ĐỌC: bé chơi TẤT CẢ 10 mục =====
await page.click('[data-go="scr-read"]'); await page.waitForTimeout(500);
for (const lv of ['letters', 'van', 'van2', 'digraph', 'words', 'sentences', 'mix']) {
  await page.click(`[data-level="${lv}"]`, { force: true });
  await playQuiz('#read-choices', `Tập đọc - ${lv}`);
}
// Đọc truyện: cô kể xong 5-6 câu (mp3 thật) mới hiện câu hỏi — chờ tới 60s
await page.click('[data-level="story"]', { force: true });
try { await page.waitForSelector('#read-choices .choice', { timeout: 60000 }); } catch (e) {}
await playQuiz('#read-choices', 'Tập đọc - Đọc truyện');
// Đọc theo: 8 thẻ, bé bấm Nghe lại rồi Câu tiếp (không mic trong headless)
await page.click('[data-level="repeat"]', { force: true }); await page.waitForTimeout(600);
for (let i = 0; i < 9 && !(await page.isVisible('#ov-next')); i++) {
  await page.click('#read-choices .ctrl:has-text("Nghe lại")', { force: true }).catch(() => {});
  await page.waitForTimeout(200);
  await page.click('#read-choices .ctrl:has-text("Câu tiếp")', { force: true }).catch(() => {});
  await page.waitForTimeout(500);
}
ok(await page.isVisible('#ov-next'), 'Đọc theo: đi hết 8 thẻ, bảng kết quả hiện ra');
await closeOverlay();
// Ghép vần: ghép chữ + vần (thử sai như bé), cô đọc đánh vần SGK, rồi Câu tiếp — trọn 6 câu
await page.click('[data-level="ghep"]', { force: true });
let spellSeen = 0;
for (let r = 0; r < 6; r++) {
  try { await page.waitForSelector('#read-choices .choices .choice', { timeout: 5000 }); } catch (e) { break; }
  outer: for (let ci = 0; ci < 3; ci++) {
    const rows = await page.$$('#read-choices .choices');
    if (rows.length < 2) break;
    const cons = await rows[0].$$('.choice');
    if (!cons[ci]) break;
    await cons[ci].click({ force: true }); await page.waitForTimeout(250);
    for (let vi = 0; vi < 3; vi++) {
      const rows2 = await page.$$('#read-choices .choices');
      if (rows2.length < 2) break outer;
      const vans = await rows2[1].$$('.choice');
      if (!vans[vi]) continue;
      await vans[vi].click({ force: true }); await page.waitForTimeout(350);
      const out = await page.$eval('#ghep-out', el => el.textContent).catch(() => '');
      if (out.includes('=')) break outer;
    }
  }
  try { await page.waitForSelector('#read-choices .ctrl', { timeout: 4000 }); } catch (e) { break; }
  if (await page.$eval('#read-prompt', el => el.textContent.includes('–'))) spellSeen++;
  if (r === 0) await shot('ghep-danh-van');
  await page.click('#read-choices .ctrl:has-text("Câu tiếp")', { force: true });
  await page.waitForTimeout(600);
}
ok(spellSeen >= 5, `Ghép vần: ghép đúng ${spellSeen}/6 câu, mỗi câu cô đọc chuỗi đánh vần`);
ok(await page.isVisible('#ov-next'), 'Ghép vần: chơi trọn lượt, bảng kết quả hiện ra');
await closeOverlay();
ok(await goHome(), 'về home sau Tập đọc');

// ===== 2. TOÁN: thẻ HK2 đang 🔒 (bé mới) → chạm không mở; "cày" đủ 6 lượt → mở; rồi chơi TẤT CẢ mục =====
await page.click('[data-go="scr-math"]'); await page.waitForTimeout(500);
const lockedN = await page.$$eval('#math-menu .menu-card.locked', els => els.length);
ok(lockedN === 4, `toán: bé mới thấy ${lockedN} thẻ HK2 khoá 🔒`);
await page.click('#math-menu [data-level="hundred"]', { force: true }); await page.waitForTimeout(500);
ok(await page.$eval('#math-quiz', el => getComputedStyle(el).display === 'none'), 'toán: chạm thẻ khoá không vào bài');
await shot('toan-khoa');
await page.evaluate(() => { localStorage.setItem('bhv_mathok', '6'); localStorage.setItem('bhv_mathunlock', 'new'); });
await goHome();
await page.click('[data-go="scr-math"]'); await page.waitForTimeout(800);
ok(await page.$$eval('#math-menu .menu-card.locked', els => els.length) === 0, 'toán: đủ 6 lượt → mở hết, cô chúc mừng');
const mathLevels = await page.$$eval('#math-menu .menu-card', els => els.map(e => e.dataset.level));
ok(mathLevels.length >= 14, `toán: menu ${mathLevels.length} mục`);
for (const lv of mathLevels) {
  await page.click(`#math-menu [data-level="${lv}"]`, { force: true });
  await playQuiz('#math-choices', `Toán - ${lv}`);
}
ok(await goHome(), 'về home sau Toán');

// ===== 3. TẬP VIẾT: bé vẽ bậy bị từ chối, rồi Tự viết + bấm chấm; đổi tab tiếng có dấu, chép từ =====
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
for (const set of ['up', 'num', 'syl', 'word']) {
  await page.click(`#scr-write [data-set="${set}"]`, { force: true }); await page.waitForTimeout(500);
  await page.click('#w-next', { force: true }); await page.waitForTimeout(400);
  await page.click('#w-speak', { force: true }); await page.waitForTimeout(200);
}
ok(await page.evaluate(() => wSet === 'word' && [...curChar()].length >= 3), 'tập viết: đi qua 5 tab, tới chép từ');
await shot('viet-chep-tu');
ok(await goHome(), 'về home sau Tập viết');

// ===== 4. TIẾNG ANH: thẻ từ, cả 6 game + phonics + ôn từ yếu, đổi chủ đề =====
await page.click('[data-go="scr-en"]'); await page.waitForTimeout(600);
const flashes = await page.$$('#en-cards .flash');
ok(flashes.length >= 6, `flashcard hiện ${flashes.length} thẻ`);
await flashes[0].click(); await page.waitForTimeout(700);
await flashes[1].click(); await page.waitForTimeout(700);
await page.click('#en-g1', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Nghe chọn hình');
await page.click('#en-g2', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Chọn từ đúng');
await page.click('#en-g4', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Nghe câu');
await page.click('#en-g5', { force: true }); await page.waitForTimeout(400);
await page.click('#en-phx [data-letter="b"]', { force: true }); await page.waitForTimeout(300);
await page.click('#en-phx-play', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Phonics B');
await page.click('#en-g6', { force: true }); await page.waitForTimeout(500);
await solveSpell('Tiếng Anh - Đánh vần');
await page.click('#en-weak', { force: true });
await playQuiz('#en-choices', 'Tiếng Anh - Ôn từ yếu', 60);
await page.click('#en-chips .chip:nth-child(4)', { force: true }); await page.waitForTimeout(500); // 🍔 Food
await page.click('#en-g3', { force: true }); await page.waitForTimeout(600);
await solveMemory('Tiếng Anh - Lật hình');
ok(await goHome(), 'về home sau Tiếng Anh');

// ===== 5. VẼ & TÔ MÀU: vẽ tự do + lưu, tô rồi lưu (reveal), theo mẫu, mở album =====
await page.click('[data-go="scr-draw"]'); await page.waitForTimeout(500);
const fbox = await (await page.$('#draw-canvas')).boundingBox().catch(() => null);
if (fbox) {
  await page.mouse.move(fbox.x + fbox.width * 0.3, fbox.y + fbox.height * 0.4);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(fbox.x + fbox.width * (0.3 + i * 0.03), fbox.y + fbox.height * (0.4 + Math.sin(i / 2) * 0.1));
  await page.mouse.up();
}
await shot('ve-tu-do');
await page.click('#d-save', { force: true }); await page.waitForTimeout(900);
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
await page.click('#tab-guide', { force: true }); await page.waitForTimeout(800);
const gbox = await (await page.$('#guide-paint')).boundingBox();
await page.mouse.move(gbox.x + gbox.width * 0.3, gbox.y + gbox.height * 0.5);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(gbox.x + gbox.width * (0.3 + i * 0.03), gbox.y + gbox.height * 0.5);
await page.mouse.up();
await page.click('#g-save', { force: true }); await page.waitForTimeout(700);
await shot('ve-theo-mau');
await page.click('#tab-free', { force: true }); await page.waitForTimeout(300);
await page.click('#d-gallery', { force: true }); await page.waitForTimeout(600);
const galN = await page.evaluate(() => (JSON.parse(localStorage.getItem('bhv_gallery') || '[]')).length);
ok(galN >= 2, `album: đã lưu ${galN} tranh (vẽ tự do + tô màu/theo mẫu)`);
ok(await page.$eval('#gallery-modal', el => el.classList.contains('show')), 'album: modal mở');
await shot('album');
await page.click('#gal-close', { force: true }); await page.waitForTimeout(300);
ok(await goHome(), 'về home sau Vẽ');

// ===== 6. CA HÁT: hát bài đầu (EN), dừng, dân ca VN cuối, đàn theo Old MacDonald tới hết bài, gõ nhịp 8 phách =====
await page.click('[data-go="scr-music"]'); await page.waitForTimeout(500);
await page.click('#song-list .menu-card'); await page.waitForTimeout(500);
await page.click('#song-sing'); await page.waitForTimeout(1500);
const oscN = await page.evaluate(() => songOscs.length);
ok(oscN > 30, `Hát: ban nhạc lên lịch ${oscN} nguồn âm`);
await shot('ca-hat');
await page.click('#song-stop'); await page.waitForTimeout(300);
await page.click('#song-read'); await page.waitForTimeout(1500);
await page.click('#song-stop'); await page.waitForTimeout(300);
await page.click('#song-back'); await page.waitForTimeout(400);
const songCards = await page.$$('#song-list .menu-card');
await songCards[songCards.length - 1].click(); await page.waitForTimeout(500);
await page.click('#song-sing'); await page.waitForTimeout(1200);
const viOsc = await page.evaluate(() => songOscs.length);
ok(viOsc > 10, `Hát dân ca VN: ban nhạc chạy (${viOsc} nguồn âm)`);
await page.click('#song-stop'); await page.waitForTimeout(200);
await page.click('#song-back'); await page.waitForTimeout(400);
const omIdx = await page.evaluate(() => SONGS.findIndex(s => /Old MacDonald/.test(s.title)));
await page.click(`#song-list .menu-card:nth-child(${omIdx + 1})`, { force: true }); await page.waitForTimeout(400);
await page.click('#song-play', { force: true }); await page.waitForTimeout(400);
let pressed = 0;
for (let i = 0; i < 120; i++) {
  const lit = await page.$('#piano-keys .pkey.lit');
  if (!lit) break;
  await lit.click({ force: true }); pressed++;
  await page.waitForTimeout(80);
}
const pl = await page.evaluate(() => ({ expect: pianoExpect, idx: pianoIdx, n: pianoNotes.length }));
ok(pl.expect === null && pl.idx === pl.n && pressed === pl.n, `Đàn theo Old MacDonald: bấm đủ ${pressed}/${pl.n} nốt sáng tới hết bài`);
await shot('dan-theo');
await page.click('#song-tap', { force: true }); await page.waitForTimeout(400);
const tap = await page.evaluate(() => { tapTimes.forEach(t => tapJudgeAt(t)); return { hits: tapHits, n: tapTimes.length }; });
ok(tap.hits === tap.n && tap.n >= 8, `Gõ nhịp: trúng ${tap.hits}/${tap.n} phách`);
await page.click('#song-stop', { force: true });
ok(await goHome(), 'về home sau Ca hát');

// ===== 7. THÁM HIỂM: bản đồ khoá đúng, bấm trạm khoá không mở, rồi CHƠI HẾT MỌI TRẠM tới cúp =====
await hookQuiz();
await page.click('[data-go="scr-quest"]'); await page.waitForTimeout(600);
const qmap = await page.evaluate(() => ({
  cur: document.querySelectorAll('.station.cur').length,
  lock: document.querySelectorAll('.station.lock').length,
  n: typeof STATIONS !== 'undefined' ? STATIONS.length : 0
}));
ok(qmap.cur === 1 && qmap.n >= 40 && qmap.lock === qmap.n - 1,
   `bản đồ khoá đúng: ${qmap.cur} hiện tại, ${qmap.lock} 🔒 / ${qmap.n} trạm`);
await shot('quest-map');
await page.click('.station.lock', { force: true }); await page.waitForTimeout(400);
ok(await page.$eval('#quest-play', el => el.style.display !== 'flex'), 'trạm khoá: bấm không mở được');
const kinds = { quiz: 0, write: 0, en: 0, memory: 0, spell: 0 };
for (let idx = 0; idx < qmap.n; idx++) {
  const st = await page.evaluate(i => ({ t: STATIONS[i].t, kind: STATIONS[i].kind || null, nm: stationName(STATIONS[i]), done: questDone }), idx);
  if (st.done !== idx) { ok(false, `trạm ${idx + 1}: questDone=${st.done}, không tới lượt`); break; }
  const label = `Trạm ${idx + 1} ${st.nm}`;
  let passed = false;
  for (let attempt = 0; attempt < 3 && !passed; attempt++) {
    if (attempt > 0) { // lượt thử lại: ép về bản đồ (lượt trước có thể đang kẹt giữa quiz)
      await page.evaluate(() => { uiGen++; roundActive = false; questActive = null; $('#overlay').classList.remove('show'); ovCallback = null; showScreen('scr-quest'); });
      await page.waitForTimeout(500);
    }
    if (!(await active('scr-quest'))) { await page.click('[data-go="scr-quest"]').catch(() => {}); await page.waitForTimeout(500); }
    await page.click('.station.cur', { force: true }); await page.waitForTimeout(700);
    if (st.t === 'quiz') { kinds.quiz++; await smartQuiz('#qp-choices', label); }
    else if (st.t === 'write') { kinds.write++; await traceWrite(label); }
    else if (st.t === 'memory') { kinds.memory++; await solveMemory(label); }
    else if (st.kind === 'spell') { kinds.spell++; await solveSpell(label); }
    else { kinds.en++; await smartQuiz('#en-choices', label); }
    await page.waitForTimeout(600);
    passed = (await page.evaluate(() => questDone)) > idx;
  }
  ok(passed, `${label}: QUA TRẠM`);
  if (!passed) break;
}
const qEnd = await page.evaluate(() => ({ done: questDone, n: STATIONS.length, trophy: ($('#quest-trophy') || {}).textContent || '' }));
ok(qEnd.done === qEnd.n, `thám hiểm: chơi hết ${qEnd.done}/${qEnd.n} trạm (quiz ${kinds.quiz} · viết ${kinds.write} · EN ${kinds.en} · lật ${kinds.memory} · đánh vần ${kinds.spell})`);
ok(/🏆/.test(qEnd.trophy), `bản đồ: hiện cúp (${qEnd.trophy.trim()})`);
await shot('quest-cup');
ok(await goHome(), 'về home sau Thám hiểm');

// ===== 8. STICKER + ĐẢO 3D + PHỤ HUYNH =====
await page.click('#sticker-shelf'); await page.waitForTimeout(400);
ok(await active('scr-stickers'), 'mở kệ sticker');
const stkN = await page.$$eval('#sticker-grid .stk, #sticker-grid > *', els => els.length);
ok(stkN >= 24, `kệ sticker: ${stkN} ô`);
await page.click('#btn-island', { force: true }); await page.waitForTimeout(3000); // lần đầu chờ inject three.min.js (lazy-load)
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
await page.click('#btn-parent', { force: true }); await page.waitForTimeout(300);
const gate = await page.$eval('#pg-q', el => el.textContent);
const [ga, gb] = gate.split('×').map(s => parseInt(s));
await page.$$eval('#pg-choices .choice', (els, ans) => { const t = els.find(e => e.textContent === String(ans)); if (t) t.click(); }, ga * gb);
await page.waitForTimeout(400);
const ps = await page.$eval('#ps-grid', el => el.textContent);
ok(/Thám hiểm/.test(ps) && new RegExp(`${qEnd.n}/${qEnd.n} trạm`).test(ps), 'phụ huynh: thống kê ghi nhận hết trạm');
await shot('phu-huynh');
ok(await goHome(), 'về home sau Phụ huynh');

// ===== TỔNG KẾT =====
const stars1 = await page.$eval('#star-count', el => +el.textContent);
ok(stars1 > stars0, `bé kiếm được sao thật: ${stars0}⭐ → ${stars1}⭐`);
await shot('home-cuoi');
ok(errors.length === 0, errors.length ? `LỖI RUNTIME (${errors.length}): ${errors.slice(0, 5).join(' || ')}` : 'không lỗi console/pageerror/HTTP suốt phiên chơi');

await browser.close();
console.log(failed ? `\n${failed} FAIL` : '\nALL PASS');
process.exit(failed ? 1 : 0);
