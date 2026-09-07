
/* =========================================================
   ICONS — small inline SVG set, reused across sections
   ========================================================= */
const ICON = {
  ai:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8" stroke="currentColor" stroke-width="1.5"/></svg>`,
  chip:`<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" stroke="currentColor" stroke-width="1.5"/></svg>`,
  iot:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.4" fill="currentColor"/><circle cx="5" cy="5" r="1.6" stroke="currentColor" stroke-width="1.4"/><circle cx="19" cy="5" r="1.6" stroke="currentColor" stroke-width="1.4"/><circle cx="5" cy="19" r="1.6" stroke="currentColor" stroke-width="1.4"/><circle cx="19" cy="19" r="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M6.2 6.2L10.3 10.3M17.8 6.2L13.7 10.3M6.2 17.8L10.3 13.7M17.8 17.8L13.7 13.7" stroke="currentColor" stroke-width="1.2"/></svg>`,
  code:`<svg viewBox="0 0 24 24" fill="none"><path d="M8 6L2 12l6 6M16 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cube:`<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" stroke-width="1.4"/><path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" stroke-width="1.4"/></svg>`,
  bulb:`<svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.4 1.1 2.2h5c0-.8.5-1.7 1.1-2.2A6 6 0 0 0 12 2z" stroke="currentColor" stroke-width="1.4"/></svg>`,
  train:`<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="13" rx="3" stroke="currentColor" stroke-width="1.4"/><path d="M4 10h16M9 19l-2 3M17 19l2 3" stroke="currentColor" stroke-width="1.4"/><circle cx="8.5" cy="12.5" r="1" fill="currentColor"/><circle cx="15.5" cy="12.5" r="1" fill="currentColor"/></svg>`,
  helmet:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 15a8 8 0 0 1 16 0v2H4v-2z" stroke="currentColor" stroke-width="1.4"/><path d="M2 17h20M9 17v2M15 17v2" stroke="currentColor" stroke-width="1.4"/></svg>`,
  glove:`<svg viewBox="0 0 24 24" fill="none"><path d="M7 12V5a1.5 1.5 0 0 1 3 0v5M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v7M16 12V8a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5v-3a2 2 0 0 1 4 0" stroke="currentColor" stroke-width="1.3"/></svg>`,
  bell:`<svg viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" stroke="currentColor" stroke-width="1.4"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.4"/></svg>`,
  puzzle:`<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h4v3.2a1.6 1.6 0 0 0 2.7 1.2 1.6 1.6 0 1 1 2.1 2.4A1.6 1.6 0 0 0 19 12.6V17h-4.2a1.6 1.6 0 0 0-1.2 2.7 1.6 1.6 0 1 1-2.4 2.1A1.6 1.6 0 0 0 8.4 21H3v-4.2a1.6 1.6 0 0 0-2.7-1.2A1.6 1.6 0 1 1-1.8 13.5 1.6 1.6 0 0 0 0 11.4V7h4.2A1.6 1.6 0 0 0 5.4 4.3 1.6 1.6 0 1 1 9 3z" stroke="currentColor" stroke-width="1.1"/></svg>`,
  gallery:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M4 17l5-5 3 3 4-5 4 6" stroke="currentColor" stroke-width="1.3"/></svg>`,
  whatsapp:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 20l1.4-4.2A8 8 0 1 1 9 18.6L4 20z" stroke="currentColor" stroke-width="1.4"/><path d="M8.5 9.5c0 3.5 3 6 6 6" stroke="currentColor" stroke-width="1.4"/></svg>`,
  instagram:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
  mail:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="1.4"/></svg>`,
  linkedin:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><path d="M8 11v6M12 11v6M12 13.5c0-1.5 1-2.5 2.3-2.5S17 12 17 13.5V17" stroke="currentColor" stroke-width="1.4"/></svg>`,
  arrow:`<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
function gradTile(seed){
  const pals=[["#1a2230","#0f141c"],["#22160f","#0f141c"],["#0f1e1c","#0f141c"],["#191024","#0f141c"]];
  const p=pals[seed%pals.length];
  return `background:linear-gradient(135deg,${p[0]},${p[1]});`;
}

/* =========================================================
   CONTENT — AR/EN dictionaries + structured data
   ========================================================= */
const i18n = {
  ar:{
    logoText:"م. سالم العبري", nav1:"عني", nav2:"المشاريع", nav3:"الخدمات", nav4:"الورش", nav5:"المشاركات", nav6:"تواصل معي", nav7:"المعرض",
    heroKicker:"هندسة الإلكترونيات · الذكاء الاصطناعي · الابتكار",
    heroName1:"م. سالم", heroName2:"العبري",
    heroTagline:"من الفكرة إلى نموذج تقني يعمل.",
    heroDesc:"أساعد الأفراد والمؤسسات على تحويل الأفكار إلى حلول عملية باستخدام الذكاء الاصطناعي، الإلكترونيات، إنترنت الأشياء والبرمجة.",
    heroBtn1:"استكشف مشاريعي", heroBtn2:"تواصل معي",
    stat1:"مشروع منفذ", stat2:"ورشة تدريبية", stat3:"ساعة تدريب", stat4:"فعالية ومشاركة",
    aboutEyebrow:"من أنا",
    aboutTitle:"مهندس يبني الفكرة حتى تصبح نموذجًا حقيقيًا",
    aboutP1:"أنا سالم العبري، مهتم ببناء وتطوير الحلول التقنية وتحويل الأفكار إلى نماذج ومشاريع عملية، مع تركيز على الذكاء الاصطناعي، الأنظمة المدمجة، إنترنت الأشياء، الإلكترونيات، تطوير المنصات والطباعة ثلاثية الأبعاد.",
    aboutP2:"كما أعمل في التدريب وتقديم الورش، ودعم الابتكارات وتطوير المشاريع الطلابية والتقنية من خلال Switch، مبادرتي التعليمية التقنية.",
    expEyebrow:"مجالات الخبرة", expTitle:"أدوات ومجالات أعمل بها يوميًا",
    projEyebrow:"المشاريع", projTitle:"مشاريع ومنصات",
    projSub:"مجموعة مختارة من المشاريع في الذكاء الاصطناعي، إنترنت الأشياء، والتطبيقات التفاعلية.",
    filterAll:"الكل",
    svcEyebrow:"الخدمات", svcTitle:"كيف يمكنني مساعدتك؟", svcCta:"اطلب الخدمة",
    wkspEyebrow:"التدريب والورش", wkspTitle:"برامج تدريبية عملية وممتعة", wkspCta:"استفسر عن الورشة",
    nav8:"المتجر",
    storeEyebrow:"المتجر", storeTitle:"كت الأردوينو — ابدأ رحلتك في الإلكترونيات",
    storeSub:"كل ما تحتاجه لتعلم الإلكترونيات والبرمجة في مكان واحد، مع خيار إضافة ورشة تدريبية أونلاين.",
    storeKitTag:"Arduino Kit · إلكترونيات", storeKitName:"كت الأردوينو من Switch",
    storeKitDesc:"كت تعليمي متكامل لبداية رحلتك في الإلكترونيات والبرمجة، بشرح مبسط للمبتدئين ومشاريع عملية تنفذها خطوة بخطوة.",
    storeKitPriceLabel:"سعر الكت", storeCurrency:"ر.ع", storeAddWorkshopLabel:"أضف الورشة الأونلاين (3 أيام)",
    storeTotalLabel:"الإجمالي", storeQty:"العدد", storeNotes:"ملاحظات (اختياري)", storeSubmit:"إرسال طلب الكت",
    storeYes:"نعم", storeNo:"لا",
    waMsgStore:(name,qty,addon,notes,total)=>`مرحبًا، أرغب بطلب كت الأردوينو.\nالاسم: ${name}\nالعدد: ${qty}\nإضافة الورشة الأونلاين: ${addon}\nملاحظات: ${notes||'-'}\nالإجمالي التقديري: ${total}`,
    tlEyebrow:"المشاركات والإنجازات", tlTitle:"محطات ومشاركات",
    galEyebrow:"معرض الصور", galTitle:"لحظات من المشاريع والورش",
    ctEyebrow:"تواصل معي", ctTitle:"لديك فكرة؟ دعنا نحولها إلى مشروع حقيقي.",
    ctDesc:"أخبرني عن فكرتك أو مشروعك، وسنحدد أفضل طريقة لتنفيذه معًا.",
    fName:"الاسم", fContact:"رقم الهاتف / البريد الإلكتروني", fService:"نوع الخدمة", fMsg:"وصف الفكرة",
    fSubmit:"إرسال الطلب", fNote:"أرسل طلبك وسأراجعه وأتواصل معك عبر البريد أو الهاتف.",
    fSent:"تم استلام طلبك وهو قيد المراجعة.",
    footText:"© 2026 م. سالم العبري — Switch. جميع الحقوق محفوظة.",
    modalProblem:"المشكلة", modalSolution:"الحل", modalResult:"النتيجة",
    waMsg:(name,contact,svc,msg)=>`مرحبًا سالم، اسمي ${name}.\nالتواصل: ${contact}\nنوع الخدمة: ${svc}\nالفكرة: ${msg}`
  },
  en:{
    logoText:"Eng. Salim Alabri", nav1:"About", nav2:"Projects", nav3:"Services", nav4:"Workshops", nav5:"Achievements", nav6:"Contact", nav7:"Gallery",
    heroKicker:"Electronics Engineering · AI · Innovation",
    heroName1:"Eng. Salim", heroName2:"Alabri",
    heroTagline:"From idea to a working prototype.",
    heroDesc:"I help individuals and organizations turn ideas into practical solutions using AI, electronics, IoT and software.",
    heroBtn1:"Explore my work", heroBtn2:"Get in touch",
    stat1:"Projects shipped", stat2:"Workshops led", stat3:"Training hours", stat4:"Events & talks",
    aboutEyebrow:"About",
    aboutTitle:"An engineer who takes an idea all the way to a real prototype",
    aboutP1:"I'm Salim Alabri, focused on building and developing technical solutions — turning ideas into working prototypes and real projects, with an emphasis on AI, embedded systems, IoT, electronics, platform development, and 3D printing.",
    aboutP2:"I also work in training and workshops, supporting innovation and student/technical projects through Switch, my educational technology initiative.",
    expEyebrow:"Expertise", expTitle:"Tools and domains I work with daily",
    projEyebrow:"Projects", projTitle:"Projects & platforms",
    projSub:"A selected set of projects across AI, IoT, and interactive applications.",
    filterAll:"All",
    svcEyebrow:"Services", svcTitle:"How can I help you?", svcCta:"Request service",
    wkspEyebrow:"Training & Workshops", wkspTitle:"Hands-on, practical training programs", wkspCta:"Ask about this workshop",
    nav8:"Store",
    storeEyebrow:"Store", storeTitle:"Arduino Kit — Start Your Electronics Journey",
    storeSub:"Everything you need to learn electronics and programming in one place, with an optional online workshop.",
    storeKitTag:"Arduino Kit · Electronics", storeKitName:"Arduino Kit by Switch",
    storeKitDesc:"A complete learning kit to start your journey in electronics and programming, with beginner-friendly guidance and hands-on projects you build step by step.",
    storeKitPriceLabel:"Kit price", storeCurrency:"OMR", storeAddWorkshopLabel:"Add the online workshop (3 days)",
    storeTotalLabel:"Total", storeQty:"Quantity", storeNotes:"Notes (optional)", storeSubmit:"Send kit request",
    storeYes:"Yes", storeNo:"No",
    waMsgStore:(name,qty,addon,notes,total)=>`Hi, I'd like to order the Arduino Kit.\nName: ${name}\nQuantity: ${qty}\nAdd online workshop: ${addon}\nNotes: ${notes||'-'}\nEstimated total: ${total}`,
    tlEyebrow:"Participation & Achievements", tlTitle:"Milestones & appearances",
    galEyebrow:"Gallery", galTitle:"Moments from projects and workshops",
    ctEyebrow:"Contact", ctTitle:"Have an idea? Let's turn it into a real project.",
    ctDesc:"Tell me about your idea or project, and we'll figure out the best way to build it together.",
    fName:"Name", fContact:"Phone / Email", fService:"Service type", fMsg:"Describe your idea",
    fSubmit:"Send inquiry", fNote:"Send your inquiry and I will review it and contact you by email or phone.",
    fSent:"Your request was received and is under review.",
    footText:"© 2026 Eng. Salim Alabri — Switch. All rights reserved.",
    modalProblem:"Problem", modalSolution:"Solution", modalResult:"Result",
    waMsg:(name,contact,svc,msg)=>`Hi Salim, my name is ${name}.\nContact: ${contact}\nService: ${svc}\nIdea: ${msg}`
  }
};

