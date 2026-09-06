const projectsData = [
  {
    "cat": "web",
    "kind": "platform",
    "icon": "code",
    "color": 0,
    "image": "assets/images/0deef2b386513527.png",
    "ar": {
      "title": "معبر المدرسة التفاعلي",
      "tag": "منصة تعليمية",
      "desc": "منصة استقبال تفاعلية بشخصيات عُمانية، طُبّقت في المدارس والمعارض.",
      "overview": "تتيح اختيار شخصية الاستقبال ومعاينة الصوت وبدء تجربة الطالب وإعادتها من لوحة تشغيل واحدة."
    },
    "en": {
      "title": "Interactive School Gateway",
      "tag": "Learning platform",
      "desc": "An interactive welcome platform with Omani characters, used in schools and exhibitions.",
      "overview": "Select a welcome character, preview the voice, and start or reset the student experience from one control panel."
    },
    "techs": [],
    "logo": "assets/images/ac4311ae597072c1.png",
    "screenshot": true,
    "gallery": [
      {
        "image": "assets/images/9b648e119413be0e.png",
        "ar": "لوحة إدارة الاستقبال واختيار الشخصية",
        "en": "Reception controls and character selection"
      }
    ]
  },
  {
    "cat": "web",
    "kind": "platform",
    "icon": "code",
    "color": 0,
    "image": "assets/images/56a1493c72167873.png",
    "ar": {
      "title": "مساحة أُنس",
      "tag": "منصة تعليمية",
      "desc": "منصة تعلّم تفاعلية لذوي الإعاقة البصرية والسمعية وصعوبات النطق والتواصل، طُبّقت في المدارس والمعارض.",
      "overview": "تقدّم للمكفوفين مسارًا صوتيًا، وللصم مسارًا بصريًا، ولمن لا يستطيعون النطق أو يواجهون صعوبات فيه مسارًا للتواصل بالصور. تجمع أنشطة الطالب وأدوات المعلم في تجربة دامجة تراعي اختلاف طرق التعلّم والتواصل."
    },
    "en": {
      "title": "Uns Learning Space",
      "tag": "Learning platform",
      "desc": "An interactive learning platform for people with visual or hearing disabilities and speech or communication difficulties, used in schools and exhibitions.",
      "overview": "Offers an audio path for blind learners, a visual path for deaf learners, and picture-based communication for nonspeaking learners and those with speech difficulties. Brings student activities and teacher tools together in an inclusive experience that supports different ways of learning and communicating."
    },
    "techs": [],
    "logo": "assets/images/29ea988278c9bd3f.png",
    "screenshot": true,
    "gallery": [
      {
        "image": "assets/images/7bb6782a31c81061.png",
        "ar": "مسارات الوصول البصرية والصوتية والتواصل",
        "en": "Visual, audio and communication access paths"
      }
    ]
  },
  {
    "cat": "electronics",
    "kind": "hardware",
    "icon": "ai",
    "color": 0,
    "image": "assets/images/97f8e755105736a9.jpg",
    "ar": {
      "title": "التفاعل بإشارات اليد",
      "tag": "مشروع تطبيقي",
      "desc": "تجربة تعليمية لاختيار الألوان بإشارات اليد، تجعل الزائر جزءًا من العرض.",
      "overview": "تعرض الكاميرا حركة المشارك على الشاشة وتربط إشارته باختيار اللون في الواجهة التفاعلية."
    },
    "en": {
      "title": "Hand-gesture interaction",
      "tag": "Applied project",
      "desc": "A learning experience where visitors select colours with hand gestures.",
      "overview": "Shows the participant’s hand movement on screen and connects gestures to colour selection in the interface."
    },
    "techs": []
  },
  {
    "cat": "electronics",
    "kind": "hardware",
    "icon": "iot",
    "color": 0,
    "image": "assets/images/12d606db65bd438e.jpg",
    "ar": {
      "title": "القرية الذكية",
      "tag": "مشروع تطبيقي",
      "desc": "مجسّم قرية متصل بواجهة لمتابعة الطقس والحركة والتنبيهات.",
      "overview": "يوضّح فكرة إنترنت الأشياء من خلال مجسّم ملموس وشاشة تعرض حالة الحساسات في مكان واحد."
    },
    "en": {
      "title": "Smart Village",
      "tag": "Applied project",
      "desc": "A village model connected to a dashboard for weather, motion and alerts.",
      "overview": "Demonstrates IoT through a physical model and a single screen displaying sensor status."
    },
    "techs": []
  },
  {
    "cat": "iot",
    "icon": "helmet",
    "color": 0,
    "ar": {
      "title": "Sentinel Helmet AI — الخوذة الذكية",
      "tag": "IoT · Electronics",
      "desc": "نموذج خوذة ذكية يجمع الحساسات والتنبيهات مع لوحة متابعة لسلامة العامل.",
      "problem": "صعوبة رصد حوادث السلامة في بيئات العمل الميدانية بشكل لحظي.",
      "solution": "وحدة ESP32 مع حساسات ومؤشرات، متصلة بلوحة تحكم ويب تعرض البيانات مباشرة.",
      "result": "نموذج أولي يعمل بالكامل مع تنبيهات آنية وسجل بيانات حي.",
      "overview": "يجمع المشروع وحدة ESP32 والحساسات في خوذة فعلية لعرض القراءات والتنبيهات عبر لوحة التحكم."
    },
    "en": {
      "title": "Sentinel Helmet AI",
      "tag": "IoT · Electronics",
      "desc": "A smart helmet prototype combining sensors, alerts and a worker-safety dashboard.",
      "problem": "Hard to detect safety incidents on job sites in real time.",
      "solution": "ESP32-based unit with onboard sensors, streaming to a live web dashboard.",
      "result": "A fully working prototype with real-time alerts and live data logging.",
      "overview": "Integrates an ESP32 and sensors into a physical helmet to display readings and alerts through a dashboard."
    },
    "techs": [
      "ESP32",
      "C++",
      "IoT",
      "Sensors"
    ],
    "kind": "hardware",
    "image": "assets/images/4c44c55685cbc40c.jpg"
  },
  {
    "cat": "electronics",
    "icon": "glove",
    "color": 1,
    "ar": {
      "title": "القفاز الذكي — Smart Glove",
      "tag": "Electronics · Mobile App",
      "desc": "قفاز يحوّل إيماءات اليد إلى نص في تطبيق أندرويد عبر بلوتوث.",
      "problem": "صعوبة التواصل لدى مستخدمي لغة الإشارة في بعض السياقات.",
      "solution": "ESP32-C3 مع حساسات حركة، مقترن بتطبيق Android عبر BLE يترجم الإشارات فوريًا.",
      "result": "نظام يعمل بشكل مباشر لتحويل الإيماءات إلى نص مقروء.",
      "overview": "يربط حساسات القفاز بتطبيق الهاتف لتجربة تحويل مجموعة من الإيماءات إلى كلمات مقروءة."
    },
    "en": {
      "title": "Smart Glove",
      "tag": "Electronics · Mobile App",
      "desc": "A glove that turns hand gestures into text in an Android app over Bluetooth.",
      "problem": "Communication gaps for sign-language users in certain contexts.",
      "solution": "ESP32-C3 with motion sensors paired to an Android app via BLE, translating gestures in real time.",
      "result": "A working system that converts gestures into readable text on the fly.",
      "overview": "Connects glove sensors to a phone app to translate a set of gestures into readable words."
    },
    "techs": [
      "ESP32-C3",
      "BLE",
      "Android",
      "Kotlin"
    ],
    "kind": "hardware"
  },
  {
    "cat": "web",
    "icon": "bell",
    "color": 2,
    "ar": {
      "title": "SWITCH Notify",
      "tag": "Web · Mobile App",
      "desc": "تطبيق يربط Switch بمستخدميه عبر الإشعارات والتحديثات الفورية.",
      "problem": "حاجة Switch لقناة إشعارات فورية موثوقة مع الطلاب والعملاء.",
      "solution": "تطبيق Kotlin/Compose متكامل مع Firebase للإشعارات اللحظية والتحديثات.",
      "result": "قناة تواصل فعالة تصل للمستخدمين فور صدور أي تحديث.",
      "overview": "تطبيق أندرويد مبني باستخدام Kotlin وCompose ومتصل بـFirebase لإدارة وصول الإشعارات."
    },
    "en": {
      "title": "SWITCH Notify",
      "tag": "Web · Mobile App",
      "desc": "An app connecting Switch with its users through notifications and live updates.",
      "problem": "Switch needed a reliable real-time channel to reach students and clients.",
      "solution": "A Kotlin/Compose app integrated with Firebase for instant notifications and updates.",
      "result": "An effective channel that reaches users the moment an update goes out.",
      "overview": "An Android app built with Kotlin and Compose, connected to Firebase for notification delivery."
    },
    "techs": [
      "Kotlin",
      "Jetpack Compose",
      "Firebase"
    ],
    "kind": "platform"
  },
  {
    "cat": "ai",
    "icon": "puzzle",
    "color": 3,
    "ar": {
      "title": "قريتنا الجميلة",
      "tag": "AI · Education · Web",
      "desc": "لعبة عربية بأنشطة بصرية وتدرّج تعليمي، مصممة لأطفال طيف التوحد.",
      "problem": "ندرة أدوات تعليمية تفاعلية بالعربية موجهة لأطفال طيف التوحد.",
      "solution": "لعبة HTML تفاعلية قائمة بذاتها مصممة بعناية لتراعي الحمل الحسي والتعلم التدريجي.",
      "result": "أداة تعليمية جاهزة للاستخدام المباشر في البيئة التعليمية والمنزلية.",
      "overview": "تقدّم أنشطة تفاعلية في واجهة تراعي الحمل الحسي، للاستخدام في المنزل والبيئة التعليمية."
    },
    "en": {
      "title": "Our Beautiful Village",
      "tag": "AI · Education · Web",
      "desc": "An Arabic game with visual activities and gradual learning, designed for autistic children.",
      "problem": "A shortage of interactive Arabic-language learning tools for autistic children.",
      "solution": "A self-contained interactive HTML game, carefully designed around sensory load and gradual learning.",
      "result": "A ready-to-use tool for both classroom and home settings.",
      "overview": "Offers interactive activities in an interface designed around sensory load, for home and educational use."
    },
    "techs": [
      "HTML5",
      "JavaScript",
      "Instructional Design"
    ],
    "kind": "platform"
  },
  {
    "cat": "3d",
    "image": "assets/images/946660627de17fc8.webp",
    "ar": {
      "title": "طابعة ثلاثية الأبعاد DIY",
      "tag": "3D Printing · إلكترونيات",
      "desc": "طابعة مبنية يدويًا من قطع معاد استخدامها لإنتاج نماذج ثلاثية الأبعاد.",
      "problem": "تكلفة طابعات 3D الجاهزة مرتفعة على كثير من الطلاب والهواة المبتدئين.",
      "solution": "بناء طابعة كاملة من الصفر: هيكل، محركات خطوة، رأس طباعة، ولوحة تحكم بشاشة LCD.",
      "result": "طابعة تعمل فعليًا وتنتج قطعًا ثلاثية الأبعاد حقيقية بجودة جيدة.",
      "overview": "يشمل العمل تجميع الهيكل والمحركات ورأس الطباعة ووحدة التحكم، وصولًا إلى طباعة قطع فعلية."
    },
    "en": {
      "title": "DIY 3D Printer",
      "tag": "3D Printing · Electronics",
      "desc": "A hand-built printer using repurposed components to produce 3D models.",
      "problem": "Ready-made 3D printers are too costly for many students and beginner hobbyists.",
      "solution": "Built a complete printer from scratch: frame, stepper motors, print head, and an LCD control board.",
      "result": "A fully working printer that produces real 3D-printed parts at good quality.",
      "overview": "Includes assembling the frame, motors, print head and controller through to printing physical parts."
    },
    "techs": [
      "DIY Build",
      "Stepper Motors",
      "LCD Controller",
      "G-code"
    ],
    "kind": "hardware"
  },
  {
    "cat": "electronics",
    "image": "assets/images/848ddff4bf96384f.jpg",
    "ar": {
      "title": "روبوت تجنب العوائق",
      "tag": "Electronics · Robotics",
      "desc": "روبوت بعجلات يستشعر العوائق ويغيّر مساره تلقائيًا.",
      "problem": "تعليم أساسيات الروبوتكس والتحكم الآلي يحتاج مشروعًا عمليًا ملموسًا للمبتدئين.",
      "solution": "أردوينو مع حساسي مسافة HC-SR04 ومحركات DC، يقرر مسار الحركة بناءً على قراءات الحساسات لحظيًا.",
      "result": "روبوت يتحرك ويتفادى العوائق تلقائيًا بدون تدخل بشري.",
      "overview": "يجمع Arduino وحساسات المسافة والمحركات في مشروع عملي لتعليم الروبوتات والتحكم."
    },
    "en": {
      "title": "Obstacle-Avoidance Robot",
      "tag": "Electronics · Robotics",
      "desc": "A wheeled robot that senses obstacles and changes direction automatically.",
      "problem": "Teaching robotics and automated control basics needs a hands-on, tangible project for beginners.",
      "solution": "Arduino with dual HC-SR04 distance sensors and DC motors, deciding its path in real time from sensor readings.",
      "result": "A robot that drives and avoids obstacles fully autonomously, with no human input.",
      "overview": "Combines Arduino, distance sensors and motors in a practical robotics and control project."
    },
    "techs": [
      "Arduino UNO",
      "HC-SR04",
      "DC Motors",
      "C++"
    ],
    "kind": "hardware"
  }
];
