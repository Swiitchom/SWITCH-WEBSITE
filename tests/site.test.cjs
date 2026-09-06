const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../public');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('all client scripts parse and local asset references exist',()=>{
  for(const name of fs.readdirSync(path.join(root,'assets')).filter(n=>n.endsWith('.js'))){
    new vm.Script(read('assets/'+name));
  }
  const source=read('index.html')+read('assets/projects.js')+read('assets/app.js');
  for(const [,ref] of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
    if(ref.startsWith('#')||ref.includes(':')||ref.includes('${')) continue;
    assert.ok(fs.existsSync(path.join(root,ref.split(/[?#]/)[0])),ref);
  }
  for(const [ref] of source.matchAll(/assets\/images\/[a-f0-9]+\.webp/g)) assert.ok(fs.existsSync(path.join(root,ref)),ref);
  assert.equal(source.includes('data:image/'),false);
});

test('six existing bilingual case studies retain content and photos',()=>{
  const context=vm.createContext({});
  vm.runInContext(read('assets/projects.js'),context);
  const projects=vm.runInContext('projectsData',context);
  assert.equal(projects.length,10);
  assert.equal(projects.filter(p=>p.image).length,7);
  for(const p of projects.slice(4)) for(const lang of ['ar','en']) for(const field of ['title','problem','solution','result']) assert.ok(p[lang][field]);
  for(const p of projects) for(const lang of ['ar','en']) assert.ok(p[lang].overview);
  assert.ok(!projects.some(p=>['Electronic display unit','Multi-sensor unit'].includes(p.en.title)));
  for(const p of projects) for(const g of p.gallery||[]) assert.ok(fs.existsSync(path.join(root,g.image)));
  for(const p of projects.filter(p=>p.image)) assert.ok(fs.existsSync(path.join(root,p.image)));
});

function formsContext(){
  class Data { constructor(form){return new URLSearchParams(form.fields);} }
  const context=vm.createContext({
    document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},
    WHATSAPP_NUMBER:'96894144778',URLSearchParams,FormData:Data,AbortSignal,encodeURIComponent
  });
  vm.runInContext(read('assets/forms.js'),context);
  return context;
}
test('WhatsApp preserves Arabic and reserved characters as a single text value',()=>{
  const ctx=formsContext();
  const input='سالم & مشروع #1 + 50%\nhttps://example.com/?a=1&b=2';
  const result=new URL(ctx.whatsappURL(input));
  assert.equal(result.searchParams.get('text'),input);
  assert.equal([...result.searchParams].length,1);
});
test('save sends JSON to the private backend and requires a matching receipt',async()=>{
  const ctx=formsContext();
  const form={requestId:'test-id',name:'سالم & علي',website:''};
  await ctx.saveInquiry(form,async(url,opts)=>{
    assert.equal(url,'/api/inquiry'); assert.equal(opts.method,'POST');
    const body=JSON.parse(opts.body);
    assert.equal(body.name,'سالم & علي');
    assert.equal(body.website,'');
    return {ok:true,json:async()=>({id:form.requestId})};
  });
  await assert.rejects(ctx.saveInquiry(form,async()=>({ok:false,status:500})),/500/);
  await assert.rejects(ctx.saveInquiry(form,async()=>{throw Error('offline')}),/offline/);
});
