// Test helper: no public service, only provisioned local lab databases.
import {readFileSync} from 'node:fs';
import {openLab} from './sqlite-store.mjs';
import {runMaintenance} from './maintenance.mjs';
const cfg=JSON.parse(readFileSync(process.argv[2],'utf8'));const store=openLab(cfg.database);
try{
 if(cfg.operation==='cas')console.log(JSON.stringify({changed:store.compareAndSwap(cfg.id,cfg.expected,cfg.patch)}));
 else console.log(JSON.stringify(await runMaintenance({store,token:readFileSync(cfg.operatorFile,'utf8'),apiKey:readFileSync(cfg.keyFile,'utf8'),ids:cfg.ids,mode:cfg.mode??'resume'})));
}finally{store.close();}
