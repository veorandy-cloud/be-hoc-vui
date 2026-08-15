"use strict";
/* ============ READING ============ */
// cặp đồng âm với giọng Bắc (HoaiMy/voice iPad): nghe không phân biệt được → không cho làm nhiễu của nhau
const AMBIG = [['s','x'],['d','r'],['i','y']];
// tiếng Việt không có tiếng nào dùng 'q' một mình — thẻ dạy ÂM hiển thị 'qu' (đọc quờ, ví dụ quả quýt)
const dispLetter = ch => ch==='q' ? 'qu' : ch;
function qLetter(){
  const t = rand(VN_LETTERS);
  const grp = AMBIG.find(g=>g.includes(t)) || [];
  const [d1, d2] = pick(VN_LETTERS.filter(x=>x!==t && !grp.includes(x)), 2);
  return {
    say:`Đâu là chữ ${LETTER_NAMES[t]}?`, html:'❓',
    choices:[{html:dispLetter(t),correct:true},{html:dispLetter(d1)},{html:dispLetter(d2)}]
  };
}
function qVan(){
  const [c,v] = rand(VAN_ITEMS);
  // chính tả lớp 1: trước e/ê/i phải dùng 'k', không dùng 'c' — không cho đáp án nhiễu 'ce/ci/cê'
  const pool = c==='c' ? VOWELS.filter(x=>!['e','ê','i'].includes(x)) : VOWELS;
  const others = pick(pool.filter(x=>x!==v), 2);
  return {
    say:`${LETTER_NAMES[c]} ghép với ${LETTER_NAMES[v]}, được tiếng gì?`,
    html:`${c} + ${v} = ?`,
    choices:[{html:c+v,correct:true},{html:c+others[0]},{html:c+others[1]}]
  };
}
function qTone(){
  const set = rand(TONE_SETS);
  const [t, d1, d2] = pick(set, 3);
  return {
    say:`Tìm tiếng: ${t}`, html:'👂',
    choices:[{html:t,correct:true},{html:d1},{html:d2}]
  };
}
function qWord(){
  const t = rand(WORD_ITEMS);
  // distractor không được trùng tiếng-bỏ-dấu với đáp án (quả DỨA vs quả DƯA hấu — bé chưa đọc thạo dấu)
  // tiếng gây nhầm có thể đứng GIỮA từ ('dưa' trong 'quả dưa hấu') → so tiếng-cuối mỗi bên với MỌI tiếng bên kia
  const syls = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').split(' ');
  const ts = syls(t.w), tl = ts[ts.length-1];
  const [d1, d2] = pick(WORD_ITEMS.filter(x => {
    if(x===t) return false;
    const xs = syls(x.w);
    return !xs.includes(tl) && !ts.includes(xs[xs.length-1]);
  }), 2);
  return {
    say:`Tìm từ: ${t.w}`, html:t.em,
    choices:[{html:t.w,correct:true,cls:'word'},{html:d1.w,cls:'word'},{html:d2.w,cls:'word'}]
  };
}
function qSentence(){
  const s = rand(SENTENCES);
  return {
    say:s.say, html:`<div class="sentence">${s.html.replace('___','<b style="color:var(--coral)">___</b>')}</div>`,
    choices:[{html:s.a,correct:true,cls:'word'},{html:s.d[0],cls:'word'},{html:s.d[1],cls:'word'}]
  };
}
/* ==== lộ trình tuần SGK: vần đóng/âm ghép mở dần theo tiến độ, tránh dội cả 32 vần vào bé ngày đầu ==== */
let learnWeek = safeParse('bhv_learn', {v:11, d:6}, isObj); // bắt đầu có sẵn 2 tuần đầu để chơi
function learnAdvance(kind, right, total){
  if(right < Math.ceil(total*0.7)) return; // đúng ≥70% lượt mới mở tuần kế
  const max = kind==='v' ? 17 : 9;
  if(learnWeek[kind] < max){ learnWeek[kind]++; localStorage.setItem('bhv_learn', JSON.stringify(learnWeek)); }
}
function qVan2(){
  const pool = VAN2.filter(x=>x.week<=learnWeek.v);
  const t = rand(pool);
  const wd = rand(t.words);
  // loại vần THẬT SỰ có trong từ đang hiển thị (bỏ dấu thanh, giữ ă/â/ô/ơ/ư): 'con lợn' hiện trên
  // màn hình thì 'on' không được làm distractor — tiếng 'con' chứa vần on, bé chọn sẽ bị chấm sai oan
  const bare = wd.w.normalize('NFD').replace(/[̣̀́̃̉]/g,'').normalize('NFC');
  const [d1, d2] = pick(VAN2.filter(x=>x!==t && !bare.includes(x.van)), 2);
  return {
    say:`Vần gì trong tiếng ${wd.tieng}?`,
    html:`<div style="font-size:52px">${wd.em}</div><div class="sentence">${wd.w}</div>`,
    choices:[{html:t.van,correct:true},{html:d1.van},{html:d2.van}]
  };
}
function qDigraph(){
  const pool = DIGRAPHS.filter(x=>x.week<=learnWeek.d);
  const t = rand(pool);
  const wd = rand(t.words);
  // loại âm ghép mở đầu BẤT KỲ tiếng nào của từ hiển thị ('khăn quàng' → loại cả 'qu'), bao luôn target
  const [d1, d2] = pick(DIGRAPHS.filter(x=>!wd.w.split(' ').some(s=>s.startsWith(x.d))), 2);
  return {
    say:`Tiếng ${wd.tieng} bắt đầu bằng chữ gì?`,
    html:`<div style="font-size:52px">${wd.em}</div><div class="sentence">${wd.w}</div>`,
    choices:[{html:t.d,correct:true},{html:d1.d},{html:d2.d}]
  };
}
const READ_BUILDERS = {
  letters: ()=>Array.from({length:8}, qLetter),
  van: ()=>shuffle([qVan(),qVan(),qVan(),qVan(),qTone(),qTone(),qTone(),qTone()]),
  van2: ()=>Array.from({length:6}, qVan2),
  digraph: ()=>Array.from({length:6}, qDigraph),
  words: ()=>Array.from({length:8}, qWord),
  sentences: ()=>pick(SENTENCES,6).map(s=>({
    say:s.say, html:`<div class="sentence">${s.html.replace('___','<b style="color:var(--coral)">___</b>')}</div>`,
    choices:[{html:s.a,correct:true,cls:'word'},{html:s.d[0],cls:'word'},{html:s.d[1],cls:'word'}]
  })),
  mix: ()=>shuffle([qLetter(),qVan(),qTone(),qVan2(),qDigraph(),qWord(),qSentence(),qSentence()])
};
function readShowMenu(){
  $('#read-menu').style.display='grid';
  $('#read-quiz').style.display='none';
}
$$('#read-menu .menu-card').forEach(c=>c.addEventListener('click', ()=>{
  startReadRound(c.dataset.level);
}));
function startReadRound(level){
  if(level==='repeat') return startRepeat();
  if(level==='ghep') return startGhep();
  $('#read-menu').style.display='none';
  $('#read-quiz').style.display='flex';
  runQuiz({
    promptEl:$('#read-prompt'), speakBtn:$('#read-speak'),
    choicesEl:$('#read-choices'), progressEl:$('#read-progress'),
    questions: READ_BUILDERS[level](),
    onDone(right,total){
      // lộ trình: làm tốt lượt vần cuối / chữ ghép thì mở tuần học kế tiếp
      if(level==='van2') learnAdvance('v', right, total);
      if(level==='digraph') learnAdvance('d', right, total);
      ovCallback = readShowMenu;
      showResult(quizStars(right,total), `Đúng ${right}/${total} câu!`);
    }
  });
}

