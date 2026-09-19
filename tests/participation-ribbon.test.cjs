const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');const root=path.resolve(__dirname,'../public');
function boot(){
 const dom=new JSDOM('<html lang="ar"><body><div id="participationGrid"></div></body></html>',{url:'http://localhost/',runScripts:'outside-only'});
 const w=dom.window;let zoom;w.openLightbox=p=>zoom=p;w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.matchMedia=()=>({matches:true,addEventListener(){}});w.requestAnimationFrame=()=>0;w.cancelAnimationFrame=()=>{};
 for(const file of ['participation-data.js','participation-ribbon.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),dom.getInternalVMContext());
 return {dom,w,d:w.document,zoom:()=>zoom};
}
test('photo ribbon loops thirteen unique photographs with one decorative duplicate group',()=>{
 const b=boot(),groups=b.d.querySelectorAll('.photo-ribbon-group');
 assert.equal(groups.length,2);assert.equal(groups[0].children.length,13);assert.equal(groups[1].children.length,13);
 assert.equal(groups[1].getAttribute('aria-hidden'),'true');
 const refs=[...groups[0].children].map(button=>button.firstElementChild.getAttribute('src'));
 assert.equal(new Set(refs).size,13);
 for(const button of groups[0].children){assert.equal(button.tabIndex,0);assert.ok(fs.existsSync(path.join(root,button.firstElementChild.getAttribute('src'))));assert.ok(button.firstElementChild.width>0);}
 for(const button of groups[1].children)assert.equal(button.tabIndex,-1);
 for(const name of ['participation-ai-workshop.webp','participation-electronics-session.webp','participation-prototyping-workbench.webp'])assert.ok(refs.includes('assets/images/'+name));
 groups[0].children[10].click();assert.equal(b.zoom().image,groups[0].children[10].firstElementChild.getAttribute('src'));b.dom.window.close();
});
test('photo captions and accessible labels update to English across the moving path',async()=>{
 const b=boot();b.d.documentElement.lang='en';await new Promise(r=>setImmediate(r));
 for(const button of b.d.querySelector('.photo-ribbon-group:not([aria-hidden="true"])').querySelectorAll('[data-photo]'))assert.match(button.getAttribute('aria-label'),/^Enlarge:/);
 assert.equal(b.d.querySelector('.participation-tile span').textContent,'Learning by doing');b.dom.window.close();
});
test('page keeps proof sections secondary while the unified service catalogue stays primary',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/participation(Pause|Count|Prev|Next|Carousel)/);
 assert.doesNotMatch(html,/class="stat-cards/);
 for(const id of ['achievements','gallery','workshops','store'])assert.equal(html.includes('id="more-'+id+'"'),false);
 assert.equal(html.includes('id="achievements"'),false);
 assert.equal(html.includes('id="gallery"'),false);
 assert.equal(html.includes('id="projects"'),false);
 assert.ok(html.includes('class="section switch-store-section" id="store"'));
 assert.ok(html.indexOf('id="services"')<html.indexOf('id="participation"'));
});
