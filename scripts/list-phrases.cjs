/* Liệt kê mọi câu app sẽ nói -> scripts/phrases.json
   QUAN TRỌNG: chuỗi ở đây phải khớp 100% với chuỗi speak() trong js/app.js */
const D = require('../js/data.js');
const fs = require('fs');
const path = require('path');

const out = []; // {t, lang}
const seen = new Set();
function add(t, lang, kind) {
  const key = lang + '|' + t;
  if (seen.has(key)) return;
  seen.add(key);
  out.push(kind ? { t, lang, kind } : { t, lang });
}
const vi = t => add(t, 'vi');
const en = t => add(t, 'en');

// system + mascot (HELLO không nằm đây: helloLine() chỉ hiển thị text, không speak)
[...D.PRAISE, ...D.CHEER, ...D.JOKES].forEach(vi);
[
  'Bé hãy viết theo nét mờ nhé!',
  'Bé hãy lật hình để tìm cặp giống nhau nhé!',
  'Bé hãy hoàn thành trạm phía trước đã nhé!',
  'Trạm trùm đây! Bé cố lên nhé!',
  'Đã lưu tranh của bé! Đẹp lắm!',
  'Chạm vào thẻ, nghe từ, rồi bé nói theo nhé!',
  'Bé hát hay quá!',
  'Bộ nhớ đầy rồi, không lưu được tranh bé ơi!',
  'Tranh bị lỗi, bé chọn tranh khác nhé!',
  'Cô chưa nghe thấy, bé nói to hơn nhé!',
  'Máy chưa cho phép micro, bé nhờ bố mẹ giúp nhé!',
  'Cần có mạng để cô nghe bé đọc nhé!',
  'Bấm lần nữa để xoá nhé!',
  'Bấm lần nữa để về nhà, lượt chơi này sẽ mất nhé!',
  'Album đầy rồi, tranh cũ nhất sẽ được thay nhé!',
  'Bé xem cô viết mẫu nhé!',
  'Chưa đúng nét, bé thử lại nhé!',
  'Chưa đúng chiều nét, bé xem cô vẽ nhé!',
  'Gần đúng rồi! Bé vẽ cả nét một hơi nhé!',
  'Bé đặt bút ở chấm vàng nhé!',
  'Bấm lần nữa để nhập dữ liệu và ghi đè nhé!',
  'Bé tô màu trước rồi lưu nhé!',
  'Bé tô trong đường nét nhé!',
  'Mình chơi lâu rồi, nghỉ mắt chút nhé!',
  'Bé bấm phím đang sáng nhé!',
  'Bé gõ theo nhịp nhé!',
  'Bé ghép chữ cái thành từ nhé!'
].forEach(vi);
// tập viết từng nét: nhắc số nét — chữ đơn ≤5 nét (đọc chữ), tiếng/từ nhiều chữ + dấu thanh tới ~24 nét (writing.js NUMVI[i]||i+1 → chữ số)
['một','hai','ba','bốn','năm'].forEach(n => vi(`Bé vẽ nét số ${n} nhé!`));
for (let n = 6; n <= 24; n++) vi(`Bé vẽ nét số ${n} nhé!`);

// tập đọc — Đọc theo: đọc cả câu hoàn chỉnh (stripDeco PHẢI khớp 100% với app.js)
const stripDeco = s => s.replace(/[^\p{L}\p{N}\s,!?.]/gu, '').replace(/\s+/g, ' ').trim();
D.SENTENCES.forEach(s => vi(stripDeco(s.html.replace('___', s.a))));

// tập đọc — Ghép vần: đọc tiếng vừa ghép được + chuỗi đánh vần SGK ('bờ, a, ba, huyền, bà')
D.TONE_SETS.flat().forEach(t => vi(t));
D.TONE_SETS.flat().forEach(t => vi(D.spellTieng(t)));

