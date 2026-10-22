const cv=document.getElementById('c'),g=cv.getContext('2d'),ov=document.getElementById('ov'),bp=document.getElementById('bp'),pad=document.getElementById('pad'),W=960,H=540,WW=1000,WH=1000;
const F="Orbitron,'Segoe UI',system-ui,sans-serif";
const IMG=new Image();let loaded=false;IMG.onload=()=>loaded=true;IMG.src="assets/mapa.jpg";
const NIMG="assets/alien.png",PIMG="assets/astronauta.png",RIMG="assets/foguete.png",LOGO="assets/logo.svg";
const SPR={p:new Image(),n:new Image(),r:new Image()};SPR.p.src=PIMG;SPR.n.src=NIMG;SPR.r.src=RIMG;
const AV=`<img class="av" src="${NIMG}" alt="">`;
let PN='Cosmonauta',lastSt='';document.getElementById('hl').src=LOGO;
const esc=x=>x.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function spr(img,x,y,h,o){
  if(!img.complete||!img.naturalWidth)return;
  const w=h*img.naturalWidth/img.naturalHeight;
  g.save();g.translate(x,y+(o.bob||0));g.rotate(o.rot||0);g.scale((o.flip||1)*(o.sx||1),o.sy||1);g.drawImage(img,-w/2,-h,w,h);g.restore();
}
const WALK=[[30,470,970,740],[400,740,690,1000],[345,60,745,470],[30,300,115,470],[330,730,730,758]];
const BLOCK=[[485,60,610,392],[497,768,593,862]],BLOCKC=[[530,610,150]];
const LAMPS=[[492,64],[588,64],[143,277],[944,281],[213,431],[873,436],[431,377],[650,377],[102,775],[980,780],[368,865],[722,865]];
const inR=(x,y,r)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
const N={x:770,y:610};
let P={x:545,y:930},cam={x:20,y:460};
const Q=[
["Qual país lançou o primeiro satélite artificial, o Sputnik, em 1957?",["União Soviética","Estados Unidos","China","Alemanha"]],
["Quem foi o primeiro ser humano a ir ao espaço, em 1961?",["Yuri Gagarin","Neil Armstrong","Alan Shepard","Buzz Aldrin"]],
["Em que ano caiu o Muro de Berlim?",["1989","1961","1975","1991"]],
["A Crise dos Mísseis de 1962 envolveu mísseis soviéticos em qual país?",["Cuba","México","Turquia","Vietnã"]],
["Como se chama a aliança militar criada em 1949 e liderada pelos EUA?",["OTAN","Pacto de Varsóvia","ONU","Eixo"]],
["Qual aliança militar reuniu a URSS e países do Leste Europeu em 1955?",["Pacto de Varsóvia","OTAN","Comintern","Tríplice Aliança"]],
["Quem foi o primeiro homem a pisar na Lua, em 1969?",["Neil Armstrong","Yuri Gagarin","John Glenn","Alan Shepard"]],
["Como ficou conhecido o plano dos EUA de ajuda econômica à Europa após a Segunda Guerra?",["Plano Marshall","Plano Schlieffen","Plano Real","Plano Cohen"]],
["Em que ano a União Soviética foi dissolvida?",["1991","1989","1985","1979"]],
["Qual guerra dividiu a península em Coreia do Norte e Coreia do Sul?",["Guerra da Coreia","Guerra do Vietnã","Guerra do Golfo","Guerra do Afeganistão"]]
];
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const S=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4}));
const DU=Array.from({length:70},()=>({x:Math.random()*WW,y:Math.random()*WH,vx:(Math.random()-.5)*.3,vy:-.1-Math.random()*.3,r:Math.random()*2+.6}));
const keys={},tv={x:0,y:0};
let st='intro',t=0,t0=0,B,PT=[],TR=[],endShown=false,stepT=0,BA;

