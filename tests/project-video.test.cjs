const {test}=require('node:test'),assert=require('node:assert/strict');
test('published demo supports exact, open and suffix ranges without forwarding request headers',async()=>{
 const {serveProjectVideo}=await import('../server/project-video.mjs');
 const bytes=new Uint8Array(3637531);for(let i=0;i<bytes.length;i++)bytes[i]=i%251;
 let calls=0;
 const env={ASSETS:{fetch:async request=>{calls++;assert.equal(new URL(request.url).pathname,'/assets/videos/school-gateway-demo.mp4');assert.equal(request.headers.get('range'),null);assert.equal(request.headers.get('cookie'),null);return new Response(bytes,{headers:{etag:'"demo"'}});}}};
 const run=(headers={},method='GET')=>serveProjectVideo(new Request('https://example.com/assets/videos/school-gateway-demo.mp4',{method,headers}),env);
 for(const [range,start,end] of [['bytes=0-1',0,1],['bytes=999-12345',999,12345],['bytes=3637500-',3637500,3637530],['bytes=-12',3637519,3637530]]){
  const result=await run({range,cookie:'private=secret'});assert.equal(result.status,206);assert.equal(result.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);assert.deepEqual(new Uint8Array(await result.arrayBuffer()),bytes.slice(start,end+1));
 }
 for(const range of ['bytes=3637531-','bytes=6-2','bytes=-0'])assert.equal((await run({range})).status,416);
 for(const headers of [{},{range:'bytes=0-1','if-range':'"old"'},{range:'bytes=0-1,4-5'}]){const r=await run(headers);assert.equal(r.status,200);assert.equal((await r.arrayBuffer()).byteLength,bytes.length);}
 const head=await run({range:'bytes=0-1'},'HEAD');assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),String(bytes.length));assert.equal((await head.arrayBuffer()).byteLength,0);
 const before=calls;assert.equal((await run({},'POST')).status,405);assert.equal(calls,before);
});


test('hand-gesture preview supports full and ranged responses',async()=>{
 const {serveHandGestureVideo}=await import('../server/hand-gesture-video.mjs');
 const paths=[
  '/assets/videos/hand-gesture-preview.parts/part-00.bin',
  '/assets/videos/hand-gesture-preview.parts/part-01.bin',
  '/assets/videos/hand-gesture-preview.parts/part-02.bin'
 ];
 const lengths=[10837,10837,10837];
 let value=0;
 const parts=lengths.map(length=>{const out=new Uint8Array(length);for(let i=0;i<length;i++)out[i]=(value++)%251;return out;});
 const env={ASSETS:{fetch:async request=>{
  const path=new URL(request.url).pathname,index=paths.indexOf(path);
  assert.notEqual(index,-1);assert.equal(request.headers.get('range'),null);
  return new Response(parts[index]);
 }}};
 const run=(headers={},method='GET')=>serveHandGestureVideo(new Request('https://example.com/assets/videos/hand-gesture-preview.mp4',{method,headers}),env);
 const full=await run();assert.equal(full.status,200);assert.equal((await full.arrayBuffer()).byteLength,32511);
 const ranged=await run({range:'bytes=10-19'});assert.equal(ranged.status,206);assert.equal(ranged.headers.get('content-range'),'bytes 10-19/32511');assert.equal((await ranged.arrayBuffer()).byteLength,10);
 const suffix=await run({range:'bytes=-8'});assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,8);
 assert.equal((await run({range:'bytes=40000-'})).status,416);
 const head=await run({},'HEAD');assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),'32511');assert.equal((await head.arrayBuffer()).byteLength,0);
});