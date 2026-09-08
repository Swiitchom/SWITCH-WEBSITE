/* GA4 uses consented activity only. Customer contact data stays in Firestore. */
(() => {
 'use strict';
 const measurementId = 'G-RSGND37FQ5';
 const storageKey = 'salim.analytics-consent.v1';
 const production = location.hostname === 'salimalabri.pages.dev';
 let choice = null, started = false;
 try { const saved=JSON.parse(localStorage.getItem(storageKey)); if(saved && Date.now()-saved.at<180*86400000 && ['granted','denied'].includes(saved.value))choice=saved.value; } catch {}
 const banner=document.getElementById('analyticsConsent');
 const preferences=document.getElementById('analyticsPreferences');
 const copy={
  ar:{title:'تجربة أفضل، باختيارك',text:'نستخدم إحصاءات اختيارية لفهم زيارة الموقع وتحسين خدماته. يمكنك الرفض ومتابعة التصفح وطلب الخدمات.',accept:'السماح بالإحصاءات',reject:'المتابعة دون إحصاءات',preferences:'تفضيلات الخصوصية'},
  en:{title:'A better experience, your choice',text:'Optional analytics help us understand visits and improve our services. You can decline and still browse or request any service.',accept:'Allow analytics',reject:'Continue without analytics',preferences:'Privacy preferences'}
 };
 function translate(){const t=copy[document.documentElement.lang==='en'?'en':'ar'];for(const el of document.querySelectorAll('[data-analytics-copy]'))el.textContent=t[el.dataset.analyticsCopy];}
 function command(){window.dataLayer.push(arguments);}
 function start(){
  if(!production || choice!=='granted')return;
  window[`ga-disable-${measurementId}`]=false;
  if(started){command('consent','update',{analytics_storage:'granted'});return;}
  started=true;window.dataLayer=window.dataLayer||[];window.gtag=command;
  command('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  command('consent','update',{analytics_storage:'granted'});
  command('js',new Date());
  let referrer='';try{if(document.referrer)referrer=new URL(document.referrer).origin;}catch{}
  // Do not send query strings, fragments, form text, email addresses, or phone numbers.
  command('config',measurementId,{send_page_view:false,page_location:location.origin+'/',page_referrer:referrer,allow_google_signals:false,allow_ad_personalization_signals:false});
  command('event','page_view',{page_title:'Salim Alabri | Switch',page_location:location.origin+'/',page_referrer:referrer});
  const script=document.createElement('script');script.id='portfolioGoogleTag';script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;document.head.append(script);
 }
 function stop(){
  window[`ga-disable-${measurementId}`]=true;
  if(started)command('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  for(const cookie of document.cookie.split(';')){
   const name=cookie.trim().split('=')[0];if(!/^_ga(?:_|$)/.test(name))continue;
   const expired=`${name}=; Max-Age=0; Path=/; SameSite=Lax`;
   document.cookie=expired;document.cookie=`${expired}; Domain=${location.hostname}`;document.cookie=`${expired}; Domain=.${location.hostname}`;
  }
 }
 function choose(value){
  choice=value;try{localStorage.setItem(storageKey,JSON.stringify({value,at:Date.now()}));}catch{}
  value==='granted'?start():stop();banner.hidden=true;
  if(banner.contains(document.activeElement))preferences.focus({preventScroll:true});
 }
 document.getElementById('analyticsAccept').addEventListener('click',()=>choose('granted'));
 document.getElementById('analyticsReject').addEventListener('click',()=>choose('denied'));
 preferences.addEventListener('click',()=>{banner.hidden=false;document.getElementById('analyticsReject').focus({preventScroll:true});});
 function event(name,params){if(production&&started&&choice==='granted')command('event',name,params);}
 document.addEventListener('portfolio:inquiry-saved',e=>{
  const form=e.detail?.kind==='store'?'store':'contact';
  const source=['services','workshops','contact','store'].includes(e.detail?.context)?e.detail.context:'contact';
  const allowed=['ai','electronics','arduino','web','3d','innovation','training','workshop_ai','workshop_iot','workshop_3d','arduino_kit'];
  const service=allowed.includes(e.detail?.serviceKey)?e.detail.serviceKey:'general';
  event('generate_lead',{form_name:form,lead_source:source,service_key:service});
 });
 window.addEventListener('storage',e=>{if(e.key!==storageKey)return;let value;try{value=JSON.parse(e.newValue)?.value;}catch{}choice=value==='granted'?'granted':'denied';choice==='granted'?start():stop();banner.hidden=true;});
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 translate();banner.hidden=choice!==null;if(choice==='granted')start();else stop();
})();
