/* Nira: realistic canvas cat. Main script se pehle load karo.
   Uses at runtime: state, $, esc (index.html se). */

/* Apni awaaz: ye files index.html ke saath usi folder mein daalo. Jo file nahi hogi, wo awaaz chup rahegi
   (sirf la la la ki jagah halki si dhun bajegi). */
const NIRA_SOUNDS={meow:"meow.mp3",purr:"purr.mp3",la:"lala.mp3",hehe:"hehe.mp3"};
const NIRA_VOL={meow:.8,purr:.7,la:.45,hehe:.6};

/* {n} ki jagah login wale ka naam (login na ho to "user"). Baatein English mein, sirf jaate waqt ka dialogue Hindi mein. */
const NF=[
"{n}, you study. I'll handle being cute ✨",
"Today's plan: you finish 2 topics, I finish 2 naps 😴",
"Tiny reminder, {n}: drink some water 💧",
"I sniffed the whole syllabus. Control systems smells spicy 🌶️",
"Junior Engineer {n}... sounds lovely, right? 🚆",
"Wrong answers cost 1/3 mark. Guess wisely, {n}!",
"Safety first, snacks second 😎",
"Everyone gets one wrong. I knock things off tables daily 🙃",
"V = IR. Ohm shanti ✨",
"One more topic, {n}. I believe in you 💛"];
/* Bollywood andaaz: Nira jab aaram karne jaati hai */
const NBYE=["लो, मैं चली... याद आए तो पुकार लेना! 💛","अलविदा मत कहना... बस कोने तक जा रही हूँ 🌹","जा रही हूँ... पर दिल यहीं छोड़े जा रही हूँ ❤️","लो मैं चली, अपनी सारी अदाएँ साथ लेकर 💃","रूठी नहीं हूँ... बस ज़रा आराम फ़रमाने चली 😌"];
const NLINE={
 poke:["Meow! Yes, {n}? 🐾","Hey, that tickles! 😹","So much love? A fish would be nice too 🐟","You booped me. You're mine now 😼"],
 drag:["Wheee! Gently, please 🙀","Careful with my helmet! ⛑️"],
 flip:["Did you see that, {n}? 10 out of 10! 🤸"],
 belly:["Belly rubs? It might be a trap 😼"],
 toy:["Ooh, mine! 👀"],
 pet:["Purrrr... right there, {n} 😻","Mmm, behind the ears... perfect 💛"],
 login:["I'd love to call you by name. Sign in with Google? 🥺","Sign in, {n}, so your progress stays safe 💛"]};
function nName(){const u=typeof user!="undefined"&&user;if(!u)return"user";const m=u.user_metadata||{};return String(m.full_name||m.name||(u.email||"user").split("@")[0]).trim().split(/\s+/)[0]}
const nLine=k=>pick(NLINE[k]);
function nTimeLine(){const h=new Date().getHours(),d=state.exam?Math.ceil((new Date(state.exam)-Date.now())/864e5):0;
  if(d>0&&Math.random()<.5)return"{n}, "+d+" days to the exam. One topic at a time 💪";
  return h<5?"Up this late, {n}? That's my job 🦉":h<12?"Good morning, {n}! Hardest topic first ☀️":h<17?"Afternoon sleepiness? Same, {n} 😪":h<21?"Evening, {n}. Revision time 🌇":"One last PYQ set, then sleep, {n} 🌙"}

const NQ=[["AND gate: output for inputs 1 and 0?",["0","1","Undefined"],0],["Unit of capacitance?",["Henry","Farad","Ohm"],1],["A diode conducts in which bias?",["Forward","Reverse","Both"],0],["Decimal 5 in binary?",["101","110","011"],0],["Ideal op-amp input impedance?",["Zero","Infinite","50 ohm"],1],["8085 is a ___ bit microprocessor.",["4","8","16"],1],["Which gate is universal?",["XOR","NAND","AND"],1],["AC frequency in India?",["50 Hz","60 Hz","100 Hz"],0],["Diodes in a bridge rectifier?",["2","4","6"],1],["PN junctions in an SCR?",["2","3","4"],1],["Unit of inductance?",["Henry","Farad","Tesla"],0],["Power = ?",["V x I","V / I","I / V"],0],["Kirchhoff's current law is based on conservation of?",["Energy","Charge","Momentum"],1],["An ADC converts?",["Digital to analog","Analog to digital","AC to DC"],1],["In series resonance, XL equals?",["XC","R","0"],0]];

const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const calmMotion=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
let nira={x:60,y:-220,vx:0,vy:0,dir:1,mode:"air",t:0,age:0,phase:0,plat:null,raf:0,last:0,drawT:0,n:0,clicks:[],bt:0,idleAt:Date.now(),mx:-1,my:-1,mAt:0,pl:[],plT:0,drag:null,goal:"",quizAt:0,talkAt:0,qOpen:0,hbAt:0,lastUp:0,focus:null,fi:0,ot:0,q:null,bounced:0,skip:null,skipT:0};

/* ---------- SOUND ---------- */
let AC=null,NBUF={},NSRC={};
(function(){const O=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!O||location.protocol=="file:")return;const dec=new O(1,1,44100);
  for(const k in NIRA_SOUNDS)fetch(NIRA_SOUNDS[k]).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(b=>new Promise((ok,no)=>dec.decodeAudioData(b,ok,no))).then(b=>NBUF[k]=b).catch(()=>{})})();
function nAudio(){
  if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return null;
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state=="suspended")AC.resume()}catch(e){return null}
  return AC}
function nTone(a,f,when,dur,type,vol,vib){
  const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(vol,when+Math.min(.09,dur/3));g.gain.exponentialRampToValueAtTime(.001,when+dur);
  if(vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=5;lg.gain.value=f*.008;l.connect(lg);lg.connect(o.frequency);l.start(when);l.stop(when+dur)}
  o.connect(g);g.connect(a.destination);o.start(when);o.stop(when+dur+.05)}
/* dheemi, naram gungunahat: [note Hz, shuru, lambai] */
function nHum(a,T){[[440,0,.55],[523.25,.5,.55],[659.25,1,.95],[587.33,1.9,.5],[523.25,2.35,.5],[440,2.8,1.4]].forEach(([f,at,d])=>{
  nTone(a,f,T+at,d,"sine",.075,1);nTone(a,f*2,T+at,d*.7,"sine",.009,1);nTone(a,f/2,T+at,d,"triangle",.018)})}
function sfx(k){
  if(state.mute)return;const a=nAudio();if(!a)return;const T=a.currentTime+.01;
  if(k in NIRA_SOUNDS){
    const buf=NBUF[k];if(!buf){if(k=="la"&&!(NSRC.hum>T)){nHum(a,T);NSRC.hum=T+4}return}
    if(NSRC[k])try{NSRC[k].stop()}catch(e){}
    const s=a.createBufferSource(),g=a.createGain(),d=Math.min(buf.duration,k=="la"?8:3.5);s.buffer=buf;
    g.gain.setValueAtTime(NIRA_VOL[k],T);g.gain.setValueAtTime(NIRA_VOL[k],T+Math.max(0,d-.3));g.gain.linearRampToValueAtTime(0,T+d);
    s.connect(g);g.connect(a.destination);s.start(T);s.stop(T+d);NSRC[k]=s;return}
  if(k=="bell")[880,1175,1480].forEach((f,i)=>nTone(a,f,T+i*.25,.6,"sine",.14));
  else if(k=="pop")nTone(a,520,T,.1,"triangle",.08);
  else if(k=="ok"){nTone(a,660,T,.18,"triangle",.1);nTone(a,880,T+.1,.18,"triangle",.1)}
  else if(k=="no"){nTone(a,330,T,.2,"triangle",.1);nTone(a,247,T+.18,.3,"triangle",.1)}}

