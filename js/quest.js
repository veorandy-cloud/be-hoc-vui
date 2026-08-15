"use strict";
/* ============ QUEST (Thám hiểm) ============ */
const QUEST_LANDS = [
  {nm:'🌳 Rừng Xanh', color:'#65A30D', stations:[
    {em:'📖', t:'quiz', q:()=>Array.from({length:5}, qLetter)},
    {em:'✏️', t:'write', ch:'a'},
    {em:'🐣', t:'en', theme:'🐾 Animals', kind:'listen'},
    {em:'🎵', t:'quiz', q:()=>shuffle([qVan(),qVan(),qVan(),qTone(),qTone()])},
    {em:'👑', t:'quiz', boss:true, q:()=>shuffle([qLetter(),qVan(),qTone(),qWord(),qSentence(),qLetter()])}
  ]},
  {nm:'🌊 Biển Cả', color:'#0284C7', stations:[
    {em:'🖼️', t:'quiz', q:()=>Array.from({length:5}, qWord)},
    {em:'✏️', t:'write', ch:'m'},
    {em:'🐣', t:'en', theme:'🌈 Colors', kind:'read'},
    {em:'🧠', t:'memory', theme:'🍔 Food'},
    {em:'👑', t:'quiz', boss:true, q:()=>shuffle([qWord(),qWord(),qVan(),qTone(),qSentence(),qLetter()])}
  ]},
  {nm:'🚀 Vũ Trụ', color:'var(--violet)', stations:[
    {em:'📝', t:'quiz', q:()=>READ_BUILDERS.sentences().slice(0,5)},
    {em:'✏️', t:'write', ch:'5', set:'num'},
    {em:'🐣', t:'en', theme:'🔢 Numbers', kind:'listen'},
    {em:'🧠', t:'memory', theme:'☀️ Weather'},
    {em:'👑', t:'quiz', boss:true, q:()=>READ_BUILDERS.mix()}
  ]},
  {nm:'🏝️ Đảo Kho Báu', color:'#B45309', stations:[
    {em:'🔤', t:'quiz', q:()=>shuffle([qLetter(),qVan(),qVan(),qTone(),qTone()])},
    {em:'✏️', t:'write', ch:'g'},
    {em:'🐣', t:'en', theme:'⚽ Sports', kind:'listen'},
    {em:'🧠', t:'memory', theme:'🌿 Nature'},
    {em:'👑', t:'quiz', boss:true, q:()=>shuffle([qWord(),qSentence(),qVan(),qTone(),qLetter(),qWord()])}
  ]}
];
const STATIONS = QUEST_LANDS.flatMap(l=>l.stations);
let questDone = Number(localStorage.getItem('bhv_quest'))||0;
let questActive = null; // index trạm đang chơi, null = không trong quest
const OFFSETS = ['6%','30%','55%','30%','6%'];
function updateQuestUI(){ $('#quest-count').textContent = `(${questDone}/${STATIONS.length})`; }
updateQuestUI();
function questShowMap(){
  $('#quest-play').style.display='none';
  $('#quest-map').style.display='flex';
  renderQuestMap();
}
function renderQuestMap(){
  const map=$('#quest-map'); map.innerHTML='';
  let gi=0;
  QUEST_LANDS.forEach(land=>{
    const h=document.createElement('div');
    h.className='land-hdr'; h.style.background=land.color; h.textContent=land.nm;
    map.appendChild(h);
    land.stations.forEach((s,si)=>{
      const idx=gi++;
      const row=document.createElement('div');
      row.className='station-row';
      row.style.paddingLeft=OFFSETS[si%OFFSETS.length];
      const b=document.createElement('button');
      const st = idx<questDone?'done' : idx===questDone?'cur' : 'lock';
      b.className='station '+st;
      b.textContent = st==='lock' ? '🔒' : s.em;
      b.onclick=()=>{
        if(idx>questDone){ sndBad(); speak('Bé hãy hoàn thành trạm phía trước đã nhé!'); return; }
        launchStation(idx);
      };
      row.appendChild(b);
      map.appendChild(row);
    });
  });
  const t=document.createElement('div');
  t.id='quest-trophy';
  t.textContent = questDone>=STATIONS.length ? '🏆 Bé đã thám hiểm hết mọi vùng đất! Siêu quá!' : '🏁 Đích đến đang chờ bé!';
  map.appendChild(t);
}
function questComplete(){
  if(questActive===questDone){
    const s=STATIONS[questDone];
    questDone++; localStorage.setItem('bhv_quest', questDone);
    updateQuestUI();
    addStars(s.boss?4:2); // thưởng thêm khi qua trạm, trùm x2
  }
  questActive=null;
  showScreen('scr-quest');
}
function questRetry(){ questActive=null; showScreen('scr-quest'); }
function launchStation(idx){
  const s=STATIONS[idx];
  questActive=idx;
  ensureAC();
  if(s.t==='quiz'){
    $('#quest-map').style.display='none';
    $('#quest-play').style.display='flex';
    if(s.boss) speak('Trạm trùm đây! Bé cố lên nhé!'); // đọc TRƯỚC khi quiz lên lịch câu hỏi, kẻo bị speakQ cắt ngang
    runQuiz({
      promptEl:$('#qp-prompt'), speakBtn:$('#qp-speak'),
      choicesEl:$('#qp-choices'), progressEl:$('#qp-progress'),
      questions:s.q(),
      firstDelay: s.boss ? 2500 : 300,
      onDone(right,total){
        const pass = right>=Math.ceil(total/2);
        ovCallback = pass ? questComplete : questRetry;
        showResult(quizStars(right,total), pass?`Đúng ${right}/${total} — qua trạm!`:`Đúng ${right}/${total} — thử lại nhé!`);
      }
    });
  }else if(s.t==='write'){
    wSet = s.set||'low';
    wMode = 'guide'; // trạm viết dạy đúng thứ tự nét
    $$('#write-modes [data-wmode]').forEach(x=>x.classList.toggle('on', x.dataset.wmode==='guide'));
    $$('#scr-write .tab').forEach(x=>x.classList.toggle('on', x.dataset.set===wSet));
    wIdx = Math.max(0, WRITE_SETS[wSet].indexOf(s.ch));
    showScreen('scr-write');
  }else if(s.t==='en'){
    enTheme = s.theme;
    showScreen('scr-en');
    $$('#en-chips .chip').forEach(x=>x.classList.toggle('on', x.textContent===s.theme));
    startEnQuiz(s.kind);
  }else if(s.t==='memory'){
    enTheme = s.theme;
    showScreen('scr-en');
    $$('#en-chips .chip').forEach(x=>x.classList.toggle('on', x.textContent===s.theme));
    startMemory();
  }
}

