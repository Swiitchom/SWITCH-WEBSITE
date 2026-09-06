/* Continuous photo ribbon; originals remain keyboard accessible, copies are decorative. */
(() => {
 const grid=document.getElementById('participationGrid');if(!grid)return;
 const track=document.createElement('div');track.className='photo-ribbon-track';
 const sizes=[[720,1280],[720,1280],[717,1150],[1280,852],[960,1280],[828,1451],[720,1280],[720,1280],[720,1280],[851,1280]];
 grid.classList.add('photo-ribbon');
 for(let copy=0;copy<2;copy++){
  const group=document.createElement('div');group.className='photo-ribbon-group';if(copy)group.setAttribute('aria-hidden','true');
  participationPhotos.forEach((photo,i)=>{
   const button=document.createElement('button');button.type='button';button.className='participation-tile';button.dataset.photo=String(i);if(copy)button.tabIndex=-1;
   const img=document.createElement('img');img.src=photo.image;if(sizes[i]){img.width=sizes[i][0];img.height=sizes[i][1];}img.loading='lazy';img.decoding='async';img.draggable=false;
   const caption=document.createElement('span');button.append(img,caption);group.append(button);
  });track.append(group);
 }
 grid.append(track);
 let drag=null,suppressUntil=0;
 const animation=()=>track.getAnimations?.()[0];
 grid.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  drag={x:e.clientX,y:e.clientY,time:Number(animation()?.currentTime)||0,id:e.pointerId,moved:false};
 });
 grid.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return;}if(Math.abs(dx)<8)return;drag.moved=true;grid.setPointerCapture?.(e.pointerId);grid.classList.add('is-dragging');}
  e.preventDefault();
  const a=animation(),width=track.firstElementChild.getBoundingClientRect().width;if(!a||!width)return;
  const duration=Number(a.effect.getTiming().duration),direction=document.documentElement.lang==='en'?-1:1;
  a.currentTime=((drag.time+dx/width*duration*direction)%duration+duration)%duration;
 });
 function release(){if(drag?.moved){suppressUntil=Date.now()+350;if(grid.hasPointerCapture?.(drag.id))grid.releasePointerCapture(drag.id);}drag=null;grid.classList.remove('is-dragging');}
 grid.addEventListener('pointerup',release);grid.addEventListener('pointercancel',release);
 grid.addEventListener('click',e=>{
  const button=e.target.closest('[data-photo]');if(!button)return;
  if(e.detail&&Date.now()<suppressUntil){e.preventDefault();return;}
  const index=Number(button.dataset.photo),photo=participationPhotos[index];
  if(button.closest('[aria-hidden=true]'))track.firstElementChild.children[index].focus({preventScroll:true});
  openLightbox({image:photo.image,ar:photo.ar.title,en:photo.en.title,color:0});
 });
 grid.addEventListener('focusin',e=>{
  if(!e.target.matches(':focus-visible'))return;grid.classList.add('keyboard-browsing');e.target.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});
 });
 grid.addEventListener('focusout',e=>{if(!grid.contains(e.relatedTarget)){grid.classList.remove('keyboard-browsing');grid.scrollLeft=0;}});
 function measure(){const width=track.firstElementChild.getBoundingClientRect().width;if(width)track.style.setProperty('--ribbon-duration',`${width/34}s`);}
 if('ResizeObserver' in window)new ResizeObserver(measure).observe(track.firstElementChild);measure();
 function translate(){
  const lang=document.documentElement.lang==='en'?'en':'ar';
  document.querySelectorAll('[data-layout-ar]').forEach(el=>{el.textContent=el.getAttribute('data-layout-'+lang);});
  grid.querySelectorAll('[data-photo]').forEach(button=>{const title=participationPhotos[Number(button.dataset.photo)][lang].title;button.firstElementChild.alt=title;button.lastElementChild.textContent=title;button.setAttribute('aria-label',(lang==='ar'?'تكبير: ':'Enlarge: ')+title);});measure();
 }
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 function revealAnchor(){const el=document.getElementById(location.hash.slice(1));const details=el?.closest('details');if(details)details.open=true;}
 window.addEventListener('hashchange',revealAnchor);revealAnchor();translate();
})();
