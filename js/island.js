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
  islDecorAnims.forEach(f=>f(t)); // lửa trại phập phồng, khói bay, cối xay quay
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
    if($('#nudge') && $('#nudge').classList.contains('show')){ down=null; return; } // đừng speak tên sticker đè lời nhắc nghỉ mắt
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
  refreshIslandDecor(); // đồ trang trí mở theo mốc sao (tầng thưởng 3 sau sticker vàng)
  speak(unlockedCount()+goldCount()>0
    ? 'Đây là Đảo Sticker của bé! Chạm vào sticker để nghe tên nhé!'
    : 'Đảo còn trống! Bé kiếm sao đổi sticker để đảo đông vui nhé!');
  if(!islRunning){ islRunning=true; requestAnimationFrame(islTick); }
}
$('#btn-island').addEventListener('click',()=>{ ensureAC(); showScreen('scr-island'); });

/* ============ TẦNG THƯỞNG 3: ĐỒ TRANG TRÍ ĐẢO (mốc sao tích luỹ, không tiêu sao) ============
   Paste toàn bộ khối này vào island.js (sau buildIsland). Móc nối: xem unlock_note. */

let islDecorGroup=null;
const islDecorAnims=[];

/* cost = 552 + (i+1)*25 — sticker vàng hết ở 552⭐ (24×8 + 24×15, khớp GOLD_BASE/GOLD_COST core.js), decor nối tiếp mỗi 25⭐ */
const ISL_DECOR=[
  {id:'house', nm:'Nhà gỗ', cost:577, build(p){
    islMesh(new THREE.BoxGeometry(1,0.7,0.8),0xB45309,-0.7,1.4,-4.0,p);
    islMesh(new THREE.ConeGeometry(0.85,0.55,4),0xDC2626,-0.7,2.03,-4.0,p).rotation.y=Math.PI/4;
    islMesh(new THREE.BoxGeometry(0.28,0.4,0.05),0x78350F,-0.7,1.25,-3.58,p); // cửa
  }},
  {id:'pier', nm:'Cầu tàu', cost:602, build(p){
    const g=new THREE.Group(); g.rotation.y=Math.PI/4; p.add(g);   // chĩa ra hướng 45°, tránh dừa & vườn hoa
    islMesh(new THREE.BoxGeometry(0.9,0.12,3),0xA16207,0,0.5,5.7,g);
    [4.6,5.6,6.6].forEach(z=>{
      islMesh(new THREE.CylinderGeometry(0.07,0.07,1,6),0x854D0E,-0.38,0,z,g);
      islMesh(new THREE.CylinderGeometry(0.07,0.07,1,6),0x854D0E, 0.38,0,z,g);
    });
  }},
  {id:'fire', nm:'Lửa trại', cost:627, build(p){
    const X=-3.53, Z=1.65;
    const l1=islMesh(new THREE.CylinderGeometry(0.08,0.08,0.9,6),0x854D0E,X,1.15,Z,p); l1.rotation.z=Math.PI/2;
    const l2=islMesh(new THREE.CylinderGeometry(0.08,0.08,0.9,6),0x854D0E,X,1.15,Z,p); l2.rotation.x=Math.PI/2;
    const fl=islMesh(new THREE.ConeGeometry(0.22,0.5,8),0xF97316,X,1.45,Z,p);
    islMesh(new THREE.ConeGeometry(0.11,0.3,8),0xFDE047,X,1.42,Z,p);
    const smk=[];
    for(let i=0;i<3;i++){
      const s=islMesh(new THREE.SphereGeometry(0.13,6,5),0x9CA3AF,X,1.8,Z,p);
      s.material.transparent=true; smk.push(s);
    }
    islDecorAnims.push(t=>{
      fl.scale.y=1+Math.sin(t*0.01)*0.15;                          // lửa phập phồng
      smk.forEach((s,i)=>{
        const k=(t*0.0004+i/3)%1;                                  // khói bay vòng lặp
        s.position.y=1.8+k*1.4; s.material.opacity=0.75*(1-k);
        const sc=0.6+k; s.scale.set(sc,sc,sc);
      });
    });
  }},
  {id:'boat', nm:'Thuyền nhỏ', cost:652, build(p){
    const g=new THREE.Group(); g.position.set(5.9,0,4.3); g.rotation.y=Math.PI/4; p.add(g); // neo cạnh cầu tàu
    islMesh(new THREE.BoxGeometry(1.3,0.35,0.65),0xB91C1C,0,-0.05,0,g);
    islMesh(new THREE.CylinderGeometry(0.04,0.04,1,6),0x78350F,0,0.6,0,g);
    islMesh(new THREE.BoxGeometry(0.45,0.55,0.03),0xF8FAFC,0.25,0.65,0,g); // buồm
  }},
  {id:'flag', nm:'Cột cờ', cost:677, build(p){
    islMesh(new THREE.CylinderGeometry(0.05,0.07,2.4,8),0xD1D5DB,2.05,2.25,-3.55,p);
    islMesh(new THREE.BoxGeometry(0.7,0.45,0.03),0xEF4444,2.45,3.15,-3.55,p);
    islMesh(new THREE.SphereGeometry(0.09,8,6),0xFBBF24,2.05,3.5,-3.55,p); // chóp vàng
  }},
  {id:'swing', nm:'Xích đu', cost:702, build(p){
    const g=new THREE.Group(); g.position.set(3.64,1.05,-2.1); g.rotation.y=-0.5; p.add(g);
    islMesh(new THREE.CylinderGeometry(0.06,0.06,1.5,6),0x92400E,-0.55,0.75,0,g);
    islMesh(new THREE.CylinderGeometry(0.06,0.06,1.5,6),0x92400E, 0.55,0.75,0,g);
    islMesh(new THREE.CylinderGeometry(0.05,0.05,1.2,6),0x92400E,0,1.5,0,g).rotation.z=Math.PI/2;
    islMesh(new THREE.CylinderGeometry(0.02,0.02,0.8,4),0x6B7280,-0.18,1.05,0,g);
    islMesh(new THREE.CylinderGeometry(0.02,0.02,0.8,4),0x6B7280, 0.18,1.05,0,g);
    islMesh(new THREE.BoxGeometry(0.45,0.06,0.2),0xF59E0B,0,0.62,0,g);   // ghế
  }},
  {id:'well', nm:'Giếng nước', cost:727, build(p){
    const g=new THREE.Group(); g.position.set(-1.06,1.05,3.96); p.add(g);
    islMesh(new THREE.CylinderGeometry(0.45,0.5,0.5,10),0x9CA3AF,0,0.25,0,g);
    islMesh(new THREE.CylinderGeometry(0.36,0.36,0.06,10),0x2563EB,0,0.5,0,g); // mặt nước
    islMesh(new THREE.CylinderGeometry(0.05,0.05,0.9,6),0x92400E,-0.42,0.85,0,g);
    islMesh(new THREE.CylinderGeometry(0.05,0.05,0.9,6),0x92400E, 0.42,0.85,0,g);
    islMesh(new THREE.ConeGeometry(0.7,0.4,4),0xDC2626,0,1.45,0,g).rotation.y=Math.PI/4;
  }},
  {id:'garden', nm:'Vườn hoa', cost:752, build(p){
    const g=new THREE.Group(); g.position.set(1.5,1.05,3.85); p.add(g); // dịch từ (1.37,3.76) → né sticker vòng xoắn r=3.4 (index 11 tại ~(1.01,3.25))
    islMesh(new THREE.CylinderGeometry(0.75,0.75,0.06,12),0x86EFAC,0,0.03,0,g);
    const cols=[0xF472B6,0xFBBF24,0xF87171,0xA78BFA,0xFB923C,0xF472B6];
    [[0,0],[0.35,0.2],[-0.3,0.25],[0.15,-0.3],[-0.35,-0.15],[0.4,-0.12]].forEach(([x,z],i)=>{
      islMesh(new THREE.CylinderGeometry(0.02,0.02,0.3,4),0x16A34A,x,0.2,z,g);
      islMesh(new THREE.SphereGeometry(0.09,8,6),cols[i],x,0.38,z,g);
    });
  }},
  {id:'windmill', nm:'Cối xay gió', cost:777, build(p){
    islMesh(new THREE.CylinderGeometry(0.18,0.42,1.6,8),0xFCD34D,-4.2,1.85,0,p);
    islMesh(new THREE.ConeGeometry(0.28,0.4,8),0xDC2626,-4.2,2.85,0,p);
    const piv=new THREE.Group(); piv.position.set(-4.5,2.65,0); piv.rotation.y=-Math.PI/2; p.add(piv);
    islMesh(new THREE.SphereGeometry(0.1,8,6),0x78350F,0,0,0.05,piv);      // trục
    const bl=new THREE.Group(); piv.add(bl);
    const bg=new THREE.BoxGeometry(0.12,1.05,0.04); bg.translate(0,0.6,0);
    for(let i=0;i<4;i++) islMesh(bg,0xF8FAFC,0,0,0,bl).rotation.z=i*Math.PI/2;
    islDecorAnims.push(t=>{ bl.rotation.z=t*0.0012; });                    // cánh quay
  }},
  {id:'rainbow', nm:'Cầu vồng', cost:802, build(p){
    [[0xF87171,3.4],[0xFBBF24,3.15],[0x60A5FA,2.9]].forEach(([c,r])=>
      islMesh(new THREE.TorusGeometry(r,0.1,8,24,Math.PI),c,0.5,0.8,-4.6,p));
  }}
];

function refreshIslandDecor(){
  if(islDecorGroup){
    islGroup.remove(islDecorGroup);
    islDecorGroup.traverse(o=>{ if(o.isMesh){ o.geometry.dispose(); o.material.dispose(); } });
  }
  islDecorAnims.length=0;
  islDecorGroup=new THREE.Group(); islGroup.add(islDecorGroup);
  ISL_DECOR.forEach(d=>{ if(stars>=d.cost) d.build(islDecorGroup); });
}
