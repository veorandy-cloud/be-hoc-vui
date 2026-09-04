# Bé Học Vui — Tiến trình dự án

> App học lớp 1 cho iPad (PWA): tập viết, tập đọc, vẽ/tô màu, tiếng Anh, ca hát, thám hiểm, toán.
> Cập nhật: 2026-09-04 · live `bhv-v36`

## Tóm tắt hiện trạng

PWA nhiều file, live https://veorandy-cloud.github.io/be-hoc-vui/ (`sw.js` **bhv-v36**, `AUDIO_CACHE` `bhv-audio-v2`). **1745/1745 mp3** (Edge TTS HoaiMy vi + Ana en). Máy dev Windows: Python 3.13 + edge-tts.

Test: Node static server **`127.0.0.1:8080`** (không `localhost` — Playwright trên máy này là IPv6). `node tests/e2e.mjs` + `node tests/user-sim.mjs` (channel `msedge`). 2026-09-04: **e2e ALL PASS**, **user-sim ALL PASS**.

Nội dung live: 76 glyph nét VN · 16 truyện · 22 chủ đề EN / 196 từ / 151 ảnh · phonics 26 chữ · 32 tranh tô · 3 vẽ theo mẫu · 20 bài hát (piano sample + đàn theo + gõ nhịp) · toán khung mười / mix20 / có nhớ / lời văn / thành phần / hình · quest **7 vùng / 35 trạm**. Gallery cap 12.

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

## Roadmap đã chốt (Phase 2–4 + đảo + deploy)

Tất cả ✅ — chi tiết nằm ở các đợt 2026-08 bên dưới. Live GitHub Pages, iPad Add to Home Screen.

## Còn nợ (không chặn app)

| Nợ | Ghi chú |
|---|---|
| Tai kiểm 3 melody VN trên iPad | Kìa Con Bướm Vàng / Một Con Vịt / Dung Dăng Dung Dẻ / Thằng Bờm — schema MIDI OK, chưa nghe loa iPad |
| Bản đồ thám hiểm “có hình” | 35 trạm đã có `.station-nm`; chưa minh họa |
| R2 đọc trôi từng tiếng | Truyện đã highlight câu; chưa thành mode riêng |

