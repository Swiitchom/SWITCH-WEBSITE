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

/* Keep the blog visible from the main site navigation. */
(() => {
  const addBlogLink=(menu)=>{
    if(!menu || menu.querySelector('a[href="/blog/"]')) return;
    const link=document.createElement('a');
    link.href='/blog/';
    link.textContent=document.documentElement.lang==='en'?'Blog':'المدونة';
    link.setAttribute('data-layout-ar','المدونة');
    link.setAttribute('data-layout-en','Blog');
    const contact=menu.querySelector('a[href="#contact"]');
    menu.insertBefore(link,contact||null);
  };
  addBlogLink(document.querySelector('.nav-links'));
  addBlogLink(document.querySelector('.mobile-menu'));
})();

/* Latest articles on the homepage. Cards are read from /blog/ so new posts appear automatically. */
(() => {
  const style=document.createElement('style');
  style.textContent=`
    .home-blog{padding:96px 0;border-top:1px solid var(--line-soft);border-bottom:1px solid var(--line-soft);background:linear-gradient(180deg,rgba(255,255,255,.01),rgba(63,224,208,.025));}
    .home-blog-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:38px;}
    .home-blog-head h2{font-size:clamp(30px,4vw,44px);margin:0;}
    .home-blog-head p{color:var(--text-muted);max-width:520px;margin-top:12px;}
    .home-blog-all{font-size:14px;color:var(--signal);white-space:nowrap;}
    .home-blog-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));}
    .home-blog-card{display:block;padding:24px;border:1px solid var(--line-soft);border-radius:var(--radius);background:var(--surface);transition:.3s var(--ease);min-height:210px;}
    .home-blog-card:hover{transform:translateY(-4px);border-color:var(--signal-dim);background:var(--surface-2);}
    .home-blog-meta{font-family:var(--font-mono);font-size:11px;color:var(--signal);margin-bottom:14px;direction:ltr;text-align:start;}
    .home-blog-card h3{font-size:24px;line-height:1.45;margin:0 0 12px;}
    .home-blog-card p{color:var(--text-muted);font-size:14.5px;line-height:1.8;margin:0;}
    @media(max-width:720px){.home-blog{padding:72px 0}.home-blog-head{display:block}.home-blog-all{display:inline-block;margin-top:18px}}
  `;
  document.head.append(style);

  const render=async()=>{
    const footer=document.querySelector('footer');
    if(!footer || document.querySelector('.home-blog'))return;
    try{
      const res=await fetch('/blog/',{credentials:'same-origin'});
      if(!res.ok)return;
      const html=await res.text();
      const parsed=new DOMParser().parseFromString(html,'text/html');
      const cards=[...parsed.querySelectorAll('.post-card')];
      if(!cards.length)return;
      const section=document.createElement('section');
      section.className='home-blog';
      section.innerHTML=`<div class="container"><div class="home-blog-head"><div><div class="eyebrow" data-layout-ar="المدونة" data-layout-en="Blog">المدونة</div><h2 data-layout-ar="أحدث المقالات" data-layout-en="Latest articles">أحدث المقالات</h2><p data-layout-ar="ملاحظات وتجارب من التقنية والابتكار والذكاء الاصطناعي، مكتوبة من واقع العمل والتجربة." data-layout-en="Notes and lessons from technology, innovation and AI, written from hands-on experience.">ملاحظات وتجارب من التقنية والابتكار والذكاء الاصطناعي، مكتوبة من واقع العمل والتجربة.</p></div><a class="home-blog-all" href="/blog/" data-layout-ar="عرض كل المقالات ↗" data-layout-en="View all articles ↗">عرض كل المقالات ↗</a></div><div class="home-blog-grid"></div></div>`;
      const grid=section.querySelector('.home-blog-grid');
      cards.slice(0,6).forEach(card=>{
        const a=document.createElement('a');
        a.className='home-blog-card';
        a.href=card.getAttribute('href');
        const meta=card.querySelector('.post-meta')?.textContent?.trim()||'';
        const title=card.querySelector('h2')?.textContent?.trim()||'';
        const desc=card.querySelector('p')?.textContent?.trim()||'';
        a.innerHTML=`<div class="home-blog-meta"></div><h3></h3><p></p>`;
        a.querySelector('.home-blog-meta').textContent=meta;
        a.querySelector('h3').textContent=title;
        a.querySelector('p').textContent=desc;
        grid.append(a);
      });
      footer.before(section);
    }catch{}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
