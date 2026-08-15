"use strict";
/* ============ DRAWING MODULE ============ */
const PAL = ['#FF5C5C','#FB923C','#FACC15','#84CC16','#22C55E','#38BDF8',
             '#2563EB','#8B5CF6','#EC4899','#92400E','#27272A','#9CA3AF'];
const STAMPS = ['⭐','❤️','🌈','🦄','⚽','🌸','🚀','🐱'];
let dReady=false, dColor=PAL[0], dSize=6, dMode='pen', dBrush='pen', dStamp=STAMPS[0], cColor=PAL[0], cSize=16;
const freeHist = makeHistory(()=>$('#draw-canvas'), ()=>{ const c=$('#draw-canvas'); return c&&c.getContext('2d'); },
  (cv,c)=>{ c.save(); c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,cv.width,cv.height); c.restore(); });
const colorHist = makeHistory(()=>$('#color-paint'), ()=>{ const c=$('#color-paint'); return c&&c.getContext('2d'); },
  (cv,c)=>{ c.fillStyle='#fff'; c.fillRect(0,0,CW,CH); });
function initDraw(){
  if(!dReady){
    const palEl = $('#draw-palette');
    PAL.forEach((c,i)=>{
      const s=document.createElement('button');
      s.className='swatch'+(i===0?' on':''); s.style.background=c;
      s.onclick=()=>{ dColor=c; dMode='pen'; syncTools();
        $$('#draw-palette .swatch').forEach(x=>x.classList.remove('on')); s.classList.add('on'); };
      palEl.appendChild(s);
    });
    const rb=document.createElement('button');
    rb.className='swatch rainbow';
    rb.onclick=()=>{ dColor='rainbow'; dMode='pen'; syncTools();
      $$('#draw-palette .swatch').forEach(x=>x.classList.remove('on')); rb.classList.add('on'); };
    palEl.appendChild(rb);
    const cPalEl = $('#color-palette');
    PAL.forEach((c,i)=>{
      const s=document.createElement('button');
      s.className='swatch'+(i===0?' on':''); s.style.background=c;
      s.onclick=()=>{ cColor=c;
        $$('#color-palette .swatch').forEach(x=>x.classList.remove('on')); s.classList.add('on'); };
      cPalEl.appendChild(s);
    });
    const stampRow=$('#stamp-row');
    STAMPS.forEach((st,i)=>{
      const b=document.createElement('button');
      b.className='stamp-btn'+(i===0?' on':''); b.textContent=st;
      b.onclick=()=>{ dStamp=st; dMode='stamp'; syncTools();
        $$('.stamp-btn').forEach(x=>x.classList.remove('on')); b.classList.add('on'); };
      stampRow.appendChild(b);
    });
    // chỉ nút cỡ của tab Vẽ tự do ([data-size]) — '.size-btn' trần quét luôn 3 nút [data-csize] của tab Tô màu
    $$('.size-btn[data-size]').forEach(b=>b.onclick=()=>{
      dSize=+b.dataset.size;
      $$('.size-btn[data-size]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    });
    $$('#draw-brushes [data-brush]').forEach(b=>b.onclick=()=>{
      dBrush=b.dataset.brush; if(dMode==='eraser'||dMode==='stamp'){ dMode='pen'; syncTools(); }
      $$('#draw-brushes [data-brush]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
    });
    $('#d-eraser').onclick=()=>{ dMode = dMode==='eraser'?'pen':'eraser'; syncTools(); };
    $('#d-stamp').onclick=()=>{ dMode = dMode==='stamp'?'pen':'stamp'; syncTools(); };
    $('#d-undo').onclick=()=>{ if(freeHist.undo()) sndPop(); };
    $('#d-clear').onclick=()=>{
      const cv=$('#draw-canvas'), r=cv.parentElement.getBoundingClientRect();
      cv.getContext('2d').clearRect(0,0,r.width,r.height);
      freeHist.push({t:'c'}); // xoá hết cũng là 1 hành động — undo lấy lại được tranh
    };
    $('#d-save').onclick=saveArt;
    $('#d-gallery').onclick=openGallery;
    $('#gal-close').onclick=()=>$('#gallery-modal').classList.remove('show');
    const cv=$('#draw-canvas');
    bindDraw(cv, cv.getContext('2d'),
      ()=>({mode:dMode, brush:dBrush, color:dColor, size:dMode==='eraser'?dSize*2.5:dSize, stamp:dStamp}),
      ()=>{}, undefined, freeHist);
    $('#tab-free').onclick=()=>switchDrawTab(true);
    $('#tab-color').onclick=()=>switchDrawTab(false);
    const picsEl=$('#color-pics');
    PIC_META.forEach((p,i)=>{
      const b=document.createElement('button');
      b.className='btn'+(i===0?' on':''); b.textContent=`${p.em} ${p.nm}`;
      b.onclick=()=>{
        loadPic(i);
        $$('#color-pics .btn').forEach(x=>x.classList.remove('on')); b.classList.add('on');
      };
      picsEl.appendChild(b);
    });
    dReady=true;
  }
  requestAnimationFrame(rescaleFreeDraw);
}
/* resize/hiện lại canvas vẽ tự do: chụp tranh cũ → scale vào kích thước mới → rebase history
   (dùng chung cho resize handler + initDraw + switchDrawTab — trước đây tab ẩn khi xoay là mất tranh) */
function rescaleFreeDraw(){
  const cv=$('#draw-canvas');
  if(!cv) return;
  const old=document.createElement('canvas');
  old.width=cv.width; old.height=cv.height;
  if(old.width && old.height) old.getContext('2d').drawImage(cv,0,0);
  if(sizeCanvas(cv)){
    if(old.width && old.height){
      const c=cv.getContext('2d');
      c.save(); c.setTransform(1,0,0,1,0,0);
      c.drawImage(old, 0,0, cv.width, cv.height);
      c.restore();
    }
    freeHist.rebase(); // tranh hiện tại thành nền — undo/auto-bake không xoá trắng nữa
  }
}
function syncTools(){
  $('#d-eraser').classList.toggle('on', dMode==='eraser');
  $('#d-stamp').classList.toggle('on', dMode==='stamp');
  $('#stamp-row').classList.toggle('show', dMode==='stamp');
}
function switchDrawTab(free){
  $('#tab-free').classList.toggle('on',free);
  $('#tab-color').classList.toggle('on',!free);
  $('#draw-free').style.display = free?'flex':'none';
  $('#draw-color').style.display = free?'none':'flex';
  if(free) requestAnimationFrame(rescaleFreeDraw);
  else initColor();
}
function saveToGallery(canvas, withWhiteBg, onSaved){
  const out=document.createElement('canvas');
  out.width=canvas.width; out.height=canvas.height;
  const octx=out.getContext('2d');
  if(withWhiteBg){ octx.fillStyle='#fff'; octx.fillRect(0,0,out.width,out.height); }
  octx.drawImage(canvas,0,0);
  let gal = safeParse('bhv_gallery', [], Array.isArray);
  const data = out.toDataURL('image/jpeg',0.7);
  gal.push(data);
  const overwrote = gal.length>6;
  while(gal.length>6) gal.shift(); // ponytail: cap 6 tranh tránh vượt quota localStorage
  // quota vẫn đầy sau 1 lần shift (key khác chiếm chỗ) không được ném lỗi im lặng — bé bấm 💾 phải luôn có phản hồi
  let saved=false;
  while(true){
    try{ localStorage.setItem('bhv_gallery', JSON.stringify(gal)); saved=true; break; }
    catch(e){ if(gal.length<=1) break; gal.shift(); } // KHÔNG shift tranh mới (phần tử cuối) — thà báo đầy còn hơn lưu album rỗng mà vẫn khen 'Đã lưu'
  }
  if(!saved){ sndBad(); speak('Bộ nhớ đầy rồi, không lưu được tranh bé ơi!'); return; }
  // magic moment: tranh nhảy múa rồi bay lên trời
  const fly=document.createElement('img');
  fly.src=data; fly.className='fly-art';
  document.body.appendChild(fly);
  setTimeout(()=>fly.remove(), 2600);
  confetti(); sndWin();
  if(onSaved) onSaved(); // reveal tự nói câu khen riêng — không đọc chồng câu "Đã lưu"
  else speak(overwrote ? 'Album đầy rồi, tranh cũ nhất sẽ được thay nhé!' : 'Đã lưu tranh của bé! Đẹp lắm!');
}
/* ==== reveal: ảnh THẬT "sống" (ken-burns) của thứ bé vừa tô — bé thấy con vật/đồ vật thật ==== */
function showPicReveal(i){
  const m=PIC_META[i]; if(!m) return;
  const img=$('#pr-img'), emo=$('#pr-emoji');
  const file = m.key && IMG_MAN && IMG_MAN[m.key];
  // emoji hiện trước, ảnh chỉ hiện KHI decode xong — không flash ảnh của tranh lưu lần trước
  img.style.display='none'; emo.style.display='flex'; emo.textContent=m.em;
  if(file){
    img.onload=()=>{ img.style.display='block'; emo.style.display='none'; };
    img.onerror=()=>{ img.style.display='none'; emo.style.display='flex'; };
    img.src='assets/images/en/'+file;
  }
  $('#pr-title').innerHTML=`${m.em} ${m.nm}<br><span class="pr-en">Tiếng Anh: ${m.en}</span>`;
  $('#pic-reveal').classList.add('show');
  const gen=uiGen;
  speakAsync(`Bé tô xong bức tranh ${m.nm} rồi! Đẹp tuyệt vời!`)
    .then(()=>{ if(gen===uiGen && $('#pic-reveal').classList.contains('show')) speak(m.en,'en-US'); });
}
function saveArt(){ saveToGallery($('#draw-canvas'), true); }
function openGallery(){
  const gal = safeParse('bhv_gallery', [], Array.isArray);
  const grid=$('#gallery-grid');
  grid.innerHTML = gal.length?'':'<div style="padding:20px;font-size:18px">Chưa có tranh nào — bé vẽ rồi bấm 💾 nhé!</div>';
  gal.forEach((src,i)=>{
    const d=document.createElement('div');
    d.className='gal-item';
    d.innerHTML=`<img src="${src}"><button class="gal-del">✖</button>`;
    d.querySelector('.gal-del').onclick=function(){
      confirmTap(this, 'Bấm lần nữa để xoá nhé!', ()=>{
        gal.splice(i,1); localStorage.setItem('bhv_gallery', JSON.stringify(gal)); openGallery();
      });
    };
    grid.appendChild(d);
  });
  $('#gallery-modal').classList.add('show');
}

/* ==== coloring: canvas 2 lớp — bé tô bằng bút (Pencil/tay), màu nằm DƯỚI nét tranh ==== */
const CW=1200, CH=900; // độ phân giải cố định → xoay màn hình không mất tranh
let colorInit=false, colorTool='brush';
let lineMask=null; // alpha nét tranh, tính 1 lần mỗi bức — flood fill khỏi getImageData lớp line mỗi lần bấm
function fitColorWrap(){
  const stage=$('#color-stage'), wrap=$('#color-wrap');
  const w=stage.clientWidth-24, h=stage.clientHeight-24;
  const k=Math.max(1, Math.min(w/4, h/3));
  wrap.style.width=(k*4)+'px'; wrap.style.height=(k*3)+'px';
}
function initColor(){
  requestAnimationFrame(fitColorWrap);
  if(colorInit){ return; }
  colorInit=true;
  const paint=$('#color-paint'), line=$('#color-line');
  paint.width=CW; paint.height=CH; line.width=CW; line.height=CH;
  const pctx=paint.getContext('2d');
  bindDraw(paint, pctx,
    ()=>({
      mode: colorTool==='bucket' ? 'bucket' : 'pen',
      brush: 'pen',
      color: colorTool==='eraser' ? '#FFFFFF' : cColor,
      size: colorTool==='eraser' ? cSize*2 : cSize,
      bucket: p=>{
        if(floodFill(paint, line, p[0], p[1], cColor))
          colorHist.push({t:'f', x:p[0], y:p[1], color:cColor});
        sndPop();
      }
    }),
    ()=>{},
    ()=>CW/paint.getBoundingClientRect().width,
    colorHist);
  const setTool=t=>{
    colorTool=t;
    $('#c-brush').classList.toggle('on',t==='brush');
    $('#c-bucket').classList.toggle('on',t==='bucket');
    $('#c-eraser').classList.toggle('on',t==='eraser');
  };
  $('#c-brush').onclick=()=>setTool('brush');
  $('#c-bucket').onclick=()=>setTool('bucket');
  $('#c-eraser').onclick=()=>setTool('eraser');
  $('#c-undo').onclick=()=>{ if(colorHist.undo()) sndPop(); };
  $$('#scr-draw [data-csize]').forEach(b=>b.onclick=()=>{
    cSize=+b.dataset.csize;
    $$('#scr-draw [data-csize]').forEach(x=>x.classList.remove('on')); b.classList.add('on');
  });
  $('#c-save').onclick=()=>{
    // chưa tô nét nào mà bấm 💾: đừng khen 'tô xong đẹp tuyệt vời' + đừng cho tranh trắng chiếm slot album
    if(!colorHist.len()){ sndBad(); speak('Bé tô màu trước rồi lưu nhé!'); return; }
    const out=document.createElement('canvas');
    out.width=CW; out.height=CH;
    const octx=out.getContext('2d');
    octx.drawImage(paint,0,0); octx.drawImage(line,0,0);
    saveToGallery(out, false, ()=>showPicReveal(curPic));
  };
  const closeReveal=()=>{ $('#pic-reveal').classList.remove('show'); stopSpeak(); };
  $('#pr-close').onclick=closeReveal;
  $('#pic-reveal').onclick=e=>{ if(e.target.id==='pic-reveal') closeReveal(); };
  loadPic(0);
}
let picGen=0; // token chống race: onload của tranh cũ (decode chậm) không được vẽ đè tranh mới
let curPic=0; // tranh đang tô — dùng cho reveal ảnh thật khi lưu
function loadPic(i){
  curPic=i;
  const paint=$('#color-paint'), line=$('#color-line');
  const pctx=paint.getContext('2d'), lctx=line.getContext('2d');
  pctx.fillStyle='#fff'; pctx.fillRect(0,0,CW,CH);
  lctx.clearRect(0,0,CW,CH);
  // xmlns + width/height bắt buộc để SVG render được qua <img>
  const svg = PICS[i]
    .replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" ')
    .replaceAll('fill="#fff"','fill="none"');
  lineMask=null;
  colorHist.reset();
  const g = ++picGen;
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  img.onload = ()=>{
    URL.revokeObjectURL(url);
    if(g!==picGen) return; // đã chọn tranh khác trong lúc decode
    lctx.drawImage(img,0,0,CW,CH);
    const ld = lctx.getImageData(0,0,CW,CH).data;
    lineMask = new Uint8Array(CW*CH);
    for(let i=0;i<CW*CH;i++) lineMask[i] = ld[i*4+3]>60 ? 1 : 0;
  };
  img.onerror = ()=>{ // không được fail im lặng: lineMask=null làm xô màu chết câm
    URL.revokeObjectURL(url);
    if(g===picGen) speak('Tranh bị lỗi, bé chọn tranh khác nhé!');
  };
  img.src = url;
}
function hexRGB(hex){
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
let ffSeen=null, ffStack=null; // ~2.3MB buffer tái dùng giữa các lần đổ màu — khỏi cấp phát mỗi tap
function floodFillData(bd, x, y, hex){
  // bản pure trên ImageData — undo replay dùng chung 1 buffer, khỏi get/putImageData mỗi fill
  x=Math.round(x); y=Math.round(y);
  if(x<0||y<0||x>=CW||y>=CH) return false;
  if(!lineMask) return false; // tranh chưa load xong
  const d=bd.data;
  const [tr,tg,tb]=hexRGB(hex);
  const p0=y*CW+x;
  if(lineMask[p0]) return false; // bấm trúng nét tranh
  const i0=p0*4;
  const sr=d[i0], sg=d[i0+1], sb=d[i0+2];
  if(Math.abs(sr-tr)+Math.abs(sg-tg)+Math.abs(sb-tb)<12) return false;
  const TOL=140, N=CW*CH;
  if(!ffSeen){ ffSeen=new Uint8Array(N); ffStack=new Int32Array(N); }
  const seen=ffSeen, stack=ffStack;
  seen.fill(0);
  // đánh dấu seen ngay khi push → mỗi pixel vào stack tối đa 1 lần, stack không bao giờ vượt CW*CH
  let sp=0; seen[p0]=1; stack[sp++]=p0;
  while(sp){
    const pi=stack[--sp];
    if(lineMask[pi]) continue; // nét tranh là tường chắn
    const q=pi*4;
    if(Math.abs(d[q]-sr)+Math.abs(d[q+1]-sg)+Math.abs(d[q+2]-sb)>TOL) continue;
    d[q]=tr; d[q+1]=tg; d[q+2]=tb; d[q+3]=255;
    const px=pi%CW;
    if(px<CW-1 && !seen[pi+1]){ seen[pi+1]=1; stack[sp++]=pi+1; }
    if(px>0    && !seen[pi-1]){ seen[pi-1]=1; stack[sp++]=pi-1; }
    if(pi+CW<N && !seen[pi+CW]){ seen[pi+CW]=1; stack[sp++]=pi+CW; }
    if(pi>=CW  && !seen[pi-CW]){ seen[pi-CW]=1; stack[sp++]=pi-CW; }
  }
  return true;
}
function floodFill(paint, line, x, y, hex){
  const pctx=paint.getContext('2d');
  const bd=pctx.getImageData(0,0,CW,CH);
  if(!floodFillData(bd, x, y, hex)) return false;
  pctx.putImageData(bd,0,0);
  return true;
}
