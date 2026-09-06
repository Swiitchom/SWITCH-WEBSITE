/* Automatic previews change only media; inquiry links keep their own service context. */
(() => {
 const grid=document.getElementById('svcGrid'),media=document.getElementById('servicePreviewMedia'),caption=document.getElementById('serviceExampleTitle');
 if(!grid||!media||!caption)return;
 const exampleProjects={ai:'ai',electronics:'iot',web:'code',innovation:'helmet'};
 const examples={};
 for(const [key,icon] of Object.entries(exampleProjects)){
  const p=projectsData.find(p=>p.icon===icon&&p.image);if(p)examples[key]={image:p.image,ar:p.ar.title,en:p.en.title};
 }
 examples['3d']={image:'assets/images/946660627de17fc8.webp',ar:'طابعة ثلاثية الأبعاد DIY',en:'DIY 3D Printer'};
 examples.arduino={image:'assets/images/848ddff4bf96384f.jpg',ar:'روبوت تجنب العوائق',en:'Obstacle-Avoidance Robot'};
 examples.training={image:participationPhotos[0].image,ar:'تدريب عملي من مشاركاتي',en:'Hands-on training from my workshops'};
 let selected='ai',rows=[],timer=null,visible=false;
 const request=document.getElementById('serviceRequest'),requestLabel=document.getElementById('serviceRequestSelection');
 function renderRequest(){const item=servicesData.find(s=>s.visual===request.dataset.serviceKey);if(item){requestLabel.removeAttribute('data-layout-ar');requestLabel.removeAttribute('data-layout-en');requestLabel.textContent=(currentLang==='ar'?'الخدمة المختارة: ':'Selected service: ')+item[currentLang];}}
 function choose(key){
  if(!examples[key])return;selected=key;const lang=document.documentElement.lang==='en'?'en':'ar';caption.textContent=examples[key][lang];
  const label=servicesData.find(service=>service.visual===key);document.querySelector('.service-preview-kicker').textContent=label?.[lang]||'';
  rows.forEach(row=>{const active=row.dataset.service===key;row.classList.toggle('is-previewed',active);row.querySelector('.service-select').setAttribute('aria-pressed',String(row.dataset.service===request.dataset.serviceKey));});
  media.querySelectorAll('img').forEach(img=>{const active=img.dataset.service===key;img.classList.toggle('is-active',active);img.setAttribute('aria-hidden',String(!active));});
 }
 function stop(){clearTimeout(timer);timer=null;}
 function schedule(delay=5600){
  stop();if(!visible||document.hidden||grid.contains(document.activeElement))return;
  timer=setTimeout(()=>{const keys=rows.map(r=>r.dataset.service);choose(keys[(keys.indexOf(selected)+1)%keys.length]);schedule();},delay);
 }
 function setup(){
  rows=[...grid.querySelectorAll('[data-service]')];
  if(!media.children.length)for(const [key,p] of Object.entries(examples)){
   const img=document.createElement('img');img.src=p.image;img.dataset.service=key;img.loading='lazy';img.decoding='async';media.append(img);
  }
  media.querySelectorAll('img').forEach(img=>{img.alt=examples[img.dataset.service][document.documentElement.lang==='en'?'en':'ar'];});
  choose(selected);renderRequest();schedule();
 }
 grid.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const row=e.target.closest('[data-service]');if(row&&!row.contains(e.relatedTarget)){choose(row.dataset.service);schedule(8000);}});
 grid.addEventListener('focusin',e=>{const row=e.target.closest('[data-service]');if(row)choose(row.dataset.service);stop();});
 grid.addEventListener('focusout',()=>{setTimeout(()=>schedule(),0);});
 grid.addEventListener('click',e=>{const row=e.target.closest('[data-service]');if(row){request.dataset.serviceKey=row.dataset.service;choose(row.dataset.service);renderRequest();}});
 new MutationObserver(setup).observe(grid,{childList:true});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(document.getElementById('servicePreview'));
 else{visible=true;}
 document.addEventListener('visibilitychange',()=>schedule());setup();

 const projectGrid=document.getElementById('projGrid'),sequences=new Map();
 function setupSequences(){
  for(const [el,state] of sequences)if(!el.isConnected){clearInterval(state.timer);sequences.delete(el);}
  projectGrid.querySelectorAll('.project-open').forEach(button=>{
   if(sequences.has(button))return;const p=projectsData[Number(button.dataset.project)];if(!p?.screenshot||!p.gallery?.length)return;
   const box=button.querySelector('.proj-media');box.classList.add('platform-sequence');box.firstElementChild.classList.add('is-active');
   for(const picture of p.gallery){const img=document.createElement('img');img.src=picture.image;img.alt='';img.setAttribute('aria-hidden','true');img.loading='lazy';img.decoding='async';box.append(img);}
   const control=document.createElement('button');control.type='button';control.className='platform-preview-arrow';control.innerHTML=ICON.arrow;
   control.setAttribute('aria-label',currentLang==='ar'?'معاينة صور '+p.ar.title:'Preview images of '+p.en.title);control.setAttribute('aria-pressed','false');
   button.closest('.proj-card').querySelector('.proj-body').append(control);
   const state={images:[...box.querySelectorAll('img')],index:0,timer:null,touch:false,active:false,control};
   const show=index=>{state.index=index;state.images.forEach((img,i)=>img.classList.toggle('is-active',i===index));};
   const stop=()=>{clearInterval(state.timer);state.timer=null;state.active=false;control.setAttribute('aria-pressed','false');show(0);};
   const start=()=>{clearInterval(state.timer);state.active=true;control.setAttribute('aria-pressed','true');show(1);if(state.images.length>2)state.timer=setInterval(()=>{if(!document.hidden)show(1+state.index%(state.images.length-1));},2600);};
   control.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')start();});
   control.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')stop();});
   control.addEventListener('focus',()=>{if(control.matches(':focus-visible'))start();});
   control.addEventListener('blur',stop);
   control.addEventListener('pointerdown',e=>{state.touch=e.pointerType==='touch';});
   control.addEventListener('click',()=>{if(state.touch&&state.active)stop();else start();});
   control.addEventListener('keydown',e=>{if(e.key==='Escape')stop();});
   state.stop=stop;sequences.set(button,state);
  });
 }
 document.addEventListener('pointerdown',e=>{for(const state of sequences.values())if(!state.control.contains(e.target))state.stop();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const state of sequences.values())state.stop();});
 new MutationObserver(setupSequences).observe(projectGrid,{childList:true});setupSequences();
})();
