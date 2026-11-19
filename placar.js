/* ---------- PLACAR · MISSÃO COSMOS 62 ----------
   Lê a planilha "Missão Cosmo - Resultados" (aba Partidas) direto do Google Sheets.
   Requisito: a planilha precisa estar com acesso "Qualquer pessoa com o link: Leitor". */
const SHEET_ID='1gOp6iNMDRqMf-wsJhoEzpMqfHawtgnf5Tsbp9MnQVxE';
const ABA='Partidas';
const ATUALIZA_MS=30000;

/* mesmas skins do jogo (game.js) */
const SKINS=[{n:'Laranja',c:'255,150,50'},{n:'Azul',h:210,c:'70,150,255'},{n:'Ciano',h:185,c:'60,230,255'},{n:'Verde',h:125,c:'80,240,120'},{n:'Roxo',h:275,c:'180,100,255'},{n:'Rosa',h:322,c:'255,90,190'},{n:'Vermelho',h:355,c:'255,70,90'},{n:'Dourado',h:48,s:1.15,l:1.06,c:'255,210,80'},{n:'Lunar',w:1,c:'225,240,255'}];
const norm=s=>String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const skinIdx=nome=>{const i=SKINS.findIndex(k=>norm(k.n)===norm(nome));return i<0?0:i};

const $=id=>document.getElementById(id);
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
let PARTIDAS=[],FILTRO='todos',ORDEM='pontos',BUSCA='',TIMER=null;

/* ---------- recolor do astronauta (mesma lógica do jogo) ---------- */
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[h,s,l]}
function hsl2rgb(h,s,l){if(!s){const v=l*255;return[v,v,v]}const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]}
const BASE=new Image(),CACHE={};
const baseOk=new Promise(r=>{BASE.onload=()=>r(true);BASE.onerror=()=>r(false);BASE.src='assets/astronauta.png'});
function skinURL(i){
  const sk=SKINS[i];
  if(!i||!BASE.naturalWidth)return BASE.src;
  if(CACHE[i])return CACHE[i];
  try{
    const c=document.createElement('canvas');c.width=BASE.naturalWidth;c.height=BASE.naturalHeight;
    const x=c.getContext('2d');x.drawImage(BASE,0,0);
    const d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(let k=0;k<p.length;k+=4){
      if(p[k+3]<10)continue;
      let[h,sa,l]=rgb2hsl(p[k],p[k+1],p[k+2]);
      if(h>.015&&h<.13&&sa>.3&&l>.1){
        if(sk.w){sa*=.1;l=Math.min(1,l*1.05+.14)}else{h=sk.h/360+(h-.07)*.4;sa=Math.min(1,sa*(sk.s||1));l=Math.min(1,l*(sk.l||1))}
        const[r,g2,b]=hsl2rgb((h+1)%1,sa,l);p[k]=r;p[k+1]=g2;p[k+2]=b;
      }
    }
    x.putImageData(d,0,0);return CACHE[i]=c.toDataURL();
  }catch(e){return BASE.src} /* ex.: aberto via file:// */
}

