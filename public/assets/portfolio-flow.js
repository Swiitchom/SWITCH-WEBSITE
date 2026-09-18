/* Service discovery and project media previews. */
(() => {
 const grid=document.getElementById('svcGrid');
 if(!grid)return;
 const exampleProjects={web:'code',innovation:'helmet'},examples={};
 for(const [key,icon] of Object.entries(exampleProjects)){
  const p=projectsData.find(p=>p.icon===icon&&p.image);
  if(p)examples[key]={image:p.image,ar:p.ar.title,en:p.en.title};
 }
 if(typeof participationPhotos!=='undefined'&&participationPhotos[0])examples.training={image:participationPhotos[0].image,ar:'تدريب عملي من مشاركاتي',en:'Hands-on training from my workshops'};
 let openKey='';

 function decorate(){
  const lang=document.documentElement.lang==='en'?'en':'ar';
  for(const row of grid.querySelectorAll('[data-service]')){
   const key=row.dataset.service,visual=row.querySelector('[data-service-visual]'),example=examples[key];
   if(visual&&example){
    const media=visual.querySelector('.service-inline-media'),caption=visual.querySelector('figcaption');
    if(media&&!media.children.length){
     const img=document.createElement('img');img.src=example.image;img.loading='lazy';img.decoding='async';media.append(img);
    }
    const img=media?.querySelector('img');if(img)img.alt=example[lang];if(caption)caption.textContent=example[lang];
   }
   const expanded=key===openKey;
   row.classList.toggle('is-chosen',expanded);
   const button=row.querySelector('.service-discover'),details=row.querySelector('.package-details');
   if(button)button.setAttribute('aria-expanded',String(expanded));
   if(details)details.setAttribute('aria-hidden',String(!expanded));
  }
 }

 grid.addEventListener('click',event=>{
  const button=event.target.closest('.service-discover');
  if(!button)return;
  const row=button.closest('[data-service]'),key=row?.dataset.service;if(!key)return;
  openKey=openKey===key?'':key;
  decorate();
 });
 new MutationObserver(decorate).observe(grid,{childList:true});
 new MutationObserver(decorate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 decorate();

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
