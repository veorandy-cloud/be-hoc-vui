"use strict";
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const pick = (a,n) => shuffle([...a]).slice(0,n);
const rand = a => a[Math.floor(Math.random()*a.length)];
/* localStorage hỏng (ghi dở, sửa tay) không được làm chết app — parse lỗi thì xoá key và dùng mặc định */
function safeParse(key, fb, chk){
  // chk: validator shape — JSON hợp lệ nhưng sai kiểu (vd '5' cho key object) cũng phải về mặc định,
  // nếu không writeBest[ch]=... trên primitive sẽ TypeError trong strict mode → chết nút bấm vĩnh viễn
  try{
    const v = JSON.parse(localStorage.getItem(key));
    if(v==null || (chk && !chk(v))) return fb;
    return v;
  }
  catch(e){ try{ localStorage.removeItem(key); }catch(e2){} return fb; }
}
const isObj = v => typeof v==='object' && !Array.isArray(v);

/* ============ AUDIO ============ */
let AC;
function ensureAC(){
  if(!AC) AC = new (window.AudioContext||window.webkitAudioContext)();
  // iOS suspend AudioContext khi khoá màn hình/chuyển app — không resume là mất nhạc/sfx vĩnh viễn
  if(AC.state!=='running' && AC.resume) AC.resume().catch(()=>{});
  // unlock <audio> NGAY TRONG gesture — iOS cũ drop token nếu play() đầu tiên nằm sau rAF/setTimeout
  if(!audioEl){ audioEl = new Audio(); try{ audioEl.play().catch(()=>{}); }catch(e){} }
}
function tone(freq, t0, dur, vol=.22){
  const o=AC.createOscillator(), g=AC.createGain();
  o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(AC.destination);
  g.gain.setValueAtTime(vol, AC.currentTime+t0);
  g.gain.exponentialRampToValueAtTime(.001, AC.currentTime+t0+dur);
  o.start(AC.currentTime+t0); o.stop(AC.currentTime+t0+dur);
}
function sndGood(){ try{ensureAC(); tone(660,0,.15); tone(880,.13,.25);}catch(e){} }
function sndBad(){ try{ensureAC(); tone(180,0,.3);}catch(e){} }
function sndWin(){ try{ensureAC(); [523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.3));}catch(e){} }
function sndPop(){ try{ensureAC(); tone(1200,0,.08,.12);}catch(e){} }

