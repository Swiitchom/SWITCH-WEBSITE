const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');const root=path.resolve(__dirname,'../public');
function boot(){
 const dom=new JSDOM('<html lang="ar"><body><div id="participationGrid"></div></body></html>',{url:'http://localhost/',runScripts:'outside-only'});
 const w=dom.window;let zoom;w.openLightbox=p=>zoom=p;w.HTMLElement.prototype.scrollIntoView=()=>{};
 for(const file of ['participation-data.js','participation-ribbon.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',file),'utf8'),dom.getInternalVMContext());
 return {dom,w,d:w.document,zoom:()=>zoom};
}
test('photo ribbon keeps ten original photographs and excludes duplicate controls from keyboard navigation',()=>{
 const b=boot(),groups=b.d.querySelectorAll('.photo-ribbon-group');assert.equal(groups.length,2);assert.equal(groups[0].children.length,10);assert.equal(groups[1].getAttribute('aria-hidden'),'true');
 for(const button of groups[0].children){assert.equal(button.tabIndex,0);assert.ok(fs.existsSync(path.join(root,button.firstElementChild.getAttribute('src'))));assert.ok(button.firstElementChild.width>0);}
 for(const button of groups[1].children)assert.equal(button.tabIndex,-1);
 groups[1].children[3].click();assert.equal(b.zoom().image,groups[0].children[3].firstElementChild.getAttribute('src'));b.dom.window.close();
});
test('photo captions and accessible labels update to English in both copies',async()=>{
 const b=boot();b.d.documentElement.lang='en';await new Promise(r=>setImmediate(r));
 for(const button of b.d.querySelectorAll('[data-photo]'))assert.match(button.getAttribute('aria-label'),/^Enlarge:/);
 assert.equal(b.d.querySelector('.participation-tile span').textContent,'Learning by doing');b.dom.window.close();
});
test('page retains secondary sections without playback labels or repeated statistics',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.doesNotMatch(html,/participation(Pause|Count|Prev|Next|Carousel)/);assert.doesNotMatch(html,/class="stat-cards/);for(const id of ['workshops','achievements','store','gallery'])assert.ok(html.includes('id="more-'+id+'"'));assert.ok(html.indexOf('id="projects"')<html.indexOf('id="participation"'));
});
