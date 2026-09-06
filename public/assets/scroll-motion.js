/* Event-driven scroll and pointer motion: no perpetual animation loop. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const visible = new Set();
  const registered = new WeakSet();
  let frame = 0;
  const bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden','true');
  document.body.append(bar);
  function paint(){
    frame=0;
    if(reduce.matches || document.hidden)return;
    const height=window.innerHeight;
    document.documentElement.style.setProperty('--hero-shift',`${Math.min(window.scrollY*.22,100)}px`);
    const range=document.documentElement.scrollHeight-height;
    bar.style.setProperty('--progress',String(range>0?Math.min(1,Math.max(0,window.scrollY/range)):0));
    for(const el of visible){
      if(!el.isConnected){visible.delete(el);continue;}
      const rect=el.getBoundingClientRect();
      const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/height));
      el.style.setProperty('--scroll-drift',`${(progress*90).toFixed(2)}px`);
    }
  }
  function schedule(){if(!frame&&!reduce.matches&&!document.hidden)frame=requestAnimationFrame(paint);}
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);});schedule();
  },{rootMargin:'80px 0px'}):null;
  function reset(el){
    el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg');
    el.style.setProperty('--spot-opacity','0');
  }
  function setup(){
    document.querySelectorAll('.proj-grid,.svc-grid,.wksp-grid').forEach(grid=>{
      [...grid.children].forEach((el,i)=>el.style.setProperty('--reveal-delay',`${(i%3)*100}ms`));
    });
    document.querySelectorAll('.project-open,.svc-card').forEach(el=>{
      if(registered.has(el))return;registered.add(el);observer?.observe(el);
      el.addEventListener('pointermove',e=>{
        if(reduce.matches||!pointer.matches||e.pointerType==='touch')return;
        const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
        const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
        const y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
        el.style.setProperty('--tilt-x',`${((.5-y)*10).toFixed(2)}deg`);
        el.style.setProperty('--tilt-y',`${((x-.5)*10).toFixed(2)}deg`);
        el.style.setProperty('--spot-x',`${x*100}%`);el.style.setProperty('--spot-y',`${y*100}%`);
        el.style.setProperty('--spot-opacity','1');
      },{passive:true});
      el.addEventListener('pointerleave',()=>reset(el));
      el.addEventListener('pointercancel',()=>reset(el));
      el.addEventListener('blur',()=>reset(el));
    });schedule();
  }
  new MutationObserver(setup).observe(document.getElementById('projGrid'),{childList:true});
  new MutationObserver(setup).observe(document.getElementById('svcGrid'),{childList:true});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduce.addEventListener('change',()=>{
    if(frame){cancelAnimationFrame(frame);frame=0;}
    document.querySelectorAll('.project-open,.svc-card').forEach(el=>{reset(el);el.style.setProperty('--scroll-drift','0px');});schedule();
  });
  setup();
})();
