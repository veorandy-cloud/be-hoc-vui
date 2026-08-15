/* Chữ THƯỜNG theo mẫu tập viết tiếng Việt (Bộ GD-ĐT — kiểu chữ viết đứng, nét đều):
   nét cong kín, nét hất, nét móc ngược/móc hai đầu, nét khuyết trên/dưới, nét thắt.
   Toạ độ khớp hệ Hershey của gen_strokes.cjs: baseline y=22, cao chữ o (1 đơn vị) = 8.4,
   đỉnh khuyết trên (2.5 đv) y=1, chữ t (1.5 đv) y=9.4, d/đ/p/q (2 đv) y=5.2,
   xuống dưới baseline: p/q 1 đv (y=30.4), khuyết dưới g/y 1.5 đv (y=34.6).
   Mỗi chữ = mảng NÉT theo đúng thứ tự dạy viết; mỗi nét = polyline sample từ bezier. */
'use strict';

const B = 22, X = 13.6, TOP = 1, MID = 17.8;
const lerp = (a, b, t) => a + (b - a) * t;
function Q(p0, c, p1, n = 12) { // quadratic bezier
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
              u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
  }
  return out;
}
function C(p0, c1, c2, p1, n = 14) { // cubic bezier
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p1[0],
              u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p1[1]]);
  }
  return out;
}
const L = (p0, p1, n = 6) => Array.from({length: n + 1}, (_, i) => [lerp(p0[0], p1[0], i/n), lerp(p0[1], p1[1], i/n)]);
function arc(cx, cy, rx, ry, a0, a1, n = 28) { // độ; a giảm dần = ngược kim đồng hồ trên màn hình (phải→đỉnh→trái)
  const out = [];
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n) * Math.PI / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
function chain(...segs) { // nối các đoạn thành 1 nét, bỏ điểm trùng chỗ nối
  const out = [...segs[0]];
  for (let i = 1; i < segs.length; i++) out.push(...segs[i].slice(1));
  return out.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);
}

/* ==== các nét cơ bản ==== */
// nét cong kín: đặt bút dưới kẻ 2 bên phải, cong về trái qua đỉnh, khép kín
const congKin = cx => chain(arc(cx, MID, 3.3, 4.2, -65, -425));
// nét móc ngược (phải): sổ từ yTop xuống gần baseline rồi hất cong lên phải
const mocNguoc = (x, yTop = X) => chain(L([x, yTop], [x, 19.2]), Q([x, 19.2], [x + 0.2, 22.5], [x + 2.6, 18.9]));
// nét hất: từ baseline xiên cong lên chạm kẻ 2
const nethat = xEnd => chain(Q([xEnd - 2.5, B], [xEnd - 1.2, 18.4], [xEnd, 13.8]));
// nét móc xuôi: cong vào từ trái chạm kẻ 2 rồi sổ thẳng xuống baseline
const mocXuoi = x => chain(Q([x - 2.1, 15.4], [x - 1.1, 13.55], [x, 13.7]), L([x, 13.7], [x, B]));
// nét móc hai đầu: vòm như chữ n rồi móc lên ở chân
const mocHaiDau = (x0, x1) => chain(
  C([x0, 16.6], [x0 + 0.7, 13.2], [x1 - 0.9, 13.2], [x1, 16.4]),
  L([x1, 16.4], [x1, 19.2]),
  Q([x1, 19.2], [x1 + 0.2, 22.5], [x1 + 2.6, 18.9]));
// nét khuyết trên: hất từ giữa lên, vòng đỉnh, sổ thẳng xuống baseline (cắt nét lên ở kẻ 2)
const khuyetTren = x => chain(
  C([x - 2.6, 17.2], [x + 0.8, 11.0], [x + 1.7, 4.6], [x + 1.0, 2.0]),
  C([x + 1.0, 2.0], [x + 0.4, 0.7], [x - 0.4, 2.2], [x, 6.8]),
  L([x, 6.8], [x, B]));
// nét khuyết dưới: sổ qua baseline, vòng trái dưới đáy, cắt lên kết thúc trên baseline
const khuyetDuoi = x => chain(
  L([x, X], [x, 26.5]),
  C([x, 26.5], [x, 32.6], [x - 1.4, 34.9], [x - 2.9, 33.8]),
  C([x - 2.9, 33.8], [x - 4.3, 32.6], [x - 3.2, 29.4], [x + 0.4, 21.2]));
// móc ngược vòng LÊN TỚI kẻ 2 (nối sang thân sau — dùng cho u, y, w)
const mocLenKe2 = (x0, x1) => chain(
  L([x0, X], [x0, 18.2]),
  C([x0, 18.2], [x0, 21.8], [x1 - 1.6, 22.5], [x1, 17.6]),
  L([x1, 17.6], [x1, X]));

const G = {};
G.o = [congKin(0)];
G.a = [congKin(-1.4), mocNguoc(2.0)];
G.c = [chain(arc(0, MID, 3.3, 4.2, -50, -315))];
G.d = [congKin(-1.4), mocNguoc(2.0, 5.2)];
G.q = [congKin(-1.4), L([2.0, X], [2.0, 30.4], 8)];
G.g = [congKin(-1.4), khuyetDuoi(2.0)];
G.e = [chain(
  L([-3.0, 17.4], [2.4, 15.4]),
  C([2.4, 15.4], [2.2, 13.7], [1.1, 13.3], [-0.2, 13.3]),
  C([-0.2, 13.3], [-2.0, 13.3], [-3.3, 15.2], [-3.3, 17.8]),
  C([-3.3, 17.8], [-3.3, 20.4], [-1.8, 22.0], [0.0, 22.0]),
  Q([0.0, 22.0], [1.5, 22.0], [2.6, 20.3]))];
