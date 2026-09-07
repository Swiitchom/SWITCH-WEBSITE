const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
const script=fs.readFileSync(path.join(__dirname,'../public/assets/analytics.js'),'utf8');
function boot(url='https://salimalabri.pages.dev/?email=private@example.com#phone=12345678',saved){
 const dom=new JSDOM(html,{url,referrer:'https://example.com/?email=referrer@example.com',runScripts:'outside-only'});
 if(saved)dom.window.localStorage.setItem('salim.analytics-consent.v1',JSON.stringify(saved));
 dom.window.eval(script);return dom;
}
const commands=w=>(w.dataLayer||[]).map(args=>Array.from(args));
test('analytics never loads before consent, after refusal, or in a local preview',()=>{
 for(const url of ['https://salimalabri.pages.dev/','http://127.0.0.1:4173/']){
  const dom=boot(url),d=dom.window.document;
  assert.equal(d.getElementById('portfolioGoogleTag'),null);
  d.getElementById('analyticsReject').click();assert.equal(d.getElementById('portfolioGoogleTag'),null);
  if(url.includes('127.0.0.1')){d.getElementById('analyticsPreferences').click();d.getElementById('analyticsAccept').click();assert.equal(d.getElementById('portfolioGoogleTag'),null);}
  dom.window.close();
 }
});
test('consented measurement excludes query strings, fragments, referrer queries and supplied contact fields',()=>{
 const dom=boot(),w=dom.window,d=w.document;d.getElementById('analyticsAccept').click();
 assert.ok(d.getElementById('portfolioGoogleTag'));
 w.document.dispatchEvent(new w.CustomEvent('portfolio:inquiry-saved',{detail:{kind:'contact',context:'private@example.com',email:'private@example.com',phone:'12345678',message:'sensitive'}}));
 const events=commands(w), serialized=JSON.stringify(events);
 assert.ok(!serialized.includes('private@example.com'));assert.ok(!serialized.includes('referrer@example.com'));assert.ok(!serialized.includes('12345678'));assert.ok(!serialized.includes('sensitive'));
 assert.deepEqual(JSON.parse(JSON.stringify(events.find(c=>c[0]==='event'&&c[1]==='generate_lead')[2])),{form_name:'contact',lead_source:'contact'});
 assert.equal(events.filter(c=>c[1]==='page_view').length,1);
 dom.window.close();
});
test('withdrawal deletes analytics cookies and stops subsequent lead events',()=>{
 const dom=boot(),w=dom.window,d=w.document;d.getElementById('analyticsAccept').click();d.cookie='_ga=test; Path=/';
 d.getElementById('analyticsPreferences').click();d.getElementById('analyticsReject').click();
 d.dispatchEvent(new w.CustomEvent('portfolio:inquiry-saved',{detail:{kind:'store',context:'store'}}));
 assert.equal(w['ga-disable-G-RSGND37FQ5'],true);assert.ok(!d.cookie.includes('_ga='));assert.equal(commands(w).filter(c=>c[1]==='generate_lead').length,0);
 dom.window.close();
});
test('expired consent asks again, and the preference controls follow the site language',async()=>{
 const dom=boot(undefined,{value:'granted',at:Date.now()-181*86400000}),d=dom.window.document;
 assert.equal(d.getElementById('analyticsConsent').hidden,false);assert.equal(d.getElementById('portfolioGoogleTag'),null);
 d.documentElement.lang='en';await new Promise(resolve=>setImmediate(resolve));assert.equal(d.getElementById('analyticsAccept').textContent,'Allow analytics');dom.window.close();
});
