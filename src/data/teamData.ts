/**
 * Creativity Juice — Master Team Data Source
 * اعضای واقعی تیم استودیو
 * شما می‌توانید مستقیماً این فایل را ویرایش کنید تا عکس‌ها، بیوگرافی و اطلاعات اعضا تغییر کنند.
 */

export interface MemberProjectRole {
  projectId: string;
  projectTitle: string;
  client: string;
  roleInProject: string;
  year?: string;
  keyDeliverables?: string[];
  impact?: string;
  coverImage?: string;
}

export interface MasterTeamMemberItem {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  department: string;
  trackCode: string;
  initials: string;
  bio: string;
  experience: string;
  philosophy: string;
  specialties: string[];
  photo: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
  projectRoles?: MemberProjectRole[];
}

export const INITIAL_TEAM: MasterTeamMemberItem[] = [
  {
    id: 'fereydoun-yousefzadeh',
    name: 'فریدون یوسف زاده',
    nameEn: 'Fereydoun Yousefzadeh',
    role: 'مدیر هنری، ادیتور، ایده پرداز',
    roleEn: 'Art Director, Senior Editor & Creative Ideator',
    department: 'کارگردانی هنری و ادیت',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    initials: 'FY',
    bio: 'سکاندار سبک بصری و آرت‌دایرکشن پروژه‌های استودیو؛ متخصص خلق ایده‌های نوآورانه کمپین‌ها و تدوین ادیتوریال ویدیوها با استانداردهای پریمیوم.',
    experience: 'بیش از ۱۰ سال تجربه کارگردانی هنری، سناریونویسی و تدوین تخصصی پروژه‌های بزرگ تبلیغاتی، پزشکی و املاک',
    philosophy: '«هنر در تبلیغات فقط زیبایی نیست؛ انتقال بی‌واسطه احساس و ایجاد تصویری است که فراموش نمی‌شود.»',
    specialties: [
      'آرت‌دایرکشن و هدایت بصری برند',
      'ایده‌پردازی کمپین و استراتژی محتوا',
      'تدوین ادیتوریال و پریمیوم ویدیو',
      'اصلاح رنگ سینمایی و استایلینگ بصری',
    ],
    // آدرس عکس را می‌توانید بعداً با تصویر دلخواه یا فایل محلی خود جایگزین کنید
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'yousefzadeh-real-estate',
        projectTitle: 'گروه مشاوره سرمایه‌گذاری ملکی یوسف‌زاده',
        client: 'گروه سرمایه‌گذاری یوسف‌زاده',
        roleInProject: 'مدیر هنری، سناریست و استراتژیست ایده کمپین',
        year: '۱۴۰۳',
        keyDeliverables: ['طراحی کانسپت بصری کمپین', 'هدایت هنری ویدیوهای سینمایی'],
        impact: '+۳۱۰٪ جذب سرمایه‌گذاران رده‌بالا',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'dr-sadegh-peiravi',
        projectTitle: 'دکتر صادق پیروی • متخصص زیبایی',
        client: 'کلینیک زیبایی دکتر پیروی',
        roleInProject: 'مدیر هنری و تدوینگر ارشد ریلزهای پریمیوم',
        year: '۱۴۰۳',
        keyDeliverables: ['استایلینگ بصری پیج', 'ادیت تخصصی و اصلاح رنگ کلینیکال'],
        impact: '+۲۴۰٪ افزایش وقت‌های مشاوره',
        coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'mehdi-loghmani',
    name: 'مهدی لقمانی',
    nameEn: 'Mehdi Loghmani',
    role: 'مدیر پروژه، مشاور کسب و کار، استراتژیست برند و کسب و کار، (آهنگ ساز)',
    roleEn: 'Project Manager, Business Advisor, Brand Strategist & Composer',
    department: 'مدیریت پروژه، استراتژی و موسیقی',
    trackCode: 'TRACK 04 // STRATEGIC COUNSEL',
    initials: 'ML',
    bio: 'معمار استراتژی‌های رشد کسب‌وکار و هدایت یکپارچه پروژه‌ها؛ تحلیل‌گر مدل‌های درآمدی برند، تدوینگر ساختار کمپین‌ها و آهنگساز قطعات اختصاصی تبلیغاتی و سونیک برندینگ.',
    experience: 'بیش از ۱۰ سال مشاوره ارشد کسب‌وکار، مدیریت پروژه‌های همزمان و تولید موسیقی تجاری برای برندها',
    philosophy: '«هماهنگی استراتژی تجاری و هنر، روح واقعی یک برند پیشرو را می‌سازد. بدون نظم و هدف، بهترین ایده‌ها عقیم می‌مانند.»',
    specialties: [
      'مدیریت جامع پروژه‌ها و مهندسی فرایندها',
      'مشاوره استراتژی برند و مدل کسب‌وکار',
      'آهنگسازی تجاری و سونیک برندینگ (Sonic Logo)',
      'تحلیل داده‌ها و بهینه‌سازی فروش',
    ],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'go-sport-music',
        projectTitle: 'فروشگاه Go Sport • موزیک تبلیغاتی',
        client: 'فروشگاه و سایت Go Sport',
        roleInProject: 'آهنگساز قطعه اختصاصی و طراح هویت شنیداری',
        year: '۱۴۰۳',
        keyDeliverables: ['ساخت قطعه موسیقی ورزشی پرانرژی', 'طراحی لوگوی صوتی ۳ ثانیه‌ای'],
        impact: 'پخش در ۲۵ شعبه فروشگاهی و تیزرهای اسپانسرینگ',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'ghellak-tala',
        projectTitle: 'قلک طلا • آموزش اقتصادی (خسروی‌فر)',
        client: 'آکادمی قلک طلا',
        roleInProject: 'مشاور استراتژی کسب‌وکار و طراحی فانل آموزشی',
        year: '۱۴۰۳',
        keyDeliverables: ['استراتژی تبدیل مخاطب به دانشجو', 'معماری تقویم محتوایی'],
        impact: 'بیش از ۵ میلیون ایمپرشن ماهانه',
        coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'esmaeil-samanipour',
    name: 'اسماعیل سامانی پور',
    nameEn: 'Esmaeil Samanipour',
    role: 'تصویربردار، کارگردان، ایده پرداز',
    roleEn: 'Cinematographer, Director & Creative Ideator',
    department: 'سینما و تولید تصویر',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    initials: 'ES',
    bio: 'کارگردان و مدیر تصویربرداری با تسلط بر دکوپاژ سینمایی؛ مجری پروژه‌های بزرگ صنعتی و کارخانه‌ای با خلق اتمسفرهای نوری خیره‌کننده و کادربندی‌های دقیق.',
    experience: 'سال‌ها فعالیت در کارگردانی فیلم‌های صنعتی، مستندهای تجاری و تیزرهای تلویزیونی',
    philosophy: '«دوربین تنها یک ناظر نیست؛ چشمی است که قدرت، اصالت و روح یک کارخانه یا سازه را به تماشاگر هدیه می‌دهد.»',
    specialties: [
      'کارگردانی فیلم‌های صنعتی و کارخانه‌ای',
      'تصویربرداری حرفه‌ای سینمایی و فریم‌ریت بالا',
      'نورپردازی لوکیشن‌های سخت و ماشین‌آلات سنگین',
      'ایده‌پردازی حرکات دوربین و دکوپاژ مفهومی',
    ],
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'gogona-industrial',
        projectTitle: 'تیزر صنعتی شرکت گوگونا',
        client: 'شرکت صنعتی گوگونا',
        roleInProject: 'کارگردان و مدیر تصویربرداری',
        year: '۱۴۰۲',
        keyDeliverables: ['کارگردانی فیلم صنعتی خطوط تولید', 'تصویربرداری ۱۲۰fps با لنزهای سینمایی'],
        impact: 'پخش در اجلاس‌های بین‌المللی و عقد قراردادهای بزرگ',
        coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'kian-kavyani-real-estate',
        projectTitle: 'مشاوره املاک کیان کاویانی',
        client: 'مشاوره املاک کیان کاویانی',
        roleInProject: 'تصویربردار هوایی (هلی‌شات) و گیمبال پنت‌هاوس‌ها',
        year: '۱۴۰۳',
        keyDeliverables: ['تصویربرداری ساعت طلایی معماری', 'هدایت نماهای حرکتی فضای داخلی'],
        impact: 'فروش ۳ واحد لوکس با ریلزهای اینستاگرام',
        coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'mohammad-mehdipour',
    name: 'محمد مهدی پور',
    nameEn: 'Mohammad Mehdipour',
    role: 'تصویربردار، کارگردان، ایده پرداز',
    roleEn: 'Cinematographer, Director & Creative Ideator',
    department: 'سینما و تولید تصویر',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    initials: 'MM',
    bio: 'تصویربردار و کارگردان تیزرهای تجاری و معرفی محصول؛ مسلط به خلق قاب‌های مدرن با ریتم تند و هوک‌های تصویری جذاب که مخاطب را در لحظه اول درگیر می‌کند.',
    experience: 'کارگردانی بیش از ۳۰ تیزر تبلیغاتی، فیلم‌های معرفی محصول و ریلزهای باکیفیت بالا',
    philosophy: '«در عصر سرعت، تصویر باید در ثانیه اول قصه را بگوید و حسی خلق کند که مخاطب نتواند چشم بردارد.»',
    specialties: [
      'تصویربرداری تیزرهای تجاری و محصولات',
      'ایده‌پردازی سناریوهای خلاقانه با هوک قوی',
      'کارگردانی صحنه و کنترل ریتم بصری',
      'تسلط بر تجهیزات حرکتی و گیمبال‌های سنگین',
    ],
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'zarrin-hamzeh-industrial',
        projectTitle: 'تیزر تبلیغاتی شرکت صنعتی زرین حمزه',
        client: 'شرکت صنعتی زرین حمزه',
        roleInProject: 'کارگردان تیزر تبلیغاتی و تصویربردار',
        year: '۱۴۰۳',
        keyDeliverables: ['سناریونویسی و کارگردانی نماهای حماسی', 'تصویربرداری دقیق قطعات و خط تولید'],
        impact: '+۱۸۰٪ رشد ایمپرشن سازمانی B2B',
        coverImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'ermia-teb-medical',
        projectTitle: 'ارمیا طب • تیزر معرفی محصول تجهیزات پزشکی',
        client: 'شرکت پزشکی ارمیا طب',
        roleInProject: 'کارگردان و طراح صحنه تیزر معرفی دستگاه',
        year: '۱۴۰۳',
        keyDeliverables: ['تصویربرداری ماکرو در کلین‌روم', 'هدایت نورپردازی مینیمال سفید'],
        impact: 'سفارش ۳۵ دستگاه در هفته اول رونمایی',
        coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'harry',
    name: 'هری',
    nameEn: 'Harry',
    role: 'طراح سایت',
    roleEn: 'Lead Web Designer & Frontend Developer',
    department: 'توسعه وب و پرتال‌های دیجیتال',
    trackCode: 'TRACK 01 // DIGITAL & WEB',
    initials: 'HA',
    bio: 'طراح و توسعه‌دهنده وب‌سایت‌های مدرن، پرسرعت و واکنش‌گرا؛ پیاده‌سازی رابط‌های کاربری تعاملی، سیستم‌های طراحی تمیز و لندینگ‌پیج‌های پربازده با آخرین فناوری‌های روز.',
    experience: 'توسعه ده‌ها پروژه وب‌سایت شرکتی، فروشگاهی و پلتفرم‌های پرتال تعاملی با عملکرد عالی',
    philosophy: '«کدنویسی تمیز و طراحی کاربرمحور، ستون فقرات حضور دیجیتال هر برند قدرتمند است.»',
    specialties: [
      'طراحی و برنامه‌نویسی وب‌سایت‌های مدرن',
      'پیاده‌سازی لندینگ‌پیج‌های تبلیغاتی با نرخ تبدیل بالا',
      'بهینه‌سازی سرعت و استانداردهای Core Web Vitals',
      'طراحی ریسپانسیو و تعاملات انیمیشنی وب',
    ],
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'yousefzadeh-real-estate',
        projectTitle: 'گروه مشاوره سرمایه‌گذاری ملکی یوسف‌زاده',
        client: 'گروه سرمایه‌گذاری یوسف‌زاده',
        roleInProject: 'طراح و توسعه‌دهنده پرتال وب سرمایه‌گذاری',
        year: '۱۴۰۳',
        keyDeliverables: ['توسعه پرتال تعاملی املاک', 'بهینه‌سازی لود سریع و ریسپانسیو کامل'],
        impact: 'دریافت صدها لید ملکی مستقیم از سایت',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'go-sport-music',
        projectTitle: 'فروشگاه و سایت Go Sport',
        client: 'فروشگاه Go Sport',
        roleInProject: 'مشاور تجربه کاربری و پرتال آنلاین ورزشی',
        year: '۱۴۰۳',
        keyDeliverables: ['طراحی ساختار لندینگ و استریمینگ صوتی', 'یکپارچه‌سازی پلیرها'],
        impact: 'بهبود تجربه تعامل کاربران آنلاین',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'alireza-shiehzadeh',
    name: 'علیرضا شیعه زاده',
    nameEn: 'Alireza Shiehzadeh',
    role: 'طراح UI/UX، گرافیست، مشاور هنری برند، ایده پرداز',
    roleEn: 'UI/UX Designer, Graphic Designer & Brand Art Advisor',
    department: 'دیزاین رابط کاربری و هویت بصری',
    trackCode: 'TRACK 01 // BRAND & INTERFACE',
    initials: 'AS',
    bio: 'طراح ارشد رابط و تجربه کاربری، گرافیست و مشاور هنری برند؛ متخصص خلق دیزاین‌سیستم‌های هماهنگ، تایپوگرافی اصیل، هویت‌های بصری لوکس و ایده‌پردازی گرافیک سوشال.',
    experience: 'بیش از ۸ سال فعالیت حرفه‌ای در طراحی UI/UX محصولات دیجیتال، هویت بصری و گرافیک کمپین‌ها',
    philosophy: '«دیزاین خوب دیدنی نیست؛ حس‌کردنی است. تعادل میان کارایی بی‌نقص و زیبایی منحصربه‌فرد، تخصص ماست.»',
    specialties: [
      'طراحی جامع رابط و تجربه کاربری (UI/UX)',
      'طراحی گرافیک، پوستر و تایپوگرافی اختصاصی',
      'مشاوره هنری برند و تدوین کتابچه دیزاین سیستم',
      'ایده‌پردازی المان‌های بصری و موشن‌گرافیک',
    ],
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'sepanja-tourism',
        projectTitle: 'برند سپنجا • موشن دیزاین و گرافیک',
        client: 'سامانه رزرواسیون سپنجا',
        roleInProject: 'مشاور هنری برند و طراح گرافیک‌های موشن',
        year: '۱۴۰۳',
        keyDeliverables: ['طراحی المان‌های گرافیکی تعاملی سفر', 'دیزاین سیستم تایپوگرافی سوشال'],
        impact: '+۳۵۰٪ شیر و اشتراک‌گذاری ریلزها',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'dentino-clinic',
        projectTitle: 'کلینیک دنتینو • تولید محتوا و گرافیک',
        client: 'مجموعه دندانپزشکی دنتینو',
        roleInProject: 'طراح قالب‌های گرافیکی و موشن‌های آموزشی پیج',
        year: '۱۴۰۳',
        keyDeliverables: ['طراحی کاورها و قالب‌های بصری اینستاگرام', 'گرافیک‌های توضیحی فرآیند درمان'],
        impact: '+۱۶۰٪ رشد نوبت‌دهی آنلاین',
        coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
];
