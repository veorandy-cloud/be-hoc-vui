"use strict";
/* ============ WRITING ============ */
let wCanvas, wCtx, wStrokes=[], wSet='low', wIdx=0, wReady=false, wPen='#FF5C5C', wNib='pen';
const wHist = makeHistory(()=>wCanvas, ()=>wCtx, ()=>drawTemplate());
let writeBest = safeParse('bhv_write', {}, isObj);
function curChar(){ return WRITE_SETS[wSet][wIdx]; }
function charKey(){ return curChar(); }
function charInfo(){
  const lc = curChar().toLowerCase();
  return {name:LETTER_NAMES[lc]||lc, ex:EXAMPLES[lc]};
}
function initWrite(){
  if(!wReady){
    wCanvas = $('#write-canvas'); wCtx = wCanvas.getContext('2d');
    bindDraw(wCanvas, wCtx,
      ()=>({mode:'pen', brush:wNib, color:wPen, size:wNib==='marker'?11:14}),
      pts=>wStrokes.push(pts), undefined, wHist);
    $('#w-undo').onclick = ()=>{ if(wHist.undo()){ wStrokes.pop(); sndPop(); } };
    $$('#scr-write [data-nib]').forEach(b=>b.onclick=()=>{
      wNib=b.dataset.nib;
      $$('#scr-write [data-nib]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    });
    $('#w-prev').onclick = ()=>{ wIdx=(wIdx-1+WRITE_SETS[wSet].length)%WRITE_SETS[wSet].length; resetWrite(); };
    $('#w-next').onclick = ()=>{ wIdx=(wIdx+1)%WRITE_SETS[wSet].length; resetWrite(); };
    $('#w-speak').onclick = speakChar;
    $('#w-clear').onclick = function(){ confirmTap(this, 'Bấm lần nữa để xoá nhé!', resetWrite); };
    $('#w-grade').onclick = gradeWrite;
    $('#write-word').onclick = ()=>{ const {ex}=charInfo(); speak(ex.w); };
    $$('#scr-write .tab').forEach(b=>b.onclick=()=>{
      wSet=b.dataset.set; wIdx=0;
      $$('#scr-write .tab').forEach(x=>x.classList.remove('on')); b.classList.add('on');
      resetWrite();
    });
    $$('#scr-write .swatch').forEach(s=>s.onclick=()=>{
      wPen=s.dataset.pen;
      $$('#scr-write .swatch').forEach(x=>x.classList.remove('on')); s.classList.add('on');
    });
    wReady=true;
  }
  requestAnimationFrame(()=>{ sizeCanvas(wCanvas); resetWrite(); });
}
function speakChar(){
  const {name}=charInfo();
  const suffix = wSet==='up' ? ' hoa' : wSet==='num' ? '' : '';
  speak((wSet==='num'?'Số ':'Chữ ')+name+suffix);
}
function sizeCanvas(cv){
  const r = cv.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio||1;
  const w = Math.round(r.width*dpr), h = Math.round(r.height*dpr);
  if(!w || !h) return false;                    // parent đang ẩn — resize về 0 sẽ xoá sạch tranh
  if(cv.width===w && cv.height===h) return false; // gán width/height LUÔN xoá canvas, kể cả khi số không đổi
  cv.width = w; cv.height = h;
  cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
  return true; // canvas đã bị xoá thật — caller phải vẽ lại / reset history
}
function templateFont(cv){
  const h = cv.parentElement.getBoundingClientRect().height;
  return `800 ${Math.floor(h*0.62)}px "Baloo 2", sans-serif`;
}
function drawTemplate(){
  const {ex}=charInfo();
  $('#write-letter').textContent = curChar();
  $('#write-word').innerHTML = `<div class="em">${ex.em}</div><div class="wd">${ex.w}</div>`;
  const best = writeBest[charKey()]||0;
  $('#write-best').textContent = best?`Tốt nhất: ${'⭐'.repeat(best)}`:'Tốt nhất: —';
  const r = wCanvas.parentElement.getBoundingClientRect();
  wCtx.clearRect(0,0,r.width,r.height);
  // ô ly như vở tập viết lớp 1
  const cell = r.height/10;
  wCtx.strokeStyle='#DDEBFA'; wCtx.lineWidth=1;
  wCtx.beginPath();
  for(let gy=cell; gy<r.height; gy+=cell){ wCtx.moveTo(0,gy); wCtx.lineTo(r.width,gy); }
  for(let gx=cell; gx<r.width; gx+=cell){ wCtx.moveTo(gx,0); wCtx.lineTo(gx,r.height); }
  wCtx.stroke();
  wCtx.strokeStyle='#F5B8C4'; wCtx.beginPath();
  wCtx.moveTo(0, r.height/2 + cell*2); wCtx.lineTo(r.width, r.height/2 + cell*2);
  wCtx.stroke();
  wCtx.font = templateFont(wCanvas);
  wCtx.textAlign='center'; wCtx.textBaseline='middle';
  wCtx.fillStyle='#E8E8EF';
  wCtx.fillText(curChar(), r.width/2, r.height/2);
  wCtx.strokeStyle='#B8B8CC'; wCtx.lineWidth=2; wCtx.setLineDash([8,8]);
  wCtx.strokeText(curChar(), r.width/2, r.height/2);
  wCtx.setLineDash([]);
}
function redrawWrite(){ wStrokes=[]; wHist.reset(); drawTemplate(); }
function resetWrite(){
  redrawWrite();
  const {name}=charInfo();
  speak(`Bé hãy viết ${wSet==='num'?'số':'chữ'} ${name}${wSet==='up'?' hoa':''} nhé!`);
}
function gradeWrite(){
  // ponytail: coverage x precision, chưa xét thứ tự nét — nâng cấp bằng stroke-path data nếu cần chặt hơn
  const r = wCanvas.parentElement.getBoundingClientRect();
  const off = document.createElement('canvas');
  off.width=r.width; off.height=r.height;
  const oc = off.getContext('2d');
  oc.font = templateFont(wCanvas);
  oc.textAlign='center'; oc.textBaseline='middle';
  oc.fillStyle='#000';
  oc.fillText(curChar(), r.width/2, r.height/2);
  const img = oc.getImageData(0,0,off.width,off.height).data;
  const targets=[];
  for(let y=0;y<off.height;y+=7) for(let x=0;x<off.width;x+=7)
    if(img[(y*off.width+x)*4+3]>128) targets.push([x,y]);
  if(!targets.length) return;
  const pts = wStrokes.flat();
  if(pts.length<5){ speak('Bé hãy viết theo nét mờ nhé!'); return; }
  const TH2 = 26*26;
  let hit=0;
  for(const [tx,ty] of targets){
    for(const [px,py] of pts){
      const dx=px-tx, dy=py-ty;
      if(dx*dx+dy*dy < TH2){ hit++; break; }
    }
  }
  const coverage = hit/targets.length;
  // precision: phần nét bé vẽ có nằm trong chữ mẫu không (phạt vẽ lung tung)
  const stride = Math.max(1, Math.floor(pts.length/300));
  let near=0, checked=0;
  for(let i=0;i<pts.length;i+=stride){
    checked++;
    const [px,py]=pts[i];
    for(const [tx,ty] of targets){
      const dx=px-tx, dy=py-ty;
      if(dx*dx+dy*dy < TH2){ near++; break; }
    }
  }
  const precision = checked?near/checked:0;
  const pct = coverage * Math.min(1, precision/0.55);
  const earned = pct>=0.75?3 : pct>=0.5?2 : pct>=0.28?1 : 0;
  if(earned > (writeBest[charKey()]||0)){
    writeBest[charKey()]=earned;
    localStorage.setItem('bhv_write', JSON.stringify(writeBest));
  }
  ovCallback = ()=>{ wIdx=(wIdx+1)%WRITE_SETS[wSet].length; resetWrite(); };
  if(earned===0) ovCallback = resetWrite;
  // quest: phải viết ĐÚNG chữ của trạm — đổi sang chữ/số dễ hơn không được tính qua trạm
  if(questActive!==null) ovCallback = (earned>=1 && curChar()===STATIONS[questActive].ch) ? questComplete : resetWrite;
  showResult(earned, earned>0 ? `Viết đẹp lắm! (${Math.round(pct*100)}%)` : 'Thử lại nhé!');
}
