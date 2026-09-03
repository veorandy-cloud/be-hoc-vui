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
  'Mình chơi lâu rồi, nghỉ mắt chút nhé!'
].forEach(vi);
// tập viết từng nét: nhắc số nét (tối đa 5 nét/chữ theo js/strokes.js)
['một','hai','ba','bốn','năm'].forEach(n => vi(`Bé vẽ nét số ${n} nhé!`));

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
(D.WRITE_SETS.syl||[]).forEach(s => vi(`Bé hãy viết tiếng ${s} nhé!`));
(D.WRITE_SETS.word||[]).forEach(s => vi(`Bé hãy viết từ ${s} nhé!`));
D.VN_LETTERS.forEach(ch => vi(`Đâu là chữ ${D.LETTER_NAMES[ch]}?`));

// vần có âm cuối + âm ghép (reading.js qVan2/qDigraph)
D.VAN2.forEach(v => v.words.forEach(wd => vi(`Vần gì trong tiếng ${wd.tieng}?`)));
D.DIGRAPHS.forEach(dg => dg.words.forEach(wd => vi(`Tiếng ${wd.tieng} bắt đầu bằng chữ gì?`)));

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

// toán lời văn 1 bước (math.js MATH_BUILDERS.story) — khớp 100% với say
[
  'Na có 3 quả táo. Mẹ cho thêm 2 quả. Na có tất cả mấy quả táo?',
  'Bo có 4 viên kẹo. Bạn cho thêm 3 viên. Bo có tất cả mấy viên kẹo?',
  'Có 5 con gà. Thêm 2 con gà. Tất cả mấy con gà?',
  'Na hái được 6 bông hoa. Hái thêm 1 bông. Na có mấy bông hoa?',
  'Có 2 cái bánh. Mẹ làm thêm 5 cái bánh. Tất cả mấy cái bánh?',
  'Bo có 7 viên bi. Cho bạn 3 viên. Bo còn mấy viên bi?',
  'Có 8 quả cam. Ăn mất 2 quả. Còn lại mấy quả cam?',
  'Na có 6 cái kẹo. Cho em 4 cái. Na còn mấy cái kẹo?',
  'Có 9 con cá. Bơi đi 5 con. Còn lại mấy con cá?',
  'Bo có 5 quả táo. Ăn 1 quả. Bo còn mấy quả táo?'
].forEach(vi);
for (let n = 2; n <= 10; n++) vi(`Số ${n} gồm mấy và mấy?`);
vi('Đây là hình gì?');
["It's a cat.","It's a dog.","It's an apple.","It's a bus.","I can run.","I can jump.","The sun is hot.","I see a bird."].forEach(en);

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

// đảo sticker 3D (island.js)
vi('Đây là Đảo Sticker của bé! Chạm vào sticker để nghe tên nhé!');
vi('Đảo còn trống! Bé kiếm sao đổi sticker để đảo đông vui nhé!');

fs.writeFileSync(path.join(__dirname, 'phrases.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('phrases:', out.length,
  'vi:', out.filter(p => p.lang === 'vi').length,
  'en:', out.filter(p => p.lang === 'en').length);
