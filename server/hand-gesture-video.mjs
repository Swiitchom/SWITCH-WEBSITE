const assetPaths=[
 '/assets/videos/hand-gesture-preview.parts/part-00.bin',
 '/assets/videos/hand-gesture-preview.parts/part-01.bin',
 '/assets/videos/hand-gesture-preview.parts/part-02.bin'
];
const assetBytes=32511;

const headers=length=>new Headers({
 'Content-Type':'video/mp4',
 'Accept-Ranges':'bytes',
 'Content-Length':String(length),
 'Cache-Control':'public, max-age=86400',
 'X-Content-Type-Options':'nosniff'
});

async function loadAsset(request,env){
 const chunks=[];
 for(const path of assetPaths){
  const response=await env.ASSETS.fetch(new Request(new URL(path,request.url),{method:'GET'}));
  if(!response.ok)return null;
  chunks.push(new Uint8Array(await response.arrayBuffer()));
 }
 const bytes=new Uint8Array(assetBytes);let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 return offset===assetBytes?bytes:null;
}

export async function serveHandGestureVideo(request,env){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 if(request.method==='HEAD')return new Response(null,{headers:headers(assetBytes)});
 const bytes=await loadAsset(request,env);
 if(!bytes)return new Response(null,{status:502});
 const range=request.headers.get('range');
 if(range){
  const match=range.match(/^bytes=(\d*)-(\d*)$/);
  if(!match||(!match[1]&&!match[2]))return new Response(bytes,{headers:headers(assetBytes)});
  let start,end;
  if(match[1]){
   start=Number(match[1]);
   end=match[2]?Math.min(Number(match[2]),assetBytes-1):assetBytes-1;
  }else{
   const suffix=Number(match[2]);
   if(!Number.isSafeInteger(suffix)||suffix<=0)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${assetBytes}`,'Accept-Ranges':'bytes'}});
   start=Math.max(0,assetBytes-suffix);end=assetBytes-1;
  }
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=assetBytes){
   return new Response(null,{status:416,headers:{'Content-Range':`bytes */${assetBytes}`,'Accept-Ranges':'bytes'}});
  }
  const out=bytes.slice(start,end+1),h=headers(out.byteLength);
  h.set('Content-Range',`bytes ${start}-${end}/${assetBytes}`);
  return new Response(out,{status:206,headers:h});
 }
 return new Response(bytes,{headers:headers(assetBytes)});
}
