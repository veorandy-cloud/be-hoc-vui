/* Smoke test E2E — Edge headless qua playwright-core (channel msedge, không tải browser).
   Chạy: (server đang chạy ở :8080) → node tests/e2e.mjs
   Fail bất kỳ assertion nào → exit 1. */
import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:8080';
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
// 2-pre. lazy-load Three.js: lúc MỞ APP chưa được parse (603KB chỉ nạp khi lần đầu bấm 🏝️)
ok(await page.evaluate(() => typeof window.THREE === 'undefined'),
   'lazy-load: Three.js KHÔNG tải lúc boot');
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
await page.waitForTimeout(3000); // lần đầu phải chờ inject three.min.js (603KB, localhost ~vài trăm ms)
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

// 3b-pre. đọc truyện: màn kể chuyện mở được, hiện tựa truyện (kể từng câu chạy nền)
await page.click('[data-go="scr-read"]');
await page.waitForTimeout(300);
await page.click('[data-level="story"]', { force: true });
await page.waitForTimeout(600);
const storyOpen = await page.$eval('#read-progress', el => el.textContent.includes('📖'));
const storyLines = await page.$$eval('#read-prompt .story-line', els => els.length);
ok(storyOpen && storyLines >= 5, `đọc truyện: mở được, ${storyLines} câu truyện hiển thị`);
const storyBank = await page.evaluate(() => ({
  n: STORIES.length,
  ok: STORIES.every(s => s.lines.length >= 5 && s.qs.length === 3 && Array.isArray(s.pics) && s.pics.length === s.lines.length)
}));
ok(storyBank.n >= 16, `đọc truyện: ≥16 truyện (thấy ${storyBank.n})`);
ok(storyBank.ok, 'đọc truyện: mỗi truyện có pics khớp số câu');
ok(!!(await page.$('#read-prompt .story-pic')), 'đọc truyện: hiện tranh câu đang kể');
await goHome();

// 3b-r4. từ/câu bám tuần bhv_learn (tuần 4: chưa chữ ghép ch/nh)
await page.click('[data-go="scr-read"]');
await page.waitForTimeout(300);
const r4 = await page.evaluate(() => {
  if (typeof wordUnlocked !== 'function') return { exists: false };
  const keep = Object.assign({}, learnWeek);
  learnWeek = { v: 9, d: 4 };
  const ca = wordUnlocked('con cá');
  const cho = wordUnlocked('con chó');
  const nha = wordUnlocked('cái nhà');
  const samples = Array.from({ length: 20 }, () => {
    const q = qWord();
    return (q.choices.find(c => c.correct) || {}).html;
  });
  learnWeek = keep;
  return { exists: true, ca, cho, nha, samples };
});
ok(r4.exists, 'đọc R4: có wordUnlocked');
if (!r4.exists) throw new Error('thiếu wordUnlocked');
ok(r4.ca === true && r4.cho === false && r4.nha === false,
  `đọc R4: tuần 4 mở cá, khóa chó/nhà (cá=${r4.ca} chó=${r4.cho} nhà=${r4.nha})`);
ok(!r4.samples.includes('con chó') && !r4.samples.includes('cái nhà'),
  `đọc R4: qWord không ra từ khóa (${r4.samples.slice(0,5).join(', ')})`);
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

// 3c. toán phạm vi 20: menu mới → vào lượt chơi có đáp án
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
await page.click('#math-menu [data-level="mix20"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const q20 = await page.$eval('#math-progress', el => el.textContent);
ok(/Câu 1 \/ 6/.test(q20), `toán phạm vi 20: lượt chơi khởi động (${q20.trim()})`);
await goHome();

// 3d. toán M1: khung mười (2×5) thay emoji-repeat — đếm 1–10 luôn có .ten-frame
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
await page.click('#math-menu [data-level="count"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const tfCount = await page.$eval('#math-prompt', el => ({
  frames: el.querySelectorAll('.ten-frame').length,
  filled: el.querySelectorAll('.ten-frame .dot.on').length,
  cells: el.querySelectorAll('.ten-frame .dot').length
}));
ok(tfCount.frames === 1, `toán đếm: đúng 1 khung mười (thấy ${tfCount.frames})`);
ok(tfCount.cells === 10, `toán đếm: khung 10 ô (thấy ${tfCount.cells})`);
ok(tfCount.filled >= 1 && tfCount.filled <= 10, `toán đếm: chấm đầy 1–10 (thấy ${tfCount.filled})`);
await goHome();