const expertiseData = [
  {icon:'ai', ar:['الذكاء الاصطناعي','Machine Learning · LLMs'], en:['Artificial Intelligence','Machine Learning · LLMs']},
  {icon:'chip', ar:['الأنظمة المدمجة','Embedded Systems'], en:['Embedded Systems','Firmware · Sensors']},
  {icon:'iot', ar:['إنترنت الأشياء','IoT Networks'], en:['IoT','Connected Devices']},
  {icon:'code', ar:['Arduino / ESP32','Firmware Development'], en:['Arduino / ESP32','Firmware Development']},
  {icon:'chip', ar:['تطوير المنصات','Web Applications'], en:['Web Applications','Dashboards · APIs']},
  {icon:'cube', ar:['الطباعة ثلاثية الأبعاد','Prototyping'], en:['3D Printing','Rapid Prototyping']},
  {icon:'bulb', ar:['الابتكار','Product Thinking'], en:['Innovation','Product Thinking']},
  {icon:'train', ar:['التدريب والورش','Technical Training'], en:['Training','Workshops & Mentoring']},
];

const servicesData = [
  {visual:'ai', ar:'تطوير حلول الذكاء الاصطناعي', en:'AI Solution Development',
    descAr:'بناء نماذج ذكاء اصطناعي وتطبيقات تعتمد على التعلم الآلي لحل مشكلات حقيقية.',
    descEn:'Building AI models and machine-learning-driven applications that solve real problems.'},
  {visual:'electronics', ar:'الإلكترونيات وإنترنت الأشياء', en:'Electronics & IoT',
    descAr:'تصميم دارات وأنظمة متصلة تجمع البيانات وتتحكم بالأجهزة عن بعد.',
    descEn:'Designing circuits and connected systems that collect data and control devices remotely.'},
  {visual:'arduino', ar:'برمجة Arduino و ESP32', en:'Arduino / ESP32 Development',
    descAr:'برمجة وحدات التحكم الدقيقة وبناء نماذج أولية قابلة للتطوير.',
    descEn:'Programming microcontrollers and building scalable hardware prototypes.'},
  {visual:'web', ar:'تطوير المنصات والمواقع', en:'Web Platforms',
    descAr:'مواقع ولوحات تحكم تفاعلية وسريعة، مبنية بعناية من الفكرة حتى الإطلاق.',
    descEn:'Fast, interactive websites and dashboards, built carefully from idea to launch.'},
  {visual:'3d', ar:'الطباعة ثلاثية الأبعاد والنمذجة', en:'3D Printing & Prototyping',
    descAr:'تصميم نماذج ثلاثية الأبعاد وطباعتها لتحويل الفكرة إلى مجسم ملموس.',
    descEn:'Designing and printing 3D models to turn an idea into a physical object.'},
  {visual:'innovation', ar:'الابتكار', en:'Innovation',
    descAr:'استشارات لتطوير الأفكار وتحويلها إلى مشاريع قابلة للتنفيذ.',
    descEn:'Consulting to develop ideas and turn them into workable projects.'},
  {visual:'training', ar:'التدريب والورش', en:'Training & Workshops',
    descAr:'ورش تدريبية عملية في الإلكترونيات والذكاء الاصطناعي وإنترنت الأشياء.',
    descEn:'Hands-on training workshops in electronics, AI, and IoT.'},
];

