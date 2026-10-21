const cv=document.getElementById('c'),g=cv.getContext('2d'),ov=document.getElementById('ov'),bp=document.getElementById('bp'),pad=document.getElementById('pad'),W=960,H=540,WW=1920,WH=1080;
const IMG=new Image();let loaded=false;IMG.onload=()=>loaded=true;IMG.src="assets/mapa.jpg";
const NIMG="assets/alien.png",PIMG="assets/astronauta.png",SPR={p:new Image(),n:new Image()};SPR.p.src=PIMG;SPR.n.src=NIMG;
const AV=`<img class="av" src="${NIMG}" alt="">`;
function spr(img,x,y,h,o){ /* x,y = pés do personagem; pivô nos pés */
  if(!img.complete||!img.naturalWidth)return;
  const w=h*img.naturalWidth/img.naturalHeight;
  g.save();g.translate(x,y+(o.bob||0));g.rotate(o.rot||0);g.scale((o.flip||1)*(o.sx||1),o.sy||1);g.drawImage(img,-w/2,-h,w,h);g.restore();
}
const WALK=[[150,465,340,605],[330,470,485,600],[485,480,1290,600],[485,300,715,480],[835,295,1285,480],[485,605,625,805],[625,685,725,805],[835,605,1285,805],[1320,330,1635,780],[1288,395,1325,470],[1288,625,1325,700]];
const BLOCK=[[625,400,830,485],[625,600,830,680],[890,565,945,615],[995,565,1045,615],[895,725,945,780],[995,725,1050,780],[900,630,1040,715]];
const inR=(x,y,r)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
const N={x:1170,y:540};
let P={x:400,y:535};
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
const S=Array.from({length:90},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4}));
const keys={},tv={x:0,y:0};
let st='intro',t=0,t0=0,B,PT=[],endShown=false,stepT=0,BA;

/* ---------- SONS (WebAudio, sem arquivos) ---------- */
let AC,MG,muted=false;
function au(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=1;MG.connect(AC.destination);
    const o=AC.createOscillator(),o2=AC.createOscillator(),hg=AC.createGain();o.type='sine';o.frequency.value=55;o2.type='sine';o2.frequency.value=82.5;hg.gain.value=.035;o.connect(hg);o2.connect(hg);hg.connect(MG);o.start();o2.start()}catch(e){return}}
  if(AC.state==='suspended')AC.resume();
}
function tone(f,d,type='square',v=.07,f2=0,dl=0){
  if(!AC)return;const t1=AC.currentTime+dl,o=AC.createOscillator(),gn=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t1);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t1+d);
  gn.gain.setValueAtTime(v,t1);gn.gain.exponentialRampToValueAtTime(.001,t1+d);o.connect(gn);gn.connect(MG);o.start(t1);o.stop(t1+d+.02);
}
function noise(d,v=.25,lp=900,dl=0){
  if(!AC)return;const t1=AC.currentTime+dl,n=AC.sampleRate*d|0,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=lp;
  gn.gain.setValueAtTime(v,t1);gn.gain.exponentialRampToValueAtTime(.001,t1+d);s.connect(f);f.connect(gn);gn.connect(MG);s.start(t1);
}
const SFX={
  step:()=>tone(80+Math.random()*20,.06,'triangle',.05),
  talk:()=>{tone(660,.1,'square',.06);tone(880,.14,'square',.06,0,.1)},
  click:()=>tone(520,.06,'square',.05),
  siren:()=>{tone(420,.4,'sawtooth',.06,760);tone(760,.4,'sawtooth',.06,420,.4);tone(420,.4,'sawtooth',.06,760,.8)},
  ok:()=>[523,659,784].forEach((f,i)=>tone(f,.15,'triangle',.1,0,i*.09)),
  bad:()=>tone(220,.4,'sawtooth',.09,70),
  laser:()=>tone(1400,.25,'sawtooth',.06,180),
  hit:()=>{noise(.25,.25,1400);tone(120,.2,'square',.08,40)},
  boom:()=>{noise(1.4,.5,600);tone(90,1,'sine',.3,28)},
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.3,'triangle',.1,0,i*.16)),
  rumble:()=>noise(2.5,.12,260)
};
const sfx=n=>{if(!muted&&AC)SFX[n]()};
document.getElementById('mute').onclick=e=>{muted=!muted;e.target.textContent=muted?'🔇':'🔊';if(MG)MG.gain.value=muted?0:1};