/* ============ STICKERS ============ */
function renderStickers(){
  const unlocked = unlockedCount(), gold = goldCount();
  let head;
  if(unlocked < STICKERS.length){
    head = `⭐ ${stars} sao — còn <b style="color:var(--coral)">${(unlocked+1)*STICKER_COST - stars} ⭐</b> nữa là có quà mới!`;
  }else if(gold < STICKERS.length){
    head = `✨ ${stars} sao — còn <b style="color:var(--coral)">${GOLD_BASE + (gold+1)*GOLD_COST - stars} ⭐</b> nữa là có sticker VÀNG!`;
  }else{
    head = '🏆 Bé đã sưu tập đủ TẤT CẢ, cả bộ vàng! Siêu quá!';
  }
  $('#sticker-progress').innerHTML = head;
  const grid=$('#sticker-grid'); grid.innerHTML='';
  const addCard = (s, open, isGold, need)=>{
    const d=document.createElement('div');
    d.className='sticker'+(open?'':' locked')+(isGold?' gold':'');
    d.innerHTML = `<div class="em">${open?s.em:'❓'}</div><div class="nm">${open?s.nm:'? ? ?'}</div>`;
    d.onclick=()=>{
      if(open){
        d.classList.remove('wiggle'); void d.offsetWidth; d.classList.add('wiggle');
        sndPop(); speak(s.nm);
      }else{
        speak(`Bé cần ${need} sao để mở sticker này nhé!`);
      }
    };
    grid.appendChild(d);
  };
  STICKERS.forEach((s,i)=>addCard(s, i<unlocked, false, (i+1)*STICKER_COST));
  if(unlocked>=STICKERS.length){ // hết bộ thường mới lộ bộ vàng — luôn có thứ để mong đợi
    const div=document.createElement('div');
    div.className='stk-div'; div.textContent='✨ Bộ sưu tập VÀNG ✨';
    grid.appendChild(div);
    STICKERS.forEach((s,i)=>addCard(s, i<gold, true, GOLD_BASE + (i+1)*GOLD_COST));
  }
}