### Đợt "tối ưu + làm dày nội dung" — 2026-08-25
Chạy trên máy dev Windows (lần đầu CÓ Python 3.13 + edge-tts → tự thu âm được, không cần máy khác).
- **P0.1 — Chấm hướng nét (nợ audit lần 3, xong)**: nét ngang chữ t vẽ DỌC từng đậu vì guideCheck chỉ so khoảng cách từng cặp điểm. Thêm `headVec()` (vector đầu nét tới điểm 25% chiều dài, chống rung tay) + check: nét ≥ k*8 phải đặt bút trong `thr*1.5` từ chấm vàng VÀ đi đúng trục mẫu (cos ≥ 0.5, nét ngắn-vừa cho 2 chiều); sai trục → cô vẽ mẫu ngay ('Chưa đúng chiều nét, bé xem cô vẽ nhé!'). Nét ngắn (chấm i/j) miễn như cũ. e2e 2 assertion mới (vuông góc bị từ chối / tô đúng mẫu đậu).
- **P0.2 — dọn repo**: xoá 5 mp3 mồ côi (SW chỉ dọn cache iPad, không dọn git). hershey.json 474KB giữ nguyên (cần cho gen_strokes.cjs, không bao giờ được fetch lúc runtime).
- **P1.1 — Lazy-load Three.js**: bỏ `<script three.min.js>` khỏi index.html — 603KB chỉ inject (`ensureThree()` trong island.js) khi lần đầu bấm 🏝️, vào màn ngay + dựng đảo khi sẵn sàng, load fail → fallback tử tế, rời màn giữa chừng thì thôi (`classList active` check). SW vẫn precache trong CORE → offline không đổi. **Boot JS: ~850KB → 247KB (−71%), js_resource_ms 106ms** (tests/perf.mjs đo, Edge headless localhost).
- **P1.2 — tests/perf.mjs**: đo bytes/timing/heap boot theo loại file — baseline cho mọi tối ưu sau.
- **P2 — Banner nhắc sao lưu**: parent stats hiện "⚠️ Chưa sao lưu hơn 14 ngày" khi có tiến độ (sao/chữ/quest/tranh) mà `bhv_last_backup` quá 14 ngày; bấm 📤 Sao lưu ghi mốc. Lớp cứu cho iOS purge localStorage khi chưa Add to Home Screen.
- **P3.A — Toán phạm vi 20 (SGK HK2)**: mode 🧮 'mix20' — đếm 10-20, cộng không nhớ (10+b hoặc 1x+y lẻ+lẻ<10), trừ không nhớ (1x−10, 1x−hàng đơn vị), so sánh 2-20. numChoices(ans, max) tổng quát.
- **P3.B — Tiếng Anh 16 → 22 chủ đề / 149 → 196 từ** (+🍓 Fruit, 🥕 Veggies, 🐛 Tiny Animals, 🕐 My Day, 🏘️ Places, 🎬 Action Verbs — bám Starters, 0 trùng từ cũ; mỗi từ có `wiki` = trang Wikipedia lấy ảnh thật sau bằng gen_images.cjs, động từ/trừu tượng NO-PHOTO dùng emoji). Chưa chạy gen_images — ảnh thật là việc kế tiếp.
- **P3.C — 📚 Đọc truyện (mode mới)**: 8 truyện 5-6 câu (chữ lớp 1, có mối liên hệ nhân vật-sự việc) — cô kể từng câu highlight vàng, xong 3 câu hỏi hiểu/truyện qua runQuiz (đáp án đúng phân bố đều A/B/C). STORIES trong data.js, startStory trong reading.js.
- **P3.D — Ca hát 16 → 20 bài** (+Kìa Con Bướm Vàng [tin cậy melody CAO], Một Con Vịt, Dung Dăng Dung Dẻ, Thằng Bờm [TRUNG BÌNH — cần tai kiểm trên iPad]; đều kết chủ âm C, range 60-72, tổng phách chẵn).
- **Audio: 1202 → 1500 clips** (gen_audio chạy tại chỗ, 1500/1500 lần đầu, 0 flake) · sw bump `bhv-v20` · **e2e 35/35 PASS** (+6 assertion: lazy-three boot, đảo sau inject, hướng nét ×2, mix20, truyện, banner sao lưu) · **user-sim 32/32 PASS** (bài VN mới chạy qua full band 128 nguồn âm) · soi mắt screenshot: menu đọc/toán, màn truyện, banner phụ huynh.
- Nợ lúc đó: ảnh 6 theme EN + tai kiểm iPad. **Ảnh 151/151 đã xong** (2026-09, `441855c`). Tai kiểm iPad vẫn treo.

### Roadmap A — đi sâu lớp 1 — ✅ XONG 2026-09-03 (live `bhv-v36`, commit `ec2a965`)

Cách A: xong nợ nhỏ rồi đi sâu từng mục. Test: TDD e2e RED → spawn implementer → GREEN. Serve `127.0.0.1:8080`.

| Khối | Việc |
|---|---|
| Ảnh EN | 151 photo, 22 theme / 196 từ |
| Toán M1–M5 | khung mười + tia số; lời văn; thành phần; hình; cộng/trừ có nhớ phạm vi 20 |
| Viết W1–W4 | hàng chữ yếu; tiếng (`syl`); HOA mẫu VN; chép từ |
| Đọc R1, R3, R4 | ảnh từ; 16 truyện + pics; từ/câu theo tuần `bhv_learn` |
| Anh E1–E3 | ôn từ yếu; câu Starters; **phonics 26 chữ** (Q/U/V extra, X=`box`) |
| Vẽ D1–D3 | 3 bài theo mẫu; tô theo tuần DIGRAPHS; tô trong đường (gợi ý, không phạt) |
| Nhạc Mu1–Mu2 | đàn 8 phím Twinkle; gõ nhịp 8 phách (cửa sổ 0.18s) |
| Quest Q1 | vùng 7 📚 Rừng Truyện (35 trạm); tên trạm; replay +1⭐; phụ huynh tuần đọc + mục tiêu ngày |
| Gallery | cap 12 (đã có từ `441855c`) |
| Dọn | xoá 5 mp3 mồ côi |

