const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const statuses={backlog:'Backlog',prepare:'À préparer',ready:'Prêt',progress:'En cours',review:'En revue',verify:'À vérifier',done:'Terminé',blocked:'Bloqué'};
let data;
function card(ticket){
 const node=element('article',undefined,'ticket'+(ticket.status==='blocked'?' blocked':''));
 node.append(element('span',`${ticket.id} · ${ticket.priority}`,'id'),element('h4',ticket.title),element('span',ticket.role+' · rôle planifié','tag'),element('p',`${ticket.estimateHours[0]}–${ticket.estimateHours[1]} h estimées · mesuré : ${ticket.actualHours===null?'non disponible':ticket.actualHours+' h'}`));
 const details=element('details');details.append(element('summary','Critères, sous-tickets et preuves'));
 for(const [label,value] of [['Objectif',ticket.objective],['Périmètre',ticket.scope],['Parent',ticket.parent??'Aucun'],['Dépendances',ticket.dependencies.join(', ')||'Aucune'],['Échéance proposée',ticket.due],['Fichiers',ticket.files.join(', ')],['Tests attendus',ticket.tests.join(' ; ')],['Preuves',ticket.evidence.join(' ; ')||'Pas encore de preuve'],['Blocage',ticket.blocker??'Aucun'],['Suite',ticket.next]])details.append(element('p',label+' : '+value));
 const list=element('ul');for(const c of ticket.acceptance)list.append(element('li',c));details.append(list);
 const children=data.tickets.filter(t=>t.parent===ticket.id);for(const child of children)details.append(element('p',`${child.id} — ${child.title} · ${statuses[child.status]}`));
 node.append(details);return node;
}
function render(){
 const sprint=document.querySelector('#sprint').value;
 const tickets=data.tickets.filter(t=>sprint==='all'||t.sprint===sprint),leaves=tickets.filter(t=>!data.tickets.some(c=>c.parent===t.id));
 const stats=document.querySelector('#stats');stats.replaceChildren();
 const sum=leaves.reduce((v,t)=>[v[0]+t.estimateHours[0],v[1]+t.estimateHours[1]],[0,0]);
 for(const value of [`${tickets.length} tickets, dont ${leaves.length} feuilles`,`${leaves.filter(t=>t.status==='done').length} feuilles terminées`,`${leaves.filter(t=>t.status==='blocked').length} bloquées`,`${sum[0]}–${sum[1]} h estimées, sans double compte`])stats.append(element('p',value));
 const board=document.querySelector('#board');board.replaceChildren();
 for(const [key,label] of Object.entries(statuses)){const column=element('div',undefined,'column');column.tabIndex=0;column.setAttribute('role','region');column.setAttribute('aria-label',label);const subset=tickets.filter(t=>t.status===key);column.append(element('h3',`${label} · ${subset.length}`));for(const ticket of subset)column.append(card(ticket));board.append(column);}
 const agents=document.querySelector('#agents');agents.replaceChildren();
 for(const role of data.roles){const assigned=leaves.filter(t=>t.role===role);const effort=assigned.reduce((v,t)=>[v[0]+t.estimateHours[0],v[1]+t.estimateHours[1]],[0,0]);const node=element('article',undefined,'agent');node.append(element('span','AFFECTATION SIMULÉE','eyebrow'),element('h3',role),element('p',`${assigned.length} sous-tickets · ${assigned.filter(t=>t.status==='done').length} terminés · ${assigned.filter(t=>t.status==='progress').length} en cours · ${assigned.filter(t=>t.status==='blocked').length} bloqués`),element('p',`${effort[0]}–${effort[1]} h estimées. Temps consommé non mesuré.`));agents.append(node);}
}
try{const response=await fetch('/backlog.json');if(!response.ok)throw Error();data=await response.json();const select=document.querySelector('#sprint');for(const sprint of data.sprints){const option=element('option',sprint.id+' · '+sprint.title);option.value=sprint.id;select.append(option);}document.querySelector('#calendar').textContent=data.sprints.map(s=>`${s.id} : ${s.start} → ${s.end}`).join(' / ');select.addEventListener('change',render);render();}catch{document.querySelector('#calendar').textContent='Le planning est indisponible. Aucun statut de remplacement inventé.';}
document.querySelector('#question-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;const status=document.querySelector('#answer-status');status.textContent='Recherche locale…';document.querySelector('#sources').replaceChildren();document.querySelector('#trace').replaceChildren();
 try{const response=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:document.querySelector('#question').value})});if(!response.ok)throw Error();const result=await response.json();status.textContent=result.reason;for(const step of result.trace)document.querySelector('#trace').append(element('li',step));for(const source of result.sources){const node=element('article',undefined,'source');node.append(element('strong',source.documentId),element('small',`${source.path} · ${source.id} · SHA256 ${source.version}`),element('pre',source.excerpt));document.querySelector('#sources').append(node);}}catch{status.textContent='Recherche indisponible. Aucun appel externe effectué.';}finally{button.disabled=false;}
});
