"use strict";
/* ============ ENGLISH ============ */
let enReady=false, enTheme=Object.keys(EN_THEMES)[0];
/* ảnh THẬT cho từ vựng (Wikipedia, tải sẵn bằng scripts/gen_images.cjs) — không có ảnh thì fallback emoji */
let IMG_MAN=null;
fetch('assets/images/manifest.json').then(r=>r.json()).then(j=>{ IMG_MAN=j; window.IMG_MAN=j; }).catch(()=>{});
function phFor(it, cls){
  const f = IMG_MAN && IMG_MAN[it.w];
  return f ? `<img class="${cls}" src="assets/images/en/${f}" loading="lazy" alt="${it.w}"
                   onerror="this.outerHTML='<div class=&quot;em&quot;>${it.em}</div>'">`
           : `<div class="em">${it.em}</div>`;
}
function initEnglish(){
  if(!enReady){
    const chips=$('#en-chips');
    Object.keys(EN_THEMES).forEach((th,i)=>{
      const b=document.createElement('button');
      b.className='btn chip'+(i===0?' on':''); b.textContent=th;
      b.onclick=()=>{ enTheme=th;
        // chip luôn hiện kể cả giữa quiz/trạm quest: bấm = kết thúc lượt dở — huỷ timer câu hỏi cũ,
        // bỏ xác nhận 🏠 oan, và QUAN TRỌNG: rời trạm (không thì bé qua trạm nghe bằng game lật hình chắc-thắng)
        uiGen++; roundActive=false; questActive=null;
        $$('#en-chips .chip').forEach(x=>x.classList.remove('on')); b.classList.add('on');
        renderFlash(); showEnLearn(); };
      chips.appendChild(b);
    });
    $('#en-g1').onclick = ()=>startEnQuiz('listen');
    $('#en-g2').onclick = ()=>startEnQuiz('read');
    $('#en-g3').onclick = startMemory;
    $('#en-g4').onclick = startEnSentences;
    $('#en-g5').onclick = startEnPhonicsMenu;
    $('#en-g6').onclick = startEnSpell;
    $('#en-phx-play').onclick = startEnPhonicsQuiz;
    $('#en-weak').onclick = startEnWeak;
    if(SRCls){
      const mb=$('#en-mic');
      mb.style.display='';
      mb.onclick=()=>{
        micMode=!micMode;
        mb.textContent = micMode?'🎤 Nói theo: BẬT':'🎤 Nói theo: TẮT';
        mb.classList.toggle('primary', micMode);
        if(micMode) speak('Chạm vào thẻ, nghe từ, rồi bé nói theo nhé!');
      };
    }
    enReady=true;
  }
  renderFlash(); showEnLearn();
}
function showEnLearn(){
  $('#en-learn').style.display='flex';
  $('#en-quiz').style.display='none';
  $('#en-memory').style.display='none';
  $('#en-phx').style.display='none';
}
function renderFlash(){
  const grid=$('#en-cards'); grid.innerHTML='';
  EN_THEMES[enTheme].forEach(it=>{
    const c=document.createElement('div');
    c.className='flash';
    c.innerHTML=`${phFor(it,'ph')}<div class="wd">${it.w}</div><div class="vi">${it.vi}</div>`;
    c.onclick=()=>{
      c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
      const gen=uiGen, tap=++flashTap;
      // mic chỉ bật SAU khi cô đọc xong từ — bật lúc 900ms cố định thì mic thu chính giọng app (loa ngoài tự "nói đúng" ăn sao)
      // tap token: chạm nhanh thẻ A→B thì promise thẻ A (bị cắt) không được mở mic nghe từ CŨ chặn lượt thẻ mới
      speakAsync(it.w,'en-US').then(()=>{
        if(micMode && SRCls) setTimeout(()=>{ if(gen===uiGen && tap===flashTap) listenFor(it.w, c); }, 150);
      });
    };
    grid.appendChild(c);
  });
}
/* 🎤 bé nói theo — Web Speech Recognition (chỉ hiện khi trình duyệt hỗ trợ) */
const SRCls = window.SpeechRecognition || window.webkitSpeechRecognition;
let micMode=false, recBusy=false, flashTap=0;
function listenFor(word, card){
  if(recBusy) return;
  try{
    recBusy=true;
    const gen=uiGen; // kết quả về sau khi đã rời màn → bỏ, không cộng sao/đọc khen đè màn mới
    const r=new SRCls();
    r.lang='en-US'; r.interimResults=false; r.maxAlternatives=3;
    card.style.outline='5px solid var(--coral)';
    const cleanup=()=>{ card.style.outline=''; recBusy=false; };
    r.onresult=e=>{
      if(gen!==uiGen) return;
      const alts=[...e.results[0]].map(a=>a.transcript.toLowerCase());
      const said=alts.join(' ');
      // alias: cách gọi phổ biến của trẻ vẫn tính đúng (match từng alternative riêng để không ghép giả 2 alt)
      const ALIAS={'table tennis':['ping pong'],'football':['soccer'],'plane':['airplane']};
      const names=[word.toLowerCase(), ...(ALIAS[word.toLowerCase()]||[])];
      // so theo RANH GIỚI TỪ, không substring trần: bé nói 'bear' không được tính đúng cho thẻ 'ear'
      const tokWords = s => ' ' + s.replace(/[^a-z0-9]+/g,' ').trim() + ' ';
      if(names.some(n=>alts.some(a=>tokWords(a).includes(tokWords(n))))){
        sndWin(); confetti(); if(micStar()) addStars(1);
        speak('Great job!','en-US');
      }else{
        speak('Almost! Try again!','en-US');
      }
    };
    r.onend=cleanup;
    r.onerror=e=>{ cleanup(); micErrorFeedback(e); };
    r.start();
    setTimeout(()=>{ try{r.stop();}catch(e){} }, 4000);
  }catch(e){ recBusy=false; }
}
/* E1: từ sai (listen/read) — max 20, unique, newest first */
function saveWeak(w){
  const arr = safeParse('bhv_en_weak', [], Array.isArray);
  if(!arr.includes(w)) arr.unshift(w);
  localStorage.setItem('bhv_en_weak', JSON.stringify(arr.slice(0,20)));
}
function findEn(w){
  for(const items of Object.values(EN_THEMES)){
    const it = items.find(x=>x.w===w);
    if(it) return {it, items};
  }
  return null;
}
function enDistractors(it, themeItems){
  const same = themeItems.filter(x=>x!==it && x.w!==it.w);
  if(same.length>=2) return pick(same, 2);
  const seen = new Set([it.w]);
  const pool = [];
  for(const x of shuffle(Object.values(EN_THEMES).flat())){
    if(seen.has(x.w)) continue;
    seen.add(x.w); pool.push(x);
    if(pool.length>=2) break;
  }
  return pool.length>=2 ? pool : null;
}
function enPhotoQ(t, others, say){
  return {
    say:say||t.w, lang:'en-US', html:'👂', word:t.w,
    // chạm ảnh nào cô đọc từ đó — chạm sai cũng học được 1 từ
    choices:[t, ...others].map((x,i)=>({html:phFor(x,'chp'), correct:i===0, say:x.w}))
  };
}
function enRunQuiz(questions, title, intro, introKey){
  if(!questions.length) return;
  $('#en-learn').style.display='none';
  $('#en-phx').style.display='none';
  $('#en-quiz').style.display='flex';
  runQuiz({
    promptEl:$('#en-prompt'), speakBtn:$('#en-speak'),
    choicesEl:$('#en-choices'), progressEl:$('#en-progress'),
    title, intro, introKey,
    questions,
    onMiss(q){ if(q.word) saveWeak(q.word); },
    onDone(right,total){
      if(questActive!==null){
        const pass = right>=Math.ceil(total/2);
        ovCallback = pass ? questComplete : questRetry;
        showResult(quizStars(right,total), pass?`Đúng ${right}/${total} — qua trạm!`:`Đúng ${right}/${total} — thử lại nhé!`);
        return;
      }
      ovCallback = showEnLearn;
      showResult(quizStars(right,total), `Đúng ${right}/${total} câu!`);
    }
  });
}
function startEnQuiz(kind){
  const pool = EN_THEMES[enTheme];
  const n = Math.min(6, pool.length);
  const questions = pick(pool, n).map(t=>{
    const others = pick(pool.filter(x=>x!==t), 2);
    if(kind==='listen') return enPhotoQ(t, others);
    return {
      say:`Từ nào là ${t.vi}?`, html:phFor(t,'php'), word:t.w,
      choices:[t, ...others].map((x,i)=>({html:x.w, correct:i===0, cls:'word', lang:'en-US'})) // chạm từ nào đọc từ đó (giọng Anh)
    };
  });
  enRunQuiz(questions,
    kind==='listen' ? 'Nghe chọn hình' : 'Chọn từ đúng',
    kind==='listen' ? 'Bé nghe từ, rồi chạm vào hình đúng nhé!' : 'Bé nghe tiếng Việt, rồi chạm vào từ tiếng Anh đúng nhé!',
    'en-'+kind);
}
function startEnWeak(){
  const words = safeParse('bhv_en_weak', [], Array.isArray).filter(w=>typeof w==='string');
  if(!words.length){ speak('Bé cố lên nhé!'); return; }
  const questions = [];
  for(const w of words){
    const found = findEn(w);
    if(!found) continue;
    const others = enDistractors(found.it, found.items);
    if(!others) continue;
    questions.push(enPhotoQ(found.it, others));
  }
  if(!questions.length){ speak('Bé cố lên nhé!'); return; }
  enRunQuiz(questions, 'Ôn từ yếu');
}
/* EN_STARTERS (data.js): say strings MUST match audio bank 100% */
function startEnSentences(){
  const bank = [];
  for(const s of EN_STARTERS){
    const found = findEn(s.w);
    if(!found) continue;
    const others = enDistractors(found.it, found.items);
    if(!others) continue;
    bank.push(enPhotoQ(found.it, others, s.say));
  }
  enRunQuiz(pick(bank, Math.min(6, bank.length)), 'Nghe câu', 'Bé nghe câu, rồi chạm vào hình đúng nhé!', 'en-sent');
}
/* E3 phonics: 26 letters, words from EN_THEMES by first-token initial */
let enPhonicsLetter='a', enPhonicsBuilt=false;
function enPhonicsInit(w){
  return String(w).toLowerCase().split(/[\s-]/)[0][0];
}
function enPhonicsWords(letter){
  const L = String(letter||'').toLowerCase().slice(0,1);
  const seen = new Set();
  const out = [];
  for(const items of Object.values(EN_THEMES)){
    for(const it of items){
      if(enPhonicsInit(it.w)!==L) continue;
      if(seen.has(it.w)) continue;
      seen.add(it.w);
      out.push(it);
      if(out.length>=8) break;
    }
    if(out.length>=8) break;
  }
  for(const it of (EN_PHONICS_EXTRA[L]||[])){
    if(seen.has(it.w)) continue;
    seen.add(it.w);
    out.push(it);
  }
  if(L==='x'){
    const found = findEn('box');
    if(found && !seen.has(found.it.w)) out.push(found.it);
  }
  return out;
}
function startEnPhonicsMenu(){
  const gen = ++uiGen;
  $('#en-learn').style.display='none';
  $('#en-quiz').style.display='none';
  $('#en-memory').style.display='none';
  $('#en-phx').style.display='flex';
  speakAsync('Âm chữ cái tiếng Anh').then(()=>{ if(gen===uiGen) introOnce('phonics', 'Bé chạm chữ cái để xem từ bắt đầu bằng chữ đó nhé!'); });
  if(!enPhonicsBuilt){
    const host=$('#en-phx-letters');
    host.innerHTML='';
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch=>{
      const b=document.createElement('button');
      b.className='btn';
      b.dataset.letter=ch;
      b.textContent=ch.toUpperCase();
      b.onclick=()=>{
        enPhonicsLetter=ch;
        $$('#en-phx-letters [data-letter]').forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
        speak(ch.toUpperCase(),'en-US');
        const wrap=$('#en-phx-words'); wrap.innerHTML='';
        enPhonicsWords(ch).slice(0,8).forEach(it=>{
          const d=document.createElement('span');
          d.className='phx-item';
          d.innerHTML=`${phFor(it,'phx-ph')}<span>${it.w}</span>`;
          wrap.appendChild(d);
        });
      };
      host.appendChild(b);
    });
    enPhonicsBuilt=true;
  }
}
function startEnPhonicsQuiz(){
  const letter = enPhonicsLetter || 'a';
  const pool = enPhonicsWords(letter);
  const n = Math.max(1, Math.min(6, pool.length));
  if(!pool.length) return;
  const all = Object.values(EN_THEMES).flat().concat(Object.values(EN_PHONICS_EXTRA).flat());
  const questions = pick(pool, n).map(t=>{
    const others = [];
    const seen = new Set([t.w]);
    for(const x of shuffle(all)){
      if(seen.has(x.w)) continue;
      if(letter!=='x' && enPhonicsInit(x.w)===letter) continue;
      seen.add(x.w);
      others.push(x);
      if(others.length>=2) break;
    }
    if(others.length<2) return null;
    return enPhotoQ(t, others);
  }).filter(Boolean);
  enRunQuiz(questions, 'Nghe chọn hình');
}
/* E4 đánh vần: từ 3 chữ (Starters spelling) — nghe từ + xem ảnh, chạm thẻ chữ theo đúng thứ tự.
   Dùng lại khung #en-quiz (prompt/choices) như Ghép vần dùng #read-quiz; chữ cái A–Z đã có audio (phonics) */
