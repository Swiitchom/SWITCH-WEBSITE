# موقع سالم مرهون العبري

الموقع مرتبط بـFirebase وCloudflare Pages داخل حساب المالك 3labri1996@gmail.com. المشروع salimalabri مرتبط بفرع main من مستودع Swiitchom/SWITCH-WEBSITE للنشر التلقائي. عنوان الإنتاج: https://salimalabri.pages.dev .

## نقل الاستضافة إلى Cloudflare — 7 سبتمبر 2026

- نقطة الطلب الموحدة هي /api/inquiry. دالة Pages في functions/api/inquiry.js تستخدم Web Crypto وFirestore REST، دون تضمين Firebase Admin في حزمة الحافة.
- يظل التحقق من المدخلات وحساب سعر المتجر مشتركًا مع دالة Netlify السابقة. إعادة إرسال المعرف نفسه لا تنشئ طلبًا مكررًا، وتغيير بيانات طلب محفوظ يعيد 409.
- تُكتب بيانات الطلب وحد الإرسال في عملية ذرية مع شروط نسخ المستندات. تمنع الطلبات المتزامنة تجاوز خمسة طلبات لكل بصمة IP خلال ساعة. يُستخدم عنوان Cloudflare الموثوق، ولا يُحفظ عنوان IP الخام.
- متغيرا الإنتاج المطلوبان: SITE_URL (أصل رابط الموقع العام) وFIREBASE_SERVICE_ACCOUNT_JSON (سر الخادم فقط). لا تضف سر الإنتاج إلى معاينات الفروع أو Git.
- إعداد البناء: Framework preset = None، الفرع main، أمر البناء npm test، مجلد الإخراج public، Node.js 22. اتصال GitHub مفعّل؛ نشر معاينات الفروع معطل.
- ملف public/_routes.json يقصر الدوال على /api/*؛ ملفات الصور والصفحة تُقدم كملفات ثابتة.
- نجحت الاختبارات العشرون وبناء Pages Functions باستخدام Wrangler. نجح حفظ طلب اصطناعي وقراءته من Firebase عبر المسار الجديد، وفحص وقت الخادم وعدم التكرار وتعارض المعرف، ثم حُذفت سجلات الاختبار.
- تبقى إعدادات Netlify القديمة كخيار رجوع؛ أضيف تحويل للمسار الموحد كي تظل متوافقة. لا تعني هذه التهيئة أن النسخة الجديدة نُشرت على Netlify.

## لوحة الطلبات وتأكيد Gmail

- لوحة خاصة في /admin/ تعرض أحدث الطلبات مع تحميل الأقدم، والبحث ضمن الطلبات المحمّلة، والتصفية، والملاحظات، وحالات جديد/قيد التواصل/قيد التنفيذ/مكتمل/مؤرشف. رابط /admin/?request=UUID يفتح الطلب بعد تسجيل الدخول.
- الدخول مقصور على 3labri1996@gmail.com. التحقق من Google ID token يتم على الخادم عبر jose، مع فحص التوقيع والمصدر والجمهور وnonce والبريد الموثق. جلسات HttpOnly/Secure مدتها 8 ساعات، وحماية OAuth state وPKCE، ورفض الكتابة من أصل آخر. تظل قواعد Firestore رافضة للوصول العام.
- المرجع الظاهر SAL-1001 وما بعده يُخصص من عداد ذري مع حفظ الطلب؛ تكرار الإرسال يحتفظ بالمرجع ذاته. المعرف التقني يبقى داخليًا. الأرقام ليست أرقام فواتير وقد تحتوي فجوات بعد الاختبارات.
- أزيل تحويل واتساب من نجاح النموذج. تظهر رسالة استلام ومرجع واضح، ويبقى التواصل المباشر الموجود في الموقع متاحًا.
- يستخدم Gmail صلاحية gmail.send مع openid/email للتحقق من حساب المالك، دون صلاحيات قراءة البريد. يُحفظ refresh token مشفرًا في portfolioSettings/gmail ولا يصل إلى JavaScript العام أو Git. رابط تفويض Gmail متاح بعد دخول المالك فقط.
- التأكيد برسالة عربية أو إنجليزية حسب لغة النموذج، يشمل الاسم والخدمة والمرجع دون إعادة نشر نص الاستفسار. بعد الحفظ تُجرى محاولة الإرسال بالخلفية؛ فشل البريد لا يُلغي الطلب. حد التطبيق 50 محاولة يوميًا، وثلاث محاولات كحد أقصى للطلب. إعادة المحاولة اليدوية متاحة للحالات pending/failed؛ النتيجة المبهمة unknown لا تُعاد تلقائيًا لتجنب الازدواج، وتحتاج مراجعة «المرسلة» في Gmail.
- sent تعني قبول Gmail للرسالة، ولا تضمن وصولها إلى الوارد. الطلبات السابقة لا يُرسل لها بريد تلقائيًا. إشعارات المالك والملخص اليومي ليست مفعلة؛ يراجع الطلبات من اللوحة حسب وقته.
- متغيرات الخادم الإضافية: GOOGLE_CLIENT_ID وGOOGLE_CLIENT_SECRET وADMIN_SESSION_SECRET (سر عشوائي طويل يُحفظ ولا يُغيّر اعتباطيًا لأنه يحمي الجلسات وتشفير التفويض). جميعها في production فقط. رابط OAuth المعتمد: https://salimalabri.pages.dev/api/google/callback . يجب تفعيل Gmail API في مشروع Google نفسه.
- يجب إكمال إعداد الجمهور في Google وتفويض المالك. وضع Testing قد يجعل تفويض Gmail ينتهي بعد أسبوع؛ إعداد Production للاستخدام الخاص يراجع وفق سياسة Google، ولا تعني حالة Production نشر لوحة الطلبات للعموم.
- سياسة البيانات في /privacy/، واللوحة مستبعدة من الفهرسة والتحليلات. التصميم يحافظ على الألوان والخط ويدعم RTL وLTR والجوال.

## التشغيل

يتطلب Node.js 22 أو أحدث. ثبّت الاعتماديات باستخدام npm ci ثم npm test وnpm start.
المعاينة: http://127.0.0.1:4173 .

## المحتوى والتصميم

- public/assets/projects.js: 10 مشاريع ومنصات؛ تتضمن المشاريع الستة السابقة والمنصتين المستخرجتين من اختصارات سطح المكتب والصور الجديدة. أزيلت الوحدتان الإلكترونيتان بناءً على طلب صاحب الموقع. أضيفت لقطات المنصتين وصورة الخوذة، وبقي القفاز بأيقونته دون صورة.
- المنصتان تطبيقان محليان؛ الأيقونات ولقطات الواجهات أصلية، وأكد صاحب الموقع تطبيق المنصات في المدارس والمعارض. لا توجد روابط ويب أو تنزيل وهمية.
- public/assets/participation-data.js: صور المشاركات العشر مع أوصاف عامة.
- participation-ribbon.js وportfolio-flow.css: الصور الأصلية داخل شريط متحرك بعرض الصفحة، مع السحب والتكبير. يتوقف مؤقتًا عند مرور المؤشر لتسهيل الاختيار، وتتحول الصور إلى مسار قابل للتنقل عند استخدام لوحة المفاتيح. النسخة المكررة للحركة مستبعدة من تسلسل لوحة المفاتيح وقارئ الشاشة.
- portfolio-flow.js: معاينات الخدمات تتبدل تلقائيًا، وزر طلب واحد يحتفظ باختيار الزائر الصريح مستقلًا عن حركة المعاينة. أسهم المنصات تعرض الصور الإضافية عند مرور المؤشر أو التركيز، وتعيد الصورة الأساسية عند المغادرة؛ اللمس يبدّل المعاينة بالنقر. يبقى فتح تفاصيل المشروع متاحًا.
- يبدأ المحتوى بعد الشريط المتحرك بقسم من أنا، ثم الخبرات والخدمات والمشاريع والمشاركات. refined-flow.css يضيف مسارات رأسية خافتة وصور تعريف مبسطة، موثّقة في MINIMAL-IMAGE-PROMPTS.md.
- refinement.css: خط موحد وألوان خضراء ونحاسية هادئة، وصور كاملة دون إطارات أو اقتصاص.
- تعرض الصفحة أربعة مشاريع أولًا، مع فلتر للمنصات والمشاريع التطبيقية وزر عرض البقية. أزيلت الأرقام من المقدمة.
- المقدمة تتضمن شريط عبارات بعرض الصفحة يتحرك باستمرار بالعربية والإنجليزية. وفق طلب صاحب الموقع الصريح، intro-motion.css يستثني هذا الشريط وحده من قواعد تقليل الحركة العامة؛ بقية المؤثرات تحترم الإعداد. أزيل الرسم الزخرفي خلف الصورة، ويزيل مرشح عرض حافة القص البيضاء دون تعديل ملف الصورة أو الملامح. فُحص ظهور الشريط عبر دورة الحركة كاملة على الكمبيوتر والجوال.
- showcase.css وshowcase.js: حركة موحدة مستوحاة من Dennis Snellenberg؛ مشاهد مشاريع تثبت وتتتابع أثناء التمرير على الشاشات الواسعة، أزرار تتبع المؤشر قليلًا، ومؤشر استكشاف فوق صور الأعمال. الجوال يعرض المشاريع بالتتابع الطبيعي. إعداد تقليل الحركة يعطّل التثبيت والمؤثرات، وتبقى المشاريع والفلاتر والنماذج كما هي.

## الطلبات وFirebase

طلب الخدمة يجمع الاسم والهاتف والبريد والاستفسار والموافقة على حفظ بيانات التواصل، ويحفظ اسم الخدمة والقسم المصدر. المتجر يجمع بيانات التواصل كذلك. يظهر مرجع واضح بعد استجابة حفظ ناجحة من الخادم، وتُحاول خدمة البريد إرسال التأكيد عند اكتمال تفويض Gmail. عند الفشل تبقى البيانات في النموذج ولا تظهر رسالة نجاح. النسخة المحلية غير المهيأة تعيد 503 ولا تحاكي الحفظ.

الدالة functions/api/inquiry.js تستخدم Firestore REST على خادم Cloudflare، وتحفظ الطلبات في portfolioInquiries مع الحالة new ووقت الخادم. لا تسمح الواجهة العامة بقراءة الطلبات. راجع الطلبات من لوحة Firebase المصرح بها. يرسل Gmail إشعارًا مختصرًا للمالك يتضمن الخدمة والقسم ورابط الطلب الخاص، وتأكيدًا مستقلًا للعميل. إشعارات FCM ليست مفعلة.

إعدادات التشغيل والمتابعة:

1. تم تحديد مشروع Firebase المملوك لصاحب الموقع وتفعيل Firestore واختبار الاتصال به.
2. تم ضبط FIREBASE_SERVICE_ACCOUNT_JSON كمتغير سري في الاستضافة فقط؛ لا يوضع في public أو Git أو المحادثة.
3. تم ضبط SITE_URL على https://salimalabri.pages.dev . اعتماد الإنتاج لا يُوزع على معاينات الفروع.
4. دمج قواعد firestore.portfolio.rules مع القواعد الحالية بعناية، والتأكد من عدم وجود قاعدة أوسع تسمح بالوصول لهذه المجموعات. لا تستبدل قواعد مشاريع أخرى بهذا الملف.
5. اختيار TTL للحقل expiresAt في portfolioRateLimits لتنظيف السجلات. الحذف ليس شرطًا لصحة حساب حد الطلبات.
6. نجح الاختبار من مسار Cloudflare المحلي إلى قاعدة Firestore الحقيقية. للتحقق بعد أي نشر، أرسل طلبًا تجريبيًا وتأكد من حفظه وظهور مرجع الطلب وحالتي إرسال البريد للمالك والعميل في اللوحة الخاصة.

يتحقق الخادم من المدخلات ومصدر الطلب وحقل مكافحة الرسائل الآلية وحجم الطلب. يُطبّق حد خمسة طلبات في الساعة لكل بصمة IP باستخدام معاملة Firestore، ويحسب سعر المتجر على الخادم. معرف الطلب يمنع تكرار الحفظ عند إعادة محاولة الطلب نفسه. لا يُسجل محتوى الطلبات في سجلات الأخطاء.

مراجع: https://firebase.google.com/docs/admin/setup وhttps://firebase.google.com/docs/firestore/security/rules-conditions .

## GitHub والنشر

المستودع المعتمد: https://github.com/Swiitchom/SWITCH-WEBSITE وفرعه main، تحت حساب المالك Swiitchom. مشروع Cloudflare Pages: salimalabri، متصل بالمستودع مباشرة. كل دفع إلى main يشغّل npm test وينشر public مع دوال functions. أسرار Firebase مخزنة في إعدادات production فقط. لا يلزم اشتراك مدفوع للبدء ضمن حصص الخطة المجانية؛ الاستخدام فوق الحصص يخضع لقيود المزود.

العنوان المعتمد في canonical وOpen Graph وrobots وsitemap: https://salimalabri.pages.dev . الموقع السابق على Netlify محتفظ به للرجوع؛ نشره السابق تعطل بسبب نفاد رصيد الاستضافة.

التحليلات تستخدم G-RSGND37FQ5 على نطاق الإنتاج فقط وبعد موافقة الزائر. البيانات المرسلة لا تتضمن الاسم أو البريد أو الهاتف أو الاستفسار، ولا query أو fragment. حدث generate_lead يصدر بعد حفظ ناجح فقط مع form_name وlead_source وservice_key من قائمة ثابتة للخدمات والورش. يجب تعريف service_key وlead_source كأبعاد مخصصة على مستوى الحدث في Google Analytics عند إعداد تقارير مفصلة. الرفض وسحب الموافقة متاحان. اختبارات الوحدة تحاكي Google tag. فحص الإنتاج الفعلي يسجل زيارة اختبار وطلبًا محددًا؛ استجابة 204 تثبت قبول نقطة جمع Google، ويُتحقق من ظهور التقارير داخل حساب مالك Analytics بشكل منفصل.

طلبات العملاء تظهر في اللوحة الخاصة /admin/ بعد تسجيل الدخول، وفي Firebase Console ضمن portfolioInquiries. الاشتراك التسويقي غير مفعّل. إشعار المالك يعمل للطلبات الجديدة فقط؛ الطلبات السابقة لا تُرسل لها تنبيهات بأثر رجعي.

## التحقق

اختُبر التحديث الأخير في Chrome عبر Playwright عند 1440×900 و390×844، بما يشمل تفعيل تقليل الحركة: حركة شريط الصور، السحب دون فتح صورة بالخطأ، التكبير، تبدل أمثلة الخدمات السبعة، وصول الخدمة المختارة للنموذج، اللغتان، ثبات المعاينة على الجوال، وتبدل لقطات المنصات. نجحت الاختبارات الأربعة عشر. اتصال أدوات المتصفح المدمج ما زال غير متاح؛ الفحص البصري تم في متصفح اختبار منفصل.

نجحت اختبارات JavaScript وDOM الأربعة عشر التي تغطي اللغتين، المشاريع والفلاتر، الصور، بيانات الطلب، نجاح الحفظ وفشله، وعدم فتح واتساب قبل الحفظ وحماية نقطة الخادم. فُحصت النسخة كذلك في Chrome عبر Playwright عند 1440×900 و390×844؛ روجعت لقطات المقدمة والمشاريع، واختُبرت حركة التمرير والأزرار والمؤشر وفتح المشروع والفلاتر وتوسيع الأعمال واللغتان والقائمة ووضع تقليل الحركة. لم تظهر أخطاء JavaScript أو زيادة في عرض الصفحة. يُعاد اختبار Firebase عبر الرابط العام بعد النشر.


## تشغيل إشعارات الطلبات

لكل طلب حالتا إرسال مستقلتان: emailStatus لتأكيد العميل، وownerEmailStatus لإشعار المالك. الحجز الذري يمنع الإرسال المكرر، ويحسب كل محاولة ضمن حد الخادم الحالي: 50 رسالة يوميًا إجمالًا، أي نحو 25 طلبًا برسالتين دون إعادة محاولات. عند بلوغ الحد تبقى الطلبات محفوظة والبريد pending؛ الإرسال ليس مجدولًا تلقائيًا، ويمكن إعادة المحاولة من اللوحة بعد تجدد الحصة. حالات failed قابلة لإعادة المحاولة حتى ثلاث محاولات لكل مستلم. حالات unknown أو sending لا تُكرر تلقائيًا لتفادي رسالة مزدوجة؛ راجع Gmail المرسلة أولًا.

تنبيه المالك يُرسل إلى 3labri1996@gmail.com فقط، ولا يتضمن نص الاستفسار أو بيانات التواصل. زر فتح الطلب يتطلب دخول المالك، ولا يمنح الرابط وحده صلاحية قراءة الطلب. لا يؤدي فشل أي رسالة إلى فشل حفظ الطلب أو تعطيل رسالة المستلم الآخر.

## عرض نتائج المشاريع

تعرض بطاقات المشاريع الفكرة وفائدة موجزة بالعربية والإنجليزية. تظهر عبارة التطبيق في المدارس والمعارض للمنصتين اللتين أكد المالك تطبيقهما: معبر المدرسة ومساحة أُنس. نافذة المشروع تعرض الصور الأصلية كاملة وتعليقاتها، مع شرح طريقة العمل والفائدة. الصور غير المتوفرة لا تُستبدل بإثباتات مولدة؛ يبقى رمز المشروع الموجود. تحافظ أسهم معاينات المنصات وحركة المشاهد على سلوكها، ويُقفل تمرير الخلفية أثناء قراءة المشروع ويعود التركيز إلى زر الفتح عند الإغلاق.

## فيديو معبر المدرسة

تسجيل أصلي أرسله صاحب الموقع، مدته 41 ثانية ودقته 816×576. نسخة الويب school-gateway-demo.mp4 بترميز H.264 وصوت AAC الأصلي؛ خُفّض الحجم من 7,082,114 إلى 3,637,531 بايت مع تعديل خفيف للإضاءة والحدة، دون قص أو رفع الدقة. faststart يسمح ببدء التشغيل قبل اكتمال التحميل. الصورة الافتتاحية مأخوذة من المقطع نفسه.

يفتح زر «شاهد التجربة بالفيديو» العرض داخل تفاصيل المنصة بإطار يتبع الهوية. الفيديو لا يُطلب قبل فتح المشروع واختيار التشغيل، ويدعم playsinline وأدوات التشغيل الأصلية. الإغلاق يوقف الصوت ويلغي مصدر الفيديو، وإعادة الفتح تبدأ من الصورة الافتتاحية. اختُبر التشغيل والتقديم والإغلاق والتنقل بلوحة المفاتيح والجوال واللغتان في Chrome.

The school demo uses a dedicated Pages Function for HTTP byte ranges (static Pages responses otherwise return 200). The function streams selected bytes and leaves other assets static. When replacing this clip, update assetBytes in server/project-video.mjs and its range test to match the new MP4. Playback downloads begin only on user action.
### Private request follow-up

The owner dashboard now supports the `quoted` stage, an optional `followUpDate` (YYYY-MM-DD, Oman calendar date), and an optional OMR quote. Quotes are stored as integer `quoteBaisa` (1 OMR = 1000 baisa), preserving three decimal places; an empty string clears an optional value. Older clients that omit these fields preserve existing values, and older requests need no migration.

Status, service and due-date filters apply to the loaded page(s) of requests. Load older requests to extend their scope. Completed and archived requests retain their dates but are excluded from active follow-up filters. Dates are visual reminders in the dashboard, not scheduled email notifications. Saving follow-up details sends no message to the customer.

Drafts remain in memory across selection, language changes and refresh, with their original version. Conflicting updates return 409 instead of overwriting another edit. The owner can explicitly discard a draft to resume from the latest loaded version. Private fields remain behind owner authentication and same-origin write checks.
### Service packages

The public service section now groups requests into Practical Workshop, Interactive Platform and Technical Project packages. Each shows its audience, scope and timeline guidance, with one shared quote action that carries the selected package name into the existing inquiry form, Firestore, owner dashboard and email workflow. No fixed prices or delivery promises were invented. Existing `training`, `web` and `innovation` analytics keys are retained.

Package details expand on explicit selection; pointer/focus previews never change the quote selection. Selection survives language changes. Scroll entry, subtle image movement and image transitions use the existing visual palette, with reduced-motion support and no recurring animation loop while the section is offscreen. Project screenshot sequences and video playback remain unchanged.