// 3e. toán M1 mix20: có khung mười trong quiz (prompt hoặc đáp án), không chuỗi emoji dài
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
await page.click('#math-menu [data-level="mix20"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const tf20 = await page.$eval('#math-quiz', el => {
  const frames = el.querySelectorAll('.ten-frame').length;
  const cells = [...el.querySelectorAll('.ten-frame')].map(f => f.querySelectorAll('.dot').length);
  const longEmoji = /(?:\p{Extended_Pictographic}[\uFE0F\u200D]*){12,}/u.test(el.textContent);
  return { frames, cells, longEmoji };
});
ok(tf20.frames >= 1, `toán 20: có khung mười (thấy ${tf20.frames})`);
ok(tf20.cells.every(n => n === 10), `toán 20: mỗi khung đúng 10 ô (${tf20.cells.join(',')})`);
ok(!tf20.longEmoji, 'toán 20: không emoji-repeat ≥12');
await goHome();

// 3f. toán M2 lời văn: menu mới → chuyện có số + khung mười + 3 đáp án
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
const storyBtn = await page.$('#math-menu [data-level="story"]');
ok(!!storyBtn, 'toán: có mục lời văn');
if (!storyBtn) throw new Error('thiếu #math-menu [data-level="story"]');
await storyBtn.click({ force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const st = await page.$eval('#math-quiz', el => {
  const story = el.querySelector('#math-prompt .math-story');
  const frames = el.querySelectorAll('.ten-frame').length;
  const cells = [...el.querySelectorAll('.ten-frame')].map(f => f.querySelectorAll('.dot').length);
  const txt = story ? story.textContent.trim() : '';
  return {
    txt, frames, cells,
    nChoices: el.querySelectorAll('#math-choices .choice').length,
    progress: (el.querySelector('#math-progress') || {}).textContent || ''
  };
});
ok(/Câu 1 \/ 6/.test(st.progress), `toán lời văn: lượt 6 câu (${st.progress.trim()})`);
ok(st.txt.length >= 20, `toán lời văn: có đoạn chuyện (${st.txt.length} ký tự)`);
ok(/\d/.test(st.txt), 'toán lời văn: chuyện có số');
ok(st.frames >= 1, `toán lời văn: có khung mười (thấy ${st.frames})`);
ok(st.cells.every(n => n === 10), `toán lời văn: mỗi khung đúng 10 ô (${st.cells.join(',')})`);
ok(st.nChoices === 3, `toán lời văn: 3 đáp án số (thấy ${st.nChoices})`);
for (const b of await page.$$('#math-choices .choice')) { await b.click({ force: true }); await page.waitForTimeout(120); }
const scls = await page.$$eval('#math-choices .choice', els => els.map(e => e.className).join(' '));
ok(/good/.test(scls), 'toán lời văn: chọn đáp án có phản hồi .good');
await goHome();

// 3g. toán M3 thành phần số
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
ok(!!(await page.$('#math-menu [data-level="bond"]')), 'toán: có mục thành phần');
await page.click('#math-menu [data-level="bond"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const bond = await page.$eval('#math-quiz', el => ({
  frames: el.querySelectorAll('.ten-frame').length,
  plus: [...el.querySelectorAll('#math-choices .choice')].filter(c => /\+/.test(c.textContent)).length,
  progress: (el.querySelector('#math-progress')||{}).textContent||''
}));
ok(/Câu 1 \/ 6/.test(bond.progress), `toán thành phần: lượt 6 câu (${bond.progress.trim()})`);
ok(bond.frames >= 1, `toán thành phần: có khung mười (thấy ${bond.frames})`);
ok(bond.plus === 3, `toán thành phần: 3 đáp án dạng a + b (thấy ${bond.plus})`);
await goHome();

