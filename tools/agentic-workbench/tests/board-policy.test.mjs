import {test} from 'node:test';
import assert from 'node:assert/strict';
import {proposeMove,ticketStatus,targetIdOf} from '../board-policy.mjs';
const base=(id,status='ready',parent='P')=>({id,status,parent,dependencies:[],evidence:[],blocker:null});
test('parent status follows children; reopening prevents completed parent',()=>{
 const tickets=[{...base('P','done',null)}, {...base('a','done'),evidence:['proof']},{...base('b','done'),evidence:['proof']}];
 assert.equal(ticketStatus('P',tickets,{}),'done');assert.notEqual(ticketStatus('P',tickets,{a:{status:'ready'}}),'done');
 assert(proposeMove({ticketId:'P',status:'done',tickets,changes:{}}).error);
});
test('completion needs dependencies and explicitly checked evidence',()=>{
 const tickets=[base('P','ready',null),base('a'),{...base('b'),dependencies:['a']}];
 assert(proposeMove({ticketId:'b',status:'progress',tickets,changes:{}}).error);
 assert(proposeMove({ticketId:'a',status:'done',tickets,changes:{},evidence:'proof',verified:false}).error);
 const result=proposeMove({ticketId:'a',status:'done',tickets,changes:{},evidence:'manual observation',verified:true,now:'2026-11-03T12:00:00Z'});
 assert.equal(result.patch.status,'done');assert.equal(result.patch.manual,true);assert.equal(result.patch.manuallyVerifiedAt,'2026-11-03T12:00:00Z');
 assert.equal(proposeMove({ticketId:'b',status:'progress',tickets,changes:{a:result.patch}}).patch.status,'progress');
});
test('WIP, valid statuses and a blocking reason are enforced',()=>{
 const tickets=[base('P','ready',null),base('a','progress'),base('b','progress'),base('c')];
 assert(proposeMove({ticketId:'c',status:'progress',tickets,changes:{}}).error);
 assert(proposeMove({ticketId:'c',status:'fake',tickets,changes:{}}).error);
 assert(proposeMove({ticketId:'c',status:'blocked',tickets,changes:{}}).error);
 assert.equal(proposeMove({ticketId:'c',status:'blocked',tickets,changes:{},blocker:'Access missing'}).patch.blocker,'Access missing');
});
test('tickets inherit an explicit site target from their parent lot',()=>{
 const tickets=[{...base('HIST','ready',null),targetId:'connect-test-history'},{...base('HIST.1','ready','HIST')},{...base('DEMO','ready',null),targetId:'portfolio-linked-demo'},{...base('DEMO.1','ready','DEMO')},{...base('LOCAL.1','ready','LOCAL')}];
 assert.equal(targetIdOf(tickets[1],tickets),'connect-test-history');
 assert.equal(targetIdOf(tickets[3],tickets),'portfolio-linked-demo');
 assert.equal(targetIdOf(tickets[4],tickets),'gym-main');
});
