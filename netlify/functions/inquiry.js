const {createHandler}=require('../../server/inquiry.cjs');
async function save(input,ipHash){
 const {initializeApp,cert,getApps}=require('firebase-admin/app');
 const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
 if(!getApps().length)initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
 const db=getFirestore();
 const doc=db.collection('portfolioInquiries').doc(input.requestId);
 const limit=db.collection('portfolioRateLimits').doc(ipHash);
 const {createHash}=require('node:crypto');
 const normalizedEmail=input.email.trim().toLowerCase();
 const audience=db.collection('portfolioAudience').doc(createHash('sha256').update(normalizedEmail).digest('hex'));
 await db.runTransaction(async tx=>{
  const existing=await tx.get(doc);
  if(existing.exists){
   const {createHash}=require('node:crypto');
   const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
   if(existing.data().payloadHash!==hash)throw Object.assign(Error('Conflict'),{code:'CONFLICT'});
   return;
  }
  const [limits,audienceSnap]=await Promise.all([tx.get(limit),tx.get(audience)]),now=Date.now();
  const previous=limits.exists?limits.data():{};
  const current=previous.windowStart>now-3600000?previous.count:0;
  if(current>=5)throw Object.assign(Error('Rate limit'),{code:'RATE_LIMIT'});
  const oldAudience=audienceSnap.exists?audienceSnap.data():{},sources=new Set(String(oldAudience.sources||'').split('|').filter(Boolean)),interests=new Set(String(oldAudience.interests||'').split('|').filter(Boolean));
  sources.add(input.context);interests.add(input.service);
  const marketingConsent=oldAudience.marketingConsent===true||input.marketingConsent===true,seenAt=new Date(now).toISOString();
  tx.create(doc,{...input,payloadHash:createHash('sha256').update(JSON.stringify(input)).digest('hex'),status:'new',createdAt:FieldValue.serverTimestamp()});
  tx.set(limit,{count:current+1,windowStart:current?previous.windowStart:now,expiresAt:Timestamp.fromMillis(now+7200000)});
  tx.set(audience,{email:normalizedEmail,name:input.name,language:input.language||oldAudience.language||'ar',marketingConsent,marketingStatus:marketingConsent?'subscribed':'not_subscribed',sources:[...sources].join('|'),interests:[...interests].join('|'),firstSeenAt:oldAudience.firstSeenAt||seenAt,lastSeenAt:seenAt},{merge:false});
 });
}
exports.handler=createHandler({save});
