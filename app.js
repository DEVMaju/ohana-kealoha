// ===== Edite aqui o texto da história =====
const HIST=[
['Ano 1','A chegada','A família Kealoha nasce de um sonho: um lugar onde todos sejam recebidos com aloha. (texto de exemplo, edite em app.js)'],
['Ano 2','A primeira onda','Chegam os primeiros membros e surgem as tradições da família.'],
['Hoje','Aloha Pulāma','A família cresce de geração em geração, sempre unida pelo mar.']];
const SIGNIF=[['🌊','Onda','Força e movimento'],['🌅','Pôr do sol','Recomeços'],['🐢','Tartaruga','Sabedoria e longevidade'],['🏄','Surfista','Coragem'],['🌺','Hibisco','Acolhimento'],['🗿','Tiki','Guardiões e ancestrais']];
const DEF_IN={titulo:'Família Kealoha',lema:'Aloha Pulāma',frase:'Onde as ondas sempre trazem a família de volta para casa.'};
let SITE=null,ES=null;
const H=()=>SITE?.hist??HIST,SG=()=>SITE?.signif??SIGNIF,IN=()=>{const o={...DEF_IN};for(const[k,v]of Object.entries(SITE?.inicio||{}))if(v)o[k]=v;return o};
// ===== Dados =====
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const REL=['pai','mãe','filho','filha','genro','nora','neto','neta','bisneto','bisneta','avô','avó','bisavô','bisavó','tio','tia','sobrinho','sobrinha','irmão','irmã','cunhado','cunhada','primo','prima','marido','esposa','sogro','sogra'];
const LB={pai:'Pai',mãe:'Mãe',filho:'Filho',filha:'Filha',genro:'Genro',nora:'Nora',neto:'Neto',neta:'Neta',avô:'Avô',avó:'Avó',bisavô:'Bisavô',bisavó:'Bisavó',tio:'Tio',tia:'Tia',sobrinho:'Sobrinho',sobrinha:'Sobrinha',irmão:'Irmão',irmã:'Irmã',cunhado:'Cunhado',cunhada:'Cunhada',primo:'Primo',prima:'Prima',marido:'Marido',esposa:'Esposa',bisneto:'Bisneto',bisneta:'Bisneta',sogro:'Sogro',sogra:'Sogra'};
const INV={pai:'Filho(a)',mãe:'Filho(a)',filho:'Pai/Mãe',filha:'Pai/Mãe',genro:'Sogro(a)',nora:'Sogro(a)',neto:'Avô/Avó',neta:'Avô/Avó',avô:'Neto(a)',avó:'Neto(a)',bisavô:'Bisneto(a)',bisavó:'Bisneto(a)',tio:'Sobrinho(a)',tia:'Sobrinho(a)',sobrinho:'Tio(a)',sobrinha:'Tio(a)',irmão:'Irmão(ã)',irmã:'Irmão(ã)',cunhado:'Cunhado(a)',cunhada:'Cunhado(a)',primo:'Primo(a)',prima:'Primo(a)',marido:'Cônjuge',esposa:'Cônjuge',bisneto:'Bisavô/Bisavó',bisneta:'Bisavô/Bisavó',sogro:'Genro/Nora',sogra:'Genro/Nora'};
const CAT={pai:'P',mãe:'P',filho:'F',filha:'F',genro:'Q',nora:'Q',neto:'G',neta:'G',avô:'A',avó:'A',bisavô:'B',bisavó:'B',tio:'T',tia:'T',sobrinho:'S',sobrinha:'S',irmão:'I',irmã:'I',cunhado:'U',cunhada:'U',primo:'C',prima:'C',marido:'E',esposa:'E',bisneto:'N',bisneta:'N',sogro:'O',sogra:'O'};
const DG={pai:1,mãe:1,filho:-1,filha:-1,genro:-1,nora:-1,neto:-2,neta:-2,avô:2,avó:2,bisavô:3,bisavó:3,tio:1,tia:1,sobrinho:-1,sobrinha:-1,irmão:0,irmã:0,cunhado:0,cunhada:0,primo:0,prima:0,marido:0,esposa:0,bisneto:-3,bisneta:-3,sogro:1,sogra:1};
let M=[],HP=new Set(),LOAD=true,LAST='',KEEP=false,S=null,ED=null,FOC=null;
try{S=JSON.parse(localStorage.getItem('kS'));if(S&&S.exp<Date.now())S=null}catch(e){}
const setS=v=>{S=v;try{v?localStorage.setItem('kS',JSON.stringify(v)):localStorage.removeItem('kS')}catch(e){}};
const by=id=>M.find(m=>m.id===id),nm=id=>by(id)?.nome||'';
const PC=()=>[...new Map(M.flatMap(x=>x.rels.filter(r=>CAT[r.t]==='P'||CAT[r.t]==='F').map(r=>CAT[r.t]==='P'?[r.id,x.id]:[x.id,r.id])).map(p=>[p.join('|'),p])).values()];
const pi=m=>{const p=PC().find(q=>q[1]===m.id);return p?M.findIndex(x=>x.id===p[0]):-1};
const KB={F:'P',N:'B',G:'A',S:'T',Q:'O'},KD=new Set(['F','N','G','S','Q']);
const kk=(id,t,inv)=>{const k=CAT[t],c=KB[k]||k;if(c==='I'||c==='C'||c==='E'||c==='U')return id+c;return id+c+(KD.has(k)!==!!inv?'i':'d')};
function rel(m){const o=[],seen=new Set(),add=(id,t,inv)=>{const key=kk(id,t,inv);if(!by(id)||id===m.id||seen.has(key))return;seen.add(key);o.push({id,l:inv?INV[t]:LB[t]})};
m.rels.forEach(r=>add(r.id,r.t,0));M.forEach(x=>x.rels.forEach(r=>{if(r.id===m.id)add(x.id,r.t,1)}));return o}
const ph=m=>m.foto?`<img src="${m.foto}" alt="">`:'🌺';
const tag=m=>`<span class="tag">${m.tipo==='npc'?'NPC':'Jogável'}</span><span class="tag ${m.st==='mem'?'mm':''}">${m.st==='mem'?'✝ In memoriam':'Vivo'}</span>`;
const isC=()=>S?.r==='c',can=m=>isC()||(S?.r==='m'&&S.id===m.id);
// ----- servidor -----
async function api(a,d={}){let r,j;try{r=await fetch('/api',{method:'POST',headers:{'Content-Type':'application/json',...(S?{Authorization:'Bearer '+S.tok}:{})},body:JSON.stringify({a,...d})});j=await r.json()}catch(e){throw new Error('Não consegui falar com o servidor. Abra o site pela Vercel (ou "vercel dev").')}
if(r.status===401&&S&&a!=='login'){setS(null);who()}if(!r.ok)throw new Error(j.e||'Erro de conexão');return j}
async function refresh(){const j=await api('list');LAST=JSON.stringify(j);M=j.members;HP=new Set(j.hp);SITE=j.site||null;LOAD=false}
async function load(quiet){try{const before=LAST;await refresh();if(!quiet||LAST!==before)render()}catch(e){LOAD=false;if(!quiet){toast(e.message);render()}}}
// ----- acesso (senha) -----
window.eye=b=>{const i=b.previousElementSibling;i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈'};
const PW=(attrs)=>`<span class="pwd"><input type="password" ${attrs}><button type="button" class="eye" onclick="eye(this)" title="Mostrar ou ocultar a senha">👁</button></span>`;
function who(){$('#ac').innerHTML=S?`<span>${isC()?'👑 Criadora':'🌺 '+esc(nm(S.id))}</span><button id="out">Sair</button>`:'<button id="in">🔑 Acesso</button>';
if($('#out'))$('#out').onclick=()=>{setS(null);ED=null;ES=null;render()};if($('#in'))$('#in').onclick=login}
function login(){const d=$('#lg');
d.innerHTML=`<h3>Acesso</h3><label>Entrar como<select id="lw"><option value="c">Criadora</option>${M.filter(m=>HP.has(m.id)).map(m=>`<option value="${m.id}">${esc(m.nome)}</option>`).join('')}</select></label><label>Senha${PW('id="lp" autocomplete="current-password"')}</label><p class="mini" id="le" style="color:#b33"></p><button id="lok">Entrar</button><button onclick="$('#lg').close()">Cancelar</button>`;
const go=async()=>{const p=$('#lp').value;if(!p)return;$('#lok').disabled=true;try{const j=await api('login',{who:$('#lw').value,pass:p});setS(j);d.close();render();toast('Acesso liberado 🌺')}catch(e){$('#le').textContent=e.message}$('#lok').disabled=false};
$('#lok').onclick=go;$('#lp').onkeydown=e=>{if(e.key==='Enter')go()};d.showModal();$('#lp').focus()}
// ----- ficha e card -----
const ficha=(m,full)=>{const g={};rel(m).forEach(r=>(g[r.l]??=[]).push(nm(r.id)));
const L=Object.entries(g).map(([l,a])=>`<p><b>${l}:</b> ${a.map(esc).join(', ')}</p>`).join('')||'<p><i>Sem parentescos cadastrados.</i></p>';
return `<div class="fh"><div class="ph">${ph(m)}</div><div><h3>${esc(m.nome)}</h3><i>${esc(m.apelido||'')}</i><p>Geração ${m.gen} · ${m.idade} anos</p>${tag(m)}</div></div>${L}${full?`<p class="hi">${esc(m.hist)}</p>${can(m)?`<button onclick="edit('${m.id}')">Editar ficha</button>`:''}<button onclick="seeTree('${m.id}')">Ver na árvore</button>${isC()?`<button onclick="rm('${m.id}')">Remover</button>`:''}<button onclick="$('#dlg').close()">Fechar</button>`:''}`};
const card=(m,i,c='')=>`<div class="pol ${c} ${m.st==='mem'?'mem':''}" ${c?`data-id="${m.id}"`:''} style="--r:${(i%5)*1.2-2.4}deg"><div class="ph" ${c?'':`data-open="${m.id}" title="Abrir ficha"`}>${ph(m)}</div><b>${esc(m.nome)}</b><small>Geração ${m.gen} · ${m.idade} anos</small><br>${tag(m)}</div>`;
window.edit=id=>{ED=id;$('#dlg').close();location.hash==='#enviar'?render():location.hash='#enviar'};
window.seeTree=id=>{FOC=id;$('#dlg').close();location.hash==='#arvore'?render():location.hash='#arvore'};
window.rm=async id=>{if(!isC()||!confirm('Remover esta ficha? Isso não pode ser desfeito.'))return;try{await api('remove',{id});await refresh();$('#dlg').close();render()}catch(e){toast(e.message)}};
// ===== Páginas =====
const gens=()=>[...new Set(M.map(m=>m.gen))].sort((a,b)=>a-b);
const spo=m=>[...new Set([...m.rels.filter(r=>CAT[r.t]==='E').map(r=>r.id),...M.filter(x=>x.rels.some(r=>r.id===m.id&&CAT[r.t]==='E')).map(x=>x.id)])];
const ord=l=>{const o=[],put=m=>{if(o.includes(m))return;o.push(m);spo(m).map(by).filter(x=>x&&l.includes(x)).forEach(put)};l.forEach(put);return o};
const PAGES={
inicio:()=>`<section class="hero"><img src="assets/brasao.png" alt="Brasão Kealoha"><h1>${esc(IN().titulo)}</h1><p class="lema">${esc(IN().lema)}</p><img class="ban" src="assets/aloha.png" alt="" style="width:min(300px,70%);display:block;margin:4px auto"><p>${esc(IN().frase)}</p><p><a class="btn" href="#membros">Conhecer a família</a><a class="btn" href="#arvore">Ver a árvore</a><a class="btn" href="#enviar">Enviar ficha</a></p><p class="stats"><span><b>${M.length}</b>membros</span><span><b>${gens().length}</b>gerações</span></p></section>`,
historia:()=>`<h2>Nossa História</h2><div class="tl">${H().map(h=>`<article><span>${esc(h[0])}</span><h3>${esc(h[1])}</h3><p>${esc(h[2])}</p></article>`).join('')}</div><h2>O que diz o brasão</h2><div class="grid mean">${SG().map((s,i)=>`<div class="pol" style="--r:${(i%5)*1.2-2.4}deg"><div class="e">${s[0]}</div><b>${s[1]}</b><small>${s[2]}</small></div>`).join('')}</div>`,
membros:()=>`<h2>Membros</h2><p class="hint">Clique na foto para abrir a ficha completa.</p><div class="bar"><input id="q" placeholder="Buscar por nome"><select id="fg"><option value="">Todas as gerações</option>${gens().map(g=>`<option>${g}</option>`).join('')}</select></div><div class="grid" id="g"></div>`,
arvore:()=>`<h2>Árvore Genealógica</h2><p class="hint">Passe o mouse ou clique em alguém para abrir a mini ficha.</p><div class="tree" id="tree"><svg id="ln"></svg>${gens().map(g=>`<div class="gl">Geração ${g}</div><div class="gen">${ord(M.filter(m=>m.gen===g).sort((a,b)=>pi(a)-pi(b))).map((m,i)=>card(m,i,'node')).join('')}</div>`).join('')}</div>`,
enviar:()=>{const e=ED?by(ED):null;
if(e&&!can(e))return `<h2>Editar Ficha</h2><p class="hint">Para editar esta ficha, entre com 🔑 Acesso usando a senha dela.</p>`;
return `<h2>${e?'Editar Ficha':'Enviar Ficha'}</h2><form id="f"><label>Nome<input name="nome" required></label><label>Apelido ou título<input name="apelido"></label><div class="two"><label>Idade<input name="idade" type="number" min="0" required></label><label>Geração<input name="gen" type="number" min="1" required></label></div><div class="two"><label>Tipo<select name="tipo"><option value="jog">Jogável</option>${isC()?'<option value="npc">NPC</option>':''}</select></label><label>Status<select name="st"><option value="vivo">Vivo</option><option value="mem">In memoriam</option></select></label></div><label>Foto (recorte quadrado)<input type="file" accept="image/*" name="foto"></label><div class="ph prev" id="pv"></div><label>História<textarea name="hist" rows="4"></textarea></label><fieldset><legend>Parentescos (quem é o quê para esta pessoa)</legend><p class="mini">Arraste o ⠿ para mudar a ordem em que aparecem na ficha.</p><div id="rs2"></div><button type="button" id="ar">+ Adicionar parentesco</button></fieldset><label id="pw">${e?'Nova senha (deixe em branco para manter)':'Crie uma senha para editar sua ficha depois'}<span class="pwd"><input name="senha" type="password" minlength="4" autocomplete="new-password"><button type="button" class="eye" onclick="eye(this)" title="Mostrar ou ocultar a senha">👁</button></span></label><button>Salvar ficha 🌊</button>${e?'<button type="button" id="cn">Cancelar</button>':''}</form>`}};
// ----- edição do site (criadora) -----
const adm=p=>isC()?`<p class="hint"><button onclick="editSite('${p}')">✏️ Editar esta página</button></p>`:'';
window.editSite=p=>{ES=p;render()};
const BT='<div class="eb"><button type="button" class="up" title="Subir">↑</button><button type="button" class="dn" title="Descer">↓</button><button type="button" class="x">× Remover</button></div>';
const hRow=h=>{h=h||['','',''];return `<div class="er"><div class="two"><label>Época<input class="e0" maxlength="40" value="${esc(h[0])}"></label><label>Título<input class="e1" maxlength="80" value="${esc(h[1])}"></label></div><label>Texto<textarea class="e2" rows="4" maxlength="3000">${esc(h[2])}</textarea></label>${BT}</div>`};
const sRow=x=>{x=x||['🌺','',''];return `<div class="er"><div class="two"><label>Emoji<input class="e0" maxlength="8" value="${esc(x[0])}"></label><label>Nome<input class="e1" maxlength="40" value="${esc(x[1])}"></label></div><label>Significado<input class="e2" maxlength="200" value="${esc(x[2])}"></label>${BT}</div>`};
const edIn=()=>{const i=IN();return `<h2>Editar Início</h2><form id="se"><label>Título<input name="titulo" maxlength="80" value="${esc(i.titulo)}"></label><label>Lema<input name="lema" maxlength="80" value="${esc(i.lema)}"></label><label>Frase de boas-vindas<textarea name="frase" rows="3" maxlength="300">${esc(i.frase)}</textarea></label><button>Salvar 🌊</button><button type="button" id="sc">Cancelar</button></form>`};
const edHi=()=>`<h2>Editar História</h2><form id="se"><fieldset><legend>Linha do tempo</legend><div id="hl">${H().map(x=>hRow(x)).join('')}</div><button type="button" id="ha">+ Adicionar marco</button></fieldset><fieldset><legend>O que diz o brasão</legend><div id="sl">${SG().map(x=>sRow(x)).join('')}</div><button type="button" id="sa">+ Adicionar símbolo</button></fieldset><button>Salvar 🌊</button><button type="button" id="sc">Cancelar</button></form>`;
{const o=PAGES.inicio,h=PAGES.historia;PAGES.inicio=()=>ES==='inicio'&&isC()?edIn():o()+adm('inicio');PAGES.historia=()=>ES==='historia'&&isC()?edHi():h()+adm('historia')}
const rowHtml=(r={t:'pai',id:''})=>`<div class="rr"><span class="dh" tabindex="0" role="button" title="Arraste para reorganizar (ou use as setas ↑ ↓)" aria-label="Reorganizar parentesco">⠿</span><select class="rt">${REL.map(t=>`<option value="${t}" ${t===r.t?'selected':''}>${LB[t]}</option>`).join('')}</select><select class="rp"><option value="">— pessoa —</option>${M.filter(m=>m.id!==ED).map(m=>`<option value="${m.id}" ${m.id===r.id?'selected':''}>${esc(m.nome)}</option>`).join('')}</select><button type="button" class="x">×</button></div>`;
const HOOK={
membros(){const f=()=>{const q=$('#q').value.toLowerCase(),g=$('#fg').value,l=M.filter(m=>m.nome.toLowerCase().includes(q)&&(!g||m.gen==g)).sort((a,b)=>a.gen-b.gen);$('#g').innerHTML=l.map((m,i)=>card(m,i)).join('')||'<p class="hint">Nenhum membro encontrado. As fichas aparecem aqui assim que forem enviadas.</p>'};$('#q').oninput=$('#fg').onchange=f;f()},
arvore(){if(!M.length){$('#tree').innerHTML='<p class="hint">Ainda não há fichas. Envie a primeira em "Enviar ficha".</p>';return}requestAnimationFrame(lines);if(FOC){const id=FOC;FOC=null;setTimeout(()=>{const m=by(id);if(!m)return;const ids=new Set(rel(m).map(r=>r.id));$$('.node').forEach(n=>{n.classList.toggle('hl',n.dataset.id===id);n.classList.toggle('rl',ids.has(n.dataset.id))});$('.hint').textContent='Em destaque: '+m.nome+' (borda cheia) e seus parentes (borda tracejada).';$(`.node[data-id="${id}"]`)?.scrollIntoView({block:'center',behavior:'smooth'})},900)}},
enviar(){const e=ED?by(ED):null,f=$('#f');if(!f)return;let foto=e?.foto||'';const v=e||{};
f.nome.value=v.nome||'';f.apelido.value=v.apelido||'';f.idade.value=v.idade??'';f.gen.value=v.gen||1;f.tipo.value=v.tipo||'jog';f.st.value=v.st||'vivo';f.hist.value=v.hist||'';
const pv=$('#pv'),showPv=()=>pv.innerHTML=foto?`<img src="${foto}">`:'🌺';showPv();
const rs=$('#rs2');(v.rels||[]).forEach(r=>rs.insertAdjacentHTML('beforeend',rowHtml(r)));
$('#ar').onclick=()=>rs.insertAdjacentHTML('beforeend',rowHtml());
rs.onclick=ev=>{if(ev.target.classList.contains('x'))ev.target.parentNode.remove()};
rs.addEventListener('pointerdown',ev=>{const h=ev.target.closest('.dh');if(!h)return;ev.preventDefault();const row=h.parentNode;row.classList.add('dg');try{h.setPointerCapture(ev.pointerId)}catch(e){}
const mv=e=>{let before=null;for(const r of rs.children){if(r===row)continue;const b=r.getBoundingClientRect();if(e.clientY<b.top+b.height/2){before=r;break}}if(before!==row.nextElementSibling)rs.insertBefore(row,before)};
const up=()=>{row.classList.remove('dg');h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up)};
h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up)});
rs.addEventListener('keydown',ev=>{const h=ev.target.closest('.dh');if(!h||(ev.key!=='ArrowUp'&&ev.key!=='ArrowDown'))return;ev.preventDefault();const row=h.parentNode;if(ev.key==='ArrowUp'&&row.previousElementSibling)rs.insertBefore(row,row.previousElementSibling);if(ev.key==='ArrowDown'&&row.nextElementSibling)rs.insertBefore(row.nextElementSibling,row);h.focus()});
rs.onchange=ev=>{if(!ev.target.classList.contains('rp'))return;const p=by(ev.target.value);if(p&&!e)f.gen.value=Math.max(1,p.gen+DG[ev.target.parentNode.querySelector('.rt').value])};
const pw=()=>{$('#pw').style.display=f.tipo.value==='npc'?'none':'grid';f.senha.required=!e&&f.tipo.value==='jog'};f.tipo.onchange=pw;pw();
f.foto.onchange=ev=>{const file=ev.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=240;c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,240,240);foto=c.toDataURL('image/jpeg',.8);showPv()};im.src=r.result};r.readAsDataURL(file)};
if($('#cn'))$('#cn').onclick=()=>{ED=null;render()};
f.onsubmit=async ev=>{ev.preventDefault();const d=new FormData(f),rels=$$('#rs2 .rr').map(r=>({t:r.querySelector('.rt').value,id:r.querySelector('.rp').value})).filter(r=>r.id);
const o={nome:d.get('nome').trim(),apelido:d.get('apelido').trim(),idade:+d.get('idade'),gen:+d.get('gen'),tipo:d.get('tipo'),st:d.get('st'),hist:d.get('hist'),rels,foto},p=d.get('senha'),btn=f.querySelector('button:not([type])');btn.disabled=true;
const nn=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
if((!e||nn(e.nome)!==nn(o.nome))&&M.some(m=>m.id!==e?.id&&nn(m.nome)===nn(o.nome))){toast('Já existe uma ficha com esse nome. Use outro nome ou acrescente um sobrenome/apelido.');btn.disabled=false;return}
try{let id;if(e){await api('update',{id:e.id,member:o,pass:p});id=e.id}else{const j=await api('create',{member:o,pass:p});id=j.id;if(j.tok&&!S)setS(j)}
await refresh();ED=null;FOC=id;toast(e?'Ficha atualizada! 🌺':'Ficha enviada! Bem-vindo(a) à família 🌺');location.hash==='#arvore'?render():location.hash='#arvore'}
catch(err){toast(err.message);btn.disabled=false}}}};
HOOK.inicio=HOOK.historia=()=>{const f=$('#se');if(!f)return;
$('#sc').onclick=()=>{ES=null;render()};
const mv=ev=>{const b=ev.target,r=b.closest('.er');if(!r)return;if(b.classList.contains('x'))r.remove();else if(b.classList.contains('up')&&r.previousElementSibling)r.previousElementSibling.before(r);else if(b.classList.contains('dn')&&r.nextElementSibling)r.nextElementSibling.after(r)};
const hist=!!$('#hl');
if(hist){$('#hl').onclick=$('#sl').onclick=mv;
$('#ha').onclick=()=>{$('#hl').insertAdjacentHTML('beforeend',hRow());$('#hl').lastElementChild.querySelector('input').focus()};
$('#sa').onclick=()=>{$('#sl').insertAdjacentHTML('beforeend',sRow());$('#sl').lastElementChild.querySelector('.e1').focus()}}
f.onsubmit=async ev=>{ev.preventDefault();const btn=f.querySelector('button:not([type])'),rows=id=>$$('#'+id+' .er').map(r=>[r.querySelector('.e0').value,r.querySelector('.e1').value,r.querySelector('.e2').value]);
const site={hist:H(),signif:SG(),inicio:IN()};
if(hist){site.hist=rows('hl');site.signif=rows('sl')}else site.inicio={titulo:f.titulo.value,lema:f.lema.value,frase:f.frase.value};
btn.disabled=true;try{await api('site',{site});await refresh();ES=null;toast('Página atualizada! 🌺');render()}catch(err){toast(err.message);btn.disabled=false}}};
function lines(){const t=$('#tree');if(!t||!$('#ln'))return;const s=$('#ln'),b=t.getBoundingClientRect();s.setAttribute('width',t.scrollWidth);s.setAttribute('height',t.scrollHeight);
const P=id=>{const n=t.querySelector(`[data-id="${id}"]`);if(!n)return;const r=n.getBoundingClientRect();return{x:r.left-b.left+t.scrollLeft+r.width/2,l:r.left-b.left+t.scrollLeft,r:r.right-b.left+t.scrollLeft,t:r.top-b.top,b:r.bottom-b.top}};
s.innerHTML=PC().map(([p,c])=>{const a=P(p),d=P(c);if(!a||!d)return'';const y=(a.b+d.t)/2;return`<path d="M${a.x} ${a.b}C${a.x} ${y} ${d.x} ${y} ${d.x} ${d.t}"/>`}).join('')+
[...new Set(M.flatMap(x=>x.rels.filter(r=>CAT[r.t]==='E').map(r=>[x.id,r.id].sort().join('|'))))].map(k=>{const[i,j]=k.split('|'),a=P(i),d=P(j);if(!a||!d||Math.abs(a.t-d.t)>5)return'';const L=a.x<d.x?a:d,R2=a.x<d.x?d:a,y=L.t+65,mx=(L.r+R2.l)/2;return`<path class="sp2" d="M${L.r} ${y}L${R2.l} ${y}"/><text x="${mx}" y="${y-6}" text-anchor="middle" font-size="14" fill="#e8654a">♥</text>`}).join('')}
addEventListener('resize',lines);
// ===== Navegação com onda =====
function render(){const p=PAGES[(location.hash||'#inicio').slice(1)]?(location.hash||'#inicio').slice(1):'inicio',a=$('#app');if(ES&&ES!==p)ES=null;a.innerHTML=LOAD?'<p class="hint">🌊 Carregando a família…</p>':PAGES[p]();a.style.animation='none';void a.offsetWidth;a.style.animation='';if(!LOAD)HOOK[p]?.();$$('nav a').forEach(x=>x.classList.toggle('on',x.hash==='#'+p));if(!KEEP)scrollTo(0,0);hide();who()}
let busy=false;
async function nav(){if(busy)return;busy=true;const w=$('#wave');w.style.display='flex';swoosh();
await w.animate([{transform:'translateX(100vw)'},{transform:'translateX(-180px)'}],{duration:800,easing:'ease-in',fill:'forwards'}).finished;
render();
await w.animate([{transform:'translateX(-180px)'},{transform:'translateX(calc(-100vw - 360px))'}],{duration:800,easing:'ease-out',fill:'forwards'}).finished;
w.style.display='none';busy=false;if(rendered()!==(location.hash||'#inicio'))nav()}
const rendered=()=>$('nav a.on')?.hash;
addEventListener('hashchange',nav);
// ===== Mini ficha =====
const pop=$('#pop');let pin=null;
function show(n){const m=by(n.dataset.id);pop.innerHTML=ficha(m)+`<button data-open="${m.id}">Ficha completa</button>`;pop.style.display='block';const r=n.getBoundingClientRect(),w=pop.offsetWidth;pop.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';pop.style.top=Math.max(8,Math.min(innerHeight-pop.offsetHeight-8,r.bottom+8))+'px'}
function hide(){pop.style.display='none';pin=null}
document.addEventListener('mouseover',e=>{const n=e.target.closest('.node');if(n&&!pin)show(n)});
document.addEventListener('mouseout',e=>{if(e.target.closest('.node')&&!pin&&!e.relatedTarget?.closest?.('#pop'))hide()});
document.addEventListener('click',e=>{const n=e.target.closest('.node'),o=e.target.closest('[data-open]');if(n){pin=n;show(n)}else if(!e.target.closest('#pop'))hide();if(o){$('#dlg').innerHTML=ficha(by(o.dataset.open),1);$('#dlg').showModal()}});
addEventListener('scroll',hide,{passive:true});
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2800)}
// ===== Cursor prancha =====
const B=$('#board'),T=$('#tip');let px=0,ang=0;
addEventListener('pointermove',e=>{const dx=e.clientX-px;px=e.clientX;ang+=(Math.max(-45,Math.min(45,dx*3))-ang)*.25;B.style.opacity=1;B.style.transform=`translate(${e.clientX+24}px,${e.clientY+4}px) rotate(${ang+15}deg)`;T.style.opacity=1;T.style.transform=`translate(${e.clientX}px,${e.clientY}px)`});
addEventListener('pointerdown',e=>{const s=document.createElement('i');s.className='sp';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';document.body.append(s);setTimeout(()=>s.remove(),600)});
render();
// ===== Fundo havaiano =====
(()=>{const W=(y,a,c,d)=>`<path class="wv" style="animation-duration:${d}s" d="M0 ${y}q100 ${-a} 200 0${'t200 0'.repeat(15)}V900H0Z" fill="${c}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`;
const palm=(x,s,f)=>`<g transform="translate(${x} 900) scale(${f*s} ${s})"><g class="sw"><path d="M0 0Q-30 -150 15 -310" stroke="#4a3320" stroke-width="18" fill="none" stroke-linecap="round"/>${[-165,-125,-85,-45,-5,35].map(a=>`<path transform="translate(15 -310) rotate(${a})" d="M0 0Q70 -70 170 0Q80 -28 0 0Z" fill="#1d4d2b"/>`).join('')}<circle cx="12" cy="-300" r="9" fill="#4a3320"/></g></g>`;
const surfer=`<ellipse rx="48" ry="5" fill="#f4e6c3" stroke="#1b1b1b" stroke-width="2" transform="rotate(-5)"/><g stroke="#1b1b1b" stroke-width="5" stroke-linecap="round" fill="none"><path d="M-14 -4L-6 -26M12 -4L0 -26M-3 -26L-6 -52M-6 -48L-28 -40M-6 -48L16 -44"/><circle cx="-7" cy="-60" r="7" fill="#1b1b1b"/></g>`;
$('#sea').innerHTML=`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb8cc"/><stop offset=".5" stop-color="#ffd98a"/><stop offset=".65" stop-color="#ff9f6b"/></linearGradient><radialGradient id="sn"><stop offset="0" stop-color="#fff6c8"/><stop offset=".55" stop-color="#ffd35c"/><stop offset="1" stop-color="#ffd35c00"/></radialGradient></defs><rect width="1600" height="900" fill="url(#sk)"/><circle cx="800" cy="520" r="260" fill="url(#sn)"/><path d="M1050 610Q1180 470 1300 520Q1400 480 1520 610Z" fill="#2c6b57" opacity=".8"/>${W(580,12,'#58bfc6',34)}${W(630,20,'#2aa0ab',24)}<g class="ride"><g class="bob">${surfer}</g></g>${W(700,28,'#0f6577',16)}${W(800,34,'#0f4c5c',11)}${palm(90,1,1)}${palm(1510,1.1,-1)}${palm(290,.55,1)}${palm(1330,.6,-1)}`})();
// ===== Música =====
const au=$('#au'),pp=$('#pp'),mu=$('#mu'),vo=$('#vol');
try{au.volume=+(localStorage.getItem('kv')??.4)}catch(e){au.volume=.4}vo.value=au.volume;
const upd=()=>{pp.textContent=au.paused?'▶':'⏸';mu.textContent=au.muted||!au.volume?'🔇':au.volume<.5?'🔉':'🔊'};
pp.onclick=()=>au.paused?au.play():au.pause();
mu.onclick=()=>{au.muted=!au.muted;upd()};
vo.oninput=()=>{au.volume=vo.value;au.muted=false;try{localStorage.setItem('kv',vo.value)}catch(e){}upd()};
au.onplay=au.onpause=upd;upd();
$('#enter').onclick=async()=>{try{ensureAc().resume()}catch(e){}try{await au.play()}catch(e){toast('Não consegui tocar a música. Use o botão ▶.')}$('#gate').classList.add('out');setTimeout(()=>$('#gate').remove(),900)};

// ===== Som de onda na transição (gerado no navegador) =====
let ac;const ensureAc=()=>ac||(ac=new(window.AudioContext||window.webkitAudioContext)());
function swoosh(){if(au.muted||!au.volume)return;try{const c=ensureAc();if(c.state==='suspended')c.resume();
const d=1.7,t=c.currentTime,v=Math.min(1,au.volume*1.2)*.9,buf=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=buf.getChannelData(0);
for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
const layer=(type,f0,f1,peak)=>{const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buf;f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+.8);f.frequency.exponentialRampToValueAtTime(f0,t+d);
g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(Math.max(.002,v*peak),t+.75);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f).connect(g).connect(c.destination);s.start(t)};
layer('lowpass',300,2200,1);layer('highpass',3500,6000,.18)}catch(e){}}

$('nav a[href="#enviar"]').onclick=()=>{ED=null;if(location.hash==='#enviar')render()};

// Cursor visível dentro de janelas (dialog fica acima de tudo)
{const sm=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){sm.call(this);this.append(B,T)};
document.addEventListener('close',e=>{if(e.target.tagName==='DIALOG')document.body.append(B,T)},true)}

// ===== Carregar fichas do servidor e atualizar sozinho =====
load();
setInterval(()=>{if(document.hidden||LOAD||$('dialog[open]')||location.hash==='#enviar'||ES)return;KEEP=true;load(true).finally(()=>KEEP=false)},20000);