const workshopsData = [
  {icon:'ai', color:0, ar:{title:'ورشة أساسيات الذكاء الاصطناعي',aud:'طلاب وهواة',dur:'٦ ساعات',desc:'مقدمة عملية لبناء أول نموذج ذكاء اصطناعي بسيط.'}, en:{title:'AI Fundamentals Workshop',aud:'Students & enthusiasts',dur:'6 hours',desc:'A hands-on intro to building a first simple AI model.'}},
  {icon:'iot', color:1, ar:{title:'ورشة إنترنت الأشياء وESP32',aud:'طلاب هندسة',dur:'٨ ساعات',desc:'بناء مشروع IoT كامل من الصفر حتى لوحة تحكم حية.'}, en:{title:'IoT & ESP32 Workshop',aud:'Engineering students',dur:'8 hours',desc:'Build a complete IoT project from scratch to a live dashboard.'}},
  {icon:'cube', color:2, ar:{title:'ورشة النمذجة والطباعة 3D',aud:'مبتدئين',dur:'٤ ساعات',desc:'تصميم نموذج ثلاثي الأبعاد بسيط وطباعته عمليًا.'}, en:{title:'3D Modeling & Printing Workshop',aud:'Beginners',dur:'4 hours',desc:'Design a simple 3D model and print it hands-on.'}},
];

