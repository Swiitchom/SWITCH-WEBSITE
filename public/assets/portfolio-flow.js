/* Lightweight inline discovery for services and project stories. */
(() => {
 'use strict';
 const serviceGrid=document.getElementById('svcGrid');
 const projectGrid=document.getElementById('projGrid');
 let openServiceKey='';

 function closeServiceExcept(active){
  if(!serviceGrid)return;
  serviceGrid.querySelectorAll('.package-card').forEach(card=>{
   const open=card===active;
   if(open)openServiceKey=card.dataset.service||'';
   card.classList.toggle('is-chosen',open);
   const button=card.querySelector('.service-discover');
   const details=card.querySelector('.package-details');
   if(button)button.setAttribute('aria-expanded',String(open));
   if(details)details.setAttribute('aria-hidden',String(!open));
  });
 }

 if(serviceGrid){
  serviceGrid.addEventListener('click',event=>{
   const button=event.target.closest('.service-discover');if(!button)return;
   const card=button.closest('.package-card');if(!card)return;
   const wasOpen=button.getAttribute('aria-expanded')==='true';
   if(wasOpen){
    openServiceKey='';
    card.classList.remove('is-chosen');
    button.setAttribute('aria-expanded','false');
    card.querySelector('.package-details')?.setAttribute('aria-hidden','true');
   }else closeServiceExcept(card);
  });
  new MutationObserver(()=>{
   if(!openServiceKey)return;
   const card=serviceGrid.querySelector('[data-service="'+openServiceKey+'"]');
   if(card)closeServiceExcept(card);
  }).observe(serviceGrid,{childList:true});
 }

 function closeProjectExcept(active){
  if(!projectGrid)return;
  projectGrid.querySelectorAll('.project-case').forEach(card=>{
   const open=card===active;
   card.classList.toggle('is-open',open);
   const button=card.querySelector('.project-reveal');
   const details=card.querySelector('.project-details');
   if(button)button.setAttribute('aria-expanded',String(open));
   if(details)details.setAttribute('aria-hidden',String(!open));
   if(!open)card.querySelectorAll('video').forEach(video=>video.pause());
  });
 }

 if(projectGrid){
  projectGrid.addEventListener('click',event=>{
   const button=event.target.closest('.project-reveal');if(!button)return;
   const card=button.closest('.project-case');if(!card)return;
   const wasOpen=button.getAttribute('aria-expanded')==='true';
   if(wasOpen){
    card.classList.remove('is-open');
    button.setAttribute('aria-expanded','false');
    card.querySelector('.project-details')?.setAttribute('aria-hidden','true');
    card.querySelectorAll('video').forEach(video=>video.pause());
   }else closeProjectExcept(card);
  });
 }

 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  closeServiceExcept(null);closeProjectExcept(null);
 });
})();
