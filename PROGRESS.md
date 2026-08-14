# Bé Học Vui — Tiến trình dự án

> App học lớp 1 cho iPad (PWA): tập viết, tập đọc, vẽ/tô màu, tiếng Anh, ca hát, thám hiểm.
> Cập nhật: 2026-08-13

## Tóm tắt hiện trạng

App chạy đầy đủ ở dạng PWA nhiều file. App nói **692 câu**, trong đó **566 câu có clip giọng nữ thu sẵn** (Edge TTS — HoaiMy tiếng Việt, Ana giọng bé gái tiếng Anh); ⚠️ **126 câu mới (nội dung đợt 2026-08-13) chưa có mp3**, đang fallback Web Speech — chạy `node scripts/list-phrases.cjs && python scripts/gen_audio.py` trên máy có Python + internet là đủ (máy dev hiện tại không có Python).

Muốn test phải chạy qua HTTP server (không mở file trực tiếp), server cần hỗ trợ Range request cho mp3 — máy này không có Python nên dùng static server Node bất kỳ trỏ vào thư mục gốc → http://localhost:8080. Smoke test UI: Edge headless + `playwright-core` (channel `msedge`, không cần tải browser).

## Đã hoàn thành

### Giai đoạn demo → hoàn thiện 2D (1 file, đã tách)
- **Tập viết**: 3 bộ (thường / HOA / số, 76 ký tự), ô ly như vở lớp 1, từ minh hoạ + hình cho từng chữ, 3 ngòi bút (mực/dạ/sáp) + màu + cầu vồng + undo từng nét, lực nhấn Apple Pencil, chấm điểm coverage × precision, lưu điểm tốt nhất từng chữ
- **Tập đọc**: 7 chế độ — chữ cái, vần & dấu thanh, từ ngữ (20 từ), điền từ vào câu (10 câu), 🗣️ Đọc theo (mic chấm điểm vi-VN), 🧩 Ghép vần, trộn; vòng 6-8 câu
- **Vẽ**: vẽ tự do (12 màu + cầu vồng, 4 loại bút mực/dạ/sáp/neon, con dấu emoji + tẩy theo cỡ, undo nhiều bước) + **tô màu 20 tranh** canvas 2 lớp (màu nằm dưới nét tranh), bút tô 3 cỡ + xô đổ màu 🪣 + undo + lưu vào bộ sưu tập, hiệu ứng tranh bay lên trời
- **Tiếng Anh**: 12 chủ đề / 96 từ (có nghĩa Việt), flashcard + 3 trò (nghe chọn hình, chọn từ đúng, lật hình tìm cặp), 🎤 Nói theo (speech recognition, tự ẩn nếu không hỗ trợ)
- **Ca hát**: 10 bài kinh điển public domain (ABC, Twinkle, Mary Lamb, Baa Baa, Old MacDonald, Rain Rain, Row Your Boat, London Bridge, If You're Happy, Head Shoulders) — giai điệu Web Audio + bè đệm bass/quãng 5 + karaoke highlight + đọc lời chậm
- **Thám hiểm**: 3 vùng đất × 5 trạm, khoá tiến độ, trạm trùm 👑 cuối vùng, thưởng sao khi qua trạm
- **Phần thưởng**: 24 sticker (8⭐/sticker, tự khoe khi mở khoá), streak ngày học 🔥 + thưởng ngày mới, mascot Thỏ Bông
- **Pencil trên iPad**: lực nhấn đổi độ đậm nét, chống tì lòng bàn tay (thấy bút → bỏ qua chạm tay)

### Phase 0 — Nền móng (xong)
- Tách 1 file → dự án: `index.html` / `css/style.css` / `js/data.js` (toàn bộ nội dung học) / `js/app.js`
- PWA: `manifest.webmanifest` + `sw.js` (cache-first, offline sau lần tải đầu) + icon 180/192/512
- `CLAUDE.md` (quy trình + traps), server test bằng `python -m http.server`

### Phase 1 — Giọng nói (xong)
- Pipeline: `scripts/list-phrases.cjs` (liệt kê mọi câu từ data, hiện 692) → `scripts/gen_audio.py` (Edge TTS, miễn phí)
- **566/692 mp3, 8.3MB** (126 câu mới chờ regen) — vi-VN-HoaiMyNeural (nữ) + en-US-AnaNeural (trẻ em), rate −10%
- Runtime: `speak()` phát mp3 (id = djb2 hash `lang|text`, khớp JS↔Python), Web Speech chỉ là fallback
- Thêm/đổi câu nói → chạy: `node scripts/list-phrases.cjs && python scripts/gen_audio.py`

### Audit toàn diện 2026-08-13 (xong)
Chạy multi-agent review (5 hướng: logic, audio pipeline, PWA, performance, data) → 23 lỗi xác nhận, đã sửa hết theo 3 đợt:
- **Đợt 1 (nặng)**: sw.js viết lại (stale-while-revalidate cho app → deploy tự cập nhật; precache 567 mp3 qua `warm-audio`; tự dựng 206 cho Range request Safari — trước đây mp3 KHÔNG BAO GIỜ cache được trên iPad; cache Google Fonts offline) · palm nhấc lên không còn cắt nét bút (`activeId`) · timer quiz/memory tự huỷ khi đổi màn (`uiGen`) — hết mất tiến độ quest · audio fallback không còn đọc đúp / đọc câu cũ đè câu mới · nút Dừng dừng nhạc THẬT (stop oscillator + disconnect gain), hết chồng bài · `<title>` hết mojibake + meta `apple-mobile-web-app-title`.
- **Đợt 2**: localStorage hỏng không làm chết app (`safeParse`) · đổi tab/vào lại màn Vẽ không xoá tranh (sizeCanvas guard) · flood fill nhanh hơn ~2-3× (cache mask nét tranh, stack Int32Array) · xoay màn hình không đọc lại câu nhắc (debounce + tách `redrawWrite`).
- **Đợt 3**: câu "Ngôi ___" bỏ distractor 'nhà' (cũng đúng ngữ pháp) · không hiện vần sai chính tả 'ce/ci/cê' · `phrase_id()` Python hash theo UTF-16 code unit khớp JS kể cả emoji (đã test 566/566 khớp, 0 thiếu mp3) · sửa comment mojibake data.js.

### Đợt "làm dày" 2026-08-13 (theo feedback demo)
- **Vẽ**: undo nhiều bước cho cả 3 canvas (vẽ tự do / tô màu / tập viết — kể cả "Xoá hết" và xô đổ màu), 4 loại bút (🖊️ mực, 🖌️ dạ trong mờ, 🖍️ sáp nhám, ✨ neon phát sáng), gôm + con dấu ăn theo cỡ bút, tô màu có 3 cỡ bút
- **Tập viết**: chọn ngòi (mực/dạ/sáp) + undo từng nét
- **Tập đọc**: thêm 2 chế độ — 🗣️ **Đọc theo** (cô đọc chữ/từ/câu, bé đọc lại, có mic thì nhận dạng giọng vi-VN chấm điểm + thưởng sao) và 🧩 **Ghép vần** (nghe tiếng → chọn thẻ phụ âm + thẻ vần-dấu)
- **Tiếng Anh**: 8 → **12 chủ đề / 96 từ** (+Toys, Clothes, Transport, Actions — bám Cambridge Pre-A1)
- **Ca hát**: 6 → **10 bài** (+Row Your Boat, London Bridge, If You're Happy, Head Shoulders Knees & Toes) + bè đệm bass/quãng-5 cho dày tiếng
- **Tô màu**: 12 → **20 tranh** — 8 tranh mới chi tiết hơn hẳn (18-22 vùng tô/tranh: sư tử bờm múi, tàu hoả, công xoè đuôi, hướng dương, cá heo, cú mèo, xe cứu hoả, cầu vồng 5 dải)
- ⚠️ **126 câu mới chưa có mp3** (fallback Web Speech vẫn chạy). Máy hiện tại KHÔNG có Python — cần chạy `python scripts/gen_audio.py` trên máy có Python + internet để thu đủ giọng nữ.
- Chưa làm được từ feedback: giọng hát thật cho bé hát theo (TTS không hát được — cần thu âm/backing track thật, Phase 4), ảnh thật CC0 cho từ vựng (Phase 2)

### Review đa-agent lần 2 — 2026-08-13 (5 hướng × finder+verifier, 42 findings, 41 CONFIRMED)
Full findings: xem transcript workflow `wf_7ace57b6-9e6`. Đã fix ngay: **692/692 mp3** (generate 126 câu thiếu + retry).
Plan cải tiến 4 đợt:
- **Đợt A — Hotfix logic/PWA — ✅ XONG 2026-08-13**: Ghép vần thêm `locked` (hết điểm đúp/nhảy cóc) · `AC.resume()` trong ensureAC · mic có uiGen check (renderFlash timeout + onresult của listenFor/listenVi) · saveToGallery retry-loop + câu báo "Bộ nhớ đầy" · fonts.ready chỉ redraw khi chưa có nét · safeParse nhận validator shape (isObj/Array.isArray, 4 call sites) · quest viết phải đúng chữ trạm (`curChar()===STATIONS[questActive].ch`) · câu boss đọc trước + runQuiz có `firstDelay` (boss 2500ms) · loadPic có `picGen` token + onerror báo giọng · ttsSpeak watchdog `1500+len*120ms` · serveAudio xử lý suffix-range + 416 · `storage.persist()` lúc khởi động · sửa comment "content hash" sai trong sw.js + quy ước bump AUDIO_CACHE/VERSION vào regulation.md. Audio: **694/694 mp3** (2 câu báo lỗi mới). Còn lại từ nhóm logic: xoay iPad mất tranh vẽ tự do (chuyển sang Đợt C — cùng mảng canvas).
- **Đợt B — UX trẻ em — ✅ XONG 2026-08-13**: sai 2 lần → đáp án đúng nhấp nháy 3 nhịp + giữ viền vàng (cứu cả tình huống iPad mute; áp dụng quiz engine + Ghép vần) · mic lỗi có `micErrorFeedback` (not-allowed/network/không-nghe-thấy đều có câu báo bằng giọng) · `confirmTap` 2-chạm-3-giây cho: xoá tranh gallery (nút 44px), 🧽 Xoá tập viết, 🏠 giữa lượt chơi (`roundActive`), nút reset của phụ huynh · lưu khi album đầy báo "tranh cũ nhất sẽ được thay" · touch target ≥44px (chip, nút tranh, swatch 46px) · contrast: lime→#65A30D, sky→#0284C7 (card, menu, quest, .good, mem done) · sticker **tier VÀNG**: hết 24 sticker thường (192⭐) → mỗi 15⭐ mở 1 sticker vàng ✨, vòng thưởng không cạn · **parent gate** 👨‍👩‍👧: phép nhân chặn trẻ → trang tiến độ (sao/streak/quest/chữ đã luyện/sticker/tranh) + nút xoá toàn bộ dữ liệu · nút điều khiển Đọc theo có style `ctrl` riêng.
- **Đợt C — Perf/arch — ✅ XONG 2026-08-13**: `floodFillData` pure trên ImageData + buffer seen/stack tái dùng (hết cấp phát ~9.6MB/tap) · undo tô màu: replay batch mọi fill trên 1 ImageData (N×get+put → 1×get+put) + bake nền sớm khi >6 fill · `speakAsync` tái dùng 1 Audio element + `audioResolve` đảm bảo promise luôn resolve khi bị cắt (chuỗi Đọc lời không treo) · xoay iPad giữ tranh vẽ tự do (chụp → scale lại; undo reset) · **tách app.js → 8 module** (core/paint/writing/reading/drawing/english/music/quest — thứ tự load trong index.html, pure move đã verify tổng ký tự) · sw.js bump `bhv-v3` + CORE 14 file + `bhv-img-v1` route sẵn cho ảnh Phase 2 · e2e thêm listener HTTP≥400 + `goHome()` (vì 🏠 giờ hỏi xác nhận giữa lượt). Audio: **773/773 mp3**. E2E: **ALL PASS 15/15**.
- **Đợt D — Content — ✅ XONG 2026-08-13**: qLetter có bảng AMBIG loại cặp đồng âm s/x, d/r, i/y · `y` → 'y dài' · Đọc theo: chữ đơn chấm theo token (hết 'a' ăn theo 'ba'), chữ y nhận cả 'i' · bộ thanh 'co' (có tiếng 'cõ' vô nghĩa) → bộ 'bo' · EXAMPLES.n: quả na 🍈 → con nai 🦌 · EN theo Starters: tooth→arm+leg, scissors/clock→pencil+crayon, gloves/cap/trousers→hat/boots/pants, drum→box, thêm 2 theme 🏠 House (8 từ) + 😊 Feelings (6 từ) → **14 chủ đề / 109 từ** (Weather giữ làm theme bonus ngoài Starters) · sửa 3 bài hát lệch nốt (If You're Happy, Head Shoulders ×3 dòng, Rain Rain ×2 dòng) · bỏ 5 câu mp3 mồ côi khỏi pipeline + xoá 36 mp3 thừa. Audio: **719/719 mp3**. E2E: ALL PASS 15/15 (assertion audio giờ so với phrases.json, hết hardcode).

## Chưa làm (roadmap đã chốt)

| Phase | Nội dung | Trạng thái |
|---|---|---|
| **2 — Tiếng Anh sâu** | ✅ XONG 2026-08-13: **133 từ / 14 chủ đề** (Animals 10→20, Food 8→16, +Transport/House; VN words 20→30) · **86 ảnh THẬT** từ Wikipedia (pipeline `scripts/gen_images.cjs`, retry/backoff, override title cho từ nhập nhằng — water/key/lamp đã sửa tay sau khi soi mắt) · flashcard + quiz nghe-chọn + quiz đọc dùng ảnh, emoji fallback khi thiếu/lỗi · sw `warm-images` precache offline · credit ảnh ở trang phụ huynh · audio **826/826 mp3** · e2e 17 assertion ALL PASS. Deploy GitHub Pages: https://veorandy-cloud.github.io/be-hoc-vui/ | ✅ |
| **3 — Tập viết sâu** | ✅ XONG 2026-08-13: **76 glyph có thứ tự nét** (`js/strokes.js` sinh từ font 1-nét Hershey futural public-domain qua `scripts/gen_strokes.cjs` + 4 dấu Việt tự định nghĩa: breve/mũ/móc/gạch-đ) · 3 mức như LetterSchool: 👀 **Xem mẫu** (nét chạy animation như cô viết), 🔢 **Từng nét** (mặc định — đồ theo nét đánh số, chấm từng nét bằng resample+khoảng cách, sai 2 lần cô vẽ mẫu lại nét đó, nét run tay "snap" thành nét chuẩn xanh), ✍️ **Tự viết** (chấm coverage như cũ) · trạm quest viết dùng chế độ Từng nét · audio 833/833 · e2e 19 assertion ALL PASS (2 assertion mới: stroke data + nét sai bị từ chối) | ✅ |
| **4 — Tô màu + Nhạc** | 30+ tranh line-art CC0 nhiều chi tiết; backing track thật cho bài hát | Chờ |
| **Đảo Sticker 3D** | Three.js — khu thưởng 3D xoay bằng tay, sticker mọc lên đảo | Chờ (đã thống nhất chỉ 3D phần thưởng, học vẫn 2D) |
| **Deploy** | GitHub Pages/Netlify để dùng trên iPad + hướng dẫn Add to Home Screen | Khi cần lên iPad |

## Quyết định thiết kế đã chốt
- 2D cho phần học, 3D chỉ cho khu phần thưởng (không full 3D)
- Ảnh thật (photo CC0) cho từ vựng; thư viện/asset mã nguồn mở bundle local; **không** nhúng iframe/dịch vụ bên thứ ba
- Design family: Playful Color (Baloo 2 + Quicksand, palette coral/sky/lime/violet/sun)
- Giọng nữ mọi nơi; nội dung bám SGK lớp 1 (bảng chữ 29 + vần + dấu thanh) và giáo trình Cambridge Starters cho tiếng Anh
