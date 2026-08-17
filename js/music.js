"use strict";
/* ============ MUSIC (Ca hát) ============ */
/* Nhạc KHÔNG LỜI: giai điệu public domain chơi bằng sample piano thật (FluidR3, assets/instruments/),
   oscillator chỉ là fallback khi sample chưa tải xong. Lời hiện highlight theo nhịp để bé tự hát;
   giọng TTS chỉ còn ở "Đọc lời"/chạm từng câu (học đọc) — Hát không còn giọng máy đọc đè nhạc. */

let songTimers=[], singing=false, curSong=null, musicReady=false;
let songGain=null, songOscs=[], songSession=0; // session token: chuỗi async của lượt cũ tự chết khi dừng/đổi bài
function stopSong(){
  songSession++;
  songTimers.forEach(clearTimeout); songTimers=[];
  singing=false;
  // dừng THẬT các nốt đã lên lịch trên timeline Web Audio (clearTimeout không chạm tới chúng)
  songOscs.forEach(o=>{ try{o.stop(AC.currentTime);}catch(e){} }); songOscs=[];
  if(songGain){ try{songGain.disconnect();}catch(e){} songGain=null; }
  stopSpeak();
  $$('.lyric-line').forEach(l=>l.classList.remove('now'));
}
// khoá máy/chuyển app giữa bài: timer nền bị throttle, mở lại sẽ bắn dồn 1 lượt (bài nhảy thẳng
// tới kết thúc + sao oan). Dừng sạch khi page ẩn — bé quay lại tự bấm Hát.
document.addEventListener('visibilitychange', ()=>{ if(document.hidden && singing) stopSong(); });
/* ==== sample piano thật — tải 1 lần khi vào màn Ca hát (~480KB, 17 nốt) ==== */
let pianoBuf={}, pianoLoading=null;
function loadPiano(){
  if(pianoLoading) return pianoLoading;
  pianoLoading = fetch('assets/instruments/manifest.json').then(r=>r.json()).then(man=>
    Promise.all(Object.entries(man.notes).map(([m,f])=>
      fetch('assets/instruments/piano/'+f).then(r=>r.arrayBuffer())
        .then(ab=>new Promise((res,rej)=>AC.decodeAudioData(ab,res,rej)))
        .then(buf=>{ pianoBuf[m]=buf; }).catch(()=>{})
    ))
  ).catch(()=>{}); // offline lần đầu chưa có sample → fallback oscillator, lần sau SW đã cache
  return pianoLoading;
}
function playPiano(midi, t, dur, vol){
  // sample gần nhất + playbackRate — chơi được MỌI nốt (hợp âm đệm cần nốt ngoài 17 sample)
  let src=null, bd=99;
  for(const k in pianoBuf){ const d=Math.abs(k-midi); if(d<bd){ bd=d; src=+k; } }
  if(src===null || bd>7) return false;
  const s=AC.createBufferSource(), g=AC.createGain();
  s.buffer=pianoBuf[src];
  if(src!==midi) s.playbackRate.value=Math.pow(2,(midi-src)/12);
  s.connect(g); g.connect(songGain||AC.destination);
  // humanize: lệch ±10ms + lực gõ dao động nhẹ — bớt cảm giác máy đánh đàn
  const st=AC.currentTime+t+Math.random()*.012;
  g.gain.setValueAtTime(vol*(.92+Math.random()*.16),st);
  g.gain.setTargetAtTime(0.001, st+Math.max(.15,dur), .09); // piano tự vang — chỉ hãm đuôi cho khỏi chồng
  s.start(st); s.stop(st+dur+0.9);
  songOscs.push(s);
  return true;
}
function playNote(midi, t, dur){
  if(playPiano(midi, t, dur, .5)) return;
  const f = 440*Math.pow(2,(midi-69)/12);
  const o=AC.createOscillator(), g=AC.createGain();
  o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(songGain||AC.destination);
  const st=AC.currentTime+t;
  g.gain.setValueAtTime(0,st);
  g.gain.linearRampToValueAtTime(.3,st+.02);
  g.gain.exponentialRampToValueAtTime(.001,st+Math.max(.08,dur*.95));
  o.start(st); o.stop(st+dur);
  songOscs.push(o);
}
/* ==== bộ gõ (Web Audio tổng hợp — chỉ bài nhanh mới dùng) ==== */
/* hi-hat: nhiễu trắng qua highpass, rất nhỏ để không át giọng melody */
let noiseBuf=null;
function playHat(t){
  if(!noiseBuf){
    noiseBuf=AC.createBuffer(1, Math.floor(AC.sampleRate*0.05), AC.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  }
  const s=AC.createBufferSource(), g=AC.createGain(), hp=AC.createBiquadFilter();
  s.buffer=noiseBuf; hp.type='highpass'; hp.frequency.value=6000;
  s.connect(hp); hp.connect(g); g.connect(songGain||AC.destination);
  const st=AC.currentTime+t;
  g.gain.setValueAtTime(.06,st);
  g.gain.exponentialRampToValueAtTime(.001,st+.05);
  s.start(st); s.stop(st+.06);
  songOscs.push(s);
}
/* kick: sine quét tần số 140→45Hz */
function playKick(t){
  const o=AC.createOscillator(), g=AC.createGain();
  o.type='sine'; o.connect(g); g.connect(songGain||AC.destination);
  const st=AC.currentTime+t;
  o.frequency.setValueAtTime(140,st);
  o.frequency.exponentialRampToValueAtTime(45,st+.12);
  g.gain.setValueAtTime(.3,st);
  g.gain.exponentialRampToValueAtTime(.001,st+.15);
  o.start(st); o.stop(st+.16);
  songOscs.push(o);
}
/* (pad drone gốc+quãng-5 đã bỏ — thay bằng hợp âm I–IV–V thật chọn theo nốt giai điệu trong singSong) */
function initMusic(){
  if(!musicReady){
    const list=$('#song-list');
    SONGS.forEach((s,i)=>{
      const c=document.createElement('div');
      c.className='menu-card';
      c.style.background=['var(--coral)','var(--sky)','var(--lime)','var(--violet)','var(--pink)','#0EA5E9'][i%6];
      c.innerHTML=`<div class="em">${s.em}</div><div class="tt">${s.title}</div><div style="font-size:14px">${s.vi}</div>`;
      c.onclick=()=>openSong(i);
      list.appendChild(c);
    });
    $('#song-sing').onclick=()=>singSong();
    $('#song-read').onclick=()=>readSong();
    $('#song-stop').onclick=stopSong;
    $('#song-back').onclick=()=>{ stopSong(); $('#song-view').style.display='none'; $('#song-list').style.display='grid'; };
    musicReady=true;
  }
  loadPiano(); // tải sample sớm — bấm Hát là có piano thật ngay
  stopSong();
  $('#song-view').style.display='none';
  $('#song-list').style.display='grid';
}
function openSong(i){
  curSong=SONGS[i];
  $('#song-list').style.display='none';
  $('#song-view').style.display='flex';
  $('#hdr-title').textContent = curSong.em+' '+curSong.title;
  const ly=$('#song-lyrics'); ly.innerHTML='';
  curSong.lines.forEach((ln,li)=>{
    const d=document.createElement('div');
    d.className='lyric-line'; d.textContent=ln.t;
    d.onclick=()=>{ if(!singing) speak(ln.t, curSong.lang||'en-US'); }; // dân ca đọc giọng Việt
    ly.appendChild(d);
  });
  speak(curSong.title, curSong.lang||'en-US');
}
function highlightLine(li){
  $$('.lyric-line').forEach((l,i)=>l.classList.toggle('now', i===li));
  const el=$$('.lyric-line')[li];
  if(el) el.scrollIntoView({block:'nearest', behavior:'smooth'});
}
function singSong(){
  if(!curSong) return;
  stopSong(); ensureAC(); singing=true;
  songGain=AC.createGain(); songGain.gain.value=.9; songGain.connect(AC.destination);
  const beat=60/curSong.bpm;
  const fast = curSong.bpm>=100; // bài nhanh: oom-pah + trống; bài ru: arpeggio êm, không trống
  // chủ âm = nốt kết bài (đồng dao/dân ca PD kết ở chủ âm) → hợp âm I–IV–V của giọng đó
  const lastLn = curSong.lines[curSong.lines.length-1];
  const tonic = lastLn.n[lastLn.n.length-1][0]%12;
  const CHORDS = [[0,4,7],[5,9,0],[7,11,2]].map(c=>c.map(x=>(x+tonic)%12)); // I, IV, V
  const pickChord = (pcs, isLast)=>{
    if(isLast) return CHORDS[0]; // ô cuối luôn về hợp âm chủ
    let best=CHORDS[0], bs=-1;
    for(const ci of [0,2,1]){ // hoà điểm thì ưu tiên I, rồi V, rồi IV
      const sc = pcs.reduce((s,[pc,w])=>s+(CHORDS[ci].includes(pc)?w:0),0);
      if(sc>bs){ bs=sc; best=CHORDS[ci]; }
    }
    return best;
  };
  const bassOf = pc => 41+((pc-41)%12+12)%12; // đưa pitch-class về quãng F2..E3
  const midOf  = pc => 55+((pc-55)%12+12)%12; // quãng giữa G3..F#4, dưới melody
  let t=0.2;
  const measures=[]; // ô nhịp 2 phách: {t0, beats, pcs:[[pitchClass, trọng số]]}
  curSong.lines.forEach((ln,li)=>{
    // nhạc không lời: highlight lời theo nhịp cho bé tự hát — không còn giọng TTS đọc đè nhạc
    songTimers.push(setTimeout(()=>highlightLine(li), t*1000));
    const lineDur = ln.n.reduce((s,[,b])=>s+b,0)*beat;
    let mt=0;
    const evts = ln.n.map(([m,b])=>{ const e={m, at:mt}; mt+=b*beat; return e; });
    const fullBeats = Math.floor(lineDur/beat+.001);
    for(let bt=0; bt<fullBeats; bt+=2){
      const beats = Math.min(2, fullBeats-bt);
      const pcs = evts.filter(e=>e.at >= bt*beat-1e-3 && e.at < (bt+beats)*beat-1e-3)
                      .map(e=>[e.m%12, e.at < bt*beat+1e-3 ? 2 : 1]); // nốt đầu ô nặng gấp đôi
      measures.push({t0:t+bt*beat, beats, pcs});
    }
    ln.n.forEach(([m,b])=>{ playNote(m,t,b*beat); t+=b*beat; });
    t+=beat*0.5; // nghỉ giữa các câu
  });
  // đệm theo hợp âm từng ô nhịp
  measures.forEach((ms,i)=>{
    const [r,th,fi] = pickChord(ms.pcs, i===measures.length-1);
    for(let b=0;b<ms.beats;b++){
      const bt=ms.t0+b*beat;
      if(fast){
        playPiano(bassOf(r), bt, beat*.9, b%2 ? .2 : .28);   // oom: gốc đậm/nhẹ luân phiên
        playPiano(midOf(th), bt+beat/2, beat*.4, .12);       // pah: 2 nốt hợp âm ở phách lệch
        playPiano(midOf(fi), bt+beat/2, beat*.4, .1);
        if(b%2===0) playKick(bt);
        playHat(bt+beat/2);
      }else{
        playPiano(bassOf(r), bt, beat*.95, .24);             // arpeggio ru êm, không trống
        playPiano(midOf(fi), bt+beat/2, beat*.45, .12);
        if(b%2===1) playPiano(midOf(th), bt, beat*.45, .11);
      }
    }
  });
  // kết bài ĐÚNG NHẠC: hợp âm chủ ngân dài, để vang tự tắt rồi mới dọn — không chặt cụt giữa tiếng đàn
  playPiano(bassOf(tonic), t, beat*2, .28);
  playPiano(bassOf(tonic)+12, t, beat*2, .18);
  playPiano(midOf((tonic+4)%12), t, beat*2, .15);
  playPiano(midOf((tonic+7)%12), t, beat*2, .13);
  songTimers.push(setTimeout(()=>{
    if(!singing) return;
    singing=false; // chốt 1 lần — không double sao
    confetti(); sndWin(); addStars(1);
    speak('Bé hát hay quá!');
  }, (t+beat)*1000));
  songTimers.push(setTimeout(()=>stopSong(), (t+2*beat)*1000+1200)); // dọn node sau khi hợp âm vang hết
}
function readSong(){
  if(!curSong) return;
  stopSong(); singing=true;
  const sess=songSession; // KHÔNG dùng cờ singing: lượt phát mới bật lại singing=true sẽ hồi sinh chuỗi cũ
  let i=0;
  const nextLine=()=>{
    if(sess!==songSession) return;
    if(i>=curSong.lines.length){ stopSong(); return; }
    highlightLine(i);
    speakAsync(curSong.lines[i].t, curSong.lang||'en-US').then(()=>{
      if(sess!==songSession) return;
      i++; songTimers.push(setTimeout(nextLine,400));
    });
  };
  nextLine();
}
