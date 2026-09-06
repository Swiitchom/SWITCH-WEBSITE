function whatsappURL(message){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;}
async function saveInquiry(payload,fetcher=fetch){
 const response=await fetcher('/.netlify/functions/inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error(`Save failed: ${response.status}`);
 const result=await response.json();if(result.id!==payload.requestId)throw new Error('Invalid receipt');return result;
}
function inquiryPayload(form){
 const data=new FormData(form),store=form.id==='storeForm';
 const phone=String(data.get('phone')||'').replace(/[٠-٩]/g,x=>String(x.charCodeAt(0)-1632)).trim();
 const payload={requestId:form.dataset.requestId||(form.dataset.requestId=crypto.randomUUID()),name:String(data.get('name')||'').trim(),phone,email:String(data.get('email')||'').trim(),service:store?'Arduino Kit':String(data.get('service')||''),context:store?'store':(form.dataset.context||'contact'),kind:store?'store':'contact',message:String(data.get(store?'notes':'message')||'').trim(),consent:data.get('consent')==='on',website:String(data.get(store?'bot-field-store':'bot-field')||'')};
 if(store){payload.quantity=Number(data.get('quantity'));payload.addWorkshop=document.getElementById('storeAddWorkshop').checked;if(!payload.message)payload.message=currentLang==='ar'?'طلب كت الأردوينو':'Arduino kit order';}
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
   await saveInquiry(payload);
   status.textContent=ar?'تم حفظ طلبك. يمكنك الآن متابعة المحادثة عبر واتساب.':'Your inquiry was saved. You can now continue on WhatsApp.';
   const message=ar?`مرحبًا سالم، طلب بخصوص: ${payload.service}\nالاسم: ${payload.name}\nالهاتف: ${payload.phone}\nالبريد: ${payload.email}\nالاستفسار: ${payload.message}\nمرجع الطلب: ${payload.requestId}`:`Hi Salim, inquiry about: ${payload.service}\nName: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email}\nInquiry: ${payload.message}\nReference: ${payload.requestId}`;
   const link=document.createElement('a');link.href=whatsappURL(message);link.target='_blank';link.rel='noopener noreferrer';link.className='btn btn-primary';link.textContent=ar?'متابعة عبر واتساب':'Continue on WhatsApp';status.append(document.createElement('br'),link);
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
 document.getElementById('fName').focus({preventScroll:true});
});
