import {statuses,isLeaf,effective,ticketStatus,targetIdOf,proposeMove} from './board-policy.mjs';
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const $=id=>document.getElementById(id);let storageKey;const previousDrafts=[];
let data,changes={},selectedId;
function message(text){$('board-message').textContent=text;}
function save(){try{if(!storageKey)throw Error('Storage version unavailable');localStorage.setItem(storageKey,JSON.stringify({base:JSON.stringify(data.tickets),changes}));return true;}catch{message('Statut modifié dans la vue, mais sauvegarde navigateur impossible. Exportez votre état JSON.');return false;}}
function leafStatus(t){return ticketStatus(t.id,data.tickets,changes);}
function move(id,status,extra={}){
 const result=proposeMove({ticketId:id,status,tickets:data.tickets,changes,...extra});
 if(result.error){message(result.error);return result.error;}
 changes[id]={...changes[id],...result.patch};const stored=save();render();if(stored)message(`${id} → ${statuses[status]}. Modification manuelle sauvegardée dans ce navigateur, sans mise à jour de Git ni test automatique.`);return null;
}
function card(ticket){
 const t=effective(ticket,changes),status=leafStatus(ticket);
 const target=data.targets?.find(item=>item.id===targetIdOf(ticket,data.tickets));
 const n=el('button',undefined,'ticket'+(ticket.priority==='P0'?' p0':'')+(status==='blocked'?' blocked':'')+(status==='done'?' completed':'')+(t.manual?' manual':''));
 n.type='button';n.dataset.ticket=t.id;n.dataset.target=targetIdOf(ticket,data.tickets);n.draggable=true;
 n.append(el('span',t.id,'id'),el('span',target?.label??'Dépôt principal','target-badge'),el('h3',t.title),el('span',t.role,'tag'),el('span',`${t.estimateHours[0]}–${t.estimateHours[1]} h · ${t.due.slice(5).split('-').reverse().join('/')}`,'meta'));
 if(t.execution?.kind==='native-agent')n.append(el('span',`Agent natif ${t.execution.agentId} · ${t.execution.phase}`,'meta'));
 if(t.manual)n.append(el('span','Statut manuel','meta'));
 n.addEventListener('click',()=>openTicket(t.id));
 n.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',t.id);event.dataTransfer.effectAllowed='move';});return n;
}
function render(){
 const sprint=$('sprint').value,role=$('role').value,target=$('target').value,search=$('search').value.toLowerCase().trim();
 const leaves=data.tickets.filter(t=>isLeaf(t,data.tickets));
 const visible=leaves.filter(t=>(sprint==='all'||t.sprint===sprint)&&(role==='all'||t.role===role)&&(target==='all'||targetIdOf(t,data.tickets)===target)&&`${t.id} ${t.title} ${data.tickets.find(p=>p.id===t.parent)?.title} ${data.targets?.find(item=>item.id===targetIdOf(t,data.tickets))?.label??''}`.toLowerCase().includes(search));
 $('stats').textContent=`${visible.length} sous-tickets · ${visible.filter(t=>leafStatus(t)==='done').length} terminés · ${leaves.filter(t=>leafStatus(t)==='progress').length}/2 en cours`;
 const board=$('board');board.replaceChildren(el('div','Lots / sous-tickets','corner'));
 for(const [key,label] of Object.entries(statuses)){const head=el('div',label,'column-head');head.append(el('span',`${visible.filter(t=>leafStatus(t)===key).length}${key==='progress'?'/2':''}`));board.append(head);}
 const parents=data.tickets.filter(t=>!isLeaf(t,data.tickets));
 for(const parent of parents){
  const children=visible.filter(t=>t.parent===parent.id);if(!children.length)continue;
  const lane=el('div',undefined,'lane-title');const button=el('button',parent.title);button.type='button';button.addEventListener('click',()=>openTicket(parent.id));
  const laneTarget=data.targets?.find(item=>item.id===targetIdOf(parent,data.tickets));
  lane.append(el('small',`${parent.id} / ${parent.sprint}`),button,el('small',laneTarget?.label??'Dépôt principal','target-lane'),el('small',`${children.length} sous-tickets · ${parent.due}`),el('strong',statuses[ticketStatus(parent.id,data.tickets,changes)]));board.append(lane);
  for(const key of Object.keys(statuses)){
   const cell=el('div',undefined,'cell');cell.dataset.status=key;cell.dataset.parent=parent.id;cell.setAttribute('aria-label',`${parent.title} : ${statuses[key]}`);
   for(const ticket of children.filter(t=>leafStatus(t)===key))cell.append(card(ticket));
   cell.addEventListener('dragover',event=>{event.preventDefault();cell.classList.add('drop-target');});cell.addEventListener('dragleave',()=>cell.classList.remove('drop-target'));
   cell.addEventListener('drop',event=>{event.preventDefault();cell.classList.remove('drop-target');const id=event.dataTransfer.getData('text/plain');const ticket=data.tickets.find(t=>t.id===id);if(ticket?.parent!==parent.id){message('Le ticket conserve son lot : déplacez-le dans la même ligne.');return;}const error=move(id,key);if(error)openTicket(id,key,error);});board.append(cell);
  }
 }
 const agents=$('agents');agents.replaceChildren();for(const roleName of data.roles){const assigned=leaves.filter(t=>t.role===roleName),range=assigned.reduce((r,t)=>[r[0]+t.estimateHours[0],r[1]+t.estimateHours[1]],[0,0]);const n=el('article',undefined,'agent');n.append(el('h2',roleName),el('p',`${assigned.length} sous-tickets · ${assigned.filter(t=>leafStatus(t)==='done').length} terminés · ${assigned.filter(t=>leafStatus(t)==='progress').length} en cours · ${assigned.filter(t=>leafStatus(t)==='blocked').length} bloqués`),el('p',`${range[0]}–${range[1]} h estimées. Temps consommé non mesuré.`));agents.append(n);}
}
function openTicket(id,status,error=''){
 const original=data.tickets.find(t=>t.id===id);if(!original)return;selectedId=id;const t=effective(original,changes),leaf=isLeaf(original,data.tickets);
 $('ticket-id').textContent=`${t.id} · ${t.priority} · ${t.sprint}`;$('ticket-title').textContent=t.title;const details=$('ticket-details');details.replaceChildren();
 const target=data.targets?.find(item=>item.id===targetIdOf(t,data.tickets));
 for(const [label,value] of [['Cible',target?.detail??'Dépôt principal'],['Responsable',t.role+' (rôle planifié)'],['Objectif',t.objective],['Périmètre',t.scope],['Statut',statuses[ticketStatus(id,data.tickets,changes)]],['Charge estimée',t.estimateHours.join('–')+' h'],['Temps mesuré','Non disponible'],['Remise proposée',t.due],['Dépendances',t.dependencies.join(', ')||'Aucune'],['Fichiers',t.files.join(', ')],['Tests attendus',t.tests.join(' ; ')],['Preuves',t.evidence.join(' ; ')||'Aucune'],['Prochaine action',t.next]])details.append(el('p',`${label} : ${value}`));
 if(t.execution?.kind==='native-agent')for(const [label,value] of [['Agent réellement lancé',t.execution.agentId],['Mécanisme','Délégation native de la conversation ; distincte de VS Code'],['Phase',t.execution.phase],['Modèle demandé',t.execution.model],['Worktree',t.execution.worktree]])details.append(el('p',`${label} : ${value}`));
 const list=el('ul');for(const criterion of t.acceptance)list.append(el('li',criterion));details.append(list);
 for(const child of data.tickets.filter(c=>c.parent===id)){const n=el('p',`${child.id} · ${statuses[leafStatus(child)]} · ${child.title}`);details.append(n);}
 $('ticket-edit').hidden=!leaf;$('ticket-status').value=status??t.status;$('ticket-blocker').value=t.blocker??'';$('ticket-evidence').value='';$('ticket-verified').checked=false;$('ticket-feedback').textContent=error;
 if(!$('ticket-dialog').open)$('ticket-dialog').showModal();
}
for(const [key,label] of Object.entries(statuses)){const option=el('option',label);option.value=key;$('ticket-status').append(option);}
$('close-dialog').addEventListener('click',()=>$('ticket-dialog').close());
$('ticket-form').addEventListener('submit',event=>{event.preventDefault();const error=move(selectedId,$('ticket-status').value,{evidence:$('ticket-evidence').value,verified:$('ticket-verified').checked,blocker:$('ticket-blocker').value});$('ticket-feedback').textContent=error??'';if(!error){$('ticket-dialog').close();document.querySelector(`[data-ticket="${selectedId}"]`)?.focus();}});
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{for(const id of ['planning','roles','assistant'])$(id).hidden=id!==button.dataset.view;for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b===button));});
for(const id of ['sprint','role','target','search'])$(id).addEventListener(id==='search'?'input':'change',()=>data&&render());
$('reset').addEventListener('click',()=>{changes={};save();render();message('Vue initiale rétablie. Le dossier source n’a pas été modifié.');});
$('export-previous').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({exportKind:'preserved-previous-browser-drafts',drafts:previousDrafts},null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='GetYourMentor-anciens-deplacements.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('export').addEventListener('click',()=>{if(!data)return;const exported={...data,exportKind:'manual-browser-planning-copy',tickets:data.tickets.map(t=>({...effective(t,changes),status:leafStatus(t)}))};const url=URL.createObjectURL(new Blob([JSON.stringify(exported,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='GetYourMentor-kanban-local.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
try{const response=await fetch('/backlog.json');if(!response.ok)throw Error();data=await response.json();for(const s of data.sprints){const option=el('option',`${s.id} · ${s.start} → ${s.end}`);option.value=s.id;$('sprint').append(option);}for(const role of data.roles){const option=el('option',role);option.value=role;$('role').append(option);}for(const target of data.targets??[]){const option=el('option',target.label);option.value=target.id;$('target').append(option);}
 try{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data.tickets)));storageKey='gym-kanban-local-v3-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key!==storageKey&&(key==='gym-kanban-local-v2'||key?.startsWith('gym-kanban-local-v3-'))){const raw=localStorage.getItem(key);let same=false;try{same=JSON.parse(raw)?.base===JSON.stringify(data.tickets);}catch{}if(!same)previousDrafts.push({key,raw});}}
 if(previousDrafts.length){$('export-previous').hidden=false;message('Le dossier source a chang\u00e9 : vos anciens d\u00e9placements sont conserv\u00e9s et exportables, mais ne sont pas appliqu\u00e9s automatiquement.');}
 let saved=JSON.parse(localStorage.getItem(storageKey));if(!saved){const legacy=JSON.parse(localStorage.getItem('gym-kanban-local-v2'));if(legacy?.base===JSON.stringify(data.tickets))saved=legacy;}if(saved?.base===JSON.stringify(data.tickets)){for(const [id,patch] of Object.entries(saved.changes??{})){if(data.tickets.some(t=>t.id===id&&isLeaf(t,data.tickets))&&patch&&Object.hasOwn(statuses,patch.status)&&(!patch.evidence||Array.isArray(patch.evidence)&&patch.evidence.every(v=>typeof v==='string')))changes[id]=patch;}}else if(saved)message('Le dossier a évolué : vos anciens déplacements ne sont pas appliqués automatiquement.');}catch{message('Sauvegarde locale illisible : affichage du dossier source.');}render();
}catch{message('Chargement du tableau impossible. Aucun statut inventé.');}
$('question-form').addEventListener('submit',async event=>{event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;$('answer-status').textContent='Recherche locale…';$('sources').replaceChildren();$('trace').replaceChildren();try{const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:$('question').value})});if(!response.ok)throw Error();const result=await response.json();$('answer-status').textContent=result.reason;for(const step of result.trace)$('trace').append(el('li',step));for(const source of result.sources){const node=el('article',undefined,'source');node.append(el('strong',source.documentId),el('small',`${source.path} · SHA256 ${source.version}`),el('pre',source.excerpt));$('sources').append(node);}}catch{$('answer-status').textContent='Recherche indisponible. Aucun appel externe effectué.';}finally{button.disabled=false;}});
