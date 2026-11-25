// ============================================================
// Default site content (bilingual). When Supabase is connected,
// rows in the site_content table override these defaults key by key.
// ============================================================

const UI_STRINGS = {
  ar: {
    nav_home: "الرئيسية",
    nav_services: "الخدمات",
    nav_portfolio: "أعمالي",
    nav_designs: "تصاميم",
    nav_about: "نبذة عني",
    nav_contact: "تواصل",
    nav_cta: "ابدأ مشروعك",
    hero_badge: "مصمم جرافيك ومطوّر محتوى تعليمي",
    hero_cta_work: "شاهد أعمالي",
    hero_cta_contact: "تواصل معي",
    services_kicker: "",
    services_title: "خدمات <span class='hl'>متكاملة</span> في التصميم والتعليم",
    services_sub: "",
    services_toggle_more: "عرض كل الخدمات",
    services_toggle_less: "عرض أقل",
    portfolio_kicker: "",
    portfolio_title: "مختارات من <span class='hl'>أعمالي</span>",
    portfolio_sub: "",
    designs_kicker: "",
    designs_title: "تصاميم وحملات <span class='hl'>السوشيال ميديا</span>",
    designs_sub: "اضغط على أي مشروع لفتح تصاميمه بالأسفل بنظام التقليب الدائري",
    filter_all: "الكل",
    about_kicker: "من أنا",
    about_title: "شغف بالتصميم <span class='hl'>وإيمان بالتعليم</span>",
    contact_kicker: "",
    contact_title: "جاهز <span class='hl'>لمشروعك القادم؟</span>",
    contact_sub: "أرسل تفاصيل مشروعك وسأرد عليك في أقرب وقت.",
    form_name: "الاسم",
    form_email: "البريد الإلكتروني",
    form_message: "رسالتك",
    form_send: "إرسال",
    form_sending: "جارٍ الإرسال...",
    form_sent: "وصلت رسالتك، شكرًا لك!",
    form_error: "تعذر الإرسال، حاول مرة أخرى.",
    form_offline: "نموذج التواصل يعمل بعد ربط قاعدة البيانات.",
    contact_info_title: "بيانات التواصل",
    footer_rights: "جميع الحقوق محفوظة",
    admin_link: "لوحة التحكم",
    stat_projects: "خدمة متخصصة",
    stat_fields: "مجالات خدمة",
    stat_support: "دعم وتواصل",
    scroll_down: "اسحب للأسفل"
  },
  en: {
    nav_home: "Home",
    nav_services: "Services",
    nav_portfolio: "Work",
    nav_designs: "Designs",
    nav_about: "About",
    nav_contact: "Contact",
    nav_cta: "Start a project",
    hero_badge: "Graphic Designer & Instructional Developer",
    hero_cta_work: "View my work",
    hero_cta_contact: "Contact me",
    services_kicker: "",
    services_title: "<span class='hl'>Full-stack</span> design & learning services",
    services_sub: "",
    services_toggle_more: "Show all services",
    services_toggle_less: "Show less",
    portfolio_kicker: "",
    portfolio_title: "Selected <span class='hl'>work</span>",
    portfolio_sub: "",
    designs_kicker: "",
    designs_title: "Social media <span class='hl'>designs & campaigns</span>",
    designs_sub: "Click any project to browse its designs below in the circular carousel",
    filter_all: "All",
    about_kicker: "About me",
    about_title: "Passion for design, <span class='hl'>belief in education</span>",
    contact_kicker: "",
    contact_title: "Ready for your <span class='hl'>next project?</span>",
    contact_sub: "Send your project details and I will get back to you soon.",
    form_name: "Name",
    form_email: "Email",
    form_message: "Your message",
    form_send: "Send",
    form_sending: "Sending...",
    form_sent: "Message received, thank you!",
    form_error: "Could not send, please try again.",
    form_offline: "The contact form works once the database is connected.",
    contact_info_title: "Contact details",
    footer_rights: "All rights reserved",
    admin_link: "Admin panel",
    stat_projects: "specialized services",
    stat_fields: "service fields",
    stat_support: "support & contact",
    scroll_down: "Scroll down"
  }
};