/* ---------- leitura da planilha (gviz, sem CORS) ---------- */
function lerPlanilha(){
  return new Promise((res,rej)=>{
    const cb='__gv'+Date.now()+Math.floor(Math.random()*1e5),s=document.createElement('script');
    const fim=()=>{clearTimeout(t);delete window[cb];s.remove()};
    const t=setTimeout(()=>{fim();rej(new Error('tempo esgotado'))},15000);
    window[cb]=r=>{fim();r&&r.status==='ok'&&r.table?res(r.table):rej(new Error((r&&r.errors&&r.errors[0]&&r.errors[0].message)||'resposta inválida'))};
    s.onerror=()=>{fim();rej(new Error('falha de rede'))};
    s.src=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(ABA)}&headers=1&tqx=${encodeURIComponent('out:json;responseHandler:'+cb)}&_=${Date.now()}`;
    document.head.appendChild(s);
  });
}
const POS={data:0,nome:1,acertos:2,erros:3,total:4,pontos:5,resultado:6,pj:7,pa:8,skin:9,id:10};
const LABELS={data:['data e hora','data','data/hora'],nome:['jogador','nome'],acertos:['acertos'],erros:['erros'],total:['total de perguntas','total'],pontos:['pontuacao','pontos'],resultado:['resultado'],pj:['placar jogador'],pa:['placar adversario'],skin:['personagem','skin','traje'],id:['id da partida','id']};
function dataTs(cel){
  if(!cel)return{ts:0,txt:''};
  const v=cel.v,f=cel.f;
  let m=typeof v==='string'&&v.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
  if(m)return{ts:new Date(+m[1],+m[2],+m[3],+m[4]||0,+m[5]||0,+m[6]||0).getTime(),txt:f||''};
  const txt=String(f||v||'');
  m=txt.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  return{ts:m?new Date(+m[3],+m[2]-1,+m[1],+m[4]||0,+m[5]||0,+m[6]||0).getTime():0,txt};
}
function tabelaParaPartidas(t){
  const col={};
  Object.keys(POS).forEach(k=>{
    const i=t.cols.findIndex(c=>LABELS[k].includes(norm(c.label)));
    col[k]=i>=0?i:POS[k];
  });
  const vistos=new Set(),out=[];
  t.rows.forEach(r=>{
    const c=r.c||[],g=k=>c[col[k]]?c[col[k]].v:null;
    const nome=String(g('nome')==null?'':g('nome')).trim();
    if(!nome)return;
    const id=String(g('id')||'');
    if(id){if(vistos.has(id))return;vistos.add(id)}
    const num=k=>{const n=Number(g(k));return isFinite(n)?n:0};
    const acertos=num('acertos'),pontos=g('pontos')==null?acertos*100:num('pontos');
    const d=dataTs(c[col.data]);
    out.push({nome,acertos,erros:num('erros'),total:num('total')||acertos+num('erros'),pontos,
      venceu:norm(g('resultado')).startsWith('vit'),pj:num('pj'),pa:num('pa'),
      skin:skinIdx(g('skin')),skinNome:SKINS[skinIdx(g('skin'))].n,ts:d.ts,dataTxt:d.txt});
  });
  return out;
}

/* ---------- tela ---------- */
function stats(){
  const v=PARTIDAS.filter(p=>p.venceu).length,top=PARTIDAS.reduce((a,p)=>p.pontos>(a?a.pontos:-1)?p:a,null);
  const box=$('stats');box.textContent='';
  [['Partidas',PARTIDAS.length,''],['Vitórias',v,'w'],['Derrotas',PARTIDAS.length-v,'l'],['Recorde',top?top.pontos:0,'']].forEach(([l,n,c])=>{
    const d=el('div','st '+c),b=el('b',null,n);d.append(b,el('span',null,l));box.append(d);
  });
}
function visiveis(){
  let a=PARTIDAS.filter(p=>FILTRO==='todos'||(FILTRO==='vitoria')===p.venceu);
  if(BUSCA)a=a.filter(p=>norm(p.nome).includes(norm(BUSCA)));
  return a.sort(ORDEM==='recentes'?(x,y)=>y.ts-x.ts:(x,y)=>y.pontos-x.pontos||x.erros-y.erros||x.ts-y.ts);
}
function linha(p,i){
  const medal=ORDEM==='pontos'&&FILTRO!=='derrota'&&!BUSCA&&i<3?' p'+(i+1):'';
  const it=el('article','it '+(p.venceu?'w':'l')+medal);
  it.style.setProperty('--sc','rgb('+SKINS[p.skin].c+')');
  it.style.animationDelay=Math.min(i,12)*40+'ms';
  const pos=el('div','pos',medal&&i===0?'🥇':medal&&i===1?'🥈':medal&&i===2?'🥉':'#'+(i+1));
  const av=el('div','av'),img=new Image();img.alt='Cosmonauta '+p.skinNome;img.src=skinURL(p.skin);av.append(img);
  const inf=el('div','inf');
  const meta=el('div','meta');
  const cor=el('i');cor.append(el('span','sw'),document.createTextNode(p.skinNome));
  meta.append(cor,el('i',null,'✔ '+p.acertos+(p.acertos===1?' acerto':' acertos')),el('i',null,'✖ '+p.erros+(p.erros===1?' erro':' erros')));
  inf.append(el('div','nome',p.nome),meta);
  if(p.dataTxt)inf.append(el('div','dt',p.dataTxt));
  const rs=el('div','rs'),pts=el('div','pts',p.pontos);pts.append(el('small',null,'PTS'));
  const tag=el('span','tag',p.venceu?'🏅 Vitória':'💥 Derrota');
  rs.append(tag,pts,el('div','plc','Placar '+p.pj+' x '+p.pa));
  it.append(pos,av,inf,rs);
  return it;
}
function desenhar(){
  stats();
  const lista=$('lista');lista.textContent='';
  const a=visiveis();
  if(!a.length){
    const v=el('div','card vazio');
    const im=new Image();im.src='assets/alien.png';im.alt='';
    v.append(im,el('h2',null,PARTIDAS.length?'Nada por aqui':'Nenhuma missão registrada'),
      el('p',null,PARTIDAS.length?'Nenhum cosmonauta bate com esse filtro.':'Conclua uma batalha no jogo e o resultado aparece aqui!'));
    lista.append(v);return;
  }
  const fr=document.createDocumentFragment();a.forEach((p,i)=>fr.append(linha(p,i)));lista.append(fr);
}
function mostrarCarregando(){
  const c=el('div','card carr');c.append(el('h2',null,'Sincronizando com a base…'));
  const d=el('div','dots');d.append(el('i'),el('i'),el('i'));c.append(d);
  $('lista').textContent='';$('lista').append(c);
}
function mostrarErro(e){
  const c=el('div','card erro');
  c.append(el('h2',null,'📡 Sinal perdido'),
    el('p',null,'Não consegui ler a planilha ('+e.message+'). Confira se ela está compartilhada como “Qualquer pessoa com o link: Leitor” e tente de novo.'));
  const b=el('button',null,'↻ TENTAR DE NOVO');b.onclick=()=>carregar(true);c.append(b);
  $('lista').textContent='';$('lista').append(c);
}
async function carregar(primeira){
  const rf=$('rf');rf.classList.add('spin');
  if(primeira&&!PARTIDAS.length)mostrarCarregando();
  try{
    const [t]=await Promise.all([lerPlanilha(),baseOk]);
    PARTIDAS=tabelaParaPartidas(t);
    desenhar();
    $('upd').textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · automático a cada 30 s';
  }catch(e){
    console.error('Placar:',e);
    if(!PARTIDAS.length)mostrarErro(e);
    else $('upd').textContent='Sem conexão · exibindo os últimos dados';
  }finally{rf.classList.remove('spin')}
}
function agendar(){clearInterval(TIMER);TIMER=setInterval(()=>{if(!document.hidden)carregar()},ATUALIZA_MS)}

$('chips').addEventListener('click',e=>{
  const b=e.target.closest('.chip');if(!b)return;
  FILTRO=b.dataset.f;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));desenhar();
});
$('q').addEventListener('input',e=>{BUSCA=e.target.value;desenhar()});
$('ord').addEventListener('change',e=>{ORDEM=e.target.value;desenhar()});
$('rf').addEventListener('click',()=>carregar());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregar()});
carregar(true);agendar();
