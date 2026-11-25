/* Nira: realistic canvas cat. Main script se pehle load karo.
   Uses at runtime: state, $, esc (index.html se). */

/* Asli recording lagani ho to file ka path yahan likho, jaise meow:["sounds/meow1.mp3","sounds/meow2.mp3"].
   Khali list = code se bani awaaz. */
const NIRA_SOUNDS={meow:[],purr:[],la:[],hehe:[]};

const NF=["Purr-fect circuit, human!","I'm a cat-ode, not an anode. Get it? 😹","Ohm my god, you clicked me again!","Resistance is futile. Just like resisting my cuteness.","Who needs a CRO when you have a cat-ode ray tube? 🐱","My tail wags at 2 Hz. I measured it myself.","Cats nap 16 hours a day. You only need 2 more topics today!","Don't touch the capacitor. Touch ME instead.","Study = current. Breaks = resistance. Keep the flow!","Wah wah! You're doing great, future JE! 🎉","Meow = Mega Electronics On Watch!","Ohm's law: V = IR. Tattoo it on your brain!","A wrong answer costs 1/3 mark. Skip if unsure!","Every great circuit starts with a good ground."];
const NQ=[["AND gate: 1 aur 0 ka output?",["0","1","Undefined"],0],["Unit of capacitance?",["Henry","Farad","Ohm"],1],["A diode conducts in which bias?",["Forward","Reverse","Both"],0],["Decimal 5 in binary?",["101","110","011"],0],["Ideal op-amp input impedance?",["Zero","Infinite","50 ohm"],1],["8085 is a ___ bit microprocessor.",["4","8","16"],1],["Which gate is universal?",["XOR","NAND","AND"],1],["AC frequency in India?",["50 Hz","60 Hz","100 Hz"],0],["Diodes in a bridge rectifier?",["2","4","6"],1],["PN junctions in an SCR?",["2","3","4"],1],["Unit of inductance?",["Henry","Farad","Tesla"],0],["Power = ?",["V x I","V / I","I / V"],0],["Kirchhoff's current law is based on conservation of?",["Energy","Charge","Momentum"],1],["An ADC converts?",["Digital to analog","Analog to digital","AC to DC"],1],["In series resonance, XL equals?",["XC","R","0"],0]];

const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const calmMotion=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
let nira={x:60,y:-220,vx:0,vy:0,dir:1,mode:"air",t:0,age:0,phase:0,plat:null,raf:0,last:0,drawT:0,n:0,clicks:[],bt:0,idleAt:Date.now(),mx:-1,my:-1,mAt:0,pl:[],plT:0,drag:null,goal:"",quizAt:0,talkAt:0,qOpen:0,hbAt:0,lastUp:0,focus:null,fi:0,ot:0,q:null,bounced:0,skip:null,skipT:0};

/* ---------- SOUND ---------- */
let AC=null,NBUF={},NNOISE=null;
function nAudio(){
  if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return null;
  try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state=="suspended")AC.resume()}catch(e){return null}
  if(!NNOISE){NNOISE=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NNOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    for(const k in NIRA_SOUNDS)NIRA_SOUNDS[k].forEach(u=>fetch(u).then(r=>r.arrayBuffer()).then(b=>AC.decodeAudioData(b)).then(b=>(NBUF[k]=NBUF[k]||[]).push(b)).catch(()=>console.warn("Nira sound load nahi hua: "+u)))}
  return AC}
