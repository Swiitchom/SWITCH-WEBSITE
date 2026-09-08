const {test}=require('node:test');
const assert=require('node:assert/strict');
const id='a56f8460-5c1c-4b4b-aeda-e43e8ed87067';
const env={SITE_URL:'https://salimalabri.pages.dev',ADMIN_SESSION_SECRET:'test-secret-that-is-long-enough-1234567890',GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'secret',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};
async function fixture(initial={}){
 const {fields,unpack,base}=await import('../server/firestore-rest.mjs');
 const {encryptCredential}=await import('../server/admin-auth.mjs');
 const docs=new Map();let version=0;
 const put=(path,data)=>docs.set(path,{name:base+'/'+path,fields:fields(data),updateTime:String(++version)});
 put('portfolioSettings/gmail',{credential:await encryptCredential('test-refresh',env)});
 put('portfolioInquiries/'+id,{name:'Private name',email:'customer@example.invalid',phone:'+96800000000',message:'Private inquiry',service:'Training <script>bad</script>',context:'services',reference:'SAL-1010',emailStatus:'pending',emailAttempts:0,ownerEmailStatus:'pending',ownerEmailAttempts:0,...initial});
 const db={read:async path=>structuredClone(docs.get(path)||null),patch:async(path,data)=>put(path,{...unpack(docs.get(path)),...data}),api:async(path,body)=>{
  for(const w of body.writes){const old=docs.get(w.update.name.slice(base.length+1));if(w.currentDocument.exists===false?!!old:old?.updateTime!==w.currentDocument.updateTime)throw Object.assign(Error('conflict'),{code:'FAILED_PRECONDITION'});}
  for(const w of body.writes){const p=w.update.name.slice(base.length+1);put(p,{...(w.updateMask?unpack(docs.get(p)):{}),...unpack(w.update)});}
 }};
 return {db,state:()=>unpack(docs.get('portfolioInquiries/'+id)),quota:()=>unpack(docs.get('portfolioSettings/mail-'+new Date().toISOString().slice(0,10)))?.count||0,put};
}
test('owner notification uses a private deep link and excludes customer contact/message data',async()=>{
 const {ownerNotificationMessage}=await import('../server/gmail.mjs');const f=await fixture();
 const message=ownerNotificationMessage({...f.state(),requestId:id});
 assert.match(message.html,/&lt;script&gt;/);assert.ok(!message.html.includes('<script>'));
 assert.match(message.text,new RegExp('/admin/\\?request='+id));
 for(const privateValue of ['Private name','customer@example.invalid','+96800000000','Private inquiry'])assert.ok(!message.text.includes(privateValue)&&!message.html.includes(privateValue));
 const mime=Buffer.from(message.raw,'base64url').toString();assert.match(mime,/To: 3labri1996@gmail.com\r\n/);assert.match(mime,/Message-ID: <owner-/);
 assert.throws(()=>ownerNotificationMessage({...f.state(),requestId:'bad\r\nBcc: other@example.com'}));
});
test('parallel notification leases send each recipient once and reserve actual mail quota',async()=>{
 const {sendNotifications}=await import('../server/gmail.mjs');const f=await fixture();let sends=0;
 const request=async url=>url.includes('oauth2')?Response.json({access_token:'token'}):Response.json({id:'message-'+(++sends)});
 await Promise.all([sendNotifications(id,env,{db:f.db,request}),sendNotifications(id,env,{db:f.db,request})]);
 assert.equal(sends,2);assert.equal(f.quota(),2);assert.equal(f.state().emailStatus,'sent');assert.equal(f.state().ownerEmailStatus,'sent');
 assert.equal(f.state().ownerEmailAttempts,1);assert.equal(f.state().emailAttempts,1);
 await sendNotifications(id,env,{db:f.db,request});assert.equal(sends,2);
});
test('customer rejection does not suppress owner mail; retries do not resend successful mail',async()=>{
 const {sendNotifications}=await import('../server/gmail.mjs');const f=await fixture();let sends=0,ownerSends=0,fail=true;
 const request=async(url,options)=>{if(url.includes('oauth2'))return Response.json({access_token:'token'});sends++;const mime=Buffer.from(JSON.parse(options.body).raw,'base64url').toString();if(mime.includes('Message-ID: <owner-')){ownerSends++;return Response.json({id:'owner'});}return fail?Response.json({error:'rejected'},{status:400}):Response.json({id:'customer'});};
 await sendNotifications(id,env,{db:f.db,request});assert.equal(f.state().emailStatus,'failed');assert.equal(f.state().ownerEmailStatus,'sent');
 fail=false;await sendNotifications(id,env,{db:f.db,request});assert.equal(ownerSends,1);assert.equal(sends,3);assert.equal(f.state().emailStatus,'sent');
});
test('mail quota never exceeds 50 and older requests do not receive new owner alerts',async()=>{
 const {sendNotifications,sendOwnerNotification}=await import('../server/gmail.mjs');const f=await fixture();let sends=0;
 f.put('portfolioSettings/mail-'+new Date().toISOString().slice(0,10),{count:49});
 const request=async url=>url.includes('oauth2')?Response.json({access_token:'token'}):Response.json({id:'m'+(++sends)});
 await sendNotifications(id,env,{db:f.db,request});assert.equal(sends,1);assert.equal(f.quota(),50);
 const old=await fixture({ownerEmailStatus:'legacy'});await sendOwnerNotification(id,env,{db:old.db,request});assert.equal(sends,1);
});
test('owner mail retry requires owner authentication and same-origin POST',async()=>{
 const {adminAPI}=await import('../server/admin-api.mjs');const f=await fixture();let sent=0;
 const options={db:f.db,notifyOwner:async()=>sent++};
 const req=origin=>new Request(env.SITE_URL+'/api/admin/requests/'+id+'/owner-email',{method:'POST',headers:{Origin:origin}});
 assert.equal((await adminAPI(req(env.SITE_URL),env,options)).status,401);
 options.auth=async()=>({email:'3labri1996@gmail.com'});
 assert.equal((await adminAPI(req('https://other.invalid'),env,options)).status,403);assert.equal(sent,0);
 assert.equal((await adminAPI(req(env.SITE_URL),env,options)).status,200);assert.equal(sent,1);
});
