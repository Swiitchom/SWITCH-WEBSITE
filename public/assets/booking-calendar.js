(()=>{'use strict';
const dayKey=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
const noon=key=>new Date(key+'T12:00:00+04:00');
function mount(host,{lang='ar',month,selected,days={},owner=false,busy=false,onDay,onMonth}){
 const t=(a,e)=>lang==='ar'?a:e,today=dayKey(Date.now()),limit=dayKey(Date.now()+180*86400000),[y,m]=month.split('-').map(Number);host.replaceChildren();
 const head=document.createElement('div');head.className='calendar-head';
 const heading=document.createElement('h3');heading.textContent=new Intl.DateTimeFormat(lang,{month:'long',year:'numeric',timeZone:'Asia/Muscat'}).format(noon(month+'-01'));heading.setAttribute('aria-live','polite');
 function nav(delta,label){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',delta<0?t('الشهر السابق','Previous month'):t('الشهر التالي','Next month'));const target=new Date(Date.UTC(y,m-1+delta,1)).toISOString().slice(0,7);b.disabled=busy||target<today.slice(0,7)||target>limit.slice(0,7);b.onclick=()=>onMonth(target);return b;}
 head.append(nav(-1,t('السابق','Previous')),heading,nav(1,t('التالي','Next')));host.append(head);
 const grid=document.createElement('div');grid.className='calendar-grid';
 for(let i=0;i<7;i++){const el=document.createElement('span');el.className='weekday';el.textContent=new Intl.DateTimeFormat(lang,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,4+i)));grid.append(el);}
 const offset=new Date(Date.UTC(y,m-1,1)).getUTCDay(),count=new Date(Date.UTC(y,m,0)).getUTCDate();
 for(let i=0;i<offset;i++){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');grid.append(blank);}
 for(let d=1;d<=count;d++){const key=month+'-'+String(d).padStart(2,'0'),state=days[key],b=document.createElement('button');b.type='button';b.className='calendar-day'+(state?.open?' available':'')+(state?.booked?' booked':'');b.textContent=new Intl.NumberFormat(lang).format(d);b.dataset.day=key;b.disabled=busy||key<today||key>limit||(!owner&&!state?.open);b.setAttribute('aria-pressed',String(key===selected));b.setAttribute('aria-label',new Intl.DateTimeFormat(lang,{dateStyle:'full',timeZone:'Asia/Muscat'}).format(noon(key))+' · '+(state?.open?t('مواعيد متاحة','Available times'):state?.booked?t('محجوز','Booked'):t('لا توجد مواعيد','No times')));if(key===today)b.setAttribute('aria-current','date');b.onclick=()=>onDay(key);grid.append(b);}
 host.append(grid);const legend=document.createElement('p');legend.className='calendar-legend';legend.textContent=owner?t('● متاح للحجز   ◇ محجوز — اضغط اليوم لإدارة أوقاته','● Open   ◇ Booked — select a day to manage times'):t('الأيام المضيئة تحتوي على مواعيد متاحة','Highlighted days have available times');host.append(legend);
}
window.BookingCalendar={dayKey,noon,mount};})();
