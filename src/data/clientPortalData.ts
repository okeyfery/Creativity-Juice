/**
 * Creativity Juice — Client Portal Mock & Initial Data
 * Pre-configured dedicated workspaces for real studio clients
 */

export interface ClientMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  date: string;
  badge?: string;
}

export interface ClientDeliverable {
  id: string;
  title: string;
  type: 'video' | 'branding' | 'reels' | 'audio' | 'strategy';
  format: string;
  fileSize: string;
  thumbnail: string;
  videoUrl?: string;
  previewUrl?: string;
  version: string;
  status: 'approved' | 'revision-requested' | 'pending-review';
  dateUploaded: string;
  clientFeedback?: string;
  feedbackDate?: string;
  downloadUrl?: string;
}

export interface ClientCalendarPost {
  id: string;
  title: string;
  platform: 'instagram' | 'linkedin' | 'youtube' | 'website';
  format: 'reels' | 'carousel' | 'story' | 'video' | 'article';
  scheduledDate: string;
  persianDate: string;
  status: 'published' | 'ready' | 'in-progress' | 'review';
  captionDraft: string;
}

export interface ClientFeedbackMessage {
  id: string;
  author: string;
  role: 'client' | 'lead' | 'team';
  message: string;
  timestamp: string;
  replyTo?: string;
}

export interface ClientWorkspace {
  id: string;
  slug: string;
  pinCode: string;
  brandName: string;
  brandNameEn: string;
  ownerName: string;
  category: string;
  coverImage: string;
  logoBadge: string;
  colorAccent: string;
  progressPercent: number;
  projectLead: string;
  projectLeadRole: string;
  contractDate: string;
  deliveryDate: string;
  scopeSummary: string;
  milestones: ClientMilestone[];
  deliverables: ClientDeliverable[];
  calendar: ClientCalendarPost[];
  feedbacks: ClientFeedbackMessage[];
  isPersonalBrand?: boolean;
  targetNiche?: string;
  socialGoal?: string;
  brandTone?: string;
  targetPlatforms?: string[];
}

