const {createHash}=require('node:crypto');
const reply=(statusCode,body)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
const {validate}=require('./validate.cjs');
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
