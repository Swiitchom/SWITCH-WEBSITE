/* One continuous participation path: unique photos only, auto-moving, draggable and accessible. */
(() => {
 const grid=document.getElementById('participationGrid');if(!grid)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const sizes=[[720,1280],[720,1280],[717,1150],[1280,852],[960,1280],[828,1451],[720,1280],[720,1280],[720,1280],[851,1280]];
 const track=document.createElement('div');track.className='photo-ribbon-track';
 const group=document.createElement('div');group.className='photo-ribbon-group';
 grid.classList.add('photo-ribbon');

 participationPhotos.forEach((photo,i)=>{
  const button=document.createElement('button');button.type='button';button.className='participation-tile';button.dataset.photo=String(i);
  const img=document.createElement('img');img.src=photo.image;if(sizes[i]){img.width=sizes[i][0];img.height=sizes[i][1];}img.loading='lazy';img.decoding='async';img.draggable=false;
  const caption=document.createElement('span');button.append(img,caption);group.append(button);
 });
 track.append(group);grid.append(track);

 let paused=false,drag=null,last=0,frame=0;
 const speed=28;
 const gap=()=>parseFloat(getComputedStyle(group).columnGap||getComputedStyle(group).gap)||22;

 function normalize(){
  const first=group.firstElementChild;if(!first)return;
  const step=first.getBoundingClientRect().width+gap();
  if(step>0&&grid.scrollLeft>=step){
   grid.scrollLeft-=step;
   group.append(first);
  }
 }
 function tick(now){
  if(!last)last=now;
  const dt=Math.min(48,now-last);last=now;
  if(!paused&&!reduce.matches&&!document.hidden){
   grid.scrollLeft+=speed*dt/1000;
   normalize();
  }
  frame=requestAnimationFrame(tick);
 }
 if(!reduce.matches)frame=requestAnimationFrame(tick);

 grid.addEventListener('pointerenter',()=>paused=true);
 grid.addEventListener('pointerleave',()=>{if(!drag)paused=false;});
 grid.addEventListener('focusin',()=>paused=true);
 grid.addEventListener('focusout',e=>{if(!grid.contains(e.relatedTarget))paused=false;});

 grid.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;paused=true;
  drag={x:e.clientX,left:grid.scrollLeft,id:e.pointerId,moved:false};
 });
 grid.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;
  if(drag.moved){e.preventDefault();grid.classList.add('is-dragging');grid.scrollLeft=drag.left-dx;normalize();}
 });
 function release(){
  if(drag?.moved)grid.dataset.suppressClick=String(Date.now()+300);
  drag=null;grid.classList.remove('is-dragging');paused=false;
 }
 grid.addEventListener('pointerup',release);grid.addEventListener('pointercancel',release);

 grid.addEventListener('click',e=>{
  const button=e.target.closest('[data-photo]');if(!button)return;
  if(Number(grid.dataset.suppressClick||0)>Date.now()){e.preventDefault();return;}
  const photo=participationPhotos[Number(button.dataset.photo)];
  openLightbox({image:photo.image,ar:photo.ar.title,en:photo.en.title,color:0});
 });

 function translate(){
  const lang=document.documentElement.lang==='en'?'en':'ar';
  grid.querySelectorAll('[data-photo]').forEach(button=>{
   const title=participationPhotos[Number(button.dataset.photo)][lang].title;
   button.firstElementChild.alt=title;button.lastElementChild.textContent=title;
   button.setAttribute('aria-label',(lang==='ar'?'تكبير: ':'Enlarge: ')+title);
  });
 }
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 reduce.addEventListener?.('change',()=>{
  if(reduce.matches&&frame){cancelAnimationFrame(frame);frame=0;last=0;}
  else if(!reduce.matches&&!frame)frame=requestAnimationFrame(tick);
 });
 document.addEventListener('visibilitychange',()=>{last=0;});
 translate();
})();
