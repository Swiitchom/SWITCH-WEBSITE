(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang=localStorage.getItem('portfolio.admin.language')==='en'?'en':'ar',data=[];
const fmt=n=>new Intl.NumberFormat('en-US').format(Number(n)||0);
function tr(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('language').textContent=lang==='ar'?'EN':'عربي';document.title=lang==='ar'?'قائمة البريد | سالم العبري':'Email audience | Salim Alabri';for(const el of document.querySelectorAll('[data-ar]'))el.textContent=el.dataset[lang];render();}
function date(v){try{return new Intl.DateTimeFormat(lang==='ar'?'ar-OM':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v));}catch{return '—';}}
function status(row){return row.marketingConsent===true&&row.marketingStatus==='subscribed'?'subscribed':'not_subscribed';}
function render(){
 if(!$('workspace')||$('workspace').hidden)return;
 const term=$('search').value.trim().toLowerCase(),filter=$('filter').value;
 const list=data.filter(row=>(filter==='all'||status(row)===filter)&&[row.name,row.email,row.sources,row.interests].join(' ').toLowerCase().includes(term));
 $('rows').innerHTML=list.map(row=>`<tr><td>${esc(row.name||'—')}</td><td dir="ltr"><a href="mailto:${encodeURIComponent(row.email||'')}">${esc(row.email||'—')}</a></td><td><span class="audience-status ${status(row)}">${status(row)==='subscribed'?(lang==='ar'?'مشترك':'Opted in'):(lang==='ar'?'غير مشترك':'Not subscribed')}</span></td><td>${esc(String(row.sources||'').split('|').filter(Boolean).join(' · ')||'—')}</td><td>${esc(String(row.interests||'').split('|').filter(Boolean).join(' · ')||'—')}</td><td>${esc(date(row.lastSeenAt))}</td></tr>`).join('');
 $('empty').hidden=list.length>0;
 const subscribed=data.filter(row=>status(row)==='subscribed').length;
 $('totalCount').textContent=fmt(data.length);$('subscribedCount').textContent=fmt(subscribed);$('notSubscribedCount').textContent=fmt(data.length-subscribed);
}
async function api(path){const r=await fetch('/api/admin/'+path,{credentials:'same-origin',cache:'no-store'});if(r.status===401)throw Object.assign(Error(),{status:401});if(!r.ok)throw Error();return r.json();}
async function load(){
 $('refresh').disabled=true;$('notice').textContent=lang==='ar'?'جارٍ التحميل…':'Loading…';
 try{const result=await api('audience');data=result.audience||[];$('notice').textContent='';render();}
 catch(e){if(e.status===401){$('workspace').hidden=true;$('login').hidden=false;}else $('notice').textContent=lang==='ar'?'تعذر تحميل القائمة.':'Unable to load the list.';}
 finally{$('refresh').disabled=false;}
}
function csv(){
 const rows=data.filter(row=>status(row)==='subscribed');
 if(!rows.length){$('notice').textContent=lang==='ar'?'لا يوجد مشتركون موافقون على الرسائل بعد.':'No opted-in subscribers yet.';return;}
 const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const body=[['name','email','language','sources','interests','firstSeenAt','lastSeenAt'],...rows.map(r=>[r.name,r.email,r.language,r.sources,r.interests,r.firstSeenAt,r.lastSeenAt])].map(r=>r.map(q).join(',')).join('\r\n');
 const blob=new Blob(['\ufeff'+body],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='switch-email-subscribers.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
$('language').onclick=()=>{lang=lang==='ar'?'en':'ar';localStorage.setItem('portfolio.admin.language',lang);tr();};
$('search').oninput=render;$('filter').onchange=render;$('refresh').onclick=load;$('exportCsv').onclick=csv;
tr();(async()=>{try{await api('session');$('login').hidden=true;$('workspace').hidden=false;await load();}catch(e){$('workspace').hidden=true;$('login').hidden=false;}})();
})();