// 3h. toán M4 hình
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
ok(!!(await page.$('#math-menu [data-level="shape"]')), 'toán: có mục hình');
await page.click('#math-menu [data-level="shape"]', { force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const shp = await page.$eval('#math-quiz', el => ({
  svg: !!el.querySelector('#math-prompt svg, #math-prompt .math-shape'),
  n: el.querySelectorAll('#math-choices .choice').length
}));
ok(shp.svg, 'toán hình: hiện 1 hình SVG');
ok(shp.n === 3, `toán hình: 3 tên hình (thấy ${shp.n})`);
await goHome();

// 3n. toán M5 cộng/trừ có nhớ phạm vi 20
await page.click('[data-go="scr-math"]');
await page.waitForTimeout(400);
const carryBtn = await page.$('#math-menu [data-level="carry"]');
ok(!!carryBtn, 'toán: có mục có nhớ');
if (!carryBtn) throw new Error('thiếu #math-menu [data-level="carry"]');
await carryBtn.click({ force: true });
await page.waitForSelector('#math-choices .choice', { timeout: 5000 });
const car = await page.$eval('#math-quiz', el => ({
  progress: (el.querySelector('#math-progress')||{}).textContent||'',
  frames: el.querySelectorAll('.ten-frame').length
}));
ok(/Câu 1 \/ 6/.test(car.progress), `toán có nhớ: lượt 6 câu (${car.progress.trim()})`);
ok(car.frames >= 1, `toán có nhớ: có khung mười (thấy ${car.frames})`);
const carQs = await page.evaluate(() => {
  if (typeof MATH_BUILDERS==='undefined' || !MATH_BUILDERS.carry) return { ok:false };
  const qs = MATH_BUILDERS.carry();
  const parse = q => {
    const m = (q.say||'').match(/(\d+)\s+(cộng|trừ)\s+(\d+)/);
    if (!m) return null;
    return { a:+m[1], op:m[2], b:+m[3] };
  };
  const rows = qs.map(parse);
  if (rows.some(r => !r)) return { ok:false, why:'say' };
  const good = rows.every(r => {
    if (r.op === 'cộng') return (r.a % 10) + (r.b % 10) >= 10 && r.a + r.b <= 20;
    return r.a % 10 < r.b && r.a - r.b >= 0 && r.a <= 20;
  });
  return { ok: good, n: rows.length };
});
ok(carQs.ok && carQs.n === 6, `toán có nhớ: 6 câu đều nhớ/mượn (ok=${carQs.ok} n=${carQs.n})`);
await goHome();

// 3i. tập viết: hàng đợi chữ yếu (chữ đạt 3 sao bị bỏ qua)
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(400);
const weakQ = await page.evaluate(() => {
  const keep = writeBest;
  writeBest = { a:3, ă:3 };
  wSet = 'low'; wIdx = 0;
  const i = nextWeakIdx();
  const ch = WRITE_SETS.low[i];
  writeBest = keep;
  return { ok: typeof nextWeakIdx === 'function' && ch !== 'a' && ch !== 'ă', ch };
});
ok(weakQ.ok, `tập viết: nextWeakIdx bỏ chữ đã 3 sao (ra '${weakQ.ch}')`);
await goHome();

// 3k. tập viết W2: tab tiếng — ghép ≥2 chữ, ≥2 nét mẫu
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(400);
const sylTab = await page.$('#scr-write [data-set="syl"]');
ok(!!sylTab, 'tập viết: có tab tiếng');
if (!sylTab) throw new Error('thiếu #scr-write [data-set="syl"]');
await sylTab.click({ force: true });
await page.waitForTimeout(500);
const syl = await page.evaluate(() => {
  const t = ($('#write-letter')||{}).textContent || '';
  const g = typeof glyphStrokes === 'function' ? glyphStrokes() : null;
  return {
    t: t.trim(),
    nLetters: [...t.trim()].length,
    nStrokes: g && g.strokes ? g.strokes.length : 0,
    wSet
  };
});
ok(syl.wSet === 'syl' && syl.nLetters >= 2, `tập viết tiếng: hiện tiếng ≥2 chữ ('${syl.t}')`);
ok(syl.nStrokes >= 2, `tập viết tiếng: ghép nét từ 2 chữ (thấy ${syl.nStrokes} nét)`);
await goHome();

// 3L. tập viết W3: chữ HOA mẫu VN (không còn Hershey in)
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(400);
await page.click('#scr-write [data-set="up"]', { force: true });
await page.waitForTimeout(400);
const hoa = await page.evaluate(() => {
  const A = STROKES.A, I = STROKES.I, D = STROKES.Đ;
  const hersheyA0 = JSON.stringify([0, 14.3]);
  return {
    wSet, ch: curChar(),
    nA: A && A.length, nI: I && I.length, nD: D && D.length,
    a0: A && A[0] && A[0][0],
    notHersheyA: JSON.stringify(A && A[0] && A[0][0]) !== hersheyA0
  };
});
ok(hoa.wSet === 'up', `tập viết HOA: tab up (chữ '${hoa.ch}')`);
ok(hoa.notHersheyA, `tập viết HOA: A không còn điểm đầu Hershey ${JSON.stringify(hoa.a0)}`);
ok(hoa.nI >= 3, `tập viết HOA: I ≥3 nét mẫu VN (Hershey=1, thấy ${hoa.nI})`);
ok(hoa.nA >= 3, `tập viết HOA: A ≥3 nét (thấy ${hoa.nA})`);
ok(hoa.nD >= 3, `tập viết HOA: Đ có nét gạch (thấy ${hoa.nD})`);
await goHome();

// 3m. tập viết W4: chép từ minh họa (≥3 chữ, ghép nét)
await page.click('[data-go="scr-write"]');
await page.waitForTimeout(400);
const wordTab = await page.$('#scr-write [data-set="word"]');
ok(!!wordTab, 'tập viết: có tab chép từ');
if (!wordTab) throw new Error('thiếu #scr-write [data-set="word"]');
await wordTab.click({ force: true });
await page.waitForTimeout(500);
const wrd = await page.evaluate(() => {
  const t = ($('#write-letter')||{}).textContent || '';
  const g = typeof glyphStrokes === 'function' ? glyphStrokes() : null;
  const pic = ($('#write-word .em')||{}).textContent || '';
  return {
    t: t.trim(),
    nLetters: [...t.trim()].length,
    nStrokes: g && g.strokes ? g.strokes.length : 0,
    pic, wSet
  };
});
ok(wrd.wSet === 'word' && wrd.nLetters >= 3, `tập viết từ: hiện từ ≥3 chữ ('${wrd.t}')`);
ok(wrd.nStrokes >= 4, `tập viết từ: ghép nét cả từ (thấy ${wrd.nStrokes} nét)`);
ok(wrd.pic.length >= 1, `tập viết từ: có hình minh họa ('${wrd.pic}')`);
await goHome();

// 3j. tiếng Anh: nút nghe câu + ôn từ yếu có mặt
await page.click('[data-go="scr-en"]');
await page.waitForTimeout(400);
ok(!!(await page.$('#en-g4')), 'tiếng Anh: có nút nghe câu');
ok(!!(await page.$('#en-weak')), 'tiếng Anh: có nút ôn từ yếu');
await page.click('#en-g4', { force: true });
await page.waitForSelector('#en-choices .choice', { timeout: 5000 });
const enc = await page.$eval('#en-progress', el => el.textContent);
ok(/Câu 1 \/ 6/.test(enc), `tiếng Anh câu: lượt 6 (${enc.trim()})`);
await goHome();

// 3k. E3 phonics: 26 chữ, từ có sẵn theo chữ đầu, Q/U/V/X vẫn có ≥1 từ
await page.click('[data-go="scr-en"]');
await page.waitForTimeout(400);
ok(!!(await page.$('#en-g5')), 'tiếng Anh: có nút phonics');
if (!(await page.$('#en-g5'))) throw new Error('thiếu #en-g5');
await page.click('#en-g5', { force: true });
await page.waitForTimeout(400);
const phx = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('#en-phx [data-letter]')];
  const letters = btns.map(b => (b.dataset.letter || '').toLowerCase()).join('');
  const wordsFn = typeof enPhonicsWords === 'function';
  const a = wordsFn ? enPhonicsWords('a').map(it => (it.w || it).toLowerCase()) : [];
  const q = wordsFn ? enPhonicsWords('q').map(it => (it.w || it).toLowerCase()) : [];
  const u = wordsFn ? enPhonicsWords('u').map(it => (it.w || it).toLowerCase()) : [];
  const v = wordsFn ? enPhonicsWords('v').map(it => (it.w || it).toLowerCase()) : [];
  const x = wordsFn ? enPhonicsWords('x').map(it => (it.w || it).toLowerCase()) : [];
  const init = w => String(w).toLowerCase().split(/[\s-]/)[0][0];
  return {
    n: btns.length, letters, wordsFn,
    aN: a.length, aOk: a.length >= 1 && a.every(w => init(w) === 'a'),
    qN: q.length, uN: u.length, vN: v.length,
    xN: x.length, xHasBox: x.includes('box')
  };
});
ok(phx.n === 26, `phonics: 26 chữ (thấy ${phx.n})`);
ok(phx.letters === 'abcdefghijklmnopqrstuvwxyz', `phonics: đủ a–z (${phx.letters})`);
ok(phx.wordsFn, 'phonics: có enPhonicsWords');
ok(phx.aOk && phx.aN >= 1, `phonics A: từ bắt đầu bằng a (n=${phx.aN})`);
ok(phx.qN >= 1 && phx.uN >= 1 && phx.vN >= 1, `phonics Q/U/V có từ (q=${phx.qN} u=${phx.uN} v=${phx.vN})`);
ok(phx.xN >= 1 && phx.xHasBox, `phonics X dùng box (n=${phx.xN})`);
await page.click('#en-phx [data-letter="a"]', { force: true });
await page.waitForTimeout(300);
const aTxt = await page.$eval('#en-phx-words', el => el.textContent.toLowerCase());
ok(/apple|ant|arm|angry/.test(aTxt), `phonics A: hiện từ minh họa (${aTxt.slice(0,40)})`);
ok(!!(await page.$('#en-phx-play')), 'phonics: có nút nghe chọn hình');
if (!(await page.$('#en-phx-play'))) throw new Error('thiếu #en-phx-play');
await page.click('#en-phx-play', { force: true });
await page.waitForSelector('#en-choices .choice', { timeout: 5000 });
const php = await page.$eval('#en-progress', el => el.textContent);
ok(/Câu 1 \//.test(php), `phonics quiz: có lượt chơi (${php.trim()})`);
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
// 4b. chấm hướng nét (nợ audit lần 3): nét VUÔNG GÓC với mẫu phải bị từ chối; nét tô đúng mẫu thì đậu
const dirTest = await page.evaluate(() => {
  const g = glyphStrokes();
  const t = g.strokes[0];
  const n = t.length, mid = t[Math.floor(n/2)];
  const dx = t[n-1][0]-t[0][0], dy = t[n-1][1]-t[0][1];
  const len = Math.hypot(dx,dy) || 40;
  const px = -dy/len, py = dx/len;                 // pháp tuyến với nét mẫu
  const half = len*0.45;
  const perp = [];
  for (let i=0;i<=20;i++){ const s=-half + 2*half*i/20; perp.push([mid[0]+px*s, mid[1]+py*s]); }
  const before = gStroke;
  guideCheck(perp);                                 // vuông góc → phải bị từ chối
  const rejected = gStroke === before;
  guideCheck(t.map(p=>[p[0], p[1]]));               // tô đúng mẫu → phải đậu
  return { rejected, advanced: gStroke === before+1 };
});
ok(dirTest.rejected, 'hướng nét: nét vuông góc với mẫu bị từ chối');
ok(dirTest.advanced, 'hướng nét: nét tô đúng mẫu vẫn đậu');
await page.evaluate(() => { wHist.reset(); redrawWrite(); }); // dọn state cho assertion sau
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

// 5e. D2: tô màu theo tuần — âm ghép tuần hiện tại lên đầu, vẫn đủ 32 tranh
const d2 = await page.evaluate(() => {
  if (typeof colorPicOrder !== 'function') return { exists: false };
  const keep = Object.assign({}, learnWeek);
  learnWeek = { v: 11, d: 6 };
  const a = colorPicOrder().map(i => PIC_META[i].nm);
  learnWeek = { v: 11, d: 4 };
  const b = colorPicOrder().map(i => PIC_META[i].nm);
  learnWeek = keep;
  const btns = [...document.querySelectorAll('#color-pics .btn')].map(el => el.textContent.trim());
  const weekN = document.querySelectorAll('#color-pics .btn.week').length;
  return { exists: true, n: a.length, a0: a[0], b0: b[0], btns0: btns[0] || '', weekN, btnN: btns.length };
});
ok(d2.exists, 'tô màu: có colorPicOrder');
if (!d2.exists) throw new Error('thiếu colorPicOrder');
ok(d2.n === picsN, `tô màu tuần: đủ ${picsN} tranh (thấy ${d2.n})`);
ok(d2.a0 === 'Nhà', `tô màu tuần 6: Nhà (nh) lên đầu (thấy '${d2.a0}')`);
ok(d2.b0 === 'Cá', `tô màu tuần 4: không âm ghép tuần 4, đầu vẫn Cá (thấy '${d2.b0}')`);
ok(d2.weekN >= 1, `tô màu: nút tuần này có class week (thấy ${d2.weekN})`);
ok(/Nhà/.test(d2.btns0), `tô màu UI: tuần 6 nút đầu là Nhà (${d2.btns0})`);

// 5f. D3: tô trong đường — góc ngoài, có vùng trong, chưa tô ratio=1, có chip; không phạt
ok(!!(await page.$('#color-in')), 'tô màu: có chỉ số trong đường');
if (!(await page.$('#color-in'))) throw new Error('thiếu #color-in');
const d3 = await page.evaluate(() => {
  if (typeof isColorInside !== 'function' || typeof colorInsideRatio !== 'function') return { exists: false };
  if (!lineMask) return { exists: true, mask: false };
  const out = isColorInside(2, 2) === false;
  let inn = false;
  for (let y = 20; y < 880 && !inn; y += 30)
    for (let x = 20; x < 1180; x += 30)
      if (isColorInside(x, y)) { inn = true; break; }
  const blank = colorInsideRatio();
  return { exists: true, mask: true, out, inn, blank };
});
ok(d3.exists, 'tô màu: có isColorInside + colorInsideRatio');
if (!d3.exists) throw new Error('thiếu isColorInside');
ok(d3.mask, 'tô trong đường: lineMask sẵn sàng');
ok(d3.out, 'tô trong đường: góc canvas là ngoài');
ok(d3.inn, 'tô trong đường: tranh có vùng trong nét');
ok(d3.blank === 1, `tô trong đường: chưa tô ratio=1 không phạt (thấy ${d3.blank})`);

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

// 5d. vẽ D1: theo mẫu — ≥3 bài (Mặt trời, Nhà, Cây), nét mẫu đứt đã vẽ
await page.click('[data-go="scr-draw"]');
await page.waitForTimeout(300);
const guideTab = await page.$('#tab-guide');
ok(!!guideTab, 'vẽ: có tab theo mẫu');
if (!guideTab) throw new Error('thiếu #tab-guide');
await guideTab.click({ force: true });
await page.waitForTimeout(700);
const gd = await page.evaluate(() => {
  const n = typeof DRAW_GUIDES !== 'undefined' ? DRAW_GUIDES.length : 0;
  const names = n ? DRAW_GUIDES.map(x => x.nm) : [];
  const cv = document.querySelector('#guide-line');
  let px = 0;
  if (cv && cv.width && cv.getContext) {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 40) px++;
  }
  return { n, names, px };
});
ok(gd.n >= 3, `vẽ theo mẫu: ${gd.n} bài (≥3)`);
ok(gd.names.includes('Mặt trời') && gd.names.includes('Nhà') && gd.names.includes('Cây'),
   `vẽ theo mẫu: có Mặt trời/Nhà/Cây (${gd.names.join(',')})`);
