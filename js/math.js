"use strict";
/* ============ MATH 0-10 ============ */
// ponytail: pool nhỏ đặt tại đây thay vì data.js — chỉ math dùng, chuyển sang data.js khi module khác cần
const mathN = n => 1 + Math.floor(Math.random()*n); // 1..n
function tenFrame(n, gone=0){
  // n = 0..20. For n<=10: ONE .ten-frame with 10 .dot, first n have class "on".
  // For n>10: TWO .ten-frame (10 + n-10). Each frame always has exactly 10 .dot.
  // Fill order: left-to-right, top row 1–5, bottom row 6–10 (standard ten-frame).
  // gone: last `gone` of the filled dots also get class "gone" (subtraction).
  n = Math.max(0, Math.min(20, n|0));
  gone = Math.max(0, Math.min(n, gone|0));
  function frame(filled, g){
    let h = '<div class="ten-frame">';
    for(let i=0; i<10; i++){
      let c = 'dot';
      if(i < filled){
        c += ' on';
        if(i >= filled - g) c += ' gone';
      }
      h += `<span class="${c}"></span>`;
    }
    return h + '</div>';
  }
  if(n <= 10) return frame(n, gone);
  const n2 = n - 10;
  const g2 = Math.min(gone, n2);
  return `<div class="math-frames">${frame(10, gone - g2)}${frame(n2, g2)}</div>`;
}
function numLine(max, marks){
  const set = new Set(marks);
  let h = '<div class="num-line">';
  for(let i=0; i<=max; i++) h += `<span class="nl-tick${set.has(i)?' on':''}"></span>`;
  return h + '</div>';
}
function numChoices(ans, max=10){
  const [d1, d2] = pick([...Array(max+1).keys()].filter(x=>x!==ans), 2);
  return [{html:String(ans),correct:true},{html:String(d1)},{html:String(d2)}];
}
function qCount(){
  const n = mathN(10);
  return { say:'Bé đếm xem có bao nhiêu hình nhé!', html:tenFrame(n), choices:numChoices(n) };
}
function qAdd(){
  const a = mathN(9), b = mathN(10-a); // a+b ≤ 10
  return {
    say:`${a} cộng ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a)}<span class="math-op">+</span>${tenFrame(b)}</div><div class="math-eq">${a} + ${b} = ?</div>${numLine(10,[a,a+b])}`,
    choices:numChoices(a+b)
  };
}
function qSub(){
  const a = mathN(10), b = mathN(a); // a-b ≥ 0
  return {
    say:`${a} trừ ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a, b)}</div><div class="math-eq">${a} − ${b} = ?</div>${numLine(10,[a-b,a])}`,
    choices:numChoices(a-b)
  };
}
function qCompare(){
  // đáp án là chính nhóm hình (bé chạm nhóm nhiều hơn) — runQuiz shuffle choices nên
  // nút chữ 'trái/phải' sẽ bị đảo vị trí gây sai oan, nhóm hình thì shuffle vô hại
  const [a, b] = pick([1,2,3,4,5,6,7,8,9,10], 2); // luôn khác nhau
  return {
    say:'Bên nào có nhiều hơn?', html:'⚖️',
    choices:[
      {html:tenFrame(a), correct:a>b, cls:'word', say:String(a)},
      {html:tenFrame(b), correct:b>a, cls:'word', say:String(b)}
    ]
  };
}
const MATH_BUILDERS = {
  count:   ()=>Array.from({length:6}, qCount),
  add:     ()=>Array.from({length:6}, qAdd),
  sub:     ()=>Array.from({length:6}, qSub),
  compare: ()=>Array.from({length:6}, qCompare),
  mix:     ()=>shuffle([qCount(), qAdd(), qSub(), qCompare(),
                        rand([qCount,qAdd,qSub,qCompare])(), rand([qCount,qAdd,qSub,qCompare])()])
};