/* ---------- CONTROLES ---------- */
const canWalk=(x,y)=>WALK.some(r=>inR(x,y,r))&&!BLOCK.some(r=>inR(x,y,r));
const blocked=(x,y)=>![[-14,-8],[14,-8],[-14,14],[14,14]].every(([a,b])=>canWalk(x+a,y+b))||(Math.abs(x-N.x)<34&&Math.abs(y-N.y)<34);
const near=()=>Math.hypot(P.x-N.x,P.y-N.y)<110;
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();keys[k]=1;
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
const hide=()=>{ov.style.display='none'};

/* ---------- FLUXO ---------- */
function intro(){show(`<div class="card"><div class="foe">🚀</div><h2>Missão Cosmos 62</h2><p>Ano de 1962, auge da Guerra Fria. Você está a bordo da nave soviética <b>Vostok-K</b>. Explore a nave e encontre o Comandante.</p><p>💻 Mover: WASD ou setas · Falar: E<br>📱 Use o direcional e o botão FALAR<br>🔊 Ative o som do seu aparelho</p><button class="o" onclick="au();sfx('talk');hide();st='explore'">Começar missão</button></div>`)}
function talk(){
  if(!near())return;
  st='dialog';sfx('talk');
  show(`<div class="card">${AV}<h2>Comandante Volkov</h2><p>Camarada, um agente inimigo se infiltrou na nave! Está pronto para batalhar?</p><button class="o" onclick="startBattle()">⚔️ Batalhar</button><button class="o" onclick="sfx('click');decline()">Não quero</button></div>`);
}
function decline(){show(`<div class="card">${AV}<p>Tudo bem, camarada. Volte quando estiver pronto.</p><button class="o" onclick="sfx('click');hide();st='explore'">Fechar</button></div>`)}

const sc=()=>`🧑‍🚀 Você: ★${B.me} &nbsp;·&nbsp; 👽 Agente Boris: ★${B.en}`;
function startBattle(){
  hide();pad.classList.add('off');bp.style.display='block';
  B={qs:shuf(Q.slice()),i:0,me:0,en:0,dm:0,de:0,over:0};
  BA={tb:t,pk:[],tx:[],sp:[],shP:0,shE:0,flP:0,flE:0,dead:0};
  st='battle';sfx('siren');
  setTimeout(()=>{if(st==='battle')ask()},1600);
  bp.innerHTML='';
}
function ask(){
  const [q,o]=B.qs[B.i%B.qs.length];
  B.cur=shuf(o.map((x,k)=>({t:x,ok:!k})));B.done=0;
  bp.innerHTML=`<div class="card"><div class="sc">${sc()}</div><p class="q">${B.i>3?'⚡ Desempate':'Pergunta '+(B.i+1)+' de 4'}<br>${q}</p>${B.cur.map((p,k)=>`<button class="o" onclick="ans(${k})">${p.t}</button>`).join('')}</div>`;
}
function ans(k){
  if(B.done)return;B.done=1;sfx('click');
  const ok=B.cur[k].ok,en=Math.random()<.5;
  if(ok)B.me++;if(en)B.en++;
  const card=bp.querySelector('.card');
  card.querySelectorAll('.o').forEach((b,j)=>{b.disabled=true;if(B.cur[j].ok)b.classList.add('ok');else if(j===k)b.classList.add('bad')});
  /* animação: seu ataque, depois o do inimigo */
  if(ok){sfx('ok');setTimeout(()=>shoot('p'),350)}else{sfx('bad');txt('P','ERROU!','#ff6b6b')}
  setTimeout(()=>{if(en)shoot('e');else txt('E','ERROU!','#9ad')},1100);
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
  B.over=1;BA.dead='e';sfx('boom');burst(W-190,300,120,['#ffee55','#ff9900','#ff3322']);
  setTimeout(()=>{bp.style.display='none';st='win';t0=t;endShown=false;sfx('rumble');setTimeout(()=>sfx('win'),2600)},2000);
}
function lose(){
  bp.innerHTML=`<div class="card"><h2>👽 Você perdeu...</h2><p>Placar final: ${B.me} x ${B.en}. O inimigo sabotou os motores!</p></div>`;
  B.over=1;BA.dead='p';sfx('hit');burst(190,300,60,['#ff3322','#888']);
  setTimeout(()=>{bp.style.display='none';st='lose';t0=t;endShown=false;PT=[]},2000);
}
function restart(){hide();bp.style.display='none';pad.classList.remove('off');P={x:400,y:535};st='explore'}
function endCard(e,ti,tx){show(`<div class="card"><div class="foe">${e}</div><h2>${ti}</h2><p>${tx}</p><button class="o" onclick="sfx('click');restart()">Jogar de novo</button></div>`)}