ok(gd.px > 400, `vẽ theo mẫu: nét mẫu đã vẽ (${gd.px} px)`);
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
const pianoN = await page.evaluate(() => Object.keys(pianoBuf).length);
ok(pianoN >= 17, `piano thật: ${pianoN}/17 sample đã decode (không còn nhạc bíp)`);
await page.evaluate(() => stopSong());
await goHome();

// 5g. Mu1: đàn 8 phím đồ giai điệu Twinkle (C4–C5)
await page.click('[data-go="scr-music"]');
await page.waitForTimeout(400);
await page.click('#song-list .menu-card:nth-child(2)', { force: true });
await page.waitForTimeout(400);
ok(!!(await page.$('#song-play')), 'nhạc: có nút đàn theo');
if (!(await page.$('#song-play'))) throw new Error('thiếu #song-play');
await page.click('#song-play', { force: true });
await page.waitForTimeout(400);
const kn = await page.$$eval('#piano-keys [data-midi]', els => els.map(e => +e.dataset.midi));
ok(kn.length === 8 && kn[0] === 60 && kn[7] === 72, `đàn: 8 phím C–C (${kn.join(',')})`);
ok(await page.evaluate(() => pianoExpect) === 60, 'đàn theo: nốt đầu Twinkle là Đô 60');
ok(await page.$eval('#piano-keys [data-midi="60"]', el => el.classList.contains('lit')),
   'đàn theo: phím Đô đang sáng');
