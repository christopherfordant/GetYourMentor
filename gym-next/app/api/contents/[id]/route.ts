import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth";
import { accessDemoContent, ContentError } from "@/lib/demo-contents";
export const dynamic="force-dynamic";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
 const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
 const session=await currentSession();if(!session)return NextResponse.json({error:"Connexion requise"},{status:401,headers});
 try {const {id}=await params;const download=new URL(request.url).searchParams.get("download")==="1";
   const data=await accessDemoContent(session,id,download);
   return download ? new Response(`DÉMONSTRATION — ${data.title}\n\n${data.body}`,{headers:{...headers,"Content-Type":"text/plain; charset=utf-8","Content-Disposition":`attachment; filename="ressource-demo-${id}.txt"`}}) : NextResponse.json({data},{headers});
 }catch(error){return NextResponse.json({error:error instanceof ContentError?error.message:"Ressource indisponible"},{status:error instanceof ContentError?error.status:503,headers});}
}
