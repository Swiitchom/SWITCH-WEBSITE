function whatsappURL(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
async function saveInquiry(payload,fetcher=fetch){
 const response=await fetcher('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Save failed: ${response.status}`);
 const result=await response.json();if(result.id!==payload.requestId)throw new Error('Invalid receipt');return result;
}
function inquiryServiceKey(payload){
 if(payload.kind==='store')return 'arduino_kit';
 if(payload.serviceKey)return payload.serviceKey;
 const workshop=workshopsData.find(w=>w.ar.title===payload.service||w.en.title===payload.service);
 if(workshop)return 'workshop_'+({ai:'ai',iot:'iot',cube:'3d'})[workshop.icon];
 return servicesData.find(s=>s.ar===payload.service||s.en===payload.service)?.visual||'general';
}
function inquiryPayload(form){
 const data=new FormData(form),store=form.id==='storeForm';
 const phone=String(data.get('phone')||'').replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-1632)).trim();
 const payload={requestId:form.dataset.requestId||(form.dataset.requestId=crypto.randomUUID()),name:String(data.get('name')||'').trim(),phone,email:String(data.get('email')||'').trim(),service:store?'Arduino Kit':String(data.get('service')||''),serviceKey:store?'arduino_kit':(form.dataset.selectedServiceKey||''),context:store?'store':(form.dataset.context||'contact'),kind:store?'store':'contact',message:String(data.get(store?'notes':'message')||'').trim(),consent:data.get('consent')==='on',marketingConsent:data.get('marketingConsent')==='on',language:currentLang,website:String(data.get(store?'bot-field-store':'bot-field')||'')};
 if(store){payload.quantity=Number(data.get('quantity'));payload.addWorkshop=document.getElementById('storeAddWorkshop').checked;if(!payload.message)payload.message=currentLang==='ar'?'طلب كت الأردوينو':'Arduino kit order';}
 if(!store)Object.assign(payload,window.portfolioBrief?.collect()||{});
 return payload;
}
for(const id of ['contactForm','storeForm']){
 const form=document.getElementById(id);
 form.addEventListener('input',()=>{if(!form.dataset.submitting)delete form.dataset.requestId;});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(form.dataset.submitting||!form.reportValidity())return;
  const payload=inquiryPayload(form);if(payload.website)return;
  const ar=currentLang==='ar',status=document.getElementById(id==='storeForm'?'storeSentMsg':'fSentMsg');
  status.replaceChildren();status.style.display='block';status.textContent=ar?'جارٍ إرسال طلبك…':'Sending your inquiry…';
  const controls=[...form.elements].filter(el=>!el.disabled);controls.forEach(el=>el.disabled=true);form.dataset.submitting='true';
  try{
   const receipt=await saveInquiry(payload);
   document.dispatchEvent(new CustomEvent('portfolio:inquiry-saved',{detail:{kind:payload.kind,context:payload.context,serviceKey:inquiryServiceKey(payload)}}));
   status.textContent=ar?'تم استلام طلبك وهو قيد المراجعة. سنتواصل معك عبر بيانات التواصل المرفقة.':'Your request was received and is under review. I will contact you using the details provided.';
   if(receipt.reference){const reference=document.createElement('strong');reference.dir='ltr';reference.textContent=receipt.reference;status.append(document.createElement('br'),document.createTextNode(ar?'مرجع طلبك: ':'Your reference: '),reference);}
   form.reset();delete form.dataset.requestId;if(id==='storeForm')updateStoreTotal();
  }catch{
   status.textContent=ar?'تعذّر إرسال الطلب الآن. احتفظنا ببياناتك هنا؛ يرجى إعادة المحاولة لاحقًا.':'Unable to send right now. Your entries are preserved; please try again later.';
  }finally{controls.forEach(el=>el.disabled=false);delete form.dataset.submitting;}
 });
}
// Delegated handlers survive language-driven re-rendering of the service catalogue.
document.addEventListener('click',event=>{
 const link=event.target.closest('.service-offer-request,.service-hub-request,.service-start,#projectQuickRequest,.wksp-card .proj-link');if(!link)return;
 const form=document.getElementById('contactForm');if(form.dataset.submitting)return;
 const select=document.getElementById('fService');
 const serviceKey=link.dataset.serviceKey||link.closest('[data-service]')?.dataset.service||'general';
 const service=servicesData.find(s=>s.visual===serviceKey);
 const workshopCard=link.closest('.wksp-card');
 const titleAr=link.dataset.titleAr||service?.ar||workshopCard?.querySelector('h4')?.textContent||'استفسار عام';
 const titleEn=link.dataset.titleEn||service?.en||workshopCard?.querySelector('h4')?.textContent||'General inquiry';
 const title=currentLang==='ar'?titleAr:titleEn;

 if(![...select.options].some(o=>o.value===title))select.add(new Option(title,title));
 select.value=title;
 form.dataset.context=serviceKey==='training'?'workshops':'services';
 form.dataset.selectedService=title;
 form.dataset.selectedServiceKey=serviceKey;
 form.dataset.selectedServiceTitleAr=titleAr;
 form.dataset.selectedServiceTitleEn=titleEn;
 delete form.dataset.requestId;
 select.closest('.field').hidden=true;
 let summary=document.getElementById('selectedServiceSummary');
 if(!summary){summary=document.createElement('p');summary.id='selectedServiceSummary';form.prepend(summary);}
 summary.textContent=title;
 select.dispatchEvent(new Event('change',{bubbles:true}));
 document.getElementById('contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
 setTimeout(()=>document.getElementById('fName').focus({preventScroll:true}),250);
});
(()=>{if(typeof MutationObserver==='undefined')return;const form=document.getElementById('contactForm'),select=document.getElementById('fService');new MutationObserver(()=>{if(!form.dataset.selectedServiceKey)return;const translated=currentLang==='ar'?form.dataset.selectedServiceTitleAr:form.dataset.selectedServiceTitleEn;if(translated){if(![...select.options].some(o=>o.value===translated))select.add(new Option(translated,translated));select.value=translated;form.dataset.selectedService=translated;const summary=document.getElementById('selectedServiceSummary');if(summary)summary.textContent=translated;}}).observe(select,{childList:true});form.addEventListener('reset',()=>{const translated=currentLang==='ar'?form.dataset.selectedServiceTitleAr:form.dataset.selectedServiceTitleEn;if(translated)setTimeout(()=>{select.value=translated;select.dispatchEvent(new Event('change',{bubbles:true}));},0);});})();
