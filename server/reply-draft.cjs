function normalizePhone(value){
 if(typeof value!=='string')return '';
 let phone=value.trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
 if(!/^[+0-9 ()-]+$/.test(phone))return '';
 phone=phone.replace(/[ ()-]/g,'');
 if(/^[279]\d{7}$/.test(phone))phone='968'+phone;
 else if(phone.startsWith('00'))phone=phone.slice(2);
 else if(phone.startsWith('+'))phone=phone.slice(1);
 else if(!/^968[279]\d{7}$/.test(phone))return '';
 if(phone.startsWith('968')&&!/^968[279]\d{7}$/.test(phone))return '';
 return /^[1-9]\d{7,14}$/.test(phone)?phone:'';
}
function validateReply(input){
 if(!input||typeof input!=='object'||typeof input.replyDetails!=='string'||input.replyDetails.length>3000||typeof input.whatsappDraft!=='string'||input.whatsappDraft.trim().length<3||input.whatsappDraft.length>6000||!['ar','en'].includes(input.replyLanguage))throw Error('reply');
 const phone=normalizePhone(input.replyPhone);if(!phone)throw Error('phone');
 return {replyDetails:input.replyDetails.trim(),whatsappDraft:input.whatsappDraft.trim(),replyLanguage:input.replyLanguage,replyPhone:'+'+phone};
}
module.exports={normalizePhone,validateReply};