/* ---------- SONS (WebAudio: reverb, compressor, música procedural) ---------- */
let AC,MG,RV,muted=false,mstep=0;
function au(){
  if(!AC){try{
    AC=new(window.AudioContext||window.webkitAudioContext)();
    const cp=AC.createDynamicsCompressor();cp.connect(AC.destination);MG=AC.createGain();MG.connect(cp);
    const n=AC.sampleRate*1.8|0,ib=AC.createBuffer(2,n,AC.sampleRate);
    for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}
    const cn=AC.createConvolver();cn.buffer=ib;RV=AC.createGain();RV.gain.value=.5;RV.connect(cn);const wg=AC.createGain();wg.gain.value=.4;cn.connect(wg);wg.connect(MG);
    const hg=AC.createGain();hg.gain.value=.03;hg.connect(MG);
    [55,82.5,110.4].forEach(f=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=f;o.connect(hg);o.start()});
    setInterval(music,170);
  }catch(e){return}}
  if(AC.state==='suspended')AC.resume();
}
function tone(f,d,type='square',v=.07,f2=0,dl=0){
  if(!AC)return;const t1=AC.currentTime+dl,o=AC.createOscillator(),gn=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t1);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t1+d);
  gn.gain.setValueAtTime(v,t1);gn.gain.exponentialRampToValueAtTime(.001,t1+d);o.connect(gn);gn.connect(MG);gn.connect(RV);o.start(t1);o.stop(t1+d+.05);
}
function noise(d,v=.25,lp=900,dl=0){
  if(!AC)return;const t1=AC.currentTime+dl,n=AC.sampleRate*d|0,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=lp;
  gn.gain.setValueAtTime(v,t1);gn.gain.exponentialRampToValueAtTime(.001,t1+d);s.connect(f);f.connect(gn);gn.connect(MG);gn.connect(RV);s.start(t1);
}
const SFX={
  step:()=>{tone(170+Math.random()*50,.06,'square',.03,80);noise(.05,.06,2600)},
  blip:()=>tone(1200+Math.random()*300,.025,'square',.02),
  hover:()=>tone(1600,.03,'sine',.02),
  click:()=>tone(700,.06,'square',.04,1300),
  talk:()=>{tone(880,.14,'sine',.08);tone(1320,.22,'sine',.07,0,.1);tone(1760,.3,'sine',.04,0,.2)},
  siren:()=>{for(let i=0;i<3;i++){tone(420,.4,'sawtooth',.05,780,i*.8);tone(780,.4,'sawtooth',.05,420,i*.8+.4)}},
  ok:()=>[659,784,988,1319].forEach((f,i)=>tone(f,.18,'triangle',.09,0,i*.07)),
  bad:()=>{tone(190,.45,'sawtooth',.08,60);tone(120,.5,'square',.05,45,.05)},
  laser:()=>{tone(1900,.26,'sawtooth',.05,180);tone(950,.26,'square',.03,90)},
  hit:()=>{noise(.3,.3,1600);tone(110,.26,'square',.1,30)},
  boom:()=>{noise(1.6,.55,700);noise(1,.3,300,.1);tone(80,1.3,'sine',.35,22)},
  win:()=>{[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,.4,'triangle',.1,0,i*.13));[523,659,784].forEach(f=>tone(f,2,'sine',.05,0,.9))},
  rumble:()=>{noise(3,.14,230);tone(48,3,'sawtooth',.04,130)},
  whoosh:()=>noise(.6,.12,3200)
};
const sfx=n=>{if(!muted&&AC)SFX[n]()};
function music(){
  if(!AC||muted||AC.state!=='running'||st==='win'||st==='lose'||st==='anim')return;
  mstep++;const bt=st==='battle',sc=[220,261.6,293.7,329.6,392,440,523.3],ar=bt?[0,2,4,2,5,4,2,3]:[0,4,2,5,3,6,4,2];
  if(bt||mstep%2===0)tone(sc[ar[mstep%8]]*(bt&&mstep%16>7?1.5:1),.35,'triangle',bt?.035:.022);
  if(mstep%16===0){tone(110,2.8,'sine',.05);tone(165,2.8,'sine',.03)}
  if(bt&&mstep%4===0)tone(140,.18,'sine',.12,40);
  if(bt&&mstep%2===1)noise(.03,.03,9000);
}
document.getElementById('mute').onclick=e=>{muted=!muted;e.target.textContent=muted?'🔇':'🔊';if(MG)MG.gain.value=muted?0:1};
document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('.o,.go'))sfx('hover')});

/* ---------- CONTROLES ---------- */
const canWalk=(x,y)=>WALK.some(r=>inR(x,y,r))&&!BLOCK.some(r=>inR(x,y,r))&&!BLOCKC.some(c=>Math.hypot(x-c[0],y-c[1])<c[2]);
const wb=(x,y)=>![[-14,-8],[14,-8],[-14,14],[14,14]].every(([a,b])=>canWalk(x+a,y+b));
const blocked=(x,y)=>wb(x,y)||(Math.abs(x-N.x)<34&&Math.abs(y-N.y)<34);
const near=()=>Math.hypot(P.x-N.x,P.y-N.y)<110;
/* distâncias até o NPC (BFS) para a seta seguir o caminho real */
const CS=24,GW=42,GH=42,DF=new Int16Array(GW*GH).fill(-1);
(function(){const q=[],s0=(N.x/CS|0)+(N.y/CS|0)*GW;DF[s0]=0;q.push(s0);
  for(let h=0;h<q.length;h++){const c=q[h],cx=c%GW,cy=c/GW|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=nx+ny*GW;if(DF[n]>=0)continue;
      if(wb(nx*CS+CS/2,ny*CS+CS/2))continue;
      if(dx&&dy&&(wb(nx*CS+CS/2,cy*CS+CS/2)||wb(cx*CS+CS/2,ny*CS+CS/2)))continue;
      DF[n]=DF[c]+1;q.push(n)}}})();
