/* Seamless participation ribbon: one source set, one decorative loop copy. */
(() => {
 const grid=document.getElementById('participationGrid');if(!grid)return;
 const sizes=[[720,1280],[720,1280],[717,1150],[1280,852],[960,1280],[828,1451],[720,1280],[720,1280],[720,1280],[851,1280],[1000,666],[462,1000],[462,1000]];
 const track=document.createElement('div');track.className='photo-ribbon-track';
 grid.classList.add('photo-ribbon');

 for(let copy=0;copy<2;copy++){
  const group=document.createElement('div');group.className='photo-ribbon-group';group.dataset.copy=String(copy);
  if(copy)group.setAttribute('aria-hidden','true');
  participationPhotos.forEach((photo,i)=>{
   const button=document.createElement('button');button.type='button';button.className='participation-tile';button.dataset.photo=String(i);
   if(copy)button.tabIndex=-1;
   const img=document.createElement('img');img.src=photo.image;
   if(sizes[i]){img.width=sizes[i][0];img.height=sizes[i][1];}
   img.loading='lazy';img.decoding='async';img.draggable=false;
   const caption=document.createElement('span');button.append(img,caption);group.append(button);
  });
  track.append(group);
 }
 grid.append(track);

 function measure(){
  const first=track.firstElementChild;
  if(!first)return;
  const width=first.getBoundingClientRect().width;
  if(width)track.style.setProperty('--ribbon-duration',Math.max(48,width/30)+'s');
 }
 if('ResizeObserver' in window)new ResizeObserver(measure).observe(track.firstElementChild);
 addEventListener('resize',measure,{passive:true});
 measure();

 grid.addEventListener('click',e=>{
  const button=e.target.closest('[data-photo]');if(!button)return;
  const index=Number(button.dataset.photo),photo=participationPhotos[index];if(!photo)return;
  openLightbox({image:photo.image,ar:photo.ar.title,en:photo.en.title,color:0});
 });

 function translate(){
  const lang=document.documentElement.lang==='en'?'en':'ar';
  grid.querySelectorAll('[data-photo]').forEach(button=>{
   const title=participationPhotos[Number(button.dataset.photo)][lang].title;
   button.firstElementChild.alt=button.closest('[aria-hidden="true"]')?'':title;
   button.lastElementChild.textContent=title;
   if(!button.closest('[aria-hidden="true"]'))button.setAttribute('aria-label',(lang==='ar'?'تكبير: ':'Enlarge: ')+title);
  });
  measure();
 }
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 translate();
})();
