import {base,fields,unpack} from './firestore-rest.mjs';
import {sameOrigin} from './admin-auth.mjs';
import {validDate} from './ledger.mjs';
import {invoiceMail} from './invoice-mail.mjs';
const response=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const uuid=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
export function validateInvoice(input){
 const text=(key,max,required=false)=>{const v=input[key];if(typeof v!=='string'||v.length>max||required&&!v.trim())throw Error(key);return v.trim();};
 const name=text('name',180,true),phone=text('phone',40,true),project=text('project',240,true),notes=text('notes',2000),date=text('date',10,true),requestId=text('requestId',36);
 if(requestId&&!uuid(requestId))throw Error('request');
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('date');
 if(!['draft','issued','paid','cancelled'].includes(input.status))throw Error('status');
 if(!Array.isArray(input.items)||input.items.length<1||input.items.length>60)throw Error('items');
 const items=input.items.map(item=>{if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>240||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10000||!Number.isSafeInteger(item.priceBaisa)||item.priceBaisa<0||item.priceBaisa>100000000)throw Error('item');return {name:item.name.trim(),quantity:item.quantity,priceBaisa:item.priceBaisa};});
 const subtotalBaisa=items.reduce((sum,i)=>sum+i.quantity*i.priceBaisa,0);
 if(!Number.isSafeInteger(subtotalBaisa)||subtotalBaisa>100000000000)throw Error('total');
 if(!Number.isSafeInteger(input.discountBaisa)||input.discountBaisa<0||input.discountBaisa>subtotalBaisa)throw Error('discount');
 const logo=text('logo',110000);if(logo&&!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(logo))throw Error('logo');
 const email=input.email||'',paidDate=input.paidDate||'';
 if(typeof email!=='string'||email.length>254||email&&!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(email))throw Error('email');
 if(input.status==='paid'&&!validDate(paidDate))throw Error('paid_date');
 return {name,phone,email,project,notes,date,requestId,status:input.status,paidDate:input.status==='paid'?paidDate:'',itemsJson:JSON.stringify(items),subtotalBaisa,discountBaisa:input.discountBaisa,totalBaisa:subtotalBaisa-input.discountBaisa,logo};
}
const safe=doc=>{const data=unpack(doc);return {...data,id:doc.name.split('/').pop(),version:doc.updateTime,items:JSON.parse(data.itemsJson)};};
export async function invoicesAPI(request,env,db,route){
 const mail=route.match(/^invoices\/([^/]+)\/email$/);if(mail&&uuid(mail[1]))return invoiceMail(request,env,db,mail[1]);
 const match=route.match(/^invoices(?:\/([^/]+))?$/);if(!match||match[1]&&!uuid(match[1]))return response(404,{error:'not_found'});
 const id=match[1];
 if(request.method==='GET'){
  if(id){const doc=await db.read('portfolioInvoices/'+id);return doc?response(200,{invoice:safe(doc)}):response(404,{error:'not_found'});}
  const params=new URL(request.url).searchParams,month=params.get('month'),cursor=params.get('cursor');let startAt,where;
  if(month&&!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))return response(400,{error:'month'});
  const sortField=month?'date':'createdAt';
  if(month){const next=new Date(month+'-01T00:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);where={compositeFilter:{op:'AND',filters:[{fieldFilter:{field:{fieldPath:'date'},op:'GREATER_THAN_OR_EQUAL',value:{stringValue:month+'-01'}}},{fieldFilter:{field:{fieldPath:'date'},op:'LESS_THAN',value:{stringValue:next.toISOString().slice(0,10)}}}]}};}
  if(cursor){if(!uuid(cursor))return response(400,{error:'cursor'});const doc=await db.read('portfolioInvoices/'+cursor);if(!doc||month&&!unpack(doc).date?.startsWith(month+'-'))return response(400,{error:'cursor'});startAt={values:[doc.fields[sortField],{referenceValue:doc.name}],before:false};}
  const rows=await db.api(base+':runQuery',{structuredQuery:{from:[{collectionId:'portfolioInvoices'}],orderBy:[{field:{fieldPath:sortField},direction:'DESCENDING'},{field:{fieldPath:'__name__'},direction:'DESCENDING'}],limit:31,...(where?{where}:{}),...(startAt?{startAt}:{})}});
  const docs=rows.filter(r=>r.document).map(r=>r.document);
  return response(200,{invoices:docs.slice(0,30).map(d=>{const v=safe(d);delete v.logo;delete v.itemsJson;return v;}),cursor:docs.length>30?docs[29].name.split('/').pop():null});
 }
 if(!sameOrigin(request,env))return response(403,{error:'origin'});
 if(!id||request.method!=='PUT')return response(405,{error:'method'});
 const raw=await request.text();if(new TextEncoder().encode(raw).length>160000)return response(413,{error:'size'});
 let input,data;try{input=JSON.parse(raw);data=validateInvoice(input);}catch{return response(400,{error:'invalid_invoice'});}
 const path='portfolioInvoices/'+id,doc=await db.read(path),now=new Date().toISOString();
 if(doc){if(input.version!==doc.updateTime||unpack(doc).deliveryStatus==='sending')return response(409,{error:'stale'});await db.patch(path,{...data,updatedAt:now},doc.updateTime);}
 else{
  if(input.version)return response(409,{error:'stale'});
  if(data.requestId&&!await db.read('portfolioInquiries/'+data.requestId))return response(400,{error:'request'});
  const counter=await db.read('portfolioSettings/invoiceCounter'),next=(unpack(counter)?.value||0)+1;
  await db.api(base+':commit',{writes:[{update:{name:base+'/'+path,fields:fields({...data,reference:'SW-'+String(next).padStart(5,'0'),createdAt:now,updatedAt:now})},currentDocument:{exists:false}},{update:{name:base+'/portfolioSettings/invoiceCounter',fields:fields({value:next})},currentDocument:counter?{updateTime:counter.updateTime}:{exists:false}}]});
 }
 return response(200,{invoice:safe(await db.read(path))});
}
