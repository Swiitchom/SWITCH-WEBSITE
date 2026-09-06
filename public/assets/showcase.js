(() => {
  const grid=document.getElementById('projGrid');
  const hero=document.querySelector('.hero');
  const portrait=document.querySelector('.hero-photo-wrap');
  if(!grid||!hero||!portrait)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width:960px) and (min-height:650px)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  let cards=[],frame=0;
  const cursor=document.createElement('div');cursor.className='project-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  const registered=new WeakSet();
  function hideCursor(){cursor.classList.remove('active');}
  function paint(){
    frame=0;if(reduced.matches||!desktop.matches||document.hidden)return;
    cards.forEach((card,i)=>{
      const next=cards[i+1];
      const approach=next?Math.max(0,Math.min(1,1-(next.getBoundingClientRect().top-90)/(innerHeight*.8))):0;
      card.style.setProperty('--scene-scale',String(1-approach*.055));
      card.style.setProperty('--scene-opacity',String(1-approach*.65));
      card.style.setProperty('--scene-text',`${-approach*35}px`);
    });
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function setup(){
    cards=[...grid.querySelectorAll('.proj-card')];
    cards.forEach((card,i)=>card.style.setProperty('--scene-order',String(i+1)));
    document.querySelectorAll('.hero-actions .btn,.nav-links a,.proj-link,.svc-cta,#projectsMore').forEach(el=>{
      if(registered.has(el))return;registered.add(el);el.classList.add('magnetic');
      el.addEventListener('pointermove',e=>{
        if(reduced.matches||!fine.matches||e.pointerType==='touch')return;
        const r=el.getBoundingClientRect();el.style.setProperty('--magnet-x',`${Math.max(-10,Math.min(10,(e.clientX-r.left-r.width/2)*.15))}px`);el.style.setProperty('--magnet-y',`${Math.max(-8,Math.min(8,(e.clientY-r.top-r.height/2)*.2))}px`);
      },{passive:true});
      const release=()=>{el.style.removeProperty('--magnet-x');el.style.removeProperty('--magnet-y');};
      el.addEventListener('pointerleave',release);el.addEventListener('pointercancel',release);el.addEventListener('blur',release);
    });
    document.documentElement.classList.add('scene-ready');schedule();
  }
  function reset(){['--portrait-x','--portrait-y'].forEach(p=>portrait.style.removeProperty(p));}
  hero.addEventListener('pointermove',e=>{
    if(reduced.matches||!fine.matches||e.pointerType==='touch')return;
    const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    portrait.style.setProperty('--portrait-x',`${x*10}px`);portrait.style.setProperty('--portrait-y',`${y*10}px`);
  },{passive:true});
  hero.addEventListener('pointerleave',reset);hero.addEventListener('pointercancel',reset);
  document.querySelectorAll('.mobile-menu a').forEach((el,i)=>el.style.setProperty('--nav-order',String(i)));
  grid.addEventListener('pointermove',e=>{
    if(reduced.matches||!fine.matches||e.pointerType==='touch')return hideCursor();
    const target=e.target.closest('.project-open');if(!target)return hideCursor();
    cursor.textContent=document.documentElement.lang==='ar'?'استكشف':'Explore';
    cursor.style.transform=`translate(${e.clientX-45}px,${e.clientY-45}px)`;cursor.classList.add('active');
  },{passive:true});
  grid.addEventListener('pointerleave',hideCursor);grid.addEventListener('pointercancel',hideCursor);grid.addEventListener('click',hideCursor);
  grid.addEventListener('focusin',e=>{
    const card=e.target.closest('.proj-card');
    if(card&&desktop.matches&&!reduced.matches&&e.target.matches(':focus-visible')){
      const before=cards.slice(0,cards.indexOf(card)).reduce((height,item)=>height+item.offsetHeight,0);
      window.scrollTo({top:grid.getBoundingClientRect().top+scrollY+before-90,behavior:'instant'});
    }
  });
  new MutationObserver(setup).observe(grid,{childList:true});
  const services=document.getElementById('svcGrid');if(services)new MutationObserver(setup).observe(services,{childList:true});
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',()=>{reset();hideCursor();cards.forEach(c=>['--scene-scale','--scene-opacity','--scene-text'].forEach(p=>c.style.removeProperty(p)));document.querySelectorAll('.magnetic').forEach(el=>{el.style.removeProperty('--magnet-x');el.style.removeProperty('--magnet-y');});schedule();});
  document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('page-away',document.hidden);schedule();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{document.documentElement.classList.toggle('hero-away',!entries[0].isIntersecting);}).observe(hero);
  setup();
})();
