import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCorpus} from './retrieval.mjs';
import {runAssistant} from './workflow.mjs';

const directory=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(directory,'../..');
const port=Number(process.env.GYM_WORKBENCH_PORT??4325);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid local port');
const origin=`http://127.0.0.1:${port}`;
let busy=false;
const files=new Map([['/','index.html'],['/app.js','app.js'],['/style.css','style.css'],['/backlog.json','backlog.json']]);
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; form-action 'self'"};
const server=http.createServer(async(req,res)=>{
 const send=(code,data,type='application/json; charset=utf-8')=>{res.writeHead(code,{...headers,'Content-Type':type});res.end(type.startsWith('application/json')?JSON.stringify(data):data);};
 if(req.headers.host!==`127.0.0.1:${port}`)return send(403,{error:'Host refused'});
 try{
  if(req.method==='GET'&&files.has(req.url)){
   const file=files.get(req.url);const data=await readFile(path.join(directory,file));
   const type=file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/json';
   res.writeHead(200,{...headers,'Content-Type':type+'; charset=utf-8'});return res.end(data);
  }
  if(req.url!=='/api/assistant'||req.method!=='POST')return send(404,{error:'Not found'});
  if(req.headers.origin!==origin)return send(403,{error:'Origin refused'});
  if(busy)return send(429,{error:'Une recherche à la fois.'});
  busy=true;
  try{
   let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>2048)return send(413,{error:'Body too large'});}
   let input;try{input=JSON.parse(body);}catch{return send(400,{error:'Invalid JSON'});}
   // Loopback owner utility, NOT authentication for an internet-facing application.
   // Body cannot grant roles or provide file paths; no credentials are loaded.
   const result=await runAssistant({question:input?.question,principal:'local-owner',load:signal=>loadCorpus(root,signal)});
   return send(200,result);
  }finally{busy=false;}
 }catch{return send(503,{error:'Atelier indisponible'});}
});
server.requestTimeout=5000;server.headersTimeout=5000;
server.listen(port,'127.0.0.1',()=>console.log(`Atelier local : ${origin} — aucune IA ou API externe active.`));