/* ---------- DRAWING (logical canvas 170x130, cat right ki taraf) ---------- */
const GINGER=["#d98a3d","#e39a4c","#c97a30","#eaa75a","#cf8236"],STRIPE=["#9a5520","#a9601f","#8c4a1b"],CREAM=["#f6e6cd","#eed9bb","#fff2de"];
let SPR=null;const SS=3;
function seeded(s){return()=>(s=(s*16807)%2147483647)/2147483647}
/* shape = Path2D; colour(x,y) palette deta hai; flow(x,y) baal ki disha */
function furSprite(w,h,shape,base,colour,flow,count,len,seed){
  const c=document.createElement("canvas");c.width=w*SS;c.height=h*SS;
  const g=c.getContext("2d"),probe=document.createElement("canvas").getContext("2d"),R=seeded(seed);
  g.scale(SS,SS);g.fillStyle=base;g.fill(shape);g.lineCap="round";
  for(let i=0,tries=0;i<count&&tries<count*6;tries++){
    const x=R()*w,y=R()*h;if(!probe.isPointInPath(shape,x,y))continue;i++;
    const pal=colour(x+(R()-.5)*3,y+(R()-.5)*3),an=flow(x,y)+(R()-.5)*.45,l=len*(.6+R()*.8);
    g.strokeStyle=pal[Math.floor(R()*pal.length)];g.globalAlpha=.55+R()*.45;g.lineWidth=.35+R()*.45;
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(an)*l*.5,y+Math.sin(an)*l*.5-.5,x+Math.cos(an+.18)*l,y+Math.sin(an+.18)*l);g.stroke()}
  /* roshni upar, chhaya neeche */
  g.globalAlpha=1;g.globalCompositeOperation="source-atop";
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"rgba(255,235,200,.16)");gr.addColorStop(.55,"rgba(0,0,0,0)");gr.addColorStop(1,"rgba(60,25,0,.28)");
  g.fillStyle=gr;g.fillRect(0,0,w,h);return c}
function ell(x,y,rx,ry,rot){const p=new Path2D();p.ellipse(x,y,rx,ry,rot||0,0,7);return p}
function buildSprites(){
  const torso=new Path2D("M8 26C8 12 22 8 36 10C50 12 60 6 72 10C84 14 86 28 80 38C74 48 62 44 50 43C38 42 30 48 19 45C9 42 8 34 8 26Z");
  const tabby=(x,y)=>y>36+Math.sin(x*.2)*2?CREAM:(Math.sin(x*.42+Math.sin(y*.19)*1.6)>.55&&y<33)||y<13?STRIPE:GINGER;
  const body=furSprite(92,56,torso,"#d58a40",tabby,(x,y)=>Math.PI-(y-26)*.025,2300,4.6,11);
  const haunch=furSprite(48,44,ell(24,22,19,17),"#d58a40",(x,y)=>Math.hypot(x-20,y-20)%9<3&&y<26?STRIPE:GINGER,(x,y)=>Math.atan2(y-14,x-30)+.5,800,4.5,23);
  const loaf=furSprite(110,66,ell(55,36,46,26),"#d58a40",(x,y)=>y>51?CREAM:Math.sin(x*.34+y*.07)>.6&&y<44?STRIPE:GINGER,(x,y)=>Math.atan2(y-48,x-62)+1.6,2800,5,31);
  const seg=(w0,w1,L,seed,paw)=>{const p=new Path2D(),cx=12;
    p.moveTo(cx-w0/2,6);p.quadraticCurveTo(cx,0,cx+w0/2,6);p.lineTo(cx+w1/2,6+L);p.quadraticCurveTo(cx,12+L,cx-w1/2,6+L);p.closePath();
    if(paw)p.ellipse(cx+2.5,6+L+1,6,4,0,0,7);
    return furSprite(24,L+16,p,"#d58a40",(x,y)=>paw&&y>L?CREAM:Math.sin(y*.7)>.7?STRIPE:GINGER,()=>Math.PI/2,paw?330:260,3.2,seed)};
  /* Head: saamne dekhta hua, size 56x52, centre (28,29) */
  const hp=new Path2D("M28 10C40 10 47 17 47.5 27C52 33 49 37 46 38C42 45 36 48 28 48C20 48 14 45 10 38C7 37 4 33 8.5 27C9 17 16 10 28 10Z");
  hp.addPath(new Path2D("M11 23Q8 6 12 2Q20 6 25 13Z"));hp.addPath(new Path2D("M45 23Q48 6 44 2Q36 6 31 13Z"));
  const face=(x,y)=>{const dx=Math.abs(x-28);
    if((y>35&&dx<11-(y-42)*.2&&y<49)||(y>43&&dx<14))return CREAM;
    if(Math.hypot(dx-8.5,y-27.5)<6.8&&Math.hypot(dx-8.5,y-27.5)>4.6)return CREAM;
    if(y<22&&y>11&&(Math.abs(dx-3.5-(22-y)*.15)<1.2||dx<.9))return STRIPE;
    if(dx>13&&y>25&&y<37&&Math.sin(y*1.25-dx*.25)>.55)return STRIPE;
    return GINGER};
  const head=furSprite(56,52,hp,"#d78d42",face,(x,y)=>Math.atan2(y-33,x-28),2100,3.2,47);
  const g=head.getContext("2d");g.save();g.setTransform(SS,0,0,SS,0,0);g.globalCompositeOperation="source-over";g.lineCap="round";
  [[1,0],[-1,56]].forEach(([s,o])=>{const X=x=>o+s*x;
    const ig=g.createLinearGradient(0,6,0,20);ig.addColorStop(0,"#9c5a52");ig.addColorStop(1,"#e7a99c");g.fillStyle=ig;
    g.beginPath();g.moveTo(X(13),19);g.quadraticCurveTo(X(11),8,X(13),5.5);g.quadraticCurveTo(X(19),9,X(22),15);g.closePath();g.fill();
    g.strokeStyle="rgba(255,244,225,.85)";g.lineWidth=.35;for(let i=0;i<9;i++){g.beginPath();g.moveTo(X(13+i*.8),18-i*.5);g.quadraticCurveTo(X(13+i*.3),13-i*.4,X(12+i*.5),9+i*.3);g.stroke()}});
  /* naak aur munh */
  g.fillStyle="#c9726c";g.beginPath();g.moveTo(24.8,35.2);g.quadraticCurveTo(28,33.8,31.2,35.2);g.quadraticCurveTo(30,38,28,39);g.quadraticCurveTo(26,38,24.8,35.2);g.fill();
  g.fillStyle="rgba(255,220,215,.7)";g.fill(ell(26.8,35.4,1.3,.6));
  g.strokeStyle="#6b3520";g.lineWidth=.7;g.beginPath();g.moveTo(28,39);g.lineTo(28,41);g.quadraticCurveTo(25.5,44,22.8,42);g.moveTo(28,41);g.quadraticCurveTo(30.5,44,33.2,42);g.stroke();
  g.fillStyle="rgba(120,70,40,.55)";[-1,1].forEach(s=>[[5,39],[7.5,40],[5.5,41.5],[9,38.3]].forEach(([dx,y])=>g.fill(ell(28+s*dx,y,.45,.45))));
  g.restore();
  /* hi-vis safety vest */
  const vest=(img,x0,x1,H)=>{const g=img.getContext("2d");g.save();g.setTransform(SS,0,0,SS,0,0);g.globalCompositeOperation="source-atop";
    const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#e4ff4a");gr.addColorStop(.6,"#b9e01c");gr.addColorStop(1,"#7d9a10");g.fillStyle=gr;
    g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0-6,H*.5,x0+2,H);g.lineTo(x1,H);g.quadraticCurveTo(x1+7,H*.5,x1,0);g.closePath();g.fill();
    g.strokeStyle="#5f7508";g.lineWidth=1.2;g.stroke();
    g.strokeStyle="#dfe7ea";g.lineWidth=4.5;g.beginPath();g.moveTo(x0-6,H*.52);g.quadraticCurveTo((x0+x1)/2,H*.64,x1+7,H*.52);g.stroke();
    g.strokeStyle="rgba(255,255,255,.9)";g.lineWidth=1;g.stroke();g.restore()};
  vest(body,42,68,56);vest(loaf,46,62,66);
  SPR={body,haunch,loaf,head,fu:seg(13,9,17,53),fl:seg(9,7,16,59,1),hu:seg(18,9,17,61),hl:seg(9,6.5,16,67,1)}}
