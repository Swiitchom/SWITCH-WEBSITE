const schemas={training:{topic:180,participants:0,location:180,date:0},web:{organization:180,event:180,interaction:['touch','camera','both','unsure'],date:0},innovation:{stage:['idea','prototype','improve','unsure'],date:0}};
function validateBrief(data,result){
 if(data.packageKey===undefined&&data.briefJson===undefined)return;
 if(result.kind!=='contact'||typeof data.packageKey!=='string'||!Object.hasOwn(schemas,data.packageKey)||typeof data.briefJson!=='string'||data.briefJson.length>1800)throw Error('brief');
 let brief;try{brief=JSON.parse(data.briefJson);}catch{throw Error('brief');}
 if(!brief||typeof brief!=='object'||Array.isArray(brief))throw Error('brief');
 const schema=schemas[data.packageKey],clean={};
 for(const key of Object.keys(brief))if(!Object.hasOwn(schema,key))throw Error('brief_field');
 for(const [key,rule] of Object.entries(schema)){
  if(brief[key]===undefined||brief[key]==='')continue;
  if(typeof brief[key]!=='string')throw Error('brief_field');const value=brief[key].trim();if(!value)continue;
  if(key==='date'){
   if(!/^20\d{2}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw Error('brief_date');
  }else if(key==='participants'){
   if(!/^\d{1,5}$/.test(value)||Number(value)<1||Number(value)>10000)throw Error('brief_participants');
  }else if(Array.isArray(rule)){if(!rule.includes(value))throw Error('brief_choice');}
  else if(value.length>rule)throw Error('brief_length');
  clean[key]=value;
 }
 result.packageKey=data.packageKey;result.briefJson=JSON.stringify(clean);
}
module.exports={validateBrief};
