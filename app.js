'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('profileCanvas');
const ctx = canvas.getContext('2d');
const MAX_PICK = 8;
const STORAGE_KEY = 'dbd-korea-profile-card-v3';
const SHARE_VERSION = 3;
const OFFLINE_READY_KEY = 'dbd-korea-offline-ready-v1';

const THEMES = {
  mist: {label:'안개',bg1:'#08131b',bg2:'#111b25',accent:'#e9465c',survivor:'#56dfd1',killer:'#ff5268',panel:'rgba(10,18,26,.78)',grid:'rgba(107,211,210,.08)'},
  blood: {label:'블러드 레드',bg1:'#15070a',bg2:'#2b0a10',accent:'#ff4057',survivor:'#d8f5ef',killer:'#ff5268',panel:'rgba(25,8,12,.78)',grid:'rgba(255,80,97,.07)'},
  midnight: {label:'딥 네이비',bg1:'#070a17',bg2:'#10162c',accent:'#7767ff',survivor:'#65e5dc',killer:'#ff657d',panel:'rgba(9,12,30,.78)',grid:'rgba(119,103,255,.08)'}
};
const PLATFORMS = [
  {id:'steam',label:'Steam',shortLabel:'Steam',icon:'assets/steam.png'},
  {id:'playstation',label:'PlayStation',shortLabel:'PS',icon:'assets/playstation.png'},
  {id:'xbox',label:'Xbox',shortLabel:'Xbox',icon:'assets/platforms/xbox.png'},
  {id:'switch',label:'Switch',shortLabel:'Switch',icon:'assets/switch.png'},
  {id:'epic',label:'Epic Games',shortLabel:'Epic',icon:'assets/platforms/epic.png'},
  {id:'msstore',label:'MS Store',shortLabel:'MS',icon:'assets/platforms/msstore.png'}
];
const DISCORD_ICON = 'assets/platforms/discord.svg';
const GRADES = ['미설정','잿빛 IV','잿빛 III','잿빛 II','잿빛 I','청동 IV','청동 III','청동 II','청동 I','은빛 IV','은빛 III','은빛 II','은빛 I','금빛 IV','금빛 III','금빛 II','금빛 I','무지갯빛 IV','무지갯빛 III','무지갯빛 II','무지갯빛 I'];

const defaultState = () => ({
  name:'서드', friend:'336408423', time:'21:00 ~ 03:00', playStyle:'즐겜 · 협동',
  survivorGrade:'무지갯빛 I', killerGrade:'무지갯빛 I', platforms:['steam','playstation','switch'], vc:true,
  quote:'DONE AND DUSTED.\nTERCEIRA ESTACAO.', theme:'mist',
  survivors:['S32','S26','S33','S28','S41','S36'], killers:['K11','K27','K24','K25','K43','K10']
});
let state = defaultState();
let toastTimer = null;
let saveTimer = null;
const imageCache = new Map();
const assetCache = new Map();

const gradeTierToFile = {'잿빛':'ash','청동':'bronze','은빛':'silver','금빛':'gold','무지갯빛':'iri'};
const romanToNum = {'IV':'4','III':'3','II':'2','I':'1'};
const GRADE_ASSETS = Object.fromEntries(GRADES.map((grade)=>[grade, getGradeAssetPath(grade)]));

function getGradeAssetPath(grade){
  if(grade === '미설정') return 'assets/grades/none.png';
  const [tier, roman] = String(grade).split(' ');
  const fileTier = gradeTierToFile[tier] || 'ash';
  const num = romanToNum[roman] || '4';
  return `assets/grades/${fileTier}-${num}.png`;
}