/* ==== phạm vi 11-20 (SGK HK2 lớp 1) — chỉ phép KHÔNG NHỚ, đúng chương trình ==== */
function qCount20(){
  const n = 10 + mathN(10);
  return { say:'Bé đếm xem có bao nhiêu hình nhé!', html:tenFrame(n), choices:numChoices(n, 20) };
}
function qAdd20(){
  let a, b;
  if(Math.random() < .4){ a = 10; b = mathN(10); }               // 10 + b (mẫu cơ bản)
  else { a = 10 + mathN(6); b = mathN(9 - a%10); }               // 1x + y với lẻ + lẻ < 10 → không nhớ
  return {
    say:`${a} cộng ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a)}<span class="math-op">+</span>${tenFrame(b)}</div><div class="math-eq">${a} + ${b} = ?</div>${numLine(20,[a,a+b])}`,
    choices:numChoices(a+b, 20)
  };
}
function qSub20(){
  let a, b;
  if(Math.random() < .25){ a = 10 + mathN(9); b = 10; }          // 1x − 10
  else { a = 11 + mathN(8); b = mathN(a%10); }                   // trừ hết hàng đơn vị → không mượn
  return {
    say:`${a} trừ ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a, b)}</div><div class="math-eq">${a} − ${b} = ?</div>${numLine(20,[a-b,a])}`,
    choices:numChoices(a-b, 20)
  };
}
function qCompare20(){
  const [a, b] = pick(Array.from({length:19}, (_,i)=>i+2), 2);   // 2..20, luôn khác nhau
  return {
    say:'Bên nào có nhiều hơn?', html:'⚖️',
    choices:[
      {html:tenFrame(a), correct:a>b, cls:'word', say:String(a)},
      {html:tenFrame(b), correct:b>a, cls:'word', say:String(b)}
    ]
  };
}
MATH_BUILDERS.mix20 = ()=>shuffle([qCount20(), qAdd20(), qSub20(), qCompare20(),
  rand([qCount20,qAdd20,qSub20,qCompare20])(), rand([qCount20,qAdd20,qSub20,qCompare20])()]);

/* ==== cộng/trừ CÓ NHỚ phạm vi 20 (SGK HK2) — không vào mix/mix20 ==== */
function qAddCarry(){
  const pairs = [];
  for(let a=2; a<=9; a++) for(let b=10-a; b<=9; b++) pairs.push([a,b]);
  for(let a=11; a<=19; a++) for(let b=1; b<=9; b++)
    if((a%10)+b>=10 && a+b<=20) pairs.push([a,b]);
  const [a,b] = rand(pairs);
  return {
    say:`${a} cộng ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a)}<span class="math-op">+</span>${tenFrame(b)}</div><div class="math-eq">${a} + ${b} = ?</div>${numLine(20,[a,a+b])}`,
    choices:numChoices(a+b, 20)
  };
}
function qSubBorrow(){
  const pairs = [];
  for(let a=11; a<=19; a++) for(let b=1; b<=9; b++)
    if(b>a%10 && a-b>=1) pairs.push([a,b]);
  const [a,b] = rand(pairs);
  return {
    say:`${a} trừ ${b} bằng mấy?`,
    html:`<div class="math-frames">${tenFrame(a, b)}</div><div class="math-eq">${a} − ${b} = ?</div>${numLine(20,[a-b,a])}`,
    choices:numChoices(a-b, 20)
  };
}
MATH_BUILDERS.carry = ()=>shuffle([qAddCarry(),qAddCarry(),qAddCarry(), qSubBorrow(),qSubBorrow(),qSubBorrow()]);

/* ==== lời văn 1 bước (SGK lớp 1) — bank MATH_STORY_BANK trong data.js (1–10 + 11–20), không vào mix/mix20 ==== */
function qStory(s){
  const frames = s.add ? tenFrame(s.a)+tenFrame(s.b) : tenFrame(s.a, s.b);
  return {
    say:s.say,
    html:`<div class="math-story">${s.say}</div><div class="math-frames">${frames}</div>`,
    choices:numChoices(s.ans, s.ans>10 ? 20 : 10)
  };
}
MATH_BUILDERS.story = ()=>shuffle(MATH_STORY_BANK).slice(0,6).map(qStory);