const timelineData = [
  {ar:{date:'2026',title:'إطلاق مبادرة Switch التعليمية',desc:'تأسيس مبادرة تعليمية تقنية لدعم المجتمع العماني بالورش والاستشارات.'},en:{date:'2026',title:'Launched the Switch educational initiative',desc:'Founded a technical education initiative to support the Omani community with workshops and consulting.'}},
  {ar:{date:'2025',title:'مشاركة في معسكر ابتكار تقني',desc:'تقديم مشروع الخوذة الذكية ضمن معسكر ابتكار إقليمي.'},en:{date:'2025',title:'Participated in an innovation bootcamp',desc:'Presented the Smart Helmet project at a regional innovation bootcamp.'}},
  {ar:{date:'2025',title:'تدريب طلابي في الأنظمة المدمجة',desc:'الإشراف على مجموعة من المشاريع الطلابية في الإلكترونيات وIoT.'},en:{date:'2025',title:'Student training in embedded systems',desc:'Supervised a cohort of student projects in electronics and IoT.'}},
  {ar:{date:'2024',title:'ورشة ذكاء اصطناعي لطلاب المدارس',desc:'تقديم ورشة تعريفية بالذكاء الاصطناعي لطلاب المرحلة الثانوية.'},en:{date:'2024',title:'AI workshop for school students',desc:'Delivered an introductory AI workshop for high-school students.'}},
  {ar:{date:'2024',title:'تطوير أول نموذج IoT متكامل',desc:'إنجاز أول مشروع IoT متكامل من التصميم حتى النشر.'},en:{date:'2024',title:'First full IoT prototype',desc:'Completed a first end-to-end IoT project from design to deployment.'}},
];