G.i = [nethat(0), mocNguoc(0), L([0.0, 10.4], [0.5, 10.9], 2)];
G.t = [nethat(0), mocNguoc(0, 9.4), L([-2.3, X], [2.3, X], 4)];
G.u = [nethat(-2.4), mocLenKe2(-2.4, 2.4), mocNguoc(2.4)];
G.n = [mocXuoi(-2.2), mocHaiDau(-2.2, 2.6)];
G.m = [mocXuoi(-4.5), chain(C([-4.5, 16.6], [-3.8, 13.2], [-0.9, 13.2], [0, 16.4]), L([0, 16.4], [0, B])), mocHaiDau(0, 4.5)];
G.p = [nethat(-2.2), L([-2.2, X], [-2.2, 30.4], 8), mocHaiDau(-2.2, 2.6)];
G.h = [khuyetTren(-1.5), mocHaiDau(-1.5, 3.4)];
G.l = [chain(khuyetTren(-0.5).slice(0, -1), L([-0.5, 19.2], [-0.5, 19.2], 1), Q([-0.5, 19.2], [-0.3, 22.5], [2.1, 18.9]))];
G.b = [khuyetTren(0), chain(
  Q([0, 19.8], [0.4, 22.3], [2.6, 21.0]),
  C([2.6, 21.0], [4.3, 19.8], [4.5, 17.0], [4.2, 15.8]),
  C([4.2, 15.8], [3.8, 13.9], [2.5, 14.6], [3.2, 15.7]))];
G.k = [khuyetTren(-1.5), chain(
  C([-1.5, 16.4], [-0.7, 13.5], [1.3, 13.2], [2.2, 14.2]),
  C([2.2, 14.2], [2.9, 15.1], [2.4, 16.5], [1.2, 16.8]),
  C([1.2, 16.8], [0.4, 17.0], [0.6, 17.6], [1.5, 17.7]),
  Q([1.5, 17.7], [3.3, 18.2], [3.7, 20.4]),
  Q([3.7, 20.4], [4.1, 22.3], [5.6, 20.5]))];
G.r = [chain(
  Q([-2.6, B], [-1.5, 17.6], [-0.2, 12.6]),
  C([-0.2, 12.6], [0.6, 11.6], [1.5, 12.4], [0.9, 13.3]),
  Q([0.9, 13.3], [1.6, 13.5], [1.9, 14.2]),
  L([1.9, 14.2], [1.9, 19.2]),
  Q([1.9, 19.2], [2.1, 22.5], [4.4, 19.1]))];
G.s = [chain(
  Q([-2.4, B], [-1.3, 17.6], [0.4, 12.6]),
  C([0.4, 12.6], [1.3, 11.6], [2.2, 12.5], [1.4, 13.5]),
  C([1.4, 13.5], [-0.8, 14.6], [-2.3, 16.2], [-1.0, 19.6]),
  Q([-1.0, 19.6], [-0.4, 22.2], [1.8, 20.7]))];
G.v = [chain(
  Q([-2.6, 15.0], [-1.7, 13.6], [-0.6, 13.8]),
  C([-0.6, 13.8], [0.5, 14.6], [1.0, 19.0], [1.8, 20.8]),
  C([1.8, 20.8], [2.6, 19.2], [3.0, 15.5], [3.6, 14.1]),
  C([3.6, 14.1], [4.2, 12.8], [5.2, 13.5], [4.4, 14.6]),
  Q([4.4, 14.6], [3.9, 15.3], [4.9, 15.5]))];
G.x = [chain(arc(-3.2, MID, 2.85, 4.2, -75, 75)), chain(arc(3.2, MID, 2.85, 4.2, -105, -255))];
G.y = [nethat(-2.4), mocLenKe2(-2.4, 2.4), khuyetDuoi(2.4)];
// f j w z: không thuộc bảng chữ VN — dựng cùng phong cách cho đồng bộ
G.f = [chain(
  C([2.4, 4.6], [1.8, 2.0], [0.5, 1.4], [-0.2, 3.4]),
  L([-0.2, 3.4], [-0.2, 30.4], 8)), L([-2.4, X], [2.2, X], 4)];
G.j = [nethat(0), chain(
  L([0, X], [0, 26.5]),
  C([0, 26.5], [0, 32.6], [-1.4, 34.9], [-2.9, 33.8]),
  Q([-2.9, 33.8], [-4.1, 32.6], [-3.1, 30.0])), L([0.0, 10.4], [0.5, 10.9], 2)];
G.w = [nethat(-4.6), mocLenKe2(-4.6, -0.2), chain(
  mocLenKe2(-0.2, 4.2).slice(0, -1),
  L([4.2, 17.6], [4.2, X], 3),
  C([4.2, X + 0.4], [4.8, 12.6], [5.8, 13.3], [5.0, 14.4]),
  Q([5.0, 14.4], [4.5, 15.1], [5.5, 15.3]))];
G.z = [L([-2.6, X], [2.6, X], 4), L([2.6, X], [-2.6, 21.9], 6), L([-2.6, B], [2.8, B], 4)];

module.exports = { VN_LOW: G };
