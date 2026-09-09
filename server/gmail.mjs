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
export function ownerNotificationMessage(data){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId))throw Error('INVALID_ID');
 const url='https://salimalabri.pages.dev/admin/?request='+data.requestId;
 const source=({services:'الخدمات',workshops:'البرامج التدريبية',store:'كت الأردوينو',contact:'التواصل'})[data.context]||'التواصل';
 const subject=`طلب جديد — ${data.reference}`;
 const text=`وصل طلب جديد من قسم ${source}.\n\nالخدمة: ${data.service}\nمرجع الطلب: ${data.reference}\n\nفتح الطلب ومراجعته:\n${url}\n\nالرابط خاص بك ويتطلب تسجيل الدخول.`;
 const html=`<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f1f3ef;font-family:Tahoma,Arial,sans-serif;color:#19312e"><div style="max-width:560px;margin:32px auto;background:white;border-radius:16px;overflow:hidden"><div style="padding:28px;background:#101819;color:#d4b08a;font-size:21px">سالم العبري · Salim Alabri</div><div style="padding:28px;line-height:1.9"><h1 style="font-size:24px;font-weight:500">لديك طلب جديد</h1><p>وصل طلب من قسم ${escape(source)}.</p><div style="background:#eef4f0;padding:20px;border-radius:10px"><strong>${escape(data.service)}</strong><br><span dir="ltr">${escape(data.reference)}</span></div><p><a href="${url}" style="display:inline-block;background:#416a5d;color:white;text-decoration:none;padding:12px 24px;border-radius:8px">فتح الطلب ومراجعته</a></p><p style="font-size:13px">تفاصيل العميل داخل لوحتك الخاصة. يتطلب الرابط تسجيل الدخول.</p></div></div></body></html>`;
 const boundary='portfolio_'+crypto.randomUUID();
 const mime=[`From: Salim Alabri <${OWNER}>`,`To: ${OWNER}`,`Subject: =?UTF-8?B?${b64(subject)}?=`,`Message-ID: <owner-${data.requestId}@salimalabri.pages.dev>`,'Auto-Submitted: auto-generated','MIME-Version: 1.0',`Content-Type: multipart/alternative; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',b64(text),`--${boundary}`,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',b64(html),`--${boundary}--`,''].join('\r\n');
 return {raw:b64(mime).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'),text,html};
}
export const mailToken=async(settings,env,request)=>{
 const {refreshToken}=await decryptCredential(settings.credential,env);
 const response=await request('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:refreshToken,grant_type:'refresh_token'}),signal:AbortSignal.timeout(8000)});
 const token=await response.json();if(!response.ok||!token.access_token)throw Error('AUTH');return token.access_token;
};
export const sendConfirmation=(id,env,options)=>sendMail(id,env,'email',confirmationMessage,options);
export const sendOwnerNotification=(id,env,options)=>sendMail(id,env,'ownerEmail',ownerNotificationMessage,options);
export async function sendNotifications(id,env,{db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON),request=fetch}={}){
 let pendingToken;
 const options={db,request,getToken:settings=>pendingToken||(pendingToken=mailToken(settings,env,request))};
 // Independent leases keep either recipient's failure from suppressing the other.
 return Promise.allSettled([sendOwnerNotification(id,env,options),sendConfirmation(id,env,options)]);
}
async function sendMail(id,env,prefix,makeMessage,{db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON),request=fetch,getToken=settings=>mailToken(settings,env,request)}={}){
 const path='portfolioInquiries/'+id;
 const keys={status:prefix+'Status',attempts:prefix+'Attempts',attemptAt:prefix+'AttemptAt',sentAt:prefix+'SentAt',messageId:prefix+'MessageId'};
 const settings=unpack(await db.read('portfolioSettings/gmail'));
 if(!settings?.credential||!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET)return;
 let data,leased=false;
 for(let retry=0;retry<5;retry++){
 const doc=await db.read(path);data=unpack(doc);
 if(!data||!['pending','failed'].includes(data[keys.status])||Number(data[keys.attempts]||0)>=3)return;
 // Count attempts atomically across visitors and isolates. Keep personal Gmail usage bounded.
 const quotaPath='portfolioSettings/mail-'+new Date().toISOString().slice(0,10);
 const quota=await db.read(quotaPath),count=Number(unpack(quota)?.count||0);
 if(count>=50)return;
 const attempts=Number(data[keys.attempts]||0)+1;
 const update={[keys.status]:'sending',[keys.attempts]:attempts,[keys.attemptAt]:new Date().toISOString()};
 try{await db.api(base+':commit',{writes:[
  {update:{name:base+'/'+path,fields:fields(update)},updateMask:{fieldPaths:Object.keys(update)},currentDocument:{updateTime:doc.updateTime}},
  {update:{name:base+'/'+quotaPath,fields:fields({count:count+1})},currentDocument:quota?{updateTime:quota.updateTime}:{exists:false}}
 ]});leased=true;break;}catch(error){if(!['ABORTED','FAILED_PRECONDITION','ALREADY_EXISTS'].includes(error.code))return;await new Promise(r=>setTimeout(r,20*(retry+1)));}
 }
 if(!leased)return;
 let dispatched=false;
 try{
  const token=await getToken(settings);
  const {raw}=makeMessage({...data,requestId:id});dispatched=true;
  const response=await request('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({raw}),signal:AbortSignal.timeout(8000)});
  if(!response.ok){if(response.status>=400&&response.status<500)dispatched=false;throw Error('SEND');}
  const receipt=await response.json();if(!receipt.id)throw Error('RECEIPT');
  await db.patch(path,{[keys.status]:'sent',[keys.sentAt]:new Date().toISOString(),[keys.messageId]:receipt.id});
 }catch{
  // A network failure after dispatch is ambiguous: do not automatically send duplicates.
  try{await db.patch(path,{[keys.status]:dispatched?'unknown':'failed'});}catch{}
 }
}