const galleryData = [
  {icon:'helmet',h:220,color:0,ar:'خوذة السلامة الذكية',en:'Smart safety helmet'},
  {icon:'iot',h:170,color:1,ar:'ورشة إنترنت الأشياء',en:'IoT workshop'},
  {icon:'cube',h:200,color:2,ar:'نموذج مطبوع 3D',en:'3D printed model'},
  {icon:'chip',h:150,color:3,ar:'لوحة إلكترونية',en:'Circuit board'},
  {icon:'ai',h:190,color:0,ar:'جلسة تدريب AI',en:'AI training session'},
  {icon:'glove',h:230,color:1,ar:'اختبار القفاز الذكي',en:'Smart glove testing'},
  {icon:'bell',h:160,color:2,ar:'واجهة تطبيق Notify',en:'Notify app interface'},
  {icon:'puzzle',h:200,color:3,ar:'لعبة قريتنا الجميلة',en:'Our Beautiful Village game'},
];

const WHATSAPP_NUMBER = '96894144778'; /* 968 = Oman country code + 94144778 */
const socialData = [
  {icon:'whatsapp', href:`https://wa.me/${WHATSAPP_NUMBER}`, ar:['واتساب','94144778'], en:['WhatsApp','94144778']},
  {icon:'instagram', href:'https://instagram.com/S_MR8', ar:['انستغرام','@S_MR8'], en:['Instagram','@S_MR8']},
  {icon:'mail', href:'mailto:3labri1996@gmail.com', ar:['البريد الإلكتروني','3labri1996@gmail.com'], en:['Email','3labri1996@gmail.com']},
];

/* =========================================================
   STATE & RENDER
   ========================================================= */
let currentLang = 'ar';

function renderExpertise(){
  document.getElementById('expGrid').innerHTML = expertiseData.map(e=>{
    const t = e[currentLang];
    return `<div class="exp-card reveal"><div class="exp-icon">${ICON[e.icon]}</div><h4>${t[0]}</h4><p>${t[1]}</p></div>`;
  }).join('');
}

let activeFilter='all';
let showAllProjects=false;
function renderFilters(){
 const labels=currentLang==='ar'?['الكل','المنصات','المشاريع التطبيقية']:['All','Platforms','Applied projects'];
 document.getElementById('filters').innerHTML=['all','platform','hardware'].map((cat,i)=>`<button type="button" class="filter-btn ${cat===activeFilter?'active':''}" aria-pressed="${cat===activeFilter}" data-cat="${cat}">${labels[i]}</button>`).join('');
 document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.cat;showAllProjects=false;renderFilters();renderProjects();}));
}
function projMediaHTML(p){return p.image?`<img src="${p.image}" alt="${p[currentLang].title}" loading="lazy" decoding="async">`:ICON[p.icon];}
function renderProjects(){
 const all=activeFilter==='all'?projectsData:projectsData.filter(p=>p.kind===activeFilter);
 const list=showAllProjects?all:all.slice(0,4);
 document.getElementById('projGrid').innerHTML=list.map(p=>`<article class="proj-card reveal">
 <button type="button" class="project-open" data-project="${projectsData.indexOf(p)}" aria-label="${p[currentLang].title}"><div class="proj-media ${p.screenshot?'screenshot-media':p.kind==='platform'?'platform-media':''} ${p.image?'has-photo':''}">${projMediaHTML(p)}</div></button>
 <div class="proj-body"><span class="project-kind">${p.logo?`<img class="project-logo" src="${p.logo}" alt="">`:ICON[p.icon]||ICON.code}<span>${p[currentLang].tag}</span></span><h3>${p[currentLang].title}</h3><p>${p[currentLang].desc}</p><button type="button" class="proj-link" data-project="${projectsData.indexOf(p)}">${currentLang==='ar'?'استكشف الفكرة':'Explore the idea'} ${ICON.arrow}</button></div></article>`).join('');
 document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openModal(projectsData[Number(b.dataset.project)])));
 const more=document.getElementById('projectsMore');more.hidden=all.length<=4;more.textContent=currentLang==='ar'?(showAllProjects?'عرض مختصر':'عرض جميع الأعمال'):(showAllProjects?'Show fewer':'View all work');
 more.onclick=()=>{showAllProjects=!showAllProjects;renderProjects();if(!showAllProjects)document.getElementById('projects').scrollIntoView();};
 observeReveals();
}
let projectTrigger;
function openModal(p){
 projectTrigger=document.activeElement;const t=p[currentLang],dict=i18n[currentLang],box=document.getElementById('modalOverlay');
 document.getElementById('modalContent').innerHTML=`<button type="button" class="modal-close" id="modalCloseBtn" aria-label="${currentLang==='ar'?'إغلاق':'Close'}">×</button><div class="modal-media">${projMediaHTML(p)}</div><h3 id="projectDialogTitle">${t.title}</h3><p>${t.desc}</p>${t.overview?`<p class="project-overview">${t.overview}</p>`:''}${(p.gallery||[]).map(g=>`<figure class="project-screenshot"><img src="${g.image}" alt="${g[currentLang]}" loading="lazy" decoding="async"><figcaption>${g[currentLang]}</figcaption></figure>`).join('')}`;
 box.inert=false;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','projectDialogTitle');box.classList.add('open');
 document.getElementById('modalCloseBtn').addEventListener('click',closeModal);document.getElementById('modalCloseBtn').focus();
}
function closeModal(){const box=document.getElementById('modalOverlay');box.classList.remove('open');box.inert=true;projectTrigger?.focus();}
 document.getElementById('modalOverlay').inert=true;
 document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target.id==='modalOverlay')closeModal();});
 document.addEventListener('keydown',e=>{if(!document.getElementById('modalOverlay').classList.contains('open'))return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){e.preventDefault();document.getElementById('modalCloseBtn').focus();}});