function guide(){
  const cx=P.x/CS|0,cy=P.y/CS|0;let c=cx+cy*GW;
  if(cx<0||cy<0||cx>=GW||cy>=GH)return null;
  if(DF[c]<0){let f=-1;for(let r=1;r<4&&f<0;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const n=(cx+dx)+(cy+dy)*GW;if(f<0&&n>=0&&n<DF.length&&DF[n]>=0)f=n}
    if(f<0)return null;c=f}
  const pts=[{x:P.x,y:P.y}],d0=DF[c];
  for(let i=0;i<80&&DF[c]>0;i++){let best=c,bd=DF[c];const x=c%GW,y=c/GW|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const n=nx+ny*GW;if(DF[n]>=0&&DF[n]<bd){bd=DF[n];best=n}}
    if(best===c)break;c=best;pts.push({x:(c%GW)*CS+CS/2,y:(c/GW|0)*CS+CS/2})}
  pts.push({x:N.x,y:N.y});return{pts,m:Math.round(d0*CS/12)};
}
addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  const k=e.key.toLowerCase();keys[k]=1;
  if(st==='battle'&&B&&B.cur&&!B.done&&/^[1-4a-d]$/.test(k)){ans('abcd1234'.indexOf(k)%4);return}
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(st==='explore'&&(k==='e'||k==='enter'||k===' '))talk();
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;tv.x=tv.y=0});
document.querySelectorAll('[data-d]').forEach(b=>{
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[b.dataset.d];
  const on=e=>{e.preventDefault();au();if(v[0])tv.x=v[0];if(v[1])tv.y=v[1]};
  const off=e=>{e.preventDefault();if(v[0])tv.x=0;if(v[1])tv.y=0};
  b.addEventListener('pointerdown',on);
  ['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,off));
  b.addEventListener('contextmenu',e=>e.preventDefault());
});
document.getElementById('act').addEventListener('pointerdown',e=>{e.preventDefault();au();if(st==='explore')talk()});

const show=h=>{ov.innerHTML=h;ov.style.display='flex'};
const hide=()=>{ov.style.display='none';ov.classList.remove('menu')};

/* ---------- FLUXO ---------- */
function intro(){
  show(`<div class="mn"><img class="logo" src="${LOGO}" alt="Missão Cosmos 62"><p class="sub">Ano de 1962, auge da Guerra Fria. A bordo da nave soviética <b>Vostok-K</b>, encontre o Comandante e enfrente o agente inimigo.</p><img class="pv" src="${PIMG}" alt=""><label class="nm">Nome do cosmonauta<input id="pn" maxlength="14" placeholder="Cosmonauta" autocomplete="off" onkeydown="if(event.key==='Enter')startGame()"></label><button class="go" onclick="startGame()">▶ INICIAR MISSÃO</button><div class="how"><span>⌨️ WASD / setas</span><span>💬 E = falar</span><span>📱 direcional + FALAR</span><span>🔊 ligue o som</span></div></div><img class="fly" src="${RIMG}" alt="">`);
  ov.classList.add('menu');
}
function startGame(){au();PN=(document.getElementById('pn').value||'').trim().slice(0,14)||'Cosmonauta';sfx('talk');sfx('whoosh');hide();st='explore'}
function type(el,tx){let i=0;(function f(){if(!el||!el.isConnected)return;el.textContent=tx.slice(0,++i);if(i%2===0)sfx('blip');if(i<tx.length)setTimeout(f,26)})()}
function talk(){
  if(!near())return;
  st='dialog';sfx('talk');
  show(`<div class="card">${AV}<h2>Comandante Volkov</h2><div class="tag">Comandante · Vostok-K</div><p id="tw" class="tw"></p><button class="o" onclick="startBattle()">⚔️ Batalhar</button><button class="o" onclick="sfx('click');decline()">Não quero</button></div>`);
  type(document.getElementById('tw'),`Camarada ${PN}, um agente inimigo se infiltrou na nave! Está pronto para batalhar?`);
}
function decline(){show(`<div class="card">${AV}<p>Tudo bem, camarada. Volte quando estiver pronto.</p><button class="o" onclick="sfx('click');hide();st='explore'">Fechar</button></div>`)}

const dots=()=>Array.from({length:Math.max(4,B.i+1)},(_,i)=>B.hist[i]===undefined?(i===B.i?'🔸':'⚪'):B.hist[i]?'🟢':'🔴').join('');
const sc=()=>`🧑‍🚀 ${esc(PN)}: ★${B.me} &nbsp;·&nbsp; 👽 Agente Boris: ★${B.en}<br>${dots()}`;
function startBattle(){
  hide();pad.classList.add('off');bp.style.display='block';
  B={qs:shuf(Q.slice()),i:0,me:0,en:0,dm:0,de:0,over:0,hist:[]};
  BA={tb:t,pk:[],tx:[],sp:[],shP:0,shE:0,flP:0,flE:0,dead:0,shk:0};
  st='battle';sfx('siren');
  setTimeout(()=>{if(st==='battle')ask()},1600);
  bp.innerHTML='';
}
function ask(){
  const [q,o]=B.qs[B.i%B.qs.length];
  B.cur=shuf(o.map((x,k)=>({t:x,ok:!k})));B.done=0;
  bp.innerHTML=`<div class="card"><div class="sc">${sc()}</div><p class="q">${B.i>3?'⚡ Desempate':'Pergunta '+(B.i+1)+' de 4'}<br>${q}</p>${B.cur.map((p,k)=>`<button class="o" onclick="ans(${k})"><b class="l">${'ABCD'[k]}</b>${p.t}</button>`).join('')}</div>`;
}
function ans(k){
  if(B.done)return;B.done=1;sfx('click');
  const ok=B.cur[k].ok,en=Math.random()<.5;
  if(ok)B.me++;if(en)B.en++;B.hist.push(ok?1:0);
  const card=bp.querySelector('.card');
  card.querySelectorAll('.o').forEach((b,j)=>{b.disabled=true;if(B.cur[j].ok)b.classList.add('ok');else if(j===k)b.classList.add('bad')});
  if(ok){sfx('ok');setTimeout(()=>shoot('p'),350)}else{sfx('bad');txt('P','ERROU!','#ff6b8a')}
  setTimeout(()=>{if(en)shoot('e');else txt('E','ERROU!','#8fd')},1100);
  setTimeout(()=>{
    if(st!=='battle')return;
    card.querySelector('.sc').innerHTML=sc();
    card.insertAdjacentHTML('beforeend',`<div class="fb">${ok?'✅ Você acertou!':'❌ Você errou.'} ${en?'O inimigo acertou.':'O inimigo errou.'}</div><button class="o" onclick="nxt()">Continuar ▶</button>`);
  },2100);
}
function nxt(){
  sfx('click');B.i++;
  if(B.i>=4){
    const{me,en}=B;
    if(me===4||(me>0&&me>en))return win();
    if(me===0||me<en)return lose();
  }
  ask();
}
function win(){
  bp.innerHTML=`<div class="card"><h2>💥 Inimigo derrotado!</h2><p>Placar final: ${B.me} x ${B.en}</p></div>`;
  B.over=1;BA.dead='e';BA.shk=26;sfx('boom');burst(W-190,300,140,['#4de8ff','#ffd166','#ff3b6b']);
  setTimeout(()=>{bp.style.display='none';st='win';t0=t;endShown=false;PT=[];sfx('rumble');sfx('whoosh');setTimeout(()=>sfx('win'),2800)},2000);
}
function lose(){
  bp.innerHTML=`<div class="card"><h2>👽 Você perdeu...</h2><p>Placar final: ${B.me} x ${B.en}. O inimigo sabotou os motores!</p></div>`;
  B.over=1;BA.dead='p';BA.shk=20;sfx('hit');burst(190,300,70,['#ff3b6b','#888']);
  setTimeout(()=>{bp.style.display='none';st='lose';t0=t;endShown=false;PT=[]},2000);
}
function restart(){hide();bp.style.display='none';pad.classList.remove('off');P={x:545,y:930};st='explore'}
function endCard(e,ti,tx){show(`<div class="card"><div class="foe">${e}</div><h2>${ti}</h2><p>${tx}</p><button class="o" onclick="sfx('click');restart()">Jogar de novo</button></div>`)}

/* ---------- EFEITOS DE BATALHA ---------- */
const PX=190,EX=W-190;
function shoot(s){sfx('laser');BA.pk.push({s,x:s==='p'?PX+60:EX-60})}
function txt(side,s,c){BA.tx.push({x:side==='P'?PX:EX,y:250,s,c,l:60})}
function burst(x,y,n,cols){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=1+Math.random()*8;BA.sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:40+Math.random()*50,c:cols[Math.random()*cols.length|0]})}}
function hitSide(s){
  sfx('hit');burst(s==='e'?EX:PX,320,40,s==='e'?['#4de8ff','#fff','#ffd166']:['#ff3b6b','#ffd166']);BA.shk=14;
  txt(s==='e'?'E':'P',s==='e'?'ACERTOU! ★':'ATINGIDO!',s==='e'?'#4de8ff':'#ff3b6b');
  if(s==='e'){BA.shE=18;BA.flE=12;B.dm++}else{BA.shP=18;BA.flP=12;B.de++}
}
function bar(x,label,n,col){
  g.fillStyle='rgba(4,10,24,.7)';g.fillRect(x,14,262,44);g.strokeStyle=col;g.lineWidth=2;g.shadowColor=col;g.shadowBlur=12;g.strokeRect(x,14,262,44);g.shadowBlur=0;
  g.fillStyle='#fff';g.font='700 13px '+F;g.textAlign='left';g.fillText(label,x+10,32);
  for(let i=0;i<Math.max(4,n);i++){g.fillStyle=i<n?col:'rgba(255,255,255,.14)';g.fillRect(x+10+i*36,40,30,10)}
}
function drawBattle(k){
  g.save();if(BA.shk>.5){g.translate((Math.random()-.5)*BA.shk,(Math.random()-.5)*BA.shk);BA.shk*=.86}
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#050a1c');gr.addColorStop(1,'#1d0b2e');g.fillStyle=gr;g.fillRect(-20,-20,W+40,H+40);stars();
  g.fillStyle='#1f5fa8';g.strokeStyle='rgba(120,220,255,.6)';g.lineWidth=8;g.beginPath();g.arc(W/2,-400,540,0,7);g.fill();g.stroke();
  g.fillStyle='#2e8b57';g.beginPath();g.ellipse(W/2-120,130,80,18,.1,0,7);g.ellipse(W/2+150,120,100,22,-.1,0,7);g.fill();
  g.fillStyle='#0a1124';g.fillRect(-20,400,W+40,H);
  g.strokeStyle='rgba(77,232,255,.35)';g.lineWidth=1.5;
  for(let i=-8;i<=8;i++){g.beginPath();g.moveTo(W/2+i*40,400);g.lineTo(W/2+i*190,H);g.stroke()}
  for(let i=0;i<6;i++){const f=(i+(t*.02)%1)/6,y=400+f*f*140;g.globalAlpha=.15+f*.4;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}g.globalAlpha=1;
  g.strokeStyle='#4de8ff';g.lineWidth=3;g.shadowColor='#4de8ff';g.shadowBlur=14;g.beginPath();g.moveTo(0,400);g.lineTo(W,400);g.stroke();g.shadowBlur=0;
  const ent=Math.min(k/45,1),ex=EX+(1-ent)*(W/2);
  const draw=(x,e,sh,fl,dead)=>{
    if(dead)return;
    const ox=sh>0?(Math.random()-.5)*sh:0,by=Math.sin(t*.08+x)*5,col=e==='P'?'77,232,255':'255,59,107';
    g.globalCompositeOperation='lighter';const ag=g.createRadialGradient(x,320,10,x,320,120);ag.addColorStop(0,`rgba(${col},${.35+.15*Math.sin(t*.1)})`);ag.addColorStop(1,`rgba(${col},0)`);g.fillStyle=ag;g.fillRect(x-130,190,260,260);g.globalCompositeOperation='source-over';
    g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.ellipse(x,412,62,12,0,0,7);g.fill();
    if(fl>0){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(x,320,76,0,7);g.fill()}
    if(e==='P')spr(SPR.p,x+ox,415,190,{bob:by,flip:1,sy:1+Math.sin(t*.06)*.015});
    else spr(SPR.n,x+ox,415,190,{bob:by,flip:-1,rot:Math.sin(t*.05)*.05,sy:1+Math.sin(t*.1)*.03});
  };
  draw(PX,'P',BA.shP,BA.flP,BA.dead==='p');
  draw(ex,'A',BA.shE,BA.flE,BA.dead==='e');
  if(BA.shP>0)BA.shP--;if(BA.shE>0)BA.shE--;if(BA.flP>0)BA.flP--;if(BA.flE>0)BA.flE--;
  BA.pk=BA.pk.filter(p=>{
    p.x+=p.s==='p'?28:-28;
    const col=p.s==='p'?'#4de8ff':'#ff3b6b',d=p.s==='p'?-1:1;
    BA.sp.push({x:p.x,y:300+(Math.random()-.5)*10,vx:d*Math.random()*2,vy:(Math.random()-.5)*2,l:14,c:col});
    g.strokeStyle=col;g.lineWidth=7;g.shadowColor=col;g.shadowBlur=22;g.beginPath();g.moveTo(p.x,300);g.lineTo(p.x+d*70,300);g.stroke();
    g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(p.x,300);g.lineTo(p.x+d*60,300);g.stroke();g.shadowBlur=0;
    if(p.s==='p'&&p.x>=EX-70){hitSide('e');return false}
    if(p.s==='e'&&p.x<=PX+70){hitSide('p');return false}
    return true;
  });
  g.globalCompositeOperation='lighter';
  BA.sp=BA.sp.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.l--;g.globalAlpha=Math.max(0,p.l/60);g.fillStyle=p.c;g.fillRect(p.x,p.y,5,5);return p.l>0});
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  BA.tx=BA.tx.filter(f=>{f.y-=1;f.l--;g.globalAlpha=Math.min(1,f.l/30);g.fillStyle=f.c;g.shadowColor=f.c;g.shadowBlur=12;g.font='900 26px '+F;g.textAlign='center';g.fillText(f.s,f.x,f.y);g.shadowBlur=0;g.globalAlpha=1;return f.l>0});
  const vg2=g.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H);vg2.addColorStop(0,'rgba(0,0,0,0)');vg2.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=vg2;g.fillRect(-20,-20,W+40,H+40);
  bar(14,PN.toUpperCase().slice(0,12),B.dm,'#4de8ff');bar(W-276,'AGENTE BORIS',B.de,'#ff3b6b');
  g.fillStyle='#fff';g.textAlign='center';g.font='900 22px '+F;g.fillText('VS',W/2,42);
  if(k<90&&(k%20<12)){g.fillStyle='rgba(200,20,60,.78)';g.fillRect(-20,200,W+40,64);g.fillStyle='#fff';g.font='900 28px '+F;g.fillText('⚠ INIMIGO DETECTADO ⚠',W/2,243)}
  if(B&&B.over){g.fillStyle='#4de8ff';g.shadowColor='#4de8ff';g.shadowBlur=16;g.font='900 30px '+F;g.fillText(BA.dead==='e'?'INIMIGO DERROTADO!':'VOCÊ FOI DERROTADO!',W/2,150);g.shadowBlur=0}
  g.restore();
}