await page.click('#piano-keys [data-midi="64"]', { force: true });
await page.waitForTimeout(150);
ok(await page.evaluate(() => pianoExpect) === 60, 'đàn theo: nốt sai không nhảy');
await page.click('#piano-keys [data-midi="60"]', { force: true });
await page.waitForTimeout(150);
ok(await page.evaluate(() => pianoExpect) === 60, 'đàn theo: nốt 2 Twinkle vẫn Đô');
await page.click('#piano-keys [data-midi="60"]', { force: true });
await page.waitForTimeout(150);
ok(await page.evaluate(() => pianoExpect) === 67, 'đàn theo: nốt 3 Twinkle là Sol 67');
await goHome();

// 5i. Mu2: gõ nhịp — 8 phách, gõ sớm không tính, gõ đúng phách +1
await page.click('[data-go="scr-music"]');
await page.waitForTimeout(400);
await page.click('#song-list .menu-card:nth-child(2)', { force: true });
await page.waitForTimeout(400);
ok(!!(await page.$('#song-tap')), 'nhạc: có nút gõ nhịp');
if (!(await page.$('#song-tap'))) throw new Error('thiếu #song-tap');
await page.click('#song-tap', { force: true });
await page.waitForTimeout(400);
ok(await page.$eval('#tap-pad', el => {
  const r = el.getBoundingClientRect();
  const vis = getComputedStyle(el).display !== 'none' && r.width > 0 && r.height > 0;
  return vis && r.width >= 44 && r.height >= 44;
}), 'gõ nhịp: có pad ≥44px');
const tapN = await page.evaluate(() => typeof tapTimes !== 'undefined' && tapTimes.length);
ok(tapN >= 8, `gõ nhịp: ≥8 phách (thấy ${tapN})`);
ok(await page.evaluate(() => typeof tapJudgeAt === 'function'), 'gõ nhịp: có tapJudgeAt');
if (!(await page.evaluate(() => typeof tapJudgeAt === 'function'))) throw new Error('thiếu tapJudgeAt');
const miss = await page.evaluate(() => {
  const i0 = tapExpectIdx, h0 = tapHits;
  tapJudgeAt(tapTimes[0] - 0.5);
  return { idx: tapExpectIdx, hits: tapHits, i0, h0 };
});
ok(miss.hits === miss.h0 && miss.idx === miss.i0, 'gõ nhịp: gõ sớm không tính');
const hit = await page.evaluate(() => {
  tapJudgeAt(tapTimes[0]);
  return { idx: tapExpectIdx, hits: tapHits };
});
ok(hit.hits === 1 && hit.idx === 1, `gõ nhịp: gõ đúng phách +1 (hits=${hit.hits} idx=${hit.idx})`);
await goHome();

