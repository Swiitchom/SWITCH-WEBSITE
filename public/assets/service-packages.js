(() => {
 const section=document.getElementById('services'),grid=document.getElementById('svcGrid');
 if(!section||!grid)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,visible=false,arrival;
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('package-entered');observer.unobserve(entry.target);}});},{threshold:.08}):null;
 function setup(){if(!observer)return;section.classList.add('package-motion-ready');grid.querySelectorAll('.package-card').forEach(card=>observer.observe(card));}
 function paint(){frame=0;if(reduced.matches||!visible||document.hidden)return;const rect=section.getBoundingClientRect(),progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));section.style.setProperty('--package-progress',String(progress));section.style.setProperty('--package-drift',`${(progress-.5)*24}px`);}
 function schedule(){if(!frame&&visible&&!reduced.matches&&!document.hidden)frame=requestAnimationFrame(paint);}
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(section);else visible=true;
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{section.style.removeProperty('--package-drift');section.style.removeProperty('--package-progress');schedule();});
 new MutationObserver(setup).observe(grid,{childList:true});setup();
 document.getElementById('serviceRequest').addEventListener('click',()=>{
  const contact=document.getElementById('contact');clearTimeout(arrival);contact.classList.remove('package-arrival');
  if(reduced.matches)return;arrival=setTimeout(()=>{contact.classList.add('package-arrival');arrival=setTimeout(()=>contact.classList.remove('package-arrival'),1400);},450);
 });
})();
