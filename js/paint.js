"use strict";
/* generic pointer drawing — segment-based (rainbow, stamp, eraser, bucket)
   Apple Pencil: lực nhấn đổi độ đậm nét; đã dùng bút thì bỏ qua chạm tay (chống tì lòng bàn tay) */
let penSeen=false;

/* ==== UNDO: lưu hành động dạng vector (nét/dấu/đổ màu), vẽ lại từ nền + danh sách hành động.
   Quá 40 hành động thì "nướng" 15 cái cũ nhất vào nền ImageData để replay không dài vô hạn. ==== */
function makeHistory(getCv, getCtx, baseDraw){
  let acts=[], base=null;
  function paintBase(){
    const cv=getCv(), ctx=getCtx();
    if(!cv || !ctx) return;
    if(base){
      ctx.save(); ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,cv.width,cv.height); ctx.putImageData(base,0,0);
      ctx.restore();
    } else baseDraw(cv, ctx);
  }
  function replayAll(){
    paintBase();
    const cv=getCv(), ctx=getCtx();
    // batch các action đổ màu liên tiếp trên CÙNG một ImageData: N fill từ N×(get+put) xuống 1×(get+put)
    let bd=null;
    const flush=()=>{ if(bd){ ctx.putImageData(bd,0,0); bd=null; } };
    acts.forEach(a=>{
      if(a.t==='f'){
        if(!bd) bd=ctx.getImageData(0,0,cv.width,cv.height);
        floodFillData(bd, a.x, a.y, a.color);
        return;
      }
      flush();
      replayAct(cv,ctx,a);
    });
    flush();
  }
  return {
    push(a){
      acts.push(a);
      const fills = acts.reduce((n,x)=>n+(x.t==='f'?1:0), 0);
      // fill nặng hơn nét thường khi replay → nướng nền sớm hơn nếu nhiều fill
      if(acts.length>40 || fills>6){
        const cut = Math.max(1, acts.length-10);
        const keep=acts.slice(cut); acts=acts.slice(0,cut); replayAll();
        const cv=getCv(), ctx=getCtx();
        base = ctx.getImageData(0,0,cv.width,cv.height);
        acts=keep; replayAll();
      }
    },
    undo(){ if(!acts.length) return false; acts.pop(); replayAll(); return true; },
    len(){ return acts.length; }, // đã vẽ/tô gì chưa (auto-bake luôn giữ ≥10 acts nên không về 0 oan)
    reset(){ acts=[]; base=null; },
    // sau xoay màn: nhận canvas HIỆN TẠI làm nền — undo/auto-bake không xoá trắng tranh đã vẽ trước xoay
    rebase(){
      acts=[];
      const cv=getCv(), ctx=getCtx();
      if(cv && ctx && cv.width && cv.height){
        ctx.save(); ctx.setTransform(1,0,0,1,0,0);
        base = ctx.getImageData(0,0,cv.width,cv.height);
        ctx.restore();
      } else base=null;
    }
  };
}
function applyBrushCtx(ctx, brush, style, k){
  ctx.globalAlpha = brush==='marker'?0.45 : brush==='crayon'?0.75 : 1;
  if(brush==='neon'){ ctx.shadowColor=style; ctx.shadowBlur=12*(k||1); }
  else ctx.shadowBlur=0;
}
function replayAct(cv, ctx, a){
  if(a.t==='f'){ floodFill($('#color-paint'), $('#color-line'), a.x, a.y, a.color); return; }
  ctx.save();
  if(a.t==='c'){ ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height); }
  else if(a.t==='st'){
    ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; ctx.shadowBlur=0;
    ctx.font=a.font; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(a.stamp, a.x, a.y);
  }
  else if(a.t==='s'){
    ctx.globalCompositeOperation = a.mode==='eraser'?'destination-out':'source-over';
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(a.dot){
      applyBrushCtx(ctx, a.brush, a.dot.style, a.k);
      ctx.fillStyle=a.dot.style;
      ctx.beginPath(); ctx.arc(a.dot.x, a.dot.y, a.dot.w/2, 0, 7); ctx.fill();
    }
    for(const s of a.segs){
      applyBrushCtx(ctx, a.brush, s[5], a.k);
      ctx.strokeStyle=s[5]; ctx.lineWidth=s[4];
      ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(s[2],s[3]); ctx.stroke();
    }
  }
  ctx.restore();
}

