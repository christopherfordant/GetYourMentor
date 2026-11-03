export const statuses={backlog:'Backlog',prepare:'À préparer',ready:'Prêt',progress:'En cours',review:'En revue',verify:'À vérifier',done:'Terminé',blocked:'Bloqué'};
export const isLeaf=(ticket,tickets)=>!tickets.some(child=>child.parent===ticket.id);
export const effective=(ticket,changes)=>({...ticket,...changes[ticket.id]});
export function ticketStatus(id,tickets,changes){
 const ticket=tickets.find(t=>t.id===id);if(!ticket)return 'backlog';
 const children=tickets.filter(t=>t.parent===id);if(!children.length)return effective(ticket,changes).status;
 const states=children.map(t=>ticketStatus(t.id,tickets,changes));
 if(states.every(s=>s==='done'))return 'done';if(states.includes('blocked'))return 'blocked';
 if(states.some(s=>s==='progress'||s==='done'))return 'progress';return ticket.status==='done'?'ready':ticket.status;
}
export function proposeMove({ticketId,status,tickets,changes,evidence='',verified=false,blocker='',now=new Date().toISOString()}){
 const ticket=tickets.find(t=>t.id===ticketId);
 if(!ticket||!isLeaf(ticket,tickets)||!Object.hasOwn(statuses,status))return {error:'Déplacez un sous-ticket vers une colonne valide.'};
 if(['progress','review','verify','done'].includes(status)&&ticket.dependencies.some(id=>ticketStatus(id,tickets,changes)!=='done'))return {error:'Une dépendance n’est pas terminée. Consultez la fiche du ticket.'};
 if(status==='progress'&&ticketStatus(ticketId,tickets,changes)!=='progress'&&tickets.filter(t=>isLeaf(t,tickets)&&ticketStatus(t.id,tickets,changes)==='progress').length>=2)return {error:'Limite atteinte : deux sous-tickets en cours au maximum.'};
 const prior=effective(ticket,changes),known=ticket.status==='done'&&ticket.evidence.length>0;
 if(status==='done'&&!known&&!(prior.manuallyVerifiedAt&&prior.evidence?.length)&&!(verified&&evidence.trim()))return {error:'Ajoutez une preuve et confirmez sa vérification manuelle avant de terminer.'};
 if(status==='blocked'&&!blocker.trim()&&!prior.blocker)return {error:'Indiquez la cause du blocage dans la fiche.'};
 const patch={status,manual:true,updatedAt:now,blocker:status==='blocked'?(blocker.trim()||prior.blocker):null};
 if(evidence.trim())patch.evidence=[...new Set([...(prior.evidence??[]),evidence.trim().slice(0,2000)])];
 if(verified&&evidence.trim())patch.manuallyVerifiedAt=now;return {patch};
}
