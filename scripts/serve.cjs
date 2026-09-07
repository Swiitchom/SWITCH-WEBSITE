const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain'};
http.createServer((req,res)=>{
  if(req.url==='/api/inquiry' && req.method==='POST'){
    let body='';
    req.on('data',chunk=>{body+=chunk;if(body.length>12000){res.writeHead(413);res.end();req.destroy();}});
    req.on('end',async()=>{
      const {handler}=require('../netlify/functions/inquiry.js');
      const result=await handler({httpMethod:'POST',headers:req.headers,body});
      res.writeHead(result.statusCode,result.headers);res.end(result.body);
    });return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  let name;
  try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{
    res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    res.end(req.method==='HEAD'?'':err?'Not found':data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173'));