/* ---------- EFEITOS DE BATALHA ---------- */
const PX=190,EX=W-190;
function shoot(s){sfx('laser');BA.pk.push({s,x:s==='p'?PX+60:EX-60})}
function txt(side,s,c){BA.tx.push({x:side==='P'?PX:EX,y:250,s,c,l:60})}
function burst(x,y,n,cols){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=1+Math.random()*7;BA.sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:40+Math.random()*50,c:cols[Math.random()*cols.length|0]})}}
function hitSide(s){ // s: lado atingido
  sfx('hit');burst(s==='e'?EX:PX,320,35,s==='e'?['#ffee55','#ff9900']:['#ff3322','#ff9900']);
  if(s==='e'){BA.shE=18;BA.flE=12;B.dm++}else{BA.shP=18;BA.flP=12;B.de++}
}
function bar(x,label,n,col){
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,16,260,40);g.strokeStyle=col;g.lineWidth=2;g.strokeRect(x,16,260,40);
  g.fillStyle='#fff';g.font='bold 14px system-ui,sans-serif';g.textAlign='left';g.fillText(label,x+10,32);
  for(let i=0;i<Math.max(4,n);i++){g.fillStyle=i<n?col:'rgba(255,255,255,.15)';g.fillRect(x+10+i*36,38,30,10)}
}
function drawBattle(k){
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#04060d');gr.addColorStop(1,'#241016');g.fillStyle=gr;g.fillRect(0,0,W,H);stars();
  g.fillStyle='#232a35';g.fillRect(0,400,W,140);
  g.strokeStyle='rgba(209,47,53,.5)';g.lineWidth=2;
  for(let i=-6;i<=6;i++){g.beginPath();g.moveTo(W/2+i*40,400);g.lineTo(W/2+i*190,H);g.stroke()}
  g.strokeStyle='#d12f35';g.lineWidth=4;g.beginPath();g.moveTo(0,400);g.lineTo(W,400);g.stroke();
  const ent=Math.min(k/45,1),ex=EX+(1-ent)*(W/2);
  /* personagens */
  const draw=(x,e,sh,fl,dead)=>{
    if(dead)return;
    const ox=sh>0?(Math.random()-.5)*sh:0,by=Math.sin(t*.08+x)*4;
    g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(x,410,60,12,0,0,7);g.fill();
    if(fl>0){g.fillStyle='rgba(255,60,60,.45)';g.beginPath();g.arc(x,320,70,0,7);g.fill()}
    if(e==='P')spr(SPR.p,x+ox,415,190,{bob:by,flip:1});else if(e==='A'){g.fillStyle=`rgba(255,60,60,${.14+.06*Math.sin(t*.12)})`;g.beginPath();g.arc(x,320,95,0,7);g.fill();spr(SPR.n,x+ox,415,190,{bob:by,flip:-1,sy:1+Math.sin(t*.1)*.03})}else{g.font='110px serif';g.textAlign='center';g.fillText(e,x+ox,380+by)}
  };
  draw(PX,'P',BA.shP,BA.flP,BA.dead==='p');
  draw(ex,'A',BA.shE,BA.flE,BA.dead==='e');
  if(BA.shP>0)BA.shP--;if(BA.shE>0)BA.shE--;if(BA.flP>0)BA.flP--;if(BA.flE>0)BA.flE--;
  /* projéteis */
  BA.pk=BA.pk.filter(p=>{
    p.x+=p.s==='p'?26:-26;
    const col=p.s==='p'?'#4fe3ff':'#ff4d4d';
    g.strokeStyle=col;g.lineWidth=6;g.shadowColor=col;g.shadowBlur=18;g.beginPath();g.moveTo(p.x,300);g.lineTo(p.x+(p.s==='p'?-50:50),300);g.stroke();g.shadowBlur=0;
    if(p.s==='p'&&p.x>=EX-70){hitSide('e');return false}
    if(p.s==='e'&&p.x<=PX+70){hitSide('p');return false}
    return true;
  });
  BA.sp=BA.sp.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.l--;g.globalAlpha=Math.max(0,p.l/60);g.fillStyle=p.c;g.fillRect(p.x,p.y,5,5);g.globalAlpha=1;return p.l>0});
  BA.tx=BA.tx.filter(f=>{f.y-=1;f.l--;g.globalAlpha=Math.min(1,f.l/30);g.fillStyle=f.c;g.font='bold 30px system-ui,sans-serif';g.textAlign='center';g.fillText(f.s,f.x,f.y);g.globalAlpha=1;return f.l>0});
  bar(14,'VOCÊ',B.dm,'#4fe3ff');bar(W-274,'AGENTE BORIS',B.de,'#ff4d4d');
  g.fillStyle='#fff';g.textAlign='center';g.font='bold 22px system-ui,sans-serif';g.fillText('VS',W/2,44);
  if(k<90&&(k%20<12)){g.fillStyle='rgba(180,20,30,.75)';g.fillRect(0,200,W,64);g.fillStyle='#fff';g.font='bold 34px system-ui,sans-serif';g.fillText('⚠ INIMIGO DETECTADO ⚠',W/2,243)}
  if(B&&B.over){g.fillStyle='#f2c14e';g.font='bold 34px system-ui,sans-serif';g.fillText(BA.dead==='e'?'INIMIGO DERROTADO!':'VOCÊ FOI DERROTADO!',W/2,150)}
}

