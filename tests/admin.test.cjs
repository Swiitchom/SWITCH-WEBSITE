const {test}=require('node:test');const assert=require('node:assert/strict');
const env={SITE_URL:'https://example.com',ADMIN_SESSION_SECRET:'test-secret-that-is-long-enough-1234567890',GOOGLE_CLIENT_ID:'client',GOOGLE_CLIENT_SECRET:'client-secret',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};
const id='a56f8460-5c1c-4b4b-aeda-e43e8ed87067';
test('private sessions reject forged, expired and non-owner credentials; refresh secrets are encrypted',async()=>{
 const {sign,authenticate,OWNER,encryptCredential,decryptCredential}=await import('../server/admin-auth.mjs');
 const request=token=>new Request(env.SITE_URL+'/api/admin/session',{headers:{Cookie:'__Host-portfolio='+token}});
 const valid=await sign({email:OWNER},'portfolio-admin',env);assert.equal((await authenticate(request(valid),env)).email,OWNER);
 assert.equal(await authenticate(request(valid+'bad'),env),null);
 assert.equal(await authenticate(request(await sign({email:'someone@example.com'},'portfolio-admin',env)),env),null);
 assert.equal(await authenticate(request(await sign({email:OWNER},'portfolio-admin',env,'-1s')),env),null);
 assert.equal(await authenticate(request(await sign({email:OWNER},'portfolio-oauth',env)),env),null);
 const encrypted=await encryptCredential('sensitive-refresh-token',env);assert.ok(!encrypted.includes('sensitive-refresh-token'));assert.equal((await decryptCredential(encrypted,env)).refreshToken,'sensitive-refresh-token');
 await assert.rejects(decryptCredential(encrypted,{...env,ADMIN_SESSION_SECRET:'different-secret-that-is-long-enough-123456'}));
});
test('OAuth enforces state and does not expose Google tokens to the browser',async()=>{
 const {googleAuth}=await import('../server/admin-auth.mjs');
 const start=await googleAuth(new Request(env.SITE_URL+'/api/google/start'),env);
 const url=new URL(start.headers.get('location'));assert.equal(url.origin,'https://accounts.google.com');assert.equal(url.searchParams.get('scope'),'openid email');assert.equal(url.searchParams.get('code_challenge_method'),'S256');
 assert.match(start.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
 const result=await googleAuth(new Request(env.SITE_URL+'/api/google/callback?state=wrong&code=anything',{headers:{Cookie:start.headers.get('set-cookie').split(';')[0]}}),env);
 assert.match(result.headers.get('location'),/error=authorization/);
 const gmail=await googleAuth(new Request(env.SITE_URL+'/api/google/start?mode=gmail'),env);assert.match(gmail.headers.get('location'),/error=signin/);
});
test('admin reads and writes require a private session, same origin and current document version',async()=>{
 const {adminAPI}=await import('../server/admin-api.mjs');const {fields,base}=await import('../server/firestore-rest.mjs');
 const doc={name:base+'/portfolioInquiries/'+id,updateTime:'v1',fields:fields({name:'Customer',email:'test@example.invalid',status:'new',notes:'',payloadHash:'hidden-hash',reference:'SAL-1001'})};let writes=0,reads=0;
 const db={read:async()=>{reads++;return doc;},patch:async()=>{writes++;},api:async()=>[{document:doc}]};
 let response=await adminAPI(new Request(env.SITE_URL+'/api/admin/requests'),env,{db});assert.equal(response.status,401);assert.equal(reads,0);
 const auth=async()=>({email:'3labri1996@gmail.com'});
 response=await adminAPI(new Request(env.SITE_URL+'/api/admin/requests'),env,{db,auth});const list=await response.json();assert.equal(list.requests[0].reference,'SAL-1001');assert.ok(!JSON.stringify(list).includes('hidden-hash'));
 const update=(origin,version='v1')=>new Request(env.SITE_URL+'/api/admin/requests/'+id,{method:'PATCH',headers:{Origin:origin},body:JSON.stringify({status:'completed',notes:'Reviewed',version})});
 assert.equal((await adminAPI(update('https://attacker.invalid'),env,{db,auth})).status,403);assert.equal(writes,0);
 assert.equal((await adminAPI(update(env.SITE_URL,'stale'),env,{db,auth})).status,409);assert.equal(writes,0);
 assert.equal((await adminAPI(update(env.SITE_URL),env,{db,auth})).status,200);assert.equal(writes,1);
});
test('confirmation email escapes visitor content, supports both languages and rejects header injection',async()=>{
 const {confirmationMessage}=await import('../server/gmail.mjs');
 const data={requestId:id,reference:'SAL-1001',name:'<img src=x onerror=alert(1)>',email:'test@example.invalid',service:'Arduino <script>alert(1)</script>'};
 const ar=confirmationMessage(data);assert.ok(ar.html.includes('&lt;script&gt;'));assert.ok(!ar.html.includes('<script>'));assert.ok(ar.text.includes('SAL-1001'));assert.ok(ar.text.includes('قيد المراجعة'));
 assert.ok(confirmationMessage({...data,language:'en'}).text.includes('Status: Under review'));
 assert.throws(()=>confirmationMessage({...data,email:'a@example.com\r\nBcc: b@example.com'}));
});
test('email outbox sends once and never retries an ambiguous dispatch automatically',async()=>{
 const {sendConfirmation}=await import('../server/gmail.mjs');const {fields,base}=await import('../server/firestore-rest.mjs');const {encryptCredential}=await import('../server/admin-auth.mjs');
 const credential=await encryptCredential('test-refresh-token',env);let state={name:'Test',email:'test@example.invalid',service:'Training',reference:'SAL-1001',emailStatus:'pending',emailAttempts:0},version=1,sends=0;
 const db={read:async path=>path==='portfolioSettings/gmail'?{fields:fields({credential})}:path.startsWith('portfolioSettings/mail-')?null:{name:base+'/'+path,updateTime:String(version),fields:fields(state)},api:async(path,body)=>{if(body.writes[0].currentDocument.updateTime!==String(version))throw Error('CONFLICT');state={...state,...Object.fromEntries(Object.entries(body.writes[0].update.fields).map(([k,v])=>[k,v.stringValue??Number(v.integerValue)]))};version++;},patch:async(path,data)=>{state={...state,...data};version++;}};
 const request=async url=>{if(url.includes('oauth2'))return Response.json({access_token:'token'});sends++;return Response.json({id:'gmail-message'});};
 await Promise.all([sendConfirmation(id,env,{db,request}),sendConfirmation(id,env,{db,request})]);assert.equal(sends,1);assert.equal(state.emailStatus,'sent');await sendConfirmation(id,env,{db,request});assert.equal(sends,1);
 state={...state,emailStatus:'pending',emailAttempts:0};
 await sendConfirmation(id,env,{db,request:async url=>{if(url.includes('oauth2'))return Response.json({access_token:'token'});throw Error('network timeout');}});assert.equal(state.emailStatus,'unknown');await sendConfirmation(id,env,{db,request});assert.equal(sends,1);
});
