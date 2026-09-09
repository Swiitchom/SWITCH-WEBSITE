(() => {
 const form=document.getElementById('contactForm'),select=document.getElementById('fService'),host=document.getElementById('quoteBrief');if(!host)return;
 const copy={ar:{title:'لنقرّب فكرتك',hint:'أجب عمّا تعرفه الآن؛ يمكنك ترك التفاصيل غير المحددة فارغة.',topic:'ما موضوع الورشة؟',participants:'عدد المشاركين المتوقع',location:'المحافظة أو مكان التدريب',date:'الموعد المقترح',organization:'نوع الجهة أو اسمها',event:'المناسبة أو هدف المنصة',interaction:'أسلوب التفاعل',stage:'في أي مرحلة مشروعك؟',more:'أضف تفاصيل أخرى',less:'إخفاء التفاصيل الإضافية',choose:'لم أحدّد بعد',touch:'باللمس',camera:'بالكاميرا والحركة',both:'اللمس والكاميرا',unsure:'أحتاج اقتراحًا',idea:'فكرة جديدة',prototype:'لدي نموذج أولي',improve:'تطوير مشروع قائم',projectHint:'اكتب الفكرة والنتيجة المطلوبة في وصف الفكرة أدناه.'},en:{title:'Let’s shape your idea',hint:'Share what you know. Leave undecided details blank.',topic:'Workshop topic',participants:'Expected participants',location:'Governorate or training location',date:'Preferred date',organization:'Organization type or name',event:'Occasion or platform purpose',interaction:'Interaction style',stage:'Current project stage',more:'Add more details',less:'Hide extra details',choose:'Not decided yet',touch:'Touch',camera:'Camera and gestures',both:'Touch and camera',unsure:'I would like advice',idea:'New idea',prototype:'Existing prototype',improve:'Improve an existing project',projectHint:'Describe the idea and desired outcome in the message below.'}};
 const fields={training:['topic','participants','location','date'],web:['organization','event','interaction','date'],innovation:['stage','date']},choices={interaction:['touch','camera','both','unsure'],stage:['idea','prototype','improve','unsure']};
 const drafts=new Map(),expanded=new Set();let active='';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=()=>servicesData.find(s=>s.ar===select.value||s.en===select.value)?.visual||(workshopsData.some(w=>w.ar.title===select.value||w.en.title===select.value)?'training':'');
 function values(){return Object.fromEntries([...host.querySelectorAll('[data-brief]')].map(input=>[input.dataset.brief,input.value]));}
 function remember(){if(active)drafts.set(active,values());}
 function render(){
  remember();active=key();host.hidden=!fields[active];if(host.hidden){host.replaceChildren();return;}
  const t=copy[currentLang],data=drafts.get(active)||{},keys=fields[active],open=expanded.has(active);
  function field(name){const value=data[name]||'',label=escape(t[name]);let input;
   if(choices[name])input=`<select id="brief-${name}" data-brief="${name}"><option value="">${t.choose}</option>${choices[name].map(choice=>`<option value="${choice}" ${choice===value?'selected':''}>${t[choice]}</option>`).join('')}</select>`;
   else input=`<input id="brief-${name}" data-brief="${name}" type="${name==='date'?'date':name==='participants'?'number':'text'}" ${name==='date'?'min="2000-01-01" max="2099-12-31"':name==='participants'?'min="1" max="10000" step="1" inputmode="numeric"':'maxlength="180"'} value="${escape(value)}">`;
   return `<div class="field"><label for="brief-${name}">${label}</label>${input}</div>`;
  }
  host.innerHTML=`<fieldset class="brief-shell"><legend>${t.title}</legend><p class="brief-hint">${t.hint}</p>${field(keys[0])}${active==='innovation'?`<p class="brief-hint">${t.projectHint}</p>`:''}<button type="button" class="brief-toggle" aria-controls="briefExtra" aria-expanded="${open}">${open?t.less:t.more}<span aria-hidden="true">↗</span></button><div id="briefExtra" class="brief-extra ${open?'is-open':''}" ${open?'':'inert'}><div><div class="brief-grid">${keys.slice(1).map(field).join('')}</div></div></div></fieldset>`;
  host.querySelector('.brief-toggle').onclick=()=>{const button=host.querySelector('.brief-toggle'),extra=document.getElementById('briefExtra'),show=!expanded.has(active);if(show)expanded.add(active);else expanded.delete(active);extra.classList.toggle('is-open',show);extra.inert=!show;button.setAttribute('aria-expanded',String(show));button.innerHTML=(show?t.less:t.more)+'<span aria-hidden="true">↗</span>';};
 }
 host.addEventListener('input',remember);host.addEventListener('change',remember);
 // Reveal invalid optional controls before native validation tries to focus them.
 host.addEventListener('invalid',()=>{expanded.add(active);const extra=document.getElementById('briefExtra');if(extra){extra.classList.add('is-open');extra.inert=false;host.querySelector('.brief-toggle').setAttribute('aria-expanded','true');}},true);
 select.addEventListener('change',render);new MutationObserver(render).observe(select,{childList:true});
 form.addEventListener('reset',()=>{drafts.clear();expanded.clear();active='';setTimeout(render,0);});
 window.portfolioBrief={collect(){const packageKey=key();if(!fields[packageKey]||packageKey!==active)return {};return {packageKey,briefJson:JSON.stringify(values())};}};
 render();
})();