// 5h. Q1: thám hiểm nối nội dung mới (truyện, viết tiếng, mix20/có nhớ, câu EN) + tên trạm + replay sao
await page.click('[data-go="scr-quest"]');
await page.waitForTimeout(400);
const q1 = await page.evaluate(() => {
  const storyQ = new Set(STORIES.flatMap(st => st.qs.map(x => x.q)));
  let story = false, mix20 = false;
  for (const s of STATIONS) {
    if (s.t !== 'quiz' || typeof s.q !== 'function') continue;
    const src = String(s.q);
    if (/mix20|carry/.test(src)) mix20 = true;
    try {
      const qs = s.q();
      if (qs.some(qq => storyQ.has(qq.say))) story = true;
    } catch (e) {}
  }
  const labels = [...document.querySelectorAll('#quest-map .station-nm')].map(el => el.textContent.trim()).filter(Boolean);
  return {
    lands: QUEST_LANDS.length,
    n: STATIONS.length,
    names: QUEST_LANDS.map(l => l.nm),
    story, mix20,
    syl: STATIONS.some(s => s.t === 'write' && s.set === 'syl'),
    sent: STATIONS.some(s => s.t === 'en' && (s.kind === 'sent' || s.kind === 'sentence')),
    labels: labels.length,
    label0: labels[0] || ''
  };
});
ok(q1.lands >= 7, `thám hiểm: ${q1.lands} vùng (≥7)`);
ok(q1.n >= 35, `thám hiểm: ${q1.n} trạm (≥35)`);
ok(q1.story, 'thám hiểm: có trạm đọc hiểu truyện');
ok(q1.syl, 'thám hiểm: có trạm viết tiếng (set syl)');
ok(q1.mix20, 'thám hiểm: có trạm mix20/có nhớ');
ok(q1.sent, 'thám hiểm: có trạm câu tiếng Anh');
ok(q1.labels >= 35, `bản đồ: tên trạm hiện đủ (${q1.labels})`);
ok(q1.label0.length >= 2, `bản đồ: trạm đầu có tên ('${q1.label0}')`);