// chữ cái & số (tập viết + tập đọc)
for (const [ch, name] of Object.entries(D.LETTER_NAMES)) {
  const isDigit = /^\d$/.test(ch);
  if (isDigit) {
    vi(`Số ${name}`);
    vi(`Bé hãy viết số ${name} nhé!`);
  } else {
    vi(`Chữ ${name}`);
    vi(`Chữ ${name} hoa`);
    vi(`Bé hãy viết chữ ${name} nhé!`);
    vi(`Bé hãy viết chữ ${name} hoa nhé!`);
  }
}
(D.WRITE_SETS.syl||[]).forEach(s => { vi(`Bé hãy viết tiếng ${s} nhé!`); vi(s); }); // 🔊 đọc tiếng
(D.WRITE_SETS.word||[]).forEach(s => vi(`Bé hãy viết từ ${s} nhé!`));
Object.values(D.SYL_EX).forEach(ex => vi(ex.w));
Object.values(D.WORD_EX).forEach(ex => vi(ex.w));
D.VN_LETTERS.forEach(ch => vi(`Đâu là chữ ${D.LETTER_NAMES[ch]}?`));

// vần có âm cuối + âm ghép (reading.js qVan2/qDigraph); Ghép vần đọc tên âm ghép khi chạm thẻ ('Chữ chờ')
D.VAN2.forEach(v => v.words.forEach(wd => vi(`Vần gì trong tiếng ${wd.tieng}?`)));
D.DIGRAPHS.forEach(dg => { dg.words.forEach(wd => vi(`Tiếng ${wd.tieng} bắt đầu bằng chữ gì?`)); vi(`Chữ ${dg.name}`); });

// vần + dấu thanh + từ + câu
D.VAN_ITEMS.forEach(([c, v]) =>
  vi(`${D.LETTER_NAMES[c]} ghép với ${D.LETTER_NAMES[v]}, được tiếng gì?`));
D.TONE_SETS.flat().forEach(t => vi(`Tìm tiếng: ${t}`));
D.WORD_ITEMS.forEach(w => vi(`Tìm từ: ${w.w}`));
D.SENTENCES.forEach(s => vi(s.say));

// từ minh hoạ tập viết
Object.values(D.EXAMPLES).forEach(ex => vi(ex.w));

// tiếng Anh
for (const items of Object.values(D.EN_THEMES)) {
  items.forEach(it => { en(it.w); vi(`Từ nào là ${it.vi}?`); });
}
en('Great job!');
en('Almost! Try again!');
en('queen'); en('umbrella'); en('van');
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(en);

// bài hát (dân ca Việt có lang:'vi-VN' — đọc giọng Việt); LỜI hát tag kind:'song' → gen pitch/rate tươi hơn
D.SONGS.forEach(s => {
  const lg = s.lang === 'vi-VN' ? 'vi' : 'en';
  add(s.title, lg);
  s.lines.forEach(l => add(l.t, lg, 'song'));
});

// sticker (thường + tier VÀNG: GOLD_COST/GOLD_BASE phải khớp app.js)
const GOLD_COST = 15, GOLD_BASE = D.STICKERS.length * D.STICKER_COST;
D.STICKERS.forEach((s, i) => {
  vi(s.nm);
  vi(`Chúc mừng bé! Bé nhận được sticker ${s.nm}!`);
  vi(`Tuyệt đỉnh! Bé nhận được sticker vàng: ${s.nm}!`);
  vi(`Bé cần ${(i + 1) * D.STICKER_COST} sao để mở sticker này nhé!`);
  vi(`Bé cần ${GOLD_BASE + (i + 1) * GOLD_COST} sao để mở sticker này nhé!`);
});

// toán 0-10 (math.js) — số dạng chữ số, edge-tts đọc chuẩn
vi('Bé đếm xem có bao nhiêu hình nhé!');
vi('Bên nào có nhiều hơn?');
for (let a = 1; a <= 9; a++) for (let b = 1; a + b <= 10; b++) vi(`${a} cộng ${b} bằng mấy?`);
for (let a = 1; a <= 10; a++) for (let b = 1; b <= a; b++) vi(`${a} trừ ${b} bằng mấy?`);

