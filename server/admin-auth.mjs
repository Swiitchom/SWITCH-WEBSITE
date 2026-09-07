import {SignJWT,jwtVerify,createRemoteJWKSet,EncryptJWT,jwtDecrypt} from 'jose';
import {database} from './firestore-rest.mjs';
export const OWNER='3labri1996@gmail.com';
const jwks=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const encoder=new TextEncoder();
export function secret(env){if(!env.ADMIN_SESSION_SECRET||env.ADMIN_SESSION_SECRET.length<32)throw Error('CONFIG');return encoder.encode(env.ADMIN_SESSION_SECRET);}
const cookie=(name,value,maxAge)=>`${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const getCookie=(request,name)=>request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1);
export async function sign(payload,audience,env,expiry='8h'){return new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuer(env.SITE_URL).setAudience(audience).setIssuedAt().setExpirationTime(expiry).sign(secret(env));}
async function verify(token,audience,env){return (await jwtVerify(token,secret(env),{issuer:env.SITE_URL,audience,algorithms:['HS256']})).payload;}
export async function authenticate(request,env){try{const user=await verify(getCookie(request,'__Host-portfolio'), 'portfolio-admin',env);return user.email===OWNER?user:null;}catch{return null;}}
export function sameOrigin(request,env){return request.headers.get('Origin')===env.SITE_URL;}
async function encryptionKey(env){return new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode('gmail-v1:'+env.ADMIN_SESSION_SECRET)));}
export async function encryptCredential(refreshToken,env){secret(env);return new EncryptJWT({refreshToken,email:OWNER}).setProtectedHeader({alg:'dir',enc:'A256GCM'}).setIssuer(env.SITE_URL).setAudience('portfolio-gmail').setIssuedAt().encrypt(await encryptionKey(env));}
export async function decryptCredential(token,env){secret(env);return (await jwtDecrypt(token,await encryptionKey(env),{issuer:env.SITE_URL,audience:'portfolio-gmail'})).payload;}
const redirect=(path,cookies=[])=>{const headers=new Headers({'Location':path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});for(const value of cookies)headers.append('Set-Cookie',value);return new Response(null,{status:303,headers});};
export async function googleAuth(request,env){
 const url=new URL(request.url),action=url.pathname.split('/').pop();
 if(action==='logout'){
  if(request.method!=='POST'||!sameOrigin(request,env))return new Response(null,{status:403});
  return redirect('/admin/',[cookie('__Host-portfolio','',0)]);
 }
 if(request.method!=='GET')return new Response(null,{status:405});
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.ADMIN_SESSION_SECRET)return redirect('/admin/?error=setup');
 const callback=env.SITE_URL+'/api/google/callback';
 if(action==='start'){
  const mode=url.searchParams.get('mode')==='gmail'?'gmail':'login';
  if(mode==='gmail'&&!await authenticate(request,env))return redirect('/admin/?error=signin');
  const state=crypto.randomUUID(),nonce=crypto.randomUUID(),verifier=crypto.randomUUID()+crypto.randomUUID();
  const digest=await crypto.subtle.digest('SHA-256',encoder.encode(verifier));
  const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const selected=url.searchParams.get('request')||'';
  const requestId=/^[a-f0-9-]{36}$/i.test(selected)?selected:'';
  const flow=await sign({state,nonce,verifier,mode,requestId},'portfolio-oauth',env,'10m');
  const destination=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  for(const [key,value] of Object.entries({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email'+(mode==='gmail'?' https://www.googleapis.com/auth/gmail.send':''),state,nonce,code_challenge:challenge,code_challenge_method:'S256',login_hint:OWNER,prompt:mode==='gmail'?'consent':'select_account',...(mode==='gmail'?{access_type:'offline'}:{})}))destination.searchParams.set(key,value);
  return redirect(destination.href,[cookie('__Host-portfolio-flow',flow,600)]);
 }
 if(action!=='callback')return new Response(null,{status:404});
 const clear=cookie('__Host-portfolio-flow','',0);
 try{
  const flow=await verify(getCookie(request,'__Host-portfolio-flow'),'portfolio-oauth',env);
  if(url.searchParams.get('state')!==flow.state||!url.searchParams.get('code')||url.searchParams.has('error'))throw Error('STATE');
  const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:callback,grant_type:'authorization_code',code:url.searchParams.get('code'),code_verifier:flow.verifier}),signal:AbortSignal.timeout(8000)});
  const tokens=await response.json();if(!response.ok)throw Error('TOKEN');
  const {payload}=await jwtVerify(tokens.id_token,jwks,{issuer:['https://accounts.google.com','accounts.google.com'],audience:env.GOOGLE_CLIENT_ID,algorithms:['RS256']});
  if(payload.nonce!==flow.nonce||payload.email!==OWNER||payload.email_verified!==true)throw Error('OWNER');
  if(flow.mode==='gmail'){
   if(!tokens.refresh_token||!tokens.scope?.split(' ').includes('https://www.googleapis.com/auth/gmail.send'))throw Error('SCOPE');
   await database(env.FIREBASE_SERVICE_ACCOUNT_JSON).patch('portfolioSettings/gmail',{credential:await encryptCredential(tokens.refresh_token,env),email:OWNER,connectedAt:new Date().toISOString()});
  }
  const session=await sign({email:OWNER,sub:payload.sub},'portfolio-admin',env);
  return redirect('/admin/'+(flow.requestId?'?request='+flow.requestId:flow.mode==='gmail'?'?connected=gmail':''),[clear,cookie('__Host-portfolio',session,28800)]);
 }catch{return redirect('/admin/?error=authorization',[clear]);}
}