/* ==== thành phần số 1–10 — không vào mix/mix20 ==== */
function qBond(){
  const n = 1 + mathN(9); // 2..10
  const x = mathN(n-1);   // 1..n-1
  const a = Math.min(x, n-x), b = n-a;
  const ok = `${a} + ${b}`;
  const cands = [];
  for(let p=1; p<=n; p++){
    for(let q=p; q<=n; q++){
      if(p+q===n) continue;
      cands.push(`${p} + ${q}`);
    }
  }
  const [d1, d2] = pick(cands, 2);
  return {
    say:`Số ${n} gồm mấy và mấy?`,
    html:`<div class="math-story">Số ${n} gồm hai phần.</div>${tenFrame(n)}`,
    choices:[ok,d1,d2].map((x,i)=>({html:x, correct:i===0, cls:'word', say:x.replace(' + ',' cộng ')}))
  };
}
MATH_BUILDERS.bond = ()=>Array.from({length:6}, qBond);

/* ==== hình học lớp 1 — không vào mix/mix20 ==== */
const MATH_SHAPE_BANK = [
  {name:'vuông',    inner:'<rect x="30" y="30" width="140" height="140"/>'},
  {name:'tròn',     inner:'<circle cx="100" cy="100" r="70"/>'},
  {name:'tam giác', inner:'<polygon points="100,20 180,180 20,180"/>'},
  {name:'chữ nhật', inner:'<rect x="10" y="50" width="180" height="100"/>'},
  // khối (SGK HK2): vẽ phối cảnh — mặt trước + mặt trên + mặt phải
  {name:'khối lập phương',
   inner:'<rect x="30" y="70" width="100" height="100"/><polygon points="30,70 70,30 170,30 130,70"/><polygon points="130,70 170,30 170,130 130,170"/>'},
  {name:'khối hộp chữ nhật',
   inner:'<rect x="15" y="90" width="130" height="80"/><polygon points="15,90 55,50 185,50 145,90"/><polygon points="145,90 185,50 185,130 145,170"/>'}
];
/* đảo chiều cho bé chưa biết đọc (Khan Kids/Todo Math): cô hỏi "Đâu là hình tròn?" → bé chạm 1 trong 3 HÌNH (tô màu ngẫu nhiên),
   không phải đọc chữ "khối hộp chữ nhật". Chạm hình nào cô đọc tên hình đó (say) */
const SHAPE_FILLS = ['#FCA5A5','#93C5FD','#86EFAC','#FDE68A','#C4B5FD','#F9A8D4','#FDBA74'];
function shapeSVG(s, fill){
  return `<div class="math-shape-wrap"><svg class="math-shape" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="${fill}" stroke="#333" stroke-width="6">${s.inner}</svg></div>`;
}
const shapeName = s => /^khối/.test(s.name) ? s.name : 'hình '+s.name;
function qShape(s){
  const others = pick(MATH_SHAPE_BANK.filter(x=>x!==s), 2);
  const fills = pick(SHAPE_FILLS, 3);
  return {
    say:`Đâu là ${shapeName(s)}?`, html:'❓',
    choices:[s, ...others].map((x,i)=>({html:shapeSVG(x, fills[i]), correct:i===0, say:shapeName(x)}))
  };
}
MATH_BUILDERS.shape = ()=>shuffle(MATH_SHAPE_BANK.concat(pick(MATH_SHAPE_BANK,2))).map(qShape);