// toán lời văn 1 bước (math.js MATH_BUILDERS.story) — bank dùng chung trong data.js
D.MATH_STORY_BANK.forEach(s => vi(s.say));
for (let n = 2; n <= 10; n++) vi(`Số ${n} gồm mấy và mấy?`);
// toán HK2 (math.js hundred/order/time/measure)
vi('Có bao nhiêu que tính?');
for (let n = 11; n <= 100; n++) vi(`Bé tìm số ${n} nhé!`);
vi('Số nào lớn hơn?');
D.MATH_100.add.forEach(([a, b]) => vi(`${a} cộng ${b} bằng mấy?`));
D.MATH_100.sub.forEach(([a, b]) => vi(`${a} trừ ${b} bằng mấy?`));
vi('Số liền sau của số này là mấy?');
vi('Số liền trước của số này là mấy?');
vi('Số nào còn thiếu trong dãy?');
vi('Đồng hồ chỉ mấy giờ?');
D.WEEKDAYS.forEach(d => { vi(`Hôm nay là ${d}. Ngày mai là thứ mấy?`); vi(`Hôm nay là ${d}. Hôm qua là thứ mấy?`); });
vi('Bút chì dài mấy xăng ti mét?');
vi('Cái nào dài hơn?');
// câu tiếng Anh Starters (data.js EN_STARTERS — english.js startEnSentences)
D.EN_STARTERS.forEach(s => en(s.say));

// ===== CHẠM LÀ NGHE (core.js runQuiz: choice.say hoặc text thuần của đáp án) =====
for (let n = 0; n <= 100; n++) vi(String(n));                                    // đáp án số, đếm bằng ngón tay
for (let p = 1; p <= 10; p++) for (let q = p; q <= 10; q++) vi(`${p} cộng ${q}`); // thành phần số
D.VAN_ITEMS.forEach(([c]) => {                                                    // qVan: mirror pool nguyên âm theo luật k/gh
  const pool = (c === 'c' || c === 'g') ? D.VOWELS.filter(x => !['e', 'ê', 'i'].includes(x)) : c === 'k' ? ['e', 'ê', 'i'] : D.VOWELS;
  pool.forEach(v => vi(c + v));
});
D.VAN2.forEach(v => vi(v.van));                                                   // vần cuối
D.TONE_SETS.flat().forEach(t => vi(D.splitTieng(t)[1]));                          // Ghép vần: thẻ vần + dấu
D.WORD_ITEMS.forEach(w => vi(w.w));                                               // từ ngữ
D.SENTENCES.forEach(s => { vi(s.a); s.d.forEach(vi); });                          // điền câu
D.STORIES.forEach(st => st.qs.forEach(q => q.c.forEach(vi)));                     // đáp án hiểu truyện
for (let h = 1; h <= 12; h++) vi(`${h} giờ`);
for (let n = 1; n <= 10; n++) vi(`${n} xăng ti mét`);
D.WEEKDAYS.forEach(vi);
['vuông', 'tròn', 'tam giác', 'chữ nhật'].forEach(n => { vi(`Đâu là hình ${n}?`); vi(`hình ${n}`); });
['lập phương', 'hộp chữ nhật'].forEach(n => { vi(`Đâu là khối ${n}?`); vi(`khối ${n}`); });
// tên bài / khu cô đọc khi chạm thẻ (cfg.title, data-say, big-card) — mirror index.html
['Chữ cái', 'Vần và dấu', 'Vần cuối', 'Chữ ghép', 'Từ ngữ', 'Điền câu', 'Đọc theo', 'Ghép vần', 'Đọc truyện', 'Trộn tất cả',
 'Đếm số', 'Phép cộng', 'Phép trừ', 'Nhiều hơn', 'Phạm vi 20', 'Có nhớ', 'Lời văn', 'Thành phần', 'Hình và khối', 'Đến 100', 'Dãy số', 'Xem giờ', 'Đo xăng ti mét',
 'Tập đọc', 'Tiếng Anh', 'Toán', 'Thám hiểm', 'Ca hát',
 'Nghe chọn hình', 'Chọn từ đúng', 'Lật hình', 'Nghe câu', 'Âm chữ cái tiếng Anh', 'Đánh vần', 'Ôn từ yếu',
 'Vẽ tự do', 'Tô màu', 'Hát cùng nhạc', 'Bài khác', 'Bộ sưu tập sticker'].forEach(vi);
