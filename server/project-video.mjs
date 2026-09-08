// Pages static responses ignore Range. Keep this small, fixed demo seekable.
const assetPath='/assets/videos/school-gateway-demo.mp4';
const assetBytes=3637531;
export async function serveProjectVideo(request,env){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 const assetURL=new URL(assetPath,request.url);
 const asset=await env.ASSETS.fetch(new Request(assetURL,{method:'GET'}));
 if(asset.status!==200)return new Response(null,{status:502});
 const headers=new Headers({'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(assetBytes),'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
 const etag=asset.headers.get('etag');if(etag)headers.set('ETag',etag);
 const range=request.headers.get('range'),ifRange=request.headers.get('if-range');
 let start=0,end=assetBytes-1,status=200;
 if(request.method==='GET'&&range&&(!ifRange||ifRange===etag)){
  const match=range.match(/^bytes=(\d*)-(\d*)$/);
  if(match&&(match[1]||match[2])){
   start=match[1]?Number(match[1]):Math.max(0,assetBytes-Number(match[2]));
   end=match[1]&&match[2]?Math.min(Number(match[2]),assetBytes-1):assetBytes-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=assetBytes){
    await asset.body?.cancel();return new Response(null,{status:416,headers:{'Content-Range':`bytes */${assetBytes}`,'Accept-Ranges':'bytes'}});
   }
   status=206;headers.set('Content-Range',`bytes ${start}-${end}/${assetBytes}`);headers.set('Content-Length',String(end-start+1));
  }
 }
 if(request.method==='HEAD'){await asset.body?.cancel();return new Response(null,{headers});}
 // Stream only the selected bytes; do not buffer the full video per visitor.
 const reader=asset.body.getReader();let offset=0;
 const body=new ReadableStream({
  async pull(controller){
   try{
    while(true){
     const {done,value}=await reader.read();
     if(done){if(offset<=end)controller.error(new Error('Incomplete video asset'));else controller.close();return;}
     const chunkStart=offset;offset+=value.byteLength;
     const from=Math.max(0,start-chunkStart),to=Math.min(value.byteLength,end-chunkStart+1);
     if(to>from)controller.enqueue(value.subarray(from,to));
     if(offset>end){controller.close();await reader.cancel();return;}
     if(to>from)return;
    }
   }catch(error){controller.error(error);}
  },
  cancel(reason){return reader.cancel(reason);}
 });
 return new Response(body,{status,headers});
}
