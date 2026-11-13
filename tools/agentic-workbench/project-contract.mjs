import {readFile, realpath, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const projectRoot=path.resolve(here,'../..');
const contractPath=path.join(here,'project-contract.gym.json');
const secretLike=/(?:sk_(?:live|test)_|gh[pousr]_|github_pat_|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/i;
const commandMeta=/[;&|<>`=\r\n]/;
const keys={
 root:['contractVersion','project','repositoryRoot','taskSource','instructions','resumeFile','permittedReadPaths','evidencePaths','validationCommands','security'],
 project:['id','name'],
 taskSource:['format','path','canonical'],
 validationCommand:['id','program','args','cwd'],
 security:['secretValues','secretReferences','remoteActions','defaultWriteAccess']
};
const hasOnly=(value,allowed,where,errors)=>{
 if(!value||typeof value!=='object'||Array.isArray(value)){errors.push(`${where}: objet attendu`);return false;}
 for(const key of Object.keys(value))if(!allowed.includes(key))errors.push(`${where}: champ non autorise`);
 return true;
};
const isString=value=>typeof value==='string'&&value.trim().length>0;
const portableRelative=value=>isString(value)&&!value.includes('\\')&&!path.posix.isAbsolute(value)&&!/^([A-Za-z]:|\/|\\)/.test(value)&&!value.split('/').some(part=>part==='..'||part==='.'||part==='');
const inside=(parent,child)=>{const rel=path.relative(parent,child);return rel===''||(!rel.startsWith(`..${path.sep}`)&&rel!=='..'&&!path.isAbsolute(rel));};

async function inspectRelative(value,label,rootReal,errors,{directory=null,allowDot=false}={}){
 if(!(allowDot&&value==='.')&&!portableRelative(value)){errors.push(`${label}: chemin relatif non sur`);return null;}
 const resolved=path.resolve(rootReal,...(value==='.'?[]:value.split('/')));
 if(!inside(rootReal,resolved)){errors.push(`${label}: chemin hors racine`);return null;}
 try{
  const real=await realpath(resolved);
  if(!inside(rootReal,real)){errors.push(`${label}: cible hors racine`);return null;}
  const info=await stat(real);
  if(directory===true&&!info.isDirectory()||directory===false&&!info.isFile())errors.push(`${label}: type de cible inattendu`);
  return real;
 }catch{errors.push(`${label}: cible absente`);return null;}
}

export async function validateProjectContract(contract,{root=projectRoot}={}){
 const errors=[];
 let rootReal;
 try{rootReal=await realpath(root);}catch{return {ok:false,errors:['racine projet absente']};}
 if(!hasOnly(contract,keys.root,'contrat',errors))return {ok:false,errors};
 if(contract.contractVersion!==1)errors.push('version contrat non supportee');
 if(!hasOnly(contract.project,keys.project,'project',errors))return {ok:false,errors};
 if(!/^[a-z][a-z0-9-]{1,49}$/.test(contract.project.id??''))errors.push('identifiant projet invalide');
 if(!isString(contract.project.name))errors.push('nom projet absent');
 if(contract.repositoryRoot!=='.')errors.push('repositoryRoot doit rester relatif a la racine de checkout');
 if(!hasOnly(contract.taskSource,keys.taskSource,'taskSource',errors))return {ok:false,errors};
 if(contract.taskSource.format!=='gym-kanban-v1'||contract.taskSource.canonical!==true)errors.push('source de taches canonique non supportee');
 const rootRefs=[];
 const taskPath=await inspectRelative(contract.taskSource.path,'taskSource.path',rootReal,errors);if(taskPath)rootRefs.push(taskPath);
 for(const field of ['instructions','permittedReadPaths','evidencePaths']){
  const refs=contract[field];
  if(!Array.isArray(refs)||refs.length===0){errors.push(`${field}: liste non vide requise`);continue;}
  for(const [index,ref] of refs.entries()){
   const resolved=await inspectRelative(ref,`${field}[${index}]`,rootReal,errors,{directory:field==='evidencePaths'?true:field==='permittedReadPaths'?undefined:false});
   if(resolved)rootRefs.push(resolved);
  }
 }
 const resume=await inspectRelative(contract.resumeFile,'resumeFile',rootReal,errors);if(resume)rootRefs.push(resume);
 const readPaths=(contract.permittedReadPaths??[]).map(value=>{
  try{return path.resolve(rootReal,...value.split('/'));}catch{return null;}
 });
 for(const ref of rootRefs){if(!readPaths.some(allowed=>allowed&&inside(allowed,ref)))errors.push('reference projet hors des chemins de lecture autorises');}
 if(!Array.isArray(contract.validationCommands)||contract.validationCommands.length===0)errors.push('validationCommands: liste non vide requise');
 for(const [index,command] of (contract.validationCommands??[]).entries()){
  if(!hasOnly(command,keys.validationCommand,`validationCommands[${index}]`,errors))continue;
  if(!/^[a-z][a-z0-9-]{1,39}$/.test(command.id??''))errors.push(`validationCommands[${index}]: id invalide`);
  if(!['node','npm','pnpm','python','pytest'].includes(command.program))errors.push(`validationCommands[${index}]: programme non autorise`);
  if(!Array.isArray(command.args)||command.args.some(arg=>!isString(arg)||commandMeta.test(arg)||secretLike.test(arg)||(!arg.startsWith('-')&&!arg.includes('/'))))errors.push(`validationCommands[${index}]: arguments invalides`);
  for(const [argIndex,arg] of (command.args??[]).entries()){
   if(typeof arg!=='string'||arg.startsWith('-')||(!arg.includes('/')&&!arg.includes('*')))continue;
   const hasGlob=arg.includes('*');
   const staticPath=(hasGlob?arg.slice(0,arg.indexOf('*')):arg).replace(/\/+$/,'')||'.';
   const ref=await inspectRelative(staticPath,`validationCommands[${index}].args[${argIndex}]`,rootReal,errors,{directory:hasGlob||staticPath==='.',allowDot:true});
   if(ref)rootRefs.push(ref);
  }
  if(command.cwd!=='.'&&!(await inspectRelative(command.cwd,`validationCommands[${index}].cwd`,rootReal,errors,{directory:true})))continue;
 }
 if(!hasOnly(contract.security,keys.security,'security',errors))return {ok:false,errors};
 if(contract.security.secretValues!=='forbidden'||contract.security.secretReferences!=='environment-variable-names-only'||contract.security.remoteActions!=='require-task-and-target-authorization'||contract.security.defaultWriteAccess!=='none')errors.push('politique de securite non conforme');
 return {ok:errors.length===0,errors};
}

export async function main(){
 let contract;
 try{contract=JSON.parse(await readFile(contractPath,'utf8'));}catch{return {ok:false,errors:['fichier contrat absent ou JSON invalide']};}
 return validateProjectContract(contract);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await main();
 console.log(JSON.stringify({project:'getyourmentor',...result}));
 if(!result.ok)process.exitCode=1;
}
