// Portable Web Crypto/REST adapter: no private credential enters the browser bundle.
const sessions = new Map();
const encode = value => btoa(String.fromCharCode(...new Uint8Array(value))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const bytes = value => new TextEncoder().encode(value);
export async function hash(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes(value)))].map(x => x.toString(16).padStart(2, '0')).join('');
}
function failure(code) { return Object.assign(new Error('Persistence failed'), {code}); }
export async function tokenFor(raw) {
  let session = sessions.get(raw);
  if (!session) {
    const credential = JSON.parse(raw);
    if (credential.type !== 'service_account' || credential.project_id !== 'salim-alabri-webaite' || !credential.client_email?.endsWith('@salim-alabri-webaite.iam.gserviceaccount.com')) throw failure('CONFIG');
    session = {credential};
    sessions.clear(); sessions.set(raw, session);
  }
  if (session.expires > Date.now() + 60000) return session.token;
  if (!session.pending) session.pending = (async () => {
    const {credential} = session;
    if (!session.key) {
      const der = Uint8Array.from(atob(credential.private_key.replace(/-----[^-]+-----|\s/g, '')), c => c.charCodeAt(0));
      session.key = await crypto.subtle.importKey('pkcs8', der, {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['sign']);
    }
    const now = Math.floor(Date.now()/1000);
    const unsigned = encode(bytes(JSON.stringify({alg:'RS256',typ:'JWT'}))) + '.' + encode(bytes(JSON.stringify({iss:credential.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
    const assertion = unsigned + '.' + encode(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', session.key, bytes(unsigned)));
    const response = await fetch('https://oauth2.googleapis.com/token', {method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(8000)});
    const result = await response.json();
    if (!response.ok || !result.access_token) throw failure('AUTH');
    session.token = result.access_token; session.expires = Date.now()+Number(result.expires_in)*1000;
    return session.token;
  })().finally(() => {session.pending = null;});
  return session.pending;
}
function field(value) {
  if (typeof value === 'boolean') return {booleanValue:value};
  if (typeof value === 'number') return Number.isInteger(value) ? {integerValue:String(value)} : {doubleValue:value};
  return {stringValue:value};
}
export const fields = object => Object.fromEntries(Object.entries(object).map(([key,value]) => [key,field(value)]));
export const base = 'projects/salim-alabri-webaite/databases/(default)/documents';
export function unpack(doc) {
  if(!doc)return null;
  return Object.fromEntries(Object.entries(doc.fields||{}).map(([key,v])=>[key,'stringValue' in v?v.stringValue:'integerValue' in v?Number(v.integerValue):'doubleValue' in v?v.doubleValue:'booleanValue' in v?v.booleanValue:'timestampValue' in v?v.timestampValue:null]));
}
export function database(raw) {
  async function api(path, body) {
    const response=await fetch('https://firestore.googleapis.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+await tokenFor(raw),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(8000)});
    const result=await response.json();if(!response.ok)throw failure(result.error?.status||'UNAVAILABLE');return result;
  }
  return {api,async read(path){try{return await api(base+'/'+path);}catch(e){if(e.code==='NOT_FOUND')return null;throw e;}},
    async patch(path,data,version){return api(base+':commit',{writes:[{update:{name:base+'/'+path,fields:fields(data)},updateMask:{fieldPaths:Object.keys(data)},...(version?{currentDocument:{updateTime:version}}:{})}]});}};
}

export function createStore(raw, {request=fetch, accessToken=()=>tokenFor(raw), clock=Date.now}={}) {
  const base = 'projects/salim-alabri-webaite/databases/(default)/documents';
  async function api(path, body) {
    const response = await request('https://firestore.googleapis.com/v1/'+path, {method:body?'POST':'GET',headers:{Authorization:'Bearer '+await accessToken(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(8000)});
    const result = await response.json();
    if (!response.ok) throw failure(result.error?.status || 'UNAVAILABLE');
    return result;
  }
  async function read(name) {
    try {return await api(name);} catch (error) {if(error.code==='NOT_FOUND')return null;throw error;}
  }
  return async (input, ipHash) => {
    const name = base+'/portfolioInquiries/'+input.requestId;
    const limitName = base+'/portfolioRateLimits/'+ipHash;
    const payloadHash = await hash(JSON.stringify(input));
    // An atomic commit with version preconditions prevents concurrent quota bypass.
    // Retry after another request wins; an existing identical receipt never costs quota.
    for (let attempt=0; attempt<5; attempt++) {
      const existing = await read(name);
      if (existing) {
        if(existing.fields?.payloadHash?.stringValue!==payloadHash) throw failure('CONFLICT');
        return {reference:existing.fields?.reference?.stringValue || '',emailStatus:existing.fields?.emailStatus?.stringValue || 'pending'};
      }
      const previous = await read(limitName), now=clock();
      const start = Number(previous?.fields?.windowStart?.integerValue || 0);
      const count = start>now-3600000 ? Number(previous?.fields?.count?.integerValue || 0) : 0;
      if(count>=5) throw failure('RATE_LIMIT');
      const counterName=base+'/portfolioSettings/requestCounter';
      const counter=await read(counterName);
      const sequence=Number(counter?.fields?.sequence?.integerValue||1000)+1;
      const reference='SAL-'+sequence;
      try {
        await api(base+':commit', {writes:[
          {update:{name,fields:fields({...input,payloadHash,reference,status:'new',notes:'',emailStatus:'pending',emailAttempts:0})},currentDocument:{exists:false},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}]},
          {update:{name:limitName,fields:{...fields({count:count+1,windowStart:count?start:now}),expiresAt:{timestampValue:new Date(now+7200000).toISOString()}}},currentDocument:previous?{updateTime:previous.updateTime}:{exists:false}},
          {update:{name:counterName,fields:fields({sequence})},currentDocument:counter?{updateTime:counter.updateTime}:{exists:false}}
        ]});
        return {reference,emailStatus:'pending'};
      } catch (error) {
        if(!['ABORTED','FAILED_PRECONDITION','ALREADY_EXISTS'].includes(error.code) || attempt===4)throw error;
        await new Promise(resolve=>setTimeout(resolve,25*(attempt+1)+Math.random()*50));
      }
    }
  };
}
