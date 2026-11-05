import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';

export const SESSION_MAX_AGE_SECONDS=60*60*24*7;
export type SessionIdentity={email:string;role:'sportif'|'coach'|'club'|'admin';coachId?:string;accessToken?:string};
function key(secret:string){if(secret.length<32)throw Error('Session secret required');return createHash('sha256').update(secret).digest();}
export function sealSession(session:SessionIdentity,secret:string,now=Date.now()):string{
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(secret),iv);
 const payload={version:1,issuedAt:now,expiresAt:now+SESSION_MAX_AGE_SECONDS*1000,session};
 const encrypted=Buffer.concat([cipher.update(JSON.stringify(payload),'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),encrypted].map(v=>v.toString('base64url')).join('.');
}
export function openSession(value:string,secret:string,now=Date.now()):SessionIdentity|null{
 try{
  if(value.length>16384)return null;const parts=value.split('.');if(parts.length!==3||parts.some(v=>!v))return null;
  const [iv,tag,encrypted]=parts.map(v=>Buffer.from(v,'base64url'));if(iv.length!==12||tag.length!==16)return null;
  const decipher=createDecipheriv('aes-256-gcm',key(secret),iv);decipher.setAuthTag(tag);
  const payload=JSON.parse(Buffer.concat([decipher.update(encrypted),decipher.final()]).toString('utf8'));
  if(payload?.version!==1||!Number.isSafeInteger(payload.issuedAt)||!Number.isSafeInteger(payload.expiresAt)
   ||payload.issuedAt>now||payload.expiresAt<=now||payload.expiresAt<=payload.issuedAt
   ||payload.expiresAt-payload.issuedAt>SESSION_MAX_AGE_SECONDS*1000)return null;
  const s=payload.session;
  if(!s||typeof s.email!=='string'||!['sportif','coach','club','admin'].includes(s.role)
   ||(s.coachId!==undefined&&typeof s.coachId!=='string')||(s.accessToken!==undefined&&typeof s.accessToken!=='string'))return null;
  return {email:s.email,role:s.role,...(s.coachId?{coachId:s.coachId}:{}),...(s.accessToken?{accessToken:s.accessToken}:{})};
 }catch{return null;}
}