/* curve = [[time,value],...] */
function nCurve(p,T,curve){p.setValueAtTime(curve[0][1],T+curve[0][0]);curve.slice(1).forEach(([t,v])=>p.linearRampToValueAtTime(v,T+t))}
/* Gale ki awaaz (do saw + saans) teen formant filters se guzarti hai, jaise munh khulta aur band hota hai */
function nVoice(a,T,dur,pitch,formants,vol,vib){
  const out=a.createGain(),src=a.createGain();out.connect(a.destination);
  nCurve(out.gain,T,[[0,0],[.06*dur,vol*.5],[.3*dur,vol],[.7*dur,vol*.7],[dur,0]]);
  const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=vib[0];lg.gain.value=vib[1];lfo.connect(lg);
  const nodes=[lfo];
  [0,9].forEach(det=>{const o=a.createOscillator();o.type="sawtooth";o.detune.value=det;nCurve(o.frequency,T,pitch.map(([t,v])=>[t*dur,v]));lg.connect(o.frequency);const g=a.createGain();g.gain.value=.5;o.connect(g);g.connect(src);nodes.push(o)});
  const br=a.createBufferSource(),bg=a.createGain();br.buffer=NNOISE;bg.gain.value=.12;br.connect(bg);bg.connect(src);nodes.push(br);
  formants.forEach(([curve,q,level])=>{const f=a.createBiquadFilter(),g=a.createGain();f.type="bandpass";f.Q.value=q;g.gain.value=level;nCurve(f.frequency,T,curve.map(([t,v])=>[t*dur,v]));src.connect(f);f.connect(g);g.connect(out)});
  nodes.forEach(n=>{n.start(T);n.stop(T+dur+.05)})}
function nPurr(a,T){
  const s=a.createBufferSource(),f=a.createBiquadFilter(),am=a.createGain(),env=a.createGain(),l=a.createOscillator(),lg=a.createGain();
  s.buffer=NNOISE;s.loop=true;f.type="lowpass";f.frequency.value=260;am.gain.value=.5;l.type="sawtooth";l.frequency.value=26;lg.gain.value=-.5;
  l.connect(lg);lg.connect(am.gain);s.connect(f);f.connect(am);am.connect(env);env.connect(a.destination);
  nCurve(env.gain,T,[[0,0],[.15,.9],[.8,.55],[.95,.15],[1.15,.8],[1.9,.5],[2.2,0]]);
  s.start(T);l.start(T);s.stop(T+2.25);l.stop(T+2.25)}
function sfx(k){
  if(state.mute)return;const a=nAudio();if(!a)return;const T=a.currentTime+.01;
  if(NBUF[k]){const s=a.createBufferSource();s.buffer=pick(NBUF[k]);s.connect(a.destination);s.start(T);return}
  const p=rnd(.92,1.1);
  const tone=(f,s,d,ty,v)=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.value=f;nCurve(g.gain,T+s,[[0,0],[.02,v],[d,0]]);o.connect(g);g.connect(a.destination);o.start(T+s);o.stop(T+s+d+.02)};
  if(k=="meow")nVoice(a,T,rnd(.6,.85),[[0,480*p],[.28,760*p],[.55,700*p],[1,430*p]],
      [[[[0,350],[.3,900],[.65,1100],[1,500]],5,1.4],[[[0,2300],[.3,2000],[.65,1500],[1,900]],8,.9],[[[0,3300],[1,2800]],9,.35]],.5,[7,14]);
  else if(k=="la")[392,440,523].forEach((n,i)=>nVoice(a,T+i*.27,i==2?.5:.25,[[0,n*.94],[.2,n],[1,n]],
      [[[[0,350],[.2,850],[1,850]],7,1.5],[[[0,1700],[.2,1250],[1,1250]],9,.8],[[[0,2900],[1,2900]],10,.25]],.38,[5.5,n*.016]));
  else if(k=="hehe")[0,1,2,3].forEach(i=>nVoice(a,T+i*.12,.09,[[0,760*p-i*35],[1,600*p-i*35]],[[[[0,800],[1,700]],5,1.3],[[[0,1900],[1,1700]],7,.7]],.32,[1,0]));
  else if(k=="purr")nPurr(a,T);
  else if(k=="bell")[880,1175,1480].forEach((f,i)=>tone(f,i*.25,.6,"sine",.18));
  else if(k=="pop")tone(520,0,.08,"triangle",.1);
  else if(k=="ok"){tone(660,0,.15,"triangle",.14);tone(880,.1,.15,"triangle",.14)}
  else if(k=="no")nVoice(a,T,.4,[[0,380],[1,260]],[[[[0,600],[1,400]],5,1.4],[[[0,1200],[1,800]],7,.6]],.4,[9,10])}

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
  c.restore()}