const put=(c,img,x,y,rot,sx,sy)=>{c.save();c.translate(x,y);c.rotate(rot||0);c.scale(sx||1,sy||sx||1);c.drawImage(img,-img.width/SS/2,-img.height/SS/2,img.width/SS,img.height/SS);c.restore()};
/* do-haddi wali taang: kandhe (ax,ay) se panje (bx,by) tak. bend = ghutne ki disha */
function leg(c,up,low,ax,ay,bx,by,bend,far){
  const L1=17,L2=17;let dx=bx-ax,dy=by-ay,d=Math.max(2,Math.min(L1+L2-.1,Math.hypot(dx,dy)));
  const base=Math.atan2(dy,dx),kn=base+bend*Math.acos((L1*L1+d*d-L2*L2)/(2*L1*d)),kx=ax+Math.cos(kn)*L1,ky=ay+Math.sin(kn)*L1,fa=Math.atan2(ay+Math.sin(base)*d-ky,ax+Math.cos(base)*d-kx);
  const bone=(img,x,y,an)=>{c.save();c.translate(x,y);c.rotate(an-Math.PI/2);c.drawImage(img,-12,-6,img.width/SS,img.height/SS);c.restore()};
  c.save();if(far&&"filter" in c)c.filter="brightness(.72)";bone(up,ax,ay,kn);bone(low,kx,ky,fa);c.restore()}
/* poonchh: cubic curve ke saath baalon wale gole */
function tail(c,p,seed){
  const R=seeded(seed),N=26,at=(t,i)=>{const u=1-t;return u*u*u*p[0][i]+3*u*u*t*p[1][i]+3*u*t*t*p[2][i]+t*t*t*p[3][i]};
  c.lineCap="round";
  for(let k=0;k<N;k++){const t=k/N,x=at(t,0),y=at(t,1),nx=at(t+1/N,0),ny=at(t+1/N,1),w=9.5-t*3.5,ring=t>.86||Math.floor(t*11)%3==2;
    c.strokeStyle=ring?"#b06a2a":"#d58a40";c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(nx,ny);c.stroke();
    const an=Math.atan2(ny-y,nx-x);c.lineWidth=.55;
    for(let h=0;h<26;h++){const side=R()<.5?-1:1,off=R()*w*.5*side,sx=x+Math.cos(an+1.57)*off,sy=y+Math.sin(an+1.57)*off,ha=an+side*(.25+R()*.5);
      c.strokeStyle=pick3(R()<(ring?.75:.12)?STRIPE:GINGER,R());c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(ha)*(3+R()*3),sy+Math.sin(ha)*(3+R()*3));c.stroke()}}}
const pick3=(a,r)=>a[Math.floor(r*a.length)];
function head(c,x,y,rot,o){
  c.save();c.translate(x,y);c.rotate(rot);c.drawImage(SPR.head,-28,-29,56,52);c.translate(-28,-29);
  const dark=document.documentElement.dataset.theme=="dark";
  [19.5,36.5].forEach((ex,i)=>{const open=o.eye,ey=27.5,tilt=i?-.14:.14;
    c.save();c.translate(ex,ey);c.rotate(tilt);
    if(open<.15){c.strokeStyle="#5a2c12";c.lineWidth=1.1;c.beginPath();c.moveTo(-4.6,0);c.quadraticCurveTo(0,2.6,4.6,0);c.stroke()}
    else{const e=new Path2D();e.moveTo(-5,0);e.quadraticCurveTo(0,-5.6*open,5,0);e.quadraticCurveTo(0,4.8*open,-5,0);
      c.save();c.clip(e);const ig=c.createRadialGradient(0,0,.5,0,0,5);ig.addColorStop(0,dark?"#e9ff9a":"#d9c84a");ig.addColorStop(.6,dark?"#6ee77a":"#9aab35");ig.addColorStop(1,"#4d5a1c");c.fillStyle=ig;c.fillRect(-6,-6,12,12);
      c.fillStyle="#0d0a05";c.fill(ell(o.look,0,o.wide?2.5:1.05,3.8));c.fillStyle="#fff";c.fill(ell(-1.6,-1.5,1,.9));c.fillStyle="rgba(255,255,255,.55)";c.fill(ell(1.7,1.4,.5,.5));c.restore();
      c.strokeStyle="#3d1f0c";c.lineWidth=.85;c.stroke(e)}
    c.restore()});
  if(o.mouth){c.fillStyle="#6d2a2a";c.fill(ell(28,43.5,3.2,2.6*o.mouth));c.fillStyle="#ee8d98";c.fill(ell(28,44.6,2,1.2*o.mouth))}
  c.lineWidth=.45;c.strokeStyle=dark?"rgba(255,255,255,.8)":"rgba(105,75,55,.75)";
  [-1,1].forEach(s=>{[[-4,36.5],[0,39],[4.5,41]].forEach(([dy,y0],i)=>{c.beginPath();c.moveTo(28+s*7,y0);c.quadraticCurveTo(28+s*19,y0+dy*.3,28+s*(31-i),y0+dy+o.twitch);c.stroke()});
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(28+s*(7+i*1.6),21.5);c.quadraticCurveTo(28+s*(10+i*2),15,28+s*(13+i*3),13+i*1.5);c.stroke()}});
  helmet(c);c.restore()}
/* peela safety helmet, kaan dono taraf bahar */
function helmet(c){
  const g=c.createRadialGradient(22,6,1,28,13,20);g.addColorStop(0,"#fff3a0");g.addColorStop(.45,"#ffcb12");g.addColorStop(1,"#c98a00");
  c.fillStyle=g;c.beginPath();c.moveTo(14.5,18.5);c.bezierCurveTo(14,-.5,42,-.5,41.5,18.5);c.closePath();c.fill();
  c.fillStyle="#e5a500";c.beginPath();c.moveTo(25.5,4.6);c.quadraticCurveTo(28,3.4,30.5,4.6);c.lineTo(31,17);c.lineTo(25,17);c.closePath();c.fill();
  c.fillStyle="#f0ad00";c.beginPath();c.moveTo(11,18);c.quadraticCurveTo(28,14,45,18);c.quadraticCurveTo(47,21,44,21.5);c.quadraticCurveTo(28,18.5,12,21.5);c.quadraticCurveTo(9,21,11,18);c.fill();
  c.fillStyle="rgba(255,255,255,.65)";c.fill(ell(21,9,2.4,4.2,.6));
  c.fillStyle="#555";c.fill(ell(28,12.5,3.6,3.6));c.fillStyle="#fffbe0";c.fill(ell(28,12.5,2.4,2.4))}