/* ==== Đọc theo: cô đọc mẫu chữ/từ/câu, bé đọc theo — có mic thì chấm điểm, thưởng sao ==== */
// stripDeco phải khớp 100% với biểu thức trong scripts/list-phrases.cjs (id audio hash theo từng ký tự)
const stripDeco = s => s.replace(/[^\p{L}\p{N}\s,!?.]/gu,'').replace(/\s+/g,' ').trim();
function listenVi(matches, btn, cb){
  if(recBusy) return;
  try{
    recBusy=true;
    const gen=uiGen; // kết quả mic về sau khi đã rời màn → bỏ
    const r=new SRCls();
    r.lang='vi-VN'; r.interimResults=false; r.maxAlternatives=3;
    btn.style.outline='5px solid var(--coral)';
    const cleanup=()=>{ btn.style.outline=''; recBusy=false; };
    let got=false;
    r.onresult=e=>{
      if(gen!==uiGen){ got=true; return; }
      got=true;
      const said=[...e.results[0]].map(a=>a.transcript.toLowerCase()).join(' ');
      const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
      // chữ cái đơn phải là TOKEN riêng ('a' không được ăn theo tiếng 'ba' trong transcript)
      const toks = said.split(/\s+/).concat(norm(said).split(/\s+/));
      const ok = matches.some(m=>{
        const mm=m.toLowerCase();
        return mm.length<=1 ? toks.includes(mm)
                            : said.includes(mm) || norm(said).includes(norm(mm));
      });
      if(ok){ sndGood(); confetti(); if(micStar()) addStars(1); speak(rand(PRAISE)); }
      else { sndBad(); speak(rand(CHEER)); }
      cb(ok);
    };
    let erred=false;
    r.onend=()=>{
      cleanup();
      if(!got && !erred){ speak('Cô chưa nghe thấy, bé nói to hơn nhé!'); cb(null); }
    };
    r.onerror=e=>{ erred=true; cleanup(); micErrorFeedback(e); };
    r.start();
    setTimeout(()=>{ try{r.stop();}catch(e){} }, 5000);
  }catch(e){ recBusy=false; }
}
/* mic lỗi không được câm lặng — bé không đọc được console */
function micErrorFeedback(e){
  const err = e && e.error;
  if(err==='not-allowed' || err==='service-not-allowed'){
    speak('Máy chưa cho phép micro, bé nhờ bố mẹ giúp nhé!');
  }else if(err==='network'){
    speak('Cần có mạng để cô nghe bé đọc nhé!');
  }else if(err!=='aborted' && err!=='no-speech'){
    speak('Cô chưa nghe thấy, bé nói to hơn nhé!');
  }
}
function startRepeat(){
  const gen = ++uiGen;
  roundActive=true;
  $('#read-menu').style.display='none';
  $('#read-quiz').style.display='flex';
  const letters = pick(VN_LETTERS, 3).map(ch=>({
    html:`<div style="font-size:52px">${EXAMPLES[ch].em}</div><div>${dispLetter(ch)}</div>`,
    say:'Chữ '+LETTER_NAMES[ch],
    match: ch==='y' ? [LETTER_NAMES[ch], ch, 'i']        // y đọc /i/ — bé nói 'i' vẫn đúng
         : ch==='q' ? [LETTER_NAMES[ch], 'qu']           // thẻ hiện 'qu' — bé nói 'quờ'/'qu'
         : [LETTER_NAMES[ch], ch]
  }));
  const words = pick(VN_LETTERS, 3).map(ch=>({
    html:`<div style="font-size:52px">${EXAMPLES[ch].em}</div><div class="sentence">${EXAMPLES[ch].w}</div>`,
    say:EXAMPLES[ch].w, match:[EXAMPLES[ch].w]
  }));
  const sents = pick(SENTENCES, 2).map(s=>{
    const txt = stripDeco(s.html.replace('___', s.a));
    return {
      html:`<div class="sentence">${s.html.replace('___', `<b style="color:var(--coral)">${s.a}</b>`)}</div>`,
      say:txt, match:[txt, s.a]
    };
  });
  const items = shuffle([...letters, ...words, ...sents]);
  let i=0, got=0, tried=0;
  const progress = ()=>{ $('#read-progress').textContent = `Câu ${i+1} / ${items.length}   ${'🟢'.repeat(got)}`; };
  function render(){
    const it = items[i];
    progress();
    $('#read-prompt').innerHTML = it.html;
    $('#read-speak').onclick = ()=>speak(it.say);
    const ch=$('#read-choices'); ch.innerHTML='';
    const mk=(label, fn)=>{
      const b=document.createElement('button');
      b.className='choice word ctrl'; b.textContent=label; b.onclick=fn; // ctrl: nút điều khiển, không phải thẻ đáp án
      ch.appendChild(b); return b;
    };
    mk('🔊 Nghe lại', ()=>speak(it.say));
    if(SRCls) mk('🎤 Bé đọc', function(){
      listenVi(it.match, this, ok=>{ if(ok===null) return; tried++; if(ok) got++; progress(); });
    });
    mk('Câu tiếp ▶', ()=>{ i++; if(i<items.length) render(); else done(); });
    setTimeout(()=>{ if(gen===uiGen) speak(it.say); }, 300);
  }
  function done(){
    ovCallback = readShowMenu;
    // sao đã cộng từng câu (+1/câu qua micStar) — kết lượt chỉ thưởng hoàn thành 1⭐, hết thưởng đúp
    if(SRCls && tried) showResult(Math.min(1, quizStars(got, tried)), `Bé đọc đúng ${got}/${tried} lần!`);
    else showResult(1, 'Bé luyện đọc chăm chỉ lắm!');
  }
  render();
}