function collar(c,x,y){c.strokeStyle="#b3261e";c.lineWidth=3.2;c.beginPath();c.moveTo(x-11,y-3);c.quadraticCurveTo(x,y+5,x+11,y-3);c.stroke();
  const g=c.createRadialGradient(x-1,y+4,.5,x,y+5,4);g.addColorStop(0,"#fff0a8");g.addColorStop(1,"#b8860b");c.fillStyle=g;c.fill(ell(x,y+5,3.4,3.4))}

/* mode + time -> ek frame */
function drawCat(cv,mode,age,phase,dir,vy,look){
  if(!SPR)buildSprites();
  const dpr=Math.min(3,window.devicePixelRatio||1),W=cv.clientWidth||170,H=cv.clientHeight||130;
  if(cv.width!=Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  const c=cv.getContext("2d");c.setTransform(cv.width/170,0,0,cv.height/130,0,0);c.clearRect(0,0,170,130);
  const t=age,S=Math.sin,still=calmMotion.matches,breath=still?0:S(performance.now()/620),blink=performance.now()%4300<140?0:1;
  const o={eye:blink,look:look||0,wide:mode=="chase"||mode=="drag"||mode=="air",mouth:0,twitch:performance.now()%2900<160?1.2:0};
  if(mode!="air"&&mode!="drag"){c.fillStyle="rgba(20,10,0,.2)";c.fill(ell(84,123,mode=="sleep"?50:44,4))}
  if(dir<0){c.translate(170,0);c.scale(-1,1)}
  const wag=still?0:S(performance.now()/(mode=="chase"||mode=="laugh"?170:540));
  if(mode=="sleep"){
    put(c,SPR.loaf,80,93,0,1+breath*.008,1+breath*.025);
    c.save();c.translate(112,99+breath*.7);c.scale(.96,.96);o.eye=0;head(c,0,0,.28,o);c.restore();
    tail(c,[[40,103],[26,130],[80,124],[112+wag*2,118]],5);return}
  if(mode=="spin"){c.translate(84,0);c.scale(Math.cos(t/.8*Math.PI*2)||.02,1);c.translate(-84,0)}
  if(mode=="roll"){const k=Math.min(1,t/1.6),e=k*k*(3-2*k);c.translate(84,92);c.rotate(e*Math.PI*2);c.translate(-84,-92)}
  if(["sit","wash","shake","laugh"].includes(mode)){
    const wash=mode=="wash",lap=S(t*9);
    if(mode=="laugh"){o.eye=0;o.mouth=.6+.4*Math.abs(S(t*14));c.translate(0,-Math.abs(S(t*14))*2)}
    tail(c,[[62,110],[24,128],[62,127],[108+wag*7,119-Math.max(0,wag)*5]],5);
    leg(c,SPR.fu,SPR.fl,94,86,99,118,1,true);
    put(c,SPR.body,85,86,-.86,.92,1+breath*.018);
    leg(c,SPR.hu,SPR.hl,66,106,88,119,-1);put(c,SPR.haunch,69,102,-.2);
    if(wash)leg(c,SPR.fu,SPR.fl,103,84,114+lap,70+lap*3,1);else leg(c,SPR.fu,SPR.fl,103,86,108,118,1);
    collar(c,108,67);
    if(wash){o.eye=.1;o.mouth=lap>0?.45:0}
    head(c,wash?111:109,(wash?55+lap*2:47)+breath*.5,wash?.3+lap*.05:mode=="shake"?S(t*26)*.22*Math.max(0,1-t):S(performance.now()/1900)*.05,o);return}
  /* khadi, chalti, daudti, kudti */
  const walk=mode=="w",run=mode=="run",air=mode=="air",drag=mode=="drag",dance=mode=="dance",str=mode=="stretch";
  let bob=breath*.4,pitch=0,sh=[104,85],hip=[60,85];
  const feet={hf:[58,119],hn:[66,119],ff:[104,119],fn:[112,119]};
  if(walk||run){const stride=run?19:11,lift=run?10:6,off=run?{hf:0,hn:.08,ff:.5,fn:.58}:{hf:0,ff:.25,hn:.5,fn:.75};
    for(const k in feet){const p=(phase+off[k])%1,duty=run?.45:.65;
      if(p<duty)feet[k][0]+=stride*(1-2*p/duty);else{const s=(p-duty)/(1-duty);feet[k][0]+=stride*(2*s-1);feet[k][1]-=S(s*Math.PI)*lift}}
    bob=run?S(phase*6.283)*4:S(phase*12.566)*1.1;pitch=run?S(phase*6.283+1)*.1:0}
  if(air){const up=vy<0;pitch=Math.max(-.35,Math.min(.35,vy/1600));feet.fn=[up?128:124,up?96:114];feet.ff=[up?122:116,up?100:116];feet.hn=[up?40:60,up?108:104];feet.hf=[up?34:52,up?104:102]}
  if(drag){const s=still?0:S(performance.now()/180)*3;pitch=-.42;sh=[104,70];hip=[66,92];feet.fn=[114+s,102];feet.ff=[106-s,101];feet.hn=[66-s,124];feet.hf=[56+s,122];o.mouth=.35}
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
  collar(c,hx-2,hy+17);head(c,hx,hy,dance?S(t*4)*.2:run?pitch*.5:0,o)}

/* ---------- BEHAVIOUR ---------- */
function niraPos(b){b.className="nb"+(nira.x<140?" bl":nira.x>innerWidth-260?" br":"")+(nira.y<90?" bd":"")}
function niraSay(s,ms){const b=$("#nbub");if(!b||nira.qOpen)return;b.textContent=s;niraPos(b);b.classList.add("on");clearTimeout(nira.bt);nira.bt=setTimeout(()=>b.classList.remove("on"),ms||3400)}
function niraNotes(ch){const c=$("#ncat");if(!c)return;(ch||["♪","♫","♪"]).forEach((x,i)=>{const n=document.createElement("span");n.className="nt";n.textContent=x;n.style.cssText="--dx:"+(i*26-26)+"px;left:"+(30+i*24)+"%;animation-delay:"+i*.2+"s"+(x=="♥"?";color:#ff5ca8":"");c.append(n);setTimeout(()=>n.remove(),2400)})}
function niraMode(m,t){const mode={walk:"w",chase:"chase"}[m]||m;if(nira.mode!=mode)nira.age=0;nira.mode=mode;nira.t=t;const c=$("#ncat");if(c)c.className="nc "+mode}
function niraSing(s,ms){niraSay(s||"la la la ♪",ms||2800);sfx("la");niraNotes()}
/* Mock / sahi jawab = naach, topic complete = khushi mein ghoomna */
function niraCheer(s){if(!$("#ncat"))return;if(!s||/Mock|Correct|meet/.test(s))niraMode("dance",2.6);else niraMode("spin",.8);niraSing(s)}
function niraReact(ok){if(!$("#ncat"))return;if(!$("#v-home").classList.contains("on")&&Math.random()<.5)return;if(ok)niraCheer("Correct! la la la ♪");else{niraMode("shake",1.4);niraSay(pick(["Oops! Try the next one.","Mistakes teach more than marks.","Shake it off. You've got this!"]),2200);sfx("no")}}
function niraPoke(){
  const now=Date.now();nira.n++;nira.clicks=nira.clicks.filter(t=>now-t<2500).concat(now);
  if(nira.n%7==0){niraMode("dance",3);niraSay("Nira says: sunshine mode ON ☀️",3600);sfx("meow");niraNotes();const s=document.createElement("div");s.className="sunfx";s.textContent="☀️";document.body.append(s);setTimeout(()=>s.remove(),3700)}
  else if(nira.clicks.length>=3){niraMode("sit",2.4);niraSay("Purrrrr... 😻",2200);sfx("purr");niraNotes(["♥","♥","♥"])}
  else{sfx("meow");niraSay("Meow! "+pick(NF));niraMode("sit",1.4)}}
function niraPlats(){const vh=innerHeight,vw=innerWidth;nira.pl=[...document.querySelectorAll(".card,.ntile,.sc,.nrow,.cro,.meter,.dev,.mfoot,nav a,.btn,.ring")].filter(e=>{const r=e.getBoundingClientRect();return r.width>56&&r.top>90&&r.top<vh-40&&r.left<vw&&r.right>0&&e.offsetParent!==null&&!e.closest(".ni")})}
function niraJump(el){
  const c=$("#ncat"),W=c.offsetWidth,H=c.offsetHeight,FY=H*.94,fx=nira.x+W/2,fy=nira.y+FY,G=1700;
  const cand=el?[[el,el.getBoundingClientRect()]]:nira.pl.filter(e=>e!==nira.plat).map(e=>[e,e.getBoundingClientRect()]).filter(([e,r])=>{const up=fy-r.top,gap=fx<r.left?r.left-fx:fx>r.right?fx-r.right:0;return up>-240&&up<300&&gap<240});
  if(!cand.length)return false;
  const [e,r]=pick(cand),h=fy-r.top,A=Math.max(h,0)+70,vy=-Math.sqrt(2*G*A),T=Math.sqrt(2*A/G)+Math.sqrt(2*(A-h)/G);
  const aim=el?(r.left+r.right)/2-W/2:fx-W/2+rnd(-35,35),px=Math.min(r.right-W*.7,Math.max(r.left-W*.3,aim));
  nira.vx=(px-nira.x)/T;nira.vy=vy;nira.dir=nira.vx>=0?1:-1;nira.plat=null;nira.bounced=1;niraMode("air",0);sfx("pop");return true}
function niraPick(){
  const calm=!$("#v-home").classList.contains("on"),r=Math.random()*100;let m;
  if(calm)m=r<40?["walk",rnd(4,8)]:r<62?["sit",rnd(3,6)]:r<76?["wash",rnd(2.5,4)]:r<90?["sleep",rnd(6,10)]:["stretch",1.4];
  else m=r<20?["walk",rnd(4,8)]:r<31?["run",rnd(1.4,2.4)]:r<52?["jump",0]:r<60?["chase",rnd(3,5)]:r<65?["spin",.8]:r<70?["roll",1.6]:r<76?["laugh",2]:r<82?["dance",2.6]:r<89?["wash",3]:r<96?["sit",rnd(3,5)]:["sleep",rnd(4,6)];
  if(m[0]=="jump"){if(niraJump())return;m=["walk",rnd(3,6)]}
  if(m[0]=="chase"&&Date.now()-nira.mAt>3000)m=["walk",3];
  if(Math.random()<.4)nira.dir*=-1;
  niraMode(m[0],m[1]);
  if(m[0]=="laugh"){niraSay("hehe 😹",1800);sfx("hehe")}
  if(m[0]=="dance")niraSing();
  if(m[0]=="spin"||m[0]=="roll")sfx("pop")}
function niraCredit(){
  /* desktop par sidebar wala naam, mobile par neeche wala */
  const d=[...document.querySelectorAll("aside .dev,.mfoot")].find(e=>e.offsetParent),c=$("#ncat"),W=c.offsetWidth;
  const heart=()=>{if(Date.now()>nira.hbAt){nira.hbAt=Date.now()+3500;niraNotes(["♥","♥","♥"]);if(Math.random()<.4)niraSay(pick(["Sitting with my favourite developer 😸","Rakesh Kumar Dudhawal made me. I approve. 🐾","Psst... go study!"]),2600)}};
  if(d&&nira.plat===d){niraMode("sit",1.5);heart();return}
  if(d){const r=d.getBoundingClientRect();if(r.top>90&&r.top<innerHeight-10){const cx=nira.x+W/2,tx=(r.left+r.right)/2,fy=nira.y+c.offsetHeight*.94;
    if(Math.abs(cx-tx)<260&&!nira.plat&&Math.abs(fy-r.top)<300&&niraJump(d))return;
    nira.dir=tx>cx?1:-1;niraMode("run",nira.plat?3:Math.min(Math.abs(tx-cx)/150+.2,4));return}}
  niraMode("sit",3);heart()}
function niraQuiz(){const q=pick(NQ);nira.q=q;nira.qOpen=1;nira.quizAt=Date.now()+rnd(150000,240000);niraMode("sit",15);const b=$("#nbub");b.innerHTML=`<b>🧠 Quick quiz!</b><br>${esc(q[0])}<div class="qz">${q[1].map((o,i)=>`<button data-nq="${i}">${esc(o)}</button>`).join("")}<button class="lt" data-nq="x">Later</button></div>`;niraPos(b);b.classList.add("on","qzb");clearTimeout(nira.bt);nira.bt=setTimeout(()=>niraAns("x"),15000);sfx("meow")}
function niraAns(i){if(!nira.qOpen)return;nira.qOpen=0;clearTimeout(nira.bt);const b=$("#nbub");b.classList.remove("qzb","on");const q=nira.q;
  if(i=="x"){niraSay("Maybe later 😺",1800);niraMode("walk",3)}else if(+i==q[2])niraCheer("Correct! la la la ♪");else{niraMode("shake",1.4);niraSay("Oops! Answer: "+q[1][q[2]],3200);sfx("no")}}

function focusTick(){const f=nira.focus;if(!f)return;const left=f.end-Date.now();if(left<=0){niraFocusStop(0);return}const s=Math.ceil(left/1000),tm=Math.floor(s/60)+":"+String(s%60).padStart(2,"0");$("#fbtn").textContent=(f.brk?"☕ ":"⏱ ")+tm;document.title="("+tm+") "+nira.ot}
function focusStart(m){if(m=="0"){niraFocusStop(1);return}const brk=m[0]=="b",mins=+(brk?m.slice(1):m);nira.focus={end:Date.now()+mins*6e4,brk,mins};try{localStorage.setItem("nira-focus",JSON.stringify(nira.focus))}catch(e){}nira.ot=nira.ot||document.title;nira.goal=brk?"":"focus";clearInterval(nira.fi);nira.fi=setInterval(focusTick,1000);focusTick();niraSay(brk?"Break time! Stretch and sip some water 💧":"Focus mode ON. I'll nap while you study. Go go go! 📚",3200);sfx("ok")}
function niraFocusStop(manual){const f=nira.focus;nira.focus=null;nira.goal="";clearInterval(nira.fi);try{localStorage.removeItem("nira-focus")}catch(e){}const b=$("#fbtn");if(b)b.textContent="⏱️";if(nira.ot){document.title=nira.ot;nira.ot=0}if(!$("#ncat"))return;
  if(manual){niraMode("walk",1);niraSay("Focus stopped. Back to playing! 🐾",2000)}else{sfx("bell");setTimeout(()=>sfx("meow"),800);niraMode("dance",4);niraSay(f&&f.brk?"Break over! Back to the books 📖":"Meow! Time's up! Great focus! 🎉",4000);niraNotes()}}

/* streak: local date (UTC nahi), pehla din bhi gina jata hai */
const dayKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function niraStreak(){try{const k="nira-days",d=JSON.parse(localStorage.getItem(k)||"[]"),c=new Date();if(!d.includes(dayKey(c))){d.push(dayKey(c));localStorage.setItem(k,JSON.stringify(d.slice(-60)))}let n=0;while(d.includes(dayKey(c))){n++;c.setDate(c.getDate()-1)}return n}catch(e){return 1}}

function niraIntro(){if($("#nintro")||!$("#ncat"))return;const e=document.createElement("div");e.id="nintro";e.className="ni";
  e.innerHTML=`<div class="nic" role="dialog" aria-label="Meet Nira"><canvas class="nip"></canvas><div><h3>Meow! I'm Nira, your engineer cat 🐱</h3><p>I'll keep you company while you prepare for RRB JE.</p><div class="cta"><button class="btn p" data-ni="hi">Say hi</button><button class="btn" data-ni="skip">Skip</button></div></div></div>`;
  document.body.append(e);const cv=e.querySelector("canvas");
  (function frame(){if(!cv.isConnected)return;drawCat(cv,"sit",0,0,1,0,0);if(!calmMotion.matches)requestAnimationFrame(frame)})()}

function niraPlace(){const c=$("#ncat");if(c)c.style.transform=`translate(${nira.x}px,${nira.y}px)`}
function niraBind(c){
  const hit=c.querySelector(".nhit");
  hit.addEventListener("pointerdown",e=>{try{hit.setPointerCapture(e.pointerId)}catch(_){}nAudio();const d=nira.drag={ox:e.clientX-nira.x,oy:e.clientY-nira.y,sx:e.clientX,sy:e.clientY,mv:0,hold:0};d.ht=setTimeout(()=>{if(nira.drag===d&&!d.mv){d.hold=1;sfx("purr");niraNotes(["♥","♥","♥"]);niraSay("Purrrrr... 😻",2200);niraMode("sit",3)}},600);e.preventDefault()});
  hit.addEventListener("pointermove",e=>{const d=nira.drag;if(!d)return;if(!d.mv&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>7){d.mv=1;clearTimeout(d.ht);nira.plat=null;niraMode("drag",9e9);niraSay("Wheee! Put me down gently! 🙀",1800)}if(d.mv){nira.x=e.clientX-d.ox;nira.y=e.clientY-d.oy;niraPlace()}});
  const up=()=>{const d=nira.drag;if(!d)return;nira.drag=null;clearTimeout(d.ht);
    if(d.mv){nira.vx=0;nira.vy=0;nira.bounced=0;niraMode("air",0)}
    else if(!d.hold){const n=Date.now();if(n-nira.lastUp<350&&nira.clicks.length<2){niraMode("spin",.8);niraSay("Wheee! 🌀",1500);sfx("pop");nira.clicks.push(n)}else niraPoke();nira.lastUp=n}};
  hit.addEventListener("pointerup",up);hit.addEventListener("pointercancel",up);
  hit.addEventListener("keydown",e=>{if(e.key=="Enter"||e.key==" "){e.preventDefault();niraPoke()}})}
function niraStop(){cancelAnimationFrame(nira.raf);nira.raf=0;nira.qOpen=0;const e=$("#nira");if(e)e.remove()}

function niraStep(dt,now){
  const c=$("#ncat"),W=c.offsetWidth,H=c.offsetHeight,FY=H*.94,vw=innerWidth,vh=innerHeight,floor=vh-4-FY,still=calmMotion.matches;
  if(nira.mode=="drag")return;
  if(still){ /* shant mode: na ghoomna, na kudna */
    nira.plat=null;nira.y=floor;nira.x=Math.max(0,Math.min(vw-W,nira.x));
    const m=nira.focus&&!nira.focus.brk?"sleep":"sit";if(nira.mode!=m)niraMode(m,9e9);return}
  if(nira.mode=="air"){const pf=nira.y+FY;nira.vy+=1700*dt;nira.x+=nira.vx*dt;nira.y+=nira.vy*dt;const nf=nira.y+FY;
    nira.x=Math.max(-W*.2,Math.min(vw-W*.8,nira.x));
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
  if(nira.focus&&!nira.focus.brk)nira.goal="focus";
  if(!nira.goal&&now-nira.idleAt>20000&&!nira.focus&&!nira.qOpen)nira.goal="credit";
  if(nira.goal=="focus"){
    if(nira.mode=="sleep")return;if(nira.plat)return drop(40);
    const tx=vw-W-12;if(Math.abs(nira.x-tx)<8){niraMode("sleep",9e9);niraSay("zzz... focus time. I'll guard your study! 😴",2600)}else{nira.dir=tx>nira.x?1:-1;niraMode("walk",9e9);nira.x+=nira.dir*60*dt}return}
  const sp={w:48,run:150,chase:100}[nira.mode];
  if(sp){
    if(nira.mode=="chase"){const tx=nira.mx-W/2;if(now-nira.mAt>4000)niraMode("walk",2);else if(Math.abs(tx-nira.x)<26){niraMode("laugh",1.6);niraSay("Got you! hehe 😹",1600);sfx("hehe")}else nira.dir=tx>nira.x?1:-1}
    nira.x+=nira.dir*sp*dt;
    if(nira.x<L||nira.x>R){if(nira.plat&&(nira.goal||Math.random()<.5))return drop(nira.dir*70);nira.x=Math.max(L,Math.min(R,nira.x));nira.dir*=-1}}
  nira.t-=dt;if(nira.t<=0){if(nira.goal=="credit")niraCredit();else niraPick()}}

function niraLoop(ts){
  const c=$("#ncat");if(!c){nira.raf=0;return}
  nira.raf=requestAnimationFrame(niraLoop);
  const dt=Math.min(.05,(ts-(nira.last||ts))/1000),now=Date.now();nira.last=ts;
  nira.age+=dt;nira.phase=(nira.phase+dt*(nira.mode=="run"?2.6:nira.mode=="chase"?1.9:1.15))%1;
  if(ts-nira.plT>600){niraPlats();nira.plT=ts}
  niraStep(dt,now);
  if(!nira.qOpen&&!document.hidden&&!$("#nintro")&&!nira.drag&&nira.mode!="air"){
    if(now>nira.quizAt&&!nira.focus)niraQuiz();
    else if(now>nira.talkAt&&nira.mode!="sleep"){nira.talkAt=now+rnd(35000,70000);niraSay(pick(NF),3200)}}
  niraPlace();
  /* sone ya shant mode mein kam frames: battery bachti hai */
  if(ts-nira.drawT<(nira.mode=="sleep"||calmMotion.matches?90:0))return;nira.drawT=ts;
  const look=nira.mx<0?0:Math.max(-1.6,Math.min(1.6,(nira.mx-nira.x-c.offsetWidth/2)/150))*nira.dir;
  drawCat(c.querySelector("canvas"),nira.mode,nira.age,nira.phase,nira.dir,nira.vy,look)}

function niraSync(){
  const sb=$("#sndb");if(sb)sb.textContent=state.mute?"🔇":"🔊";
  if(state.catOff){niraStop();return}if($("#nira"))return;
  const e=document.createElement("div");e.id="nira";e.className="nira";
  e.innerHTML=`<div class="nc air" id="ncat"><div class="nb" id="nbub"></div><span class="zz">z z z</span><canvas aria-hidden="true"></canvas><div class="nhit" tabindex="0" role="button" aria-label="Nira the engineer cat"></div></div>`;
  document.body.append(e);const c=$("#ncat");
  Object.assign(nira,{x:Math.max(10,innerWidth*.35),y:-160,vx:0,vy:0,mode:"air",dir:1,plat:null,goal:"",last:0,bounced:0,idleAt:Date.now(),quizAt:Date.now()+rnd(150000,200000),talkAt:Date.now()+25000,qOpen:0,drag:null});
  niraBind(c);
  try{const f=JSON.parse(localStorage.getItem("nira-focus")||"null");if(f&&f.end>Date.now()){nira.focus=f;nira.ot=document.title;nira.goal=f.brk?"":"focus";clearInterval(nira.fi);nira.fi=setInterval(focusTick,1000);focusTick()}}catch(_){}
  let seen=1;try{seen=localStorage.getItem("nira-intro-v2")}catch(_){}
  const n=niraStreak();
  if(!seen)setTimeout(niraIntro,1800);else setTimeout(()=>niraSay(n>=3?n+" din lagatar padha! 🔥":n==2?"Welcome back! Day 2 in a row 🔥":"Welcome back, future JE! 🐾",3600),1600);
  nira.raf=requestAnimationFrame(niraLoop)}

["mousemove","keydown","scroll","touchstart","wheel","click"].forEach(ev=>addEventListener(ev,e=>{nira.idleAt=Date.now();if(ev=="mousemove"){nira.mx=e.clientX;nira.my=e.clientY;nira.mAt=Date.now()}if(nira.goal=="credit"){nira.goal="";nira.t=Math.min(nira.t,1)}},{passive:true}));

/* dark / light badalne par angdaai (dark mein aankhein chamakti hain) */
new MutationObserver(()=>{if($("#ncat")&&!["air","drag"].includes(nira.mode)&&!nira.focus)niraMode("stretch",1.4)}).observe(document.documentElement,{attributeFilter:["data-theme"]});