/* ============ PARENT (cổng phụ huynh) ============ */
function initParent(){
  $('#parent-stats').style.display='none';
  $('#parent-gate').style.display='flex';
  const a=3+Math.floor(Math.random()*6), b=3+Math.floor(Math.random()*6);
  const ans=a*b;
  $('#pg-q').textContent = `${a} × ${b} = ?`;
  const ch=$('#pg-choices'); ch.innerHTML='';
  shuffle([ans, ans+3, ans-2]).forEach(v=>{
    const btn=document.createElement('button');
    btn.className='choice word'; btn.textContent=v;
    btn.onclick=()=>{
      if(v===ans){ showParentStats(); }
      else{ btn.classList.add('bad'); setTimeout(initParent, 450); }
    };
    ch.appendChild(btn);
  });
}
function showParentStats(){
  $('#parent-gate').style.display='none';
  $('#parent-stats').style.display='flex';
  const wrote=Object.keys(writeBest).length;
  const w3=Object.values(writeBest).filter(v=>v>=3).length;
  const gal=safeParse('bhv_gallery', [], Array.isArray);
  const rows=[
    ['⭐ Tổng sao', stars],
    ['🔥 Chuỗi ngày học', streak+' ngày'],
    ['🗺️ Thám hiểm', `${questDone}/${STATIONS.length} trạm`],
    ['✏️ Chữ đã luyện', `${wrote} chữ (đạt 3 sao: ${w3})`],
    ['🎁 Sticker', `${unlockedCount()+goldCount()}/${STICKERS.length*2}`],
    ['🖼️ Tranh đã lưu', gal.length]
  ];
  $('#ps-grid').innerHTML = rows.map(([k,v])=>`<div class="ps-row"><span>${k}</span><b>${v}</b></div>`).join('')
    + '<div style="text-align:center;font-size:13px;color:#71717A;padding:6px">Ảnh minh hoạ từ vựng: Wikipedia / Wikimedia Commons (giấy phép CC) · Giọng đọc: Microsoft Edge TTS</div>';
}
$('#btn-parent').addEventListener('click', ()=>showScreen('scr-parent'));
$('#ps-reset').addEventListener('click', function(){
  confirmTap(this, 'Bấm lần nữa để xoá nhé!', ()=>{ localStorage.clear(); location.reload(); });
});

/* resize */
let resizeTmr=null; // debounce: xoay iPad bắn nhiều resize liên tiếp — chỉ vẽ lại 1 lần, KHÔNG đọc lại câu nhắc
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTmr);
  resizeTmr=setTimeout(()=>{
    if(wReady && $('#scr-write').classList.contains('active') && sizeCanvas(wCanvas)) redrawWrite();
    if($('#scr-draw').classList.contains('active')){
      // xoay màn không được nuốt tranh vẽ tự do: chụp lại rồi scale vào kích thước mới
      const cv=$('#draw-canvas');
      const old=document.createElement('canvas');
      old.width=cv.width; old.height=cv.height;
      if(old.width && old.height) old.getContext('2d').drawImage(cv,0,0);
      if(sizeCanvas(cv)){
        const c=cv.getContext('2d');
        c.save(); c.setTransform(1,0,0,1,0,0);
        c.drawImage(old, 0,0, cv.width, cv.height);
        c.restore();
        freeHist.reset(); // ponytail: tranh còn nhưng undo mất sau xoay — chấp nhận, đủ tốt
      }
      if(colorInit) fitColorWrap(); // tranh tô không mất khi xoay màn hình (canvas độ phân giải cố định)
    }
  }, 150);
});
document.fonts.ready.then(()=>{
  // chỉ vẽ lại template khi bé CHƯA viết nét nào — font đẹp muộn còn hơn xoá chữ bé đang viết dở
  if(wReady && $('#scr-write').classList.contains('active') && !wStrokes.length) redrawWrite();
});

/* khởi động: lời chào + thưởng ngày mới (streak) */
$('#hello-text').textContent = helloLine();
if(newDay && streak>1){ addStars(2); confetti(); }