/* ---------- EXPLORAÇÃO ---------- */
function upd(){
  let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+tv.x;
  let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+tv.y;
  dx=Math.max(-1,Math.min(1,dx));dy=Math.max(-1,Math.min(1,dy));
  const m=Math.hypot(dx,dy)||1,sp=4.2;
  const nx=P.x+dx/m*sp,ny=P.y+dy/m*sp;
  P.mv=!!(dx||dy);if(P.mv){if(!blocked(nx,P.y))P.x=nx;if(!blocked(P.x,ny))P.y=ny;P.ph=(P.ph||0)+.28;if(dx)P.f=dx>0?1:-1;if(++stepT%11===0)sfx('step')}
}
function drawMap(){
  const cx=Math.max(0,Math.min(WW-W,P.x-W/2)),cy=Math.max(0,Math.min(WH-H,P.y-H/2));
  g.fillStyle='#000';g.fillRect(0,0,W,H);
  if(loaded)g.drawImage(IMG,cx,cy,W,H,0,0,W,H);else{g.fillStyle='#fff';g.font='20px system-ui';g.textAlign='center';g.fillText('Carregando nave...',W/2,H/2)}
  const nx=N.x-cx,ny=N.y-cy,px=P.x-cx,py=P.y-cy;
  g.textAlign='center';
  const r=30+Math.sin(t*.1)*5;g.strokeStyle='#f2c14e';g.lineWidth=3;g.beginPath();g.ellipse(nx,ny+22,r,r*.45,0,0,7);g.stroke();
  /* NPC alienígena: flutua, balança, respira e olha para o jogador */
  const hv=Math.sin(t*.06),nb=-8+hv*6;
  const ag=g.createRadialGradient(nx,ny-30,5,nx,ny-30,75);ag.addColorStop(0,`rgba(120,255,140,${.28+.12*Math.sin(t*.1)})`);ag.addColorStop(1,'rgba(120,255,140,0)');g.fillStyle=ag;g.fillRect(nx-80,ny-110,160,160);
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(nx,ny+26,26-hv*3,9-hv,0,0,7);g.fill();
  spr(SPR.n,nx,ny+26,96,{bob:nb,rot:Math.sin(t*.045)*.07,sy:1+Math.sin(t*.09)*.03,sx:1-Math.sin(t*.09)*.02,flip:P.x<N.x?-1:1});
  /* jogador astronauta: pulinhos e balanço ao andar, respira parado */
  const mv=P.mv,ph=P.ph||0,sq=mv?Math.abs(Math.sin(ph)):0;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(px,py+26,24-sq*5,8-sq*2,0,0,7);g.fill();
  spr(SPR.p,px,py+26,88,{bob:mv?-sq*8:0,rot:mv?Math.sin(ph)*.1:0,sy:mv?1+Math.cos(ph*2)*.04:1+Math.sin(t*.05)*.015,sx:mv?1-Math.cos(ph*2)*.03:1,flip:P.f||1});
  g.textAlign='center';g.font='bold 22px system-ui';g.fillStyle='#f2c14e';g.fillText('!',nx,ny-100+Math.sin(t*.12)*3);
  if(near()&&st==='explore'){g.font='bold 15px system-ui,sans-serif';g.fillStyle='rgba(0,0,0,.7)';g.fillRect(nx-60,ny-136,120,22);g.fillStyle='#f2c14e';g.fillText('Falar (E)',nx,ny-120)}
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(8,8,330,26);g.textAlign='left';g.font='bold 13px system-ui,sans-serif';g.fillStyle='#f2c14e';
  g.fillText('★ VOSTOK-K · OBJETIVO: FALE COM O COMANDANTE',16,26);
}