function bindDraw(cv, ctx, getTool, onStroke, getScale, hist){
  let drawing=false, pts=[], prev=null, hue=0, activeId=null, rec=null;
  const scl = getScale || (()=>1);
  const pos = e => {
    const r = cv.getBoundingClientRect();
    const k = scl();
    return [(e.clientX-r.left)*k, (e.clientY-r.top)*k];
  };
  const widthFor = (tool,e) => {
    const p = (e.pointerType==='pen' && e.pressure>0) ? (0.35 + e.pressure*1.3) : 1;
    let w = tool.size * scl() * p;
    if(tool.brush==='marker') w*=1.7;
    if(tool.brush==='crayon') w*=(0.85+Math.random()*0.3); // nét nhám như sáp màu
    return w;
  };
  function styleFor(tool){
    // set lại mỗi lần: sizeCanvas giữa nét (xoay màn) reset toàn bộ ctx state → không set là đầu nét vuông 'butt'
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(tool.mode==='eraser'){
      ctx.globalCompositeOperation='destination-out'; ctx.globalAlpha=1; ctx.shadowBlur=0;
      return '#000';
    }
    ctx.globalCompositeOperation='source-over';
    let c = tool.color;
    if(c==='rainbow'){ hue=(hue+4)%360; c=`hsl(${hue},90%,55%)`; }
    applyBrushCtx(ctx, tool.brush, c, scl());
    return c;
  }
  const resetCtx = ()=>{ ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; ctx.shadowBlur=0; };
  cv.addEventListener('pointerdown', e=>{
    e.preventDefault();
    if(e.pointerType==='pen') penSeen=true;
    if(penSeen && e.pointerType==='touch') return; // palm rejection
    if(drawing) return; // ngón tay thứ hai không được cướp nét đang vẽ
    const tool=getTool();
    const p=pos(e);
    if(tool.mode==='bucket'){ tool.bucket(p); return; }
    if(tool.mode==='stamp'){
      resetCtx();
      const font = Math.round((20+tool.size*2)*scl())+'px serif'; // con dấu ăn theo cỡ bút
      ctx.font=font; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(tool.stamp, p[0], p[1]);
      if(hist) hist.push({t:'st', x:p[0], y:p[1], stamp:tool.stamp, font});
      sndPop();
      return;
    }
    drawing=true; prev=p; pts=[p]; activeId=e.pointerId;
    const st=styleFor(tool);
    const w=widthFor(tool,e);
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=st;
    ctx.beginPath(); ctx.arc(p[0],p[1],w/2,0,7); ctx.fillStyle=st; ctx.fill();
    rec={t:'s', mode:tool.mode, brush:tool.mode==='eraser'?'pen':(tool.brush||'pen'), k:scl(),
         dot:{x:p[0], y:p[1], w, style:st}, segs:[]};
    cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e=>{
    if(!drawing || e.pointerId!==activeId) return;
    e.preventDefault();
    const tool=getTool();
    const p=pos(e); pts.push(p);
    const st=styleFor(tool);
    const w=widthFor(tool,e);
    ctx.strokeStyle=st; ctx.lineWidth=w;
    ctx.beginPath(); ctx.moveTo(prev[0],prev[1]); ctx.lineTo(p[0],p[1]); ctx.stroke();
    if(rec) rec.segs.push([prev[0],prev[1],p[0],p[1],w,st]);
    prev=p;
  });
  const end = e=>{
    // chỉ pointer đang vẽ mới được kết thúc nét — lòng bàn tay nhấc lên/pointercancel không cắt nét bút
    if(!drawing || e.pointerId!==activeId) return;
    drawing=false; activeId=null;
    resetCtx();
    // push history TRƯỚC onStroke — guideCheck (tập viết từng nét) cần undo được chính nét vừa vẽ
    if(rec && hist) hist.push(rec);
    if(pts.length) onStroke(pts);
    rec=null;
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
}
