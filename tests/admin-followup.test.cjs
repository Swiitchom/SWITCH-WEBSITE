const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const id='a56f8460-5c1c-4b4b-aeda-e43e8ed87067',second='a56f8460-5c1c-4b4b-aeda-e43e8ed87068';
test('private follow-up validates dates and exact OMR amounts, preserves legacy updates and rejects stale writes',async()=>{
 const {adminAPI}=await import('../server/admin-api.mjs'),{fields,unpack,base}=await import('../server/firestore-rest.mjs');
 const env={SITE_URL:'https://example.com',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};
 let data={status:'new',notes:'',followUpDate:'2026-09-20',quoteBaisa:42000},version=1,writes=0;
 const db={read:async()=>({name:base+'/portfolioInquiries/'+id,updateTime:String(version),fields:fields(data)}),patch:async(p,changes,v)=>{assert.equal(v,String(version));data={...data,...changes};version++;writes++;}};
 const patch=(extra={},v=String(version))=>adminAPI(new Request(env.SITE_URL+'/api/admin/requests/'+id,{method:'PATCH',headers:{Origin:env.SITE_URL},body:JSON.stringify({status:'quoted',notes:'Owner only',version:v,...extra})}),env,{db,auth:async()=>({email:'owner'})});
 let response=await patch({followUpDate:'2028-02-29',quoteOMR:'125.075'});assert.equal(response.status,200);const saved=(await response.json()).request;assert.equal(saved.quoteBaisa,125075);assert.equal(saved.followUpDate,'2028-02-29');assert.equal(saved.status,'quoted');
 assert.equal((await patch({},'1')).status,409);
 const before=writes;
 for(const followUpDate of ['2026-02-29','2026-04-31','2026-13-01','2026-9-09','1999-01-01',null,123])assert.equal((await patch({followUpDate})).status,400);
 for(const quoteOMR of ['-1','NaN','Infinity','1e3','1.0001','10000000',12,null,'<script>'])assert.equal((await patch({quoteOMR})).status,400);
 assert.equal(writes,before);
 assert.equal((await patch({status:'completed'})).status,200);assert.equal(data.quoteBaisa,125075);assert.equal(data.followUpDate,'2028-02-29');
 assert.equal((await patch({quoteOMR:'0'})).status,200);assert.equal(data.quoteBaisa,0);
 assert.equal((await patch({quoteOMR:'',followUpDate:''})).status,200);assert.equal(data.quoteBaisa,'');assert.equal(data.followUpDate,'');
});
const wait=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,10));}throw Error('UI did not settle');};
async function ui(){
 const html=fs.readFileSync(path.join(__dirname,'../public/admin/index.html'),'utf8').replace(/<script[^>]*src=[^>]*><\/script>/g,'');
 const dom=new JSDOM(html,{url:'https://example.com/admin/',runScripts:'outside-only'}),w=dom.window;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const rows=[{id,version:'v1',status:'new',name:'Customer',service:'Training',notes:'',email:'test@example.invalid',createdAt:'2026-09-08T00:00:00Z',followUpDate:today},{id:second,version:'v1',status:'quoted',name:'<img src=x onerror=alert(1)>',service:'<Platform>',notes:'',createdAt:'2026-09-07T00:00:00Z',followUpDate:'2020-01-01',quoteBaisa:120125},{id:'a56f8460-5c1c-4b4b-aeda-e43e8ed87069',version:'v1',status:'completed',name:'Closed',service:'Training',createdAt:'2026-09-06T00:00:00Z',followUpDate:'2020-01-01'}];
 const patches=[];let delayPatch=null;
 w.matchMedia=()=>({matches:false});w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.fetch=async(url,options={})=>{const route=url.replace('/api/admin/','');let result;
  if(route==='session')result={gmailConnected:false};
  else if(route==='requests')result={requests:rows,cursor:null};
  else {const row=rows.find(r=>r.id===route.split('/')[1]);if(options.method==='PATCH'){
   const body=JSON.parse(options.body);patches.push(body);if(delayPatch)await delayPatch;
   if(body.version!==row.version)return new Response('{}',{status:409});
   Object.assign(row,{status:body.status,notes:body.notes,followUpDate:body.followUpDate,quoteBaisa:body.quoteOMR===''?'':Math.round(Number(body.quoteOMR)*1000),version:row.version+'+'});
  }result={request:row};}
  return Response.json(result);
 };
 w.eval(fs.readFileSync(path.join(__dirname,'../public/admin/admin.js'),'utf8'));await wait(()=>w.document.querySelectorAll('.request-row').length===3);
 const el=q=>w.document.querySelector(q),change=(q,value)=>{const e=el(q);e.value=value;e.dispatchEvent(new w.Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));};
 const select=async value=>{el(`[data-id="${value}"]`).click();await wait(()=>el('#details h2')?.textContent===rows.find(r=>r.id===value).name);};
 return {dom,w,rows,patches,el,change,select,delay:p=>delayPatch=p};
}
test('admin filters combine service, due date and status; dates exclude closed requests and UI escapes text',async()=>{
 const u=await ui();try{
  assert.equal(u.el('#requestList img'),null);assert.equal(u.el('#serviceFilter img'),null);
  u.change('#followUpFilter','due');assert.equal(u.w.document.querySelectorAll('.request-row').length,2);
  u.change('#serviceFilter','Training');assert.equal(u.w.document.querySelectorAll('.request-row').length,1);
  u.change('#filter','quoted');assert.equal(u.w.document.querySelectorAll('.request-row').length,0);
  u.change('#filter','all');u.change('#serviceFilter','all');u.change('#followUpFilter','all');u.change('#sort','followUp');assert.equal(u.el('.request-row').dataset.id,second);
  await u.select(second);u.el('#language').click();assert.equal(u.el('html').dir,'ltr');assert.equal(u.el('[name=quoteOMR]').value,'120.125');
 }finally{u.dom.window.close();}
});
test('drafts retain their original version across refresh and can be discarded explicitly',async()=>{
 const u=await ui();try{
  await u.select(id);u.change('[name=notes]','My unsaved note');u.change('[name=quoteOMR]','55.125');
  u.rows[0].version='v2';u.rows[0].notes='Changed elsewhere';u.el('#refresh').click();await wait(()=>!u.el('#refresh').disabled);
  assert.equal(u.el('[name=notes]').value,'My unsaved note');u.el('#editRequest').dispatchEvent(new u.w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>!u.el('#editRequest fieldset').disabled);
  assert.equal(u.patches[0].version,'v1');assert.equal(u.rows[0].notes,'Changed elsewhere');assert.match(u.el('#notice').textContent,/نسخة أحدث/);
  u.el('#discardDraft').click();assert.equal(u.el('[name=notes]').value,'Changed elsewhere');u.change('[name=quoteOMR]','55.125');u.el('#editRequest').dispatchEvent(new u.w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>u.el('#notice').textContent==='تم حفظ المتابعة.');assert.equal(u.rows[0].quoteBaisa,55125);
 }finally{u.dom.window.close();}
});
test('saving one request cannot replace a different request selected while the save is pending',async()=>{
 const u=await ui();let release;try{
  await u.select(id);u.delay(new Promise(r=>release=r));u.change('[name=notes]','Saved note');u.el('#editRequest').dispatchEvent(new u.w.Event('submit',{bubbles:true,cancelable:true}));await wait(()=>u.patches.length===1);
  await u.select(second);release();await wait(()=>u.el('#notice').textContent==='تم حفظ المتابعة.');assert.equal(u.el('#details h2').textContent,u.rows[1].name);
 }finally{release?.();u.dom.window.close();}
});

