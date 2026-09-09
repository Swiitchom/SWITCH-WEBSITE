import {base,fields,unpack,hash} from './firestore-rest.mjs';
import {mailToken} from './gmail.mjs';
import {sameOrigin,OWNER} from './admin-auth.mjs';
const reply=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const b64=s=>btoa(Array.from(new TextEncoder().encode(s),b=>String.fromCharCode(b)).join(''));
export function invoiceMime(invoice,pdf){
 if(!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(invoice.email)||!/^SW-\d+$/.test(invoice.reference))throw Error('recipient');
 const boundary='switch_'+crypto.randomUUID(),text=`مرحبًا ${invoice.name}،\n\nمرفق فاتورتك ${invoice.reference} لمشروع ${invoice.project}.\nيمكنك الرد على هذا البريد للاستفسار.\n\nسويتش — مبادرة الابتكار والتدريب`;
 const mime=[`From: Switch <${OWNER}>`,`To: ${invoice.email}`,`Reply-To: ${OWNER}`,`Subject: =?UTF-8?B?${b64('فاتورة سويتش — '+invoice.reference)}?=`,'MIME-Version: 1.0',`Content-Type: multipart/mixed; boundary="${boundary}"`,'',`--${boundary}`,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',b64(text),`--${boundary}`,`Content-Type: application/pdf; name="${invoice.reference}.pdf"`,`Content-Disposition: attachment; filename="${invoice.reference}.pdf"`,'Content-Transfer-Encoding: base64','',pdf.match(/.{1,76}/g).join('\r\n'),`--${boundary}--`,''].join('\r\n');return btoa(mime).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
export async function invoiceMail(request,env,db,id,{send=fetch,getToken=s=>mailToken(s,env,send)}={}){
 if(!sameOrigin(request,env))return reply(403,{error:'origin'});if(request.method!=='POST')return reply(405,{error:'method'});
 if(Number(request.headers.get('Content-Length'))>7100000)return reply(413,{error:'size'});const raw=await request.text();if(raw.length>7100000)return reply(413,{error:'size'});let input;try{input=JSON.parse(raw);if(typeof input.pdf!=='string'||input.pdf.length>7000000||! /^[A-Za-z0-9+/]+={0,2}$/.test(input.pdf)||!atob(input.pdf.slice(0,12)).startsWith('%PDF-'))throw Error();}catch{return reply(400,{error:'pdf'});}
 const path='portfolioInvoices/'+id,doc=await db.read(path),data=unpack(doc);if(!doc)return reply(404,{error:'not_found'});if(input.version!==doc.updateTime)return reply(409,{error:'stale'});
 if(!data.email||data.status==='cancelled')return reply(400,{error:'recipient'});
 const key=await hash(data.email+'\n'+input.pdf);if(['sending','unknown'].includes(data.deliveryStatus))return reply(409,{error:'check_gmail'});if(data.deliveryStatus==='sent'&&data.deliveryKey===key)return reply(409,{error:'already_sent'});
 const settings=unpack(await db.read('portfolioSettings/gmail'));if(!settings?.credential)return reply(503,{error:'gmail'});
 const quotaPath='portfolioSettings/mail-'+new Date().toISOString().slice(0,10),quota=await db.read(quotaPath),count=Number(unpack(quota)?.count||0);if(count>=50)return reply(429,{error:'daily_limit'});
 let mime;try{mime=invoiceMime(data,input.pdf);}catch{return reply(400,{error:'recipient'});}
 const lease={deliveryStatus:'sending',deliveryKey:key,deliveryTo:data.email,deliveryAt:new Date().toISOString()};
 await db.api(base+':commit',{writes:[{update:{name:base+'/'+path,fields:fields(lease)},updateMask:{fieldPaths:Object.keys(lease)},currentDocument:{updateTime:doc.updateTime}},{update:{name:base+'/'+quotaPath,fields:fields({count:count+1})},currentDocument:quota?{updateTime:quota.updateTime}:{exists:false}}]});
 let dispatched=false;try{const token=await getToken(settings);dispatched=true;const r=await send('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({raw:mime}),signal:AbortSignal.timeout(15000)});if(!r.ok){if(r.status>=400&&r.status<500)dispatched=false;throw Error('send');}const receipt=await r.json();if(!receipt.id)throw Error('receipt');await db.patch(path,{deliveryStatus:'sent',deliveryAt:new Date().toISOString()});return reply(200,{sent:true});}catch{await db.patch(path,{deliveryStatus:dispatched?'unknown':'failed'}).catch(()=>{});return reply(503,{error:dispatched?'check_gmail':'send_failed'});}
}
