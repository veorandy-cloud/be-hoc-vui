"use strict";
/* ============ WRITING ============ */
let wCanvas, wCtx, wStrokes=[], wSet='low', wIdx=0, wReady=false, wPen='#FF5C5C', wNib='pen';
/* Phase 3 — 3 mức như LetterSchool: 👀 demo nét chạy · 🔢 đồ từng nét có chấm · ✍️ tự viết (chấm coverage) */
let wMode='guide', gStroke=0, strokeFails=0, gFailsTotal=0, wAnim=0, wResized=false;
const NUMVI=['một','hai','ba','bốn','năm'];
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
      pts=>{ wStrokes.push(pts); if(wMode==='guide') guideCheck(pts); }, undefined, wHist);
    $$('#write-modes [data-wmode]').forEach(b=>b.onclick=()=>{
      wMode=b.dataset.wmode;
      $$('#write-modes [data-wmode]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
      $('#w-grade').style.display = wMode==='free' ? '' : 'none';
      resetWrite();
    });
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
    $('#w-grade').style.display = wMode==='free' ? '' : 'none'; // chấm coverage chỉ có nghĩa ở chế độ Tự viết
    $('#write-word').onclick = ()=>{ const {ex}=charInfo(); speak(ex.w); };
    // CHỈ nút có data-set — nút chế độ (#write-modes) cũng mang class .tab, không được bắt nhầm
    $$('#scr-write [data-set]').forEach(b=>b.onclick=()=>{
      wSet=b.dataset.set; wIdx=0;
      $$('#scr-write [data-set]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
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
function drawGrid(r){
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
}
/* nét chữ (STROKES khung cao 100, x giữa 0) → toạ độ canvas, cùng cỡ với template font */
function glyphStrokes(){
  const g = typeof STROKES!=='undefined' && STROKES[curChar()];
  if(!g) return null;
  const r = wCanvas.parentElement.getBoundingClientRect();
  const k = (r.height*0.62)/100;
  const yTop = (r.height - 100*k)/2;
  return { k, strokes: g.map(s=>s.map(([x,y])=>[r.width/2 + x*k, yTop + y*k])) };
}
function drawPoly(pts, color, width, dash){
  wCtx.save();
  wCtx.strokeStyle=color; wCtx.lineWidth=width;
  wCtx.lineCap='round'; wCtx.lineJoin='round';
  wCtx.setLineDash(dash||[]);
  wCtx.beginPath();
  pts.forEach((p,i)=> i? wCtx.lineTo(p[0],p[1]) : wCtx.moveTo(p[0],p[1]));
  wCtx.stroke(); wCtx.restore();
}
function drawSkeleton(done, cur){
  // done: số nét đã hoàn thành (vẽ xanh); cur: nét đang tập (vẽ đậm + chấm số)
  const g = glyphStrokes(); if(!g) return;
  g.strokes.forEach((s,i)=>{
    if(i<done) drawPoly(s, '#22C55E', Math.max(6,g.k*5));
    else if(i===cur) drawPoly(s, '#93C5FD', Math.max(6,g.k*5), [10,8]);
    else drawPoly(s, '#E3E3EE', Math.max(5,g.k*4), [8,8]);
  });
  // chỉ đánh số nét ĐANG tập — hiện hết thì các badge chồng nhau (nét sau hay bắt đầu nơi nét trước kết thúc)
  if(cur>=0 && g.strokes[cur]){
    const [x,y]=g.strokes[cur][0];
    wCtx.save();
    wCtx.fillStyle='#FACC15';
    wCtx.strokeStyle='#27272A'; wCtx.lineWidth=2.5;
    wCtx.beginPath(); wCtx.arc(x,y,14,0,7); wCtx.fill(); wCtx.stroke();
    wCtx.fillStyle='#27272A'; wCtx.font='800 16px "Baloo 2", sans-serif';
    wCtx.textAlign='center'; wCtx.textBaseline='middle';
    wCtx.fillText(cur+1, x, y+1);
    wCtx.restore();
  }
}
function drawTemplate(){
  const {ex}=charInfo();
  $('#write-letter').textContent = curChar();
  $('#write-word').innerHTML = `<div class="em">${ex.em}</div><div class="wd">${ex.w}</div>`;
  const best = writeBest[charKey()]||0;
  $('#write-best').textContent = best?`Tốt nhất: ${'⭐'.repeat(best)}`:'Tốt nhất: —';
  const r = wCanvas.parentElement.getBoundingClientRect();
  wCtx.clearRect(0,0,r.width,r.height);
  drawGrid(r);
  if(wMode!=='free' && glyphStrokes()){
    drawSkeleton(wMode==='guide'?gStroke:0, wMode==='guide'?gStroke:-1);
    return;
  }
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
  wAnim++; gStroke=0; strokeFails=0; gFailsTotal=0;
  redrawWrite();
  const {name}=charInfo();
  const full = `${wSet==='num'?'số':'chữ'} ${name}${wSet==='up'?' hoa':''}`;
  if(wMode==='demo' && glyphStrokes()){ speak('Bé xem cô viết mẫu nhé!'); playDemo(); }
  else if(wMode==='guide' && glyphStrokes()){
    // chữ bé CHƯA từng viết đạt: cô viết mẫu 1 lượt trước rồi mới mời đồ (flow LetterSchool)
    if(!writeBest[charKey()]){
      speak('Bé xem cô viết mẫu nhé!');
      playDemo(null, ()=>{ redrawWrite(); speak('Bé vẽ nét số một nhé!'); });
    } else speak('Bé vẽ nét số một nhé!');
  }
  else speak(`Bé hãy viết ${full} nhé!`);
}
/* 👀 demo: nét chạy tuần tự như cô viết mẫu */
function playDemo(strokeOnly, onDone){
  const g = glyphStrokes(); if(!g) return;
  const token = ++wAnim, gen = uiGen;
  const list = strokeOnly!=null ? [strokeOnly] : g.strokes.map((_,i)=>i);
  const speed = Math.max(3, g.k*2.2); // px mỗi frame
  let li=0;
  function runStroke(){
    if(token!==wAnim || gen!==uiGen) return;
    if(li>=list.length){ if(onDone) onDone(); return; }
    const s = g.strokes[list[li]];
    let seg=0, t=0;
    function frame(){
      if(token!==wAnim || gen!==uiGen) return;
      let step=speed;
      while(step>0 && seg<s.length-1){
        const [x1,y1]=s[seg], [x2,y2]=s[seg+1];
        const len=Math.hypot(x2-x1,y2-y1)||1;
        const remain=(1-t)*len;
        const adv=Math.min(step, remain);
        const t2=t+adv/len;
        drawPoly([[x1+(x2-x1)*t,y1+(y2-y1)*t],[x1+(x2-x1)*t2,y1+(y2-y1)*t2]], '#FF5C5C', Math.max(7,g.k*6));
        t=t2; step-=adv;
        if(t>=0.999){ seg++; t=0; }
      }
      if(seg<s.length-1) requestAnimationFrame(frame);
      else{ sndPop(); li++; setTimeout(runStroke, 350); }
    }
    frame();
  }
  runStroke();
}
/* 🔢 chấm từng nét: resample theo chiều dài cung rồi so khoảng cách trung bình */
function resample(pts, n){
  if(!pts || !pts.length) return Array.from({length:n}, ()=>[0,0]);
  if(pts.length===1) return Array(n).fill(pts[0]);
  const d=[0]; let total=0;
  for(let i=1;i<pts.length;i++){ total+=Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); d.push(total); }
  if(total===0) return Array(n).fill(pts[0]);
  const out=[]; let j=0;
  for(let i=0;i<n;i++){
    const target=total*i/(n-1);
    while(j<d.length-2 && d[j+1]<target) j++;
    const span=d[j+1]-d[j]||1;
    const t=(target-d[j])/span;
    out.push([pts[j][0]+(pts[j+1][0]-pts[j][0])*t, pts[j][1]+(pts[j+1][1]-pts[j][1])*t]);
  }
  return out;
}
function strokeDist(a, b){
  const n=24, ra=resample(a,n), rb=resample(b,n);
  let sum=0;
  for(let i=0;i<n;i++) sum+=Math.hypot(ra[i][0]-rb[i][0], ra[i][1]-rb[i][1]);
  return sum/n;
}
function polyLen(pts){
  let l=0;
  for(let i=1;i<pts.length;i++) l+=Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]);
  return l;
}
function guideCheck(pts){
  const g = glyphStrokes(); if(!g || gStroke>=g.strokes.length) return;
  if(wResized){ wResized=false; if(wHist.undo()) wStrokes.pop(); return; } // nét vẽ xuyên lúc xoay màn: bỏ qua, không phạt
  const target = g.strokes[gStroke];
  const tlen = polyLen(target);
  if(!pts || pts.length<2){
    // chạm 1 điểm: với nét NGẮN (dấu chấm chữ i/j) đó là cử chỉ đúng — biến thành nét tí hon để chấm
    if(!pts || !pts.length || tlen > g.k*8){ if(wHist.undo()) wStrokes.pop(); return; }
    pts = [pts[0], [pts[0][0]+0.1, pts[0][1]+0.1]];
  }
  // threshold theo độ dài nét: nét chấm 6px không được hưởng ngưỡng 34px của nét dài
  const thr = Math.max(14, Math.min(g.k*11, tlen*0.8 + g.k*2));
  const fwd = strokeDist(pts, target);
  const rev = strokeDist(pts, [...target].reverse());
  // nét dài phải viết ĐÚNG CHIỀU (trọng tâm của dạy thứ tự nét); nét ngắn (chấm, ngang bé) miễn
  const dist = tlen > g.k*20 ? fwd : Math.min(fwd, rev);
  if(dist < thr){
    gStroke++;
    wStrokes=[]; wHist.reset(); drawTemplate(); // "snap": thay nét run tay bằng nét chuẩn màu xanh
    if(gStroke >= g.strokes.length){
      const earned = gFailsTotal<=1?3 : gFailsTotal<=3?2 : 1;
      // chống farm: viết lại chữ đã đạt điểm bằng/thấp hơn best chỉ ăn tối đa 1⭐ (vẫn khuyến khích ôn, hết cày 7⭐/phút)
      const award = earned > (writeBest[charKey()]||0) ? earned : Math.min(1, earned);
      if(earned > (writeBest[charKey()]||0)){
        writeBest[charKey()]=earned;
        localStorage.setItem('bhv_write', JSON.stringify(writeBest));
      }
      ovCallback = ()=>{ wIdx=(wIdx+1)%WRITE_SETS[wSet].length; resetWrite(); };
      if(questActive!==null) ovCallback = (curChar()===STATIONS[questActive].ch) ? questComplete : resetWrite;
      showResult(award, 'Bé viết đúng thứ tự nét!');
    }else{
      sndGood(); strokeFails=0;
      speak(`Bé vẽ nét số ${NUMVI[gStroke]||gStroke+1} nhé!`);
    }
  }else{
    // đúng dáng nhưng NGƯỢC CHIỀU (vd sổ từ dưới lên): nhắc đặt bút ở badge vàng, không phạt
    if(tlen > g.k*20 && rev < thr){
      if(wHist.undo()) wStrokes.pop();
      speak('Bé đặt bút ở chấm vàng nhé!');
      return;
    }
    // nét DÀI (khuyết trên ~400px) mà bé vẽ đúng hướng nhưng nhấc tay giữa chừng: không phạt, nhắc vẽ một hơi
    if(tlen > g.k*60){
      const frac = Math.min(1, polyLen(pts)/tlen);
      if(frac>0.3 && frac<0.9){
        const part = resample(target, 24).slice(0, Math.max(2, Math.round(24*frac)));
        if(Math.min(strokeDist(pts, part), strokeDist(pts, [...part].reverse())) < thr){
          if(wHist.undo()) wStrokes.pop();
          speak('Gần đúng rồi! Bé vẽ cả nét một hơi nhé!');
          return;
        }
      }
    }
    gFailsTotal++; strokeFails++;
    if(wHist.undo()) wStrokes.pop(); // xoá nét sai của bé
    sndBad();
    speak('Chưa đúng nét, bé thử lại nhé!');
    if(strokeFails>=2){ playDemo(gStroke); strokeFails=0; } // sai 2 lần → cô vẽ mẫu đúng nét đó
  }
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
  const award = earned > (writeBest[charKey()]||0) ? earned : Math.min(1, earned); // chống farm như guide mode
  if(earned > (writeBest[charKey()]||0)){
    writeBest[charKey()]=earned;
    localStorage.setItem('bhv_write', JSON.stringify(writeBest));
  }
  ovCallback = ()=>{ wIdx=(wIdx+1)%WRITE_SETS[wSet].length; resetWrite(); };
  if(earned===0) ovCallback = resetWrite;
  // quest: phải viết ĐÚNG chữ của trạm — đổi sang chữ/số dễ hơn không được tính qua trạm
  if(questActive!==null) ovCallback = (earned>=1 && curChar()===STATIONS[questActive].ch) ? questComplete : resetWrite;
  showResult(award, earned>0 ? `Viết đẹp lắm! (${Math.round(pct*100)}%)` : 'Thử lại nhé!');
}
