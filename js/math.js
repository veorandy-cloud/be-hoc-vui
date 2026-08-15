"use strict";
/* ============ MATH 0-10 ============ */
// ponytail: pool nhỏ đặt tại đây thay vì data.js — chỉ math dùng, chuyển sang data.js khi module khác cần
const MATH_EMOJI = ['🍎','🍌','🍊','🍓','🍇','🍉','🐱','🐶','🐰','🐥','🐟','🐢'];
const mathN = n => 1 + Math.floor(Math.random()*n); // 1..n
function emGroup(em, n, size=34){
  return `<div style="font-size:${size}px;line-height:1.25;word-break:break-all">${em.repeat(n)}</div>`;
}
function numChoices(ans){
  const [d1, d2] = pick([0,1,2,3,4,5,6,7,8,9,10].filter(x=>x!==ans), 2);
  return [{html:String(ans),correct:true},{html:String(d1)},{html:String(d2)}];
}
function qCount(){
  const n = mathN(10), em = rand(MATH_EMOJI);
  return { say:'Bé đếm xem có bao nhiêu hình nhé!', html:emGroup(em, n), choices:numChoices(n) };
}
function qAdd(){
  const a = mathN(9), b = mathN(10-a); // a+b ≤ 10
  const [e1, e2] = pick(MATH_EMOJI, 2);
  return {
    say:`${a} cộng ${b} bằng mấy?`,
    html:`<div style="font-size:26px;line-height:1.25;word-break:break-all">${e1.repeat(a)} ➕ ${e2.repeat(b)}</div><div>${a} + ${b} = ?</div>`,
    choices:numChoices(a+b)
  };
}
function qSub(){
  const a = mathN(10), b = mathN(a); // a-b ≥ 0
  const em = rand(MATH_EMOJI);
  return {
    say:`${a} trừ ${b} bằng mấy?`,
    html:`<div style="font-size:26px;line-height:1.25;word-break:break-all">${em.repeat(a-b)}<span style="opacity:.35;text-decoration:line-through">${em.repeat(b)}</span></div><div>${a} − ${b} = ?</div>`,
    choices:numChoices(a-b)
  };
}
function qCompare(){
  // đáp án là chính nhóm hình (bé chạm nhóm nhiều hơn) — runQuiz shuffle choices nên
  // nút chữ 'trái/phải' sẽ bị đảo vị trí gây sai oan, nhóm hình thì shuffle vô hại
  const [a, b] = pick([1,2,3,4,5,6,7,8,9,10], 2); // luôn khác nhau
  const [e1, e2] = pick(MATH_EMOJI, 2);
  return {
    say:'Bên nào có nhiều hơn?', html:'⚖️',
    choices:[
      {html:emGroup(e1, a, 24), correct:a>b, cls:'word'},
      {html:emGroup(e2, b, 24), correct:b>a, cls:'word'}
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
