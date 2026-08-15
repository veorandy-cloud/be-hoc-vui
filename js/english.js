"use strict";
/* ============ ENGLISH ============ */
let enReady=false, enTheme=Object.keys(EN_THEMES)[0];
/* ảnh THẬT cho từ vựng (Wikipedia, tải sẵn bằng scripts/gen_images.cjs) — không có ảnh thì fallback emoji */
let IMG_MAN=null;
fetch('assets/images/manifest.json').then(r=>r.json()).then(j=>{ IMG_MAN=j; }).catch(()=>{});
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
        $$('#en-chips .chip').forEach(x=>x.classList.remove('on')); b.classList.add('on');
        renderFlash(); showEnLearn(); };
      chips.appendChild(b);
    });
    $('#en-g1').onclick = ()=>startEnQuiz('listen');
    $('#en-g2').onclick = ()=>startEnQuiz('read');
    $('#en-g3').onclick = startMemory;
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
}
function renderFlash(){
  const grid=$('#en-cards'); grid.innerHTML='';
  EN_THEMES[enTheme].forEach(it=>{
    const c=document.createElement('div');
    c.className='flash';
    c.innerHTML=`${phFor(it,'ph')}<div class="wd">${it.w}</div><div class="vi">${it.vi}</div>`;
    c.onclick=()=>{
      c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
      const gen=uiGen;
      // mic chỉ bật SAU khi cô đọc xong từ — bật lúc 900ms cố định thì mic thu chính giọng app (loa ngoài tự "nói đúng" ăn sao)
      speakAsync(it.w,'en-US').then(()=>{
        if(micMode && SRCls) setTimeout(()=>{ if(gen===uiGen) listenFor(it.w, c); }, 150);
      });
    };
    grid.appendChild(c);
  });
}
/* 🎤 bé nói theo — Web Speech Recognition (chỉ hiện khi trình duyệt hỗ trợ) */
const SRCls = window.SpeechRecognition || window.webkitSpeechRecognition;
let micMode=false, recBusy=false;
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
      if(names.some(n=>alts.some(a=>a.includes(n)))){
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
function startEnQuiz(kind){
  $('#en-learn').style.display='none';
  $('#en-quiz').style.display='flex';
  const pool = EN_THEMES[enTheme];
  const n = Math.min(6, pool.length);
  const questions = pick(pool, n).map(t=>{
    const others = pick(pool.filter(x=>x!==t), 2);
    if(kind==='listen') return {
      say:t.w, lang:'en-US', html:'👂',
      choices:[{html:phFor(t,'chp'),correct:true},{html:phFor(others[0],'chp')},{html:phFor(others[1],'chp')}]
    };
    return {
      say:`Từ nào là ${t.vi}?`, html:phFor(t,'php'),
      choices:[{html:t.w,correct:true,cls:'word'},{html:others[0].w,cls:'word'},{html:others[1].w,cls:'word'}]
    };
  });
  runQuiz({
    promptEl:$('#en-prompt'), speakBtn:$('#en-speak'),
    choicesEl:$('#en-choices'), progressEl:$('#en-progress'),
    questions,
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
/* memory match: emoji <-> word pairs */
function startMemory(){
  const gen = ++uiGen;
  roundActive=true;
  $('#en-learn').style.display='none';
  $('#en-memory').style.display='flex';
  const items = pick(EN_THEMES[enTheme], 4);
  const cards = shuffle(items.flatMap(it=>[
    {item:it, kind:'em', label:it.em},
    {item:it, kind:'w', label:it.w}
  ]));
  const grid=$('#mem-grid'); grid.innerHTML='';
  let first=null, lock=false, matched=0, mistakes=0;
  $('#mem-progress').textContent = 'Lật hình tìm cặp giống nhau!';
  speak('Bé hãy lật hình để tìm cặp giống nhau nhé!');
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