/* ---------- EXPLORAÇÃO ---------- */
function upd(){
  let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+tv.x;
  let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+tv.y;
  dx=Math.max(-1,Math.min(1,dx));dy=Math.max(-1,Math.min(1,dy));
  const m=Math.hypot(dx,dy)||1,sp=4.2;
  const nx=P.x+dx/m*sp,ny=P.y+dy/m*sp;
  P.mv=!!(dx||dy);
  if(P.mv){if(!blocked(nx,P.y))P.x=nx;if(!blocked(P.x,ny))P.y=ny;P.ph=(P.ph||0)+.28;if(dx)P.f=dx>0?1:-1;if(++stepT%11===0){sfx('step');TR.push({x:P.x,y:P.y+24,l:26})}}
}
function drawMap(){
  const tx=Math.max(0,Math.min(WW-W,P.x-W/2)),ty=Math.max(0,Math.min(WH-H,P.y-H/2));
  cam.x+=(tx-cam.x)*.14;cam.y+=(ty-cam.y)*.14;const cx=cam.x,cy=cam.y;
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  if(loaded)g.drawImage(IMG,cx,cy,W,H,0,0,W,H);else{g.fillStyle='#fff';g.font='20px '+F;g.textAlign='center';g.fillText('Carregando nave...',W/2,H/2)}
  g.globalCompositeOperation='soft-light';g.fillStyle='rgba(70,150,255,.5)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='lighter';
  const rp=.18+.09*Math.sin(t*.05),rx=530-cx,ry=610-cy,rg=g.createRadialGradient(rx,ry,10,rx,ry,280);
  rg.addColorStop(0,`rgba(60,200,255,${rp*2})`);rg.addColorStop(1,'rgba(60,200,255,0)');g.fillStyle=rg;g.fillRect(rx-280,ry-280,560,560);
  LAMPS.forEach(([lx,ly],i)=>{const a=.35+.25*Math.sin(t*.12+i*1.7),X=lx-cx,Y=ly-cy,lg=g.createRadialGradient(X,Y,0,X,Y,50);lg.addColorStop(0,`rgba(255,120,40,${a})`);lg.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=lg;g.fillRect(X-50,Y-50,100,100)});
  DU.forEach(d=>{d.x+=d.vx;d.y+=d.vy;if(d.y<0)d.y=WH;if(d.x<0)d.x=WW;if(d.x>WW)d.x=0;g.fillStyle=`rgba(150,220,255,${.25+.2*Math.sin(t*.05+d.x)})`;g.fillRect(d.x-cx,d.y-cy,d.r,d.r)});
  TR.forEach(p=>{p.l--;g.fillStyle=`rgba(77,232,255,${p.l/40})`;g.beginPath();g.arc(p.x-cx,p.y-cy,6*(p.l/26),0,7);g.fill()});TR=TR.filter(p=>p.l>0);
  g.globalCompositeOperation='source-over';
  const nx=N.x-cx,ny=N.y-cy,px=P.x-cx,py=P.y-cy;
  g.textAlign='center';
  for(let k=0;k<2;k++){const ph=((t*.8+k*30)%60)/60,rr=24+ph*52;g.strokeStyle=`rgba(77,232,255,${(1-ph)*.75})`;g.lineWidth=2.5;g.beginPath();g.ellipse(nx,ny+26,rr,rr*.38,0,0,7);g.stroke()}
  const hv=Math.sin(t*.06),nb=-8+hv*6;
  g.globalCompositeOperation='lighter';const ag=g.createRadialGradient(nx,ny-30,5,nx,ny-30,80);ag.addColorStop(0,`rgba(120,255,200,${.3+.12*Math.sin(t*.1)})`);ag.addColorStop(1,'rgba(120,255,200,0)');g.fillStyle=ag;g.fillRect(nx-85,ny-115,170,170);g.globalCompositeOperation='source-over';
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(nx,ny+26,26-hv*3,9-hv,0,0,7);g.fill();
  spr(SPR.n,nx,ny+26,96,{bob:nb,rot:Math.sin(t*.045)*.07,sy:1+Math.sin(t*.09)*.03,sx:1-Math.sin(t*.09)*.02,flip:P.x<N.x?-1:1});
  const mv=P.mv,ph=P.ph||0,sq=mv?Math.abs(Math.sin(ph)):0;
  g.globalCompositeOperation='lighter';const pg=g.createRadialGradient(px,py+24,2,px,py+24,50);pg.addColorStop(0,'rgba(77,232,255,.4)');pg.addColorStop(1,'rgba(77,232,255,0)');g.fillStyle=pg;g.fillRect(px-50,py-26,100,100);g.globalCompositeOperation='source-over';
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(px,py+26,24-sq*5,8-sq*2,0,0,7);g.fill();
  spr(SPR.p,px,py+26,88,{bob:mv?-sq*8:0,rot:mv?Math.sin(ph)*.1:0,sy:mv?1+Math.cos(ph*2)*.04:1+Math.sin(t*.05)*.015,sx:mv?1-Math.cos(ph*2)*.03:1,flip:P.f||1});
  g.font='700 15px '+F;g.textAlign='center';const nw=g.measureText(PN).width+18;g.fillStyle='rgba(2,8,20,.7)';g.fillRect(px-nw/2,py-94,nw,22);g.strokeStyle='rgba(77,232,255,.7)';g.lineWidth=1;g.strokeRect(px-nw/2,py-94,nw,22);g.fillStyle='#4de8ff';g.fillText(PN,px,py-78);
  g.font='900 24px '+F;g.fillStyle='#ffd166';g.shadowColor='#ffd166';g.shadowBlur=12;g.fillText('!',nx,ny-100+Math.sin(t*.12)*3);g.shadowBlur=0;
  const vg=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.65)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  if(st==='explore'){
    if(near()){g.fillStyle='rgba(2,8,20,.8)';g.fillRect(nx-100,ny-148,200,34);g.strokeStyle='#4de8ff';g.lineWidth=2;g.strokeRect(nx-100,ny-148,200,34);g.font='700 17px '+F;g.fillStyle='#4de8ff';g.textAlign='center';g.fillText('FALAR (E)',nx,ny-125)}
    else{
      const gd=guide();
      if(gd){
        gd.pts.forEach((p,i)=>{if(i<2||i%3)return;g.globalAlpha=.25+.75*Math.max(0,Math.sin(i*.55-t*.18));g.fillStyle='#4de8ff';g.shadowColor='#4de8ff';g.shadowBlur=10;g.beginPath();g.arc(p.x-cx,p.y-cy,5,0,7);g.fill()});g.globalAlpha=1;g.shadowBlur=0;
        const tg=gd.pts[Math.min(6,gd.pts.length-1)],an=Math.atan2(tg.y-P.y,tg.x-P.x),rr=84+Math.sin(t*.16)*6,ax=px+Math.cos(an)*rr,ay=py-10+Math.sin(an)*rr;
        g.save();g.translate(ax,ay);g.rotate(an);g.shadowColor='#4de8ff';g.shadowBlur=20;g.fillStyle='#4de8ff';g.strokeStyle='#003b52';g.lineWidth=3;g.beginPath();g.moveTo(28,0);g.lineTo(-12,-20);g.lineTo(-3,0);g.lineTo(-12,20);g.closePath();g.fill();g.stroke();g.restore();
        const lb='COMANDANTE · '+gd.m+' m';g.font='700 15px '+F;g.textAlign='center';const tw=g.measureText(lb).width+16;g.fillStyle='rgba(2,8,20,.75)';g.fillRect(ax-tw/2,ay+26,tw,24);g.fillStyle='#4de8ff';g.fillText(lb,ax,ay+43);
      }
    }
  }
  g.fillStyle='rgba(2,8,20,.65)';g.fillRect(8,8,206,30);g.strokeStyle='rgba(77,232,255,.6)';g.lineWidth=1;g.strokeRect(8,8,206,30);g.textAlign='left';g.font='700 14px '+F;g.fillStyle='#4de8ff';g.fillText('★ VOSTOK-K · 1962',18,28);
}