/* ==== HK2: số đến 100 — bó que tính (1 thanh = 1 chục) + que rời; chỉ phép KHÔNG NHỚ (bank MATH_100, data.js) ==== */
function tensBlocks(n){
  n = Math.max(0, Math.min(100, n|0));
  const t = Math.floor(n/10), u = n%10;
  return `<div class="tens"><span class="tens-t">${'<i class="tbar"></i>'.repeat(t)}</span><span class="tens-u">${'<i class="udot"></i>'.repeat(u)}</span></div>`;
}
function choicesFrom(ans, pool){
  const [d1, d2] = pick(pool.filter(x=>x!==ans), 2);
  return [{html:String(ans),correct:true},{html:String(d1)},{html:String(d2)}];
}
const TENS = [10,20,30,40,50,60,70,80,90,100];
function qRoundTens(){
  const n = 10*mathN(10);
  return { say:'Có bao nhiêu que tính?', html:tensBlocks(n), choices:choicesFrom(n, TENS) };
}
function qRead100(){
  const n = 10 + mathN(90);             // 11..100
  const rev = +String(n).split('').reverse().join('');
  const pool = [...new Set([rev, n+10, n-10, n+1, n-1].filter(x=>x>=10 && x<=100 && x!==n))];
  return { say:`Bé tìm số ${n} nhé!`, html:tensBlocks(n), choices:choicesFrom(n, pool) };
}
function qCompare100(){
  const [a, b] = pick(Array.from({length:90}, (_,i)=>i+10), 2); // 10..99, luôn khác nhau
  return {
    say:'Số nào lớn hơn?', html:'⚖️',
    choices:[
      {html:`<div class="math-eq">${a}</div>${tensBlocks(a)}`, correct:a>b, cls:'word', say:String(a)},
      {html:`<div class="math-eq">${b}</div>${tensBlocks(b)}`, correct:b>a, cls:'word', say:String(b)}
    ]
  };
}
function qAdd100(){
  const [a,b] = rand(MATH_100.add);
  const pool = Array.from({length:10}, (_,i)=>a+b-5+i).concat([a+b+10, a+b-10]).filter(x=>x>=0 && x<=100);
  return {
    say:`${a} cộng ${b} bằng mấy?`,
    html:`<div class="math-frames">${tensBlocks(a)}<span class="math-op">+</span>${tensBlocks(b)}</div><div class="math-eq">${a} + ${b} = ?</div>`,
    choices:choicesFrom(a+b, pool)
  };
}
function qSub100(){
  const [a,b] = rand(MATH_100.sub);
  const pool = Array.from({length:10}, (_,i)=>a-b-5+i).concat([a-b+10, a-b-10]).filter(x=>x>=0 && x<=100);
  return {
    say:`${a} trừ ${b} bằng mấy?`,
    html:`<div class="math-frames">${tensBlocks(a)}<span class="math-op">−</span>${tensBlocks(b)}</div><div class="math-eq">${a} − ${b} = ?</div>`,
    choices:choicesFrom(a-b, pool)
  };
}
MATH_BUILDERS.hundred = ()=>shuffle([qRoundTens(), qRead100(), qCompare100(), qAdd100(), qSub100(),
  rand([qRead100,qAdd100,qSub100])()]);

/* ==== HK2: số liền trước / liền sau / điền dãy số ==== */
function seqHtml(cells){ // cells: số hoặc '?'
  return `<div class="math-seq">${cells.map(c=>`<span class="${c==='?'?'q':''}">${c}</span>`).join('')}</div>`;
}
function nearChoices(ans){
  const pool = [ans-2, ans-1, ans+1, ans+2, ans+10, ans-10].filter(x=>x>=0 && x<=100);
  return choicesFrom(ans, pool);
}
function qNext(){
  const n = mathN(98); // 1..98
  return { say:'Số liền sau của số này là mấy?', html:seqHtml([n-1<0?'':n-1, n, '?']), choices:nearChoices(n+1) };
}
function qPrev(){
  const n = 1 + mathN(97); // 2..98
  return { say:'Số liền trước của số này là mấy?', html:seqHtml(['?', n, n+1]), choices:nearChoices(n-1) };
}
function qSeq(){
  const start = mathN(95), hole = mathN(5)-1; // 5 số liên tiếp, khuyết 1
  const cells = Array.from({length:5}, (_,i)=>start+i);
  const ans = cells[hole]; cells[hole]='?';
  return { say:'Số nào còn thiếu trong dãy?', html:seqHtml(cells), choices:nearChoices(ans) };
}
MATH_BUILDERS.order = ()=>shuffle([qNext(), qNext(), qPrev(), qPrev(), qSeq(), qSeq()]);

