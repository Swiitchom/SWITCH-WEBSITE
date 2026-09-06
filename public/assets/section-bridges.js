/* Decorative only: share the existing icon family, animate while visible. */
(()=>{
 const entries=[['#projects','chip'],['#services','iot'],['#contact','code']];
 const atmosphere=document.createElement('div');atmosphere.className='vertical-atmosphere';atmosphere.setAttribute('aria-hidden','true');atmosphere.innerHTML='<span class="vertical-trace"></span><span class="vertical-trace"></span>';document.querySelector('main').prepend(atmosphere);
 const observer='IntersectionObserver' in window?new IntersectionObserver(items=>items.forEach(item=>item.target.classList.toggle('in-view',item.isIntersecting))):null;
 for(const [selector,icon] of entries){
  const section=document.querySelector(selector);if(!section)continue;
  const bridge=document.createElement('div');bridge.className='section-bridge';bridge.setAttribute('aria-hidden','true');
  const route='M20 18 H210 Q222 18 232 28 L246 42 Q256 52 268 52 H432 M488 52 H652 Q664 52 674 62 L688 76 Q698 86 710 86 H900';
  bridge.innerHTML=`<svg class="bridge-lines" viewBox="0 0 920 104" fill="none"><path class="bridge-track" d="${route}"/><path class="bridge-pulse" d="${route}"/><circle class="bridge-dot" cx="210" cy="18" r="2.5"/><circle class="bridge-dot" cx="710" cy="86" r="2.5"/></svg><span class="bridge-symbol">${ICON[icon]}</span>`;
  section.before(bridge);if(observer)observer.observe(bridge);else bridge.classList.add('in-view');
 }
})();
