function validate(data){
  if(!data||typeof data!=='object')throw Error('invalid');
  const text=(key,min,max)=>{if(typeof data[key]!=='string')throw Error(key);const value=data[key].trim();if(value.length<min||value.length>max)throw Error(key);return value;};
  const result={requestId:text('requestId',36,36),name:text('name',2,100),email:text('email',3,254),phone:text('phone',7,25),service:text('service',2,160),message:text('message',5,3000),kind:text('kind',1,12),context:text('context',1,160)};
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.requestId)||!/^\S+@[^\s@]+\.[^\s@]+$/.test(result.email)||!/^\+?[0-9 ()-]{7,25}$/.test(result.phone)||!['contact','store'].includes(result.kind)||data.consent!==true)throw Error('invalid');
  result.consent=true;
  if(result.kind==='store'){
    if(!Number.isInteger(data.quantity)||data.quantity<1||data.quantity>100||typeof data.addWorkshop!=='boolean')throw Error('quantity');
    result.quantity=data.quantity;result.addWorkshop=data.addWorkshop;result.totalOMR=(19900*data.quantity+(data.addWorkshop?59000:0))/1000;
  }
  return result;
}
module.exports={validate};