/* ---------- ANIMAÇÕES FINAIS ---------- */
function rocket(x,y,a,s,flame){
  g.save();g.translate(x,y);g.rotate(a);g.scale(s,s);
  if(flame){g.fillStyle='#ffb020';g.beginPath();g.moveTo(-8,30);g.lineTo(0,50+Math.random()*18);g.lineTo(8,30);g.fill();g.fillStyle='#fff3a0';g.beginPath();g.moveTo(-4,30);g.lineTo(0,42+Math.random()*8);g.lineTo(4,30);g.fill()}
  g.fillStyle='#b22';
  g.beginPath();g.moveTo(-12,8);g.lineTo(-25,34);g.lineTo(-12,30);g.fill();
  g.beginPath();g.moveTo(12,8);g.lineTo(25,34);g.lineTo(12,30);g.fill();
  g.fillStyle='#e9e9ee';g.beginPath();g.moveTo(0,-42);g.quadraticCurveTo(17,-14,12,30);g.lineTo(-12,30);g.quadraticCurveTo(-17,-14,0,-42);g.fill();
  g.fillStyle='#c0282d';g.beginPath();g.moveTo(0,-42);g.quadraticCurveTo(10,-32,12,-20);g.lineTo(-12,-20);g.quadraticCurveTo(-10,-32,0,-42);g.fill();
  g.fillStyle='#3aa0d8';g.beginPath();g.arc(0,0,6,0,7);g.fill();
  g.restore();
}
function stars(){g.fillStyle='#fff';S.forEach(s=>{g.globalAlpha=.5+.5*Math.sin(t*.05+s.x);g.fillRect(s.x,s.y,s.r,s.r)});g.globalAlpha=1}
function msg(s,y){g.fillStyle='#eef1f5';g.font='bold 22px system-ui,sans-serif';g.textAlign='center';g.fillText(s,W/2,y)}
function drawWin(k){
  const p=Math.min(k/380,1),cx=W/2,eTop=H-100-300*p,sy=60+(eTop-100)*p;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#02030a');gr.addColorStop(1,'#0b1b3a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  stars();
  g.strokeStyle='rgba(120,200,255,.5)';g.lineWidth=10;g.fillStyle='#1f5fa8';g.beginPath();g.arc(cx,H+600-300*p,700,0,7);g.fill();g.stroke();
  g.fillStyle='#2e8b57';g.beginPath();g.ellipse(cx-160,eTop+120,90,40,.3,0,7);g.ellipse(cx+200,eTop+160,120,50,-.2,0,7);g.fill();
  if(p>.5){const a=Math.min((p-.5)*2,1),rg=g.createRadialGradient(cx,sy+60,5,cx,sy+60,90);rg.addColorStop(0,`rgba(255,200,80,${a})`);rg.addColorStop(1,'rgba(255,80,0,0)');g.fillStyle=rg;g.fillRect(cx-100,sy-40,200,200)}
  if(p>.85){g.fillStyle='#eee';g.beginPath();g.arc(cx,sy-70,75,Math.PI,0);g.fill();g.strokeStyle='#ddd';g.lineWidth=2;g.beginPath();g.moveTo(cx-75,sy-70);g.lineTo(cx,sy-30);g.moveTo(cx+75,sy-70);g.lineTo(cx,sy-30);g.stroke()}
  rocket(cx,sy,Math.PI,1.4,p<.85);
  msg(p<.5?'Nave deixando a órbita...':p<.85?'Reentrada na atmosfera!':'Pouso seguro! Missão cumprida!',40);
  if(k>420&&!endShown){endShown=true;endCard('🌍','Missão cumprida!','A Vostok-K voltou para a Terra. O agente inimigo foi derrotado e a União Soviética celebra sua vitória!')}
}
function drawLose(k){
  g.fillStyle='#02030a';g.fillRect(0,0,W,H);stars();
  if(k<70){const sh=k*.06;rocket(W/2+(Math.random()-.5)*sh,H/2+(Math.random()-.5)*sh,0,1.8,true);msg('ALERTA! Motores sabotados!',40);if(k%16<8){g.fillStyle='rgba(200,30,30,.2)';g.fillRect(0,0,W,H)}if(k===1)sfx('siren')}
  else{
    if(k===70){sfx('boom');for(let i=0;i<150;i++){const a=Math.random()*6.283,s=1+Math.random()*7;PT.push({x:W/2,y:H/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:60+Math.random()*70,c:['#ffee55','#ff9900','#ff3322','#888'][Math.random()*4|0]})}}
    g.strokeStyle=`rgba(255,200,100,${Math.max(0,1-(k-70)/40)})`;g.lineWidth=6;g.beginPath();g.arc(W/2,H/2,(k-70)*9,0,7);g.stroke();
    PT.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;p.l--;g.globalAlpha=Math.max(0,p.l/110);g.fillStyle=p.c;const z=3+p.l/20;g.fillRect(p.x,p.y,z,z)});g.globalAlpha=1;PT=PT.filter(p=>p.l>0);
    if(k<90){g.fillStyle=`rgba(255,255,255,${(90-k)/20})`;g.fillRect(0,0,W,H)}
    msg('A nave explodeu!',40);
    if(k>240&&!endShown){endShown=true;endCard('💥','A nave explodeu!','Você errou demais e o agente inimigo destruiu a Vostok-K. Tente novamente, camarada!')}
  }
}
function loop(){
  t++;
  if(st==='explore')upd();
  if(st==='win')drawWin(t-t0);
  else if(st==='lose')drawLose(t-t0);
  else if(st==='battle')drawBattle(t-BA.tb);
  else drawMap();
  requestAnimationFrame(loop);
}
intro();loop();
