import {readFile} from 'node:fs/promises';
import {openLab} from './sqlite-store.mjs';
import {runMaintenance} from './maintenance.mjs';
// No listener, vault or real-service environment loading. Credentials are never CLI values.
let store;
try{
 const args=process.argv.slice(2),options={};if(args.length%2)throw Error('Arguments');
 for(let i=0;i<args.length;i+=2){if(!['--database','--operator-file','--provider-key-file','--ids','--mode'].includes(args[i])||Object.hasOwn(options,args[i]))throw Error('Arguments');options[args[i]]=args[i+1];}
 if(!options['--database']||!options['--operator-file']||!options['--provider-key-file']||!options['--ids'])throw Error('Arguments');
 const mode=options['--mode']??'diagnose';if(!['diagnose','resume'].includes(mode))throw Error('Mode');
 const credential=async file=>{const data=await readFile(file);if(data.length>512)throw Error('Credential length');return data.toString('utf8').replace(/^\uFEFF/,'').trim();};
 store=openLab(options['--database'],{readOnly:mode==='diagnose'});
 const report=await runMaintenance({store,token:await credential(options['--operator-file']),apiKey:await credential(options['--provider-key-file']),ids:options['--ids'].split(','),mode});
 console.log(JSON.stringify(report));
}catch{console.error('Local maintenance refused; verify provisioned lab, authorization and bounded targets.');process.exitCode=1;}finally{store?.close();}
