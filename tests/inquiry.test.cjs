const {test}=require('node:test');const assert=require('node:assert/strict');
const {validate,createHandler}=require('../server/inquiry.cjs');
const data={requestId:'a56f8460-5c1c-4b4b-aeda-e43e8ed87067',name:'Test User',email:'test@example.com',phone:'+968 99999999',service:'Training',context:'workshops',kind:'contact',message:'A workshop inquiry',consent:true};
const env={SITE_URL:'https://example.com',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};
const event=body=>({httpMethod:'POST',headers:{origin:'https://example.com','x-nf-client-connection-ip':'127.0.0.1'},body:JSON.stringify(body)});
test('required email, phone, consent and inquiry validation is enforced server-side',()=>{
 for(const field of ['email','phone','name','message'])assert.throws(()=>validate({...data,[field]:''}));
 assert.throws(()=>validate({...data,consent:false}));assert.throws(()=>validate({...data,email:'invalid'}));
 assert.equal(validate(data).context,'workshops');
});
test('store totals are computed by the server, ignoring client prices',()=>{
 const result=validate({...data,kind:'store',quantity:2,addWorkshop:true,totalOMR:0});assert.equal(result.totalOMR,98.8);
 assert.throws(()=>validate({...data,kind:'store',quantity:-1,addWorkshop:false}));
});
test('only successful persistence returns a receipt, with service context',async()=>{
 let saved;const h=createHandler({env,save:async payload=>{saved=payload;}});
 const result=await h(event(data));assert.equal(result.statusCode,201);assert.equal(saved.service,'Training');assert.equal(saved.context,'workshops');
 const failure=createHandler({env,save:async()=>{throw Error('offline');}});assert.equal((await failure(event(data))).statusCode,503);
});
test('unconfigured, cross-origin, spam, oversized and rate-limited requests cannot report success',async()=>{
 const h=createHandler({env,save:async()=>{throw Object.assign(Error(),{code:'RATE_LIMIT'});}});
 assert.equal((await h(event(data))).statusCode,429);
 assert.equal((await h({...event(data),headers:{origin:'https://other.example'}})).statusCode,403);
 assert.equal((await h(event({...data,website:'spam'}))).statusCode,400);
 assert.equal((await h({...event(data),body:'x'.repeat(12001)})).statusCode,413);
 assert.equal((await createHandler({env:{},save:async()=>{}})(event(data))).statusCode,503);
});
