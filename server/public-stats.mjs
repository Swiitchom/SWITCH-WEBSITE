import {base,database,fields,unpack} from './firestore-rest.mjs';

const json=(status,body,cache='no-store')=>Response.json(body,{status,headers:{'Cache-Control':cache,'X-Content-Type-Options':'nosniff'}});

function omanDay(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

async function aggregateCount(db,where){
  const structuredQuery={from:[{collectionId:'portfolioInquiries'}],...(where?{where}:{})};
  const rows=await db.api(base+':runAggregationQuery',{structuredAggregationQuery:{structuredQuery,aggregations:[{alias:'total',count:{}}]}});
  return Number(rows?.[0]?.result?.aggregateFields?.total?.integerValue||0);
}

export async function publicStats(request,env,{db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON)}={}){
  if(request.method!=='GET')return json(405,{error:'method'});
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON)return json(503,{error:'not_configured'});
  try{
    const total=unpack(await db.read('portfolioPublicStats/total'))||{};
    const consultations=await aggregateCount(db,{fieldFilter:{field:{fieldPath:'context'},op:'EQUAL',value:{stringValue:'consultation'}}});
    const start=new Date(Date.now()-13*86400000);
    const startDay=omanDay(start);
    const rows=await db.api(base+':runQuery',{structuredQuery:{from:[{collectionId:'portfolioVisitDays'}],where:{fieldFilter:{field:{fieldPath:'day'},op:'GREATER_THAN_OR_EQUAL',value:{stringValue:startDay}}},orderBy:[{field:{fieldPath:'day'},direction:'ASCENDING'}],limit:14}});
    const trend=rows.filter(r=>r.document).map(r=>{const v=unpack(r.document);return {day:v.day,visits:Number(v.visits||0)};});
    return json(200,{visits:Number(total.visits||0),consultations,trend,startedAt:total.startedAt||'2026-09-18'},'public, max-age=120, stale-while-revalidate=300');
  }catch{return json(503,{error:'unavailable'});}
}

export async function recordVisit(request,env,{db=database(env.FIREBASE_SERVICE_ACCOUNT_JSON)}={}){
  if(request.method!=='POST')return json(405,{error:'method'});
  if(!env.FIREBASE_SERVICE_ACCOUNT_JSON)return json(503,{error:'not_configured'});
  let origin;try{origin=new URL(env.SITE_URL).origin;}catch{return json(503,{error:'not_configured'});}
  const requestOrigin=request.headers.get('Origin');
  if(requestOrigin&&requestOrigin!==origin)return json(403,{error:'origin'});
  const fetchSite=request.headers.get('Sec-Fetch-Site');
  if(fetchSite&&fetchSite!=='same-origin'&&fetchSite!=='same-site')return json(403,{error:'origin'});
  try{
    const day=omanDay(),now=new Date().toISOString();
    await db.api(base+':commit',{writes:[
      {update:{name:base+'/portfolioPublicStats/total',fields:fields({updatedAt:now,startedAt:'2026-09-18'})},updateMask:{fieldPaths:['updatedAt','startedAt']},updateTransforms:[{fieldPath:'visits',increment:{integerValue:'1'}}]},
      {update:{name:base+'/portfolioVisitDays/'+day,fields:fields({day,updatedAt:now})},updateMask:{fieldPaths:['day','updatedAt']},updateTransforms:[{fieldPath:'visits',increment:{integerValue:'1'}}]}
    ]});
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
  }catch{return json(503,{error:'unavailable'});}
}