// lời dẫn lần đầu (introOnce) + khoá HK2 + hỏi lại câu sai
['Bé nghe cô hỏi, rồi chạm vào đáp án đúng nhé!', 'Bé chạm từng chấm để đếm, rồi chọn số đúng nhé!',
 'Bé chạm chữ cái, rồi chạm vần để ghép thành tiếng nhé!', 'Cô đọc trước, bé đọc theo thật to nhé!',
 'Bé nghe từ, rồi chạm vào hình đúng nhé!', 'Bé nghe tiếng Việt, rồi chạm vào từ tiếng Anh đúng nhé!',
 'Bé nghe câu, rồi chạm vào hình đúng nhé!', 'Bé chạm chữ cái để xem từ bắt đầu bằng chữ đó nhé!',
 'Bé chọn màu rồi vẽ thoả thích nhé!', 'Bé chọn tranh, chọn màu rồi tô nhé! Bấm cái xô để đổ màu.',
 'Bé chơi qua từng trạm để mở đường mới nhé!',
 'Bé chơi thật giỏi các bài toán khác để mở khoá nhé!', 'Bé mở được bài mới rồi! Chạm vào thẻ mới xem nhé!',
 'Bé sửa đúng rồi, giỏi quá!'].forEach(vi);
// 🔍 Bé có biết? (core.js showResult)
D.FACTS.forEach(f => vi(f.t));

// toán phạm vi 20 (math.js qAdd20/qSub20 — KHÔNG NHỚ: mirror ĐÚNG logic sinh câu, thêm bao nhiêu liệt kê bấy nhiêu)
for (let b = 1; b <= 10; b++) vi(`10 cộng ${b} bằng mấy?`);
for (let a = 11; a <= 16; a++) for (let b = 1; b <= 9 - (a % 10); b++) vi(`${a} cộng ${b} bằng mấy?`);
for (let a = 11; a <= 19; a++) {
  vi(`${a} trừ 10 bằng mấy?`);
  for (let b = 1; b <= a % 10; b++) vi(`${a} trừ ${b} bằng mấy?`);
}

// toán M5 cộng/trừ CÓ NHỚ phạm vi 20 — mirror qAddCarry/qSubBorrow
for (let a = 2; a <= 9; a++)
  for (let b = 10 - a; b <= 9; b++)
    vi(`${a} cộng ${b} bằng mấy?`);
for (let a = 11; a <= 19; a++)
  for (let b = 1; b <= 9; b++)
    if ((a % 10) + b >= 10 && a + b <= 20) vi(`${a} cộng ${b} bằng mấy?`);
for (let a = 11; a <= 19; a++)
  for (let b = 1; b <= 9; b++)
    if (b > a % 10) vi(`${a} trừ ${b} bằng mấy?`);

// đọc truyện (reading.js startStory): lời dẫn + tựa + từng câu + từng câu hỏi hiểu
D.STORIES.forEach(st => {
  vi(`Cô kể cho bé nghe truyện: ${st.title}. Bé nghe kỹ nhé!`);
  vi(st.title);
  st.lines.forEach(l => vi(l));
  st.qs.forEach(q => vi(q.q));
});

// tô màu xong → reveal ảnh thật (drawing.js showPicReveal)
D.PIC_META.forEach(p => {
  vi(`Bé tô xong bức tranh ${p.nm} rồi! Đẹp tuyệt vời!`);
  if (p.en) en(p.en);
});

// vẽ theo mẫu (drawing.js loadGuide / g-save)
(D.DRAW_GUIDES||[]).forEach(g => vi(`Bé hãy vẽ ${g.nm} theo mẫu nhé!`));
vi('Bé vẽ theo mẫu trước rồi lưu nhé!');

// đảo sticker 3D (island.js)
vi('Đây là Đảo Sticker của bé! Chạm vào sticker để nghe tên nhé!');
vi('Đảo còn trống! Bé kiếm sao đổi sticker để đảo đông vui nhé!');

fs.writeFileSync(path.join(__dirname, 'phrases.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('phrases:', out.length,
  'vi:', out.filter(p => p.lang === 'vi').length,
  'en:', out.filter(p => p.lang === 'en').length);