/* ---------- ANIMAÇÕES FINAIS (foguete em sprite) ---------- */
function rocket(x,y,a,s,flame){
  const im=SPR.r;if(!im.complete||!im.naturalWidth)return;
  const h=96*s,w=h*im.naturalWidth/im.naturalHeight;
  g.save();g.translate(x,y);g.rotate(a);
  if(flame){const L=h*(.5+Math.random()*.3);g.globalCompositeOperation='lighter';
    g.fillStyle='rgba(255,150,40,.85)';g.beginPath();g.moveTo(-w*.2,h*.42);g.lineTo(0,h*.42+L);g.lineTo(w*.2,h*.42);g.fill();
    g.fillStyle='rgba(255,245,170,.95)';g.beginPath();g.moveTo(-w*.1,h*.42);g.lineTo(0,h*.42+L*.6);g.lineTo(w*.1,h*.42);g.fill();g.globalCompositeOperation='source-over'}
  g.imageSmoothingEnabled=false;g.drawImage(im,-w/2,-h/2,w,h);g.restore();
}
function stars(){g.fillStyle='#fff';S.forEach(s=>{g.globalAlpha=.5+.5*Math.sin(t*.05+s.x);g.fillRect(s.x,s.y,s.r,s.r)});g.globalAlpha=1}
function msg(s,y){g.fillStyle='#e8f4ff';g.shadowColor='#4de8ff';g.shadowBlur=14;g.font='900 22px '+F;g.textAlign='center';g.fillText(s,W/2,y);g.shadowBlur=0}
function parts(){g.globalCompositeOperation='lighter';PT=PT.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.99;p.l--;g.globalAlpha=Math.max(0,p.l/p.m);g.fillStyle=p.c;const z=p.z||4;g.fillRect(p.x,p.y,z,z);return p.l>0});g.globalAlpha=1;g.globalCompositeOperation='source-over'}
function drawWin(k){
  const p=Math.min(k/380,1),cx=W/2,eTop=H-100-300*p,sy=60+(eTop-100)*p;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#02030a');gr.addColorStop(1,'#0b1b3a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.save();if(p>.5&&p<.95)g.translate((Math.random()-.5)*5,(Math.random()-.5)*5);
  stars();
  if(p<.85){g.strokeStyle='rgba(180,230,255,.35)';g.lineWidth=2;for(let i=0;i<16;i++){const x=(i*61+17)%W,y=((t*14+i*97)%(H+80))-40;g.beginPath();g.moveTo(x,y);g.lineTo(x,y+36);g.stroke()}}
  g.strokeStyle='rgba(120,200,255,.55)';g.lineWidth=10;g.fillStyle='#1f5fa8';g.beginPath();g.arc(cx,H+600-300*p,700,0,7);g.fill();g.stroke();
  g.fillStyle='#2e8b57';g.beginPath();g.ellipse(cx-160,eTop+120,90,40,.3,0,7);g.ellipse(cx+200,eTop+160,120,50,-.2,0,7);g.fill();
  if(p>.5){const a=Math.min((p-.5)*2,1),rg=g.createRadialGradient(cx,sy+70,5,cx,sy+70,110);rg.addColorStop(0,`rgba(255,210,90,${a})`);rg.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=rg;g.fillRect(cx-120,sy-40,240,240)}
  if(p>.85){g.fillStyle='#f4f4f8';g.beginPath();g.arc(cx,sy-80,80,Math.PI,0);g.fill();g.fillStyle='#ff3b6b';g.beginPath();g.arc(cx,sy-80,80,Math.PI*1.25,Math.PI*1.45);g.lineTo(cx,sy-80);g.fill();g.strokeStyle='#ddd';g.lineWidth=2;g.beginPath();g.moveTo(cx-80,sy-80);g.lineTo(cx-10,sy-30);g.moveTo(cx+80,sy-80);g.lineTo(cx+10,sy-30);g.stroke()}
  if(p<.85&&t%2===0)PT.push({x:cx+(Math.random()-.5)*18,y:sy-60,vx:(Math.random()-.5)*2,vy:-1-Math.random()*4,l:36,m:36,c:Math.random()<.5?'#ffb020':'#ff6a2a',z:5});
  parts();
  rocket(cx,sy,Math.PI,1.3,p<.85);
  g.restore();
  msg(p<.5?'Nave deixando a órbita...':p<.85?'Reentrada na atmosfera!':'Pouso seguro! Missão cumprida!',40);
  if(k>420&&!endShown){endShown=true;endCard('🌍','Missão cumprida!',esc(PN)+', a Vostok-K voltou para a Terra. O agente inimigo foi derrotado e a União Soviética celebra sua vitória!<br><b>'+(B.me===4?'🏅 Herói da União Soviética':'🎖️ Cosmonauta Condecorado')+'</b> · placar '+B.me+' x '+B.en)}
}
function drawLose(k){
  g.fillStyle='#02030a';g.fillRect(0,0,W,H);stars();
  if(k<70){const sh=k*.07;
    if(k%3===0)PT.push({x:W/2+(Math.random()-.5)*30,y:H/2+60,vx:(Math.random()-.5)*2,vy:-.5-Math.random()*1.5,l:50,m:50,c:'#888',z:9});
    parts();rocket(W/2+(Math.random()-.5)*sh,H/2+(Math.random()-.5)*sh,Math.sin(k*.15)*.12,1.6,true);msg('ALERTA! Motores sabotados!',40);if(k%16<8){g.fillStyle='rgba(255,40,80,.2)';g.fillRect(0,0,W,H)}if(k===1)sfx('siren')}
  else{
    if(k===70){sfx('boom');PT=[];for(let i=0;i<190;i++){const a=Math.random()*6.283,s=1+Math.random()*8;PT.push({x:W/2,y:H/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:60+Math.random()*80,m:110,c:['#ffee55','#ff9900','#ff3322','#bbb','#4de8ff'][Math.random()*5|0],z:3+Math.random()*5})}}
    g.strokeStyle=`rgba(255,200,100,${Math.max(0,1-(k-70)/40)})`;g.lineWidth=7;g.beginPath();g.arc(W/2,H/2,(k-70)*10,0,7);g.stroke();
    parts();
    if(k<90){g.fillStyle=`rgba(255,255,255,${(90-k)/20})`;g.fillRect(0,0,W,H)}
    msg('A nave explodiu!',40);
    if(k>240&&!endShown){endShown=true;endCard('💥','A nave explodiu!','Você errou demais e o agente inimigo destruiu a Vostok-K. Tente novamente, camarada!')}
  }
}
function loop(){
  t++;if(st!==lastSt){lastSt=st;document.getElementById('obj').style.display=(st==='explore'||st==='dialog')?'flex':'none'}
  if(st==='explore')upd();
  if(st==='win')drawWin(t-t0);
  else if(st==='lose')drawLose(t-t0);
  else if(st==='battle')drawBattle(t-BA.tb);
  else drawMap();
  requestAnimationFrame(loop);
}
intro();loop();
