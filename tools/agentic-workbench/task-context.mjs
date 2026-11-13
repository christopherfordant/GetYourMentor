#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {targetIdOf} from './board-policy.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
const backlogPath=path.join(directory,'backlog.json');
const priorityRank={P0:0,P1:1,P2:2,P3:3};
const short=value=>typeof value==='string'&&value.length>240?`${value.slice(0,237)}...`:value??null;

export async function readBacklog(){
 const data=JSON.parse(await readFile(backlogPath,'utf8'));
 if(!Array.isArray(data.tickets)||!Array.isArray(data.targets))throw Error('Invalid canonical backlog shape');
 return data;
}

export function isLeaf(ticket,tickets){return !tickets.some(candidate=>candidate.parent===ticket.id);}

export function ticketContext(id,data,{details=false}={}){
 const ticket=data.tickets.find(item=>item.id===id);
 if(!ticket)return {error:`Ticket introuvable : ${id}`};
 const targetId=targetIdOf(ticket,data.tickets);
 const target=data.targets.find(item=>item.id===targetId);
 const dependencies=ticket.dependencies.map(depId=>{
  const dependency=data.tickets.find(item=>item.id===depId);
  return dependency?{id:dependency.id,title:dependency.title,status:dependency.status,blocker:dependency.blocker??null}: {id:depId,error:'Dépendance absente du backlog'};
 });
 const result={id:ticket.id,title:ticket.title,status:ticket.status,priority:ticket.priority,sprint:ticket.sprint,role:ticket.role,parent:ticket.parent??null,target:target?{id:target.id,label:target.label}: {id:targetId,label:'Cible non documentée'},dependencies,blocker:ticket.blocker??null,next:ticket.next??null};
 if(details)Object.assign(result,{objective:ticket.objective,scope:ticket.scope,acceptance:ticket.acceptance,files:ticket.files,tests:ticket.tests,evidence:ticket.evidence});
 return result;
}

export function readyTickets(data){
 const tickets=data.tickets;
 return tickets.filter(ticket=>isLeaf(ticket,tickets)&&ticket.status==='ready'&&ticket.dependencies.every(id=>tickets.find(dep=>dep.id===id)?.status==='done'))
  .sort((a,b)=>(priorityRank[a.priority]??99)-(priorityRank[b.priority]??99)||a.sprint.localeCompare(b.sprint)||a.id.localeCompare(b.id));
}

export function nextContext(data){
 const ready=readyTickets(data);
 if(ready.length)return {status:'ready',selected:ticketContext(ready[0].id,data,{details:true}),otherReady:ready.slice(1).map(ticket=>({id:ticket.id,title:ticket.title,priority:ticket.priority,sprint:ticket.sprint}))};
 const candidates=data.tickets.filter(ticket=>isLeaf(ticket,data.tickets)&&!['done','blocked'].includes(ticket.status))
  .sort((a,b)=>(priorityRank[a.priority]??99)-(priorityRank[b.priority]??99)||a.sprint.localeCompare(b.sprint)||a.id.localeCompare(b.id))
  .slice(0,5).map(ticket=>({id:ticket.id,title:ticket.title,status:ticket.status,priority:ticket.priority,sprint:ticket.sprint,target:targetIdOf(ticket,data.tickets),blocker:short(ticket.blocker),next:short(ticket.next),unresolvedDependencies:ticket.dependencies.filter(id=>data.tickets.find(dep=>dep.id===id)?.status!=='done').map(id=>{const dep=data.tickets.find(item=>item.id===id);return {id,status:dep?.status??'missing',title:dep?.title??null,blocker:short(dep?.blocker)};})}));
 return {status:'no-ready-ticket',message:'Aucun sous-ticket prêt dans le Kanban versionné. Les candidats ci-dessous ne sont pas déclarés prêts et nécessitent un arbitrage ou la levée de leurs dépendances.',candidates};
}

function usage(){return 'Usage : node tools/agentic-workbench/task-context.mjs --ticket GYM-ID [--details] | --next';}

export async function main(args=process.argv.slice(2)){
 const data=await readBacklog();
 if(args.length===1&&args[0]==='--next')return nextContext(data);
 if((args[0]==='--ticket'||args[0]==='--id')&&args[1]&&args.length<=3){
  const details=args.includes('--details');
  if(args.slice(2).some(arg=>arg!=='--details'))throw Error(usage());
  return ticketContext(args[1],data,{details});
 }
 throw Error(usage());
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=await main();if(result.error){console.error(result.error);process.exitCode=2;}else console.log(JSON.stringify(result,null,2));}
 catch(error){console.error(error.message);process.exitCode=2;}
}
