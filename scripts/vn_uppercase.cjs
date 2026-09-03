/* Chữ HOA theo mẫu tập viết tiếng Việt (Bộ GD-ĐT — chữ viết đứng, nét đều).
   Cùng hệ toạ độ vn_lowercase.cjs: baseline y=22, đỉnh cap y=1, kẻ 2 y=13.6.
   Chữ HOA lấp TOP→B (như h/b khuyết trên), không phải x-height. */
'use strict';

const B = 22, X = 13.6, TOP = 1, MID = 17.8;
const W = 6;       // half-width typical (~±5..7)
const WM = 7;      // M, W
const CY = (TOP + B) / 2;   // 11.5
const RH = (B - TOP) / 2;   // 10.5
const lerp = (a, b, t) => a + (b - a) * t;
function Q(p0, c, p1, n = 12) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
              u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
  }
  return out;
}
function C(p0, c1, c2, p1, n = 14) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p1[0],
              u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p1[1]]);
  }
  return out;
}
const L = (p0, p1, n = 6) => Array.from({length: n + 1}, (_, i) => [lerp(p0[0], p1[0], i/n), lerp(p0[1], p1[1], i/n)]);
function arc(cx, cy, rx, ry, a0, a1, n = 28) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n) * Math.PI / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
function chain(...segs) {
  const out = [...segs[0]];
  for (let i = 1; i < segs.length; i++) out.push(...segs[i].slice(1));
  return out.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
}

const G = {};
// A: đỉnh TOP xuống trái; đỉnh xuống phải; gạch ngang ~y=12
const aT = (12 - TOP) / (B - TOP);
G.A = [
  L([0, TOP], [-W - 0.4, B], 8),
  L([0, TOP], [W, B], 8),
  L([(-W - 0.4) * aT, 12], [W * aT, 12], 5)
];
// B: sổ trái; 2 vòng từ đỉnh (một nét)
G.B = [
  L([-W, TOP], [-W, B], 8),
  chain(
    arc(-W, 5.5, W * 1.9, 4.5, -90, 90, 16),
    arc(-W, 16, W * 2.05, 6, -90, 90, 18)
  )
];
// C: cung mở phải, full height
G.C = [arc(0, CY, W, RH, -40, -320, 28)];
// D: sổ trái; vòng D
G.D = [
  L([-W, TOP], [-W, B], 8),
  arc(-W, CY, W * 2, RH, -90, 90, 22)
];
// E: sổ; gạch trên; giữa; dưới
G.E = [
  L([-W, TOP], [-W, B], 8),
  L([-W, TOP], [W, TOP], 6),
  L([-W, CY], [W * 0.72, CY], 5),
  L([-W, B], [W, B], 6)
];
// F: sổ; trên; giữa
G.F = [
  L([-W, TOP], [-W, B], 8),
  L([-W, TOP], [W, TOP], 6),
  L([-W, CY], [W * 0.72, CY], 5)
];
// G: như C (khép hơn tới phải giữa) + gạch vào trong
G.G = [
  arc(0, CY, W, RH, -38, -358, 30),
  L([W, CY], [0.3, CY], 5)
];
// H: sổ trái; sổ phải; gạch giữa
G.H = [
  L([-W, TOP], [-W, B], 8),
  L([W, TOP], [W, B], 8),
  L([-W, CY], [W, CY], 6)
];
// I: gạch trên; sổ giữa; gạch dưới (3 nét — khác Hershey 1 nét)
G.I = [
  L([-3.2, TOP], [3.2, TOP], 5),
  L([0, TOP], [0, B], 8),
  L([-3.2, B], [3.2, B], 5)
];
// J: gạch trên; móc J
G.J = [
  L([-3.2, TOP], [3.4, TOP], 5),
  chain(
    L([1.1, TOP], [1.1, 16.2], 6),
    C([1.1, 16.2], [1.1, B + 0.4], [-3.2, B + 0.3], [-3.6, 18.2])
  )
];
// K: sổ; nhánh trên; nhánh dưới
G.K = [
  L([-W, TOP], [-W, B], 8),
  L([-W, CY], [W, TOP], 7),
  L([-W, CY], [W, B], 7)
];
// L: sổ; gạch đáy
G.L = [
  L([-W, TOP], [-W, B], 8),
  L([-W, B], [W, B], 6)
];
// M: 4 sổ chạm TOP và B
G.M = [
  L([-WM, TOP], [-WM, B], 8),
  L([-WM, TOP], [0, B], 8),
  L([WM, TOP], [0, B], 8),
  L([WM, TOP], [WM, B], 8)
];
// N: sổ trái; chéo; sổ phải
G.N = [
  L([-W, TOP], [-W, B], 8),
  L([-W, TOP], [W, B], 8),
  L([W, TOP], [W, B], 8)
];
// O: ellipse full height
G.O = [arc(0, CY, W, RH, -90, -450, 32)];
// P: sổ; vòng trên
G.P = [
  L([-W, TOP], [-W, B], 8),
  arc(-W, 6.25, W * 1.95, 5.25, -90, 90, 18)
];
// Q: O + đuôi
G.Q = [
  arc(0, CY, W, RH, -90, -450, 32),
  L([1.8, 17.2], [W + 1.1, B + 1.4], 6)
];
// R: sổ; vòng P; chân chéo
G.R = [
  L([-W, TOP], [-W, B], 8),
  arc(-W, 6.25, W * 1.95, 5.25, -90, 90, 18),
  L([-W + 1.2, CY], [W, B], 7)
];
// S: S full height (hai cung)
G.S = [chain(
  arc(0, 6.25, W * 0.95, 5.25, -32, -270, 18),
  arc(0, 16.75, W * 0.95, 5.25, -90, 165, 18)
)];
// T: gạch trên; sổ
G.T = [
  L([-W, TOP], [W, TOP], 6),
  L([0, TOP], [0, B], 8)
];
// U: đáy cong, 2 nhánh TOP
G.U = [chain(
  L([-W, TOP], [-W, 14.2], 6),
  arc(0, 14.2, W, B - 14.2, 180, 360, 16),
  L([W, 14.2], [W, TOP], 6)
)];
// V: hai nét chéo gặp nhau ở B
G.V = [
  L([-W, TOP], [0, B], 8),
  L([W, TOP], [0, B], 8)
];
// W: như M ngược (đáy B)
G.W = [
  L([-WM, TOP], [-WM / 2, B], 8),
  L([0, TOP], [-WM / 2, B], 8),
  L([0, TOP], [WM / 2, B], 8),
  L([WM, TOP], [WM / 2, B], 8)
];
// X: hai chéo
G.X = [
  L([-W, TOP], [W, B], 8),
  L([W, TOP], [-W, B], 8)
];
// Y: chéo trái; chéo phải gặp giữa; sổ xuống B
G.Y = [
  L([-W, TOP], [0, CY], 6),
  L([W, TOP], [0, CY], 6),
  L([0, CY], [0, B], 6)
];
// Z: gạch trên; chéo; gạch dưới
G.Z = [
  L([-W, TOP], [W, TOP], 6),
  L([W, TOP], [-W, B], 8),
  L([-W, B], [W, B], 6)
];

module.exports = { VN_UP: G };