function proxyImage(url){
  const cleaned = url.replace(/^https?:\/\//,'');
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleaned)}&w=360&h=360&fit=cover&output=png`;
}

function localPortrait(c){ return `assets/portraits/${c.id}.png`; }
function embeddedPortrait(c){ return window.EMBEDDED_PORTRAITS?.[c.id] || ''; }
function applyPortraitSource(img,c,size=240){
  const embedded = embeddedPortrait(c);
  if(embedded){ img.src=embedded; return; }
  let stage=0;
  img.src=localPortrait(c);
  img.onerror=()=>{
    if(stage===0){
      stage=1;
      img.crossOrigin='anonymous';
      img.src=proxyImage(c.image,size);
      return;
    }
    img.onerror=null;
    img.style.opacity='.18';
  };
}

function sanitizeState(raw){
  const clean = defaultState();
  if(!raw || typeof raw !== 'object') return clean;
  clean.name = String(raw.name ?? clean.name).slice(0,18);
  clean.friend = String(raw.friend ?? clean.friend).slice(0,24);
  clean.time = String(raw.time ?? clean.time).slice(0,24);
  clean.playStyle = String(raw.playStyle ?? clean.playStyle).slice(0,18);
  clean.quote = String(raw.quote ?? clean.quote).slice(0,90);
  clean.survivorGrade = GRADES.includes(raw.survivorGrade) ? raw.survivorGrade : clean.survivorGrade;
  clean.killerGrade = GRADES.includes(raw.killerGrade) ? raw.killerGrade : clean.killerGrade;
  clean.platforms = Array.isArray(raw.platforms) ? raw.platforms.filter(v=>PLATFORMS.some(p=>p.id===v)).slice(0,6) : clean.platforms;
  clean.vc = Boolean(raw.vc);
  clean.theme = Object.hasOwn(THEMES, raw.theme) ? raw.theme : clean.theme;
  clean.survivors = Array.isArray(raw.survivors) ? [...new Set(raw.survivors.filter(id=>SURVIVORS.some(c=>c.id===id)))].slice(0,MAX_PICK) : clean.survivors;
  clean.killers = Array.isArray(raw.killers) ? [...new Set(raw.killers.filter(id=>KILLERS.some(c=>c.id===id)))].slice(0,MAX_PICK) : clean.killers;
  return clean;
}

function decodeShareHash(){
  const match = location.hash.match(/^#p=([A-Za-z0-9_-]+)$/);
  if(!match) return null;
  try{
    const base64 = match[1].replace(/-/g,'+').replace(/_/g,'/');
    const pad = base64 + '='.repeat((4-base64.length%4)%4);
    const bytes = Uint8Array.from(atob(pad), c=>c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if(payload.v !== SHARE_VERSION) return null;
    return sanitizeState(payload.s);
  } catch { return null; }
}
function encodeState(){
  const bytes = new TextEncoder().encode(JSON.stringify({v:SHARE_VERSION,s:state}));
  let binary=''; bytes.forEach(b=>binary+=String.fromCharCode(b));
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function loadInitialState(){
  const shared = decodeShareHash();
  if(shared){ state = shared; showToast('공유 프로필을 불러왔습니다.'); return; }
  try{ state = sanitizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); }catch{ state=defaultState(); }
}

function buildStaticControls(){
  GRADES.forEach(g=>{
    $('survivorGrade').add(new Option(g,g));
    $('killerGrade').add(new Option(g,g));
  });
  const pb = $('platformButtons');
  PLATFORMS.forEach(p=>{
    const btn=document.createElement('button'); btn.type='button'; btn.className='chip-button'; btn.dataset.id=p.id;
    btn.innerHTML=`<img src="${p.icon}" alt="" /><span>${p.label}</span>`;
    btn.addEventListener('click',()=>{
      state.platforms = state.platforms.includes(p.id) ? state.platforms.filter(x=>x!==p.id) : [...state.platforms,p.id];
      updateControls(); changed();
    });
    pb.appendChild(btn);
  });
  const tb=$('themeButtons');
  Object.entries(THEMES).forEach(([id,t])=>{
    const btn=document.createElement('button'); btn.type='button'; btn.className='theme-button'; btn.dataset.id=id;
    btn.innerHTML=`<span class="chip-dot" style="background:${t.accent}"></span><span>${t.label}</span>`;
    btn.addEventListener('click',()=>{state.theme=id;updateControls();changed();}); tb.appendChild(btn);
  });
}

function bindInputs(){
  const map=[['nameInput','name'],['friendInput','friend'],['timeInput','time'],['styleInput','playStyle'],['quoteInput','quote']];
  map.forEach(([id,key])=>$(id).addEventListener('input',e=>{state[key]=e.target.value;changed(); if(key==='quote') updateQuoteCount();}));
  $('survivorGrade').addEventListener('change',e=>{state.survivorGrade=e.target.value;changed();});
  $('killerGrade').addEventListener('change',e=>{state.killerGrade=e.target.value;changed();});
  $('vcInput').addEventListener('change',e=>{state.vc=e.target.checked;changed();});
  $('survivorSearch').addEventListener('input',renderCharacterGrids);
  $('killerSearch').addEventListener('input',renderCharacterGrids);
  $('resetBtn').addEventListener('click',()=>{
    if(!confirm('입력 내용과 캐릭터 선택을 초기 상태로 되돌릴까요?')) return;
    state=defaultState(); history.replaceState(null,'',location.pathname+location.search); updateControls(); renderCharacterGrids(); changed(); showToast('초기화했습니다.');
  });
  $('downloadBtn').addEventListener('click',exportPng);
  $('shareBtn').addEventListener('click',copyShareLink);
  $('offlineBtn').addEventListener('click',prepareOffline);
}

function updateControls(){
  $('nameInput').value=state.name; $('friendInput').value=state.friend; $('timeInput').value=state.time; $('styleInput').value=state.playStyle;
  $('survivorGrade').value=state.survivorGrade; $('killerGrade').value=state.killerGrade; $('vcInput').checked=state.vc; $('quoteInput').value=state.quote;
  const survivorGradeSrc = GRADE_ASSETS[state.survivorGrade] || GRADE_ASSETS['미설정'];
  const killerGradeSrc = GRADE_ASSETS[state.killerGrade] || GRADE_ASSETS['미설정'];
  $('survivorGradePreview').src = survivorGradeSrc; $('survivorGradeLabel').textContent = state.survivorGrade;
  $('killerGradePreview').src = killerGradeSrc; $('killerGradeLabel').textContent = state.killerGrade;
  document.querySelectorAll('#platformButtons .chip-button').forEach(b=>b.classList.toggle('active',state.platforms.includes(b.dataset.id)));
  document.querySelectorAll('#themeButtons .theme-button').forEach(b=>b.classList.toggle('active',state.theme===b.dataset.id));
  updateQuoteCount(); renderSelected(); drawCard();
}
function updateQuoteCount(){$('quoteCount').textContent=[...state.quote].length;}

function normalizeSearch(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^0-9a-z가-힣]/g,''); }
function makeCharacterCard(c,selected){
  const b=document.createElement('button'); b.type='button'; b.className='character-card'+(selected?' selected':''); b.title=`${c.ko} / ${c.en}`;
  const img=document.createElement('img'); img.loading='lazy'; img.alt=''; applyPortraitSource(img,c,200);
  const name=document.createElement('span'); name.className='char-name'; name.textContent=c.ko;
  const id=document.createElement('span'); id.className='char-id'; id.textContent=c.id;
  b.append(img,name,id); b.addEventListener('click',()=>toggleCharacter(c)); return b;
}
function renderCharacterGrids(){
  const render=(list,gridId,searchId,selectedIds)=>{
    const grid=$(gridId); grid.textContent=''; const q=normalizeSearch($(searchId).value.trim());
    const filtered=q?list.filter(c=>normalizeSearch(`${c.ko}${c.en}${c.id}`).includes(q)):list;
    if(!filtered.length){const p=document.createElement('div');p.className='no-results';p.textContent='검색 결과가 없습니다.';grid.appendChild(p);return;}
    const frag=document.createDocumentFragment(); filtered.forEach(c=>frag.appendChild(makeCharacterCard(c,selectedIds.includes(c.id)))); grid.appendChild(frag);
  };
  render(SURVIVORS,'survivorGrid','survivorSearch',state.survivors);
  render(KILLERS,'killerGrid','killerSearch',state.killers);
}
function toggleCharacter(c){
  const key=c.type==='survivor'?'survivors':'killers'; const arr=state[key];
  if(arr.includes(c.id)) state[key]=arr.filter(id=>id!==c.id);
  else { if(arr.length>=MAX_PICK){showToast(`최대 ${MAX_PICK}명까지 선택할 수 있습니다.`);return;} state[key]=[...arr,c.id]; }
  renderCharacterGrids(); renderSelected(); changed();
}
function renderSelected(){
  const render=(containerId,ids)=>{
    const box=$(containerId);box.textContent='';
    if(!ids.length){const e=document.createElement('span');e.className='selected-empty';e.textContent='선택한 캐릭터가 없습니다.';box.appendChild(e);return;}
    ids.forEach(id=>{const c=BY_ID.get(id);if(!c)return;const wrap=document.createElement('div');wrap.className='selected-chip';wrap.title=`${c.ko} — 클릭하여 제거`;const img=document.createElement('img');img.alt=c.ko;applyPortraitSource(img,c,120);const remove=document.createElement('button');remove.type='button';remove.setAttribute('aria-label',`${c.ko} 제거`);remove.addEventListener('click',()=>toggleCharacter(c));wrap.append(img,remove);box.appendChild(wrap);});
  };
  render('selectedSurvivors',state.survivors);render('selectedKillers',state.killers);$('survivorCount').textContent=state.survivors.length;$('killerCount').textContent=state.killers.length;
}

function changed(){
  $('saveState').textContent='저장 중…'; clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('saveState').textContent='자동 저장됨';},220);
  drawCard();
}

function showToast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2200);}

function roundedRect(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function panel(c,x,y,w,h,r,fill,stroke='rgba(255,255,255,.08)'){roundedRect(c,x,y,w,h,r);c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}
function text(c,value,x,y,size,weight='600',color='#fff',align='left',maxWidth){c.fillStyle=color;c.font=`${weight} ${size}px Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';if(maxWidth)c.fillText(value,x,y,maxWidth);else c.fillText(value,x,y);} 
function fitText(c,value,maxWidth,startSize=42,minSize=20,weight='700') {let size=startSize;while(size>minSize){c.font=`${weight} ${size}px Pretendard, 'Noto Sans KR', 'Malgun Gothic', sans-serif`;if(c.measureText(value).width<=maxWidth)break;size-=1;}return size;}
function line(c,x1,y1,x2,y2,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}

