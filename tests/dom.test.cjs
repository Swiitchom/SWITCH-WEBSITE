const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../public');
function boot(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:4173',runScripts:'outside-only'});const w=dom.window;
 w.matchMedia=()=>({matches:true,addEventListener(){}});w.IntersectionObserver=class{observe(){}unobserve(){}};w.requestAnimationFrame=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}});w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.AbortSignal=AbortSignal;w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 for(const script of w.document.querySelectorAll('script[src]'))require('node:vm').runInContext(fs.readFileSync(path.join(root,script.getAttribute('src').split(/[?#]/)[0]),'utf8'),dom.getInternalVMContext());
 return dom;
}
test('homepage exposes one clear three-path service catalogue without duplicate project or workshop sections',async()=>{
 const dom=boot(),d=dom.window.document;
 assert.equal(d.querySelectorAll('.service-hub-tab').length,3);
 assert.equal(d.querySelectorAll('.service-hub-tab.is-active').length,1);
 assert.match(d.querySelector('.service-hub-panel h3').textContent,/الورش/);
 assert.equal(d.querySelectorAll('.service-offer').length,3);
 assert.equal(d.querySelectorAll('#projects').length,0);
 assert.equal(d.querySelectorAll('#more-workshops').length,0);
 d.querySelector('[data-service-hub="web"]').click();
 assert.match(d.querySelector('.service-hub-panel h3').textContent,/المنصات/);
 assert.equal(d.querySelectorAll('.service-offer').length,3);
 assert.ok(d.querySelector('.service-hub-panel').textContent.includes('استقبال الطلاب'));
 assert.ok(d.querySelector('.service-hub-panel').textContent.includes('مساحة أُنس'));
 assert.ok(d.querySelector('.service-hub-panel').textContent.includes('إشارات اليد'));
 d.querySelector('[data-service-hub="innovation"]').click();
 assert.match(d.querySelector('.service-hub-panel h3').textContent,/المشاريع/);
 assert.equal(d.querySelectorAll('.service-offer').length,3);
 assert.ok(d.querySelector('.service-hub-panel').textContent.includes('الخوذة'));
 d.getElementById('langBtn').click();
 assert.equal(d.documentElement.dir,'ltr');
 assert.match(d.querySelector('.service-hub-panel h3').textContent,/Technical Project/);
 await new Promise(resolve=>setImmediate(resolve));dom.window.close();
});
test('direct workshop request keeps the exact offer and service family through submission',async()=>{
 const dom=boot(),w=dom.window,d=w.document,form=d.getElementById('contactForm');
 const request=d.querySelector('.service-offer .service-offer-request');request.click();
 assert.equal(form.dataset.context,'workshops');
 assert.equal(form.dataset.selectedServiceKey,'training');
 assert.equal(d.getElementById('fService').value,'ورشة أساسيات الذكاء الاصطناعي');
 d.getElementById('fName').value='Test Person';d.getElementById('fPhone').value='+96899999999';d.getElementById('fEmail').value='test@example.com';d.getElementById('fMsg').value='Please arrange a workshop';form.elements.consent.checked=true;
 let calls=0;w.fetch=async url=>{if(String(url)==='/api/inquiry'){calls++;return {ok:false,status:503};}return {ok:false,status:404,text:async()=>''};};
 let savedEvents=0,savedService;d.addEventListener('portfolio:inquiry-saved',e=>{savedEvents++;savedService=e.detail.serviceKey;});
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(calls,1);assert.equal(d.getElementById('fEmail').value,'test@example.com');assert.equal(savedEvents,0);
 w.fetch=async(url,opts)=>String(url)==='/api/inquiry'?({ok:true,json:async()=>({id:JSON.parse(opts.body).requestId,reference:'SAL-1001'})}):({ok:false,status:404,text:async()=>''});
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.match(d.getElementById('fSentMsg').textContent,/SAL-1001/);assert.equal(savedEvents,1);assert.equal(savedService,'training');
 await new Promise(resolve=>setImmediate(resolve));dom.window.close();
});
test('service tabs switch one catalogue in place and direct requests survive language changes',async()=>{
 const dom=boot(),w=dom.window,d=w.document,form=d.getElementById('contactForm');
 try{
  assert.equal(d.querySelectorAll('.expertise-pill').length,8);
  for(const [key,pattern] of [['training',/الورش/],['web',/المنصات/],['innovation',/المشاريع/]]){
   d.querySelector(`[data-service-hub="${key}"]`).click();
   assert.match(d.querySelector('.service-hub-panel h3').textContent,pattern);
   assert.equal(d.querySelectorAll('.service-offer').length,3);
   d.querySelector('.service-offer-request.is-primary').click();
   assert.equal(form.dataset.selectedServiceKey,key);
  }
  assert.equal(d.querySelector('#fService').value,'تطوير المشاريع والنماذج التقنية');
  d.querySelector('#langBtn').click();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(d.querySelector('#fService').value,'Technical Project & Prototype Development');
  assert.equal(d.querySelector('[data-service-hub="innovation"]').classList.contains('is-active'),true);
 }finally{await new Promise(resolve=>setImmediate(resolve));w.close();}
});
test('guided quote preserves separate package drafts, language and failed sends, then clears after success',async()=>{
 const dom=boot(),w=dom.window,d=w.document,form=d.querySelector('#contactForm');
 const set=(id,value)=>{const input=d.getElementById(id);input.value=value;input.dispatchEvent(new w.Event('input',{bubbles:true}));};
 const choose=key=>{d.querySelector(`[data-service-hub="${key}"]`).click();d.querySelector('.service-offer-request.is-primary').click();};
 try{
  choose('training');set('brief-topic','ESP32');d.querySelector('.brief-toggle').click();set('brief-participants','25');set('brief-location','مسقط');set('brief-date','2026-10-10');
  choose('web');set('brief-organization','مدرسة');assert.equal(d.querySelector('#brief-topic'),null);assert.equal(w.portfolioBrief.collect().packageKey,'web');
  choose('training');assert.equal(d.querySelector('#brief-topic').value,'ESP32');assert.equal(d.querySelector('#brief-participants').value,'25');
  d.querySelector('#langBtn').click();await new Promise(resolve=>setImmediate(resolve));assert.equal(d.querySelector('#brief-topic').value,'ESP32');assert.equal(d.querySelector('#fService').value,'Technical Workshops & Training');
  set('fName','Test Client');set('fPhone','+96899999999');set('fEmail','test@example.invalid');set('fMsg','Workshop inquiry');form.elements.consent.checked=true;
  let submitted;w.fetch=async(url,opts)=>{submitted=JSON.parse(opts.body);return {ok:false,status:503};};
  form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));assert.equal(submitted.packageKey,'training');assert.equal(JSON.parse(submitted.briefJson).participants,'25');assert.equal(d.querySelector('#brief-topic').value,'ESP32');
  w.fetch=async(url,opts)=>({ok:true,json:async()=>({id:JSON.parse(opts.body).requestId,reference:'SAL-TEST'})});form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setTimeout(resolve,20));assert.equal(d.querySelector('#brief-topic').value,'');
 }finally{await new Promise(resolve=>setImmediate(resolve));w.close();}
});