const DEFAULT_CONTENT = {
  site: {
    name_ar: "محمود فيصل",
    name_en: "Mahmoud Fissal",
    role_ar: "مصمم جرافيك ومطوّر تعليمي",
    role_en: "Graphic Designer & Learning Developer"
  },
  hero: {
    title_line1_ar: "تصميم يعبّر عنك",
    title_line1_en: "Design that speaks",
    title_line2_ar: "ويصل إلى جمهورك",
    title_line2_en: "and reaches your audience",
    subtitle_ar: "أنا محمود فيصل، مصمم جرافيك ومطوّر محتوى تعليمي. أساعد العلامات التجارية والمؤسسات التعليمية على تحويل أفكارها إلى هويات بصرية وتجارب تعلم واضحة وجذابة.",
    subtitle_en: "I'm Mahmoud Fissal, a graphic designer and instructional developer. I help brands and educational organizations turn their ideas into clear, engaging visual identities and learning experiences.",
    image: "assets/img/hero-designer.jpg",
    stats: [
      { value_ar: "+120", value_en: "120+", label_ar: "خدمة متخصصة", label_en: "specialized services" },
      { value_ar: "7", value_en: "7", label_ar: "مجالات خدمة", label_en: "service fields" },
      { value_ar: "24/7", value_en: "24/7", label_ar: "دعم وتواصل", label_en: "support & contact" }
    ]
  },
  about: {
    image: "assets/img/about-workspace.jpg",
    text_ar: "أجمع بين عين المصمم وعقل المطوّر التعليمي. أؤمن أن التصميم الجيد ليس شكلًا جميلًا فقط، بل طريقة أوضح للفهم والتواصل. أعمل مع العملاء من الفكرة الأولى حتى المنتج النهائي: هوية بصرية، محتوى تعليمي، منصات، ومواد مطبوعة ورقمية.",
    text_en: "I combine a designer's eye with an instructional developer's mind. Good design is not just a pretty look; it is a clearer way to understand and communicate. I work with clients from the first idea to the final product: visual identity, learning content, platforms, print and digital materials.",
    points_ar: ["تسليم احترافي في المواعيد", "تعديلات حتى الرضا الكامل", "ملفات مفتوحة المصدر"],
    points_en: ["Professional on-time delivery", "Revisions until full satisfaction", "Open-source files included"]
  },
  services: [
    {
      id: "graphic-design",
      icon: "pen",
      image: "",
      title_ar: "خدمات التصميم الجرافيكي",
      title_en: "Graphic Design",
      items_ar: ["تصميم الشعارات", "تصميم الهوية البصرية الكاملة", "إعداد دليل الهوية البصرية", "تصميم المنشورات لوسائل التواصل الاجتماعي", "تصميم الإعلانات والحملات التسويقية", "تصميم البنرات واللافتات", "تصميم البروشورات والفلايرات", "تصميم أغلفة الكتب والمذكرات", "تصميم الصور المصغرة للفيديوهات", "تصميم الإنفوجرافيك", "تصميم الخرائط الذهنية", "تصميم الملخصات البصرية", "تصميم العروض التقديمية", "تصميم المطبوعات", "تصميم واجهات المواقع والتطبيقات", "تصميم لوحات التحكم", "تصميم تجربة المستخدم", "تصميم النماذج الأولية للواجهات", "تصميم الموشن جرافيك والعناصر المتحركة"],
      items_en: ["Logo design", "Full visual identity design", "Brand identity guidelines", "Social media post design", "Ad & marketing campaign design", "Banner & signage design", "Brochure & flyer design", "Book & notebook cover design", "Video thumbnail design", "Infographic design", "Mind map design", "Visual summary design", "Presentation design", "Print design", "Website & app UI design", "Dashboard design", "UX design", "UI prototyping", "Motion graphics & animated elements"]
    },
    {
      id: "instructional-dev",
      icon: "book",
      image: "",
      title_ar: "خدمات التطوير التعليمي",
      title_en: "Instructional Development",
      items_ar: ["تحليل الاحتياجات التعليمية", "تحديد الأهداف التعليمية", "تصميم المناهج والخطط التعليمية", "بناء الهيكل العام للمقررات", "تقسيم المحتوى إلى وحدات ودروس", "تطوير المحتوى التعليمي", "كتابة وصياغة المحتوى التعليمي", "تبسيط المعلومات والمفاهيم المعقدة", "إعداد الخطط الدرسية", "كتابة سيناريوهات الفيديوهات التعليمية", "إعداد لوحات التصور المسبق للمشاهد التعليمية", "تصميم استراتيجيات التدريس", "تصميم تجارب التعلم", "تطوير مسارات التعلم", "تصميم الأنشطة التعليمية", "تصميم أوراق العمل", "إعداد التدريبات والتطبيقات", "تصميم الاختبارات والتقييمات", "تحليل نتائج المتعلمين", "تطوير وتحسين المحتوى التعليمي"],
      items_en: ["Learning needs analysis", "Learning objective definition", "Curriculum & plan design", "Course structure design", "Content chunking into modules & lessons", "Learning content development", "Learning content writing", "Simplifying complex concepts", "Lesson planning", "Educational video scripts", "Storyboards for learning scenes", "Teaching strategy design", "Learning experience design", "Learning path development", "Learning activity design", "Worksheet design", "Practice & exercise design", "Quiz & assessment design", "Learner performance analysis", "Learning content improvement"]
    },
    {
      id: "elearning",
      icon: "monitor",
      image: "",
      title_ar: "التعليم الإلكتروني والمحتوى التفاعلي",
      title_en: "E-Learning & Interactive Content",
      items_ar: ["تصميم الدروس الإلكترونية", "تطوير المقررات الرقمية", "تصميم العروض التقديمية التفاعلية", "تطوير الأنشطة التفاعلية", "تصميم الاختبارات الإلكترونية", "تصميم الألعاب التعليمية", "تطوير أساليب التعلم القائمة على اللعب", "تصميم المحاكاة التعليمية", "إنتاج الفيديوهات التعليمية", "إنتاج فيديوهات الشرح التوضيحي", "تصميم الموشن جرافيك التعليمي", "إعداد المحتوى متعدد الوسائط", "تصميم تجارب التعلم الرقمية", "تحويل المحتوى التقليدي إلى محتوى إلكتروني تفاعلي"],
      items_en: ["E-lesson design", "Digital course development", "Interactive presentation design", "Interactive activity development", "Online quiz design", "Educational game design", "Game-based learning", "Learning simulation design", "Educational video production", "Explainer video production", "Educational motion graphics", "Multimedia content", "Digital learning experiences", "Converting traditional content into interactive e-content"]
    },
    {
      id: "books",
      icon: "layers",
      image: "",
      title_ar: "تصميم الكتب والمواد التعليمية",
      title_en: "Books & Learning Materials",
      items_ar: ["تصميم الكتب التعليمية", "تصميم المذكرات الدراسية", "تصميم الملخصات", "تصميم أوراق العمل", "تصميم كراسات الأنشطة", "تصميم أدلة المعلم", "تصميم أدلة الطالب", "تصميم الكتب التدريبية", "تصميم ملفات المراجعة", "تصميم نماذج الامتحانات", "تصميم ملفات PDF التعليمية", "تصميم القوالب التعليمية", "تصميم أغلفة الكتب والمقررات", "تنسيق وإخراج المحتوى التعليمي للطباعة والنشر الرقمي"],
      items_en: ["Educational book design", "Study notebook design", "Summary design", "Worksheet design", "Activity book design", "Teacher guide design", "Student guide design", "Training book design", "Revision file design", "Exam template design", "Educational PDF design", "Learning template design", "Book & course cover design", "Print & digital layout and typesetting"]
    },
    {
      id: "platforms-ux",
      icon: "grid",
      image: "",
      title_ar: "تصميم المنصات التعليمية وتجربة المستخدم",
      title_en: "Learning Platforms & UX",
      items_ar: ["تصميم واجهات المنصات التعليمية", "تصميم واجهات الطالب", "تصميم واجهات المعلم", "تصميم لوحات التحكم والإحصائيات", "تصميم صفحات المقررات والدروس", "تصميم واجهات الاختبارات", "تنظيم المحتوى داخل المنصات", "تصميم رحلة المستخدم", "تحسين تجربة الاستخدام", "تصميم المواقع التعليمية المتجاوبة", "تصميم تجربة التعلم عبر الهاتف والتابلت والكمبيوتر", "تحسين سهولة الوصول إلى المحتوى التعليمي"],
      items_en: ["Learning platform UI design", "Student interface design", "Teacher interface design", "Dashboard & analytics design", "Course & lesson page design", "Quiz interface design", "Platform content organization", "User journey design", "UX improvement", "Responsive learning websites", "Learning experience across phone, tablet & desktop", "Learning content accessibility"]
    },
    {
      id: "visual-production",
      icon: "play",
      image: "",
      title_ar: "الإنتاج المرئي والمحتوى الإبداعي",
      title_en: "Visual Production & Creative Content",
      items_ar: ["إعداد الأفكار والمفاهيم المرئية", "إعداد سيناريوهات الفيديو", "تخطيط المشاهد", "إعداد لوحات التصور المسبق للمشاهد", "تصميم الرسوم التوضيحية", "تصميم الرسوم التعليمية", "تصميم وتحريك العناصر البصرية", "إنتاج فيديوهات الموشن جرافيك", "مونتاج الفيديوهات التعليمية", "إعداد المحتوى المرئي للمنصات التعليمية", "تصميم القصص المرئية", "تحويل المعلومات إلى محتوى مرئي جذاب وسهل الفهم"],
      items_en: ["Visual ideas & concepts", "Video scripts", "Scene planning", "Storyboarding", "Illustration design", "Educational illustration", "Visual element design & animation", "Motion graphics production", "Educational video editing", "Visual content for learning platforms", "Visual storytelling", "Turning information into clear, engaging visuals"]
    },
    {
      id: "combined",
      icon: "sparkle",
      image: "",
      title_ar: "خدمات مشتركة: تصميم + تطوير تعليمي",
      title_en: "Combined: Design + Learning",
      items_ar: ["تصميم وتطوير تجربة تعليمية متكاملة", "تحويل المناهج إلى تجارب تعلم بصرية وتفاعلية", "تصميم محتوى تعليمي متكامل من الفكرة إلى المنتج النهائي", "تصميم الدروس والمقررات من الناحية التعليمية والبصرية", "تحويل المعلومات المعقدة إلى إنفوجرافيك ومحتوى بصري", "تصميم المواد التعليمية بما يحقق الوضوح وسهولة الفهم", "تطوير الهوية البصرية للمشروعات والمنصات التعليمية", "تصميم منظومة متكاملة للمواد التعليمية", "تطوير محتوى تعليمي رقمي متوافق مع احتياجات المتعلمين", "الجمع بين جودة المحتوى وسهولة الاستخدام والجاذبية البصرية"],
      items_en: ["End-to-end learning experience design", "Turning curricula into visual, interactive experiences", "Idea-to-final-product learning content", "Pedagogical and visual lesson & course design", "Turning complex information into infographics", "Learning materials built for clarity", "Visual identity for learning projects & platforms", "Integrated learning material systems", "Learner-centered digital content", "Content quality, usability and visual appeal combined"]
    }
  ],
  portfolio: [
    { id: "w1", title_ar: "تصميم شعار", title_en: "Logo Design", category: "branding", image: "assets/img/work-logo.jpg" },
    { id: "w2", title_ar: "هوية بصرية", title_en: "Brand Identity", category: "branding", image: "assets/img/work-brand.jpg" },
    { id: "w3", title_ar: "منشورات سوشيال ميديا", title_en: "Social Media Designs", category: "social", image: "assets/img/work-social.jpg" },
    { id: "w4", title_ar: "أغلفة كتب تعليمية", title_en: "Educational Book Covers", category: "print", image: "assets/img/work-book.jpg" },
    { id: "w5", title_ar: "واجهة منصة تعليمية", title_en: "Learning Platform UI", category: "uiux", image: "assets/img/work-uiux.jpg" },
    { id: "w6", title_ar: "موشن جرافيك", title_en: "Motion Graphics", category: "motion", image: "assets/img/work-motion.jpg" }
  ],
  designs: [],
  portfolio_categories: [
    { id: "branding", name_ar: "هوية وشعارات", name_en: "Branding" },
    { id: "social", name_ar: "سوشيال ميديا", name_en: "Social Media" },
    { id: "print", name_ar: "مطبوعات", name_en: "Print" },
    { id: "uiux", name_ar: "واجهات", name_en: "UI/UX" },
    { id: "motion", name_ar: "موشن", name_en: "Motion" }
  ],
  marquee: {
    items_ar: ["شعارات", "هوية بصرية", "سوشيال ميديا", "إنفوجرافيك", "عروض تقديمية", "واجهات مستخدم", "موشن جرافيك", "كتب ومذكرات", "محتوى تعليمي", "منصات تعليمية"],
    items_en: ["Logos", "Brand Identity", "Social Media", "Infographics", "Presentations", "UI/UX", "Motion Graphics", "Books", "Learning Content", "Learning Platforms"]
  },
  contact_form: {
    inbox_email: "",
    send_ar: "إرسال", send_en: "Send",
    sending_ar: "جارٍ الإرسال...", sending_en: "Sending...",
    sent_ar: "وصلت رسالتك، شكرًا لك!", sent_en: "Message received, thank you!",
    error_ar: "تعذر الإرسال، حاول مرة أخرى.", error_en: "Could not send, please try again.",
    fields: [
      { id: "name", type: "text", builtin: true, visible: true, label_ar: "الاسم", label_en: "Name", ph_ar: "ادخل اسمك هنا", ph_en: "Enter your name here" },
      { id: "email", type: "email", builtin: true, visible: true, label_ar: "البريد الإلكتروني", label_en: "Email", ph_ar: "ادخل بريدك الإلكتروني هنا", ph_en: "Enter your email here" },
      { id: "msg", type: "textarea", builtin: true, visible: true, label_ar: "رسالتك", label_en: "Your message", ph_ar: "اكتب رسالتك هنا", ph_en: "Write your message here" }
    ]
  },
  contact: {
    email: "hello@example.com",
    phone: "+20 100 000 0000",
    whatsapp: "",
    telegram: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    socials: [
      { id: "behance", label: "Behance", url: "" },
      { id: "dribbble", label: "Dribbble", url: "" }
    ]
  },
  theme: {
    light: { accent: "#f5b301", heading: "#1f3ab0", bg: "#f2f3f5" },
    dark: { accent: "#ffc61a", heading: "#ffc61a", bg: "#17264a" }
  }
};