/* ==== Ghép vần: nghe tiếng, chọn thẻ chữ cái + thẻ vần-dấu để ghép ==== */
function startGhep(){
  const gen = ++uiGen;
  roundActive=true;
  $('#read-menu').style.display='none';
  $('#read-quiz').style.display='flex';
  const CONS = [...new Set(TONE_SETS.map(s=>s[0][0]))];
  const total = 6;
  let i=0, right=0, firstTry=true;
  function round(){
    firstTry=true;
    let locked=false; // trẻ double-tap: không khoá là right++ đúp + nhảy cóc câu (2 setTimeout cùng gen)
    const set = rand(TONE_SETS);
    const target = rand(set);
    const c = target[0], v = target.slice(1);
    let selC=null;
    $('#read-progress').textContent = `Câu ${i+1} / ${total}   ${'🟢'.repeat(right)}`;
    $('#read-prompt').innerHTML = `<span id="ghep-out">❓ + ❓</span>`;
    $('#read-speak').onclick = ()=>speak('Tìm tiếng: '+target);
    const ch=$('#read-choices'); ch.innerHTML='';
    const row1=document.createElement('div'), row2=document.createElement('div');
    [row1,row2].forEach(r=>{ r.className='choices'; r.style.width='100%'; ch.appendChild(r); });
    shuffle([c, ...pick(CONS.filter(x=>x!==c), 2)]).forEach(cc=>{
      const b=document.createElement('button');
      b.className='choice'; b.textContent=cc;
      b.onclick=()=>{
        if(locked) return;
        selC=cc;
        [...row1.children].forEach(x=>x.classList.remove('good'));
        b.classList.add('good'); sndPop();
        $('#ghep-out').textContent = `${cc} + ❓`;
        speak('Chữ '+LETTER_NAMES[cc]);
      };
      row1.appendChild(b);
    });
    let wrongs=0;
    shuffle([v, ...pick(set.filter(x=>x!==target), 2).map(t=>t.slice(1))]).forEach(vv=>{
      const b=document.createElement('button');
      b.className='choice'; b.textContent=vv;
      if(vv===v) b.dataset.right='1';
      b.onclick=()=>{
        if(locked) return;
        if(!selC){ b.classList.add('bad'); sndBad(); setTimeout(()=>b.classList.remove('bad'),500); return; }
        if(selC===c && vv===v){
          locked=true; b.classList.remove('hint');
          if(firstTry) right++;
          $('#ghep-out').textContent = `${c} + ${vv} = ${target}`;
          b.classList.add('good'); sndGood();
          // ghép xong không dừng ở tìm chữ: cô đọc ĐÁNH VẦN chuẩn SGK rồi bé đánh vần lại
          setTimeout(()=>{ if(gen===uiGen) spellStep(target); }, 700);
        }else{
          firstTry=false;
          wrongs++;
          if(wrongs>=2){ const rb=row2.querySelector('[data-right]'); if(rb) rb.classList.add('hint'); }
          b.classList.add('bad'); sndBad();
          setTimeout(()=>b.classList.remove('bad'),500);
        }
      };
      row2.appendChild(b);
    });
    setTimeout(()=>{ if(gen===uiGen) speak('Tìm tiếng: '+target); }, 300);
  }
  /* bước đánh vần sau khi ghép đúng: cô đọc 'bờ, a, ba, huyền, bà', bé nghe lại / 🎤 đánh vần theo */
  function spellStep(target){
    const say = spellTieng(target);
    $('#read-prompt').innerHTML =
      `<div style="font-size:46px;font-weight:800">${target}</div>` +
      `<div class="sentence">🗣️ ${say.split(', ').join(' – ')}</div>`;
    $('#read-speak').onclick = ()=>speak(say);
    const ch=$('#read-choices'); ch.innerHTML='';
    const mk=(label, fn)=>{
      const b=document.createElement('button');
      b.className='choice word ctrl'; b.textContent=label; b.onclick=fn;
      ch.appendChild(b); return b;
    };
    mk('🔊 Nghe đánh vần', ()=>speak(say));
    if(SRCls) mk('🎤 Bé đánh vần', function(){ listenVi([target], this, ()=>{}); });
    mk('Câu tiếp ▶', ()=>{ i++; if(i<total) round(); else done(); });
    speak(say);
  }
  function done(){
    ovCallback = readShowMenu;
    showResult(quizStars(right, total), `Đúng ${right}/${total} câu!`);
  }
  round();
}