function collar(c,x,y){c.strokeStyle="#b3261e";c.lineWidth=3.2;c.beginPath();c.moveTo(x-11,y-3);c.quadraticCurveTo(x,y+6,x+11,y-3);c.stroke()}
/* "Nira" wala sone ka locket; head ke baad banta hai taaki chhupe nahi, ulta chalne par bhi naam seedha */
function locket(c,x,y,dir){c.save();c.translate(x,y);if(dir<0)c.scale(-1,1);if(c.getTransform().d<-.5)c.rotate(Math.PI);
  c.strokeStyle="#b8860b";c.lineWidth=1.2;c.beginPath();c.arc(0,-7,2,0,7);c.stroke();
  const g=c.createLinearGradient(0,-5,0,6);g.addColorStop(0,"#fff2a8");g.addColorStop(.5,"#f2c230");g.addColorStop(1,"#c8920c");
  c.fillStyle=g;c.beginPath();c.moveTo(-9,-5.5);c.lineTo(9,-5.5);c.quadraticCurveTo(14,0,9,5.5);c.lineTo(-9,5.5);c.quadraticCurveTo(-14,0,-9,-5.5);c.fill();c.stroke();
  c.fillStyle="#3d2600";c.font="bold 9px Arial,sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText("Nira",0,.5);c.restore()}

/* mode + time -> ek frame */
function drawCat(cv,mode,age,phase,dir,vy,look){
  if(!SPR)buildSprites();
  const dpr=Math.min(3,window.devicePixelRatio||1),W=cv.clientWidth||170,H=cv.clientHeight||130;
  if(cv.width!=Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  const c=cv.getContext("2d");c.setTransform(cv.width/170,0,0,cv.height/130,0,0);c.clearRect(0,0,170,130);
  const t=age,S=Math.sin,still=calmMotion.matches,breath=still?0:S(performance.now()/620),blink=performance.now()%4300<140?0:1;
  const o={eye:blink,look:look||0,wide:mode=="chase"||mode=="drag"||mode=="air",mouth:0,twitch:performance.now()%2900<160?1.2:0};
  if(mode!="air"&&mode!="flip"&&mode!="drag"){c.fillStyle="rgba(20,10,0,.2)";c.fill(ell(84,123,mode=="sleep"?50:44,4))}
  if(dir<0){c.translate(170,0);c.scale(-1,1)}
  const wag=still?0:S(performance.now()/(mode=="chase"||mode=="laugh"?170:mode=="sit"?330:540));
  if(mode=="sleep"){
    put(c,SPR.loaf,80,93,0,1+breath*.008,1+breath*.025);
    c.save();c.translate(112,99+breath*.7);c.scale(.96,.96);o.eye=0;head(c,0,0,.28,o);c.restore();
    tail(c,[[40,103],[26,130],[80,124],[112+wag*2,118]],5);locket(c,128,119,dir);return}
  if(mode=="spin"){c.translate(84,0);c.scale(Math.cos(t/.8*Math.PI*2)||.02,1);c.translate(-84,0)}
  if(mode=="roll"){const k=Math.min(1,t/1.6),e=k*k*(3-2*k);c.translate(84,92);c.rotate(e*Math.PI*2);c.translate(-84,-92)}
  if(mode=="flip"){c.translate(84,82);c.rotate(-Math.min(1,t/.72)*Math.PI*2);c.translate(-84,-82)}
  /* peeth ke bal ulta letna, panje hawa mein */
  if(mode=="belly"){c.translate(84,77);c.rotate(Math.PI+S(t*3)*.07);c.translate(-84,-77);o.eye=blink*.75}
  if(["sit","wash","shake","laugh"].includes(mode)){
    const wash=mode=="wash",lap=S(t*9);
    if(mode=="laugh"){o.eye=0;o.mouth=.6+.4*Math.abs(S(t*14));c.translate(0,-Math.abs(S(t*14))*2)}
    tail(c,[[62,110],[24,128],[62,127],[108+wag*7,119-Math.max(0,wag)*5]],5);
    leg(c,SPR.fu,SPR.fl,94,86,99,118,1,true);
    put(c,SPR.body,85,86,-.86,.92,1+breath*.018);
    leg(c,SPR.hu,SPR.hl,66,106,88,119,-1);put(c,SPR.haunch,69,102,-.2);
    if(wash)leg(c,SPR.fu,SPR.fl,103,84,114+lap,70+lap*3,1);else leg(c,SPR.fu,SPR.fl,103,86,108,118,1);
    collar(c,108,66);
    if(wash){o.eye=.1;o.mouth=lap>0?.45:0}
    head(c,wash?111:109,(wash?55+lap*2:47)+breath*.5,wash?.3+lap*.05:mode=="shake"?S(t*26)*.22*Math.max(0,1-t):S(performance.now()/1900)*.05,o);locket(c,107,wash?82:74,dir);return}
  /* khadi, chalti, daudti, kudti */
  const walk=mode=="w",run=mode=="run",air=mode=="air"||mode=="flip",drag=mode=="drag",dance=mode=="dance",str=mode=="stretch";
  let bob=breath*.4,pitch=0,sh=[104,85],hip=[60,85];
  const feet={hf:[58,119],hn:[66,119],ff:[104,119],fn:[112,119]};
  if(walk||run){const stride=run?19:11,lift=run?10:6,off=run?{hf:0,hn:.08,ff:.5,fn:.58}:{hf:0,ff:.25,hn:.5,fn:.75};
    for(const k in feet){const p=(phase+off[k])%1,duty=run?.45:.65;
      if(p<duty)feet[k][0]+=stride*(1-2*p/duty);else{const s=(p-duty)/(1-duty);feet[k][0]+=stride*(2*s-1);feet[k][1]-=S(s*Math.PI)*lift}}
    bob=run?S(phase*6.283)*4:S(phase*12.566)*1.1;pitch=run?S(phase*6.283+1)*.1:0}
  if(air){const up=vy<0;pitch=Math.max(-.35,Math.min(.35,vy/1600));feet.fn=[up?128:124,up?96:114];feet.ff=[up?122:116,up?100:116];feet.hn=[up?40:60,up?108:104];feet.hf=[up?34:52,up?104:102]}
  if(drag){const s=still?0:S(performance.now()/180)*3;pitch=-.42;sh=[104,70];hip=[66,92];feet.fn=[114+s,102];feet.ff=[106-s,101];feet.hn=[66-s,124];feet.hf=[56+s,122];o.mouth=.35}
  if(mode=="belly"){const k=S(t*7);feet.fn=[117+k*6,108-k*5];feet.ff=[103-k*5,106+k*5];feet.hn=[70+k*3,112];feet.hf=[54-k*3,110]}
  if(mode=="land"){const k=Math.max(0,1-t/.35);bob=k*8}
  if(str){const k=S(Math.min(1,t/1.4)*Math.PI);pitch=k*.3;sh=[104,85+k*19];hip=[60,85-k*3];feet.fn[0]+=k*18;feet.ff[0]+=k*16;o.eye=1-k;o.mouth=k}
  if(dance){const k=S(t*8);bob=-Math.abs(k)*9;pitch=-.5;sh=[98,68];hip=[66,92];feet.fn=[124,66+k*9];feet.ff=[116,66-k*9];o.mouth=.5+.5*Math.abs(k);o.eye=blink*.6}
  const A=[sh[0],sh[1]+bob],B=[hip[0],hip[1]+bob];
  tail(c,run||air?[[B[0]-8,B[1]-6],[34,B[1]-14],[18,B[1]-4+wag*5],[6,B[1]-14+wag*6]]:[[B[0]-8,B[1]-6],[24,B[1]-2],[36+wag*5,44],[20+wag*12,36+Math.abs(wag)*4]],5);
  leg(c,SPR.hu,SPR.hl,B[0],B[1]+1,feet.hf[0],feet.hf[1],-1,true);
  leg(c,SPR.fu,SPR.fl,A[0]-3,A[1],feet.ff[0],feet.ff[1],1,true);
  put(c,SPR.body,(A[0]+B[0])/2,(A[1]+B[1])/2-5,pitch,1,1+breath*.015);
  leg(c,SPR.hu,SPR.hl,B[0]+4,B[1],feet.hn[0],feet.hn[1],-1);put(c,SPR.haunch,B[0]+1,B[1]-3,pitch,.8);
  leg(c,SPR.fu,SPR.fl,A[0]+2,A[1],feet.fn[0],feet.fn[1],1);
  const hx=A[0]+15,hy=A[1]-25+(str?4:0)+(walk?S(phase*12.566+1)*.9:0);
  collar(c,hx-2,hy+16);head(c,hx,hy,dance?S(t*4)*.2:run?pitch*.5:0,o);locket(c,hx-2,hy+27,dir)}

/* ---------- BEHAVIOUR ---------- */
function niraPos(b){b.className="nb"+(nira.x<140?" bl":nira.x>innerWidth-260?" br":"")+(nira.y<90?" bd":"")}
/* har baar alag andaaz: lehar, pop, rang-birange, jhatka */
function nFancy(b,text){
  const hindi=/[\u0900-\u097F]/.test(text),style=hindi?"pop":pick(["wave","pop","rain","jelly"]);b.textContent="";b.classList.add("s-"+style);let i=0;
  text.split(" ").forEach((word,n)=>{if(n)b.append(" ");const w=document.createElement("span");w.className="nira-w";
    /* Hindi ke akshar jude rehte hain, isliye poora shabd ek saath */
    (hindi?[word]:Array.from(word)).forEach(ch=>{const c=document.createElement("span");c.className="nira-ch";c.textContent=ch;c.style.setProperty("--i",hindi?i*5:i);c.style.setProperty("--h",(i*(hindi?60:23)+260)%360);i++;w.append(c)});b.append(w)})}
/* force sirf zaroori baat ke liye. Lautata hai: dikhaya ya nahi */
function niraSay(s,ms,force){const b=$("#nbub");if(!b||nira.qOpen||nira.gone||(!force&&Date.now()<nira.sayUntil))return false;
  s=String(s).replace(/\{n\}/g,nName());niraPos(b);nFancy(b,s);b.setAttribute("aria-label",s);b.classList.add("on");
  const time=Math.max(ms||0,3000+s.length*90);nira.sayUntil=Date.now()+time;clearTimeout(nira.bt);nira.bt=setTimeout(()=>b.classList.remove("on","qzb"),time);return true}
function niraAskLogin(force){
  const can=force||(typeof sb!="undefined"&&sb&&!user);const b=$("#nbub");if(!can||!b||nira.qOpen)return false;
  if(!niraSay(nLine("login"),11000,force))return false;const q=document.createElement("div");q.className="qz";q.innerHTML='<button data-nl="1">🔐 Sign in with Google</button>';b.append(q);b.classList.add("qzb");return true}
addEventListener("click",e=>{if(e.target.dataset&&e.target.dataset.nl){e.stopPropagation();$("#nbub").classList.remove("on","qzb");const l=$("#login");if(l)l.click()}},true);
function niraNotes(ch){const c=$("#ncat");if(!c)return;(ch||["♪","♫","♪"]).forEach((x,i)=>{const n=document.createElement("span");n.className="nt";n.textContent=x;n.style.cssText="--dx:"+(i*26-26)+"px;left:"+(30+i*24)+"%;animation-delay:"+i*.2+"s"+(x=="♥"?";color:#ff5ca8":"");c.append(n);setTimeout(()=>n.remove(),2400)})}
function niraMode(m,t){const mode={walk:"w",chase:"chase"}[m]||m;if(nira.mode!=mode)nira.age=0;nira.mode=mode;nira.t=t;const c=$("#ncat");if(c)c.className="nc "+mode}
function niraSing(s,ms){niraSay(s||"♪ la... la la ♪",ms||3800);sfx("la");niraNotes()}
/* Mock / sahi jawab = naach, topic complete = khushi mein ghoomna */
function niraCheer(s){if(!$("#ncat")||state.catOff)return;if(!s||/Mock|Correct|meet/.test(s))niraMode("dance",2.6);else niraMode("spin",.8);niraSing(s)}
function niraReact(ok){if(!$("#ncat")||state.catOff)return;if(!$("#v-home").classList.contains("on")&&Math.random()<.5)return;if(ok)niraCheer("Correct! la la la ♪");else{niraMode("shake",1.4);niraSay(pick(["Oops! Try the next one.","Mistakes teach more than marks.","Shake it off. You've got this!"]),2200);sfx("no")}}
function niraHearts(){if(calmMotion.matches)return;for(let i=0;i<16;i++){const h=document.createElement("span");h.className="nheart";h.textContent="❤️";
  h.style.cssText=`left:${rnd(4,94)}vw;font-size:${rnd(13,24)}px;animation-delay:${rnd(0,1.4)}s;--dx:${rnd(-40,40)}px`;document.body.append(h);setTimeout(()=>h.remove(),5600)}}
function niraPoke(){
  const now=Date.now();nira.n++;nira.clicks=nira.clicks.filter(t=>now-t<2500).concat(now);
  if(nira.n%7==0){niraMode("dance",3);niraSay("Sunshine mode ON ☀️ ♪ la... la la ♪",4200,true);sfx("la");niraNotes();niraHearts()}
  else if(nira.clicks.length>=3){niraMode("sit",2.4);niraSay(nLine("pet"),2600);sfx("purr");niraNotes(["♥","♥","♥"])}
  else{sfx("meow");niraSay(Math.random()<.6?nLine("poke"):pick(NF));niraMode("sit",1.4)}}
function niraPlats(){const vh=innerHeight,vw=innerWidth;nira.pl=[...document.querySelectorAll(".card,.ntile,.sc,.nrow,.cro,.meter,.dev,.mfoot,nav a,.btn,.ring")].filter(e=>{const r=e.getBoundingClientRect();return r.width>56&&r.top>90&&r.top<vh-40&&r.left<vw&&r.right>0&&e.offsetParent!==null&&!e.closest(".ni")})}
function niraJump(el){
  const c=$("#ncat"),W=c.offsetWidth,H=c.offsetHeight,FY=H*.94,fx=nira.x+W/2,fy=nira.y+FY,G=1700;
  const cand=el?[[el,el.getBoundingClientRect()]]:nira.pl.filter(e=>e!==nira.plat).map(e=>[e,e.getBoundingClientRect()]).filter(([e,r])=>{const up=fy-r.top,gap=fx<r.left?r.left-fx:fx>r.right?fx-r.right:0;return up>-240&&up<300&&gap<240});
  if(!cand.length)return false;
  const [e,r]=pick(cand),h=fy-r.top,A=Math.max(h,0)+70,vy=-Math.sqrt(2*G*A),T=Math.sqrt(2*A/G)+Math.sqrt(2*(A-h)/G);
  const aim=el?(r.left+r.right)/2-W/2:fx-W/2+rnd(-35,35),px=Math.min(r.right-W*.7,Math.max(r.left-W*.3,aim));
  nira.vx=(px-nira.x)/T;nira.vy=vy;nira.dir=nira.vx>=0?1:-1;nira.plat=null;nira.bounced=1;niraMode("air",0);return true}
function niraFlip(){nira.plat=null;nira.vy=-600;nira.vx=nira.dir*50;nira.bounced=1;nira.age=0;niraMode("flip",0)}
function niraPick(){
  const home=$("#v-home").classList.contains("on"),reading=(nira.sayUntil-Date.now())/1000;
  /* kuch likha ho to chupchaap baitho, taaki padha ja sake */
  if(reading>0)return niraMode("sit",reading+1);
  /* [kaam, vazan, kam se kam sec, zyada se zyada] */
  const table=!home?[["walk",20,3,5],["sit",42,5,10],["wash",16,3,4],["sleep",18,8,14],["stretch",4,1.4,1.4]]
    :[["walk",28,3,6],["sit",24,4,8],["wash",11,3,4],["sleep",8,6,10],["stretch",6,1.4,1.4],["jump",10],["roll",4,1.6,1.6],["belly",4,2.5,4],["flip",2],["run",3,1,1.6]];
  let x=Math.random()*table.reduce((t,m)=>t+m[1],0);const m=table.find(m=>(x-=m[1])<0)||table[0];let [k,,a,b]=m;
  if(Math.random()<.25)nira.dir*=-1;
  if(k=="jump"){if(niraJump())return;k="walk";a=3;b=5}
  if(k=="flip")return niraFlip();
  niraMode(k,rnd(a,b))}

/* ---------- khilone: titli aur oon ka gola ---------- */
function niraToy(kind){
  const box=$("#nira");if(!box||nira.toy||calmMotion.matches)return;
  const el=document.createElement("button");el.type="button";el.className="ntoy";el.textContent=kind=="ball"?"🧶":"🦋";el.setAttribute("aria-label",kind=="ball"?"Yarn ball":"Butterfly");box.append(el);
  const t=nira.toy={kind,el,x:rnd(innerWidth*.25,innerWidth*.75),y:kind=="ball"?-30:innerHeight*.7,vx:rnd(-90,90)||60,vy:0,age:0,hits:0};
  el.onclick=()=>{t.vy=-520;t.vx=rnd(-260,260);t.hits=0;sfx("pop")};
  niraSay(nLine("toy"),2000);nira.goal="";niraMode("chase",8)}
function niraToyStep(dt){
  const t=nira.toy;if(!t)return;t.age+=dt;const vw=innerWidth,floor=innerHeight-26;
  if(t.kind=="ball"){t.vy+=900*dt;t.y+=t.vy*dt;t.x+=t.vx*dt;if(t.y>floor){t.y=floor;t.vy*=-.55;t.vx*=.985}if(t.x<10||t.x>vw-30){t.vx*=-1;t.x=Math.max(10,Math.min(vw-30,t.x))}}
  else{t.x+=t.vx*dt;t.y=innerHeight-120+Math.sin(t.age*3)*50-Math.max(0,t.age-7)*160;if(t.x<30||t.x>vw-40)t.vx*=-1}
  t.el.style.transform=`translate(${t.x}px,${t.y}px) rotate(${t.kind=="ball"?t.x*2:Math.sin(t.age*14)*14}deg)`;
  const c=$("#ncat"),cx=nira.x+c.offsetWidth/2;
  if(nira.mode=="chase"&&Math.abs(t.x-cx)<30&&t.hits<4){t.hits++;
    if(t.kind=="ball"){t.vx=nira.dir*rnd(160,300);t.vy=-rnd(150,320);sfx("pop")}else niraFlip()}
  if(t.age>10||t.y<-60&&t.age>2){t.el.remove();nira.toy=null}
  else if(nira.mode!="chase"&&nira.mode!="air"&&nira.mode!="flip"&&nira.mode!="drag"&&nira.mode!="land")niraMode("chase",3)}
function niraPaw(){const box=$("#nira"),c=$("#ncat");if(!box||calmMotion.matches)return;const p=document.createElement("span");p.className="npaw";p.textContent="🐾";
  p.style.cssText=`left:${nira.x+c.offsetWidth*(nira.dir>0?.3:.6)}px;top:${nira.y+c.offsetHeight*.84}px;--r:${nira.dir*90}deg`;box.prepend(p);setTimeout(()=>p.remove(),2600)}

/* ---------- naam ke BAGAL mein baithna ---------- */
const nPhone=()=>innerWidth<=900;
/* dialogue bolo, thoda ruko, phir niklo */
function niraBye(){if(niraSay(pick(NBYE),4200,true)){nira.leaveAt=nira.sayUntil-900;niraMode("sit",9e9)}}
const nameSpot=()=>[...document.querySelectorAll("aside .dev,.mfoot")].find(e=>e.offsetParent);
function nSpot(){
  const d=nameSpot(),c=$("#ncat");if(!d||!c)return null;const dr=d.getBoundingClientRect();if(dr.top<60||dr.bottom>innerHeight+6)return null;
  let right=0;const w=document.createTreeWalker(d.lastElementChild,NodeFilter.SHOW_TEXT),g=document.createRange();
  while(w.nextNode()){g.selectNodeContents(w.currentNode);right=Math.max(right,g.getBoundingClientRect().right)}
  const W=c.offsetWidth,H=c.offsetHeight;
  return{x:Math.min(innerWidth-W*.7,right+2-W*.224),y:Math.min(innerHeight-2,dr.bottom)-H*.94}}
function niraLeave(){nira.atName=false;nira.target=false;nira.plat=null;nira.vx=70;nira.vy=-330;nira.dir=1;nira.bounced=1;niraMode("air",0)}
function niraNameStep(sp,dt,now){
  if(!nira.atName){
    if(calmMotion.matches){nira.atName=true;niraMode("sit",9e9)}
    else{const h=nira.y-sp.y,A=Math.max(h,0)+60,T=Math.sqrt(2*A/1700)+Math.sqrt(2*Math.max(1,A-h)/1700);
      nira.plat=null;nira.target=true;nira.vy=-Math.sqrt(3400*A);nira.vx=(sp.x-nira.x)/T;nira.dir=nira.vx>=0?1:-1;niraMode("air",0);return}}
  nira.x=sp.x;nira.y=sp.y;nira.dir=-1;
  const want=nira.focus&&!nira.focus.brk?"sleep":"sit";nira.t-=dt;
  if(nira.mode!=want&&(nira.t<=0||!["land","sit","shake","laugh","spin","stretch","dance"].includes(nira.mode)))niraMode(want,9e9);
  if(want=="sit"&&now>nira.hbAt){nira.hbAt=now+5000;niraNotes(["♥","♥","♥"])}}

function niraQuiz(){const q=pick(NQ);nira.q=q;nira.qOpen=1;nira.quizAt=Date.now()+rnd(300000,420000);niraMode("sit",30);const b=$("#nbub");b.innerHTML=`<b>🧠 ${esc(nName())}, quick question!</b><br>${esc(q[0])}<div class="qz">${q[1].map((o,i)=>`<button data-nq="${i}">${esc(o)}</button>`).join("")}<button class="lt" data-nq="x">Later</button></div>`;niraPos(b);b.classList.add("on","qzb");nira.sayUntil=Date.now()+30000;clearTimeout(nira.bt);nira.bt=setTimeout(()=>niraAns("x"),30000);sfx("meow")}
function niraAns(i){if(!nira.qOpen)return;nira.qOpen=0;clearTimeout(nira.bt);const b=$("#nbub");b.classList.remove("qzb","on");const q=nira.q;
  if(i=="x"){nira.sayUntil=0;niraMode("walk",3)}else if(+i==q[2]){nira.sayUntil=0;niraCheer("Correct! la la la ♪")}else{niraMode("shake",1.4);niraSay("Oops! Answer: "+q[1][q[2]],4000,true);sfx("no")}}

function focusTick(){const f=nira.focus;if(!f)return;const left=f.end-Date.now();if(left<=0){niraFocusStop(0);return}const s=Math.ceil(left/1000),tm=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");$("#fbtn").textContent=(f.brk?"☕ ":"⏱ ")+tm;document.title="("+tm+") "+nira.ot}
function focusStart(m){if(m=="0"){niraFocusStop(1);return}const brk=m[0]=="b",mins=+(brk?m.slice(1):m);nira.focus={end:Date.now()+mins*6e4,brk,mins};try{localStorage.setItem("nira-focus",JSON.stringify(nira.focus))}catch(e){}nira.ot=nira.ot||document.title;nira.goal=brk?"":"focus";clearInterval(nira.fi);nira.fi=setInterval(focusTick,1000);focusTick();niraSay(brk?"Break time! Stretch and sip some water 💧":"Focus mode ON. I'll nap while you study 📚",3200,true);sfx("ok")}
function niraFocusStop(manual){const f=nira.focus;nira.focus=null;nira.goal="";clearInterval(nira.fi);try{localStorage.removeItem("nira-focus")}catch(e){}const b=$("#fbtn");if(b)b.textContent="⏱️";if(nira.ot){document.title=nira.ot;nira.ot=0}if(!$("#ncat"))return;
  if(manual){niraMode("walk",1);niraSay("Focus stopped. Back to playing! 🐾",2000,true)}else{sfx("bell");setTimeout(()=>sfx("meow"),800);niraMode("dance",4);niraSay(f&&f.brk?"Break over! Back to the books 📖":"Meow! Time's up! Great focus! 🎉",4000,true);niraNotes()}}

/* streak: local date (UTC nahi), pehla din bhi gina jata hai */
const dayKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function niraStreak(){try{const k="nira-days",d=JSON.parse(localStorage.getItem(k)||"[]"),c=new Date();if(!d.includes(dayKey(c))){d.push(dayKey(c));localStorage.setItem(k,JSON.stringify(d.slice(-60)))}let n=0;while(d.includes(dayKey(c))){n++;c.setDate(c.getDate()-1)}return n}catch(e){return 1}}

function niraIntro(){if($("#nintro")||!$("#ncat"))return;const e=document.createElement("div");e.id="nintro";e.className="ni";
  e.innerHTML=`<div class="nic" role="dialog" aria-label="Meet Nira"><canvas class="nip"></canvas><div><h3>Meow! I'm Nira, your engineer cat 🐱</h3><p>I'll keep you company while you prepare for RRB JE.</p><p>Hi <b>${esc(nName())}</b>! Sign in with Google and I'll call you by name 🐾</p><div class="cta"><button class="btn p" data-ni="hi">Say hi</button><button class="btn" data-ni="skip">Skip</button></div></div></div>`;
  document.body.append(e);const cv=e.querySelector("canvas");
  (function frame(){if(!cv.isConnected)return;drawCat(cv,"sit",0,0,1,0,0);if(!calmMotion.matches)requestAnimationFrame(frame)})()}

function niraPlace(){const c=$("#ncat");if(!c)return;c.classList.toggle("mini",!!nira.atName);c.style.visibility=nira.gone?"hidden":"";c.style.transform=`translate(${nira.x}px,${nira.y}px)`}
function niraBind(c){
  const hit=c.querySelector(".nhit");
  hit.addEventListener("pointerdown",e=>{try{hit.setPointerCapture(e.pointerId)}catch(_){}nAudio();const d=nira.drag={ox:e.clientX-nira.x,oy:e.clientY-nira.y,sx:e.clientX,sy:e.clientY,mv:0,hold:0};d.ht=setTimeout(()=>{if(nira.drag===d&&!d.mv){d.hold=1;sfx("purr");niraNotes(["♥","♥","♥"]);niraSay("Purrrrr... 😻",2200);niraMode("sit",3)}},600);e.preventDefault()});
  hit.addEventListener("pointermove",e=>{const d=nira.drag;if(!d)return;if(!d.mv&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>7){d.mv=1;clearTimeout(d.ht);nira.plat=null;nira.atName=false;nira.target=false;niraMode("drag",9e9);niraSay(nLine("drag"),2200)}if(d.mv){nira.x=e.clientX-d.ox;nira.y=e.clientY-d.oy;niraPlace()}});
  const up=()=>{const d=nira.drag;if(!d)return;nira.drag=null;clearTimeout(d.ht);
    if(d.mv){nira.vx=0;nira.vy=0;nira.bounced=0;niraMode("air",0)}
    else if(!d.hold){const n=Date.now();if(n-nira.lastUp<350&&nira.clicks.length<2){niraMode("spin",.8);niraSay("Wheee! 🌀",1500);sfx("pop");nira.clicks.push(n)}else niraPoke();nira.lastUp=n}};
  let rub=0,rubAt=0,px=0,petAt=0;
  hit.addEventListener("pointermove",e=>{if(nira.drag)return;const n=Date.now();if(n-rubAt>700)rub=0;else rub+=Math.abs(e.clientX-px);px=e.clientX;rubAt=n;
    if(rub>260&&n>petAt){rub=0;petAt=n+6000;niraMode("laugh",2);niraSay(nLine("pet"),2800);sfx("purr");niraNotes(["♥","♥","♥"])}});
  hit.addEventListener("pointerup",up);hit.addEventListener("pointercancel",up);
  hit.addEventListener("keydown",e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();niraPoke()}})}
/* 🐱 off: Nira screen par hi rehti hai, bas developer ke naam ke paas shaant baith jaati hai */
function niraStop(){niraSync()}
function niraRest(on){
  nira.rest=on;nira.goal="";const b=$("#catb");if(b)b.title=on?"Nira ko khelne do":"Nira ko aaram karne do";
  if(on){if(nira.qOpen){nira.qOpen=0;clearTimeout(nira.bt);$("#nbub").classList.remove("qzb","on")}const n=$("#nintro");if(n)n.remove();if(nira.toy){nira.toy.el.remove();nira.toy=null}niraBye()}
  else{nira.leaveAt=0;niraSay("I'm back, {n}! 🐾",2400,true);if(nira.atName)niraLeave();else niraMode("stretch",1.4);nira.quizAt=Date.now()+rnd(240000,300000)}}
function niraStep(dt,now){
  const c=$("#ncat"),W=c.offsetWidth,H=c.offsetHeight,FY=H*.94,vw=innerWidth,vh=innerHeight,floor=vh-4-FY,still=calmMotion.matches;
  if(nira.mode=="drag")return;
  const flying=nira.mode=="air"||nira.mode=="flip";
  if(nira.focus&&!nira.focus.brk&&!state.catOff)nira.goal="focus";
  if(!nira.goal&&!state.catOff&&now-nira.idleAt>45000&&!nira.focus&&!nira.qOpen&&!nira.toy&&now>nira.sayUntil){nira.goal="credit";if(!nira.atName&&!flying)niraBye()}
  const wantName=state.catOff||nira.goal=="credit";
  if(!wantName)nira.leaveAt=0;
  if(nira.gone){ /* phone par: screen ke bahar, jab tak naam wala hissa na dikhe */
    const sp=wantName&&nSpot();
    if(sp){nira.gone=false;nira.atName=true;nira.x=sp.x;nira.y=sp.y;niraMode("sit",9e9)}
    else{if(!wantName){nira.gone=false;nira.atName=false;nira.plat=null;nira.y=vh;nira.vy=-650;nira.vx=0;nira.bounced=1;niraMode("air",0)}return}}
  if(nira.sink){ /* neeche utar rahi hai */
    if(!wantName){nira.sink=false;nira.vy=-500;niraMode("air",0);return}
    nira.vy+=1100*dt;nira.y+=nira.vy*dt;if(nira.y>vh){nira.sink=false;nira.gone=true;$("#nbub").classList.remove("on")}return}
  if(wantName&&now<nira.leaveAt){if(!flying){if(nira.mode!="sit")niraMode("sit",9e9);if(nira.plat){const r=nira.plat.getBoundingClientRect();nira.y=r.top-FY}else nira.y=floor;return}}
  if(!flying){
    const sp=wantName?nSpot():null;
    if(wantName&&!sp&&nPhone()){
      if(nira.atName){nira.atName=false;nira.gone=true}
      else{nira.sink=true;nira.plat=null;nira.vy=-260;niraMode("air",0)}
      return}
    if(sp)return niraNameStep(sp,dt,now);
    if(nira.atName)return niraLeave();
    if(state.catOff){nira.plat=null;nira.y=floor;nira.x=Math.max(0,Math.min(vw-W,nira.x));if(nira.mode!="sit")niraMode("sit",9e9);return}}
  if(still&&!state.catOff){ /* shant mode: na ghoomna, na kudna */
    nira.plat=null;nira.y=floor;nira.x=Math.max(0,Math.min(vw-W,nira.x));
    const m=nira.focus&&!nira.focus.brk?"sleep":"sit";if(nira.mode!=m)niraMode(m,9e9);return}
  if(flying){const pf=nira.y+FY;nira.vy+=1700*dt;nira.x+=nira.vx*dt;nira.y+=nira.vy*dt;const nf=nira.y+FY;
    nira.x=Math.max(-W*.2,Math.min(vw-W*.8,nira.x));
    if(nira.target){const sp=nSpot();if(!sp)nira.target=false;else{if(nira.vy>0&&nira.y>=sp.y){nira.target=false;nira.atName=true;nira.x=sp.x;nira.y=sp.y;nira.vx=nira.vy=0;niraMode("land",.35)}return}}
    if(nira.vy>0){let best=null,bt=1e9;const cx=nira.x+W/2;
      for(const e of nira.pl){const r=e.getBoundingClientRect();if(cx>r.left-W*.2&&cx<r.right+W*.2&&r.top>=pf-3&&r.top<=nf+3&&r.top<bt&&(e!==nira.skip||now>nira.skipT)){bt=r.top;best=e}}
      const ground=best?bt:nf>=vh-4?vh-4:null;
      if(ground!==null){nira.plat=best;nira.y=ground-FY;
        if(!nira.bounced&&nira.vy>420){nira.bounced=1;nira.vy*=-.32;sfx("pop")}else{nira.vx=nira.vy=0;niraMode("land",.35)}}}
    return}
  let L=0,R=vw-W;
  if(nira.plat){const r=document.contains(nira.plat)&&nira.plat.getBoundingClientRect();
    if(!r||!r.width||r.top<60||r.top>vh-10||r.right<0||r.left>vw){nira.plat=null;nira.vx=nira.vy=0;nira.bounced=1;niraMode("air",0);return}
    nira.y=r.top-FY;L=r.left-W*.3;R=r.right-W*.7;if(R<L)R=L}else nira.y=floor;
  const drop=vx=>{nira.skip=nira.plat;nira.skipT=now+800;nira.plat=null;nira.vx=vx;nira.vy=0;nira.bounced=1;niraMode("air",0)};
  if(nira.goal=="focus"){
    if(nira.mode=="sleep")return;if(nira.plat)return drop(40);
    const tx=vw-W-12;if(Math.abs(nira.x-tx)<8){niraMode("sleep",9e9);niraSay("zzz... focus time. I'll guard your study! 😴",2600)}else{nira.dir=tx>nira.x?1:-1;niraMode("walk",9e9);nira.x+=nira.dir*60*dt}return}
  const sp={w:60,run:175,chase:135}[nira.mode];
  if(sp){
    if(nira.mode=="chase"){const tx=(nira.toy?nira.toy.x:nira.mx)-W/2;if(nira.toy){nira.dir=tx>nira.x?1:-1}else if(now-nira.mAt>4000)niraMode("walk",2);else if(Math.abs(tx-nira.x)<26){niraMode("laugh",1.6);niraSay("Got you! hehe 😹",1600);sfx("hehe")}else nira.dir=tx>nira.x?1:-1}
    nira.x+=nira.dir*sp*dt;
    if(nira.x<L||nira.x>R){if(nira.plat&&(nira.goal||Math.random()<.5))return drop(nira.dir*70);nira.x=Math.max(L,Math.min(R,nira.x));nira.dir*=-1}}
  nira.t-=dt;if(nira.t<=0)niraPick()}

function niraLoop(ts){
  const c=$("#ncat");if(!c){nira.raf=0;return}
  nira.raf=requestAnimationFrame(niraLoop);
  const dt=Math.min(.05,(ts-(nira.last||ts))/1000),now=Date.now();nira.last=ts;
  nira.age+=dt;nira.phase=(nira.phase+dt*(nira.mode=="run"?2.6:nira.mode=="chase"?1.9:1.15))%1;
  if(!state.catOff&&ts-nira.plT>600){niraPlats();nira.plT=ts}
  niraStep(dt,now);niraToyStep(dt);
  const free=!state.catOff&&!nira.gone&&!nira.sink&&!nira.focus&&!nira.goal&&!document.hidden&&!$("#nintro")&&!nira.drag;
  if(free&&$("#v-home").classList.contains("on")&&!nira.qOpen&&!nira.toy&&now>nira.toyAt&&nira.mode!="air"&&nira.mode!="flip"){nira.toyAt=now+rnd(120000,200000);niraToy(pick(["ball","fly"]))}
  if((nira.mode=="run"||nira.mode=="chase")&&ts>nira.pawAt){nira.pawAt=ts+190;niraPaw()}
  /* login hua to naam se swagat, na ho to kabhi kabhi yaad dilana */
  const who=typeof user!="undefined"&&user?user.id:null;
  if(who&&who!==nira.who){nira.who=who;if(!state.catOff){niraCheer("Oh, so you are {n}! 💛")}}else if(!who)nira.who=null;
  if(free&&!nira.qOpen&&nira.asked<2&&now>nira.loginAt&&now>nira.sayUntil&&nira.mode!="air"&&nira.mode!="flip"){if(niraAskLogin()){nira.asked++;nira.loginAt=now+rnd(480000,600000)}else nira.loginAt=now+20000}
  if(!state.catOff&&!nira.qOpen&&!document.hidden&&!$("#nintro")&&!nira.drag&&nira.mode!="air"){
    if(now>nira.quizAt&&now>nira.sayUntil&&!nira.focus)niraQuiz();
    else if(now>nira.talkAt&&nira.mode!="sleep"){nira.talkAt=now+rnd(100000,170000);niraSay(Math.random()<.2?nTimeLine():pick(NF))}}
  niraPlace();
  /* sone ya shant mode mein kam frames: battery bachti hai */
  if(ts-nira.drawT<(nira.mode=="sleep"||calmMotion.matches?90:0))return;nira.drawT=ts;
  const look=nira.mx<0?0:Math.max(-1.6,Math.min(1.6,(nira.mx-nira.x-c.offsetWidth/2)/150))*nira.dir;
  drawCat(c.querySelector("canvas"),nira.mode,nira.age,nira.phase,nira.dir,nira.vy,look)}

function niraSync(){
  const sb=$("#sndb");if(sb)sb.textContent=state.mute?"🔇":"🔊";
  if($("#nira")){if(state.catOff&&nira.toy){nira.toy.el.remove();nira.toy=null}if(!!state.catOff!==nira.rest)niraRest(!!state.catOff);return}
  const e=document.createElement("div");e.id="nira";e.className="nira";
  e.innerHTML=`<div class="nc air" id="ncat"><div class="nb" id="nbub"></div><span class="zz">z z z</span><canvas aria-hidden="true"></canvas><div class="nhit" tabindex="0" role="button" aria-label="Nira the engineer cat"></div></div>`;
  document.body.append(e);const c=$("#ncat");
  Object.assign(nira,{x:Math.max(10,innerWidth*.35),y:-160,vx:0,vy:0,mode:"air",dir:1,plat:null,goal:"",last:0,bounced:0,idleAt:Date.now(),quizAt:Date.now()+rnd(240000,300000),talkAt:Date.now()+60000,qOpen:0,drag:null,atName:false,target:false,toy:null,toyAt:Date.now()+75000,loginAt:Date.now()+45000,asked:0,sayUntil:0,gone:false,sink:false,leaveAt:0,pawAt:0,who:null});
  niraBind(c);nira.rest=!!state.catOff;
  try{const f=JSON.parse(localStorage.getItem("nira-focus")||"null");if(f&&f.end>Date.now()){nira.focus=f;nira.ot=document.title;nira.goal=f.brk?"":"focus";clearInterval(nira.fi);nira.fi=setInterval(focusTick,1000);focusTick()}}catch(_){}
  let seen=1;try{seen=localStorage.getItem("nira-intro-v3")}catch(_){}
  const n=niraStreak();
  if(!seen&&!state.catOff)setTimeout(niraIntro,1800);else if(!state.catOff) setTimeout(()=>niraSay(n>=3?n+" days in a row, {n}! You are on fire 🔥":n==2?"Day 2 in a row, {n}! So proud 🔥":nTimeLine(),5000),2200);
  nira.raf=requestAnimationFrame(niraLoop)}

["mousemove","keydown","scroll","touchstart","wheel","click"].forEach(ev=>addEventListener(ev,e=>{nira.idleAt=Date.now();if(ev=="mousemove"){nira.mx=e.clientX;nira.my=e.clientY;nira.mAt=Date.now()}if(nira.goal=="credit"&&!state.catOff){nira.goal="";nira.t=Math.min(nira.t,1)}},{passive:true}));

/* dark / light badalne par angdaai (dark mein aankhein chamakti hain) */
new MutationObserver(()=>{if($("#ncat")&&!["air","drag"].includes(nira.mode)&&!nira.focus)niraMode("stretch",1.4)}).observe(document.documentElement,{attributeFilter:["data-theme"]});
addEventListener("click",e=>{if(e.target.dataset&&e.target.dataset.ni)try{localStorage.setItem("nira-intro-v3","1")}catch(_){}},true);
