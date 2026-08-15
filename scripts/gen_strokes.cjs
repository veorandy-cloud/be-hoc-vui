/* Sinh js/strokes.js — dữ liệu THỨ TỰ NÉT cho tập viết (Phase 3)
   Nguồn: font 1-nét Hershey futural (public domain, scripts/hershey.json từ techninja/hersheytextjs)
   + 4 dấu tiếng Việt tự định nghĩa (breve ă, mũ â/ê/ô, móc ơ/ư, gạch đ).
   Chạy: node scripts/gen_strokes.cjs */
const fs = require('fs');
const path = require('path');
const H = JSON.parse(fs.readFileSync(path.join(__dirname, 'hershey.json'), 'utf8')).futural;

function glyph(ch) {
  const g = H.chars[ch.charCodeAt(0) - 33];
  if (!g || !g.d) throw new Error('no glyph: ' + ch);
  // "M9,1 L1,22 M9,1 L17,22" → [[[9,1],[1,22]], [[9,1],[17,22]]]
  const strokes = [];
  for (const seg of g.d.split('M').filter(s => s.trim())) {
    const pts = seg.replace(/L/g, ' ').trim().split(/\s+/)
      .map(p => p.split(',').map(Number)).filter(p => p.length === 2 && !p.some(isNaN));
    if (pts.length >= 2) strokes.push(pts);
  }
  return strokes;
}
const bbox = strokes => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of strokes) for (const [x, y] of s) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2 };
};
const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);

// dấu đặt phía trên chữ (toạ độ cục bộ quanh 0,0; y-âm là lên trên)
const MARKS = {
  breve: [[[-3, -2], [-1.5, 0], [1.5, 0], [3, -2]]],              // ˘ cong lòng chảo
  hat:   [[[-3, 0], [0, -3.5], [3, 0]]],                          // ^ nón
  horn:  [[[0, 1.5], [2.2, -0.5], [1.6, -3]]]                     // ̛ móc cong lên phải
};
function compose(base, mark, at) { // at: 'top' | 'topRight'
  const b = bbox(base);
  const dx = at === 'topRight' ? b.x1 + 0.5 : b.cx;
  const dy = b.y0 - 2;
  return [...base, ...MARKS[mark].map(s => shift(s, dx, dy))];
}
function dBar(base, upper) { // gạch ngang chữ đ/Đ
  const b = bbox(base);
  const y = upper ? (b.y0 + b.y1) / 2 : b.y0 + 3.5;
  const seg = upper ? [[b.x0 - 2, y], [b.x0 + 5, y]] : [[b.cx - 1, y], [b.x1 + 2.5, y]];
  return [...base, seg];
}

const out = {};
for (const ch of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') out[ch] = glyph(ch);
// chữ THƯỜNG thay bằng mẫu tập viết tiếng Việt (nét cong kín + móc, khuyết, thắt — đúng thứ tự nét
// Bộ GD-ĐT); HOA in + số giữ Hershey (chữ in hoa & chữ số viết giống quốc tế)
const { VN_LOW } = require('./vn_lowercase.cjs');
for (const ch in VN_LOW) out[ch] = VN_LOW[ch];
for (const [vn, base, mark] of [
  ['ă','a','breve'],['â','a','hat'],['ê','e','hat'],['ô','o','hat'],
  ['Ă','A','breve'],['Â','A','hat'],['Ê','E','hat'],['Ô','O','hat']
]) out[vn] = compose(out[base], mark, 'top');
for (const [vn, base] of [['ơ','o'],['ư','u'],['Ơ','O'],['Ư','U']])
  out[vn] = compose(out[base], 'horn', 'topRight');
out['đ'] = dBar(out['d'], false);
out['Đ'] = dBar(out['D'], true);

// chuẩn hoá về khung cao 100 (chung toàn bộ để giữ tỉ lệ chữ cao/thấp), x canh giữa 0
let Y0 = 1e9, Y1 = -1e9;
for (const ch in out) { const b = bbox(out[ch]); Y0 = Math.min(Y0, b.y0); Y1 = Math.max(Y1, b.y1); }
const k = 100 / (Y1 - Y0);
const final = {};
let maxStrokes = 0;
for (const ch in out) {
  const cx = bbox(out[ch]).cx;
  final[ch] = out[ch].map(s => s.map(([x, y]) => [+( (x - cx) * k ).toFixed(1), +(( y - Y0) * k).toFixed(1)]));
  maxStrokes = Math.max(maxStrokes, final[ch].length);
}

const js = '"use strict";\n/* SINH TU DONG boi scripts/gen_strokes.cjs - dung sua tay. ' +
  'Thu tu net theo font Hershey futural (public domain). Khung: cao 100, x canh giua 0. */\n' +
  'const STROKES = ' + JSON.stringify(final) + ';\n' +
  "if (typeof module !== 'undefined') module.exports = { STROKES };\n";
fs.writeFileSync(path.join(__dirname, '..', 'js', 'strokes.js'), js, 'utf8');
console.log('done:', Object.keys(final).length, 'glyphs, max strokes:', maxStrokes,
  '| size:', Math.round(js.length / 1024) + 'KB');
