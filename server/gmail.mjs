import {database,unpack,base,fields} from './firestore-rest.mjs';
import {decryptCredential,OWNER} from './admin-auth.mjs';
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=value=>btoa(String.fromCharCode(...new TextEncoder().encode(value)));
export function confirmationMessage(data){
 if(!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(data.email))throw Error('INVALID_EMAIL');
 const en=data.language==='en';
 const reference=data.reference||'SAL';
 const subject=en?`Request received — ${reference}`:`تم استلام طلبك — ${reference}`;
 const title=en?'Your request is with me.':'وصل طلبك، شكرًا لثقتك.';
 const greeting=en?`Hello ${data.name},`:`مرحبًا ${data.name}،`;
 const message=en?'I received your request and will review the details before contacting you.':'استلمت طلبك، وسأراجع التفاصيل وأتواصل معك عبر بيانات التواصل المرفقة.';
 const text=[greeting,message,`${en?'Service':'الخدمة'}: ${data.service}`,`${en?'Reference':'مرجع الطلب'}: ${reference}`,en?'Status: Under review':'الحالة: قيد المراجعة',en?'You can reply to this email with any additional details.':'يمكنك الرد على هذا البريد لإضافة تفاصيل أخرى.','Salim Alabri | سالم العبري','https://salimalabri.pages.dev'].join('\n\n');
 const html=`<!doctype html><html lang="${en?'en':'ar'}" dir="${en?'ltr':'rtl'}"><body style="margin:0;background:#f1f3ef;font-family:Tahoma,Arial,sans-serif;color:#19312e"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px"><table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;margin:auto;background:white;border-radius:16px;overflow:hidden"><tr><td style="padding:28px;background:#101819;color:#d4b08a;font-size:21px">سالم العبري · Salim Alabri</td></tr><tr><td style="padding:28px;line-height:1.9"><h1 style="font-size:24px;font-weight:500">${title}</h1><p>${escape(greeting)}</p><p>${message}</p><div style="background:#eef4f0;padding:20px;border-radius:10px"><strong>${en?'Service':'الخدمة'}</strong><br>${escape(data.service)}<br><strong>${en?'Reference':'مرجع الطلب'}</strong><br><span dir="ltr">${escape(reference)}</span><br>${en?'Under review':'قيد المراجعة'}</div><p>${en?'You can reply to this email with any additional details.':'يمكنك الرد على هذا البريد لإضافة تفاصيل أخرى.'}</p><a href="https://salimalabri.pages.dev" style="color:#416a5d">${en?'Visit my website':'زيارة الموقع'}</a></td></tr></table></td></tr></table></body></html>`;
 const boundary='portfolio_'+crypto.randomUUID();
 const mime=[`From: Salim Alabri <${OWNER}>`,`To: ${data.email}`,`Reply-To: ${OWNER}`,`Subject: =?UTF-8?B?${b64(subject)}?=`,`Message-ID: <${data.requestId}@salimalabri.pages.dev>`,'Auto-Submitted: auto-generated','MIME-Version: 1.0',`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',b64(text),`--${boundary}`,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',b64(html),`--${boundary}--`,''].join('\r\n');
 return {raw:b64(mime).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'),text,html};
}
export async function sendConfirmation(id,env,{db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON),request=fetch}={}){
 const path='portfolioInquiries/'+id;
 const doc=await db.read(path),data=unpack(doc);
 if(!data||!['pending','failed'].includes(data.emailStatus)||Number(data.emailAttempts||0)>=3)return;
 const settings=unpack(await db.read('portfolioSettings/gmail'));
 if(!settings?.credential||!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET)return;
 // Count attempts atomically across visitors and isolates. Keep personal Gmail usage bounded.
 const quotaPath='portfolioSettings/mail-'+new Date().toISOString().slice(0,10);
 const quota=await db.read(quotaPath),count=Number(unpack(quota)?.count||0);
 if(count>=50)return;
 const attempts=Number(data.emailAttempts||0)+1;
 try{await db.api(base+':commit',{writes:[
  {update:{name:base+'/'+path,fields:fields({emailStatus:'sending',emailAttempts:attempts,emailAttemptAt:new Date().toISOString()})},updateMask:{fieldPaths:['emailStatus','emailAttempts','emailAttemptAt']},currentDocument:{updateTime:doc.updateTime}},
  {update:{name:base+'/'+quotaPath,fields:fields({count:count+1})},currentDocument:quota?{updateTime:quota.updateTime}:{exists:false}}
 ]});}catch{return;}
 let dispatched=false;
 try{
  const {refreshToken}=await decryptCredential(settings.credential,env);
  const tokenResponse=await request('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refreshToken,grant_type:'refresh_token'}),signal:AbortSignal.timeout(8000)});
  const token=await tokenResponse.json();if(!tokenResponse.ok||!token.access_token)throw Error('AUTH');
  const {raw}=confirmationMessage({...data,requestId:id});dispatched=true;
  const response=await request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},body:JSON.stringify({raw}),signal:AbortSignal.timeout(8000)});
  if(!response.ok){if(response.status>=400&&response.status<500)dispatched=false;throw Error('SEND');}
  const receipt=await response.json();if(!receipt.id)throw Error('RECEIPT');
  await db.patch(path,{emailStatus:'sent',emailSentAt:new Date().toISOString(),emailMessageId:receipt.id});
 }catch{
  // A network failure after dispatch is ambiguous: do not automatically send duplicates.
  try{await db.patch(path,{emailStatus:dispatched?'unknown':'failed'});}catch{}
 }
}
