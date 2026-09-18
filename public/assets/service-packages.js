(() => {
 const section=document.getElementById('services'),grid=document.getElementById('svcGrid');
 if(!section||!grid)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('package-entered');observer.unobserve(entry.target);}});},{threshold:.08}):null;
 function setup(){if(!observer)return;section.classList.add('package-motion-ready');grid.querySelectorAll('.package-card').forEach(card=>observer.observe(card));}
 new MutationObserver(setup).observe(grid,{childList:true});setup();
 let arrival;
 grid.addEventListener('click',event=>{
  const start=event.target.closest('.service-start');if(!start)return;
  const contact=document.getElementById('contact');clearTimeout(arrival);contact.classList.remove('package-arrival');
  if(reduced.matches)return;
  arrival=setTimeout(()=>{contact.classList.add('package-arrival');arrival=setTimeout(()=>contact.classList.remove('package-arrival'),1400);},450);
 });
})();