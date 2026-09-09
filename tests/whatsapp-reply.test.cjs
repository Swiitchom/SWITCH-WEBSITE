const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {normalizePhone}=require('../server/reply-draft.cjs'),wa=require('../public/admin/whatsapp.js');const {JSDOM}=require('jsdom');
test('recipient normalization is consistent and WhatsApp text remains a single encoded parameter',()=>{
 for(const [input,expected] of [['٩٩٩٩٩٩٩٩','96899999999'],['00968 9999 9999','96899999999'],['+96899999999','96899999999'],['96899999999','96899999999'],['+44 7700 900123','447700900123'],['+96800000000',''],['+96899999',''],['447700900123',''],['javascript:alert(1)',''],['99999999&text=bad',''],['+00123456789','']]){assert.equal(normalizePhone(input),expected,input);assert.equal(wa.phone(input),expected,input);}
 const text='مرحبًا\nتفاصيل العرض & السعر؟ #خدمة +968',url=new URL(wa.url('99999999',text));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/96899999999');assert.deepEqual([...url.searchParams.keys()],['text']);assert.equal(url.searchParams.get('text'),text);
});
test('each package has a distinct reply and private notes, internal dates and price stay out by default',()=>{
 const row={name:'Client',service:'Service',reference:'SAL-1',notes:'SECRET NOTE',followUpDate:'2099-12-31',quoteBaisa:123075};
 const messages=['training','web','innovation'].map(packageKey=>wa.message({...row,packageKey},'Customer-facing details','ar'));
 assert.equal(new Set(messages).size,3);for(const message of messages){assert.ok(message.includes('Customer-facing details'));assert.ok(!message.includes('SECRET NOTE'));assert.ok(!message.includes('2099'));assert.ok(!message.includes('123.075'));}
 assert.match(wa.message({...row,packageKey:'web'},'Approved scope','en',true),/123\.075 OMR/);
 assert.ok(!wa.message({...row,kind:'store',service:'Arduino Kit'},'','en').includes('technical project'));
});
test('reply draft saving requires owner auth, trusted origin, validation and current version without sending notifications',async()=>{
 const {adminAPI}=await import('../server/admin-api.mjs'),{fields,base}=await import('../server/firestore-rest.mjs');
 const id='a56f8460-5c1c-4b4b-aeda-e43e8ed87067',env={SITE_URL:'https://example.com',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};let data={status:'new',notes:'private'},version=1,writes=0,notifications=0,reads=0;
 const db={read:async()=>{reads++;return {name:base+'/portfolioInquiries/'+id,updateTime:String(version),fields:fields(data)};},patch:async(p,changes,v)=>{assert.equal(v,String(version));data={...data,...changes};version++;writes++;}};
 const input={replyDetails:'Approved scope',whatsappDraft:'Hello, here is the proposal.',replyLanguage:'en',replyPhone:'99999999',version:'1'};
 const request=(body=input,origin=env.SITE_URL)=>new Request(env.SITE_URL+'/api/admin/requests/'+id+'/reply',{method:'PATCH',headers:{Origin:origin},body:JSON.stringify(body)});
 const options={db,auth:async()=>({email:'owner'}),notify:async()=>notifications++,notifyOwner:async()=>notifications++};
 assert.equal((await adminAPI(request(),env,{...options,auth:async()=>null})).status,401);assert.equal(reads,0);
 assert.equal((await adminAPI(request(input,'https://other.invalid'),env,options)).status,403);assert.equal(writes,0);
 assert.equal((await adminAPI(request({...input,whatsappDraft:'x'.repeat(6001)}),env,options)).status,400);
 let result=await adminAPI(request(),env,options);assert.equal(result.status,200);const row=(await result.json()).request;assert.equal(row.replyPhone,'+96899999999');assert.equal(row.whatsappDraft,input.whatsappDraft);assert.equal(row.status,'new');assert.equal(row.notes,'private');assert.equal(notifications,0);
 assert.equal((await adminAPI(request(),env,options)).status,409);assert.equal(writes,1);
});
test('composer requires saved, reviewed content; edits revoke the link and drafts survive remount',async()=>{
 const dom=new JSDOM('<div id="host"></div>',{url:'https://example.com/admin/',runScripts:'outside-only'}),w=dom.window;w.eval(fs.readFileSync(path.join(__dirname,'../public/admin/whatsapp.js'),'utf8'));
 const host=w.document.getElementById('host');let row={id:'ui-reply',version:'v1',name:'Client <img src=x>',phone:'99999999',service:'Workshop',packageKey:'training',notes:'SECRET',quoteBaisa:100000};let payload;
 const save=async(id,body)=>{payload=body;return {request:{...row,...body,replySavedAt:'now',version:'v2'}};};
 const mount=()=>w.PortfolioWhatsApp.mount(host,row,'ar',save,result=>{row=result;mount();});mount();
 assert.equal(w.PortfolioWhatsApp.hasDirty(),false);assert.equal(host.querySelector('.wa-open').hasAttribute('href'),false);assert.equal(host.querySelector('img'),null);
 const details=host.querySelector('[name=replyDetails]');details.value='محتوى متفق عليه';details.dispatchEvent(new w.Event('input',{bubbles:true}));host.querySelector('[data-action=generate]').click();assert.match(host.querySelector('[name=whatsappDraft]').value,/محتوى متفق عليه/);assert.ok(!host.querySelector('[name=whatsappDraft]').value.includes('SECRET'));
 mount();assert.equal(host.querySelector('[name=replyDetails]').value,'محتوى متفق عليه');assert.equal(host.querySelector('[data-review]').disabled,true);
 host.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,20));assert.equal(payload.version,'v1');assert.equal(host.querySelector('.wa-open').hasAttribute('href'),false);
 const review=host.querySelector('[data-review]');review.checked=true;review.dispatchEvent(new w.Event('change'));assert.equal(new URL(host.querySelector('.wa-open').href).searchParams.get('text'),row.whatsappDraft);
 const message=host.querySelector('[name=whatsappDraft]');message.value+=' تحديث';message.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(host.querySelector('.wa-open').hasAttribute('href'),false);assert.equal(review.checked,false);assert.equal(w.PortfolioWhatsApp.hasDirty(),true);w.close();
});