function renderServices(){
  document.getElementById('svcGrid').innerHTML = servicesData.map((s,i)=>{
    const label = currentLang==='ar'?s.ar:s.en;
    const desc = currentLang==='ar'?s.descAr:s.descEn;
    return `<div class="svc-card reveal" data-service="${s.visual}">
      <div class="svc-body">
        <div>
          <h4><button type="button" class="service-select" aria-controls="servicePreview" aria-pressed="false">${label}</button></h4>
          <p>${desc}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderWorkshops(){
  document.getElementById('wkspGrid').innerHTML = workshopsData.map(w=>{
    const t=w[currentLang];
    return `<div class="wksp-card reveal">
      <div class="wksp-media"><img src="assets/images/concepts/workshop-${({ai:'ai',iot:'iot',cube:'3d'})[w.icon]}.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async"></div>
      <div class="wksp-body">
        <div class="wksp-meta"><span>${t.aud}</span><span>·</span><span>${t.dur}</span></div>
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
        <a href="#contact" class="proj-link">${i18n[currentLang].wkspCta} ${ICON.arrow}</a>
      </div>
    </div>`;
  }).join('');
}

/* ============ STORE ============ */
const KIT_PRICE = 19.900;
const WORKSHOP_PRICE = 59.000;
const storeContentsData = [
  {ar:'لوحة أردوينو أونو', en:'Arduino UNO Board'},
  {ar:'بورد تجارب Breadboard', en:'Breadboard'},
  {ar:'شاشة LCD 16x2', en:'LCD 16x2 Display'},
  {ar:'طنان Buzzer', en:'Buzzer'},
  {ar:'لمبات LED ملونة', en:'Colored LEDs'},
  {ar:'مقاومات Resistors', en:'Resistors'},
  {ar:'زر ضغط Push Button', en:'Push Button'},
  {ar:'مقاومة متغيرة Potentiometer', en:'Potentiometer'},
  {ar:'سيرفو موتور SG90', en:'SG90 Servo Motor'},
  {ar:'حساس غاز MQ-2', en:'MQ-2 Gas Sensor'},
  {ar:'أسلاك توصيل Jumper Wires', en:'Jumper Wires'},
  {ar:'كابل USB', en:'USB Cable'},
];

function fmtOMR(n){ return n.toFixed(3); }

function renderStoreContents(){
  document.getElementById('storeContents').innerHTML = storeContentsData.map(c=>
    `<li>${currentLang==='ar'?c.ar:c.en}</li>`
  ).join('');
}

function updateStoreTotal(){
  const qty = Math.max(1, parseInt(document.getElementById('storeQty').value,10) || 1);
  const addOn = document.getElementById('storeAddWorkshop').checked;
  const total = KIT_PRICE*qty + (addOn?WORKSHOP_PRICE:0);
  const label = `${fmtOMR(total)} ${i18n[currentLang].storeCurrency}`;
  document.getElementById('storeTotal').textContent = label;
  document.getElementById('storeTotalHidden').value = label;
  document.getElementById('storeAddWorkshopHidden').value = addOn ? i18n[currentLang].storeYes : i18n[currentLang].storeNo;
}

function initStore(){
  document.getElementById('storeKitPriceDisplay').textContent = fmtOMR(KIT_PRICE);
  renderStoreContents();

  // carousel
  const track = document.getElementById('storeTrack');
  const slides = track.querySelectorAll('.store-slide');
  const dotsWrap = document.getElementById('storeDots');
  dotsWrap.innerHTML = Array.from(slides).map((_,i)=>`<span class="store-dot${i===0?' active':''}" data-i="${i}"></span>`).join('');
  const dots = dotsWrap.querySelectorAll('.store-dot');
  function goTo(i){ track.scrollTo({left: track.clientWidth*i, behavior:'smooth'}); }
  document.getElementById('storePrev').addEventListener('click',()=>{
    const i = Math.round(track.scrollLeft/track.clientWidth);
    goTo(Math.max(0, i-1));
  });
  document.getElementById('storeNext').addEventListener('click',()=>{
    const i = Math.round(track.scrollLeft/track.clientWidth);
    goTo(Math.min(slides.length-1, i+1));
  });
  dots.forEach(d=>d.addEventListener('click',()=>goTo(parseInt(d.dataset.i,10))));
  track.addEventListener('scroll',()=>{
    const i = Math.round(track.scrollLeft/track.clientWidth);
    dots.forEach((d,idx)=>d.classList.toggle('active', idx===i));
  }, {passive:true});

  // price calc
  document.getElementById('storeQty').addEventListener('input', updateStoreTotal);
  document.getElementById('storeAddWorkshop').addEventListener('change', updateStoreTotal);
  updateStoreTotal();

}

function renderTimeline(){
  document.getElementById('timeline').innerHTML = timelineData.map(item=>{
    const t=item[currentLang];
    return `<div class="tl-item reveal"><div class="tl-dot"></div><div class="tl-date">${t.date}</div><h4>${t.title}</h4><p>${t.desc}</p></div>`;
  }).join('');
}


function galleryItems(){
  return projectsData.filter(p=>p.image).map(p=>({image:p.image,h:240,color:0,ar:p.ar.title,en:p.en.title}));
}
function renderGallery(){
  document.getElementById('galleryGrid').innerHTML = galleryItems().map((g,i)=>{
    const label = currentLang==='ar'?g.ar:g.en;
    const note = currentLang==='ar'?'رسم توضيحي':'Illustration';
    return '<button type="button" class="g-item reveal" data-gallery="'+i+'" style="height:'+g.h+'px;'+gradTile(g.color)+'"><span>'+label+(g.image?'':' · '+note)+'</span>'+(g.image?'<img src="'+g.image+'" alt="'+label+'" loading="lazy" decoding="async">':ICON[g.icon])+'</button>';
  }).join('');
  document.querySelectorAll('[data-gallery]').forEach(el=>el.addEventListener('click',()=>openLightbox(galleryItems()[Number(el.dataset.gallery)])));
}
let galleryTrigger;
function openLightbox(g){
  galleryTrigger=document.activeElement;
  const label=currentLang==='ar'?g.ar:g.en;
  const inner=document.getElementById('lightboxInner');
  inner.innerHTML=g.image?'<img src="'+g.image+'" alt="'+label+'">':ICON[g.icon];
  inner.style.cssText=gradTile(g.color);
  const box=document.getElementById('lightbox');
  box.setAttribute('aria-label',label);
  box.classList.add('open'); box.inert=false;
  document.getElementById('lightboxClose').focus();
}
function closeLightbox(){
  const box=document.getElementById('lightbox');
  box.classList.remove('open'); box.inert=true;
  galleryTrigger?.focus();
}
document.getElementById('lightboxClose').addEventListener('click',closeLightbox);
document.getElementById('lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')closeLightbox();});
document.addEventListener('keydown',e=>{
  const box=document.getElementById('lightbox');
  if(!box.classList.contains('open'))return;
  if(e.key==='Escape')closeLightbox();
  if(e.key==='Tab'){e.preventDefault();document.getElementById('lightboxClose').focus();}
});

function renderSocial(){
  document.getElementById('socialList').innerHTML = socialData.map(s=>{
    const t = currentLang==='ar'?s.ar:s.en;
    const soon = s.soon ? ' style="opacity:.5;pointer-events:none;"' : '';
    const target = s.soon ? '' : ' target="_blank" rel="noopener"';
    return `<a class="social-link" href="${s.href}"${target}${soon}>${ICON[s.icon]}<span><b>${t[0]}</b><span>${t[1]}</span></span></a>`;
  }).join('');
}
function renderServiceSelect(){
  const sel=document.getElementById('fService');
  const previous=sel.selectedIndex;
  sel.innerHTML = servicesData.map(s=>`<option>${currentLang==='ar'?s.ar:s.en}</option>`).join('');
  if(previous>=0&&previous<sel.options.length)sel.selectedIndex=previous;
}

/* =========================================================
   LANGUAGE TOGGLE
   ========================================================= */
function applyStaticI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(i18n[currentLang][key] !== undefined) el.textContent = i18n[currentLang][key];
  });
}
function renderAll(){
  applyStaticI18n();
  renderExpertise(); renderFilters(); renderProjects(); renderServices();
  renderWorkshops(); renderStoreContents(); updateStoreTotal();
  renderTimeline(); renderGallery(); renderSocial(); renderServiceSelect();
  observeReveals();
}
document.getElementById('langBtn').addEventListener('click', ()=>{
  currentLang = currentLang==='ar' ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang==='ar' ? 'rtl' : 'ltr';
  document.getElementById('langBtn').textContent = currentLang==='ar' ? 'EN' : 'AR';
  renderAll();
});

/* =========================================================
   NAV: mobile menu + scroll shadow
   ========================================================= */
const burger=document.getElementById('burgerBtn'), mmenu=document.getElementById('mobileMenu');
function setMobileMenu(open){mmenu.classList.toggle('open',open);mmenu.inert=!open;burger.setAttribute('aria-expanded',String(open));}
setMobileMenu(false);
burger.addEventListener('click',()=>setMobileMenu(!mmenu.classList.contains('open')));
mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMobileMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mmenu.classList.contains('open')){setMobileMenu(false);burger.focus();}});

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
let revealObserver;
function observeReveals(){
  if(!revealObserver){
    revealObserver = new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in');} else if(en.boundingClientRect.top > window.innerHeight){en.target.classList.remove('in');} });
    },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
  }
  document.querySelectorAll('.reveal:not(.in)').forEach(el=>revealObserver.observe(el));
}

/* =========================================================
   COUNT-UP STATS
   ========================================================= */
function countUp(el){
  const target = parseInt(el.dataset.count,10);
  const dur = 1400; const start = performance.now();
  function tick(now){
    const p = Math.min(1,(now-start)/dur);
    const eased = 1-Math.pow(1-p,3);
    el.textContent = Math.round(eased*target);
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver(entries=>{
  entries.forEach(en=>{ if(en.isIntersecting){countUp(en.target); statObserver.unobserve(en.target);} });
},{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>statObserver.observe(el));

/* =========================================================
   TRACE RAIL — activates pads as sections enter view
   ========================================================= */
(function initTrace(){
  const svg = document.getElementById('traceSvg');
  if(!svg) return;
  const sectionIds=['about','projects','services','workshops','achievements','gallery','contact'];
  const path = document.getElementById('tracePath');
  const pads=[];
  sectionIds.forEach((id,i)=>{
    const y = 60 + i*140;
    const pad = document.createElementNS('http://www.w3.org/2000/svg','circle');
    pad.setAttribute('cx',28); pad.setAttribute('cy',y); pad.setAttribute('r',6);
    pad.classList.add('trace-pad'); pad.dataset.sec=id;
    svg.appendChild(pad); pads.push(pad);
  });
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      const pad = pads.find(p=>p.dataset.sec===en.target.id);
      if(pad) pad.classList.toggle('active', en.isIntersecting);
    });
  },{threshold:.3});
  sectionIds.forEach(id=>{ const el=document.getElementById(id); if(el) obs.observe(el); });
})();

/* =========================================================
   HERO CANVAS — subtle AI-node / circuit background
   ========================================================= */
(function heroCanvas(){
  const canvas=document.getElementById('hero-canvas');
  if(!canvas||getComputedStyle(canvas).display==='none')return;
  const ctx=canvas.getContext('2d');
  let w,h,nodes=[];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){
    w=canvas.width=canvas.offsetWidth*devicePixelRatio;
    h=canvas.height=canvas.offsetHeight*devicePixelRatio;
  }
  function initNodes(){
    const count = Math.min(50, Math.floor((canvas.offsetWidth*canvas.offsetHeight)/22000));
    nodes = Array.from({length:count},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.25*devicePixelRatio, vy:(Math.random()-.5)*.25*devicePixelRatio,
      r: (Math.random()*1.6+.8)*devicePixelRatio
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>w) n.vx*=-1;
      if(n.y<0||n.y>h) n.vy*=-1;
    });
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
        const maxDist = 170*devicePixelRatio;
        if(dist<maxDist){
          ctx.strokeStyle=`rgba(63,224,208,${(1-dist/maxDist)*.16})`;
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n=>{
      ctx.fillStyle='rgba(255,138,70,.55)';
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    });
    if(!reduce) requestAnimationFrame(step);
  }
  window.addEventListener('resize',()=>{resize();initNodes();});
  resize(); initNodes();
  if(reduce){ step(); } else { requestAnimationFrame(step); }
})();

/* =========================================================
   INIT
   ========================================================= */
renderAll();
initStore();