const replay = await page.evaluate(() => {
  const keep = { qd: questDone, qa: questActive, st: stars };
  questDone = 3; questActive = 0;
  const before = stars;
  questComplete();
  const out = { dStars: stars - before, questDone, active: questActive };
  questDone = keep.qd; questActive = keep.qa; stars = keep.st;
  localStorage.setItem('bhv_quest', String(keep.qd));
  localStorage.setItem('bhv_stars', String(keep.st));
  return out;
});
ok(replay.dStars >= 1, `replay trạm cũ vẫn có sao (Δ${replay.dStars})`);
ok(replay.questDone === 3, `replay không tăng questDone (thấy ${replay.questDone})`);
ok(replay.active === null, 'replay xong questActive=null');
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

// 7b. phụ huynh: banner nhắc sao lưu khi có tiến độ mà >14 ngày chưa export
await page.evaluate(() => { localStorage.setItem('bhv_stars', '10'); }); // đảm bảo "có dữ liệu"
await page.click('#btn-parent', { force: true });
await page.waitForTimeout(300);
const gate = await page.$eval('#pg-q', el => el.textContent);
const [ga, gb] = gate.split('×').map(s => parseInt(s));
await page.$$eval('#pg-choices .choice', (els, ans) => {
  const t = els.find(e => e.textContent === String(ans));
  if (t) t.click();
}, ga * gb);
await page.waitForTimeout(400);
const bkBanner = await page.$eval('#ps-grid', el => el.textContent.includes('Chưa sao lưu hơn 14 ngày'));
ok(bkBanner, 'phụ huynh: banner nhắc sao lưu hiện khi chưa export >14 ngày');
const psTxt = await page.$eval('#ps-grid', el => el.textContent);
ok(/Tuần đọc|Vần tuần/.test(psTxt), 'phụ huynh: có tuần đọc');
ok(/Hôm nay|Mục tiêu/.test(psTxt), 'phụ huynh: có mục tiêu ngày');
await goHome();

// 8. không có lỗi console/pageerror trong toàn bộ phiên
ok(errors.length === 0, 'không có lỗi console/pageerror');
if (errors.length) errors.forEach(e => console.log('   ' + e));

await browser.close();
console.log(failed ? `\n${failed} FAIL` : '\nALL PASS');
process.exit(failed ? 1 : 0);