/* ==== HK2: xem giờ đúng (kim phút chỉ 12) + thứ trong tuần ==== */
function clockSVG(h){
  const ticks = Array.from({length:12}, (_,i)=>{
    const a = i*Math.PI/6, r1 = i%3===0 ? 78 : 84;
    return `<line x1="${100+r1*Math.sin(a)}" y1="${100-r1*Math.cos(a)}" x2="${100+90*Math.sin(a)}" y2="${100-90*Math.cos(a)}"/>`;
  }).join('');
  const nums = [[12,100,34],[3,166,106],[6,100,172],[9,34,106]].map(([n,x,y])=>`<text x="${x}" y="${y}">${n}</text>`).join('');
  const ha = h*Math.PI/6;
  return `<svg class="math-clock" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <circle cx="100" cy="100" r="94" fill="#fff" stroke="#333" stroke-width="6"/>
    <g stroke="#333" stroke-width="4" stroke-linecap="round">${ticks}</g>
    <g font-family="Baloo 2, sans-serif" font-size="26" font-weight="800" fill="#333" text-anchor="middle">${nums}</g>
    <line x1="100" y1="100" x2="100" y2="30" stroke="#0284C7" stroke-width="6" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${100+48*Math.sin(ha)}" y2="${100-48*Math.cos(ha)}" stroke="#DC2626" stroke-width="9" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="7" fill="#333"/></svg>`;
}
function qClock(){
  const h = mathN(12);
  const pool = Array.from({length:12}, (_,i)=>i+1);
  return {
    say:'Đồng hồ chỉ mấy giờ?', html:`<div class="math-shape-wrap">${clockSVG(h)}</div>`,
    choices:choicesFrom(h, pool).map(c=>({...c, html:`${c.html} giờ`, cls:'word'}))
  };
}
function qWeekday(){
  const i = mathN(7)-1, next = Math.random()<.5;
  const ans = WEEKDAYS[(i + (next?1:6)) % 7];
  const [d1, d2] = pick(WEEKDAYS.filter(x=>x!==ans && x!==WEEKDAYS[i]), 2);
  return {
    say:`Hôm nay là ${WEEKDAYS[i]}. ${next?'Ngày mai':'Hôm qua'} là thứ mấy?`,
    html:`<div class="math-story">Hôm nay là <b>${WEEKDAYS[i]}</b>. ${next?'Ngày mai':'Hôm qua'} là thứ mấy?</div>` +
         `<div class="week-strip">${WEEKDAYS.map((d,k)=>`<span class="${k===i?'on':''}">${k<6 ? 'T'+(k+2) : 'CN'}</span>`).join('')}</div>`,
    choices:[{html:ans,correct:true,cls:'word'},{html:d1,cls:'word'},{html:d2,cls:'word'}]
  };
}
MATH_BUILDERS.time = ()=>shuffle([qClock(), qClock(), qClock(), qClock(), qWeekday(), qWeekday()]);