function enSpellWords(){
  const seen = new Set();
  return Object.values(EN_THEMES).flat().filter(it=>/^[a-z]{3}$/.test(it.w) && !seen.has(it.w) && seen.add(it.w));
}
function startEnSpell(){
  const gen = ++uiGen;
  roundActive=true;
  $('#en-learn').style.display='none';
  $('#en-phx').style.display='none';
  $('#en-memory').style.display='none';
  $('#en-quiz').style.display='flex';
  const items = pick(enSpellWords(), 5);
  let i=0, right=0;
  let firstP = speakAsync('Đánh vần').then(()=>introOnce('spell', 'Bé ghép chữ cái thành từ nhé!'));
  function round(){
    const it = items[i];
    const letters = it.w.split('');
    let pos=0, firstTry=true, locked=false;
    $('#en-progress').textContent = `Câu ${i+1} / ${items.length}   ${'🟢'.repeat(right)}`;
    $('#en-prompt').innerHTML = phFor(it,'php') +
      `<div class="spell-slots">${letters.map(()=>`<span class="spell-slot">_</span>`).join('')}</div>`;
    $('#en-speak').onclick = ()=>speak(it.w,'en-US');
    const slots = $$('#en-prompt .spell-slot');
    // 2 thẻ nhiễu: chữ cái không có trong từ (từ có chữ lặp như 'egg' vẫn đủ thẻ: 3 thẻ đúng + 2 nhiễu)
    const extra = pick('abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>!letters.includes(c)), 2);
    const ch=$('#en-choices'); ch.innerHTML='';
    shuffle([...letters, ...extra]).forEach(L=>{
      const b=document.createElement('button');
      b.className='choice spell-tile'; b.textContent=L;
      b.onclick=()=>{
        if(locked || b.classList.contains('used')) return;
        speak(L.toUpperCase(),'en-US');
        if(L===letters[pos]){
          b.classList.add('used'); slots[pos].textContent=L; slots[pos].classList.add('on'); sndPop();
          pos++;
          if(pos===letters.length){
            locked=true; if(firstTry) right++;
            sndGood(); setTimeout(()=>{ if(gen===uiGen) speak(it.w,'en-US'); }, 350);
            setTimeout(()=>{ if(gen!==uiGen) return; i++; if(i<items.length) round(); else done(); }, 1600);
          }
        }else{
          firstTry=false; saveWeak(it.w);
          b.classList.add('bad'); sndBad(); setTimeout(()=>b.classList.remove('bad'),500);
        }
      };
      ch.appendChild(b);
    });
    const p=firstP; firstP=Promise.resolve(); // từ đầu chờ tên bài + lời dẫn nói xong
    p.then(()=>setTimeout(()=>{ if(gen===uiGen) speak(it.w,'en-US'); }, 300));
  }
  function done(){
    if(questActive!==null){
      const pass = right>=Math.ceil(items.length/2);
      ovCallback = pass ? questComplete : questRetry;
      showResult(quizStars(right,items.length), pass?`Đúng ${right}/${items.length} — qua trạm!`:`Đúng ${right}/${items.length} — thử lại nhé!`);
      return;
    }
    ovCallback = showEnLearn;
    showResult(quizStars(right, items.length), `Đúng ${right}/${items.length} từ!`);
  }
  round();
}
/* memory match: emoji <-> word pairs */
function startMemory(){
  const gen = ++uiGen;
  roundActive=true;
  $('#en-learn').style.display='none';
  $('#en-phx').style.display='none';
  $('#en-memory').style.display='flex';
  const items = pick(EN_THEMES[enTheme], 4);
  const cards = shuffle(items.flatMap(it=>[
    {item:it, kind:'em', label:it.em},
    {item:it, kind:'w', label:it.w}
  ]));
  const grid=$('#mem-grid'); grid.innerHTML='';
  let first=null, lock=false, matched=0, mistakes=0;
  $('#mem-progress').textContent = 'Lật hình tìm cặp giống nhau!';
  speakAsync('Lật hình').then(()=>{ if(gen===uiGen) speak('Bé hãy lật hình để tìm cặp giống nhau nhé!'); });
  cards.forEach(cd=>{
    const b=document.createElement('button');
    b.className='mem-card'; b.textContent='❓';
    b.onclick=()=>{
      if(lock || b.classList.contains('flip') || b.classList.contains('done')) return;
      b.classList.add('flip');
      if(cd.kind==='w') b.classList.add('wordcard');
      b.textContent=cd.label;
      sndPop();
      if(cd.kind==='w') speak(cd.item.w,'en-US');
      if(!first){ first={cd,b}; return; }
      if(first.cd.item===cd.item && first.cd.kind!==cd.kind){
        first.b.classList.add('done'); b.classList.add('done');
        first=null; matched++; sndGood();
        if(matched===4){
          const earned = mistakes<=1?3 : mistakes<=3?2 : 1;
          ovCallback = questActive!==null ? questComplete : showEnLearn;
          setTimeout(()=>{ if(gen===uiGen) showResult(earned, 'Tìm hết các cặp rồi!'); }, 500);
        }
      }else{
        mistakes++; lock=true; sndBad();
        const fb=first.b, fcd=first.cd; first=null;
        setTimeout(()=>{
          if(gen!==uiGen) return;
          [ [fb,fcd], [b,cd] ].forEach(([el])=>{
            el.classList.remove('flip','wordcard'); el.textContent='❓';
          });
          lock=false;
        }, 900);
      }
    };
    grid.appendChild(b);
  });
}
