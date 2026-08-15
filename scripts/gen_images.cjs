/* Tải ảnh thật cho từ vựng từ Wikipedia REST API (ảnh đại diện trang — đúng chủ thể, CC/PD)
   -> assets/images/en/<slug>.jpg + assets/images/manifest.json {word: file}
   Chạy: node scripts/gen_images.cjs   (cần internet; skip file đã có)
   Chỉ tải cho danh từ CỤ THỂ — Colors/Numbers/Feelings/Actions/Body/Family giữ emoji. */
const D = require('../js/data.js');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images', 'en');
fs.mkdirSync(OUT, { recursive: true });

const PHOTO_THEMES = ['🐾 Animals', '🍔 Food', '🧸 Toys', '👕 Clothes', '🚌 Transport', '🏠 House', '🎒 School', '☀️ Weather', '⚽ Sports', '🌿 Nature'];
// từ → tên trang Wikipedia khi khác tên mặc định (viết hoa chữ đầu)
const WIKI = {
  cow: 'Cattle', bike: 'Bicycle', plane: 'Airplane', motorbike: 'Motorcycle',
  pants: 'Trousers', boots: 'Boot', socks: 'Sock', shoes: 'Shoe',
  'teddy bear': 'Teddy bear', TV: 'Television', sofa: 'Couch', bath: 'Bathtub',
  phone: 'Telephone', key: 'Key (lock)', bag: 'Backpack', orange: 'Orange (fruit)',
  lamp: 'Electric light', water: 'Drinking water',
  'ice cream': 'Ice cream', star: 'Star', ball: 'Ball',
  football: 'Football (ball)', basketball: 'Basketball (ball)', tennis: 'Tennis ball',
  badminton: 'Shuttlecock', baseball: 'Baseball (ball)', hockey: 'Field hockey',
  shell: 'Seashell', sea: 'Wind wave', beach: 'Beach', tree: 'Tree', leaf: 'Leaf', garden: 'Garden' // sea: trang 'Sea' ra bản đồ vệ tinh, 'Ocean' ra ảnh Trái Đất — 'Wind wave' mới ra sóng biển thật
};
const slug = w => w.toLowerCase().replace(/\s+/g, '-');

const UA = { 'User-Agent': 'BeHocVui-kids-app/1.0 (education; contact via github veorandy-cloud)' };
async function fetchRetry(url, asJson) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA });
    if (r.status === 429 || r.status === 503) { // rate limit → chờ rồi thử lại
      await new Promise(t => setTimeout(t, 2500 * (i + 1)));
      continue;
    }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return asJson ? r.json() : Buffer.from(await r.arrayBuffer());
  }
  throw new Error('rate limited');
}

(async () => {
  const words = [];
  for (const th of PHOTO_THEMES) (D.EN_THEMES[th] || []).forEach(it => words.push(it.w));
  const manifest = {};
  let okCount = 0, fail = [];
  for (const w of words) {
    const file = slug(w) + '.jpg';
    const dest = path.join(OUT, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { manifest[w] = file; okCount++; continue; }
    const title = WIKI[w] || (w[0].toUpperCase() + w.slice(1));
    try {
      const j = await fetchRetry('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title), true);
      const orig = j.thumbnail && j.thumbnail.source;
      if (!orig) throw new Error('no thumbnail');
      let buf;
      try { buf = await fetchRetry(orig.replace(/\/(\d+)px-/, '/480px-'), false); }
      catch (e) { buf = await fetchRetry(orig, false); } // ảnh gốc nhỏ hơn 480 → dùng cỡ mặc định
      if (buf.length < 1000) throw new Error('too small');
      fs.writeFileSync(dest, buf);
      manifest[w] = file; okCount++;
      console.log('ok  ', w, '<-', title, Math.round(buf.length / 1024) + 'KB');
    } catch (e) {
      fail.push(w);
      console.log('FAIL', w, '(', title, ')', e.message);
    }
    await new Promise(r => setTimeout(r, 400)); // lịch sự với Wikimedia
  }
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'images', 'manifest.json'), JSON.stringify(manifest), 'utf8');
  console.log(`done: ${okCount}/${words.length} photos${fail.length ? ' | fail: ' + fail.join(', ') : ''}`);
})();
