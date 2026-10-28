/**
 * Creativity Juice — Portfolio Gallery Component
 * High-end showcase of Branding & Cinema Case Studies with category filtering,
 * cinematic hover effects, video teaser overlays, and interactive case study drawer
 */

import React, { useState, useMemo, useEffect } from 'react';
import { getProjects, CJ_STUDIO_DATA_EVENT, ProjectItem } from './adminStore';

export interface CaseStudy {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: 'branding' | 'cinema' | 'packaging' | 'editorial';
  categoryLabel: string;
  client: string;
  year: string;
  trackCode: string;
  coverImage: string;
  cinemaRatio?: boolean; // 16:9 or 21:9 cinematic banner
  videoDuration?: string; // e.g. "۲:۳۰ دقیقه • فیلم ۴K"
  badge: string;
  challenge: string;
  solution: string;
  metrics: string;
  deliverables: string[];
  tags: string[];
  colorAccent: string;
  galleryImages: string[];
}

export const PORTFOLIO_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'arka-architecture',
    title: 'آتلیه معماری آرکا',
    titleEn: 'Arka Architecture Atelier',
    subtitle: 'ری‌برندینگ جامع، کتابچه مانیفست و فیلم مستند سینمایی ۳۵ میلی‌متری',
    category: 'branding',
    categoryLabel: 'معماری و هویت برند',
    client: 'گروه معماری آرکا',
    year: '۱۴۰۳',
    trackCode: 'TRACK 01 // BRAND DNA & CINEMA',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: true,
    videoDuration: '۳:۱۵ دقیقه • فیلم مانیفست ۳۵mm',
    badge: 'برنده سالنامه معماری معاصر',
    challenge: 'دفتر معماری با ۲ دهه سابقه، گرفتار کلیشه‌های تکراری شرکتی شده بود و هویت بصری آن بازتاب‌دهنده جسارت پروژه‌های بتنی و مدرن آن نبود.',
    solution: 'تدوین مانیفست بنیادین، طراحی لوگوتایپ مونوکروم بتنی، کتابچه مونوگراف کتان چاپی و کارگردانی فیلم کوتاه سینمایی مستند از پروژه‌ها با لنزهای آنامورفیک.',
    metrics: '+۲۸۰٪ رشد پرونده‌های ویلایی لوکس • برنده جایزه دیزاین سال',
    deliverables: [
      'سند استراتژی و مانیفست بنیادین',
      'طراحی کامل لوگوتایپ و دیزاین سیستم',
      'کتابچه مونوگراف کتان چاپی با گرید سوئیسی',
      'کارگردانی فیلم سینمایی مانیفست',
    ],
    tags: ['معماری', 'ری‌برندینگ', 'سینمای تجاری', 'تایپوگرافی'],
    colorAccent: '#D97706',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'apex-noir',
    title: 'کالکشن استریت‌ویر اپکس (Apex Noir)',
    titleEn: 'Apex Noir Streetwear',
    subtitle: 'کارگردانی فیلم‌های مد، سناریونویسی سینمایی و عکاسی لوک‌بوک',
    category: 'cinema',
    categoryLabel: 'سینمای تجاری و فیلم مد',
    client: 'برند استریت‌ویر Apex',
    year: '۱۴۰۳',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: true,
    videoDuration: '۲:۴۵ دقیقه • فیلم مد سینمایی',
    badge: 'بهترین آرت‌دایرکشن فشن فیلم',
    challenge: 'بازار پوشاک مملو از تیزرهای سطحی و بدون قصه بود. اپکس نیاز به یک جهان داستانی سینمایی داشت تا قیمت‌گذاری پریمیوم خود را توجیه کند.',
    solution: 'نگارش سناریوی سورئال شبانه، فیلم‌برداری با دوربین‌های سینمایی Red Monstro و نورپردازی نئوکلاسیک، همراه با تدوین قطعات ساند دیزاین آنالوگ.',
    metrics: 'سولد-اوت کالکشن در ۱۸ دقیقه • ۶.۲ میلیون بازدید ارگانیک',
    deliverables: [
      'فیلم سینمایی مد برای لانچ کالکشن',
      'مجموعه ۳۰ فریم عکاسی آنالوگ ۳۵ میلی‌متری',
      'ساند ترک و طراحی صدای اورجینال',
      'کمپین استوری‌های تعاملی لانچ',
    ],
    tags: ['سینمای مد', 'کارگردانی', 'نورپردازی آنالوگ', 'فشن'],
    colorAccent: '#F97316',
    galleryImages: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'nectar-tonic',
    title: 'نوشیدنی ارگانیک نکتار تونیک',
    titleEn: 'Nectar Organic Tonic',
    subtitle: 'طراحی قوطی متالیک امباس‌شده، دراپ کپسولی و کمپین لانچ ۳۶۰ درجه',
    category: 'packaging',
    categoryLabel: 'بسته‌بندی و پکیجینگ لوکس',
    client: 'هلدینگ صنایع نوشیدنی نکتار',
    year: '۱۴۰۳',
    trackCode: 'TRACK 03 // PACKAGING & DROPS',
    coverImage: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: false,
    badge: 'دراپ موفق ماه',
    challenge: 'عرضه یک نوشیدنی تونیک ارگانیک در بازاری که قفسه‌ها پر از بسته‌بندی‌های شلوغ و ارزان‌قیمت بود.',
    solution: 'استفاده از آلومینیوم مات سندبلاست با چاپ طلای موضعی، طراحی تایپوگرافی مونوگرام مینیمال و تولید ویدئو تیزر کوتاه با فوکوس ماکرو بر قطرات شبنم.',
    metrics: '+۴۲۰٪ سفارش اول • توزیع در هتل‌های ۵ ستاره و کافه‌های منتخب',
    deliverables: [
      'معماری قوطی متالیک و بطری شیشه‌ای امباس',
      'تیزر موشن سه‌بعدی و فیلم‌برداری ماکرو',
      'استراتژی توزیع محدود (Limited Drop)',
      'پکیج جعبه هدیه VIP کتان',
    ],
    tags: ['بسته‌بندی', 'نوشیدنی', 'دراپ کپسولی', 'لاکچری'],
    colorAccent: '#F59E0B',
    galleryImages: [
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'lumina-platform',
    title: 'پلتفرم لومینا (Lumina)',
    titleEn: 'Lumina Creative Platform',
    subtitle: 'دی‌ان‌ای برند، دیزاین سیستم پویا و پرتال وب تعاملی سه‌بعدی',
    category: 'branding',
    categoryLabel: 'معماری و هویت برند',
    client: 'استارتاپ فین‌تک لومینا',
    year: '۱۴۰۲',
    trackCode: 'TRACK 01 // BRAND IDENTITY',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: true,
    videoDuration: '۱:۵۰ دقیقه • موشن تایپوگرافی کینتیک',
    badge: 'برترین دیزاین سیستم فین‌تک',
    challenge: 'ایجاد تمایز کامل در صنعت فناوری مالی که عموماً خشک، آبی‌رنگ و فاقد روح هنری است.',
    solution: 'خلق هویتی گرم بر پایه طیف‌های ارگانیک شن و کهربا، همراه با رابط کاربری وب سه بعدی با شیدرهای تعاملی WebGL.',
    metrics: 'جذب ۱.۵ میلیون دلار سرمایه سری A • زمان ماندگاری کاربر: +۱۴۰٪',
    deliverables: [
      'کتابچه جامع دیزاین سیستم و گایدلاین فونت',
      'پرتال وب سه بعدی و تعاملی',
      'موشن‌های کینتیک لوگو و آیکون‌گرافی اختصاصی',
    ],
    tags: ['دیجیتال', 'برندینگ', 'فین‌تک', 'دیزاین سیستم'],
    colorAccent: '#EA580C',
    galleryImages: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'velvet-rust',
    title: 'عطر ولوت اند راست (Velvet & Rust)',
    titleEn: 'Velvet & Rust Parfumerie',
    subtitle: 'روایتگری ادیتوریال، طراحی بطری شیشه‌ای دست‌ساز و سینمای نوآر',
    category: 'cinema',
    categoryLabel: 'سینمای تجاری و فیلم مد',
    client: 'خانه عطر نیش Velvet & Rust',
    year: '۱۴۰۳',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    coverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: true,
    videoDuration: '۳:۴۰ دقیقه • فیلم کوتاه نوار در پاریس',
    badge: 'منتخب فستیوال فیلم‌های تبلیغاتی',
    challenge: 'عطر یک تجربه بویایی است؛ چگونه می‌توان رایحه تنباکو، مخمل و زنگار را صرفاً از طریق تصویر و سینما به ذهن مخاطب منتقل کرد؟',
    solution: 'توسعه فیلم سینمایی نئونوآر با ریتم آهسته و فضاسازی مه‌آلود، طراحی شیشه با تراش هندسی و درب برنجی پتینه‌شده دستی.',
    metrics: 'سولد-اوت کامل بچ اول در ۵۰۰ نسخه شماره‌گذاری‌شده',
    deliverables: [
      'فیلم سینمایی داستانی با بازیگران بین‌المللی',
      'معماری فرم بطری، جعبه چوبی و لیبل مونوگرام',
      'ژورنال پرینت ادیتوریال حاوی شعر و استوری بورد',
    ],
    tags: ['عطر', 'سینمای نوآر', 'شیشه‌گری', 'ادیتوریال'],
    colorAccent: '#B45309',
    galleryImages: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'pulse-acoustics',
    title: 'سیستم صوتی های‌فای پالس (Pulse)',
    titleEn: 'Pulse Hi-Fi Acoustics',
    subtitle: 'لانچ هدفون نویزکنسلینگ، هویت صنعتی و فیلم صوتی سه‌بعدی',
    category: 'branding',
    categoryLabel: 'معماری و هویت برند',
    client: 'آکوستیک پالس',
    year: '۱۴۰۲',
    trackCode: 'TRACK 01 // BRAND DNA',
    coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: false,
    videoDuration: '۱:۴۰ دقیقه • دموی صدای فراگیر ۳D',
    badge: 'طراحی صنعتی نمونه',
    challenge: 'هدفون‌های باکیفیت در محاصره غول‌های بین‌المللی؛ نیاز به هویتی مستقل با تمرکز بر شفافیت صوت برای طراحان و تهیه‌کنندگان.',
    solution: 'زبان طراحی متالیک با خطوط مینیمال بدون انحنای اضافه، هویت شنیداری (Sonic Branding) چندلایه و بسته‌بندی زیست‌تخریب‌پذیر.',
    metrics: '+۳۱۰٪ سفارش پیش‌خرید در کیک‌استارتر • امتیاز ۹.۶ صدا',
    deliverables: [
      'هویت بصری و سونیک برندینگ (Sonic Logo)',
      'طراحی پکیجینگ و دفترچه راهنمای چاپ ابریشم',
      'فیلم پروداکشن معرفی درایورهای تیتانیومی',
    ],
    tags: ['تکنولوژی', 'صدا', 'هویت سونیک', 'طراحی صنعتی'],
    colorAccent: '#78716C',
    galleryImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'soleil-residence',
    title: 'عمارت‌های لوکس سولای (Soleil)',
    titleEn: 'Soleil Private Residences',
    subtitle: 'هویت اقامتگاه‌های سوپرلوکس، فیلم معماری هلیکوپتری و آلبوم چرمی',
    category: 'editorial',
    categoryLabel: 'کارگردانی هنری و ادیتوریال',
    client: 'هلدینگ توسعه املاک سولای',
    year: '۱۴۰۳',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: true,
    videoDuration: '۴:۱۰ دقیقه • فیلم هوایی و معماری ۴K',
    badge: 'پروژه پرچمدار سال',
    challenge: 'فروش واحدهای پنت‌هاوس اختصاصی به خریداران بین‌المللی بدون نیاز به تبلیغات عمومی و با حفظ محرمانگی.',
    solution: 'تولید باکس‌ست چرمی شماره‌گذاری‌شده همراه با تبلت ویژه پخش فیلم معماری سینمایی و عکاسی ساعت طلایی از فراز آسمان.',
    metrics: 'فروش ۱۰۰٪ پنت‌هاوس‌ها در فاز پیش‌فروش اختصاصی',
    deliverables: [
      'فیلم مستند سینمایی با تصویربرداری هوایی هلیکوپتری',
      'آلبوم چرم ایتالیایی دست‌دوز با چاپ طلاکوب',
      'برند بوک معماری و متریال‌های داخلی',
    ],
    tags: ['معماری', 'سینما', 'لاکچری', 'ادیتوریال'],
    colorAccent: '#D97706',
    galleryImages: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    id: 'kuro-matcha',
    title: 'چای تشریفاتی کورو (Kuro Matcha)',
    titleEn: 'Kuro Ceremonial Matcha',
    subtitle: 'پیوند مینیمالیسم ژاپنی-سوئیسی، قوطی‌های سرامیکی و تیزر مکاشفه ذن',
    category: 'packaging',
    categoryLabel: 'بسته‌بندی و پکیجینگ لوکس',
    client: 'آتلیه کورو کیوتو',
    year: '۱۴۰۲',
    trackCode: 'TRACK 03 // PACKAGING & DROPS',
    coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1600&q=85',
    cinemaRatio: false,
    videoDuration: '۱:۳۰ دقیقه • مینی‌فیلم چای سنتی',
    badge: 'طراحی منتخب سال توکیو',
    challenge: 'احیای فرهنگ سنتی چای ماتچا برای نسل جدید طرفداران سبک زندگی مینیمال در شهرهای بزرگ.',
    solution: 'تولید ظروف سرامیکی دست‌ساز مشکی مات، مهر و موم با موم طبیعی و فیلم کوتاه ذن با تمرکز بر صدای آب و حرکت فوم سبز.',
    metrics: '+۵۰۰٪ تقاضای بازار صادراتی به اروپا',
    deliverables: [
      'طراحی کامل بسته‌بندی سرامیکی و مهر مونوگرام',
      'ویدئوی آرامش‌بخش ذن برای سوشال مدیا',
      'کتابچه آموزش آیینی دم‌آوری چای',
    ],
    tags: ['چای', 'بسته‌بندی', 'ذن', 'مینیمالیسم'],
    colorAccent: '#059669',
    galleryImages: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

interface PortfolioGalleryProps {
  onOpenBriefWithProject?: (projectTitle: string) => void;
  className?: string;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  onOpenBriefWithProject,
  className = '',
}) => {
  const [allCases, setAllCases] = useState<CaseStudy[]>(() => {
    const p = getProjects();
    return p.length > 0 ? (p as unknown as CaseStudy[]) : PORTFOLIO_CASE_STUDIES;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const p = getProjects();
      if (p.length > 0) {
        setAllCases(p as unknown as CaseStudy[]);
      }
    };
    window.addEventListener(CJ_STUDIO_DATA_EVENT, handleUpdate);
    return () => window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleUpdate);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'cinema'>('grid');

  const CATEGORIES = useMemo(() => [
    { id: 'all', label: 'همه پرونده‌ها', icon: '✦', count: allCases.length },
    { id: 'branding', label: 'معماری و هویت برند', icon: '🏛️', count: allCases.filter((c) => c.category === 'branding').length },
    { id: 'cinema', label: 'سینمای تجاری و فیلم مد', icon: '🎬', count: allCases.filter((c) => c.category === 'cinema').length },
    { id: 'packaging', label: 'بسته‌بندی و پکیجینگ لوکس', icon: '📦', count: allCases.filter((c) => c.category === 'packaging').length },
    { id: 'editorial', label: 'کارگردانی هنری و ادیتوریال', icon: '📖', count: allCases.filter((c) => c.category === 'editorial').length },
  ], [allCases]);

  // Filtered case studies
  const filteredCases = useMemo(() => {
    return allCases.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !item.tags.includes(selectedTag)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.client.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allCases, selectedCategory, selectedTag, searchQuery]);

  // Unique tags for quick filter chips
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allCases.forEach((item) => item.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [allCases]);

  return (
    <div
      className={`flex flex-col bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right ${className}`}
      dir="rtl"
    >
      {/* Top Header & Filter Controls Bar */}
      <div className="p-4 sm:p-5 bg-white border-b border-neutral-200/90 shrink-0 space-y-3.5 shadow-xs">
        {/* Title & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-sm">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
                  گالری پرونده‌های استودیو • Portfolio Gallery
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                  CASE STUDIES
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                مجموعه پرونده‌های استراتژیک هویت برند، سینمای تجاری، بسته‌بندی و ادیتوریال
              </p>
            </div>
          </div>

          {/* View switcher & search input */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در پرونده‌ها..."
                className="py-1.5 px-3 pr-8 rounded-xl bg-neutral-100 border border-neutral-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-neutral-900 outline-none w-36 sm:w-48 transition-all placeholder:text-neutral-400"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="bg-neutral-100 p-0.5 rounded-xl flex items-center border border-neutral-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="نمای شبکه‌ای استاندارد"
              >
                ⊞ شبکه
              </button>
              <button
                onClick={() => setViewMode('cinema')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cinema'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="نمای عریض سینمایی (Cinema Widescreen)"
              >
                🎬 سینمایی
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs scale-100'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-transparent'
                }`}
              >
                <span className="text-xs">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200/80 text-neutral-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Tag Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] pt-0.5">
          <span className="text-neutral-400 font-bold shrink-0 ml-1">تگ‌های موضوعی:</span>
          {allTags.map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isTagActive ? null : tag)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                  isTagActive
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                #{tag}
              </button>
            );
          })}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-amber-700 hover:underline text-[10px] font-bold shrink-0 mr-1"
            >
              پاک کردن فیلتر تگ ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Gallery Showcase Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredCases.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-3">🔍</span>
            <h3 className="text-sm font-bold text-neutral-700">هیچ پرونده‌ای با این مشخصات یافت نشد.</h3>
            <p className="text-xs text-neutral-400 mt-1">لطفاً فیلترهای انتخابی یا عبارت جستجو را تغییر دهید.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
                setSearchQuery('');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer"
            >
              نمایش همه آثار استودیو
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Editorial 3-Column / 2-Column Responsive Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCases.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveCaseStudy(item)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
              >
                {/* Visual Cover Container with Cinematic Hover Effects */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter contrast-[1.03]"
                    loading="lazy"
                  />

                  {/* Gradient Vignette Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                  {/* Top Badges (Category & Video Duration) */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold border border-white/15">
                      {item.trackCode}
                    </span>
                    {item.videoDuration && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                        <span>▶</span>
                        <span>{item.videoDuration.split('•')[0]}</span>
                      </span>
                    )}
                  </div>

                  {/* Center Play / Case Study Reveal Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-10">
                    <div className="px-4 py-2 rounded-full bg-amber-500/95 text-neutral-950 font-black text-xs flex items-center gap-2 shadow-2xl backdrop-blur-sm">
                      <span>✦ مطالعه پرونده و فیلم</span>
                      <span className="text-sm">←</span>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 inset-x-3 z-10 text-white">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mb-0.5">
                      {item.client} • {item.year}
                    </span>
                    <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {item.subtitle}
                    </p>

                    {/* Metric Highlight Chip */}
                    <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="text-amber-600">📈</span>
                      <span className="truncate">{item.metrics}</span>
                    </div>
                  </div>

                  {/* Tags & Action Row */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {item.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-bold text-neutral-900 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0">
                      مشاهده پرونده ←
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Cinema Widescreen View (Large Cinematic Cards with Video Reel Vibes) */
          <div className="space-y-6 max-w-5xl mx-auto">
            {filteredCases.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveCaseStudy(item)}
                className="group relative bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 hover:border-amber-500 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col lg:flex-row"
              >
                {/* Widescreen 16:9 Banner */}
                <div className="relative lg:w-3/5 aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Cinema Play Icon on Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xl shadow-2xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-all duration-300">
                      ▶
                    </div>
                  </div>

                  {item.videoDuration && (
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-400 font-mono text-[11px] font-bold border border-white/10">
                      {item.videoDuration}
                    </div>
                  )}
                </div>

                {/* Cinema Info Panel */}
                <div className="lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between text-white space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs font-mono text-neutral-400">{item.year}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 block mt-1" dir="ltr">
                      {item.titleEn}
                    </span>

                    <p className="text-xs text-neutral-300 leading-relaxed mt-3">
                      {item.subtitle}
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <span className="text-amber-400 font-bold block mb-1">دستاورد و ایمپکت:</span>
                      <span className="text-neutral-200">{item.metrics}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400">کلاینت: {item.client}</span>
                    <button className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs group-hover:bg-amber-400 transition-colors">
                      مطالعه سناریو و فیلم ←
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Case Study Detail Modal */}
      {activeCaseStudy && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveCaseStudy(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col text-right"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header Hero Image with 21:9 Letterbox */}
            <div className="relative aspect-[21/9] sm:aspect-[21/8] bg-black overflow-hidden shrink-0">
              <img
                src={activeCaseStudy.coverImage}
                alt={activeCaseStudy.title}
                className="w-full h-full object-cover filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/30" />

              {/* Close Button */}
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-sm font-bold border border-white/20 transition-all cursor-pointer z-20"
                title="بستن"
              >
                ✕
              </button>

              {/* Badges on Hero */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs shadow-md">
                  {activeCaseStudy.badge}
                </span>
                {activeCaseStudy.videoDuration && (
                  <span className="px-3 py-1 rounded-full bg-black/70 text-white font-mono text-xs border border-white/20">
                    🎬 {activeCaseStudy.videoDuration}
                  </span>
                )}
              </div>

              {/* Hero Title and Metadata */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 z-10 text-white">
                <span className="text-xs font-mono text-amber-400 font-bold block mb-1">
                  {activeCaseStudy.trackCode} • {activeCaseStudy.year}
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  {activeCaseStudy.title}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
                  {activeCaseStudy.subtitle}
                </p>
              </div>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
              {/* Strategic Challenge & Creative Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                    <span>⚡</span>
                    <span>چالش استراتژیک کارفرما (Challenge)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    {activeCaseStudy.challenge}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <span>✦</span>
                    <span>رویکرد خلاقانه استودیو (Creative Solution)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                    {activeCaseStudy.solution}
                  </p>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 mb-3 flex items-center gap-1.5">
                  <span className="text-amber-500">✓</span>
                  <span>اقدامات و تحویل‌دادنی‌های کلیدی پروژه (Key Deliverables)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeCaseStudy.deliverables.map((deliv, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-800 flex items-center gap-2 shadow-2xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Gallery Preview */}
              {activeCaseStudy.galleryImages.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 mb-3 flex items-center gap-1.5">
                    <span className="text-amber-500">📸</span>
                    <span>گالری فریم‌های سینمایی و هویت بصری پروژه</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeCaseStudy.galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">
                    RESULTS & BUSINESS IMPACT
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {activeCaseStudy.metrics}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-300">کلاینت:</span>
                  <span className="text-xs font-bold text-amber-300">{activeCaseStudy.client}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                {activeCaseStudy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCaseStudy(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-200 cursor-pointer transition-colors"
                >
                  بستن
                </button>
                <button
                  onClick={() => {
                    const title = activeCaseStudy.title;
                    setActiveCaseStudy(null);
                    onOpenBriefWithProject && onOpenBriefWithProject(`پرونده الهام‌بخش: ${title}`);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>✦ شروع همکاری بر پایه این پروژه</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioGallery;
