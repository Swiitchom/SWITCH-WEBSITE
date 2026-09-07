import validation from './validate.cjs';
import {createStore,hash} from './firestore-rest.mjs';
const reply=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function handleInquiry(request, env, save, afterSave) {
  if(request.method!=='POST')return reply(405,{error:'method'});
  let origin;
  try {origin=new URL(env.SITE_URL).origin;} catch {return reply(503,{error:'not_configured'});}
  if(request.headers.get('Origin')!==origin)return reply(403,{error:'origin'});
  if(Number(request.headers.get('Content-Length'))>12000)return reply(413,{error:'size'});
  let input;
  try {
    const reader=request.body?.getReader();
    if(!reader)return reply(400,{error:'validation'});
    const chunks=[];let size=0;
    while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>12000){await reader.cancel();return reply(413,{error:'size'});}chunks.push(value);}
    const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
    input=JSON.parse(new TextDecoder().decode(body));
    if(input.website)return reply(400,{error:'invalid'});
    input=validation.validate(input);
  } catch {return reply(400,{error:'validation'});}
  const ip=request.headers.get('CF-Connecting-IP');
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON || !ip)return reply(503,{error:'not_configured'});
  try {
    const receipt=await (save || createStore(env.FIREBASE_SERVICE_ACCOUNT_JSON))(input,await hash(ip));
    if(afterSave){try{afterSave(input.requestId);}catch{}}
    return reply(201,{id:input.requestId,reference:receipt?.reference||'',emailStatus:receipt?.emailStatus||'pending'});
  } catch(error) {
    return reply(error.code==='RATE_LIMIT'?429:error.code==='CONFLICT'?409:503,{error:error.code==='RATE_LIMIT'?'rate_limit':'save_failed'});
  }
}