function loadAsset(src){
  if(!src) return Promise.resolve(null);
  const cached = assetCache.get(src);
  if(cached?.status === 'ready') return Promise.resolve(cached.img);
  if(cached?.promise) return cached.promise;
  const img = new Image(); img.decoding = 'async';
  const safeSrc = window.EMBEDDED_ASSETS?.[src] || src;
  const promise = new Promise(resolve=>{
    img.onload = ()=>{ assetCache.set(src,{status:'ready',img}); drawCardNoPreload(); resolve(img); };
    img.onerror = ()=>{ assetCache.set(src,{status:'error',img:null}); resolve(null); };
  });
  assetCache.set(src,{status:'loading',img,promise});
  img.src = safeSrc;
  return promise;
}
function getAsset(src){ const entry = assetCache.get(src); return entry?.status === 'ready' ? entry.img : null; }
function drawAsset(c,src,x,y,w,h){ const img = getAsset(src); if(img && img.complete) { c.drawImage(img,x,y,w,h); return true; } return false; }
function drawAssetContain(c,src,x,y,w,h){
  const img = getAsset(src); if(!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return false;
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  c.drawImage(img, x + (w-dw)/2, y + (h-dh)/2, dw, dh); return true;
}

function gradeColor(grade){ if(grade.startsWith('무지갯빛'))return '#ff4f63'; if(grade.startsWith('금빛'))return '#eab54d'; if(grade.startsWith('은빛'))return '#b9c4cf'; if(grade.startsWith('청동'))return '#b77a53'; return '#7f8a96'; }
function drawGrade(c,label,grade,x,y,w,theme){
  panel(c,x,y,w,106,20,'rgba(5,8,12,.36)');
  text(c,label,x+20,y+29,15,'700','#8f9ba9');
  const src = GRADE_ASSETS[grade] || GRADE_ASSETS['미설정'];
  const ok = drawAsset(c,src,x+18,y+19,68,68);
  if(!ok){
    const col=gradeColor(grade); c.save(); c.translate(x+52,y+55); c.rotate(Math.PI/4); c.fillStyle=col; c.globalAlpha=.92; c.fillRect(-20,-20,40,40); c.restore();
  }
  const gradeSize = fitText(c, grade, w-110, 22, 16, '800');
  text(c,grade,x+98,y+63,gradeSize,'800','#f4f6f8');
  text(c,grade==='미설정'?'배지 없음':'등급 배지',x+98,y+86,12,'600','#82909f');
}

function drawFog(c,w,h,theme){
  c.save();
  const blobs=[[-80,210,520,170,.11],[420,130,610,190,.085],[1060,210,570,170,.08],[190,700,700,190,.07],[1030,650,720,210,.07]];
  blobs.forEach(([x,y,bw,bh,a])=>{const g=c.createRadialGradient(x+bw*.5,y+bh*.5,10,x+bw*.5,y+bh*.5,bw*.55);g.addColorStop(0,`rgba(220,235,240,${a})`);g.addColorStop(1,'rgba(220,235,240,0)');c.fillStyle=g;c.fillRect(x,y,bw,bh);});
  c.globalAlpha=.18;c.strokeStyle=theme.grid;c.lineWidth=1;
  for(let gx=0;gx<w;gx+=80)line(c,gx,0,gx,h,theme.grid);for(let gy=0;gy<h;gy+=80)line(c,0,gy,w,gy,theme.grid);
  c.restore();
}
function drawBrand(c,theme){
  text(c,'DBD KOREA',78,72,18,'900','#f4f6f8'); text(c,'COMMUNITY PROFILE',78,98,12,'700','#768392');
  c.save(); c.translate(34,44); for(let i=0;i<4;i++){c.strokeStyle=i===0?theme.accent:'#e9eef2';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(i*10,4+(i%2)*4);c.lineTo(i*10-3,43-(i%2)*3);c.stroke();}c.restore();
  text(c,'비공식 팬메이드',1530,72,12,'700','#75818f','right'); text(c,'2026.10',1530,94,11,'600','#56616e','right');
}
function drawInfoBox(c,label,value,x,y,w,h,theme){
  panel(c,x,y,w,h,18,theme.panel);
  text(c,label,x+20,y+29,14,'700','#82909f');
  const s=fitText(c,value || '—',w-40,30,18,'750'); text(c,value || '—',x+20,y+68,s,'750','#f3f5f7');
}
function drawPlatformPills(c,x,y,ids,theme){
  let px=x;
  ids.forEach(id=>{
    const p=PLATFORMS.find(v=>v.id===id); if(!p) return;
    c.font=`700 13px Pretendard, sans-serif`;
    const label = p.shortLabel || p.label;
    const w = Math.min(112, Math.max(68, c.measureText(label).width + 55));
    panel(c,px,y,w,40,18,'rgba(255,255,255,.055)','rgba(255,255,255,.09)');
    const iconDrawn = drawAsset(c,p.icon,px+9,y+8,24,24);
    if(!iconDrawn){ c.fillStyle=theme.accent; c.beginPath(); c.arc(px+21,y+20,5,0,Math.PI*2); c.fill(); }
    text(c,label,px+41,y+26,13,'700','#cbd3dc');
    px+=w+8;
  });
  if(!ids.length) text(c,'미설정',x,y+25,13,'600','#5f6a77');
}
function drawVcBadge(c,x,y,enabled){
  panel(c,x,y,200,40,16,'rgba(255,255,255,.045)','rgba(255,255,255,.08)');
  if(enabled){
    const ok = drawAsset(c,DISCORD_ICON,x+12,y+8,24,24);
    if(!ok){ c.fillStyle='#5865F2'; c.beginPath(); c.arc(x+24,y+20,7,0,Math.PI*2); c.fill(); }
    text(c,'Discord 사용',x+45,y+26,14,'700','#cbd3dc');
  } else {
    c.fillStyle='#5d6672'; c.beginPath(); c.arc(x+24,y+20,7,0,Math.PI*2); c.fill();
    text(c,'사용 안 함',x+42,y+26,14,'700','#cbd3dc');
  }
}
function drawAvatarPlaceholder(c,ch,x,y,size,type,theme){
  const col=type==='survivor'?theme.survivor:theme.killer; panel(c,x,y,size,size,14,'rgba(255,255,255,.035)',col+'66');
  text(c,ch.id,x+size/2,y+size/2+7,18,'900',col,'center');
}
function cropCover(c,img,x,y,w,h,r=14){
  c.save();roundedRect(c,x,y,w,h,r);c.clip();
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);const sw=w/scale,sh=h/scale,sx=(img.naturalWidth-sw)/2,sy=Math.max(0,(img.naturalHeight-sh)*.28);c.drawImage(img,sx,sy,sw,sh,x,y,w,h);c.restore();
}
function drawRosterRow(c,label,ids,type,x,y,w,theme){
  text(c,label,x,y,15,'800',type==='survivor'?theme.survivor:theme.killer);
  const chars=ids.map(id=>BY_ID.get(id)).filter(Boolean);const size=74,gap=10;let px=x;const top=y+18;
  if(!chars.length){panel(c,x,top,w,74,15,'rgba(4,7,11,.25)','rgba(255,255,255,.06)');text(c,'선택한 캐릭터 없음',x+18,top+45,15,'600','#687483');return;}
  chars.forEach(ch=>{const img=imageCache.get(ch.id)?.img;if(img&&img.complete&&img.naturalWidth) cropCover(c,img,px,top,size,size,14); else drawAvatarPlaceholder(c,ch,px,top,size,type,theme);px+=size+gap;});
}
function wrapLines(c,value,maxWidth,maxLines,size,weight){
  const raw=value.split('\n');const out=[];c.font=`${weight} ${size}px Pretendard, 'Noto Sans KR', sans-serif`;
  for(const segment of raw){ if(!segment){out.push('');continue;} let line=''; for(const ch of [...segment]){const test=line+ch;if(c.measureText(test).width>maxWidth&&line){out.push(line);line=ch;if(out.length>=maxLines)return out;}else line=test;} if(line)out.push(line); if(out.length>=maxLines)return out; }
  return out.slice(0,maxLines);
}

