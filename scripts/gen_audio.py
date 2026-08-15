# Generate audio giọng nữ cho mọi câu trong phrases.json bằng Edge TTS (miễn phí)
# vi: HoaiMy (nữ, mượt) — en: Ana (giọng bé gái, hợp app trẻ em)
# Chạy: python scripts/gen_audio.py   (cần internet; chỉ generate file còn thiếu)
import asyncio, json, os, sys

try:
    import edge_tts
except ImportError:
    sys.exit("Thiếu edge-tts. Cài: pip install edge-tts")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(ROOT, "assets", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

VOICES = {"vi": "vi-VN-HoaiMyNeural", "en": "en-US-AnaNeural"}
RATE = "-10%"  # chậm lại một chút cho trẻ
# lời bài hát (kind='song'): nhanh + cao hơn cho tươi, đỡ "đơ" khi hát karaoke đè nhạc đệm
SONG_RATE, SONG_PITCH = "+6%", "+25Hz"

def phrase_id(lang: str, text: str) -> str:
    """djb2-xor, PHẢI khớp với phraseId() trong js/app.js.
    JS chạy trên code unit UTF-16 (charCodeAt) — phải encode utf-16-le rồi hash
    từng cặp byte, nếu không chuỗi chứa emoji/ký tự ngoài BMP sẽ ra id khác JS."""
    h = 5381
    data = (lang + "|" + text).encode("utf-16-le")
    for i in range(0, len(data), 2):
        unit = data[i] | (data[i + 1] << 8)
        h = ((h * 33) & 0xFFFFFFFF) ^ unit
    return format(h, "x")  # hex, khớp toString(16)

async def gen_one(sem, item, results):
    pid = phrase_id(item["lang"], item["t"])
    path = os.path.join(AUDIO_DIR, pid + ".mp3")
    results[pid] = 1
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    async with sem:
        for attempt in range(3):
            try:
                if item.get("kind") == "song":
                    tts = edge_tts.Communicate(item["t"], VOICES[item["lang"]], rate=SONG_RATE, pitch=SONG_PITCH)
                else:
                    tts = edge_tts.Communicate(item["t"], VOICES[item["lang"]], rate=RATE)
                await tts.save(path)
                print("ok ", item["lang"], item["t"][:50])
                return
            except Exception as e:
                if attempt == 2:
                    print("FAIL", item["t"][:50], e)
                    results.pop(pid, None)
                    if os.path.exists(path):
                        os.remove(path)
                else:
                    await asyncio.sleep(2 * (attempt + 1))

async def main():
    with open(os.path.join(ROOT, "scripts", "phrases.json"), encoding="utf-8") as f:
        phrases = json.load(f)
    sem = asyncio.Semaphore(6)
    results = {}
    await asyncio.gather(*(gen_one(sem, p, results) for p in phrases))
    with open(os.path.join(AUDIO_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(results, f)
    print(f"done: {len(results)}/{len(phrases)} clips -> assets/audio/")

asyncio.run(main())
