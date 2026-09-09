import {authenticate,sameOrigin,OWNER} from './admin-auth.mjs';
import {database,base,unpack} from './firestore-rest.mjs';
import {sendConfirmation,sendOwnerNotification} from './gmail.mjs';
import replyValidation from './reply-draft.cjs';
import {invoicesAPI} from './invoices.mjs';
const reply=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const validId=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const safeDoc=doc=>{const data=unpack(doc);if(!data)return null;const result={id:doc.name.split('/').pop(),version:doc.updateTime};for(const key of ['replyDetails','whatsappDraft','replyLanguage','replyPhone','replySavedAt','language','packageKey','briefJson','reference','name','email','phone','service','message','context','kind','quantity','addWorkshop','totalOMR','status','notes','followUpDate','quoteBaisa','createdAt','updatedAt','emailStatus','emailAttempts','emailSentAt','emailAttemptAt','ownerEmailStatus','ownerEmailAttempts','ownerEmailSentAt'])if(key in data)result[key]=data[key];return result;};
export async function adminAPI(request,env,{auth=authenticate,db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON),notify=sendConfirmation,notifyOwner=sendOwnerNotification}={}){
 const user=await auth(request,env);if(!user)return reply(401,{error:'unauthorized'});
 const url=new URL(request.url),route=url.pathname.replace('/api/admin/','');
 try{
  if(route==='invoices'||route.startsWith('invoices/'))return await invoicesAPI(request,env,db,route);
  if(route==='session'&&request.method==='GET'){
   const gmail=unpack(await db.read('portfolioSettings/gmail'));
   return reply(200,{email:OWNER,gmailConnected:!!gmail?.credential});
  }
  if(route==='requests'&&request.method==='GET'){
   const cursor=url.searchParams.get('cursor');let startAt;
   if(cursor){if(!validId(cursor))return reply(400,{error:'cursor'});const doc=await db.read('portfolioInquiries/'+cursor);if(!doc)return reply(400,{error:'cursor'});startAt={values:[doc.fields.createdAt,{referenceValue:doc.name}],before:false};}
   const rows=await db.api(base+':runQuery',{structuredQuery:{from:[{collectionId:'portfolioInquiries'}],orderBy:[{field:{fieldPath:'createdAt'},direction:'DESCENDING'},{field:{fieldPath:'__name__'},direction:'DESCENDING'}],limit:51,...(startAt?{startAt}:{})}});
   const docs=rows.filter(row=>row.document).map(row=>row.document);
   return reply(200,{requests:docs.slice(0,50).map(safeDoc),cursor:docs.length>50?docs[49].name.split('/').pop():null});
  }
  const match=route.match(/^requests\/([^/]+)(\/(?:email|owner-email|reply))?$/);if(!match||!validId(match[1]))return reply(404,{error:'not_found'});
  const id=match[1],path='portfolioInquiries/'+id,doc=await db.read(path);if(!doc)return reply(404,{error:'not_found'});
  if(request.method==='GET'&&!match[2])return reply(200,{request:safeDoc(doc)});
  if(!sameOrigin(request,env))return reply(403,{error:'origin'});
  if(match[2]==='/reply'){
   if(request.method!=='PATCH')return reply(405,{error:'method'});
   if(Number(request.headers.get('Content-Length'))>32000)return reply(413,{error:'size'});
   const body=await request.text();if(new TextEncoder().encode(body).length>32000)return reply(413,{error:'size'});
   let input,changes;try{input=JSON.parse(body);changes=replyValidation.validateReply(input);}catch{return reply(400,{error:'invalid_reply'});}
   if(input.version!==doc.updateTime)return reply(409,{error:'stale'});
   await db.patch(path,{...changes,replySavedAt:new Date().toISOString()},doc.updateTime);
   return reply(200,{request:safeDoc(await db.read(path))});
  }
  if(request.method==='POST'&&match[2]){await (match[2]==='/owner-email'?notifyOwner:notify)(id,env);return reply(200,{request:safeDoc(await db.read(path))});}
  if(request.method!=='PATCH'||match[2])return reply(405,{error:'method'});
  if(Number(request.headers.get('Content-Length'))>16000)return reply(413,{error:'size'});
  const body=await request.text();if(new TextEncoder().encode(body).length>16000)return reply(413,{error:'size'});
  let input;try{input=JSON.parse(body);}catch{return reply(400,{error:'invalid_input'});}
  if(!input||typeof input!=='object'||!['new','contacting','quoted','in_progress','completed','archived'].includes(input.status)||typeof input.notes!=='string'||input.notes.length>4000)return reply(400,{error:'invalid_input'});
  if(input.version!==doc.updateTime)return reply(409,{error:'stale'});
  const changes={status:input.status,notes:input.notes.trim(),updatedAt:new Date().toISOString()};
  if('followUpDate' in input){
   const value=input.followUpDate;
   if(typeof value!=='string'||value!==''&&(!/^20\d{2}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value))return reply(400,{error:'invalid_follow_up'});
   changes.followUpDate=value;
  }
  if('quoteOMR' in input){
   if(typeof input.quoteOMR!=='string'||input.quoteOMR!==''&&!/^\d{1,7}(?:\.\d{1,3})?$/.test(input.quoteOMR))return reply(400,{error:'invalid_quote'});
   const [whole,fraction='']=input.quoteOMR.split('.');
   changes.quoteBaisa=input.quoteOMR===''?'':Number(whole)*1000+Number(fraction.padEnd(3,'0'));
  }
  await db.patch(path,changes,doc.updateTime);
  return reply(200,{request:safeDoc(await db.read(path))});
 }catch(error){return reply(error.code==='FAILED_PRECONDITION'?409:503,{error:'request_failed'});}
}
