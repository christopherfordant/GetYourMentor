import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isLeaf,readyTickets,ticketContext,nextContext,main} from '../task-context.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const fixture={targets:[{id:'gym-main',label:'Dépôt principal'}],tickets:[
 {id:'P',title:'Parent',status:'progress',priority:'P0',sprint:'S1',role:'Architecture',dependencies:[],blocker:null,next:'Check parent',files:[],tests:[],evidence:[],acceptance:[]},
 {id:'A',title:'Ready one',status:'ready',priority:'P1',sprint:'S1',role:'QA',parent:'P',dependencies:[],objective:'Objective',scope:'Local',acceptance:['Pass'],files:['a.mjs'],tests:['node test'],evidence:['report.md']},
 {id:'B',title:'Ready higher',status:'ready',priority:'P0',sprint:'S1',role:'QA',parent:'P',dependencies:['D'],blocker:'Await dependency',next:'Finish D'},
 {id:'D',title:'Dependency',status:'progress',priority:'P0',sprint:'S1',role:'QA',parent:'P',dependencies:[],blocker:null,next:'Validate'}
]};

test('ticket lookup returns compact canonical context and details only on request',()=>{
 const compact=ticketContext('A',fixture);assert.equal(compact.status,'ready');assert.deepEqual(compact.target,{id:'gym-main',label:'Dépôt principal'});assert.equal('acceptance' in compact,false);
 const detailed=ticketContext('A',fixture,{details:true});assert.deepEqual(detailed.acceptance,['Pass']);assert.deepEqual(detailed.files,['a.mjs']);
 assert.match(ticketContext('missing',fixture).error,/introuvable/);
});

test('next selection respects leaf status, priority and completed dependencies',()=>{
 assert.equal(isLeaf(fixture.tickets[0],fixture.tickets),false);assert.deepEqual(readyTickets(fixture).map(t=>t.id),['A']);assert.equal(nextContext(fixture).selected.id,'A');
});

test('no ready item is explicit and candidates retain their blockers',()=>{
 const result=nextContext({...fixture,tickets:fixture.tickets.map(t=>({...t,status:t.id==='A'?'prepare':t.status}))});
 assert.equal(result.status,'no-ready-ticket');assert.equal(result.candidates[0].id,'B');assert.deepEqual(result.candidates[0].unresolvedDependencies.map(dep=>dep.id),['D']);
 assert(Buffer.byteLength(JSON.stringify(result,null,2))<10000,'no-ready response remains bounded');
});

test('CLI accepts only fixed ticket and next queries',async()=>{
 await assert.rejects(main(['--ticket','A','C:\\private.txt']));assert.match((await main(['--ticket','NO-SUCH-ID'])).error,/introuvable/);
 const result=await main(['--next']);assert.equal(result.status,'no-ready-ticket');
});

test('canonical backlog retains previous tickets and tracks the platform plan',async()=>{
 const data=JSON.parse(await readFile(path.join(root,'tools/agentic-workbench/backlog.json'),'utf8'));
 assert.equal(data.tickets.length,96);assert.equal(data.tickets.filter(ticket=>!ticket.id.startsWith('GYM-PLAT')).length,87);
 assert(data.tickets.some(ticket=>ticket.id==='GYM-K1'));assert(data.tickets.some(ticket=>ticket.id==='GYM-K1.1'&&ticket.parent==='GYM-K1'));
 assert(data.tickets.some(ticket=>ticket.id==='GYM-PLAT.1'&&ticket.status==='done'));assert(data.tickets.some(ticket=>ticket.id==='GYM-PLAT.8'&&ticket.status==='backlog'));
 assert.equal(new Set(data.tickets.map(ticket=>ticket.id)).size,data.tickets.length);
});