Audio **1500 → 1745**. `user-sim` trỏ `127.0.0.1` (hết IPv6 miss) + khoá quest = `STATIONS.length - 1`. 2026-09-04: e2e ALL PASS · user-sim ALL PASS.

### Đợt "chữ mẫu VN + làm dày nội dung" — 2026-08-15
- **Chữ viết thường theo đúng mẫu tập viết Bộ GD-ĐT** (thay Hershey quốc tế): `scripts/vn_lowercase.cjs` tự dựng 26 chữ + f/j/w/z bằng bezier sampling theo các nét chuẩn — cong kín, hất, móc ngược, móc hai đầu, khuyết trên (b h k l), khuyết dưới (g y), thắt (r s v k), x = )( — đúng cả **thứ tự nét** (vd: a = cong kín TRƯỚC → móc ngược SAU, khác hẳn kiểu quốc tế sổ-trước-cong-sau) và **độ cao chuẩn** (o=1 đơn vị, t=1.5, d/đ/p/q=2, b/g/h/k/l/y=2.5, khuyết dưới −1.5). HOA in + số giữ Hershey (viết giống quốc tế). Verify bằng screenshot 33 glyph. Dấu ă/â/ê/ô/ơ/ư/đ compose tự động từ base mới.
- **Nội dung dày thêm**: Tập đọc **44 từ** (+14: cua, ốc, chim, gấu, dứa, xoài, dưa hấu, xe đạp, ghế, mũ, giày, cầu vồng…) + **16 câu điền từ** (+6) · Tiếng Anh **16 chủ đề / 149 từ** (+⚽ Sports 8 từ, +🌿 Nature 8 từ) với **102 ảnh thật** (soi mắt cả 16 ảnh mới; sea phải thử 3 trang Wikipedia: Sea→bản đồ, Ocean→Trái Đất, Wind wave→✓ sóng biển) · Ca hát **12 bài** (+Itsy Bitsy Spider, +Happy Birthday — đều public domain) · Thám hiểm **4 vùng / 20 trạm** (+🏝️ Đảo Kho Báu: trạm viết chữ g khuyết dưới, EN Sports, memory Nature, boss)
- Audio **899/899** (+64 câu; gen_audio từng dính lỗi console cp1252 khi in chữ 'Đ' → chạy với `PYTHONIOENCODING=utf-8`) · sw `bhv-v7` · e2e **ALL PASS 23/23**

### Reveal ảnh thật sau khi tô màu — 2026-08-15
- Bé bấm 💾 lưu tranh tô → hiện **ảnh THẬT của thứ vừa tô** với hiệu ứng "sống" (ken-burns: zoom + lướt chéo + nghiêng nhẹ như máy quay tài liệu) + giọng đọc "Bé tô xong bức tranh X rồi!" + từ tiếng Anh. Kỳ lân không có ảnh thật → emoji nhún nhảy.
- `PIC_META` thêm `key` (ảnh manifest) + `en`; **+18 ảnh thật mới** (120 tổng) — soi mắt từng ảnh, đổi 4 trang Wikipedia sau khi soi (House→vườn Nhật ✗ → Single-family detached home; Dinosaur→phiến hoá thạch ✗ → Tyrannosaurus xương dựng; Turtle→ảnh ghép ✗ → Green sea turtle; Orchard ✗ → Fruit tree). Video thật KHÔNG khả thi: Wikimedia chỉ có WebM, iOS không phát được.
- Audio **948/948** (+49: 32 câu khen theo tên tranh + từ EN mới; câu "Bánh kem" fail 4 lần liên tiếp — vẫn chỉ là flaky, thử tay câu gốc ra 30KB → rerun là xong) · saveToGallery nhận callback `onSaved`, có reveal thì không đọc chồng câu "Đã lưu" · sw `bhv-v8` · e2e **25 assertion**.

### Audit toàn diện lần 3 — 2026-08-15 (5 agent: logic, canvas/3D, audio, PWA, sư phạm)
**11 bug xác nhận, Đợt 0 hotfix đã sửa hết trong ngày:**
- [HIGH] `else stopSong()` cuối showScreen giết lời chào đảo 3D → dời stopSong lên đầu hàm
- [HIGH] Xoay iPad rồi undo/auto-bake → xoá trắng tranh vẽ tự do (history mất base) → thêm `makeHistory.rebase()`, helper `rescaleFreeDraw()` dùng chung 3 chỗ (cả case xoay khi tab ẩn)
- [HIGH] `assets/images/manifest.json` không được cache ở đâu → offline lần 2 mất toàn bộ ảnh tiếng Anh dù 119 jpg nằm sẵn trong cache → warmImages cache.put manifest
- [MED] guideCheck: threshold cố định 34px khiến nét chấm chữ i (6px) chạm đâu cũng đậu → thr scale theo độ dài nét (`min(k*11, tlen*0.8+k*2)`, sàn 14px); tap 1 điểm giờ chấm được nét chấm; nét khuyết dài vẽ dở đúng hướng không bị phạt oan ("Gần đúng rồi! Bé vẽ cả nét một hơi nhé!"); xoay màn giữa nét không tính sai (`wResized`)
- [MED] Kinh tế sao: exploit mic +1⭐/từ vô hạn (180⭐/30phút) → `micStar()` cap 10⭐/ngày; viết lặp chữ đã max chỉ còn 1⭐; Đọc theo hết thưởng đúp (kết lượt tối đa 1⭐)
- [LOW] quest.js selector `.tab` xoá highlight mode tab (tái phạm bẫy writing.js:39) → `[data-set]` · qWord lọc distractor trùng tiếng-cuối-bỏ-dấu (quả dứa vs quả dưa hấu) · reveal flash ảnh tranh trước → ẩn img tới onload · lineCap set lại mỗi move (xoay giữa nét hết đầu vuông) · unlock `<audio>` ngay trong gesture (ensureAC) — iOS cũ hết câm câu đầu · mic EN nhận alias ping pong/soccer/airplane, match từng alternative · SW dọn mp3/ảnh mồ côi sau warm
**Verified sạch (không phải bug):** speak race khi navigate nhanh, wSet trạm quest, questDone tuyến tính, crayon replay, backing band 396 node/31s (headroom >10×), coverage 949/949, hash JS↔Python, memory game theme mới, table tennis substring match, quota iOS (18MB ≪ ~7GB), reveal + 🏠 (z-index chặn sẵn).
**Nợ đã ghi nhận (chưa sửa — nằm trong plan enhance):** nét ngang chữ t vẽ vuông góc vẫn đậu (cần chấm hướng nét), font Google mất offline first-visit (nên self-host), localStorage mất nếu KHÔNG Add to Home Screen (persist() iOS vô tác dụng — cần export/import + banner A2HS), thiếu splash iPad.

### Enhance FULL (4 đợt, workflow 12 agent sinh+phản biện) — 2026-08-15
- **Đợt 1 — Tiếng Việt sâu**: `VAN2` 32 vần có âm cuối (an→ach, tuần 10-17 SGK) + `DIGRAPHS` 11 âm ghép (ch th nh ph kh ng ngh gh qu gi tr, tuần 5-9) — mỗi mục 2 từ minh hoạ đã phản biện đúng vần/luật chính tả ngh-gh · 2 chế độ đọc mới: 🔚 Vần cuối (qVan2) + 🔗 Chữ ghép (qDigraph) · **lộ trình tuần** `bhv_learn`: bắt đầu 2 tuần đầu, đúng ≥70% lượt mở tuần kế · mix có vần đóng/âm ghép
- **Đợt 2 — Toán 0-10**: module `js/math.js` mới (thẻ 🔢 màn hình chính): Đếm số, Phép cộng (a+b≤10, emoji 2 nhóm), Phép trừ (emoji gạch bỏ), Nhiều hơn (so sánh 2 nhóm), Trộn — engine runQuiz dùng chung, 102 câu đọc số dạng chữ số
- **Đợt 3 — Retention**: 📤 Sao lưu / 📥 Nhập lại tiến độ (base64, validate trước khi ghi đè — chống mất sao khi iOS dọn storage) · nudge nghỉ mắt sau 25 phút tương tác liên tục (🐰 + 1 nút) · banner nhắc Add to Home Screen (iPad Safari chưa standalone, tắt được) · **font tự host** 10 woff2 Baloo 2 + Quicksand vietnamese+latin trong CORE — bỏ hẳn Google Fonts, offline đẹp từ lần mở đầu
- **Đợt 4 — Vui + học sâu**: Ca hát **16 bài** (+4 dân ca public domain: Bắc Kim Thang, Cò Lả, Lý Cây Xanh, Trống Cơm — `lang:'vi-VN'`, sửa luôn bug readSong đọc lời Việt bằng giọng Anh) · **10 món trang trí đảo 3D** mở theo mốc sao 577→802⭐ nối sau sticker vàng (nhà gỗ, cầu tàu, lửa trại khói bay, thuyền, cột cờ, xích đu, giếng, vườn hoa, cối xay gió QUAY, cầu vồng) · quest **vùng 5 🌋 Núi Lửa Trí Tuệ** (25 trạm: vần cuối, viết b, chữ ghép, toán, boss tổng hợp) · tập viết: **cô viết mẫu tự động** chữ mới + **chấm đúng chiều nét** ("Bé đặt bút ở chấm vàng nhé!")

### Audit voice + fix Tự viết + karaoke — 2026-08-15
- **Tự viết theo mẫu VN**: free mode trước đây vẽ template bằng font Baloo (chữ 'a' 2 tầng kiểu Latin) — giờ MỌI chế độ dùng bộ nét mẫu VN (nét mờ đứt để đồ tự do), chấm điểm coverage cũng theo điểm trên nét mẫu thay vì raster font.
- **Bài hát hết "đơ"**: chế độ Hát giờ là **karaoke thật** — giọng cô đọc lời phát ĐÈ nhạc đệm đúng timeline, nhạc tự hạ 0.85→0.28 khi hát rồi trả lại; 61 clip lời hát regen với `rate +6% / pitch +25Hz` (tag `kind:'song'` trong phrases.json, gen_audio.py xử lý riêng) → **AUDIO_CACHE bump v2** (bắt buộc: cùng tên file khác nội dung).
- **Audit voice (1 agent, đo mp3 thật)**: coverage 1165/1165 sạch tuyệt đối. 5 fix: câu "Trạm trùm đây!" dài 4.1s bị speakQ cắt ở 2500ms → firstDelay boss 4500ms · "Bé xem cô viết mẫu" 2.76s bị demo ngắn (73/76 chữ) cắt → nói XONG mới chạy demo (speakAsync chain + token guard) · nudge nghỉ mắt bị guideCheck/island speak đè (pointer capture xuyên overlay) → cả 2 chỗ bỏ qua khi #nudge đang hiện · máy không có giọng vi → Web Speech đọc tiếng Việt bằng voice Anh thành tiếng ngọng → thà im lặng (skip khi getVoices đã load mà thiếu vi) · mic tiếng Anh bật ở 900ms cố định khi mp3 còn phát → loa ngoài tự "nói đúng" ăn sao → bật mic SAU speakAsync xong.
- Ghi nhận không sửa (by design/platform): PRAISE bị cắt khi trẻ bấm Tiếp nhanh (user-paced), iOS gạt mute làm nhạc đệm (AudioContext) im nhưng giọng (audio element) vẫn kêu — hành vi Safari, không can thiệp được.

## Quyết định thiết kế đã chốt
- 2D cho phần học, 3D chỉ cho khu phần thưởng (không full 3D)
- Ảnh thật (photo CC0) cho từ vựng; thư viện/asset mã nguồn mở bundle local; **không** nhúng iframe/dịch vụ bên thứ ba
- Design family: Playful Color (Baloo 2 + Quicksand, palette coral/sky/lime/violet/sun)
- Giọng nữ mọi nơi; nội dung bám SGK lớp 1 (bảng chữ 29 + vần + dấu thanh) và giáo trình Cambridge Starters cho tiếng Anh
