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
      {html:tenFrame(a), correct:a>b, cls:'word'},
      {html:tenFrame(b), correct:b>a, cls:'word'}
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
      {html:tenFrame(a), correct:a>b, cls:'word'},
      {html:tenFrame(b), correct:b>a, cls:'word'}
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

/* ==== lời văn 1 bước (SGK lớp 1) — phạm vi 1–10, không hai bước, không vào mix/mix20 ==== */
const MATH_STORY_BANK = [
  {say:'Na có 3 quả táo. Mẹ cho thêm 2 quả. Na có tất cả mấy quả táo?', a:3, b:2, ans:5, add:1},
  {say:'Bo có 4 viên kẹo. Bạn cho thêm 3 viên. Bo có tất cả mấy viên kẹo?', a:4, b:3, ans:7, add:1},
  {say:'Có 5 con gà. Thêm 2 con gà. Tất cả mấy con gà?', a:5, b:2, ans:7, add:1},
  {say:'Na hái được 6 bông hoa. Hái thêm 1 bông. Na có mấy bông hoa?', a:6, b:1, ans:7, add:1},
  {say:'Có 2 cái bánh. Mẹ làm thêm 5 cái bánh. Tất cả mấy cái bánh?', a:2, b:5, ans:7, add:1},
  {say:'Bo có 7 viên bi. Cho bạn 3 viên. Bo còn mấy viên bi?', a:7, b:3, ans:4, add:0},
  {say:'Có 8 quả cam. Ăn mất 2 quả. Còn lại mấy quả cam?', a:8, b:2, ans:6, add:0},
  {say:'Na có 6 cái kẹo. Cho em 4 cái. Na còn mấy cái kẹo?', a:6, b:4, ans:2, add:0},
  {say:'Có 9 con cá. Bơi đi 5 con. Còn lại mấy con cá?', a:9, b:5, ans:4, add:0},
  {say:'Bo có 5 quả táo. Ăn 1 quả. Bo còn mấy quả táo?', a:5, b:1, ans:4, add:0}
];
function qStory(s){
  const frames = s.add ? tenFrame(s.a)+tenFrame(s.b) : tenFrame(s.a, s.b);
  return {
    say:s.say,
    html:`<div class="math-story">${s.say}</div><div class="math-frames">${frames}</div>`,
    choices:numChoices(s.ans)
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
    choices:[{html:ok,correct:true,cls:'word'},{html:d1,cls:'word'},{html:d2,cls:'word'}]
  };
}
MATH_BUILDERS.bond = ()=>Array.from({length:6}, qBond);

/* ==== hình học lớp 1 — không vào mix/mix20 ==== */
const MATH_SHAPE_BANK = [
  {name:'vuông',    inner:'<rect x="30" y="30" width="140" height="140"/>'},
  {name:'tròn',     inner:'<circle cx="100" cy="100" r="70"/>'},
  {name:'tam giác', inner:'<polygon points="100,20 180,180 20,180"/>'},
  {name:'chữ nhật', inner:'<rect x="10" y="50" width="180" height="100"/>'}
];
function qShape(s){
  const [d1, d2] = pick(MATH_SHAPE_BANK.filter(x=>x.name!==s.name).map(x=>x.name), 2);
  return {
    say:'Đây là hình gì?',
    html:`<div class="math-shape-wrap"><svg class="math-shape" xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="#fff" stroke="#333" stroke-width="6">${s.inner}</svg></div>`,
    choices:[{html:s.name,correct:true,cls:'word'},{html:d1,cls:'word'},{html:d2,cls:'word'}]
  };
}
MATH_BUILDERS.shape = ()=>shuffle(MATH_SHAPE_BANK.concat(pick(MATH_SHAPE_BANK,2))).map(qShape);

function initMath(){
  $('#math-menu').style.display='grid';
  $('#math-quiz').style.display='none';
}
$$('#math-menu .menu-card').forEach(c=>c.addEventListener('click', ()=>{
  startMathRound(c.dataset.level);
}));
function startMathRound(level){
  $('#math-menu').style.display='none';
  $('#math-quiz').style.display='flex';
  runQuiz({
    promptEl:$('#math-prompt'), speakBtn:$('#math-speak'),
    choicesEl:$('#math-choices'), progressEl:$('#math-progress'),
    questions: MATH_BUILDERS[level](),
    onDone(right, total){
      ovCallback = initMath;
      showResult(quizStars(right, total), `Đúng ${right}/${total} câu!`);
    }
  });
}
