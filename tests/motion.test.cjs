const {test}=require('node:test');const assert=require('node:assert/strict');const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');
test('scroll motion updates visible images and pointer depth, then resets for reduced motion',async()=>{
 const dom=new JSDOM('<div id="projGrid" class="proj-grid"><article><button class="project-open"></button></article></div><div id="svcGrid" class="svc-grid"><div class="svc-card"></div></div>',{runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let reducedCallback,intersection,paint;const reduced={matches:false,addEventListener:(k,fn)=>reducedCallback=fn};
 w.matchMedia=q=>q.includes('reduced')?reduced:{matches:true};
 w.requestAnimationFrame=fn=>{paint=fn;return 1;};w.cancelAnimationFrame=()=>{};
 w.IntersectionObserver=class{constructor(fn){intersection=fn;}observe(){}unobserve(){}};
 w.eval(fs.readFileSync(path.join(__dirname,'../public/assets/scroll-motion.js'),'utf8'));
 const card=w.document.querySelector('.project-open');card.getBoundingClientRect=()=>({top:0,left:0,width:200,height:200});
 intersection([{target:card,isIntersecting:true}]);paint();assert.notEqual(card.style.getPropertyValue('--scroll-drift'),'0.00px');
 card.dispatchEvent(new w.MouseEvent('pointermove',{clientX:180,clientY:30}));assert.notEqual(card.style.getPropertyValue('--tilt-y'),'0deg');
 card.dispatchEvent(new w.Event('pointerleave'));assert.equal(card.style.getPropertyValue('--tilt-y'),'0deg');
 reduced.matches=true;reducedCallback();assert.equal(card.style.getPropertyValue('--scroll-drift'),'0px');
 const added=w.document.createElement('button');added.className='project-open';w.document.getElementById('projGrid').append(added);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(w.document.querySelectorAll('.scroll-progress').length,1);dom.window.close();
});
