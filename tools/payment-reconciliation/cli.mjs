import {readFile,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {reconcileBatch,localFixtureStore} from './engine.mjs';
// This CLI never loads vaults or environment credentials and has no HTTP adapter.
globalThis.fetch=async()=>{throw Error('Network disabled for local reconciliation');};
try{
 const args=process.argv.slice(2),options={};
 if(args.length%2)throw Error('arguments');
 for(let i=0;i<args.length;i+=2){if(!['--input','--output','--mode'].includes(args[i])||Object.hasOwn(options,args[i]))throw Error('arguments');options[args[i]]=args[i+1];}
 if(!options['--input']||!options['--output']||!['diagnose','resume'].includes(options['--mode']??'diagnose'))throw Error('arguments');
 const input=resolve(options['--input']),output=resolve(options['--output']);if(input===output)throw Error('preserve input');
 if((await stat(input)).size>1024*1024)throw Error('bounded file');
 const text=await readFile(input,'utf8');if(Buffer.byteLength(text)>1024*1024)throw Error('bounded file');
 const fixture=JSON.parse(text.replace(/^\uFEFF/,''));if(fixture.fixture!==true||!Array.isArray(fixture.rows)||fixture.rows.length>100)throw Error('fixture required');
 if(new Set(fixture.rows.map(r=>r.id)).size!==fixture.rows.length)throw Error('duplicate rows');
 const store=localFixtureStore(fixture.rows),provider={kind:'local-fixture',readSnapshot:async row=>structuredClone(fixture.snapshots[row.id])};
 const report=await reconcileBatch({ids:fixture.rows.map(r=>r.id),mode:options['--mode']??'diagnose',context:fixture.context,store,provider});
 await writeFile(output,JSON.stringify({fixture:true,report,rows:store.snapshot()},null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify(report));
}catch{console.error('Local reconciliation refused; check fixture, arguments and unused output path. No remote operation performed.');process.exitCode=1;}
