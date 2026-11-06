// One isolated build; no deployment, credentials, installation or original .next write.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),source=path.join(root,'gym-next');
const privateDir=path.join(root,'delivery-private'),proofDir=path.join(root,'docs/assets/prototype-candidate-2026-11-06');
fs.mkdirSync(proofDir,{recursive:true});
fs.mkdirSync(privateDir,{recursive:true});
const target=fs.mkdtempSync(path.join(privateDir,'arc33-candidate-'));
for(const dir of ['app','components','lib','public','scripts','tests','netlify'])if(fs.existsSync(path.join(source,dir)))fs.cpSync(path.join(source,dir),path.join(target,dir),{recursive:true,filter:p=>!path.basename(p).startsWith('.env')});
for(const file of ['package.json','package-lock.json','tsconfig.json','next.config.ts','next-env.d.ts','middleware.ts'])if(fs.existsSync(path.join(source,file)))fs.copyFileSync(path.join(source,file),path.join(target,file));
// Keep the existing excluded TypeScript archives in the candidate too.
const archives=[];
function copyArchives(directory){
  if(!fs.existsSync(directory))return;
  for(const item of fs.readdirSync(directory,{withFileTypes:true})){
    const file=path.join(directory,item.name);
    if(item.isDirectory())copyArchives(file);
    else if(item.isFile()&&/\.tsx?$/.test(item.name)){
      const destination=path.join(target,path.relative(source,file));
      fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(file,destination);archives.push(file);
    }
  }
}
copyArchives(path.join(source,'playwright-artifacts'));
fs.symlinkSync(path.join(source,'node_modules'),path.join(target,'node_modules'),'junction');
const guard=path.join(target,'network-guard.cjs');
fs.writeFileSync(guard,`const allowed=new Set(['127.0.0.1','localhost','[::1]','fonts.googleapis.com','fonts.gstatic.com']);
const check=(u,method='GET')=>{if(!allowed.has(u.hostname)||u.username||u.password||!['GET','HEAD'].includes(method.toUpperCase()))throw Error('External service forbidden in isolated validation');};
const fetchOriginal=globalThis.fetch;if(fetchOriginal)globalThis.fetch=(input,...args)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);check(u,args[0]?.method??input.method??'GET');return fetchOriginal(input,...args);};
for(const protocol of ['http','https']){const mod=require('node:'+protocol),original=mod.request;mod.request=(input,...args)=>{const u=typeof input==='string'||input instanceof URL?new URL(input):new URL(protocol+'://'+(input.hostname??input.host)+(input.path??'/'));check(u,input.method??args[0]?.method??'GET');return original.call(mod,input,...args);};mod.get=(input,...args)=>{const request=mod.request(input,...args);request.end();return request;};}
`);
const env={};for(const [k,v] of Object.entries(process.env))if(/^(PATH|SystemRoot|windir|TEMP|TMP|USERPROFILE|LOCALAPPDATA|APPDATA)$/i.test(k))env[k]=v;
Object.assign(env,{NODE_ENV:'production',CI:'true',NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_APP_URL:'http://127.0.0.1:3006',SESSION_SECRET:crypto.randomBytes(32).toString('hex'),PAYMENT_PROVIDER:'local',GETYOURMENTOR_ALLOW_DEMO:'true',GETYOURMENTOR_ACCEPTANCE_MODE:'true',NODE_OPTIONS:'--require '+JSON.stringify(guard)});
fs.writeFileSync(path.join(privateDir,'arc33-candidate-location.txt'),target);
console.log('Building an isolated candidate; original build untouched');
const result=cp.spawnSync(process.execPath,[path.join(source,'node_modules/next/dist/bin/next'),'build'],{cwd:target,env,encoding:'utf8',windowsHide:true,timeout:240000,maxBuffer:8*1024*1024});
fs.writeFileSync(path.join(privateDir,'arc33-build.log'),(result.stdout??'')+(result.stderr??''));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'prototypes/manifest.json'),'utf8'));
const moved=Object.entries(manifest.entries).filter(([,v])=>v.moved);
const proof={exitCode:result.status,isolated:true,originalBuildUntouched:true,serviceCredentialsLoaded:false,archiveSourcesCopied:archives.length,publicGoogleFontsAllowed:true,highLevelHttpGuard:true,buildIdExists:fs.existsSync(path.join(target,'.next/BUILD_ID')),movedPathsAbsentFromPublic:moved.every(([url])=>!fs.existsSync(path.join(target,'public',url.slice(1)))),prototypeDirectoryCopied:fs.existsSync(path.join(target,'prototypes')),candidateIncludesPreexistingDrafts:true};
fs.writeFileSync(path.join(proofDir,'build.json'),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify(proof));
if(result.status!==0){console.log(((result.stdout??'')+(result.stderr??'')).slice(-3500));process.exitCode=1;}
