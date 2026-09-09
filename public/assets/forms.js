function whatsappURL(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
async function saveInquiry(payload,fetcher=fetch){
 const response=await fetcher('/api/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Save failed: ${response.status}`);
 const result=await response.json();if(result.id!==payload.requestId)throw new Error('Invalid receipt');return result;
}
function inquiryServiceKey(payload){
 if(payload.kind==='store')return 'arduino_kit';
 const workshop=workshopsData.find(w=>w.ar.title===payload.service||w.en.title===payload.service);
 if(workshop)return 'workshop_'+({ai:'ai',iot:'iot',cube:'3d'})[workshop.icon];
 return servicesData.find(s=>s.ar===payload.service||s.en===payload.service)?.visual||'general';
}
function inquiryPayload(form){
 const data=new FormData(form),store=form.id==='storeForm';
 const phone=String(data.get('phone')||'').replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-1632)).trim();
 const payload={requestId:form.dataset.requestId||(form.dataset.requestId=crypto.randomUUID()),name:String(data.get('name')||'').trim(),phone,email:String(data.get('email')||'').trim(),service:store?'Arduino Kit':String(data.get('service')||''),context:store?'store':(form.dataset.context||'contact'),kind:store?'store':'contact',message:String(data.get(store?'notes':'message')||'').trim(),consent:data.get('consent')==='on',language:currentLang,website:String(data.get(store?'bot-field-store':'bot-field')||'')};
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
// Delegated handlers survive language-driven re-rendering of service cards.
document.addEventListener('click',event=>{
 const link=event.target.closest('#serviceRequest,.wksp-card .proj-link');if(!link)return;
 const form=document.getElementById('contactForm'),isService=link.id==='serviceRequest';
 const service=servicesData.find(s=>s.visual===link.dataset.serviceKey);
 const title=isService?(service?.[currentLang]||(currentLang==='ar'?'استفسار عام':'General inquiry')):link.closest('.wksp-card').querySelector('h4').textContent;const select=document.getElementById('fService');
 if(![...select.options].some(o=>o.value===title))select.add(new Option(title,title));select.value=title;
 form.dataset.context=isService?'services':'workshops';delete form.dataset.requestId;
 select.dispatchEvent(new Event('change',{bubbles:true}));
 document.getElementById('fName').focus({preventScroll:true});
});
