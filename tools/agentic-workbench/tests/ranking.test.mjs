import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retrieve,terms} from '../retrieval.mjs';
const chunk=(id,documentId,excerpt,extra={})=>({id,documentId,excerpt,priority:1,visibility:'internal',status:'active',...extra});
test('French accents and regular plurals share lexical terms',()=>{
 assert.deepEqual(terms('réservations paiements'),terms('reservation paiement'));
 assert.equal(terms('peut doit faut quelles').size,0);
});
test('specific evidence outranks boilerplate and duplicate passages',()=>{
 const data=[chunk('a1','a','projet suppression général'),chunk('a2','a','projet suppression général'),chunk('b','b','projet suppression spécifique'),chunk('c','c','projet dossier')];
 const result=retrieve(data,'projet suppression spécifique');
 assert.equal(result[0].documentId,'b');
 assert.equal(result.filter(c=>c.documentId==='a').length,1);
 assert.equal(result[0].excerpt,data[2].excerpt);
});
test('private and archived sources cannot influence frequencies',()=>{
 const data=[chunk('a','a','projet suppression'),chunk('b','b','projet dossier')];
 assert.deepEqual(retrieve([...data,chunk('secret','secret','suppression',{visibility:'private'}),chunk('old','old','dossier',{status:'archived'})],'projet suppression'),retrieve(data,'projet suppression'));
});
