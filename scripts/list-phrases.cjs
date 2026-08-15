/* Liệt kê mọi câu app sẽ nói -> scripts/phrases.json
   QUAN TRỌNG: chuỗi ở đây phải khớp 100% với chuỗi speak() trong js/app.js */
const D = require('../js/data.js');
const fs = require('fs');
const path = require('path');

const out = []; // {t, lang}
const seen = new Set();
function add(t, lang) {
  const key = lang + '|' + t;
  if (seen.has(key)) return;
  seen.add(key);
  out.push({ t, lang });
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
  'Chưa đúng nét, bé thử lại nhé!'
].forEach(vi);
// tập viết từng nét: nhắc số nét (tối đa 5 nét/chữ theo js/strokes.js)
['một','hai','ba','bốn','năm'].forEach(n => vi(`Bé vẽ nét số ${n} nhé!`));

// tập đọc — Đọc theo: đọc cả câu hoàn chỉnh (stripDeco PHẢI khớp 100% với app.js)
const stripDeco = s => s.replace(/[^\p{L}\p{N}\s,!?.]/gu, '').replace(/\s+/g, ' ').trim();
D.SENTENCES.forEach(s => vi(stripDeco(s.html.replace('___', s.a))));

// tập đọc — Ghép vần: đọc tiếng vừa ghép được
D.TONE_SETS.flat().forEach(t => vi(t));

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
D.VN_LETTERS.forEach(ch => vi(`Đâu là chữ ${D.LETTER_NAMES[ch]}?`));

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

// bài hát
D.SONGS.forEach(s => { en(s.title); s.lines.forEach(l => en(l.t)); });

// sticker (thường + tier VÀNG: GOLD_COST/GOLD_BASE phải khớp app.js)
const GOLD_COST = 15, GOLD_BASE = D.STICKERS.length * D.STICKER_COST;
D.STICKERS.forEach((s, i) => {
  vi(s.nm);
  vi(`Chúc mừng bé! Bé nhận được sticker ${s.nm}!`);
  vi(`Tuyệt đỉnh! Bé nhận được sticker vàng: ${s.nm}!`);
  vi(`Bé cần ${(i + 1) * D.STICKER_COST} sao để mở sticker này nhé!`);
  vi(`Bé cần ${GOLD_BASE + (i + 1) * GOLD_COST} sao để mở sticker này nhé!`);
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