/* ưu tiên giọng NỮ — êm tai hơn cho trẻ (Linh/HoaiMy cho vi, Samantha/Zira/Aria... cho en) */
const VOICES = {};
function refreshVoices(){
  try{
    const vs = speechSynthesis.getVoices();
    const prefer = (lang, names)=>{
      const cand = vs.filter(v=>v.lang && v.lang.toLowerCase().startsWith(lang));
      if(!cand.length) return null;
      for(const n of names){
        const f = cand.find(v=>v.name.toLowerCase().includes(n));
        if(f) return f;
      }
      return cand.find(v=>/female|nữ|woman/i.test(v.name)) || cand[0];
    };
    VOICES.vi = prefer('vi', ['linh','hoaimy','my','female']);
    VOICES.en = prefer('en', ['samantha','zira','aria','jenny','michelle','karen','ana','female','google us english']);
  }catch(e){}
}
try{ speechSynthesis.onvoiceschanged = refreshVoices; refreshVoices(); }catch(e){}
function makeUtter(text, lang){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const v = VOICES[lang.startsWith('vi')?'vi':'en'];
  if(v) u.voice = v;
  u.pitch = 1.05;
  return u;
}
/* audio thu sẵn (Edge TTS giọng nữ) phát trước, Web Speech chỉ là fallback */
let AUDIO_MAN = null, audioEl = null, audioResolve = null;
fetch('assets/audio/manifest.json').then(r=>r.json()).then(j=>{ AUDIO_MAN=j; }).catch(()=>{});
// xin iOS đừng purge storage (sao/sticker/tranh/quest) khi máy đầy — Safari 15.2+
try{ navigator.storage && navigator.storage.persist && navigator.storage.persist().catch(()=>{}); }catch(e){}
function phraseId(lang, text){
  // djb2-xor — PHẢI khớp phrase_id() trong scripts/gen_audio.py
  let h = 5381;
  const s = lang + '|' + text;
  for(let i=0;i<s.length;i++) h = (((h*33)>>>0) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
function stopSpeak(){
  try{ speechSynthesis.cancel(); }catch(e){}
  if(audioEl){ audioEl.onended=null; audioEl.onerror=null; try{audioEl.pause();}catch(e){} }
  // câu đang chờ bị cắt ngang vẫn phải resolve — chuỗi await (Đọc lời chậm) không bao giờ treo
  if(audioResolve){ const f=audioResolve; audioResolve=null; f(); }
}
function ttsSpeak(text, lang){
  return new Promise(res=>{
    let done=false;
    const fin=()=>{ if(!done){ done=true; res(); } };
    // máy KHÔNG có giọng vi (getVoices đã load mà VOICES.vi null): voice mặc định tiếng Anh
    // đọc tiếng Việt thành tiếng ngọng vô nghĩa — thà im lặng còn hơn
    try{
      if(lang.startsWith('vi') && !VOICES.vi && speechSynthesis.getVoices().length){ fin(); return; }
    }catch(e){}
    try{
      const u = makeUtter(text, lang);
      u.rate = 0.9;
      u.onend = fin; u.onerror = fin;
      speechSynthesis.speak(u);
      // watchdog: iOS thỉnh thoảng drop utterance không bắn event nào → chuỗi await (Đọc lời chậm) treo vĩnh viễn
      setTimeout(fin, 1500 + text.length*120);
    }catch(e){ fin(); }
  });
}
function speakAsync(text, lang='vi-VN'){
  stopSpeak();
  const short = lang.startsWith('vi') ? 'vi' : 'en';
  const id = phraseId(short, text);
  if(AUDIO_MAN && AUDIO_MAN[id]){
    return new Promise(res=>{
      let done=false; // onerror + play().catch có thể CÙNG bắn khi mp3 lỗi → chỉ kết thúc 1 lần
      const fin = ()=>{ if(done) return; done=true; if(audioResolve===fin) audioResolve=null; res(); };
      // fallback chỉ khi câu này VẪN là câu hiện hành (audioResolve===fin) — không đọc lại câu cũ đè câu mới
      const fallback = ()=>{ if(done) return; if(audioResolve!==fin){ fin(); return; } ttsSpeak(text, lang).then(fin); };
      audioResolve = fin;
      if(!audioEl) audioEl = new Audio(); // tái dùng 1 element — không xả rác hàng trăm Audio object
      const a = audioEl;
      a.onended = fin;
      a.onerror = fallback;
      a.src = 'assets/audio/'+id+'.mp3';
      a.play().catch(fallback);
    });
  }
  return ttsSpeak(text, lang);
}
function speak(text, lang='vi-VN'){ speakAsync(text, lang); }

/* hành động phá hoại (xoá tranh, xoá bài viết, thoát giữa lượt) phải chạm 2 lần trong 3s */
function confirmTap(btn, msg, fn){
  if(btn.dataset.armed){
    delete btn.dataset.armed; btn.classList.remove('armed');
    fn();
    return;
  }
  btn.dataset.armed='1'; btn.classList.add('armed');
  sndPop(); speak(msg);
  setTimeout(()=>{ delete btn.dataset.armed; btn.classList.remove('armed'); }, 3000);
}


/* ============ STARS & STICKERS ============ */

const starCount = $('#star-count');
let stars = Number(localStorage.getItem('bhv_stars'))||0;   // ||0 nuốt cả NaN — giá trị hỏng tự về 0
let stickersShown = Number(localStorage.getItem('bhv_stk'))||0;
function unlockedCount(){ return Math.min(STICKERS.length, Math.floor(stars/STICKER_COST)); }
/* tier VÀNG: hết 24 sticker thường (192⭐) thì mỗi 15⭐ mở lại bộ sticker dạng vàng — vòng thưởng không cạn */
const GOLD_COST = 15, GOLD_BASE = STICKERS.length*STICKER_COST;
function goldCount(){
  return stars<=GOLD_BASE ? 0 : Math.min(STICKERS.length, Math.floor((stars-GOLD_BASE)/GOLD_COST));
}
function updateStarUI(){
  starCount.textContent = stars;
  $('#shelf-count').textContent = `(${unlockedCount()+goldCount()}/${STICKERS.length*2})`;
}
updateStarUI();
function addStars(n){
  if(n<=0) return;
  stars += n; localStorage.setItem('bhv_stars', stars);
  updateStarUI();
  const p = $('#star-pop');
  p.textContent = '+'+n+' ⭐'; p.classList.remove('go'); void p.offsetWidth; p.classList.add('go');
}
/* chống farm sao bằng mic (chạm thẻ → nói → +1⭐ lặp vô hạn): tối đa 10 sao mic/ngày */
function micStar(){
  const d = safeParse('bhv_mic', {}, isObj);
  const today = dayKey(new Date());
  if(d.day!==today){ d.day=today; d.n=0; }
  if(d.n>=10) return false;
  d.n++; localStorage.setItem('bhv_mic', JSON.stringify(d));
  return true;
}

/* ============ DAILY STREAK ============ */
const dayKey = d => `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
let streak = 1, newDay = false;
(function(){
  const s = safeParse('bhv_streak', {}, isObj);
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now()-864e5));
  if(s.d === today){ streak = s.n||1; return; }
  streak = (s.d === yesterday) ? (s.n||0)+1 : 1;
  newDay = true;
  localStorage.setItem('bhv_streak', JSON.stringify({d:today, n:streak}));
})();
function helloLine(){
  return rand(HELLO) + (streak>1 ? ` 🔥${streak} ngày!` : '');
}

/* ============ CONFETTI ============ */
const CONF_COLORS = ['#FF5C5C','#38BDF8','#84CC16','#8B5CF6','#FACC15','#EC4899'];
const CONF_EMOJI = ['⭐','🎉','💖','🌟'];
function confetti(big){
  const n = big?60:40;
  for(let i=0;i<n;i++){
    const c=document.createElement('div');
    const isEm = i%6===0;
    c.className='confetti'+(isEm?' emoji':'');
    if(isEm) c.textContent = rand(CONF_EMOJI);
    else c.style.background = CONF_COLORS[i%CONF_COLORS.length];
    c.style.left = Math.random()*100+'vw';
    c.style.animationDuration = (1.2+Math.random()*1.6)+'s';
    c.style.animationDelay = (Math.random()*.5)+'s';
    document.body.appendChild(c);
    setTimeout(()=>c.remove(), 3600);
  }
}

/* ============ OVERLAY ============ */
let ovCallback=null;
function showResult(earned, msg){
  roundActive=false; // lượt đã kết thúc — 🏠 không cần hỏi lại nữa
  $('#ov-emoji').textContent = earned>=3?'🎉':earned>=1?'🌟':'💪';
  $('#ov-msg').textContent = msg;
  $('#ov-stars').textContent = earned>0 ? '⭐'.repeat(earned) : '🍀';
  $('#overlay').classList.add('show');
  addStars(earned);
  if(earned>=2){ confetti(earned>=3); sndWin(); }
  speak(earned>0 ? rand(PRAISE) : rand(CHEER));
}
$('#ov-next').addEventListener('click', ()=>{
  // sticker gift chain: mỗi lần đóng overlay, nếu vừa mở khoá sticker mới (thường hoặc vàng) thì khoe luôn
  if(unlockedCount()+goldCount() > stickersShown){
    const idx = stickersShown;
    const gold = idx >= STICKERS.length;
    const s = STICKERS[gold ? idx-STICKERS.length : idx];
    stickersShown++; localStorage.setItem('bhv_stk', stickersShown);
    updateStarUI();
    $('#ov-emoji').textContent = s.em;
    $('#ov-msg').textContent = gold ? `✨ Sticker VÀNG: ${s.nm}!` : `Bé nhận được sticker mới: ${s.nm}!`;
    $('#ov-stars').textContent = gold ? '✨🏆✨' : '🎁';
    confetti(true); sndWin();
    speak(gold ? `Tuyệt đỉnh! Bé nhận được sticker vàng: ${s.nm}!`
               : `Chúc mừng bé! Bé nhận được sticker ${s.nm}!`);
    return;
  }
  $('#overlay').classList.remove('show');
  if(ovCallback){ const f=ovCallback; ovCallback=null; f(); }
});

/* ============ NAVIGATION ============ */
let uiGen=0; // tăng khi đổi màn hình / bắt đầu lượt chơi mới → timer của lượt cũ tự huỷ
function showScreen(id){
  uiGen++;
  // dừng nhạc TRƯỚC khi init màn mới — để else-branch cuối hàm không giết lời chào màn mới (vd đảo 3D)
  if(id!=='scr-music') stopSong();
  $$('.screen').forEach(s=>s.classList.remove('active'));
  $('#'+id).classList.add('active');
  $('#btn-home').style.display = id==='scr-home' ? 'none' : '';
  const t = {'scr-home':'🌈 Bé Học Vui','scr-write':'✏️ Tập viết','scr-read':'📖 Tập đọc',
             'scr-draw':'🎨 Vẽ','scr-en':'🐣 Tiếng Anh','scr-stickers':'🎁 Bộ sưu tập',
             'scr-quest':'🗺️ Thám hiểm','scr-music':'🎵 Ca hát','scr-parent':'👨‍👩‍👧 Phụ huynh',
             'scr-island':'🏝️ Đảo Sticker','scr-math':'🔢 Toán'};
  $('#hdr-title').textContent = t[id];
  $('#btn-parent').style.display = id==='scr-home' ? '' : 'none';
  if(id==='scr-home'){ $('#hello-text').textContent = helloLine(); }
  if(id==='scr-write') initWrite();
  if(id==='scr-read') readShowMenu();
  if(id==='scr-draw') initDraw();
  if(id==='scr-en') initEnglish();
  if(id==='scr-stickers') renderStickers();
  if(id==='scr-island') enterIsland();
  if(id==='scr-math') initMath();
  if(id==='scr-quest') questShowMap();
  if(id==='scr-parent') initParent();
  if(id==='scr-music') initMusic();
}
$$('.big-card').forEach(c=>c.addEventListener('click', ()=>{ ensureAC(); showScreen(c.dataset.go); }));
let roundActive=false; // đang giữa một lượt chơi — bấm 🏠 phải xác nhận kẻo mất tiến độ oan
$('#btn-home').addEventListener('click', function(){
  const go = ()=>{ roundActive=false; questActive=null; showScreen('scr-home'); };
  if(roundActive) confirmTap(this, 'Bấm lần nữa để về nhà, lượt chơi này sẽ mất nhé!', go);
  else go();
});
$('#sticker-shelf').addEventListener('click', ()=>{ ensureAC(); showScreen('scr-stickers'); });
$('#star-chip').addEventListener('click', ()=>showScreen('scr-stickers'));
$('#mascot').addEventListener('click', function(){
  this.classList.remove('wiggle'); void this.offsetWidth;
  sndPop(); speak(rand(JOKES));
});


/* ============ QUIZ ENGINE ============ */
function runQuiz(cfg){
  const gen = ++uiGen;
  roundActive=true;
  let idx=0, right=0, firstTry=true, locked=false, firstRender=true;
  function speakQ(){ const q=cfg.questions[idx]; speak(q.say, q.lang||'vi-VN'); }
  cfg.speakBtn.onclick = speakQ;
  function render(){
    const q = cfg.questions[idx];
    firstTry=true; locked=false;
    let wrongs=0, correctBtn=null; // sai 2 lần (hoặc iPad đang mute không nghe được đề) → nhấp nháy đáp án đúng
    cfg.progressEl.textContent = `Câu ${idx+1} / ${cfg.questions.length}   ${'🟢'.repeat(right)}`;
    cfg.promptEl.innerHTML = q.html || '🔊';
    cfg.choicesEl.innerHTML = '';
    shuffle(q.choices).forEach(ch=>{
      const b=document.createElement('button');
      b.className='choice'+(ch.cls?' '+ch.cls:'');
      b.innerHTML = ch.html;
      if(ch.correct) correctBtn=b;
      b.onclick = ()=>{
        if(locked) return;
        if(ch.correct){
          locked=true; b.classList.remove('hint'); b.classList.add('good'); sndGood();
          if(firstTry) right++;
          setTimeout(()=>{ if(gen===uiGen) next(); }, 800);
        }else{
          b.classList.add('bad'); sndBad(); firstTry=false;
          wrongs++;
          if(wrongs>=2 && correctBtn) correctBtn.classList.add('hint');
          setTimeout(()=>b.classList.remove('bad'), 500);
        }
      };
      cfg.choicesEl.appendChild(b);
    });
    // câu đầu có thể chờ lâu hơn (cfg.firstDelay) để lời dẫn — vd câu trùm quest — không bị speakQ cắt ngang
    const delay = firstRender ? (cfg.firstDelay||300) : 300;
    firstRender=false;
    setTimeout(()=>{ if(gen===uiGen) speakQ(); }, delay);
  }
  function next(){
    idx++;
    if(idx < cfg.questions.length){ render(); }
    else cfg.onDone(right, cfg.questions.length);
  }
  render();
}
function quizStars(right, total){
  const r = right/total;
  return r>=0.85?3 : r>=0.5?2 : right>0?1:0;
}

/* ============ NUDGE NGHỈ MẮT — thêm cuối js/core.js ============ */
document.body.insertAdjacentHTML('beforeend',
  '<div id="nudge"><div id="nudge-box">' +
    '<div id="nudge-em">🐰</div>' +
    '<div id="nudge-msg">Mình chơi lâu rồi, nghỉ mắt chút nhé!</div>' +
    '<button class="btn primary" id="nudge-ok">Dạ, nghỉ 1 chút 👀</button>' +
  '</div></div>');
const NUDGE_AFTER = 25*60e3, NUDGE_IDLE = 5*60e3;
let nudgeStart = 0, nudgeLast = 0;
// capture trên document — đếm MỌI tương tác, kể cả element stopPropagation
document.addEventListener('pointerdown', ()=>{
  const now = Date.now();
  if(!nudgeStart || now - nudgeLast > NUDGE_IDLE) nudgeStart = now; // nghỉ >5 phút → tính lại từ đầu
  nudgeLast = now;
  if(now - nudgeStart >= NUDGE_AFTER && !$('#nudge').classList.contains('show')){
    $('#nudge').classList.add('show');
    speak('Mình chơi lâu rồi, nghỉ mắt chút nhé!');
  }
}, true);
$('#nudge-ok').addEventListener('click', ()=>{
  $('#nudge').classList.remove('show');
  nudgeStart = nudgeLast = Date.now(); // đóng = reset đồng hồ 25 phút
});

/* ============ BANNER A2HS — thêm cuối js/core.js ============ */
(function(){
  // iPadOS 13+ mặc định giả UA Macintosh — nhận diện bằng maxTouchPoints
  const isIOS = /iPad|iPhone/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if(!isIOS || navigator.standalone || localStorage.getItem('bhv_a2hs')) return;
  const el = document.createElement('div');
  el.id = 'a2hs';
  el.innerHTML = '<span>📲 Thêm vào Màn hình chính để không mất sticker nhé!</span><button id="a2hs-x" title="Đóng">✖</button>';
  $('#scr-home').prepend(el);
  $('#a2hs-x').addEventListener('click', ()=>{ localStorage.setItem('bhv_a2hs','1'); el.remove(); });
})();
