# Bé Học Vui — grade-1 learning PWA (iPad, offline-first)

Live: https://veorandy-cloud.github.io/be-hoc-vui/ · repo veorandy-cloud/be-hoc-vui · no build step, vanilla JS.

## Commands
- Serve: `python -m http.server 8080`
- Tests: `node tests/e2e.mjs` (smoke) + `node tests/user-sim.mjs` (plays like a child; SHOT_DIR=<dir> for screenshots). Both need the server on :8080.
- Audio: `node scripts/list-phrases.cjs && PYTHONIOENCODING=utf-8 python scripts/gen_audio.py` — RERUN until N/N (edge-tts flakes ~1 clip/run).
- Strokes: `node scripts/gen_strokes.cjs` (merges scripts/vn_lowercase.cjs VN letterforms over Hershey).
- Deploy: git push → poll `curl -s .../sw.js | grep -o "bhv-v[0-9]*"` until new version (~30-60s).

## Load order (index.html, global scope, no modules)
data → strokes → core → paint → writing → reading → math → drawing → english → music → quest → three.min → island

## Invariants (break these = subtle bugs)
- Every spoken string MUST be enumerated in scripts/list-phrases.cjs with 100% identical text (djb2-xor phraseId → mp3 filename). New speak() call = add phrase + regen audio.
- Same text = same mp3 filename. Regenerating with different voice/rate/pitch = MUST bump AUDIO_CACHE in sw.js. Adding clips = no bump needed.
- `uiGen` increments on showScreen/new round; every async callback must re-check `gen===uiGen` before touching UI/speak. speakAsync resolves EARLY when cut by another speak — guards need per-action tokens (see curLine in music.js, flashTap in english.js) when "resolved" ≠ "finished".
- Bump sw.js VERSION on every JS/CSS/HTML change.
- Pedagogy: letters use ÂM ĐỌC (bờ, cờ, quờ) not alphabet names; 'q' never displays alone — dispLetter() shows 'qu'. Đánh vần chain = spellTieng() in data.js (shared with audio pipeline).
- Distractors must not appear in the displayed word/image (see qVan2/qDigraph/qWord filters).

## Environment traps (this machine)
- Foreground shell spawns fail (EPERM uv_spawn) — run EVERY Bash/PowerShell command with run_in_background:true and read the output file.
- css/style.css must stay BOM-free (a mid-file BOM once killed :root and turned the UI white). Always screenshot-verify UI-affecting changes.
- playwright-core: channel msedge (tests) / chrome (one-off gen scripts); temp scripts live in repo root as *.tmp.mjs, delete after use.

## Content sizes (update when they change)
1202 audio clips · 119 vocab photos · 32 coloring pics · 76 stroke glyphs · 25 quest stations · 16 songs (last 4 lang:'vi-VN').