export const INITIAL_CLIENT_WORKSPACES: ClientWorkspace[] = [
  {
    id: 'client-yousefzadeh',
    slug: 'yousefzadeh',
    pinCode: '1001',
    brandName: 'گروه مشاوره سرمایه‌گذاری ملکی یوسف‌زاده',
    brandNameEn: 'Yousefzadeh Real Estate Advisory',
    ownerName: 'مهندس یوسف‌زاده',
    category: 'هویت برند، تولید محتوا و کمپین فروش',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '🏢',
    colorAccent: 'amber',
    progressPercent: 85,
    projectLead: 'مهدی لقمانی',
    projectLeadRole: 'مدیر پروژه و استراتژیست برند',
    contractDate: '۱۴۰۵/۰۱/۲۰',
    deliveryDate: '۱۴۰۵/۰۸/۳۰',
    scopeSummary: 'طراحی جامع هویت برند، سیستم گرافیکی پرمیوم، تدوین استراتژی کمپین‌های فروش املاک لوکس و تولید محتوای مداوم.',
    milestones: [
      { id: 'm1', title: 'تحقیقات بازار و تعیین دی‌ان‌ای برند', description: 'تحلیل مخاطبان هدف املاک لوکس و پیام‌های کلیدی', status: 'completed', date: '۱۴۰۵/۰۱/۲۵' },
      { id: 'm2', title: 'طراحی هویت بصری و لوگوتایپ اختصاصی', description: 'تایپوگرافی مهندسی‌شده، پالت رنگی و نشان تجاری', status: 'completed', date: '۱۴۰۵/۰۲/۱۵' },
      { id: 'm3', title: 'فیلمبرداری و تصویربرداری پروژه نیاوران', description: 'شوتینگ سینمایی با تجهیزات 4K و نورپردازی حرفه‌ای', status: 'completed', date: '۱۴۰۵/۰۴/۱۰' },
      { id: 'm4', title: 'تدوین پکیج کمپین فروش و ریلزهای معرفی', description: 'ادیت پریمیوم و موشن‌گرافیک پرزنتیشن واحدها', status: 'in-progress', date: '۱۴۰۵/۰۷/۲۰' },
      { id: 'm5', title: 'لانچ نهایی کمپین فروش پاییزه', description: 'شروع انتشار در سوشال مدیا و تبلیغات هدفمند', status: 'pending', date: '۱۴۰۵/۰۸/۳۰' },
    ],
    deliverables: [
      {
        id: 'del-1',
        title: 'کتابچه جامع هویت بصری (Brand Guidelines Book)',
        type: 'branding',
        format: 'PDF • Vector',
        fileSize: '42.5 MB',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        version: 'v2.1 Final',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۲/۱۸',
        clientFeedback: 'هویت بصری و رنگ‌بندی فوق‌العاده شیک است و دقیقاً همان حس لوکس املاک پرمیوم را تداعی می‌کند.',
        feedbackDate: '۱۴۰۵/۰۲/۲۰',
      },
      {
        id: 'del-2',
        title: 'تیزر مستر معرفی پنت‌هاوس نیاوران (Master 4K Edit)',
        type: 'video',
        format: 'MP4 • ProRes 422 HQ',
        fileSize: '1.4 GB',
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        version: 'v1.2 Cut',
        status: 'pending-review',
        dateUploaded: '۱۴۰۵/۰۷/۲۵',
      },
      {
        id: 'del-3',
        title: 'پکیج ۱۰ اسلاید کاور اینستاگرام و قالب استوری‌ها',
        type: 'branding',
        format: 'Figma & PNG Package',
        fileSize: '88 MB',
        thumbnail: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۷/۱۵',
      },
    ],
    calendar: [
      {
        id: 'cp-1',
        title: 'ریلز بررسی معماری پنت‌هاوس لوکس با اجرای مهندس یوسف‌زاده',
        platform: 'instagram',
        format: 'reels',
        scheduledDate: '2026-11-04',
        persianDate: '۱۴ آبان ۱۴۰۵',
        status: 'ready',
        captionDraft: 'چرا کیفیت متریال در ساخت سازه‌های لوکس، بازده سرمایه‌گذاری را تضمین می‌کند؟ جزئیات مهندسی در پنت‌هاوس نیاوران.',
      },
      {
        id: 'cp-2',
        title: 'کاروسل آموزشی: ۵ اشتباه مهلک در خرید املاک تجاری',
        platform: 'instagram',
        format: 'carousel',
        scheduledDate: '2026-11-09',
        persianDate: '۱۹ آبان ۱۴۰۵',
        status: 'in-progress',
        captionDraft: 'قبل از امضای مبایعه‌نامه این ۵ مورد حقوقی و فنی را حتماً بررسی کنید...',
      },
    ],
    feedbacks: [
      {
        id: 'fb-1',
        author: 'مهدی لقمانی',
        role: 'lead',
        message: 'مهندس یوسف‌زاده عزیز، خروجی تدوین نسخه ۱.۲ تیزر نیاوران آماده بازبینی است. لطفاً بخش نریشن ثانیه ۴۵ را بررسی بفرمایید.',
        timestamp: 'دیروز، ساعت ۱۶:۲۰',
      },
      {
        id: 'fb-2',
        author: 'مهندس یوسف‌زاده',
        role: 'client',
        message: 'سلام جناب لقمانی، کیفیت تصویربرداری عالی است. فقط لطفاً موسیقی زیرصدای بخش آخر کمی آرام‌تر و فاخرتر باشد.',
        timestamp: 'امروز، ساعت ۱۰:۱۵',
      },
    ],
  },
  {
    id: 'client-dr-peiravi',
    slug: 'dr-peiravi',
    pinCode: '1002',
    brandName: 'کلینیک زیبایی دکتر صادق پیروی',
    brandNameEn: 'Dr. Sadegh Peiravi Aesthetic Clinic',
    ownerName: 'دکتر صادق پیروی',
    category: 'تولید محتوای اینستاگرام با دوربین سینمایی و ادیت پریمیوم',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '🩺',
    colorAccent: 'rose',
    progressPercent: 78,
    projectLead: 'فریدون یوسف‌زاده',
    projectLeadRole: 'مدیر هنری، ادیتور و ایده‌پرداز',
    contractDate: '۱۴۰۵/۰۲/۰۱',
    deliveryDate: '۱۴۰۵/۰۹/۱۵',
    scopeSummary: 'سناریونویسی علمی-جذاب، تصویربرداری داخل مطب با لنز پرتره حرفه‌ای، ادیت پریمیوم بدون اعوجاج رنگی و مدیریت جلوه‌های بصری پوست.',
    milestones: [
      { id: 'm1', title: 'تنظیم تقویم سناریوها و موضوعات تخصصی زیبایی', description: 'برنامه‌ریزی ۱۲ ریلز تخصصی در مورد مراقبت‌های پوستی', status: 'completed', date: '۱۴۰۵/۰۲/۱۰' },
      { id: 'm2', title: 'روز فیلمبرداری فاز یک در کلینیک', description: 'ضبط ۸ ساعت با ستاپ دو دوربینه و میکروفون یقه‌ای', status: 'completed', date: '۱۴۰۵/۰۳/۰۴' },
      { id: 'm3', title: 'کالرگریدینگ و ادیت پریمیوم ریلزهای پزشکی', description: 'حفظ رنگ پوست طبیعی و نورپردازی های-اند', status: 'in-progress', date: '۱۴۰۵/۰۷/۲۵' },
      { id: 'm4', title: 'تحویل نهایی فصل دوم ویدیوها', description: 'پکیج آماده انتشار با کاورهای مینیمال', status: 'pending', date: '۱۴۰۵/۰۹/۱۵' },
    ],
    deliverables: [
      {
        id: 'del-peiravi-1',
        title: 'ریلز ۱: باورهای غلط درباره بوتاکس و افتادگی پلک (Final Master)',
        type: 'reels',
        format: 'MP4 9:16 • 4K',
        fileSize: '240 MB',
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        version: 'v2.0 Clean',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۷/۲۰',
        clientFeedback: 'ادیت و زیرنویس‌های متحرک بسیار خوانا و هماهنگ با کلاس کاری مطب است.',
        feedbackDate: '۱۴۰۵/۰۷/۲۲',
      },
      {
        id: 'del-peiravi-2',
        title: 'ریلز ۲: کالبدشکافی مراقبت بعد از لیزر جوانسازی',
        type: 'reels',
        format: 'MP4 9:16 • 4K',
        fileSize: '310 MB',
        thumbnail: 'https://images.unsplash.com/photo-1512290900672-1f553f191b48?auto=format&fit=crop&w=800&q=80',
        version: 'v1.1 Cut',
        status: 'pending-review',
        dateUploaded: '۱۴۰۵/۰۷/۲۸',
      },
    ],
    calendar: [
      {
        id: 'cp-p1',
        title: 'ریلز پاسخ به ۵ سوال پر تکرار مراجعین مزوتراپی',
        platform: 'instagram',
        format: 'reels',
        scheduledDate: '2026-11-03',
        persianDate: '۱۳ آبان ۱۴۰۵',
        status: 'ready',
        captionDraft: 'آیا مزوتراپی درد دارد؟ نتایج آن تا چند وقت ماندگار است؟ توضیحات دکتر صادق پیروی...',
      },
    ],
    feedbacks: [
      {
        id: 'fb-p1',
        author: 'فریدون یوسف‌زاده',
        role: 'lead',
        message: 'سلام آقای دکتر، ریلز دوم بارگذاری شد. لطفاً موشن‌گرافیک‌های معرفی ترکیبات سرم در ثانیه ۲۲ را چک کنید.',
        timestamp: 'امروز، ۱۲:۳۰',
      },
    ],
  },
  {
    id: 'client-ghollak',
    slug: 'ghollak',
    pinCode: '1003',
    brandName: 'آموزش اقتصادی قلک طلا',
    brandNameEn: 'Ghollak Tala Financial Academy',
    ownerName: 'آقای خسروی‌فر',
    category: 'تولید محتوا و آموزش اقتصادی با ادیت پریمیوم',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '💰',
    colorAccent: 'amber',
    progressPercent: 90,
    projectLead: 'فریدون یوسف‌زاده',
    projectLeadRole: 'مدیر هنری و ادیتور',
    contractDate: '۱۴۰۵/۰۱/۱۵',
    deliveryDate: '۱۴۰۵/۰۸/۱۵',
    scopeSummary: 'تولید محتوای تخصصی مالی، نمودارهای متحرک، ادیت پریمیوم ویدیوهای تحلیلی طلا و ارز با ریتم تند و اینگیجمنت بالا.',
    milestones: [
      { id: 'gm1', title: 'برندینگ صوتی و تصویری آغاز ویدیوها', description: 'طراحی موشن‌اینترو و سیستم گرافیک متحرک چارت‌ها', status: 'completed', date: '۱۴۰۵/۰۲/۰۱' },
      { id: 'gm2', title: 'پکیج ۱۰ قسمتی تحلیل تکنیکال برای مبتدیان', description: 'ادیت با جلوه‌های صوتی دقیق و اینفوگرافیک', status: 'completed', date: '۱۴۰۵/۰۵/۱۰' },
      { id: 'gm3', title: 'سلسله ریلزهای روانشناسی بازار سرمایه', description: 'تولید و بهینه‌سازی برای الگوریتم اینستاگرام', status: 'in-progress', date: '۱۴۰۵/۰۷/۲۹' },
    ],
    deliverables: [
      {
        id: 'del-g1',
        title: 'ریلز بررسی حباب سکه و زمان ورود هوشمند به طلا',
        type: 'reels',
        format: 'MP4 9:16',
        fileSize: '190 MB',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0 Final',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۷/۲۶',
      },
    ],
    calendar: [
      {
        id: 'cp-g1',
        title: 'ریلز هفتگی: تحلیل نوسانات انس جهانی طلا در ماه جدید',
        platform: 'instagram',
        format: 'reels',
        scheduledDate: '2026-11-02',
        persianDate: '۱۲ آبان ۱۴۰۵',
        status: 'ready',
        captionDraft: 'چرا تغییر نرخ بهره فدرال رزرو مستقیماً قیمت طلا در تهران را تکان می‌دهد؟ تحلیل اختصاصی قلک طلا.',
      },
    ],
    feedbacks: [],
  },
  {
    id: 'client-kaviani',
    slug: 'kaviani',
    pinCode: '1004',
    brandName: 'مشاوره املاک کیان کاویانی',
    brandNameEn: 'Kian Kaviani Real Estate Consultation',
    ownerName: 'کیان کاویانی',
    category: 'تولید محتوای اینستاگرام، تصویربرداری حرفه‌ای و ادیت',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '🗝️',
    colorAccent: 'blue',
    progressPercent: 70,
    projectLead: 'اسماعیل سامانی پور',
    projectLeadRole: 'تصویربردار، کارگردان و ایده‌پرداز',
    contractDate: '۱۴۰۵/۰۳/۰۱',
    deliveryDate: '۱۴۰۵/۰۹/۳۰',
    scopeSummary: 'تور ویدیویی سینمایی از ویلاها و آپارتمان‌های خاص، پرسونال برندینگ کیان کاویانی و مشاوره خرید ملک.',
    milestones: [
      { id: 'km1', title: 'توسعه استایل بصری و پرسونال برندینگ', description: 'تعیین پالت لباس، قاب‌بندی و زوایای معرفی سوژه', status: 'completed', date: '۱۴۰۵/۰۳/۱۵' },
      { id: 'km2', title: 'تصویربرداری هوایی هلی‌شات و رونین ویلاهای لواسان', description: 'ضبط با دوربین سونی سینمایی و لنز واید پرمیوم', status: 'completed', date: '۱۴۰۵/۰۶/۲۰' },
      { id: 'km3', title: 'مجموعه ویدیوهای آموزشی قوانین پیش‌خرید', description: 'تدوین با زیرنویس‌های ترند و هایلایت صوتی', status: 'in-progress', date: '۱۴۰۵/۰۷/۲۵' },
    ],
    deliverables: [
      {
        id: 'del-k1',
        title: 'ویدیو پرزنت عمارت مدرن لواسان (Cinematic Walkthrough)',
        type: 'video',
        format: 'MP4 4K • 16:9 & 9:16',
        fileSize: '820 MB',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0 Cut',
        status: 'pending-review',
        dateUploaded: '۱۴۰۵/۰۷/۲۷',
      },
    ],
    calendar: [],
    feedbacks: [],
  },
  {
    id: 'client-gogona',
    slug: 'gogona',
    pinCode: '1005',
    brandName: 'شرکت صنعتی گوگونا',
    brandNameEn: 'Gogona Industrial Group',
    ownerName: 'مدیریت بازرگانی گوگونا',
    category: 'تیزر تبلیغاتی و برندینگ صنعتی',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '⚙️',
    colorAccent: 'amber',
    progressPercent: 95,
    projectLead: 'محمد مهدی پور',
    projectLeadRole: 'تصویربردار، کارگردان و ایده‌پرداز',
    contractDate: '۱۴۰۵/۰۲/۱۵',
    deliveryDate: '۱۴۰۵/۰۸/۱۰',
    scopeSummary: 'تیزر بین‌المللی خطوط تولید مکانیزه، مستندسازی استانداردهای صنعتی و خلق تصاویر پرشکوه کارخانه‌ای.',
    milestones: [
      { id: 'gm1', title: 'سناریو و استوری‌بورد صنعتی', description: 'تصویب کانسپت قدرت تولید ملی و زنجیره تامین', status: 'completed', date: '۱۴۰۵/۰۳/۰۱' },
      { id: 'gm2', title: 'تصویربرداری خطوط تولید رباتیک با کرین و رونین', description: 'فیلمبرداری با نورپردازی متالیک و افکت‌های صنعتی', status: 'completed', date: '۱۴۰۵/۰۴/۱۵' },
      { id: 'gm3', title: 'صداگذاری اختصاصی، افکت‌های فوولی و کالرگرید', description: 'تولید ساند دیزاین حجیم صنعتی و رنگ‌آمیزی نقره‌ای-نارنجی', status: 'completed', date: '۱۴۰۵/۰۷/۱۵' },
    ],
    deliverables: [
      {
        id: 'del-gog-1',
        title: 'تیزر اصلی مستر کارخانه گوگونا (International 4K Cut)',
        type: 'video',
        format: 'ProRes 422 HQ & MP4',
        fileSize: '3.1 GB',
        thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        version: 'v2.0 Approved',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۷/۱۸',
        clientFeedback: 'کیفیت تصویر و ابهت کارخانه در این تیزر بی‌نظیر به تصویر کشیده شده است. سپاس از تیم تولید.',
        feedbackDate: '۱۴۰۵/۰۷/۲۱',
      },
    ],
    calendar: [],
    feedbacks: [],
  },
  {
    id: 'client-sepanja',
    slug: 'sepanja',
    pinCode: '1010',
    brandName: 'سپنجا (سامانه رزرو اقامتگاه و گردشگری)',
    brandNameEn: 'Sepanja Tourism & Booking Platform',
    ownerName: 'تیم مارکتینگ سپنجا',
    category: 'ادیت ویدیو اینستاگرام و موشن دیزاین گردشگری',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    logoBadge: '🏖️',
    colorAccent: 'emerald',
    progressPercent: 82,
    projectLead: 'علیرضا شیعه زاده',
    projectLeadRole: 'طراح UI/UX، گرافیست و مشاور هنری برند',
    contractDate: '۱۴۰۵/۰۳/۱۰',
    deliveryDate: '۱۴۰۵/۰۹/۱۰',
    scopeSummary: 'موشن‌دیزاین پویا و ترند از لوکیشن‌های رویایی اقامتی در شمال، جنوب و کویر ایران به همراه طراحی کمپین‌های تخفیفی سفر.',
    milestones: [
      { id: 'sm1', title: 'طراحی دیزاین سیستم موشن و المان‌های رابط کاربری سپنجا', description: 'موشن گرافیک کاربری آسان رزرو اقامتگاه در موبایل', status: 'completed', date: '۱۴۰۵/۰۴/۰۱' },
      { id: 'sm2', title: 'پکیج ۸ عددی ریلزهای معرفی اقامتگاه‌های بومگردی', description: 'ادیت با ضرب‌آهنگ موزیک‌های دلنشین سفر', status: 'completed', date: '۱۴۰۵/۰۶/۱۵' },
      { id: 'sm3', title: 'کمپین تخفیف ویژه پاییزه سفر', description: 'استوری‌ها و ریلزهای تعاملی با نرخ کلیک بالا', status: 'in-progress', date: '۱۴۰۵/۰۷/۲۲' },
    ],
    deliverables: [
      {
        id: 'del-sep-1',
        title: 'موشن استوری کمپین سفر پاییزی به کلبه‌های چوبی ماسال',
        type: 'reels',
        format: 'MP4 9:16 60FPS',
        fileSize: '115 MB',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        version: 'v1.1 Master',
        status: 'approved',
        dateUploaded: '۱۴۰۵/۰۷/۲۴',
      },
      {
        id: 'del-sep-2',
        title: 'ریلز کانسپت «از کار خسته شدی؟» رزرو اقامتگاه در ۳ دقیقه',
        type: 'reels',
        format: 'MP4 9:16',
        fileSize: '160 MB',
        thumbnail: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0 Cut',
        status: 'pending-review',
        dateUploaded: '۱۴۰۵/۰۷/۲۸',
      },
    ],
    calendar: [
      {
        id: 'cp-s1',
        title: 'ریلز مقایسه اقامتگاه‌های کویری یزد و کاشان برای تعطیلات آخر هفته',
        platform: 'instagram',
        format: 'reels',
        scheduledDate: '2026-11-05',
        persianDate: '۱۵ آبان ۱۴۰۵',
        status: 'ready',
        captionDraft: 'کدوم اقامتگاه رو برای ریلکس کردن در سکوت کویر انتخاب می‌کنی؟ لینک رزرو مستقیم در بایو سپنجا.',
      },
    ],
    feedbacks: [],
  },
];
