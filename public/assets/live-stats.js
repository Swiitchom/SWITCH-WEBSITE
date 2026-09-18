(()=>{'use strict';
const section=document.getElementById('liveStats');if(!section)return;
let latest={};
const fmt=n=>new Intl.NumberFormat('en-US').format(Number(n)||0);
function set(id,value){const el=document.getElementById(id);if(el)el.textContent=fmt(value);}
function renderTrend(points){
 const host=document.getElementById('visitTrend');if(!host)return;
 host.replaceChildren();
 const values=points.map(p=>Number(p.visits)||0),max=Math.max(1,...values);
 for(const p of points){
  const bar=document.createElement('span');
  bar.className='live-stats-bar';
  bar.style.height=Math.max(8,Math.round((Number(p.visits)||0)/max*100))+'%';
  bar.title=p.day+' · '+fmt(Number(p.visits)||0);
  host.append(bar);
 }
}
function render(){
 set('projectStat',typeof projectsData!=='undefined'&&Array.isArray(projectsData)?projectsData.length:document.querySelectorAll('.proj-card').length);
 set('visitStat',latest.visits||0);
 set('consultStat',latest.consultations||0);
 set('completedProjectStat',latest.completedProjects||0);
 const started=document.getElementById('visitStarted');
 if(started&&latest.startedAt)started.textContent=document.documentElement.lang==='en'?'Recorded since '+latest.startedAt:'مسجلة منذ '+latest.startedAt;
 renderTrend(Array.isArray(latest.trend)?latest.trend:[]);
}
async function load(){
 render();
 try{
  const r=await fetch('/api/public-stats',{cache:'no-store'});
  if(!r.ok)throw Error();
  latest=await r.json();
  render();
 }catch{}
 section.classList.add('is-ready');
}
new MutationObserver(()=>render()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
