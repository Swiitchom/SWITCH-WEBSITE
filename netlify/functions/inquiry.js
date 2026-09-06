const {createHandler}=require('../../server/inquiry.cjs');
async function save(input,ipHash){
 const {initializeApp,cert,getApps}=require('firebase-admin/app');
 const {getFirestore,FieldValue,Timestamp}=require('firebase-admin/firestore');
 if(!getApps().length)initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
 const db=getFirestore();
 const doc=db.collection('portfolioInquiries').doc(input.requestId);
 const limit=db.collection('portfolioRateLimits').doc(ipHash);
 await db.runTransaction(async tx=>{
  const existing=await tx.get(doc);
  if(existing.exists){
   const {createHash}=require('node:crypto');
   const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex');
   if(existing.data().payloadHash!==hash)throw Object.assign(Error('Conflict'),{code:'CONFLICT'});
   return;
  }
  const limits=await tx.get(limit),now=Date.now();
  const previous=limits.exists?limits.data():{};
  const current=previous.windowStart>now-3600000?previous.count:0;
  if(current>=5)throw Object.assign(Error('Rate limit'),{code:'RATE_LIMIT'});
  const {createHash}=require('node:crypto');
  tx.create(doc,{...input,payloadHash:createHash('sha256').update(JSON.stringify(input)).digest('hex'),status:'new',createdAt:FieldValue.serverTimestamp()});
  tx.set(limit,{count:current+1,windowStart:current?previous.windowStart:now,expiresAt:Timestamp.fromMillis(now+7200000)});
 });
}
exports.handler=createHandler({save});
