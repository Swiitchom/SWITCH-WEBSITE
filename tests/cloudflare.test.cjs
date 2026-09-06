const {test}=require('node:test');
const assert=require('node:assert/strict');
const input={requestId:'a56f8460-5c1c-4b4b-aeda-e43e8ed87067',name:'Test User',email:'test@example.invalid',phone:'+96800000000',service:'Training',context:'workshops',kind:'contact',message:'A workshop inquiry',consent:true};
const env={SITE_URL:'https://example.com',FIREBASE_SERVICE_ACCOUNT_JSON:'test'};
const request=(body=input,headers={})=>new Request('https://example.com/api/inquiry',{method:'POST',headers:{Origin:env.SITE_URL,'CF-Connecting-IP':'192.0.2.77',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
test('edge handler validates trusted origin, bounded bytes, consent and receipt',async()=>{
 const {handleInquiry}=await import('../server/cloudflare-inquiry.mjs');let saved;
 const save=async(data,ipHash)=>{saved={data,ipHash};};
 let result=await handleInquiry(request(),env,save);assert.equal(result.status,201);assert.equal((await result.json()).id,input.requestId);assert.equal(saved.ipHash.length,64);assert.equal(saved.data.email,input.email);
 assert.equal((await handleInquiry(request(input,{Origin:'https://attacker.invalid'}),env,save)).status,403);
 assert.equal((await handleInquiry(request({...input,consent:false}),env,save)).status,400);
 assert.equal((await handleInquiry(request({...input,website:'spam'}),env,save)).status,400);
 assert.equal((await handleInquiry(request('ع'.repeat(6001)),env,save)).status,413);
 assert.equal((await handleInquiry(request(input,{'CF-Connecting-IP':''}),env,save)).status,503);
 assert.equal((await handleInquiry(request(),{},save)).status,503);
 assert.equal((await handleInquiry(request(),env,async()=>{throw Error('private details');})).status,503);
 assert.equal((await handleInquiry(request(),env,async()=>{throw Object.assign(Error(),{code:'CONFLICT'});})).status,409);
 assert.equal((await handleInquiry(new Request('https://example.com/api/inquiry'),env,save)).status,405);
});
test('atomic preconditions protect concurrent receipts and enforce five requests per hour',async()=>{
 const {createStore}=await import('../server/firestore-rest.mjs');
 const docs=new Map();let version=0;
 const fake=async(url,options)=>{
  const name=url.split('/v1/')[1];
  if(options.method==='GET')return docs.has(name)?Response.json(docs.get(name)):Response.json({error:{status:'NOT_FOUND'}},{status:404});
  const {writes}=JSON.parse(options.body);
  for(const write of writes){const old=docs.get(write.update.name),condition=write.currentDocument;
   if(condition.exists===false&&old || condition.updateTime&&old?.updateTime!==condition.updateTime)return Response.json({error:{status:'FAILED_PRECONDITION'}},{status:409});
  }
  for(const write of writes)docs.set(write.update.name,{...write.update,updateTime:String(++version)});
  return Response.json({});
 };
 let now=Date.now();const save=createStore('unused',{request:fake,accessToken:async()=>'test-token',clock:()=>now});
 await Promise.all([save(input,'same-ip'),save(input,'same-ip')]);
 const limit=[...docs.keys()].find(name=>name.includes('portfolioRateLimits'));
 assert.equal(docs.get(limit).fields.count.integerValue,'1');
 await assert.rejects(save({...input,message:'A conflicting request'},'same-ip'),{code:'CONFLICT'});
 const results=await Promise.allSettled(Array.from({length:5},(_,i)=>save({...input,requestId:input.requestId.slice(0,-1)+i},'same-ip')));
 assert.equal(results.filter(result=>result.status==='fulfilled').length,4);
 assert.equal(results.filter(result=>result.reason?.code==='RATE_LIMIT').length,1);
 assert.equal(docs.get(limit).fields.count.integerValue,'5');
 now+=3600001;await save({...input,requestId:input.requestId.slice(0,-1)+'f'},'same-ip');
 assert.equal(docs.get(limit).fields.count.integerValue,'1');
});
