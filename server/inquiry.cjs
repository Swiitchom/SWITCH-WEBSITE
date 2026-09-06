const {createHash}=require('node:crypto');
const reply=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
function validate(data){
  if(!data||typeof data!=='object')throw Error('invalid');
  const text=(key,min,max)=>{if(typeof data[key]!=='string')throw Error(key);const value=data[key].trim();if(value.length<min||value.length>max)throw Error(key);return value;};
  const result={requestId:text('requestId',36,36),name:text('name',2,100),email:text('email',3,254),phone:text('phone',7,25),service:text('service',2,160),message:text('message',5,3000),kind:text('kind',1,12),context:text('context',1,160)};
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.requestId)||!/^\S+@[^\s@]+\.[^\s@]+$/.test(result.email)||!/^\+?[0-9 ()-]{7,25}$/.test(result.phone)||!['contact','store'].includes(result.kind)||data.consent!==true)throw Error('invalid');
  result.consent=true;
  if(result.kind==='store'){
    if(!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>100||typeof data.addWorkshop!=='boolean')throw Error('quantity');
    result.quantity=data.quantity;result.addWorkshop=data.addWorkshop;result.totalOMR=(19900*data.quantity+(data.addWorkshop?59000:0))/1000;
  }
  return result;
}
function createHandler({save,env=process.env}){
 return async event=>{
  if(event.httpMethod!=='POST')return reply(405,{error:'method'});
  if((event.body||'').length>12000)return reply(413,{error:'size'});
  const headers=Object.fromEntries(Object.entries(event.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));
  const origins=[env.SITE_URL,env.DEPLOY_PRIME_URL].filter(Boolean).map(url=>new URL(url).origin);
  if(!origins.length)return reply(503,{error:'not_configured'});
  if(!origins.includes(headers.origin))return reply(403,{error:'origin'});
  let input;
  try{input=JSON.parse(event.body);if(input.website)return reply(400,{error:'invalid'});input=validate(input);}catch{return reply(400,{error:'validation'});}
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON)return reply(503,{error:'not_configured'});
  const ip=headers['x-nf-client-connection-ip'];
  if(!ip)return reply(503,{error:'not_configured'});
  try{await save(input,createHash('sha256').update(ip).digest('hex'));return reply(201,{id:input.requestId});}
  catch(error){return reply(error.code==='RATE_LIMIT'?429:error.code==='CONFLICT'?409:503,{error:error.code==='RATE_LIMIT'?'rate_limit':'save_failed'});}
 };
}
module.exports={validate,createHandler};
