"use strict";
/* ============ MUSIC (Ca hát tiếng Anh) ============ */
/* Giai điệu tổng hợp bằng Web Audio (nhạc dân gian public domain) — không cần file mp3 */

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
function playNote(midi, t, dur){
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
/* bè đệm cho dày tiếng: sine trầm giữ suốt câu hát */
function playPad(midi, t, dur){
  const f = 440*Math.pow(2,(midi-69)/12);
  const o=AC.createOscillator(), g=AC.createGain();
  o.type='sine'; o.frequency.value=f; o.connect(g); g.connect(songGain||AC.destination);
  const st=AC.currentTime+t;
  g.gain.setValueAtTime(0,st);
  g.gain.linearRampToValueAtTime(.09,st+.06);
  g.gain.exponentialRampToValueAtTime(.001,st+Math.max(.1,dur));
  o.start(st); o.stop(st+dur+.05);
  songOscs.push(o);
}
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
    d.onclick=()=>{ if(!singing) speak(ln.t,'en-US'); };
    ly.appendChild(d);
  });
  speak(curSong.title,'en-US');
}
function highlightLine(li){
  $$('.lyric-line').forEach((l,i)=>l.classList.toggle('now', i===li));
  const el=$$('.lyric-line')[li];
  if(el) el.scrollIntoView({block:'nearest', behavior:'smooth'});
}
function singSong(){
  if(!curSong) return;
  stopSong(); ensureAC(); singing=true;
  songGain=AC.createGain(); songGain.connect(AC.destination);
  const beat=60/curSong.bpm;
  let t=0.2;
  curSong.lines.forEach((ln,li)=>{
    songTimers.push(setTimeout(()=>highlightLine(li), t*1000));
    const lineDur = ln.n.reduce((s,[,b])=>s+b,0)*beat;
    const root = ln.n[0][0]-12;
    playPad(root, t, lineDur); playPad(root+7, t, lineDur); // bass + quãng 5
    ln.n.forEach(([m,b])=>{ playNote(m,t,b*beat); t+=b*beat; });
    t+=beat*0.5; // nghỉ giữa các câu
  });
  songTimers.push(setTimeout(()=>{
    stopSong(); confetti(); sndWin(); addStars(1);
    speak('Bé hát hay quá!');
  }, t*1000+300));
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
    speakAsync(curSong.lines[i].t,'en-US').then(()=>{
      if(sess!==songSession) return;
      i++; songTimers.push(setTimeout(nextLine,400));
    });
  };
  nextLine();
}