function drawCard(){
  const t=THEMES[state.theme]||THEMES.mist; const w=canvas.width,h=canvas.height;
  const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,t.bg1);bg.addColorStop(1,t.bg2);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);drawFog(ctx,w,h,t);
  const glow=ctx.createRadialGradient(1320,80,0,1320,80,520);glow.addColorStop(0,t.accent+'35');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(780,0,820,580);
  drawBrand(ctx,t); line(ctx,34,126,1566,126,'rgba(255,255,255,.09)');

  // identity block
  text(ctx,'안개 속 프로필',72,193,20,'800',t.accent); const nameSize=fitText(ctx,state.name || '이름 없음',580,58,34,'850');text(ctx,state.name||'이름 없음',70,250,nameSize,'850','#f5f7f9');
  text(ctx,'ID / FRIEND CODE',72,288,12,'800','#687483');text(ctx,state.friend||'—',72,321,19,'650','#cbd3db');

  drawInfoBox(ctx,'주 접속 시간',state.time,70,370,315,96,t); drawInfoBox(ctx,'플레이 스타일',state.playStyle,400,370,315,96,t);
  text(ctx,'PLATFORM',72,505,12,'800','#687483');drawPlatformPills(ctx,72,519,state.platforms,t);
  text(ctx,'VOICE CHAT',72,590,12,'800','#687483'); drawVcBadge(ctx,72,605,state.vc);

  // grades
  drawGrade(ctx,'생존자 최고 등급',state.survivorGrade,760,168,370,t); drawGrade(ctx,'살인마 최고 등급',state.killerGrade,1150,168,370,t);
  // roster
  panel(ctx,760,292,760,347,22,'rgba(4,7,11,.24)','rgba(255,255,255,.07)');
  drawRosterRow(ctx,'SURVIVOR · 사용 생존자',state.survivors,'survivor',792,333,696,t);
  drawRosterRow(ctx,'KILLER · 사용 살인마',state.killers,'killer',792,460,696,t);
  text(ctx,`${state.survivors.length}/8`,1487,333,12,'700','#65717f','right');text(ctx,`${state.killers.length}/8`,1487,460,12,'700','#65717f','right');

  // quote
  panel(ctx,70,688,1450,145,22,'rgba(4,7,11,.27)','rgba(255,255,255,.07)');text(ctx,'한마디',96,726,13,'800',t.accent);
  const lines=wrapLines(ctx,state.quote||'—',1360,2,29,'750');lines.forEach((lineText,i)=>text(ctx,lineText,96,774+i*37,29,'750','#f2f4f7'));
  text(ctx,'DBD KOREA COMMUNITY CARD',1500,813,10,'800','#4f5b68','right');
  line(ctx,72,858,1520,858,'rgba(255,255,255,.055)'); text(ctx,'팬메이드 · 공식 서비스가 아닙니다',72,882,10,'600','#4f5965'); text(ctx,`${SURVIVORS.length} SURVIVORS  /  ${KILLERS.length} KILLERS`,1520,882,10,'700','#4f5965','right');

  preloadSelectedImages();
  preloadDisplayAssets();
}

