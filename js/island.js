"use strict";
/* ============ ĐẢO STICKER 3D (Three.js r128 bundle local — chỉ khu thưởng, học vẫn 2D) ============
   Sticker bé mở khoá "mọc" lên đảo low-poly, xoay bằng tay, chạm sticker để nghe tên.
   Render loop chỉ chạy khi màn đảo đang mở (tự dừng khi rời màn — không tốn pin). */

let islReady=false, islRunning=false, islFail=false;
let islScene, islCam, islRenderer, islGroup, islClouds, islWater;
let islSprites=[], islVel=0, islLastTouch=0, islW=0, islH=0;

function emojiTexture(em, gold){
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d');
  if(gold){ // sticker vàng có quầng sáng
    const g=x.createRadialGradient(64,64,10,64,64,62);
    g.addColorStop(0,'rgba(255,215,80,.95)'); g.addColorStop(1,'rgba(255,215,80,0)');
    x.fillStyle=g; x.beginPath(); x.arc(64,64,62,0,7); x.fill();
  }
  x.font='92px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  x.textAlign='center'; x.textBaseline='middle';
  x.fillText(em,64,70);
  return new THREE.CanvasTexture(c);
}
function islMesh(geo, color, x, y, z, parent){
  const m=new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color}));
  m.position.set(x,y,z); (parent||islGroup).add(m); return m;
}
function buildIsland(){
  islScene=new THREE.Scene();
  islScene.background=new THREE.Color(0x9BDDFF);
  islScene.fog=new THREE.Fog(0x9BDDFF,20,45);
  islCam=new THREE.PerspectiveCamera(45,1,0.1,100);
  islCam.position.set(0,5.5,11); islCam.lookAt(0,0.8,0);
  islScene.add(new THREE.AmbientLight(0xffffff,0.75));
  const sun=new THREE.DirectionalLight(0xFFF2CC,0.8); sun.position.set(5,10,4); islScene.add(sun);
  islWater=islMesh(new THREE.CylinderGeometry(16,16,0.4,48),0x38BDF8,0,-0.5,0,islScene);
  islGroup=new THREE.Group(); islScene.add(islGroup);
  islMesh(new THREE.CylinderGeometry(5.2,6,0.8,32),0xFDE68A,0,0,0);        // bãi cát
  islMesh(new THREE.CylinderGeometry(4.4,5,0.7,32),0x4ADE80,0,0.7,0);      // thảm cỏ
  islMesh(new THREE.ConeGeometry(2,2.6,10),0x8B5E3C,-2,2.3,-1.6);          // núi
  islMesh(new THREE.ConeGeometry(0.75,0.9,10),0xFFFFFF,-2,3.55,-1.6);      // tuyết đỉnh núi
  [[2.6,-0.3],[3.2,1.7]].forEach(([px,pz])=>{                              // 2 cây dừa
    islMesh(new THREE.CylinderGeometry(0.14,0.22,1.8,8),0xA16207,px,1.9,pz);
    islMesh(new THREE.SphereGeometry(0.78,10,8),0x16A34A,px,2.85,pz).scale.set(1,0.55,1);
    islMesh(new THREE.SphereGeometry(0.22,8,6),0x92400E,px+0.35,2.6,pz);   // quả dừa
  });
  islClouds=new THREE.Group(); islScene.add(islClouds);
  [[7,4.8,0],[-5,5.6,4],[0,5.2,-7]].forEach(([px,py,pz])=>{
    const cl=new THREE.Group();
    [[0,0,0,0.7],[0.6,0.1,0,0.5],[-0.6,0.08,0,0.5]].forEach(([ox,oy,oz,r])=>
      islMesh(new THREE.SphereGeometry(r,8,6),0xFFFFFF,ox,oy,oz,cl));
    cl.position.set(px,py,pz); islClouds.add(cl);
  });
}
/* sticker mở khoá mọc trên cỏ theo vòng xoắn; bộ vàng bay thành vòng quanh đỉnh núi */
function refreshIslandStickers(nowMs){
  islSprites.forEach(s=>{ islGroup.remove(s); s.material.map.dispose(); s.material.dispose(); });
  islSprites=[];
  const put=(s,i,gold)=>{
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:emojiTexture(s.em,gold),transparent:true}));
    const a=gold ? i*(Math.PI*2/Math.max(6,goldCount())) : i*2.4;
    const r=gold ? 2.2 : 1.3+(i%3)*1.05;
    sp.position.set(Math.cos(a)*r+(gold?-2:0), gold?4.4+(i%2)*0.5:1.5, Math.sin(a)*r+(gold?-1.6:0));
    sp.userData={born:nowMs+i*120, nm:s.nm};       // mọc so le cho vui mắt
    sp.scale.set(0.001,0.001,1);
    islGroup.add(sp); islSprites.push(sp);
  };
  STICKERS.slice(0,unlockedCount()).forEach((s,i)=>put(s,i,false));
  STICKERS.slice(0,goldCount()).forEach((s,i)=>put(s,i,true));
}
function islResize(){
  const cv=islRenderer.domElement;
  const w=cv.clientWidth, h=cv.clientHeight;
  if(!w || !h || (w===islW && h===islH)) return;
  islW=w; islH=h;
  islRenderer.setSize(w,h,false);
  islCam.aspect=w/h; islCam.updateProjectionMatrix();
}
function easeOutBack(k){ const c1=1.70158,c3=c1+1; return 1+c3*Math.pow(k-1,3)+c1*Math.pow(k-1,2); }
function islTick(t){
  if(!$('#scr-island').classList.contains('active')){ islRunning=false; return; }
  requestAnimationFrame(islTick);
  islResize();
  islGroup.rotation.y += islVel; islVel*=0.94;                 // quán tính sau khi vuốt
  if(performance.now()-islLastTouch>3000) islGroup.rotation.y += 0.0025; // tự xoay khi bé không chạm
  islClouds.rotation.y -= 0.0008;
  islGroup.position.y = Math.sin(t*0.0011)*0.07;               // đảo bồng bềnh
  islWater.position.y = -0.5+Math.sin(t*0.0014)*0.05;
  islSprites.forEach(sp=>{
    const k=Math.min(1,Math.max(0,(t-sp.userData.born)/500));
    const s=0.95*easeOutBack(k);
    sp.scale.set(Math.max(0.001,s),Math.max(0.001,s),1);
  });
  islRenderer.render(islScene,islCam);
}
function islBindInput(cv){
  let down=null, lastX=0;
  // iOS Safari có thể kill WebGL context khi PWA vào background — preventDefault để cho phép restore
  cv.addEventListener('webglcontextlost',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{
    e.preventDefault();
    if(down) return; // ngón thứ 2 / lòng bàn tay không được cướp quyền xoay
    down={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};
    lastX=e.clientX; islLastTouch=performance.now();
    try{ cv.setPointerCapture(e.pointerId); }catch(err){}
  });
  cv.addEventListener('pointermove',e=>{
    if(!down || e.pointerId!==down.id) return;
    islLastTouch=performance.now();
    islVel = (e.clientX-lastX)*0.004;
    islGroup.rotation.y += (e.clientX-lastX)*0.006;
    lastX=e.clientX;
  });
  const up=e=>{
    if(!down || e.pointerId!==down.id) return;
    const dt=performance.now()-down.t, dist=Math.hypot(e.clientX-down.x,e.clientY-down.y);
    if(dt<400 && dist<8){                                       // chạm (không phải vuốt) → tìm sticker
      const r=cv.getBoundingClientRect();
      const ndc=new THREE.Vector2(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      const ray=new THREE.Raycaster(); ray.setFromCamera(ndc,islCam);
      const hit=ray.intersectObjects(islSprites)[0];
      if(hit){
        hit.object.userData.born=performance.now();             // mọc lại = nảy tưng tưng
        sndPop(); speak(hit.object.userData.nm);
      }
    }
    down=null;
  };
  cv.addEventListener('pointerup',up);
  cv.addEventListener('pointercancel',()=>{ down=null; });
  cv.addEventListener('pointerleave',e=>{ if(down && e.pointerId===down.id) down=null; });
}
function enterIsland(){
  if(islFail) return;
  if(!islReady){
    try{
      if(typeof THREE==='undefined') throw new Error('three missing');
      const cv=$('#island-canvas');
      islRenderer=new THREE.WebGLRenderer({canvas:cv,antialias:true}); // không preserveDrawingBuffer — đỡ tốn pin iPad; e2e render đồng bộ trước khi đọc pixel
      islRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      buildIsland();
      islBindInput(cv);
      islReady=true;
    }catch(err){
      islFail=true;
      $('#island-wrap').innerHTML='<div class="island-fallback">😢 Máy này chưa xem được 3D.<br>Bé xem bộ sưu tập ở kệ sticker nhé!</div>';
      return;
    }
  }
  islW=0;                                                       // ép resize lại khi mở màn
  refreshIslandStickers(performance.now()+300);
  speak(unlockedCount()+goldCount()>0
    ? 'Đây là Đảo Sticker của bé! Chạm vào sticker để nghe tên nhé!'
    : 'Đảo còn trống! Bé kiếm sao đổi sticker để đảo đông vui nhé!');
  if(!islRunning){ islRunning=true; requestAnimationFrame(islTick); }
}
$('#btn-island').addEventListener('click',()=>{ ensureAC(); showScreen('scr-island'); });
