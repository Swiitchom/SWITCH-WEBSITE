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