function loadPortraitImage(src,cors=false){
  return new Promise(resolve=>{
    const img=new Image();
    if(cors) img.crossOrigin='anonymous';
    img.decoding='async';
    img.onload=()=>resolve(img);
    img.onerror=()=>resolve(null);
    img.src=src;
  });
}
function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=()=>reject(reader.error||new Error('이미지 변환 실패'));
    reader.readAsDataURL(blob);
  });
}
async function loadRemotePortraitSafely(url){
  try{
    const res=await fetch(url,{mode:'cors',credentials:'omit',cache:'force-cache'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const dataUrl=await blobToDataUrl(await res.blob());
    return await loadPortraitImage(dataUrl,false);
  }catch(e){
    return await loadPortraitImage(url,true);
  }
}
function ensurePortrait(ch){
  const cached=imageCache.get(ch.id); if(cached?.status==='ready')return Promise.resolve(cached.img); if(cached?.promise)return cached.promise;
  const promise=(async()=>{
    let img=null;
    const embedded=embeddedPortrait(ch);
    if(embedded) img=await loadPortraitImage(embedded,false);
    // file://에서 로컬 비트맵을 Canvas에 직접 그리면 브라우저에 따라 보안 오염이 발생할 수 있어 건너뜁니다.
    if(!img && location.protocol!=='file:') img=await loadPortraitImage(localPortrait(ch),false);
    if(!img) img=await loadRemotePortraitSafely(proxyImage(ch.image,360));
    if(img){ imageCache.set(ch.id,{status:'ready',img}); drawCardNoPreload(); return img; }
    imageCache.set(ch.id,{status:'error',img:null}); return null;
  })();
  imageCache.set(ch.id,{status:'loading',img:null,promise});
  return promise;
}
function preloadSelectedImages(){ [...state.survivors,...state.killers].map(id=>BY_ID.get(id)).filter(Boolean).forEach(ch=>{const entry=imageCache.get(ch.id);if(!entry||entry.status==='error')ensurePortrait(ch);}); }
function preloadDisplayAssets(){
  const sources = new Set();
  state.platforms.forEach(id=>{ const p = PLATFORMS.find(v=>v.id===id); if(p?.icon) sources.add(p.icon); });
  sources.add(GRADE_ASSETS[state.survivorGrade] || GRADE_ASSETS['미설정']);
  sources.add(GRADE_ASSETS[state.killerGrade] || GRADE_ASSETS['미설정']);
  if(state.vc) sources.add(DISCORD_ICON);
  sources.forEach(src=>{ const entry=assetCache.get(src); if(!entry || entry.status==='error') loadAsset(src); });
}
function drawCardNoPreload(){
  const old=window.__drawingNoPreload; if(old)return; window.__drawingNoPreload=true; try{drawCard();}finally{window.__drawingNoPreload=false;}
}

async function exportPng(){
  const btn=$('downloadBtn');const old=btn.textContent;btn.disabled=true;btn.textContent='이미지 준비 중…';
  try{
    const chars=[...state.survivors,...state.killers].map(id=>BY_ID.get(id)).filter(Boolean);
    const assetSources = [
      ...state.platforms.map(id=>PLATFORMS.find(v=>v.id===id)?.icon).filter(Boolean),
      GRADE_ASSETS[state.survivorGrade] || GRADE_ASSETS['미설정'],
      GRADE_ASSETS[state.killerGrade] || GRADE_ASSETS['미설정'],
      ...(state.vc ? [DISCORD_ICON] : [])
    ];
    await Promise.all(chars.map(ensurePortrait).concat(assetSources.map(loadAsset)));
    drawCard();
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const blob=await new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 생성 실패')),'image/png',1);}catch(e){reject(e);}});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);const safe=(state.name||'profile').replace(/[\\/:*?"<>|]+/g,'_');a.download=`DBD_프로필_${safe}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('PNG 저장을 시작했습니다.');
  } catch(e){
    console.error(e);
    const msg = location.protocol==='file:'
      ? 'PNG 저장에 실패했습니다. “초상화_오프라인_저장.bat”를 한 번 실행한 뒤 페이지를 다시 열어주세요.'
      : 'PNG 저장에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.';
    showToast(msg);
  }
  finally{btn.disabled=false;btn.textContent=old;}
}
async function copyShareLink(){
  const base = location.protocol === 'file:' ? location.href.replace(location.hash,'') : `${location.origin}${location.pathname}${location.search}`;
  const url=`${base}#p=${encodeState()}`;
  try{await navigator.clipboard.writeText(url);showToast('공유 링크를 복사했습니다.');history.replaceState(null,'',`#p=${encodeState()}`);}catch{prompt('아래 링크를 복사해주세요.',url);}
}


function updateNetworkState(){
  const badge = $('networkState');
  if(!badge) return;
  const online = navigator.onLine;
  badge.textContent = online ? '온라인' : '오프라인';
  badge.classList.toggle('offline', !online);
}

async function registerOfflineSupport(){
  updateNetworkState();
  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
  const btn = $('offlineBtn');
  const help = $('offlineHelp');
  if(location.protocol === 'file:'){
    btn.textContent = 'PC 오프라인 준비 안내';
    help.textContent = 'ZIP을 직접 실행할 때는 프로젝트 폴더의 “초상화_오프라인_저장.bat”를 인터넷 연결 상태에서 한 번 실행하세요. 이후 캐릭터 초상화까지 로컬 파일로 사용합니다.';
    return;
  }
  if(!('serviceWorker' in navigator)){
    btn.disabled = true;
    btn.textContent = '오프라인 기능 미지원';
    return;
  }
  try{
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    if(localStorage.getItem(OFFLINE_READY_KEY)) btn.textContent = '오프라인 준비 다시 실행';
  }catch(e){
    console.warn('Service worker registration failed',e);
    btn.disabled = true;
    btn.textContent = '오프라인 기능 준비 실패';
  }
  navigator.serviceWorker.addEventListener('message', e=>{
    const data=e.data||{};
    if(data.type==='CACHE_PROGRESS'){
      btn.disabled=true;
      btn.textContent=`오프라인 저장 ${data.done}/${data.total}`;
    }
    if(data.type==='CACHE_COMPLETE'){
      btn.disabled=false;
      if(data.success===data.total){
        localStorage.setItem(OFFLINE_READY_KEY,new Date().toISOString());
        btn.textContent='오프라인 준비 완료';
        showToast('오프라인용 캐릭터 초상화까지 저장했습니다.');
      } else {
        btn.textContent='오프라인 준비 재시도';
        showToast(`${data.success}/${data.total}개 저장됨. 연결 후 다시 시도해주세요.`);
      }
    }
  });
}

async function prepareOffline(){
  const btn=$('offlineBtn');
  if(location.protocol === 'file:'){
    showToast('폴더의 초상화_오프라인_저장.bat를 먼저 실행해주세요.');
    return;
  }
  if(!navigator.onLine){
    showToast('처음 준비할 때는 인터넷 연결이 필요합니다.');
    return;
  }
  if(!('serviceWorker' in navigator)){
    showToast('이 브라우저에서는 오프라인 저장을 지원하지 않습니다.');
    return;
  }
  try{
    const reg=await navigator.serviceWorker.ready;
    const worker=reg.active || reg.waiting || reg.installing;
    if(!worker) throw new Error('No active service worker');
    const urls=ALL_CHARACTERS.map(ch=>proxyImage(ch.image));
    btn.disabled=true;
    btn.textContent='오프라인 저장 시작…';
    worker.postMessage({type:'CACHE_PORTRAITS',urls});
  }catch(e){
    console.error(e);
    btn.disabled=false;
    btn.textContent='오프라인 사용 준비';
    showToast('오프라인 준비를 시작하지 못했습니다.');
  }
}

buildStaticControls(); loadInitialState(); bindInputs(); updateControls(); renderCharacterGrids(); renderSelected(); preloadDisplayAssets(); registerOfflineSupport();
