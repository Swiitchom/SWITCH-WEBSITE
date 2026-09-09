const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../public');
function boot(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:4173',runScripts:'outside-only'});const w=dom.window;
 w.matchMedia=()=>({matches:true,addEventListener(){}});w.IntersectionObserver=class{observe(){}unobserve(){}};w.requestAnimationFrame=()=>{};w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}});w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.AbortSignal=AbortSignal;w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 for(const script of w.document.querySelectorAll('script[src]'))require('node:vm').runInContext(fs.readFileSync(path.join(root,script.getAttribute('src').split(/[?#]/)[0]),'utf8'),dom.getInternalVMContext());
 return dom;
}
test('complete page renders both languages, all project filters and the new platform icons',async()=>{
 const dom=boot(),d=dom.window.document;assert.equal(d.querySelectorAll('.proj-card').length,4);
 assert.equal(d.querySelectorAll('.hero-stat').length,0);
 assert.ok(d.querySelector('.proj-card').textContent.includes('معبر المدرسة'));
 d.getElementById('projectsMore').click();assert.equal(d.querySelectorAll('.proj-card').length,10);
 d.querySelector('[data-cat="platform"]').click();assert.equal(d.querySelectorAll('.proj-card').length,4);
 d.getElementById('langBtn').click();assert.equal(d.documentElement.dir,'ltr');assert.ok(d.querySelector('.proj-card').textContent.includes('Interactive School Gateway'));
 d.querySelector('[data-project]').click();assert.ok(d.getElementById('modalOverlay').classList.contains('open'));assert.equal(d.querySelectorAll('#modalContent img').length,2);assert.match(d.querySelector('.project-overview').textContent,/welcome character/);d.getElementById('modalCloseBtn').click();
 await new Promise(resolve=>setImmediate(resolve));dom.window.close();
});
test('service inquiry collects email and phone, preserves failure data, and shows a friendly reference without a WhatsApp handoff',async()=>{
 const dom=boot(),w=dom.window,d=w.document,form=d.getElementById('contactForm');
 assert.equal(d.querySelectorAll('.svc-cta').length,0);assert.equal(d.querySelectorAll('#serviceRequest').length,1);
 d.querySelector('[data-service="training"] .service-select').click();
 d.querySelector('#serviceRequest').click();assert.equal(form.dataset.context,'services');assert.equal(d.getElementById('fService').value,'باقة الورشة التدريبية');
 d.getElementById('fName').value='Test Person';d.getElementById('fPhone').value='+96899999999';d.getElementById('fEmail').value='test@example.com';d.getElementById('fMsg').value='Please arrange a workshop';form.elements.consent.checked=true;
 let calls=0;w.fetch=async()=>{calls++;return {ok:false,status:503};};
 let savedEvents=0,savedService;d.addEventListener('portfolio:inquiry-saved',e=>{savedEvents++;savedService=e.detail.serviceKey;});
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(calls,1);assert.equal(d.querySelector('#fSentMsg a'),null);assert.equal(d.getElementById('fEmail').value,'test@example.com');
 assert.equal(savedEvents,0);
 w.fetch=async(url,opts)=>({ok:true,json:async()=>({id:JSON.parse(opts.body).requestId,reference:'SAL-1001'})});
 form.dispatchEvent(new w.Event('submit',{cancelable:true}));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(d.querySelector('#fSentMsg a'),null);assert.match(d.getElementById('fSentMsg').textContent,/SAL-1001/);assert.equal(d.getElementById('fEmail').value,'');
 assert.equal(savedEvents,1);assert.equal(savedService,'training');
 await new Promise(resolve=>setImmediate(resolve));dom.window.close();
});



test('package choice controls one quote action and survives image previews and language changes',async()=>{
 const dom=boot(),w=dom.window,d=w.document;
 try{
  assert.equal(d.querySelectorAll('.package-card').length,3);
  for(const [key,label] of [['training','باقة الورشة التدريبية'],['web','باقة المنصة التفاعلية'],['innovation','باقة تطوير المشروع التقني']]){
   const button=d.querySelector(`[data-service="${key}"] .service-select`);button.click();
   assert.equal(button.getAttribute('aria-expanded'),'true');assert.equal(d.querySelectorAll('.package-details[aria-hidden="false"]').length,1);
   d.querySelector('#serviceRequest').click();assert.equal(d.querySelector('#fService').value,label);
   assert.equal(d.querySelector('#contactForm').dataset.context,'services');
  }
  d.querySelector('[data-service="training"] .service-select').dispatchEvent(new w.FocusEvent('focusin',{bubbles:true}));
  assert.equal(d.querySelector('#serviceRequest').dataset.serviceKey,'innovation');
  d.querySelector('#langBtn').click();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(d.querySelector('#fService').value,'Technical Project');assert.equal(d.querySelector('[data-service="innovation"] .service-select').getAttribute('aria-expanded'),'true');
 }finally{await new Promise(resolve=>setImmediate(resolve));w.close();}
});
