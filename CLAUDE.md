# Bé Học Vui — grade-1 learning PWA (iPad, offline-first)

Live: https://veorandy-cloud.github.io/be-hoc-vui/ · repo veorandy-cloud/be-hoc-vui · no build step, vanilla JS.

## Commands
- Serve: `python -m http.server 8080`
- Tests: `node tests/e2e.mjs` (smoke + audio sweep: mọi `say` của mọi builder/quest phải có mp3) + `node tests/user-sim.mjs` (plays EVERY mode like a child, then clears all 40 quest stations with a runQuiz hook + template tracing; ~16 phút (chờ cô đọc đáp án), chạy nền; SHOT_DIR=<dir> for screenshots) + `node tests/perf.mjs` (boot numbers, no assert). All need the server on :8080.
- Audio: `node scripts/list-phrases.cjs && PYTHONIOENCODING=utf-8 python scripts/gen_audio.py` — RERUN until N/N (edge-tts flakes ~1 clip/run).
- Strokes: `node scripts/gen_strokes.cjs` (merges scripts/vn_lowercase.cjs + vn_uppercase.cjs VN letterforms over Hershey; digits stay Hershey).
- Deploy: git push → poll `curl -s .../sw.js | grep -o "bhv-v[0-9]*"` until new version (~30-60s).

## Load order (index.html, global scope, no modules)
data → strokes → core → paint → writing → reading → math → drawing → english → music → quest → island
(three.min.js KHÔNG nằm trong index.html nữa — island.js `ensureThree()` inject khi lần đầu bấm 🏝️; SW vẫn precache trong CORE)

## Invariants (break these = subtle bugs)
- Every spoken string MUST be enumerated in scripts/list-phrases.cjs with 100% identical text (phraseId = djb2-xor + FNV-1a, 16 hex → mp3 filename; djb2 alone collided on 2-char strings 'cá'='om'). New speak() call = add phrase + regen audio. Đổi hash = đổi tên TOÀN BỘ file (script rename, không thu lại) + bump AUDIO_CACHE.
- Same text = same mp3 filename. Regenerating with different voice/rate/pitch = MUST bump AUDIO_CACHE in sw.js. Adding clips = no bump needed.
- `uiGen` increments on showScreen/new round; every async callback must re-check `gen===uiGen` before touching UI/speak. speakAsync resolves EARLY when cut by another speak — guards need per-action tokens (see curLine in music.js, flashTap in english.js) when "resolved" ≠ "finished".
- Bump sw.js VERSION on every JS/CSS/HTML change.
- Pedagogy: letters use ÂM ĐỌC (bờ, cờ, quờ) not alphabet names; 'q' never displays alone — dispLetter() shows 'qu'. Đánh vần chain = spellTieng() in data.js (shared with audio pipeline).
- Distractors must not appear in the displayed word/image (see qVan2/qDigraph/qWord filters).
- Tiếng = onset + vần: `splitTieng()`/`onsetName()` in data.js (ONSETS longest-first: ngh before ng). Ghép vần + spellTieng dùng chung — đừng `t[0]`/`t.slice(1)`.
- Dấu thanh tập viết KHÔNG nằm trong strokes.js: `glyphWithTone()` (writing.js TONE_STROKES) ghép runtime, nét dấu là nét CUỐI của chữ đó. Phrase 'Bé vẽ nét số N nhé!' enumerated tới 24.
- Math banks (MATH_STORY_BANK, MATH_100, WEEKDAYS) sống trong data.js để list-phrases đọc thẳng — không hardcode say strings trong math.js nữa.
- TONE_SETS: mỗi bộ ≥3 tiếng CÓ NGHĨA (qTone/Ghép vần pick 3); learnAdvance trần = max week trong VAN2/DIGRAPHS.
- **Chạm là nghe** (runQuiz): mỗi choice được cô đọc khi chạm — `say` riêng, hoặc text thuần của `html` (plainText), `say:null` = im. Choice mới có chữ = phải enumerate chuỗi đó trong list-phrases (e2e sweep bắt). Đúng → đọc xong mới sang câu; sai → hỏi lại cuối lượt (`retry`, tối đa 3).
- runQuiz `title` (tên bài) → `intro`/`introKey` (introOnce, nói 1 lần, cờ `bhv_intro_*`) → đề. Hàm nào tự speak lúc vào (startGhep/Repeat/Story/Spell/Memory) dùng `firstP` chain thay vì setTimeout để không bị cắt.
- Thẻ toán HK2 `data-lock` khoá tới `bhv_mathok`≥6 hoặc `bhv_unlockall` (nút phụ huynh). Test cần HK2 → set `bhv_unlockall`.
- Từ ngữ cho bé: không dùng từ tiêu cực/trừu tượng (đã bỏ ghẻ/mủ/mù/tù/huỵch, thay bằng múa/ngoằn ngoèo…); FACTS = câu ngắn, đúng sự thật, có emoji.

## Environment traps (this machine)
- Foreground shell spawns fail (EPERM uv_spawn) — run EVERY Bash/PowerShell command with run_in_background:true and read the output file.
- css/style.css must stay BOM-free (a mid-file BOM once killed :root and turned the UI white). Always screenshot-verify UI-affecting changes.
- playwright-core: channel msedge (tests) / chrome (one-off gen scripts); temp scripts live in repo root as *.tmp.mjs, delete after use.
- WindowsApps Python `http.server` accepts then immediately closes the socket (RemoteDisconnected). Serve with a Node static server. Playwright `localhost` on this PC is IPv6 (`::1`); bind/listen on `127.0.0.1` and point tests at `http://127.0.0.1:8080` (see tests/e2e.mjs BASE).
- `confirmTap` must clearTimeout on re-arm/confirm. Stale 3s timers from a prior goHome wipe `dataset.armed` of the next one → e2e `không về được home` after toán hình.

## Content sizes (update when they change)
3573 audio clips (gồm "chạm là nghe": mọi đáp án chữ/số, tên thẻ, lời dẫn, 28 FACTS) · 151 vocab photos · 32 coloring pics (reorder by current DIGRAPHS week) · 3 vẽ theo mẫu · 76 stroke glyphs (+5 tone marks runtime) · 40 quest stations / 8 lands · 20 songs (8 lang:'vi-VN', đàn theo mọi bài) · 22 EN themes / 196 words · 90 EN Starters sentences · EN spelling 35 từ 3 chữ · 16 stories · VN: 120 vần VAN2 (tuần 10–29) · 11 âm ghép · 36 bộ dấu · 30 cặp CV · 101 từ · 51 câu điền · tập viết 25 tiếng / 18 từ · math: khung mười + mix20 + có nhớ + lời văn (30, tới 20) + thành phần + hình & 2 khối + đến 100 (MATH_100 bank) + dãy số + giờ đúng/thứ + đo cm.