/* ==== HK2: đo độ dài xăng-ti-mét — thước 10 cm + bút chì dài n cm; so sánh 2 băng giấy ==== */
function rulerSVG(n){
  const cm = 36, x0 = 20;
  const lines = Array.from({length:11}, (_,i)=>`<line x1="${x0+i*cm}" y1="130" x2="${x0+i*cm}" y2="${i%5===0?108:116}"/>`).join('')
    + Array.from({length:10}, (_,i)=>`<line x1="${x0+i*cm+cm/2}" y1="130" x2="${x0+i*cm+cm/2}" y2="121"/>`).join('');
  const labels = Array.from({length:11}, (_,i)=>`<text x="${x0+i*cm}" y="156">${i}</text>`).join('');
  const L = n*cm;
  return `<svg class="math-ruler" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 170" width="400" height="170">
    <g stroke="#333" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="${x0},40 ${x0+L-22},40 ${x0+L},60 ${x0+L-22},80 ${x0},80" fill="#FACC15"/>
      <line x1="${x0+8}" y1="40" x2="${x0+8}" y2="80"/></g>
    <rect x="${x0-14}" y="100" width="${10*cm+28}" height="36" fill="#fff" stroke="#333" stroke-width="4" rx="6"/>
    <g stroke="#333" stroke-width="2">${lines}</g>
    <g font-family="Baloo 2, sans-serif" font-size="16" font-weight="800" fill="#333" text-anchor="middle">${labels}</g></svg>`;
}
function qRuler(){
  const n = 1 + mathN(9); // 2..10 cm
  return {
    say:'Bút chì dài mấy xăng ti mét?', html:`<div class="math-shape-wrap">${rulerSVG(n)}</div>`,
    choices:choicesFrom(n, Array.from({length:10}, (_,i)=>i+1)).map(c=>({...c, html:`${c.html} cm`, say:`${c.html} xăng ti mét`, cls:'word'}))
  };
}
function qLenCompare(){
  const [a, b] = pick([3,4,5,6,7,8,9,10], 2);
  const bar = n => `<div class="len-bar" style="width:${n*9}%"></div>`;
  return {
    say:'Cái nào dài hơn?', html:'📏',
    choices:[{html:bar(a), correct:a>b, cls:'word', say:null},{html:bar(b), correct:b>a, cls:'word', say:null}]
  };
}
MATH_BUILDERS.measure = ()=>shuffle([qRuler(), qRuler(), qRuler(), qRuler(), qLenCompare(), qLenCompare()]);

/* thẻ HK2 (data-lock) hiện 🔒 "bí ẩn" tới khi bé làm tốt (≥2⭐) 6 lượt toán khác — mở dần như Khan Kids; phụ huynh có nút mở tất cả */
const mathOk = ()=> Number(localStorage.getItem('bhv_mathok'))||0;
function hk2Unlocked(){ return !!localStorage.getItem('bhv_unlockall') || mathOk()>=6; }
function initMath(){
  $('#math-menu').style.display='grid';
  $('#math-quiz').style.display='none';
  const open = hk2Unlocked();
  $$('#math-menu [data-lock]').forEach(c=>c.classList.toggle('locked', !open));
  if(open && localStorage.getItem('bhv_mathunlock')==='new'){ // vừa đủ 6 lượt: ăn mừng 1 lần
    localStorage.setItem('bhv_mathunlock','done');
    confetti(true); sndWin(); speak('Bé mở được bài mới rồi! Chạm vào thẻ mới xem nhé!');
  }
}
$$('#math-menu .menu-card').forEach(c=>c.addEventListener('click', ()=>{
  if(c.classList.contains('locked')){
    c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
    sndPop(); speak('Bé chơi thật giỏi các bài toán khác để mở khoá nhé!');
    return;
  }
  startMathRound(c.dataset.level);
}));
function startMathRound(level){
  $('#math-menu').style.display='none';
  $('#math-quiz').style.display='flex';
  const card = $(`#math-menu [data-level="${level}"]`);
  runQuiz({
    promptEl:$('#math-prompt'), speakBtn:$('#math-speak'),
    choicesEl:$('#math-choices'), progressEl:$('#math-progress'),
    title: card ? (card.dataset.say || card.querySelector('.tt').textContent.trim()) : '',
    intro: level==='count' ? 'Bé chạm từng chấm để đếm, rồi chọn số đúng nhé!' : 'Bé nghe cô hỏi, rồi chạm vào đáp án đúng nhé!',
    introKey: level==='count' ? 'count' : 'quiz',
    questions: MATH_BUILDERS[level](),
    onDone(right, total){
      if(typeof bumpToday==='function') bumpToday('math');
      const earned = quizStars(right, total);
      if(earned>=2 && !(card && card.dataset.lock)){
        const n = mathOk()+1; localStorage.setItem('bhv_mathok', n);
        if(n===6 && !localStorage.getItem('bhv_unlockall')) localStorage.setItem('bhv_mathunlock','new');
      }
      ovCallback = initMath;
      showResult(earned, `Đúng ${right}/${total} câu!`);
    }
  });
}
