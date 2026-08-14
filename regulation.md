# Bé Học Vui — app học lớp 1 (PWA cho iPad)

## Stack
Vanilla HTML/CSS/JS, không build step, không framework. PWA (manifest + sw.js).
Font: Baloo 2 + Quicksand (Google Fonts, có vietnamese subset). Design family: Playful Color (xem `~/.claude/DESIGN.md`).

## Chạy & test
- Test PC: cần HTTP server (fetch manifest + audio fail trên file://). Máy dev CÓ Python 3.13 (đã xác nhận 2026-08-13,
  `python -m http.server 8080` dùng được) — hoặc bất kỳ static server nào (cần hỗ trợ Range cho mp3) → http://localhost:8080
- Syntax check JS: `node --check js/app.js; node --check js/data.js`
- E2E smoke test (15 assertion): bật server :8080 rồi `node tests/e2e.mjs` — Edge headless qua `playwright-core` (đã cài trong package.json), không cần tải browser. CHẠY SAU MỖI ĐỢT SỬA LỚN.
- Deploy iPad: push lên GitHub Pages/Netlify, mở Safari → Add to Home Screen.

## Cấu trúc
- `index.html` — skeleton, load css/js, đăng ký sw
- `css/style.css` — toàn bộ style
- `js/data.js` — TOÀN BỘ nội dung học: chữ/từ/câu, 12 chủ đề tiếng Anh (96 từ), 10 bài hát, 24 sticker, 20 SVG tô màu. Có `module.exports` guard để node dùng chung.
- `js/` 8 module, load đúng THỨ TỰ trong index.html (data → core → paint → writing → reading → drawing → english → music → quest):
  `core.js` (helpers/audio/sao/streak/overlay/nav/quiz-engine) · `paint.js` (bindDraw + makeHistory undo) · `writing.js` · `reading.js` (7 chế độ, mic vi-VN) · `drawing.js` (vẽ/tô màu/floodFill/gallery) · `english.js` (14 chủ đề, mic en-US) · `music.js` · `quest.js` (thám hiểm + sticker 2 tier + parent gate + boot).
  Thêm file js mới → PHẢI thêm vào cả index.html lẫn CORE trong sw.js, và bump VERSION.
- `scripts/list-phrases.cjs` — liệt kê mọi câu app nói → `scripts/phrases.json`
- `scripts/gen_audio.py` — generate mp3 bằng edge-tts → `assets/audio/` + `manifest.json`
- `assets/audio/*.mp3` — giọng nữ thu sẵn (vi: HoaiMy, en: Ana giọng trẻ em)

## Quy trình audio (QUAN TRỌNG)
Mọi chuỗi `speak()` cố định phải có mặt trong `list-phrases.cjs` (khớp 100% từng ký tự —
kể cả chuỗi build động như câu Đọc theo: hàm `stripDeco` tồn tại ở CẢ app.js lẫn list-phrases.cjs và phải giống hệt nhau).
Thêm/đổi câu nói → chạy lại: `node scripts/list-phrases.cjs && python scripts/gen_audio.py`
(cần internet + Python — máy dev có Python 3.13; edge-tts hay lỗi lai rai "No audio was received" → chạy lại script vài lần tới khi `done: N/N`).
Runtime: có mp3 thì phát, không thì fallback Web Speech.
✅ 2026-08-13: đủ **692/692 mp3**.
ID file = djb2-xor hash của `lang|text` — `phraseId()` (app.js) và `phrase_id()` (gen_audio.py) PHẢI giống nhau;
cả hai hash theo UTF-16 code unit nên khớp cả khi câu chứa emoji/ký tự ngoài BMP.

## Traps đã gặp
- SVG render qua `<img>`/canvas BẮT BUỘC có `xmlns` + width/height, thiếu là fail im lặng.
- Web Speech `getVoices()` rỗng lúc load → phải nghe `voiceschanged`.
- iPad palm rejection: đã thấy pointerType 'pen' thì bỏ qua 'touch' trên canvas; pointerup/pointercancel cũng phải check `pointerId === activeId` (palm nhấc lên không được cắt nét bút).
- Canvas tô màu dùng độ phân giải cố định 1200×900 (không resize theo DPR) để flood fill + xoay màn hình không mất tranh.
- Gán `canvas.width/height` LUÔN xoá canvas kể cả khi số không đổi → `sizeCanvas()` bỏ qua khi kích thước không đổi hoặc parent đang ẩn (rect = 0).
- Mọi `setTimeout` của quiz/memory phải check `uiGen` (tăng mỗi lần đổi màn hình / lượt mới); chuỗi async bài hát check `songSession` — nếu không, timer cũ bắn sau khi đã rời màn (từng làm mất tiến độ quest).
- `<audio>` lỗi: `onerror` VÀ `play().catch` có thể cùng bắn → fallback Web Speech phải có guard 1 lần + check `curAudio` còn là mình (tránh đọc câu cũ đè câu mới).
- Safari fetch `<audio>` bằng Range request (206) — Cache API cấm `put(206)`; sw.js tự cắt 206 từ bản full 200 trong cache, đừng bỏ handler này.
- localStorage: đọc JSON qua `safeParse()` (hỏng → xoá key, dùng mặc định), số qua `Number(...)||0`. Keys: bhv_stars, bhv_stk, bhv_write, bhv_gallery (cap 6 ảnh jpeg 0.7), bhv_quest, bhv_streak.
- Undo dùng `makeHistory()` (vector action + nướng nền sau 40 hành động): mọi thao tác vẽ mới (nét/dấu/đổ màu/xoá hết) PHẢI `hist.push(...)` nếu muốn undo được; đổi tranh tô/`redrawWrite()` phải `hist.reset()`.
- Tranh tô SVG: mọi vùng tô là shape KÍN `fill="#fff"` (runtime đổi thành none), `stroke="#333"` ≥ 3px làm tường chắn flood fill; hở nét là loang màu.

## Service worker / deploy
- `sw.js`: app files = stale-while-revalidate (deploy mới tự áp dụng ở lần mở sau); mp3 = cache-first vĩnh viễn trong `bhv-audio-v1`; fonts Google cache riêng.
- ⚠️ Tên file mp3 = hash CỦA TEXT, KHÔNG phải content hash — regenerate audio với giọng/rate khác vẫn ra cùng tên file → PHẢI bump `AUDIO_CACHE` trong sw.js thì client cũ mới nhận giọng mới.
- ⚠️ SWR là per-file: deploy nào sửa index.html + app.js phụ thuộc lẫn nhau → bump `VERSION` trong sw.js (install precache atomic cả bộ CORE, hết chạy lệch nửa cũ nửa mới).
- Trang gửi `postMessage('warm-audio')` sau khi SW ready → SW tải trước toàn bộ mp3 còn thiếu theo manifest (offline có tiếng đầy đủ).
- Chỉ bump `VERSION` trong sw.js khi đổi cấu trúc cache; đổi nội dung file thường thì không cần.
