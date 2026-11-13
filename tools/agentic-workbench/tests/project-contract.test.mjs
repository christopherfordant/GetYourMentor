import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateProjectContract} from '../project-contract.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const contractPath=path.join(root,'tools/agentic-workbench/project-contract.gym.json');
const load=async()=>JSON.parse(await readFile(contractPath,'utf8'));

test('GetYourMentor project contract validates against existing canonical sources',async()=>{
 const result=await validateProjectContract(await load(),{root});
 assert.deepEqual(result,{ok:true,errors:[]});
});

test('contract rejects traversal, absolute and missing references without echoing values',async()=>{
 const base=await load();
 for(const unsafe of ['../outside.txt','C:/private/secret.txt','missing/file.md']){
  const candidate=structuredClone(base);candidate.resumeFile=unsafe;
  const result=await validateProjectContract(candidate,{root});
  assert.equal(result.ok,false);
  assert(!JSON.stringify(result).includes(unsafe));
 }
});

test('contract rejects unknown secret fields, unsafe commands and references outside allowed roots',async()=>{
 const base=await load();
 const withSecret=structuredClone(base);withSecret.apiToken='sk_live_do_not_print';
 const secretResult=await validateProjectContract(withSecret,{root});
 assert.equal(secretResult.ok,false);assert(!JSON.stringify(secretResult).includes('sk_live_do_not_print'));
 const withCommand=structuredClone(base);withCommand.validationCommands[0].args=['-e','process.env.SECRET=1'];
 assert.equal((await validateProjectContract(withCommand,{root})).ok,false);
 const outsideAllowlist=structuredClone(base);outsideAllowlist.permittedReadPaths=['tools/agentic-workbench'];
 assert.equal((await validateProjectContract(outsideAllowlist,{root})).ok,false);
 const plainSecret=structuredClone(base);plainSecret.validationCommands[0].args=['--test','private-secret-value'];
 assert.equal((await validateProjectContract(plainSecret,{root})).ok,false);
 const outsideCommand=structuredClone(base);outsideCommand.validationCommands[0].args=['--test','../private/test.mjs'];
 const outsideCommandResult=await validateProjectContract(outsideCommand,{root});assert.equal(outsideCommandResult.ok,false);assert(!JSON.stringify(outsideCommandResult).includes('../private/test.mjs'));
});
