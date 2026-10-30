/**
 * Creativity Juice — Studio & Modern Creative Portfolio
 * Contemporary Brand Architecture, Cinema & Creative OS
 */
import * as React from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { motion as ku, AnimatePresence as kc, useDragControls as Du } from 'motion/react';
import ContentCalendarWindow from './ContentCalendarWindow.tsx';
import ClientPortalWindow from './ClientPortalWindow.tsx';
import PortfolioGallery from './PortfolioGallery.tsx';
import NotesWindow from './NotesWindow.tsx';
import TrashBinWindow from './TrashBinWindow.tsx';
import AdminPanel from './AdminPanel.tsx';
import {
  isAdminAuthenticated,
  setAdminAuthenticated,
  verifyAdminPin,
  CJ_STUDIO_DATA_EVENT,
  getServices,
  getTeamMembers,
  getManifestoItems,
  getProjects,
  saveProject,
  deleteProject,
  saveProjects,
} from './adminStore.ts';
import { INITIAL_PROJECTS } from './data/projectsData.ts';
import { INITIAL_TEAM } from './data/teamData.ts';
import { addToTrash } from './trashStore.ts';
import {
  getActiveClient,
  setActiveClientId,
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore.ts';

const S = React;
const H = { jsx, jsxs, Fragment };

var Au = [
    {
      id: `folder-track-1`,
      name: `معماری و هویت برند`,
      nameEn: `Brand Identity & Strategy`,
      trackCode: `TRACK 01 // BRAND DNA`,
      deptId: 1,
      itemCount: 3,
      iconType: `brand`,
      badge: `۳ سند تخصصی`,
      desktopPos: { top: 15, left: 8.5, mobileTop: 12, mobileLeft: 20 },
      description: `اسناد استراتژی دی‌ان‌ای، دیزاین سیستم بصری و کتابچه جامع هویت و پکیجینگ`,
    },
    {
      id: `folder-track-2`,
      name: `تولید محتوا`,
      nameEn: `Content Production & Visuals`,
      trackCode: `TRACK 02 // VISUALS`,
      deptId: 2,
      itemCount: 3,
      iconType: `cinema`,
      badge: `۳ سند تخصصی`,
      desktopPos: { top: 38, left: 8.5, mobileTop: 24, mobileLeft: 20 },
      description: `سناریو و کارگردانی فیلم‌های تبلیغاتی مد، آرت‌دایرکشن موزیک‌ویدئو و تولید محتوای پرمیوم`,
    },
    {
      id: `folder-manifesto`,
      name: `اسناد تیم`,
      nameEn: `Team & Studio Dossier`,
      trackCode: `STUDIO // CORE DOSSIER`,
      deptId: 0,
      itemCount: 9,
      iconType: `manifesto`,
      badge: `مانیفست + ۶ عضو تیم`,
      desktopPos: { top: 15, left: 21, mobileTop: 12, mobileLeft: 56 },
      description: `۳ اصل ضد کلیشه، فلسفه استودیو و پروفایل ۶ عضو ارشد تیم`,
    },
    {
      id: `folder-projects`,
      name: `پرونده پروژه‌ها`,
      nameEn: `Works & Case Studies`,
      trackCode: `PORTFOLIO // CASE ARCHIVE`,
      deptId: 4,
      itemCount: 8,
      iconType: `cases`,
      badge: `آرشیو پروژه‌ها`,
      desktopPos: { top: 38, left: 21, mobileTop: 24, mobileLeft: 56 },
      description: `مطالعه و کالبدشکافی کامل پروژه‌ها، هویت برند و تولیدات سینمایی استودیو`,
    },
    {
      id: `folder-client-portal`,
      name: `پورتال کارفرما`,
      nameEn: `Client Portal & Workspace`,
      trackCode: `CLIENT // SECURE WORKSPACE`,
      deptId: 5,
      itemCount: 10,
      iconType: `client`,
      badge: `ورود و فضای کارفرما`,
      desktopPos: { top: 61, left: 8.5, mobileTop: 36, mobileLeft: 20 },
      description: `ورود کارفرمایان به فضای اختصاصی، تاییدیه فایل‌ها، پیشرفت پروژه و تقویم اختصاصی`,
    },
  ],
  ju = [
    {
      id: `srv-01`,
      code: `SRV-01 // BRAND DNA`,
      deptId: 1,
      deptName: `معماری و هویت برند`,
      deptTrack: `TRACK 01 // BRAND IDENTITY`,
      badge: `پروژه‌محور • فونداسیون برند`,
      title: `استراتژی و دی‌ان‌ای برند`,
      titleEn: `Brand Strategy & DNA`,
      fileName: `SRV-01_استراتژی_و_دی‌ان‌ای_برند.pdf`,
      fileSize: `24.8 MB`,
      fileExt: `PDF`,
      description: `کالبدشکافی جایگاه برند و رقبای کسل‌کننده در بازار؛ تعیین استعاره محوری، داستان سرآغاز، بیانیه مانیفست و تدوین زبان لحن (Tone of Voice). این خدمت به برند شما روحی مستقل و جهت‌گیری غیرقابل تقلید می‌بخشد.`,
      deliverables: [
        `سند مانیفست و ایده محوری برند`,
        `نقشه جایگاه‌سازی و تحلیل عمقی رقبا`,
        `راهنمای زبان لحن و کلمات کلیدی ممنوعه و مجاز`,
        `گزاره ارزش پیشنهادی منحصربه‌فرد (UVP)`,
      ],
      suitableFor: `استارتاپ‌ها، پروژه‌های نوآور و برندهای در آستانه جهش و ری‌برندینگ`,
      timeline: `۳ تا ۴ هفته`,
      engagementType: `sprint`,
      popular: !0,
    },
    {
      id: `srv-02`,
      code: `SRV-02 // VISUAL IDENTITY`,
      deptId: 1,
      deptName: `معماری و هویت برند`,
      deptTrack: `TRACK 01 // BRAND IDENTITY`,
      badge: `طراحی سیستم جامع`,
      title: `سیستم هویت بصری کامل`,
      titleEn: `Visual Identity System`,
      fileName: `SRV-02_سیستم_هویت_بصری_جامع.ai`,
      fileSize: `185.2 MB`,
      fileExt: `AI`,
      description: `طراحی لوگوتایپ، نماد مونوکروم، مهندسی تایپوگرافی اختصاصی، پالت رنگی هماهنگ با متریال و سیستم گریدبندی ادیتوریال. یک دیزاین پایدار بدون وابستگی به ترندهای زودگذر چندماهه.`,
      deliverables: [
        `لوگوتایپ و نشان تجاری اختصاصی برداری`,
        `معماری تایپوگرافی چندلایه و فونت‌های سفارشی`,
        `پالت رنگی فنی مهندسی‌شده (Pantone, CMYK, HEX)`,
        `سیستم گریدبندی و الگوهای ساختار سازمانی`,
      ],
      suitableFor: `خانه‌های مد، استودیوهای معماری، هلدینگ‌ها و برندهای پرمیوم`,
      timeline: `۴ تا ۶ هفته`,
      engagementType: `sprint`,
      popular: !0,
    },
    {
      id: `srv-03`,
      code: `SRV-03 // MASTER BRAND BOOK`,
      deptId: 1,
      deptName: `معماری و هویت برند`,
      deptTrack: `TRACK 01 // BRAND IDENTITY`,
      badge: `تدوین سند مرجع`,
      title: `کتابچه راهنمای جامع برند و بسته‌بندی`,
      titleEn: `The Master Brand Book & Packaging`,
      fileName: `SRV-03_کتابچه_راهنمای_برند_و_پکیجینگ.ind`,
      fileSize: `320.0 MB`,
      fileExt: `IND`,
      description: `تدوین یک کتابچه با وقار (چاپی و دیجیتال) حاوی تمام قوانین و استانداردهای طراحی، پترن‌ها، ملزومات چاپی اداری، هویت فضایی و راهنمای جامع جعبه‌گشایی (Unboxing).`,
      deliverables: [
        `دفترچه گایدلاین هویت (بیش از ۱۲۰ صفحه مستندات فنی)`,
        `طراحی سیستم بسته‌بندی، ساک‌دستی و متریال لوکس`,
        `بسته کامل ست اداری و فرمت‌های اجرایی شبکه‌های اجتماعی`,
        `فایل‌های فونت و پکیج قالب‌های نرم‌افزاری آماده به کار`,
      ],
      suitableFor: `سازمان‌های در حال توسعه با چندین تیم دیزاین و مارکتینگ موازی`,
      timeline: `۳ هفته (پس از تصویب هویت بصری)`,
      engagementType: `sprint`,
    },
    {
      id: `srv-04`,
      code: `SRV-04 // COMMERCIAL FILM`,
      deptId: 2,
      deptName: `سینما، مد و محتوای شاخص`,
      deptTrack: `TRACK 02 // CINEMA & VISUALS`,
      badge: `پروداکشن سطح‌بالا`,
      title: `کارگردانی فیلم‌های تبلیغاتی و مد`,
      titleEn: `Commercial & Fashion Films`,
      fileName: `SRV-04_فیلم_تبلیغاتی_و_فشن_4K.mov`,
      fileSize: `4.8 GB`,
      fileExt: `MOV`,
      description: `سناریونویسی، استوری‌بورد، کستینگ بازیگر و مدل، انتخاب لوکیشن و کارگردانی فیلم‌های کوتاه با بالاترین استانداردهای بصری و روایتی سینمایی برای لانچ شاخص محصولات و خدمات.`,
      deliverables: [
        `سناریو و شات‌لیست تخصصی سینمایی`,
        `کارگردانی کامل در روز فیلم‌برداری با تجهیزات سینمایی`,
        `اصلاح رنگ سینمایی (Color Grading) متناسب با لحن برند`,
        `طراحی صدا، افکت‌ها و موسیقی متن اختصاصی`,
      ],
      suitableFor: `برندهای فشن، ساعت و جواهرات، املاک لوکس و پروژه‌های شاخص`,
      timeline: `۳ تا ۵ هفته`,
      engagementType: `sprint`,
      popular: !0,
    },
    {
      id: `srv-05`,
      code: `SRV-05 // MUSIC ERA`,
      deptId: 2,
      deptName: `سینما، مد و محتوای شاخص`,
      deptTrack: `TRACK 02 // CINEMA & VISUALS`,
      badge: `ویژه هنرمندان و موزیک`,
      title: `کارگردانی بصری آلبوم و موزیک‌ویدئو`,
      titleEn: `Music Era & World-Building`,
      fileName: `SRV-05_کانسپت_بصری_آلبوم_و_موزیک_ویدیو.key`,
      fileSize: `840.0 MB`,
      fileExt: `KEY`,
      description: `طراحی دوران هنری (Era)، کانسپت بصری آلبوم موسیقی، عکاسی کاور، آرت‌دایرکشن صحنه و کارگردانی موزیک‌ویدئوهای سینمایی با نگاهی پیشرو و متناسب با هویت مستقل آرتیست.`,
      deliverables: [
        `طراحی کانسپت بصری و نمادشناسی آلبوم`,
        `سناریو و کارگردانی موزیک‌ویدئو با کیفیت 4K`,
        `عکاسی کاور، پوستر و هویت متریال تور کنسرت`,
        `هدایت تیزرها و کپسول‌های لانچ قطعات در شبکه‌های اجتماعی`,
      ],
      suitableFor: `خوانندگان، آهنگسازان مؤلف، نوازندگان مستقل و لیبل‌ها`,
      timeline: `پروژه‌محور (Sprint)`,
      engagementType: `sprint`,
    },
    {
      id: `srv-06`,
      code: `SRV-06 // MONTHLY RETAINER`,
      deptId: 2,
      deptName: `سینما، مد و محتوای شاخص`,
      deptTrack: `TRACK 02 // CINEMA & VISUALS`,
      badge: `همکاری مستمر ماهانه`,
      title: `ریتینر ماهانه تولید محتوای سینمایی`,
      titleEn: `Monthly Content Retainer`,
      fileName: `SRV-06_قرارداد_ریتینر_ماهانه_تولید_محتوا.doc`,
      fileSize: `14.2 MB`,
      fileExt: `DOC`,
      description: `همکاری ثابت ماهانه شامل ۲ جلسه تصویربرداری کامل با تجهیزات استاندارد، تولید ۱۰ ویدیوی آماده با تدوین حرفه‌ای، هدایت خط استوری‌های پیوسته و نظارت ادیتوریال بر انتشار پیج.`,
      deliverables: [
        `۱۰ ویدیوی سینمایی آماده (Reels / 4K) در ماه`,
        `۲ جلسه فیلم‌برداری میدانی کامل با تجهیزات نور و تصویر`,
        `سناریونویسی، هوک اولیه و کال‌تواکشن هدفمند`,
        `هدایت تقویم محتوایی و چیدمان استوری‌های روزانه`,
      ],
      suitableFor: `کلینیک‌های تخصصی، املاک پرمیوم و کسب‌وکارهای در حال توسعه`,
      timeline: `دوره قرارداد: حداقل ۳ ماهه`,
      engagementType: `retainer`,
      popular: !0,
    },
    {
      id: `srv-07`,
      code: `SRV-07 // PRODUCT DROP`,
      deptId: 3,
      deptName: `مارکتینگ فرهنگی و کمپین‌ها`,
      deptTrack: `TRACK 03 // CAMPAIGNS & ACTIVATIONS`,
      badge: `مدل دراپ و ایجاد تقاضا`,
      title: `استراتژی رونمایی و دراپ محصول`,
      titleEn: `Product Drop & Capsule Launch`,
      fileName: `SRV-07_استراتژی_دراپ_و_لانچ_کپسولی.pdf`,
      fileSize: `38.5 MB`,
      fileExt: `PDF`,
      description: `طراحی کمپین‌های عرضه محدود (Limited Drop) با الهام از متد برندهای پیشرو؛ ایجاد کشش فرهنگی و تقاضای ارگانیک در مخاطب پیش از باز شدن درگاه فروش محصول.`,
      deliverables: [
        `استراتژی فازبندی تیزینگ، لانچ و سولد-اوت`,
        `طراحی ته‌مایه بصری کپسول‌کالکشن و گرافیک تبلیغاتی`,
        `نگارش متون بیانیه‌ها، کپشن‌های محرک و ایمیل‌ها`,
        `آرت‌دایرکشن لندینگ‌پیج خرید اختصاصی`,
      ],
      suitableFor: `کالکشن‌های محدود لباس، عطر، اکسسوری یا خدمات VIP`,
      timeline: `۴ هفته`,
      engagementType: `sprint`,
    },
    {
      id: `srv-08`,
      code: `SRV-08 // COLLABS`,
      deptId: 3,
      deptName: `مارکتینگ فرهنگی و کمپین‌ها`,
      deptTrack: `TRACK 03 // CAMPAIGNS & ACTIVATIONS`,
      badge: `اعتبار فرهنگی و پیوند هنری`,
      title: `همکاری‌های مشترک بین‌رشته‌ای`,
      titleEn: `Cultural Collaborations & Collabs`,
      fileName: `SRV-08_پروتکل_همکاری_بین_رشته_ای.pdf`,
      fileSize: `16.4 MB`,
      fileExt: `PDF`,
      description: `پل زدن میان محصول تجاری شما و جامعه‌ی هنری مستقل؛ شناسایی آرتیست‌ها و طراحان مکمل برای خلق پروژه‌های مشترک که به برند شما اعتبار اصیل و پایدار تزریق می‌کند.`,
      deliverables: [
        `انتخاب و مذاکره با همکاران هم‌فرکانس و معتبر`,
        `طراحی کانسپت محصول یا اثر تجربی مشترک`,
        `آرت‌دایرکشن مستندسازی فرآیند ساخت و پشت صحنه`,
        `هدایت کمپین مشترک در رسانه‌ها و ایونت‌ها`,
      ],
      suitableFor: `برندهایی که می‌خواهند فراتر از تبلیغات به بخشی از فرهنگ تبدیل شوند`,
      timeline: `پروژه‌محور (Sprint)`,
      engagementType: `sprint`,
    },
    {
      id: `srv-09`,
      code: `SRV-09 // SPRINT DIAGNOSTIC`,
      deptId: 4,
      deptName: `مشاوره ارشد و کنسلیری`,
      deptTrack: `TRACK 04 // STRATEGIC COUNSEL`,
      badge: `تک‌جلسه فشرده • عارضه‌یابی`,
      title: `جلسه فشرده عارضه‌یابی برند`,
      titleEn: `Brand Diagnostic Sprint`,
      fileName: `SRV-09_گزارش_عارضه_یابی_۹۰_دقیقه_ای.pdf`,
      fileSize: `8.2 MB`,
      fileExt: `PDF`,
      description: `یک نشست استراتژیک ۹۰ دقیقه‌ایِ بی‌تعارف برای کالبدشکافی وضعیت فعلی برند، شناسایی گلوگاه‌های هویتی، حذف تصمیمات اشتباه و ارائه نقشه راه عملیاتی برای رشد برند.`,
      deliverables: [
        `جلسه حضوری یا آنلاین تحلیلی (۹۰ دقیقه با سرپرست خلاقیت)`,
        `گزارش مکتوب آسیب‌شناسی برند (Dossier عارضه‌یابی)`,
        `فهرست خطوط قرمز و توصیه‌های اضطراری اصلاح مسیر`,
        `نقشه راه پیشنهادی اولویت‌بندی‌شده برای ۳ ماه آینده`,
      ],
      suitableFor: `بنیان‌گذاران و مدیرانی که در تصمیمات هویتی و پرستیژ برند مردد هستند`,
      timeline: `تک‌جلسه + گزارش تحلیلی ظرف ۴۸ ساعت`,
      engagementType: `advisory`,
      popular: !0,
    },
    {
      id: `srv-10`,
      code: `SRV-10 // FRACTIONAL CD`,
      deptId: 4,
      deptName: `مشاوره ارشد و کنسلیری`,
      deptTrack: `TRACK 04 // STRATEGIC COUNSEL`,
      badge: `همراهی در اتاق فرمان`,
      title: `مدیر ارشد خلاقیت فصلی`,
      titleEn: `Fractional Creative Director`,
      fileName: `SRV-10_منشور_همراهی_مدیر_ارشد_خلاقیت.doc`,
      fileSize: `19.6 MB`,
      fileExt: `DOC`,
      description: `حضور مستقیم ما به عنوان کنسلیری و مشاور ارشد هنری در کنار هیئت‌مدیره شما بدون تحمیل هزینه‌های سنگین استخدام دائم؛ نظارت عالیه بر تمام خروجی‌های طراحان، آژانس‌ها و تیم مارکتینگ.`,
      deliverables: [
        `جلسات هفتگی هدایت خلاقیت و تدوین استراتژی بصری`,
        `کنترل کیفیت و تأیید نهایی خروجی‌های تصویری و ویدیویی`,
        `هدایت بریف‌ها و فیلتر کردن پیمانکاران متفرقه`,
        `پاسداری از شأن، پرستیژ و خطوط قرمز برند در بازار`,
      ],
      suitableFor: `هلدینگ‌ها و مجموعه‌هایی که مجری دارند اما سکاندار خلاقیت ندارند`,
      timeline: `دوره همکاری: فصلی، ۶ ماهه و سالانه`,
      engagementType: `advisory`,
    },
  ],
  Mu = [
    {
      code: `01`,
      title: `تقطیر زوائد و بازگشت به جوهره`,
      titleEn: `Distillation Over Accumulation`,
      description: `ما معتقدیم اضافه کردن المان‌های شلوغ، راهکار هویت نیست. هنر واقعی در حذف تمام اضافات و دستیابی به خالص‌ترین بیان هویتی است که هر مخاطبی با یک نگاه آن را به خاطر بسپارد.`,
      quote: `«برندی که تلاش کند همه مخاطبان را راضی نگه دارد، در نهایت هیچ‌کس را عمیقاً تحت تأثیر قرار نمی‌دهد. تمایز واقعی نیازمند شهامتِ حذف زوائد است.»`,
      author: `فریدون یوسف زاده — مدیر هنری و ایده پرداز`,
    },
    {
      code: `02`,
      title: `ادغام کیفیت هنری با کارآمدی تجاری`,
      titleEn: `Artistic Mastery Meets Commercial Efficiency`,
      description: `زیبایی‌شناسی بدون هدف تجاری، هنر محض است و بازاریابی بدون سلیقه، آلودگی بصری. استودیوی ما نقطه تلاقی وقار زیبایی‌شناختی و اثربخشی مالی در بازار است.`,
      quote: `«سیستم بصری موفق شبیه یک معماری بی‌نقص است؛ هیچ جزئی در آن تزئینی و بی‌هدف نیست و هر خط، وزنی در تعادل کل دارد.»`,
      author: `علیرضا شیعه زاده — طراح UI/UX و مشاور هنری`,
    },
    {
      code: `03`,
      title: `مسئولیت عالیه و نظارت یکدست`,
      titleEn: `Singular Authorship & Senior Ownership`,
      description: `پروژه‌ها هرگز به دست کارآموزان یا زنجیره‌های پیمانکاری ناشناس سپرده نمی‌شوند. تک‌تک خروجی‌ها تحت هدایت مستقیم اعضای ارشد استودیو مهندسی و نظارت می‌شوند.`,
      quote: `«دوربین وسیله ثبت نیست؛ قلم‌موی انتقال حس است. هر فریم باید راوی شخصیتی باشد که کلمات نمی‌توانند بیان کنند.»`,
      author: `اسماعیل سامانی پور — کارگردان و تصویربردار`,
    },
  ],
  Nu = [
    {
      id: `model-sprint`,
      modelCode: `MODEL 01 // SPRINT`,
      name: `همکاری پروژه‌محور (Sprint)`,
      nameEn: `Focused Sprint Engagements`,
      description: `مناسب برای اهداف معین با تحویل‌دادنی‌های شفاف و محدوده مشخص؛ مانند تدوین استراتژی هویت، طراحی سیستم بصری، یا کارگردانی یک فیلم تجاری شاخص.`,
      timeline: `زمان‌بندی متمرکز (۳ تا ۶ هفته)`,
      features: [
        `محدوده خروجی (Scope) مشخص و فازبندی‌شده`,
        `بدون تعهد زمانی طولانی و هزینه‌های مازاد اداری`,
        `مایل‌استون‌های بازبینی منظم در پایان هر هفته`,
      ],
    },
    {
      id: `model-retainer`,
      modelCode: `MODEL 02 // RETAINER`,
      name: `ریتینر ماهانه تولید محتوا (Monthly)`,
      nameEn: `Ongoing Production Retainer`,
      description: `برای تولید مستمر دارایی‌های تصویری و سینمایی، هدایت هفتگی رسانه‌ها، سناریوها، جلسات فیلمبرداری ماهیانه و هدایت پیوسته حضور دیجیتال برند.`,
      timeline: `حداقل دوره همکاری: ۳ ماهه`,
      features: [
        `تخصیص ظرفیت فیلمبرداری اختصاصی در هر ماه`,
        `۱۰ خروجی ویدیوی سینمایی آماده انتشار در ماه`,
        `نظارت مستمر ادیتوریال بر پیج و استوری‌ها`,
      ],
    },
    {
      id: `model-counsel`,
      modelCode: `MODEL 03 // COUNSEL`,
      name: `کنسلیری و مشاوره ارشد (Fractional CD)`,
      nameEn: `Executive Advisory & Governance`,
      description: `حضور در اتاق فکر و جلسات تصمیم‌گیری کلان برند به عنوان مشاور ارشد هنری و سکاندار کیفیت بصری در کنار هیئت‌مدیره.`,
      timeline: `همکاری فصلی، ۶ ماهه و سالانه`,
      features: [
        `هدایت استراتژیک خلاقیت و تایید خروجی‌ها`,
        `حفاظت از پرستیژ و خطوط قرمز هویت در بازار`,
        `فیلتر کردن پیمانکاران متفرقه و اصلاح فرآیندها`,
      ],
    },
  ],
  Pu = INITIAL_TEAM,
  Fu = {
    title: `گروه مشاوره سرمایه‌گذاری ملکی یوسف‌زاده`,
    titleEn: `Yousefzadeh Real Estate Investment Group // Flagship Campaign`,
    client: `گروه سرمایه‌گذاری یوسف‌زاده`,
    timeline: `۸ هفته اسپرینت هویت و کمپین فروش`,
    scope: `طراحی هویت برند، سیستم بصری، تولید محتوای سینمایی و کمپین‌های جامع فروش`,
    initialBottlenecks: [
      `حاکمیت روش‌های سنتی و غیرشفاف در بازاریابی ملکی و افت ارزش ادراک‌شده پروژه‌های سرمایه‌گذاری`,
      `فقدان دیزاین سیستم لوکس و مونوگراف پرزنت اختصاصی برای سرمایه‌گذاران تراز اول`,
      `نیاز به محتوای ویدیویی سینمایی با دوربین‌های حرفه‌ای برای ایجاد تمایز مطلق در بازار`,
    ],
    studioInterventions: [
      `تدوین استراتژی تمایز و مانیفست «سرمایه‌گذاری مطمئن، آینده‌نگر و ممتاز»`,
      `طراحی کامل سیستم هویت بصری، لوگوتایپ لوکس و کتابچه جامع راهنمای برند`,
      `تولید محتوای مستند سینمایی، تصویربرداری معماری و سناریونویسی ویدیوهای تحلیلی املاک`,
      `راه‌اندازی فانل کمپین‌های تبلیغاتی چندمرحله‌ای برای جذب سرمایه‌گذاران رده‌بالا`,
    ],
    tangibleResults: [
      `+۳۱۰٪ رشد در جذب سرمایه‌گذاران رده‌بالا و ثبت رکورد فروش در فاز نخست کمپین`,
      `ایجاد پرستیژ منحصربه‌فرد برای گروه یوسف‌زاده در میان فعالان سرمایه‌گذاری ملکی`,
      `افزایش چشمگیر تعاملات هدفمند در شبکه‌های اجتماعی و رشد نرخ تبدیل لیدهای فروش`,
    ],
    quote: `«خلاقیت و تعهد تیم به ما کمک کرد تا فراتر از یک مشاوره املاک سنتی، به عنوان یک مرجع قابل اعتماد و پیشرو در سرمایه‌گذاری ملکی در ذهن مخاطبان ثبت شویم.» — گروه سرمایه‌گذاری یوسف‌زاده`,
  },
  Iu = INITIAL_PROJECTS,
  Lu = [
    {
      id: `notes`,
      name: `یادداشت‌ها و ایده‌ها`,
      tooltip: `دفترچه یادداشت و ثبت ایده‌ها و طوفان فکری کارفرما`,
      isNotes: true,
    },
    {
      id: `gallery`,
      name: `پرونده‌های پروژه‌ها`,
      icon: `https://framerusercontent.com/images/yNLcekVy7df0d4hAoz6dZR8s.png`,
      tooltip: `آرشیو و تدوین پرونده‌های واقعی استودیو`,
    },
    {
      id: `calendar`,
      name: `تقویم محتوا`,
      tooltip: `تقویم محتوایی و برنامه‌ریزی سوشال مدیا`,
      isCalendar: true,
    },
    {
      id: `client-portal`,
      name: `پورتال و پرسونال برند`,
      tooltip: `ورود به فضای کار، مدیریت سوشال مدیا و ساخت پرسونال برند جدید`,
      isClientPortal: true,
    },
    {
      id: `diagnostic`,
      name: `عارضه‌یابی`,
      icon: `https://framerusercontent.com/images/BSPnJPSH4K1WxhDJJbEfUgT7U.png`,
      tooltip: `هشدار اضطراری و دیالوگ کلاینت`,
      dialogData: {
        appTitle: `هشدار سیستم • عارضه‌یابی بریف کلاینت`,
        message: `پیام دریافت شد: «میشه لوگو رو ۵۰۰ درصد بزرگ‌تر کنین، کاملاً شرکتی و جدی باشه ولی هم‌زمان هنجارشکن و نوآورانه، و بدون تحقیق و پروداکشن مناسب هم فردا صبح میلیونی بازدید بگیریم؟» استودیو Creativity Juice برای پاسداری از کیفیت، این درخواست را مسدود کرد!`,
        buttonText: `یک لیوان جوس خنک بنوشید و بریف درست بنویسید`,
        icon: `https://framerusercontent.com/images/BSPnJPSH4K1WxhDJJbEfUgT7U.png`,
      },
    },
    {
      id: `brief`,
      name: `تدوین بریف`,
      icon: `https://framerusercontent.com/images/4ZZQ6ZFOyrBZ3TXhVZjMFK7zbGk.png`,
      tooltip: `سامانه بریف و ثبت پروژه`,
    },
    {
      id: `admin`,
      name: `داشبورد مدیریت`,
      tooltip: `ورود به داشبورد مدیریتی استودیو (CMS)`,
      isAdmin: true,
    },
    {
      id: `instagram`,
      name: `اینستاگرام`,
      icon: `https://framerusercontent.com/images/fZcO2HO3MMDvuS9IcWLgq5MyMc.png`,
      tooltip: `اینستاگرام استودیو (@creativityjuice)`,
      isExternal: !0,
      externalUrl: `https://www.instagram.com/`,
    },
    {
      id: `bin`,
      name: `سطل زباله`,
      icon: `https://framerusercontent.com/images/Hfn1FB5V1VnB099tUlAIyjV1tC4.png`,
      tooltip: `سطل زباله و اقلام نگهداری‌شده تا حذف نهایی کاربر`,
    },
  ],
  Ru = [
    {
      title: `make_the_logo_500percent_bigger.ai`,
      size: `۸۴.۲ مگابایت`,
      date: `دیروز، ساعت ۲۳:۴۰`,
      note: `«میشه لوگو کل صفحه رو بگیره تا هیچ‌کس از دستش نده؟» (دفن شده در این سطل).`,
    },
    {
      title: `viral_without_strategy_proposal.pptx`,
      size: `۱۲.۴ مگابایت`,
      date: `۳ روز پیش`,
      note: `«ما زمان برای تحقیق و استراتژی نداریم ولی تا جمعه ۵۰ میلیون ایمپرشن می‌خوایم!»`,
    },
    {
      title: `comic_sans_pitch_deck.pdf`,
      size: `۱۰۸.۸ مگابایت`,
      date: `هفته گذشته`,
      note: `پرزنتیشن مدیر سنتی که اصرار داشت برای قرارداد B2B از فونت فانتزی استفاده کنه.`,
    },
    {
      title: `boring_corporate_blue_palette.ase`,
      size: `۱.۲ کیلوبایت`,
      date: `۲ هفته پیش`,
      note: `طیف‌های خواب‌آور و کلیشه‌ای آبی شرکتی که جای خود را به طراوت Creativity Juice دادند.`,
    },
    {
      title: `can_we_make_it_pop_more.txt`,
      size: `۳ کیلوبایت`,
      date: `۳ هفته پیش`,
      note: `جمله جاودانه‌ای که تمام کلاینت‌های سردرگم قبل از دیدن استراتژی اصیل می‌گویند.`,
    },
  ],
  zu = [
    {
      id: `creativity-juice-live`,
      name: `موشن و آرت‌ورک اختصاصی Creativity Juice (والپیپر اصلی استودیو)`,
      url: `live-motion`,
    },
    {
      id: `studio-atelier`,
      name: `آتلیه دیزاین و معماری معاصر (تم روشن)`,
      url: `https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=85`,
    },
    {
      id: `minimal-noir`,
      name: `مونوکروم بتنی و تاریک استودیو`,
      url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2400&q=80`,
    },
  ],
  Bu = {
    name: `Creativity Juice`,
    tagline: `استودیو و پرتال خلاقیت، مهندسی هویت برند و سینمای تجاری`,
    email: `hello@creativityjuice.com`,
    instagram: `@creativityjuice`,
    bio: `ما ایده‌های پیچیده و هویت‌های چندبعدی را با تفکر عمیق ادیتوریال و گرادیان پویای خلاقیت به خروجی‌های ناب و ماندگار تبدیل می‌کنیم؛ جایی که دیزاین از مد نمی‌افتد و کیفیت نیاز به فریاد زدن ندارد.`,
    services: [
      {
        title: `معماری و هویت بنیادین برند (Brand DNA)`,
        desc: `استراتژی موقعیت‌یابی، تدوین مانیفست، طراحی لوگوتایپ و زبان لحن اختصاصی`,
      },
      {
        title: `سینما، مد و محتوای شاخص (Films & Visuals)`,
        desc: `کارگردانی فیلم‌های تجاری 4K، عکاسی ادیتوریال مد و آرت‌دایرکشن صحنه`,
      },
      {
        title: `استراتژی دراپ و رونمایی کپسولی (Drops & Launch)`,
        desc: `ایجاد تقاضای فرهنگی و فروش سریع برای کالکشن‌ها و محصولات پرمیوم`,
      },
      {
        title: `مدیر ارشد خلاقیت فصلی (Fractional CD)`,
        desc: `همراهی در اتاق فرمان هیئت‌مدیره و نظارت عالیه بر تمام خروجی‌های خلاقانه`,
      },
      {
        title: `ریتینر ماهانه تولید محتوا (Monthly Retainer)`,
        desc: `تخصیص اختصاصی روزهای تولید، ۱۰ ویدیوی سینمایی آماده در ماه و هدایت استوری‌ها`,
      },
      {
        title: `کتابچه جامع و مهندسی بسته‌بندی (Master Brand Book)`,
        desc: `مستندات گایدلاین با بیش از ۱۲۰ صفحه، قالب‌های شیشه‌ای و جعبه‌گشایی VIP`,
      },
    ],
    stats: [
      { value: `+۲۸۰٪`, label: `میانگین رشد قراردادهای کلاینت‌ها` },
      { value: `۱۰`, label: `خدمت تخصصی در ۴ تِرَک مهندسی‌شده` },
      { value: `۱۲`, label: `سال سابقه هدایت خلاقیت و برندسازی` },
      { value: `۱۰۰٪`, label: `نظارت مستقیم اعضای ارشد استودیو` },
    ],
    capabilities: [
      `تدوین دی‌ان‌ای و مانیفست برند`,
      `طراحی سیستم‌های جامع هویت بصری`,
      `کارگردانی فیلم‌های تبلیغاتی و فشن`,
      `مهندسی پکیجینگ و جعبه‌گشایی لوکس`,
      `استراتژی کمپین‌های دراپ محدود (Limited Drop)`,
      `پرفورمنس مارکتینگ و بهینه‌سازی نرخ تبدیل`,
      `مشاوره استراتژیک هیئت‌مدیره (Fractional CD)`,
      `طراحی تجارب دیجیتال و وب‌سایت‌های خاص`,
    ],
    timeline: [
      {
        agency: `استودیو Creativity Juice`,
        role: `پرتال خلاقیت و هویت معاصر`,
        period: `۱۴۰۱ — اکنون`,
        details: `تمرکز بر معماری هویت، سینمای تجاری و پارتنرشیپ اختصاصی با برندهای پیشرو و مستقل`,
      },
      {
        agency: `همکاری‌های شاخص بین‌المللی`,
        role: `آرت‌دایرکشن و ری‌برندینگ`,
        period: `۱۳۹۷ — ۱۴۰۱`,
        details: `هدایت پروژه‌های فشن، معماری معاصر، ساعت و جواهرات و کالکشن‌های محدود در پاریس، میلان و دبی`,
      },
      {
        agency: `آزمایشگاه فرم و تایپوگرافی`,
        role: `پژوهش و خلق دیزاین سیستم`,
        period: `۱۳۹۲ — ۱۳۹۷`,
        details: `توسعه فونت‌های اختصاصی و نظام‌های گریدبندی سوئیسی برای نشریات معتبر و استودیوهای دیزاین`,
      },
    ],
    clients: [
      `آتلیه معماری آرکا`,
      `نوشیدنی ارگانیک نکتار`,
      `کالکشن استریت‌ویر اپکس`,
      `پلتفرم لومینا`,
      `عطر ولوت اند راست`,
      `آکوستیک پالس`,
      `سولاریس انرژی`,
      `فصلنامه مونو ژورنال`,
      `باشگاه فرهنگی کاویار`,
      `فین‌تک کریپتون پی`,
      `مراقبت پوست بوتانیکا`,
    ],
    behindTheScenes: [
      {
        id: `bts-1`,
        title: `جلسه تصحیح رنگ سینمایی فیلم آرکا`,
        url: `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80`,
      },
      {
        id: `bts-2`,
        title: `تست نمونه‌های فویل مس و کتان پکیجینگ`,
        url: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80`,
      },
      {
        id: `bts-3`,
        title: `استوری‌بوردینگ کمپین دراپ نکتار`,
        url: `https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80`,
      },
      {
        id: `bts-4`,
        title: `کستینگ مدل‌ها و لوکیشن پروژه اپکس`,
        url: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80`,
      },
      {
        id: `bts-5`,
        title: `وایت‌بورد استراتژی و مانیفست بنیادین`,
        url: `https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80`,
      },
      {
        id: `bts-6`,
        title: `بررسی چاپ افست ژورنال با لوپ صنعتی`,
        url: `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80`,
      },
    ],
  },
  W = new (class {
    constructor() {
      ((this.ctx = null), (this.enabled = !0));
    }
    initContext() {
      if (!this.ctx && typeof window < `u`) {
        let e = window.AudioContext || window.webkitAudioContext;
        e && (this.ctx = new e());
      }
      this.ctx &&
        this.ctx.state === `suspended` &&
        this.ctx.resume().catch(() => {});
    }
    playClick() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.createOscillator(),
            t = this.ctx.createGain();
          ((e.type = `sine`),
            e.frequency.setValueAtTime(600, this.ctx.currentTime),
            e.frequency.exponentialRampToValueAtTime(
              180,
              this.ctx.currentTime + 0.04,
            ),
            t.gain.setValueAtTime(0.08, this.ctx.currentTime),
            t.gain.exponentialRampToValueAtTime(
              0.001,
              this.ctx.currentTime + 0.04,
            ),
            e.connect(t),
            t.connect(this.ctx.destination),
            e.start(),
            e.stop(this.ctx.currentTime + 0.04));
        } catch {}
    }
    playPop() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.createOscillator(),
            t = this.ctx.createGain();
          ((e.type = `triangle`),
            e.frequency.setValueAtTime(450, this.ctx.currentTime),
            e.frequency.exponentialRampToValueAtTime(
              800,
              this.ctx.currentTime + 0.05,
            ),
            t.gain.setValueAtTime(0.04, this.ctx.currentTime),
            t.gain.exponentialRampToValueAtTime(
              0.001,
              this.ctx.currentTime + 0.05,
            ),
            e.connect(t),
            t.connect(this.ctx.destination),
            e.start(),
            e.stop(this.ctx.currentTime + 0.05));
        } catch {}
    }
    playWipe() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let now = this.ctx.currentTime,
            osc = this.ctx.createOscillator(),
            gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(450 + Math.random() * 200, now);
          osc.frequency.exponentialRampToValueAtTime(1100 + Math.random() * 300, now + 0.06);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } catch {}
    }
    playWindowOpen() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime,
            t = this.ctx.createOscillator(),
            n = this.ctx.createGain();
          ((t.type = `sine`),
            t.frequency.setValueAtTime(320, e),
            t.frequency.exponentialRampToValueAtTime(540, e + 0.09),
            n.gain.setValueAtTime(0.06, e),
            n.gain.exponentialRampToValueAtTime(0.001, e + 0.09),
            t.connect(n),
            n.connect(this.ctx.destination),
            t.start(e),
            t.stop(e + 0.09));
        } catch {}
    }
    playWindowClose() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime,
            t = this.ctx.createOscillator(),
            n = this.ctx.createGain();
          ((t.type = `sine`),
            t.frequency.setValueAtTime(480, e),
            t.frequency.exponentialRampToValueAtTime(240, e + 0.07),
            n.gain.setValueAtTime(0.05, e),
            n.gain.exponentialRampToValueAtTime(0.001, e + 0.07),
            t.connect(n),
            n.connect(this.ctx.destination),
            t.start(e),
            t.stop(e + 0.07));
        } catch {}
    }
    playGenieMinimize() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime,
            t = this.ctx.createOscillator(),
            n = this.ctx.createOscillator(),
            r = this.ctx.createGain();
          ((t.type = `sine`),
            t.frequency.setValueAtTime(540, e),
            t.frequency.exponentialRampToValueAtTime(140, e + 0.22),
            (n.type = `triangle`),
            n.frequency.setValueAtTime(360, e),
            n.frequency.exponentialRampToValueAtTime(90, e + 0.22),
            r.gain.setValueAtTime(0.06, e),
            r.gain.linearRampToValueAtTime(0.08, e + 0.06),
            r.gain.exponentialRampToValueAtTime(0.001, e + 0.22),
            t.connect(r),
            n.connect(r),
            r.connect(this.ctx.destination),
            t.start(e),
            n.start(e),
            t.stop(e + 0.22),
            n.stop(e + 0.22));
        } catch {}
    }
    playGenieRestore() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime,
            t = this.ctx.createOscillator(),
            n = this.ctx.createOscillator(),
            r = this.ctx.createGain();
          ((t.type = `sine`),
            t.frequency.setValueAtTime(160, e),
            t.frequency.exponentialRampToValueAtTime(580, e + 0.24),
            (n.type = `triangle`),
            n.frequency.setValueAtTime(240, e),
            n.frequency.exponentialRampToValueAtTime(720, e + 0.24),
            r.gain.setValueAtTime(0.03, e),
            r.gain.linearRampToValueAtTime(0.07, e + 0.12),
            r.gain.exponentialRampToValueAtTime(0.001, e + 0.24),
            t.connect(r),
            n.connect(r),
            r.connect(this.ctx.destination),
            t.start(e),
            n.start(e),
            t.stop(e + 0.24),
            n.stop(e + 0.24));
        } catch {}
    }
    playTrash() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime,
            t = this.ctx.createOscillator(),
            n = this.ctx.createGain();
          ((t.type = `sawtooth`),
            t.frequency.setValueAtTime(140, e),
            t.frequency.exponentialRampToValueAtTime(60, e + 0.12),
            n.gain.setValueAtTime(0.07, e),
            n.gain.exponentialRampToValueAtTime(0.001, e + 0.12),
            t.connect(n),
            n.connect(this.ctx.destination),
            t.start(e),
            t.stop(e + 0.12));
        } catch {}
    }
    playError() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime;
          [350, 440, 520].forEach((t, n) => {
            if (!this.ctx) return;
            let r = this.ctx.createOscillator(),
              i = this.ctx.createGain();
            ((r.type = `triangle`),
              r.frequency.setValueAtTime(t, e + n * 0.015),
              i.gain.setValueAtTime(0.05, e + n * 0.015),
              i.gain.exponentialRampToValueAtTime(0.001, e + 0.18),
              r.connect(i),
              i.connect(this.ctx.destination),
              r.start(e + n * 0.015),
              r.stop(e + 0.18));
          });
        } catch {}
    }
    playSparkle() {
      if (this.enabled)
        try {
          if ((this.initContext(), !this.ctx)) return;
          let e = this.ctx.currentTime;
          [587.33, 739.99, 880, 1174.66].forEach((t, n) => {
            if (!this.ctx) return;
            let r = this.ctx.createOscillator(),
              i = this.ctx.createGain();
            ((r.type = `sine`),
              r.frequency.setValueAtTime(t, e + n * 0.04),
              i.gain.setValueAtTime(0.04, e + n * 0.04),
              i.gain.exponentialRampToValueAtTime(0.001, e + n * 0.04 + 0.12),
              r.connect(i),
              i.connect(this.ctx.destination),
              r.start(e + n * 0.04),
              r.stop(e + n * 0.04 + 0.12));
          });
        } catch {}
    }
  })(),
  Vu = ({
    folder: e,
    isSelected: t,
    onSelect: n,
    onOpen: r,
    containerRef: i,
    currentPos: a,
    onDragEnd: o,
  }) => {
    let s = (0, S.useRef)(null),
      [c, l] = (0, S.useState)(
        () => typeof window < `u` && window.innerWidth < 768,
      );
    (0, S.useEffect)(() => {
      let e = () => {
        l(window.innerWidth < 768);
      };
      return (
        window.addEventListener(`resize`, e),
        () => window.removeEventListener(`resize`, e)
      );
    }, []);
    let u = (e) => {
        (e.stopPropagation(),
          W.playClick(),
          n(),
          c
            ? r()
            : s.current
              ? (clearTimeout(s.current), (s.current = null), r())
              : (s.current = setTimeout(() => {
                  s.current = null;
                }, 300)));
      },
      d =
        c && e.desktopPos.mobileTop !== void 0
          ? e.desktopPos.mobileTop
          : e.desktopPos.top,
      f =
        c && e.desktopPos.mobileLeft !== void 0
          ? e.desktopPos.mobileLeft
          : e.desktopPos.left;
    return (0, H.jsxs)(ku.div, {
      drag: !0,
      dragConstraints: i,
      dragMomentum: !1,
      onDragStart: () => W.playPop(),
      onDragEnd: (e, t) => {
        o && a && o({ x: a.x + t.offset.x, y: a.y + t.offset.y });
      },
      onClick: u,
      className: `absolute z-20 pointer-events-auto select-none cursor-pointer flex flex-col items-center group touch-none transition-colors duration-150 rounded-2xl p-1.5 sm:p-2 ${t ? `bg-[#FEF5D9]/85 border border-[#E9D49C] shadow-xs` : `border border-transparent hover:bg-black/[0.03]`}`,
      style: {
        top: `${d}%`,
        left: `${f}%`,
        transform: `translate(-50%, -50%)`,
        ...(a
          ? {
              transform: `translate(calc(-50% + ${a.x}px), calc(-50% + ${a.y}px))`,
            }
          : {}),
      },
      whileHover: { scale: 1.04, y: -2 },
      whileTap: { scale: 0.97 },
      transition: { type: `spring`, stiffness: 350, damping: 24 },
      children: [
        (0, H.jsx)(`div`, {
          className: `relative w-14 h-12 sm:w-22 sm:h-18 flex items-center justify-center transition-transform duration-200`,
          children: (0, H.jsx)(`img`, {
            src: `/assets/aistudio/folder-icon-mac-png-23_a819e89f.png`,
            alt: e.name,
            className: `w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.2)] select-none pointer-events-none`,
            draggable: !1,
          }),
        }),
        (0, H.jsxs)(`div`, {
          className: `mt-0.5 sm:mt-1 px-1 max-w-[100px] sm:max-w-[140px] text-center`,
          children: [
            (0, H.jsx)(`span`, {
              className: `text-[11px] sm:text-[12px] font-bold tracking-tight leading-tight block text-center truncate text-neutral-900 font-sans`,
              children: e.name,
            }),
            (0, H.jsx)(`span`, {
              className: `text-[8px] sm:text-[9px] font-mono text-neutral-500 block mt-0.5 font-bold tracking-wider opacity-90 truncate`,
              dir: `ltr`,
              children: e.trackCode,
            }),
          ],
        }),
      ],
    });
  },
  Hu = ({ onOpenApp: e, activeAppIds: t, isAdminAuth: isAdminSession = !1 }) => {
    let [n, r] = (0, S.useState)(null),
      [i, a] = (0, S.useState)(
        () => typeof window < `u` && window.innerWidth < 768,
      );
    (0, S.useEffect)(() => {
      let e = () => {
        a(window.innerWidth < 768);
      };
      return (
        window.addEventListener(`resize`, e),
        () => window.removeEventListener(`resize`, e)
      );
    }, []);
    let o = (t) => {
      (W.playPop(),
        t.isExternal && t.externalUrl
          ? window.open(t.externalUrl, `_blank`, `noopener,noreferrer`)
          : e(t.id));
    };
    return (0, H.jsx)(`div`, {
      className: `fixed z-40 pointer-events-none select-none transition-all duration-300 ${i ? `right-1 top-1/2 -translate-y-1/2 flex flex-col items-end` : `bottom-3 inset-x-0 flex justify-center`}`,
      children: (0, H.jsxs)(`nav`, {
        "aria-label": `Applications dock`,
        className: `dock-glass pointer-events-auto rounded-2xl flex border border-white/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.18)] relative backdrop-blur-xl bg-white/80 transition-all ${i ? `flex-col items-center py-2 px-1 space-y-1` : `flex-row items-center px-3 py-1.5 space-x-2 sm:space-x-3`}`,
        children: [
          (0, H.jsx)(`div`, {
            className: `absolute inset-0 rounded-2xl bg-white/30 pointer-events-none`,
          }),
          Lu.map((e) => {
            if (e.isAdmin && !isAdminSession) return null;
            let a = t.includes(e.id),
              s = n === e.id,
              c = e.id === `gallery` || e.id === `brief`;
            return (0, H.jsxs)(
              S.Fragment,
              {
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `relative flex flex-col items-center group cursor-pointer`,
                    onMouseEnter: () => {
                      (r(e.id), W.playPop());
                    },
                    onMouseLeave: () => r(null),
                    children: [
                      (0, H.jsx)(kc, {
                        children:
                          s &&
                          (0, H.jsxs)(ku.div, {
                            initial: {
                              opacity: 0,
                              x: i ? 6 : 0,
                              y: i ? `-50%` : 6,
                              scale: 0.9,
                            },
                            animate: {
                              opacity: 1,
                              x: 0,
                              y: i ? `-50%` : 0,
                              scale: 1,
                            },
                            exit: {
                              opacity: 0,
                              x: i ? 4 : 0,
                              y: i ? `-50%` : 4,
                              scale: 0.9,
                            },
                            transition: { duration: 0.15 },
                            className: `absolute px-2.5 py-1 rounded-md bg-[#18181b]/95 text-white text-[11px] font-medium tracking-tight shadow-xl border border-white/10 whitespace-nowrap pointer-events-none z-50 backdrop-blur-md ${i ? `right-11 top-1/2 -translate-y-1/2` : `-top-11 left-1/2 -translate-x-1/2`}`,
                            children: [
                              e.tooltip,
                              i
                                ? (0, H.jsx)(`div`, {
                                    className: `absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#18181b]`,
                                  })
                                : (0, H.jsx)(`div`, {
                                    className: `absolute left-1/2 -bottom-1 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#18181b]`,
                                  }),
                            ],
                          }),
                      }),
                      (0, H.jsxs)(ku.button, {
                        onClick: () => o(e),
                        whileHover: {
                          scale: i ? 1.15 : 1.22,
                          x: i ? -3 : 0,
                          y: i ? 0 : -4,
                        },
                        whileTap: { scale: 0.95 },
                        transition: {
                          type: `spring`,
                          stiffness: 400,
                          damping: 22,
                        },
                        className: `relative w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 flex items-center justify-center focus:outline-none cursor-pointer`,
                        title: e.name,
                        children: [
                          e.isCalendar
                            ? (() => {
                                try {
                                  let parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short', day: 'numeric' }).formatToParts(new Date());
                                  let monthName = parts.find((p) => p.type === 'month')?.value || 'تقویم';
                                  let dayVal = parts.find((p) => p.type === 'day')?.value || '۱';
                                  return (0, H.jsxs)(`div`, {
                                    className: `w-full h-full rounded-lg sm:rounded-xl bg-white border border-neutral-300 shadow-sm flex flex-col overflow-hidden select-none`,
                                    children: [
                                      (0, H.jsx)(`div`, {
                                        className: `bg-rose-500 text-white text-[7px] sm:text-[8px] font-black text-center leading-tight py-0.5 font-sans`,
                                        children: monthName,
                                      }),
                                      (0, H.jsx)(`div`, {
                                        className: `flex-1 flex items-center justify-center font-black text-neutral-900 text-xs sm:text-sm font-sans`,
                                        children: dayVal,
                                      }),
                                    ],
                                  });
                                } catch {
                                  return (0, H.jsxs)(`div`, {
                                    className: `w-full h-full rounded-lg sm:rounded-xl bg-white border border-neutral-300 shadow-sm flex flex-col overflow-hidden select-none`,
                                    children: [
                                      (0, H.jsx)(`div`, {
                                        className: `bg-rose-500 text-white text-[7px] sm:text-[8px] font-black text-center leading-tight py-0.5 font-sans`,
                                        children: `تقویم`,
                                      }),
                                      (0, H.jsx)(`div`, {
                                        className: `flex-1 flex items-center justify-center font-black text-neutral-900 text-xs sm:text-sm font-sans`,
                                        children: `📅`,
                                      }),
                                    ],
                                  });
                                }
                              })()
                            : e.isNotes
                              ? (0, H.jsxs)(`div`, {
                                  className: `w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-b from-[#FFFDF0] to-[#FEF08A] border border-amber-300/90 shadow-xs flex flex-col overflow-hidden select-none p-0.5 sm:p-1 justify-between relative group`,
                                  children: [
                                    (0, H.jsxs)(`div`, {
                                      className: `flex items-center justify-between border-b border-amber-400/60 pb-0.5`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `text-[6px] sm:text-[7px] font-black text-amber-950 font-sans tracking-tight`,
                                          children: `نوت`,
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-600`,
                                        }),
                                      ],
                                    }),
                                    (0, H.jsxs)(`div`, {
                                      className: `flex flex-col gap-0.5 py-0.5`,
                                      children: [
                                        (0, H.jsx)(`div`, {
                                          className: `h-0.5 bg-amber-900/30 rounded-full w-full`,
                                        }),
                                        (0, H.jsx)(`div`, {
                                          className: `h-0.5 bg-amber-900/25 rounded-full w-4/5`,
                                        }),
                                        (0, H.jsx)(`div`, {
                                          className: `h-0.5 bg-amber-900/20 rounded-full w-3/5`,
                                        }),
                                      ],
                                    }),
                                    (0, H.jsx)(`div`, {
                                      className: `text-[6px] sm:text-[7px] text-amber-900 text-left leading-none font-bold`,
                                      children: `✏️`,
                                    }),
                                  ],
                                })
                            : e.isClientPortal
                              ? (0, H.jsxs)(`div`, {
                                  className: `w-full h-full rounded-lg sm:rounded-xl bg-white border border-neutral-300/90 shadow-2xs flex flex-col items-center justify-center select-none relative overflow-hidden group-hover:border-neutral-900 group-hover:shadow-xs transition-all`,
                                  children: [
                                    (0, H.jsxs)(`svg`, {
                                      className: `w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-800 transition-transform group-hover:scale-105`,
                                      viewBox: `0 0 24 24`,
                                      fill: `none`,
                                      stroke: `currentColor`,
                                      strokeWidth: `1.75`,
                                      strokeLinecap: `round`,
                                      strokeLinejoin: `round`,
                                      children: [
                                        (0, H.jsx)(`rect`, {
                                          width: `20`,
                                          height: `14`,
                                          x: `2`,
                                          y: `7`,
                                          rx: `2.5`,
                                        }),
                                        (0, H.jsx)(`path`, {
                                          d: `M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2`,
                                        }),
                                        (0, H.jsx)(`circle`, {
                                          cx: `12`,
                                          cy: `13`,
                                          r: `1`,
                                          fill: `currentColor`,
                                        }),
                                      ],
                                    }),
                                    (0, H.jsx)(`span`, {
                                      className: `text-[6px] sm:text-[7px] font-bold text-neutral-600 font-sans tracking-tight mt-0.5 leading-none`,
                                      children: `پورتال`,
                                    }),
                                  ],
                                })
                            : e.isAdmin
                              ? (0, H.jsxs)(`div`, {
                                  className: `w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-tr from-[#18181B] to-[#27272A] border border-amber-500/60 shadow-md flex flex-col items-center justify-center select-none text-amber-400 group-hover:border-amber-400 transition`,
                                  children: [
                                    (0, H.jsx)(`span`, { className: `text-[13px] sm:text-[15px] leading-none`, children: `⚙️` }),
                                    (0, H.jsx)(`span`, { className: `text-[6px] sm:text-[7px] font-black tracking-tighter text-amber-300 mt-0.5`, children: `CMS` }),
                                  ],
                                })
                            : (0, H.jsx)(`img`, {
                                src: e.icon,
                                alt: e.name,
                                className: `w-full h-full object-contain drop-shadow-sm pointer-events-none`,
                              }),
                        ],
                      }),
                      (0, H.jsx)(`div`, {
                        className: `h-1 flex items-center justify-center mt-0.5`,
                        children: a
                          ? (0, H.jsx)(`div`, {
                              className: `w-1 h-1 rounded-full bg-neutral-800 shadow-xs`,
                            })
                          : (0, H.jsx)(`div`, { className: `w-1 h-1` }),
                      }),
                    ],
                  }),
                  c &&
                    (0, H.jsx)(`div`, {
                      className: `${i ? `w-5 h-px bg-black/10 my-0.5 shrink-0 self-center` : `h-6 w-px bg-black/10 mx-1 shrink-0 self-center`}`,
                    }),
                ],
              },
              e.id,
            );
          }),
        ],
      }),
    });
  },
  Uu = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  Wu = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) =>
      n ? n.toUpperCase() : t.toLowerCase(),
    ),
  Gu = (e) => {
    let t = Wu(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  Ku = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  qu = (e) => {
    for (let t in e)
      if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
  },
  Ju = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  Yu = (0, S.forwardRef)(
    (
      {
        color: e = `currentColor`,
        size: t = 24,
        strokeWidth: n = 2,
        absoluteStrokeWidth: r,
        className: i = ``,
        children: a,
        iconNode: o,
        ...s
      },
      c,
    ) =>
      (0, S.createElement)(
        `svg`,
        {
          ref: c,
          ...Ju,
          width: t,
          height: t,
          stroke: e,
          strokeWidth: r ? (Number(n) * 24) / Number(t) : n,
          className: Ku(`lucide`, i),
          ...(!a && !qu(s) && { "aria-hidden": `true` }),
          ...s,
        },
        [
          ...o.map(([e, t]) => (0, S.createElement)(e, t)),
          ...(Array.isArray(a) ? a : [a]),
        ],
      ),
  ),
  G = (e, t) => {
    let n = (0, S.forwardRef)(({ className: n, ...r }, i) =>
      (0, S.createElement)(Yu, {
        ref: i,
        iconNode: t,
        className: Ku(`lucide-${Uu(Gu(e))}`, `lucide-${e}`, n),
        ...r,
      }),
    );
    return ((n.displayName = Gu(e)), n);
  },
  Xu = G(`arrow-left`, [
    [`path`, { d: `m12 19-7-7 7-7`, key: `1l729n` }],
    [`path`, { d: `M19 12H5`, key: `x3x0zl` }],
  ]),
  Zu = G(`arrow-right`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `m12 5 7 7-7 7`, key: `xquz4c` }],
  ]),
  Qu = G(`arrow-up-right`, [
    [`path`, { d: `M7 7h10v10`, key: `1tivn9` }],
    [`path`, { d: `M7 17 17 7`, key: `1vkiza` }],
  ]),
  $u = G(`award`, [
    [
      `path`,
      {
        d: `m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526`,
        key: `1yiouv`,
      },
    ],
    [`circle`, { cx: `12`, cy: `8`, r: `6`, key: `1vp47v` }],
  ]),
  K = G(`battery`, [
    [`path`, { d: `M 22 14 L 22 10`, key: `nqc4tb` }],
    [
      `rect`,
      { x: `2`, y: `6`, width: `16`, height: `12`, rx: `2`, key: `13zb55` },
    ],
  ]),
  q = G(`book-open`, [
    [`path`, { d: `M12 7v14`, key: `1akyts` }],
    [
      `path`,
      {
        d: `M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z`,
        key: `ruj8y`,
      },
    ],
  ]),
  J = G(`building`, [
    [`path`, { d: `M12 10h.01`, key: `1nrarc` }],
    [`path`, { d: `M12 14h.01`, key: `1etili` }],
    [`path`, { d: `M12 6h.01`, key: `1vi96p` }],
    [`path`, { d: `M16 10h.01`, key: `1m94wz` }],
    [`path`, { d: `M16 14h.01`, key: `1gbofw` }],
    [`path`, { d: `M16 6h.01`, key: `1x0f13` }],
    [`path`, { d: `M8 10h.01`, key: `19clt8` }],
    [`path`, { d: `M8 14h.01`, key: `6423bh` }],
    [`path`, { d: `M8 6h.01`, key: `1dz90k` }],
    [`path`, { d: `M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3`, key: `cabbwy` }],
    [
      `rect`,
      { x: `4`, y: `2`, width: `16`, height: `20`, rx: `2`, key: `1uxh74` },
    ],
  ]),
  Y = G(`calculator`, [
    [
      `rect`,
      { width: `16`, height: `20`, x: `4`, y: `2`, rx: `2`, key: `1nb95v` },
    ],
    [`line`, { x1: `8`, x2: `16`, y1: `6`, y2: `6`, key: `x4nwl0` }],
    [`line`, { x1: `16`, x2: `16`, y1: `14`, y2: `18`, key: `wjye3r` }],
    [`path`, { d: `M16 10h.01`, key: `1m94wz` }],
    [`path`, { d: `M12 10h.01`, key: `1nrarc` }],
    [`path`, { d: `M8 10h.01`, key: `19clt8` }],
    [`path`, { d: `M12 14h.01`, key: `1etili` }],
    [`path`, { d: `M8 14h.01`, key: `6423bh` }],
    [`path`, { d: `M12 18h.01`, key: `mhygvu` }],
    [`path`, { d: `M8 18h.01`, key: `lrp35t` }],
  ]),
  X = G(`check`, [[`path`, { d: `M20 6 9 17l-5-5`, key: `1gmf2c` }]]),
  ed = G(`chevron-left`, [[`path`, { d: `m15 18-6-6 6-6`, key: `1wnfg3` }]]),
  td = G(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]),
  nd = G(`circle-check-big`, [
    [`path`, { d: `M21.801 10A10 10 0 1 1 17 3.335`, key: `yps3ct` }],
    [`path`, { d: `m9 11 3 3L22 4`, key: `1pflzl` }],
  ]),
  rd = G(`circle-check`, [
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
    [`path`, { d: `m9 12 2 2 4-4`, key: `dzmm74` }],
  ]),
  id = G(`citrus`, [
    [
      `path`,
      {
        d: `M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z`,
        key: `4ite01`,
      },
    ],
    [`path`, { d: `M19.65 15.66A8 8 0 0 1 8.35 4.34`, key: `1gxipu` }],
    [`path`, { d: `m14 10-5.5 5.5`, key: `92pfem` }],
    [`path`, { d: `M14 17.85V10H6.15`, key: `xqmtsk` }],
  ]),
  ad = G(`clock`, [
    [`path`, { d: `M12 6v6l4 2`, key: `mmk7yg` }],
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
  ]),
  od = G(`copy`, [
    [
      `rect`,
      {
        width: `14`,
        height: `14`,
        x: `8`,
        y: `8`,
        rx: `2`,
        ry: `2`,
        key: `17jyea`,
      },
    ],
    [
      `path`,
      {
        d: `M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,
        key: `zix9uf`,
      },
    ],
  ]),
  sd = G(`external-link`, [
    [`path`, { d: `M15 3h6v6`, key: `1q9fwt` }],
    [`path`, { d: `M10 14 21 3`, key: `gplh6r` }],
    [
      `path`,
      {
        d: `M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6`,
        key: `a6xqqp`,
      },
    ],
  ]),
  cd = G(`file-code`, [
    [`path`, { d: `M10 12.5 8 15l2 2.5`, key: `1tg20x` }],
    [`path`, { d: `m14 12.5 2 2.5-2 2.5`, key: `yinavb` }],
    [`path`, { d: `M14 2v4a2 2 0 0 0 2 2h4`, key: `tnqrlb` }],
    [
      `path`,
      {
        d: `M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z`,
        key: `1mlx9k`,
      },
    ],
  ]),
  ld = G(`file-image`, [
    [
      `path`,
      {
        d: `M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`,
        key: `1rqfz7`,
      },
    ],
    [`path`, { d: `M14 2v4a2 2 0 0 0 2 2h4`, key: `tnqrlb` }],
    [`circle`, { cx: `10`, cy: `12`, r: `2`, key: `737tya` }],
    [
      `path`,
      { d: `m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22`, key: `wt3hpn` },
    ],
  ]),
  ud = G(`file-text`, [
    [
      `path`,
      {
        d: `M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`,
        key: `1rqfz7`,
      },
    ],
    [`path`, { d: `M14 2v4a2 2 0 0 0 2 2h4`, key: `tnqrlb` }],
    [`path`, { d: `M10 9H8`, key: `b1mrlr` }],
    [`path`, { d: `M16 13H8`, key: `t4e002` }],
    [`path`, { d: `M16 17H8`, key: `z1uh3a` }],
  ]),
  dd = G(`folder`, [
    [
      `path`,
      {
        d: `M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z`,
        key: `1kt360`,
      },
    ],
  ]),
  fd = G(`image`, [
    [
      `rect`,
      {
        width: `18`,
        height: `18`,
        x: `3`,
        y: `3`,
        rx: `2`,
        ry: `2`,
        key: `1m3agn`,
      },
    ],
    [`circle`, { cx: `9`, cy: `9`, r: `2`, key: `af1f0g` }],
    [`path`, { d: `m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21`, key: `1xmnt7` }],
  ]),
  pd = G(`info`, [
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
    [`path`, { d: `M12 16v-4`, key: `1dtifu` }],
    [`path`, { d: `M12 8h.01`, key: `e9boi3` }],
  ]),
  md = G(`instagram`, [
    [
      `rect`,
      {
        width: `20`,
        height: `20`,
        x: `2`,
        y: `2`,
        rx: `5`,
        ry: `5`,
        key: `2e1cvw`,
      },
    ],
    [
      `path`,
      { d: `M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z`, key: `9exkf1` },
    ],
    [`line`, { x1: `17.5`, x2: `17.51`, y1: `6.5`, y2: `6.5`, key: `r4j83e` }],
  ]),
  hd = G(`layers`, [
    [
      `path`,
      {
        d: `M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,
        key: `zw3jo`,
      },
    ],
    [
      `path`,
      {
        d: `M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,
        key: `1wduqc`,
      },
    ],
    [
      `path`,
      {
        d: `M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,
        key: `kqbvx6`,
      },
    ],
  ]),
  gd = G(`layout-grid`, [
    [
      `rect`,
      { width: `7`, height: `7`, x: `3`, y: `3`, rx: `1`, key: `1g98yp` },
    ],
    [
      `rect`,
      { width: `7`, height: `7`, x: `14`, y: `3`, rx: `1`, key: `6d4xhi` },
    ],
    [
      `rect`,
      { width: `7`, height: `7`, x: `14`, y: `14`, rx: `1`, key: `nxv5o0` },
    ],
    [
      `rect`,
      { width: `7`, height: `7`, x: `3`, y: `14`, rx: `1`, key: `1bb6yr` },
    ],
  ]),
  _d = G(`list`, [
    [`path`, { d: `M3 5h.01`, key: `18ugdj` }],
    [`path`, { d: `M3 12h.01`, key: `nlz23k` }],
    [`path`, { d: `M3 19h.01`, key: `noohij` }],
    [`path`, { d: `M8 5h13`, key: `1pao27` }],
    [`path`, { d: `M8 12h13`, key: `1za7za` }],
    [`path`, { d: `M8 19h13`, key: `m83p4d` }],
  ]),
  vd = G(`mail`, [
    [`path`, { d: `m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`, key: `132q7q` }],
    [
      `rect`,
      { x: `2`, y: `4`, width: `20`, height: `16`, rx: `2`, key: `izxlao` },
    ],
  ]),
  yd = G(`map-pin`, [
    [
      `path`,
      {
        d: `M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0`,
        key: `1r0f0z`,
      },
    ],
    [`circle`, { cx: `12`, cy: `10`, r: `3`, key: `ilqhr7` }],
  ]),
  bd = G(`maximize-2`, [
    [`path`, { d: `M15 3h6v6`, key: `1q9fwt` }],
    [`path`, { d: `m21 3-7 7`, key: `1l2asr` }],
    [`path`, { d: `m3 21 7-7`, key: `tjx5ai` }],
    [`path`, { d: `M9 21H3v-6`, key: `wtvkvv` }],
  ]),
  xd = G(`minimize-2`, [
    [`path`, { d: `m14 10 7-7`, key: `oa77jy` }],
    [`path`, { d: `M20 10h-6V4`, key: `mjg0md` }],
    [`path`, { d: `m3 21 7-7`, key: `tjx5ai` }],
    [`path`, { d: `M4 14h6v6`, key: `rmj7iw` }],
  ]),
  Sd = G(`minus`, [[`path`, { d: `M5 12h14`, key: `1ays0h` }]]),
  Cd = G(`move`, [
    [`path`, { d: `M12 2v20`, key: `t6zp3m` }],
    [`path`, { d: `m15 19-3 3-3-3`, key: `11eu04` }],
    [`path`, { d: `m19 9 3 3-3 3`, key: `1mg7y2` }],
    [`path`, { d: `M2 12h20`, key: `9i4pu4` }],
    [`path`, { d: `m5 9-3 3 3 3`, key: `j64kie` }],
    [`path`, { d: `m9 5 3-3 3 3`, key: `l8vdw6` }],
  ]),
  wd = G(`pen-line`, [
    [`path`, { d: `M13 21h8`, key: `1jsn5i` }],
    [
      `path`,
      {
        d: `M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`,
        key: `1a8usu`,
      },
    ],
  ]),
  Td = G(`plus`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `M12 5v14`, key: `s699le` }],
  ]),
  Ed = G(`quote`, [
    [
      `path`,
      {
        d: `M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z`,
        key: `rib7q0`,
      },
    ],
    [
      `path`,
      {
        d: `M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z`,
        key: `1ymkrd`,
      },
    ],
  ]),
  Dd = G(`refresh-cw`, [
    [
      `path`,
      {
        d: `M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`,
        key: `v9h5vc`,
      },
    ],
    [`path`, { d: `M21 3v5h-5`, key: `1q7to0` }],
    [
      `path`,
      {
        d: `M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`,
        key: `3uifl3`,
      },
    ],
    [`path`, { d: `M8 16H3v5`, key: `1cv678` }],
  ]),
  Od = G(`rotate-ccw`, [
    [
      `path`,
      { d: `M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`, key: `1357e3` },
    ],
    [`path`, { d: `M3 3v5h5`, key: `1xhq8a` }],
  ]),
  kd = G(`save`, [
    [
      `path`,
      {
        d: `M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z`,
        key: `1c8476`,
      },
    ],
    [`path`, { d: `M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7`, key: `1ydtos` }],
    [`path`, { d: `M7 3v4a1 1 0 0 0 1 1h7`, key: `t51u73` }],
  ]),
  Ad = G(`search`, [
    [`path`, { d: `m21 21-4.34-4.34`, key: `14j7rj` }],
    [`circle`, { cx: `11`, cy: `11`, r: `8`, key: `4ej97u` }],
  ]),
  jd = G(`send`, [
    [
      `path`,
      {
        d: `M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,
        key: `1ffxy3`,
      },
    ],
    [`path`, { d: `m21.854 2.147-10.94 10.939`, key: `12cjpa` }],
  ]),
  Md = G(`shield-alert`, [
    [
      `path`,
      {
        d: `M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,
        key: `oel41y`,
      },
    ],
    [`path`, { d: `M12 8v4`, key: `1got3b` }],
    [`path`, { d: `M12 16h.01`, key: `1drbdi` }],
  ]),
  Nd = G(`sliders-vertical`, [
    [`path`, { d: `M10 8h4`, key: `1sr2af` }],
    [`path`, { d: `M12 21v-9`, key: `17s77i` }],
    [`path`, { d: `M12 8V3`, key: `13r4qs` }],
    [`path`, { d: `M17 16h4`, key: `h1uq16` }],
    [`path`, { d: `M19 12V3`, key: `o1uvq1` }],
    [`path`, { d: `M19 21v-5`, key: `qua636` }],
    [`path`, { d: `M3 14h4`, key: `bcjad9` }],
    [`path`, { d: `M5 10V3`, key: `cb8scm` }],
    [`path`, { d: `M5 21v-7`, key: `1w1uti` }],
  ]),
  Pd = G(`sparkles`, [
    [
      `path`,
      {
        d: `M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,
        key: `1s2grr`,
      },
    ],
    [`path`, { d: `M20 2v4`, key: `1rf3ol` }],
    [`path`, { d: `M22 4h-4`, key: `gwowj6` }],
    [`circle`, { cx: `4`, cy: `20`, r: `2`, key: `6kqj1y` }],
  ]),
  Fd = G(`tag`, [
    [
      `path`,
      {
        d: `M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z`,
        key: `vktsd0`,
      },
    ],
    [
      `circle`,
      { cx: `7.5`, cy: `7.5`, r: `.5`, fill: `currentColor`, key: `kqv944` },
    ],
  ]),
  Id = G(`trash-2`, [
    [`path`, { d: `M10 11v6`, key: `nco0om` }],
    [`path`, { d: `M14 11v6`, key: `outv1u` }],
    [`path`, { d: `M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`, key: `miytrc` }],
    [`path`, { d: `M3 6h18`, key: `d0wm0j` }],
    [`path`, { d: `M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`, key: `e791ji` }],
  ]),
  Ld = G(`trending-up`, [
    [`path`, { d: `M16 7h6v6`, key: `box55l` }],
    [`path`, { d: `m22 7-8.5 8.5-5-5L2 17`, key: `1t1m79` }],
  ]),
  Rd = G(`volume-2`, [
    [
      `path`,
      {
        d: `M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,
        key: `uqj9uw`,
      },
    ],
    [`path`, { d: `M16 9a5 5 0 0 1 0 6`, key: `1q6k2b` }],
    [`path`, { d: `M19.364 18.364a9 9 0 0 0 0-12.728`, key: `ijwkga` }],
  ]),
  zd = G(`volume-x`, [
    [
      `path`,
      {
        d: `M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,
        key: `uqj9uw`,
      },
    ],
    [`line`, { x1: `22`, x2: `16`, y1: `9`, y2: `15`, key: `1ewh16` }],
    [`line`, { x1: `16`, x2: `22`, y1: `9`, y2: `15`, key: `5ykzw1` }],
  ]),
  Bd = G(`wifi`, [
    [`path`, { d: `M12 20h.01`, key: `zekei9` }],
    [`path`, { d: `M2 8.82a15 15 0 0 1 20 0`, key: `dnpr2z` }],
    [`path`, { d: `M5 12.859a10 10 0 0 1 14 0`, key: `1x1e6c` }],
    [`path`, { d: `M8.5 16.429a5 5 0 0 1 7 0`, key: `1bycff` }],
  ]),
  Vd = G(`x`, [
    [`path`, { d: `M18 6 6 18`, key: `1bl5f8` }],
    [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }],
  ]),
  Hd = ({
    onOpenNotes: e,
    onOpenError: t,
    onOpenBin: n,
    onOpenContact: r,
    onResetLayout: i,
    soundEnabled: a,
    onToggleSound: o,
    onOpenWallpaperSelector: s,
    currentWallpaperName: c,
    onOpenFolder: l,
    onOpenBrief: u,
    onOpenGallery: d,
    onOpenCalendar: peCalendar,
    onOpenAdmin: onAdmin,
    onOpenClientPortal: onClientPortal,
    activeClient = null,
    isAdminAuth: isAdminSession = !1,
    onPromptAdminLogin: onPromptLogin,
    onOpenManifesto: onManifesto,
    isMobileMode: f = !1,
    onToggleMobileMode: p,
  }) => {
    let [m, h] = (0, S.useState)(``),
      [g, _] = (0, S.useState)(null);
    ((0, S.useEffect)(() => {
      let e = () => {
        let e = new Date(),
          fa = '';
        try {
          fa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(e);
        } catch {
          fa = '';
        }
        let t = e.toLocaleDateString(`en-US`, {
            weekday: `short`,
            month: `short`,
            day: `numeric`,
          }),
          n = e.toLocaleTimeString(`en-US`, {
            hour: `2-digit`,
            minute: `2-digit`,
            hour12: !1,
          });
        h(fa ? `${fa} • ${n}` : `${t}  ${n}`);
      };
      e();
      let t = setInterval(e, 1e3);
      return () => clearInterval(t);
    }, []),
      (0, S.useEffect)(() => {
        let e = (e) => {
          e.target.closest(`.menu-container`) || _(null);
        };
        return (
          window.addEventListener(`mousedown`, e),
          () => window.removeEventListener(`mousedown`, e)
        );
      }, []));
    let v = (e) => {
        (W.playClick(), _(g === e ? null : e));
      },
      y = u || r;
    return (0, H.jsxs)(`header`, {
      dir: `ltr`,
      className: `topbar-glass fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-3 text-[12px] sm:text-[13px] text-neutral-800 border-b border-black/10 select-none backdrop-blur-md font-sans bg-white/85`,
      children: [
        (0, H.jsxs)(`div`, {
          className: `flex items-center space-x-1 sm:space-x-1.5 menu-container`,
          children: [
            (0, H.jsx)(`button`, {
              onClick: () => v(`apple`),
              className: `px-2 py-0.5 rounded hover:bg-black/8 transition-colors flex items-center text-amber-600 cursor-pointer`,
              title: `Creativity Juice System`,
              children: (0, H.jsx)(`span`, {
                className: `text-sm font-bold tracking-tighter`,
                children: `🍊`,
              }),
            }),
            (0, H.jsxs)(`button`, {
              onClick: () => v(`brand`),
              className: `font-bold px-2 py-0.5 rounded hover:bg-black/8 transition-colors tracking-tight text-neutral-900 flex items-center space-x-1.5 cursor-pointer`,
              children: [
                (0, H.jsx)(`span`, { children: `Creativity Juice` }),
                (0, H.jsx)(`span`, {
                  className: `text-[9px] font-mono uppercase bg-amber-500/15 text-amber-800 px-1 rounded border border-amber-500/30 hidden sm:inline`,
                  children: `STUDIO`,
                }),
              ],
            }),
            (0, H.jsx)(`button`, {
              onClick: () => v(`file`),
              className: `px-2 py-0.5 rounded hover:bg-black/8 transition-colors hidden sm:inline-block font-medium text-neutral-800 cursor-pointer`,
              children: `File`,
            }),
            (0, H.jsx)(`button`, {
              onClick: () => v(`view`),
              className: `px-2 py-0.5 rounded hover:bg-black/8 transition-colors hidden sm:inline-block font-medium text-neutral-800 cursor-pointer`,
              children: `View`,
            }),
            (0, H.jsx)(`button`, {
              onClick: () => {
                (W.playClick(), y());
              },
              className: `px-2.5 py-0.5 rounded-md hover:bg-amber-200/60 transition-all text-amber-900 bg-amber-100/80 border border-amber-300/80 font-bold hidden sm:inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95`,
              title: `شروع فرم دریافت بریف و دکترین پروژه (Project Brief)`,
              children: (0, H.jsx)(`span`, { children: `Project Brief 🚀` }),
            }),
            g === `apple` &&
              (0, H.jsxs)(`div`, {
                className: `absolute top-7 left-2 w-64 bg-white/95 backdrop-blur-xl border border-black/12 rounded-xl shadow-2xl py-1 text-xs text-neutral-900 z-50 text-left animate-window-pop`,
                children: [
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (onManifesto ? onManifesto() : (e && e()), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 hover:text-black transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `font-medium`,
                        children: `About Creativity Juice`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] text-neutral-400 font-mono`,
                        children: `⌘I`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (onManifesto ? onManifesto() : (e && e()), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center justify-between font-bold text-neutral-900 cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        children: `Studio Profile & Manifesto`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] text-amber-700 font-mono`,
                        children: `مانیفست`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (e && e(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        children: `Notes & Ideas (یادداشت‌ها)`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] text-neutral-400 font-mono`,
                        children: `⌘N`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      if (isAdminSession) {
                        onAdmin && onAdmin();
                      } else {
                        onPromptLogin && onPromptLogin();
                      }
                      _(null);
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-amber-100/70 transition-colors flex items-center justify-between font-bold text-neutral-800 cursor-pointer`,
                    children: [
                      (0, H.jsxs)(`span`, {
                        className: `flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(`span`, { children: `⚙️` }),
                          (0, H.jsx)(`span`, {
                            children: isAdminSession
                              ? `Studio CMS (پنل مدیریت استودیو)`
                              : `ورود مدیر استودیو (Owner Login)`,
                          }),
                        ],
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[9px] bg-amber-500/20 text-amber-900 border border-amber-500/30 px-1 py-0.2 rounded font-mono font-bold`,
                        children: isAdminSession ? `CMS` : `قفل 🔒`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      onClientPortal && onClientPortal();
                      _(null);
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-sky-50 transition-colors flex items-center justify-between font-bold text-neutral-800 cursor-pointer`,
                    children: [
                      (0, H.jsxs)(`span`, {
                        className: `flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(`span`, { children: `💼` }),
                          (0, H.jsx)(`span`, {
                            children: `ورود کارفرما (Client Portal)`,
                          }),
                        ],
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[9px] bg-sky-100 text-sky-800 border border-sky-200 px-1 py-0.2 rounded font-mono font-bold`,
                        children: `فضای کار`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (y(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 transition-colors flex items-center justify-between font-bold text-amber-700 cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Start Project Brief…` }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] text-amber-700 bg-amber-100 px-1 rounded font-mono`,
                        children: `NEW`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => {
                      (s(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors cursor-pointer`,
                    children: `Desktop Wallpaper…`,
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => {
                      (t(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 text-amber-800 transition-colors cursor-pointer`,
                    children: `Brief Diagnostic Warning`,
                  }),
                  (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (n(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-red-50 transition-colors text-red-600 flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Discarded Ideas Bin` }),
                      (0, H.jsx)(Id, { className: `w-3.5 h-3.5` }),
                    ],
                  }),
                ],
              }),
            g === `brand` &&
              (0, H.jsxs)(`div`, {
                className: `absolute top-7 left-10 w-72 bg-white/95 backdrop-blur-xl border border-black/12 rounded-xl shadow-2xl py-2 text-xs text-neutral-900 z-50 text-left animate-window-pop`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `px-3 pb-2 border-b border-neutral-200`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        className: `font-bold text-neutral-900 flex items-center justify-between`,
                        children: [
                          (0, H.jsx)(`span`, {
                            children: `Creativity Juice Studio`,
                          }),
                          (0, H.jsx)(`span`, {
                            className: `w-2 h-2 rounded-full bg-amber-500 animate-pulse`,
                          }),
                        ],
                      }),
                      (0, H.jsx)(`div`, {
                        className: `text-[11px] text-neutral-500 mt-0.5`,
                        children: `Brand Architecture & Commercial Cinema Portal`,
                      }),
                      (0, H.jsx)(`div`, {
                        className: `text-[10px] text-amber-700 mt-0.5 font-mono`,
                        children: `hello@creativityjuice.com`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `pt-1`,
                    children: [
                      (0, H.jsx)(`button`, {
                        onClick: () => {
                          (onManifesto ? onManifesto() : (e && e()), _(null));
                        },
                        className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 font-bold transition-colors cursor-pointer`,
                        children: `Studio Profile & Manifesto`,
                      }),
                      (0, H.jsx)(`button`, {
                        onClick: () => {
                          (e && e(), _(null));
                        },
                        className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer`,
                        children: `Notes & Idea Pad (یادداشت‌ها)`,
                      }),
                      (0, H.jsx)(`button`, {
                        onClick: () => {
                          (y(), _(null));
                        },
                        className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 transition-colors text-amber-700 font-bold cursor-pointer`,
                        children: `Start Strategic Brief`,
                      }),
                      (0, H.jsx)(`div`, {
                        className: `h-px bg-neutral-200 my-1`,
                      }),
                      (0, H.jsx)(`a`, {
                        href: `mailto:hello@creativityjuice.com`,
                        className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors block text-neutral-600`,
                        children: `Direct Inquiry with Directors`,
                      }),
                    ],
                  }),
                ],
              }),
            g === `file` &&
              (0, H.jsxs)(`div`, {
                className: `absolute top-7 left-24 w-72 bg-white/95 backdrop-blur-xl border border-black/12 rounded-xl shadow-2xl py-1.5 text-xs text-neutral-900 z-50 text-left animate-window-pop`,
                children: [
                  (0, H.jsx)(`div`, {
                    className: `px-3 py-1 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200 mb-1`,
                    children: `Department Folders on Desktop`,
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => {
                      (onManifesto ? onManifesto() : (e && e()), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-900 transition-colors font-bold cursor-pointer`,
                    children: `Studio Profile & Manifesto (پروفایل و مانیفست)`,
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => {
                      (e && e(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer`,
                    children: `Notes Pad (دفترچه یادداشت)`,
                  }),
                  (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
                  l &&
                    (0, H.jsxs)(H.Fragment, {
                      children: [
                        (0, H.jsxs)(`button`, {
                          onClick: () => {
                            (l(`folder-projects`), _(null));
                          },
                          className: `w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center justify-between font-bold cursor-pointer`,
                          children: [
                            (0, H.jsxs)(`span`, {
                              className: `flex items-center gap-1.5`,
                              children: [
                                (0, H.jsx)(`img`, {
                                  src: `/assets/aistudio/folder-icon-mac-png-23_a819e89f.png`,
                                  alt: ``,
                                  className: `w-3.5 h-3.5 object-contain`,
                                }),
                                (0, H.jsx)(`span`, {
                                  children: `Projects (۱۱ پرونده شاخص)`,
                                }),
                              ],
                            }),
                            (0, H.jsx)(`span`, {
                              className: `text-[10px] font-mono text-amber-800 bg-amber-100 px-1 rounded`,
                              children: `11 Docs`,
                            }),
                          ],
                        }),
                        Au.map((fld) =>
                          (0, H.jsxs)(
                            `button`,
                            {
                              onClick: () => {
                                (l(fld.id), _(null));
                              },
                              className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                              children: [
                                (0, H.jsxs)(`span`, {
                                  className: `flex items-center gap-1.5`,
                                  children: [
                                    (0, H.jsx)(dd, {
                                      className: `w-3.5 h-3.5 text-amber-600`,
                                    }),
                                    (0, H.jsx)(`span`, {
                                      children: fld.nameEn || fld.name,
                                    }),
                                  ],
                                }),
                                (0, H.jsx)(`span`, {
                                  className: `text-[10px] font-mono text-neutral-500`,
                                  children: fld.badge || `${fld.itemCount} Docs`,
                                }),
                              ],
                            },
                            fld.id,
                          ),
                        ),
                      ],
                    }),
                  (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (y(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-amber-700 font-bold transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        children: `Draft New Strategic Brief…`,
                      }),
                      (0, H.jsx)(jd, { className: `w-3.5 h-3.5` }),
                    ],
                  }),
                ],
              }),
            g === `view` &&
              (0, H.jsxs)(`div`, {
                className: `absolute top-7 left-36 w-60 bg-white/95 backdrop-blur-xl border border-black/12 rounded-xl shadow-2xl py-1 text-xs text-neutral-900 z-50 text-left animate-window-pop`,
                children: [
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (i(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        children: `Clean Up Desktop Icons`,
                      }),
                      (0, H.jsx)(Dd, {
                        className: `w-3.5 h-3.5 text-neutral-500`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (o(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, {
                        children: a
                          ? `Mute Sound Effects`
                          : `Enable Sound Effects`,
                      }),
                      a
                        ? (0, H.jsx)(Rd, { className: `w-3.5 h-3.5` })
                        : (0, H.jsx)(zd, {
                            className: `w-3.5 h-3.5 opacity-50`,
                          }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (s(), _(null));
                    },
                    className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Change Wallpaper…` }),
                      (0, H.jsx)(Nd, {
                        className: `w-3.5 h-3.5 text-neutral-500`,
                      }),
                    ],
                  }),
                  d &&
                    (0, H.jsxs)(`button`, {
                      onClick: () => {
                        (d(), _(null));
                      },
                      className: `w-full text-left px-3 py-1.5 hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer`,
                      children: [
                        (0, H.jsx)(`span`, { children: `Works Gallery` }),
                        (0, H.jsx)(Pd, {
                          className: `w-3.5 h-3.5 text-amber-600`,
                        }),
                      ],
                    }),
                ],
              }),
          ],
        }),
        (0, H.jsxs)(`div`, {
          className: `flex items-center space-x-1.5 sm:space-x-3 text-neutral-700`,
          children: [
            activeClient &&
              (0, H.jsxs)(`div`, {
                className: `hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-950 text-xs font-bold font-sans shadow-2xs`,
                dir: `rtl`,
                children: [
                  (0, H.jsx)(`span`, { children: activeClient.logoBadge }),
                  (0, H.jsxs)(`span`, {
                    className: `truncate max-w-[180px] text-[11px]`,
                    children: [
                      `کارفرما: `,
                      (0, H.jsx)(`strong`, { children: activeClient.brandName }),
                    ],
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => setActiveClientId(null),
                    className: `mr-1 text-[9px] text-neutral-600 hover:text-neutral-900 bg-white/70 hover:bg-white px-1.5 py-0.2 rounded cursor-pointer transition shadow-2xs`,
                    title: `خروج از حساب این کارفرما`,
                    children: `خروج ✕`,
                  }),
                ],
              }),
            (0, H.jsx)(`button`, {
              onClick: o,
              className: `p-1 rounded hover:bg-black/8 transition-colors cursor-pointer`,
              title: a ? `Mute Sound` : `Enable Sound`,
              children: a
                ? (0, H.jsx)(Rd, { className: `w-3.5 h-3.5 text-neutral-800` })
                : (0, H.jsx)(zd, { className: `w-3.5 h-3.5 text-neutral-400` }),
            }),
            (0, H.jsx)(Bd, {
              className: `w-3.5 h-3.5 opacity-80 hidden sm:block`,
            }),
            (0, H.jsxs)(`div`, {
              className: `flex items-center space-x-1`,
              children: [
                (0, H.jsx)(`span`, {
                  className: `text-[10px] sm:text-[11px] font-mono font-medium opacity-90 text-neutral-700`,
                  children: `100%`,
                }),
                (0, H.jsx)(K, { className: `w-3.5 h-3.5 opacity-80` }),
              ],
            }),
            isAdminSession &&
              (0, H.jsxs)(`button`, {
                onClick: () => {
                  W.playClick();
                  onAdmin && onAdmin();
                },
                className: `flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/20 hover:from-amber-500/25 hover:to-amber-600/30 text-amber-900 border border-amber-600/35 font-bold text-[10.5px] sm:text-[11px] transition-all cursor-pointer shadow-xs active:scale-95`,
                title: `داشبورد مدیریتی و کنترل استودیو • Studio CMS`,
                children: [
                  (0, H.jsx)(`span`, { className: `text-[11px]`, children: `⚙️` }),
                  (0, H.jsx)(`span`, { className: `hidden sm:inline`, children: `پنل مدیریت` }),
                ],
              }),
            (0, H.jsx)(`button`, {
              onClick: s,
              className: `p-1 rounded hover:bg-black/8 transition-colors cursor-pointer hidden sm:block`,
              title: `Change Wallpaper`,
              children: (0, H.jsx)(Nd, { className: `w-3.5 h-3.5 opacity-85` }),
            }),
            (0, H.jsx)(`button`, {
              onClick: () => {
                W.playClick();
                peCalendar && peCalendar();
              },
              className: `font-semibold tracking-tight text-[11px] sm:text-[12px] opacity-90 px-1.5 py-0.5 rounded hover:bg-black/8 transition-colors font-mono text-neutral-800 truncate cursor-pointer`,
              title: `Open Content Calendar • تقویم محتوایی`,
              children: m || `14:28`,
            }),
          ],
        }),
      ],
    });
  },
  Ud = ({
    id: e,
    title: t,
    subtitle: n,
    onClose: r,
    onMinimize: i,
    onRestore: a,
    onMaximize: o,
    isMaximized: s = !1,
    zIndex: c,
    onFocus: l,
    children: u,
    width: d = `w-[94vw] sm:w-[88vw] md:w-[80vw] lg:w-[70vw]`,
    maxWidth: f = `max-w-5xl`,
    className: p = ``,
    headerRightContent: m,
  }) => {
    let h = (0, S.useRef)(null),
      g = Du(),
      [_, v] = (0, S.useState)(s),
      [y, b] = (0, S.useState)(`normal`),
      [x, C] = (0, S.useState)({ x: 0, y: 0 });
    (0, S.useEffect)(() => {
      (v(s), s && C({ x: 0, y: 0 }));
    }, [s]);
    let ee = (e) => {
        (e.stopPropagation(), W.playWindowClose(), r());
      },
      w = (e) => {
        (e && e.stopPropagation(),
          y !== `minimizing` &&
            y !== `minimized` &&
            (W.playGenieMinimize(), b(`minimizing`), i && i()));
      },
      te = (0, S.useCallback)(
        (e) => {
          (e && e.stopPropagation(),
            W.playGenieRestore(),
            b(`restoring`),
            l(),
            a && a());
        },
        [l, a],
      );
    (0, S.useEffect)(() => {
      if (!e) return;
      let t = (t) => {
        let n = t.detail?.id;
        n &&
          (e === n || (e && n.includes(e)) || (e && e.includes(n))) &&
          (y === `minimized` || y === `minimizing`) &&
          te();
      };
      return (
        window.addEventListener(`restore-mac-window`, t),
        () => {
          window.removeEventListener(`restore-mac-window`, t);
        }
      );
    }, [e, y, te]);
    let T = (e) => {
        (e.stopPropagation(), W.playClick());
        let t = !_;
        (v(t), t && C({ x: 0, y: 0 }), o && o());
      },
      E = y === `minimizing` || y === `minimized`;
    return (0, H.jsxs)(H.Fragment, {
      children: [
        (0, H.jsx)(`div`, {
          dir: `ltr`,
          className: `fixed inset-0 pointer-events-none flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none`,
          style: { zIndex: c, perspective: 1200, perspectiveOrigin: `50% 90%` },
          onMouseDown: l,
          children: (0, H.jsxs)(ku.div, {
            ref: h,
            drag: !_ && y === `normal`,
            dragListener: !1,
            dragControls: g,
            dragMomentum: !1,
            onDragEnd: (e, t) => {
              C((e) => ({ x: e.x + t.offset.x, y: e.y + t.offset.y }));
            },
            initial: {
              opacity: 0,
              scaleX: 0.16,
              scaleY: 0.04,
              y: `42vh`,
              x: 0,
              rotateX: 24,
              filter: `blur(4px)`,
            },
            animate: E
              ? {
                  opacity: 0,
                  scaleX: 0.08,
                  scaleY: 0.02,
                  y: `44vh`,
                  x: 0,
                  rotateX: 28,
                  filter: `blur(3px)`,
                }
              : {
                  opacity: 1,
                  scaleX: 1,
                  scaleY: 1,
                  x: _ ? 0 : x.x,
                  y: _ ? 0 : x.y,
                  rotateX: 0,
                  filter: `blur(0px)`,
                },
            exit: {
              opacity: 0,
              scaleX: 0.18,
              scaleY: 0.05,
              y: `40vh`,
              x: 0,
              rotateX: 20,
              filter: `blur(4px)`,
              transition: {
                type: `spring`,
                stiffness: 300,
                damping: 26,
                mass: 0.8,
              },
            },
            transition: {
              type: `spring`,
              stiffness: E ? 240 : 285,
              damping: E ? 25 : 23,
              mass: 0.85,
              restDelta: 0.001,
            },
            onAnimationComplete: () => {
              y === `minimizing`
                ? b(`minimized`)
                : y === `restoring` && b(`normal`);
            },
            style: {
              transformOrigin: `50% 100%`,
              transformStyle: `preserve-3d`,
              display: y === `minimized` ? `none` : `flex`,
            },
            className: `relative pointer-events-auto flex flex-col rounded-2xl sm:rounded-xl overflow-hidden border border-black/15 shadow-[0_28px_80px_-15px_rgba(0,0,0,0.32)] bg-[#FAF8F5] text-neutral-900 transition-[width,height,max-width] duration-300 will-change-transform ${_ ? `w-[calc(100vw-12px)] sm:w-[calc(100vw-36px)] h-[calc(100vh-76px)] sm:h-[calc(100vh-92px)] max-w-none mt-1 sm:mt-2 mb-16 sm:mb-18 rounded-2xl sm:rounded-xl` : `w-[calc(100vw-12px)] sm:${d} max-w-full sm:${f} h-[88vh] sm:h-auto sm:max-h-[85vh]`} ${p}`,
            children: [
              (0, H.jsx)(kc, {
                children:
                  (y === `minimizing` || y === `restoring`) &&
                  (0, H.jsx)(ku.div, {
                    initial: { opacity: 0 },
                    animate: { opacity: [0, 0.45, 0] },
                    exit: { opacity: 0 },
                    transition: { duration: 0.32, ease: `easeInOut` },
                    className: `absolute inset-0 bg-gradient-to-t from-amber-400/25 via-white/40 to-transparent pointer-events-none z-50 rounded-xl`,
                  }),
              }),
              (0, H.jsxs)(`div`, {
                dir: `ltr`,
                className: `h-11 sm:h-10 bg-[#F4F2EE] border-b border-black/10 flex items-center justify-between px-3 sm:px-3.5 cursor-grab active:cursor-grabbing select-none shrink-0`,
                onPointerDown: (e) => {
                  e.target.closest(`button`) || g.start(e);
                },
                onDoubleClick: T,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-2 sm:space-x-2 group py-1`,
                    children: [
                      (0, H.jsx)(`button`, {
                        onClick: ee,
                        className: `w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 flex items-center justify-center hover:opacity-90 active:scale-90 transition-all focus:outline-none cursor-pointer`,
                        title: `بستن پنجره (Close)`,
                        children: (0, H.jsx)(Vd, {
                          className: `w-2.5 h-2.5 sm:w-2 sm:h-2 text-black/70 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity`,
                        }),
                      }),
                      (0, H.jsx)(`button`, {
                        onClick: w,
                        className: `w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 flex items-center justify-center hover:opacity-90 active:scale-90 transition-all focus:outline-none cursor-pointer`,
                        title: `کوچک‌کردن با افکت جینی به داک (macOS Genie Minimize)`,
                        children: (0, H.jsx)(Sd, {
                          className: `w-2.5 h-2.5 sm:w-2 sm:h-2 text-black/70 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity`,
                        }),
                      }),
                      (0, H.jsx)(`button`, {
                        onClick: T,
                        className: `w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 flex items-center justify-center hover:opacity-90 active:scale-90 transition-all focus:outline-none cursor-pointer`,
                        title: _
                          ? `اندازه اصلی (Restore)`
                          : `تمام‌صفحه (Full Screen)`,
                        children: _
                          ? (0, H.jsx)(xd, {
                              className: `w-2 h-2 sm:w-1.5 sm:h-1.5 text-black/70 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity`,
                            })
                          : (0, H.jsx)(bd, {
                              className: `w-2 h-2 sm:w-1.5 sm:h-1.5 text-black/70 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity`,
                            }),
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex-1 text-center truncate px-2 sm:px-3`,
                    dir: `rtl`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-[12px] sm:text-[13px] font-bold text-neutral-800 tracking-tight font-sans`,
                        children: t,
                      }),
                      n &&
                        (0, H.jsxs)(`span`, {
                          className: `text-[11px] text-neutral-500 mr-2 hidden md:inline font-sans`,
                          children: [`— `, n],
                        }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-1.5 min-w-[44px] justify-end`,
                    children: [
                      m,
                      (0, H.jsxs)(`button`, {
                        onClick: ee,
                        className: `sm:hidden px-2.5 py-1 rounded-lg bg-neutral-200/90 hover:bg-neutral-300 text-[11px] font-bold text-neutral-800 flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs`,
                        children: [
                          (0, H.jsx)(Vd, {
                            className: `w-3.5 h-3.5 text-neutral-600`,
                          }),
                          (0, H.jsx)(`span`, { children: `بستن` }),
                        ],
                      }),
                      !m &&
                        (0, H.jsx)(`div`, { className: `w-3 hidden sm:block` }),
                    ],
                  }),
                ],
              }),
              (0, H.jsx)(`div`, {
                className: `flex-1 overflow-auto bg-white text-neutral-900 relative flex flex-col`,
                children: u,
              }),
            ],
          }),
        }),
        (0, H.jsx)(kc, {
          children:
            y === `minimized` &&
            (0, H.jsx)(ku.div, {
              initial: { opacity: 0, y: 28, scale: 0.72, filter: `blur(5px)` },
              animate: { opacity: 1, y: 0, scale: 1, filter: `blur(0px)` },
              exit: { opacity: 0, y: 20, scale: 0.75, filter: `blur(4px)` },
              transition: {
                type: `spring`,
                stiffness: 380,
                damping: 24,
                mass: 0.75,
              },
              className: `fixed bottom-18 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto`,
              style: { zIndex: c + 60 },
              children: (0, H.jsxs)(`button`, {
                onClick: te,
                className: `group px-4 py-2 rounded-2xl bg-white/95 hover:bg-white text-neutral-800 text-xs font-bold shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-neutral-300/80 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xl`,
                title: `کلیک برای بازگردانی پنجره با افکت جینی (Restore Window)`,
                children: [
                  (0, H.jsxs)(`span`, {
                    className: `relative flex h-2.5 w-2.5 shrink-0`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-xs`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`span`, {
                    className: `truncate max-w-[200px] sm:max-w-[280px] font-semibold text-neutral-900 font-sans text-right`,
                    dir: `rtl`,
                    children: t,
                  }),
                  (0, H.jsxs)(`span`, {
                    className: `text-[11px] font-medium text-neutral-600 flex items-center gap-1.5 bg-neutral-100 group-hover:bg-amber-100 group-hover:text-amber-900 px-2.5 py-1 rounded-full border border-neutral-200 transition-colors`,
                    children: [
                      (0, H.jsx)(Pd, {
                        className: `w-3 h-3 text-amber-500 animate-pulse`,
                      }),
                      (0, H.jsx)(`span`, { children: `بازگردانی جینی` }),
                    ],
                  }),
                ],
              }),
            }),
        }),
      ],
    });
  },
  Wd = [
    {
      id: `doc-brand-01`,
      folderId: `folder-track-1`,
      fileName: `01_سند_جامع_دکترین_و_اهمیت_برندسازی.doc`,
      fileExt: `DOC`,
      fileSize: `4.8 MB`,
      dateModified: `Aug 15`,
      title: `چرا برندسازی حیاتی‌ترین سرمایه‌گذاری یک بیزنس است؟`,
      subtitle: `دکترین، چرایی و متدولوژی ۴ مرحله‌ای هویت در Creativity Juice`,
      author: `دپارتمان معماری و هویت برند // استودیو Creativity Juice`,
      readTime: `زمان مطالعه: ۵ دقیقه`,
      category: `BRAND STRATEGY & IDENTITY`,
      glyph: `brand`,
      badgeColor: `#007AFF`,
      sections: [
        {
          heading: `۱. کالبدشکافی مفهوم برند: فراتر از لوگو و کارت ویزیت`,
          content: `بزرگ‌ترین خطای رایج در بازار، تقلیل دادن «برند» به یک نشان گرافیکی یا لوگوتایپ است. لوگو صرفاً یک امضاست؛ اما برند، ادراک، پرستیژ و اعتباری است که در غیاب شما در ذهن مخاطب، سرمایه‌گذار و بازار طنین‌انداز می‌شود. برند یک قرارداد روانی نانوشته با مشتری است که تعیین می‌کند آیا او حاضر است برای محصول شما احترام و ارزش قائل شود یا شما را با کالاهای دست‌چندم بازار مقایسه کند.`,
          callout: `«برند شما آن چیزی نیست که خودتان در تبلیغات می‌گویید؛ برند شما قضاوتی است که مخاطبان در خلوت خود درباره شما دارند.»`,
        },
        {
          heading: `۲. بیماری ترندزدگی: چرا ۹۰٪ برندها فراموش می‌شوند؟`,
          content: `در بازار امروز، اکثر کسب‌وکارها در تله‌ای مرگبار به نام «تقلید از ترندهای موقت» گرفتار می‌شوند. فونت‌های یک‌شکل، رنگ‌های تکراری و شعارهای بی‌معنی باعث شده که مخاطب نتواند برندها را از یکدیگر تشخیص دهد. وقتی تمایزی وجود نداشته باشد، مشتری تنها بر سر تخفیف بیشتر چانه می‌زند. برندسازی قدرتمند تنها ابزاری است که بیزنس را از تله رقابت فرسایشی خارج کرده و جایگاه رهبری به آن می‌بخشد.`,
          bullets: [
            `خروج دائمی از تله رقابت بر سر تخفیف و کاهش حاشیه سود`,
            `ایجاد پرستیژ و جایگاه ذهنی تسخیرناپذیر در میان رقبا`,
            `افزایش نرخ بقا و تبدیل خریداران عادی به مبلغان وفادار برند`,
          ],
        },
        {
          heading: `۳. روش‌شناسی ۴ مرحله‌ای هویت در Creativity Juice`,
          content: `در استودیوی ما هیچ هویتی بر اساس حدس، گمان یا سلیقه زودگذر خلق نمی‌شود. ما از یک فرآیند مهندسی‌شده و چندلایه ادیتوریال پیروی می‌کنیم:`,
          bullets: [
            `فاز اول // کشف DNA و کالبدشکافی کهن‌الگو (Discovery & Archetype): مصاحبه عمیق با بنیان‌گذاران، تعیین استعاره محوری و دشمن مشترک در صنف.`,
            `فاز دوم // مانیفست لحن و جهت‌گیری مفهومی (Tone of Voice & Narrative): تدوین مرام‌نامه کلمات مجاز، سبک بیان و شخصیت مستقل بیزنس.`,
            `فاز سوم // مهندسی سیستم جامع بصری (Visual Identity Architecture): طراحی لوگوتایپ اختصاصی، پالت متریال مهندسی‌شده، گریدبندی ادیتوریال و هندسه حروف.`,
            `فاز چهارم // کتابچه جامع مرجع و پاسداری از هویت (Brand Guidelines): بیش از ۱۲۰ صفحه مستندات فنی چاپی و دیجیتال برای هدایت تیم‌های آینده.`,
          ],
        },
        {
          heading: `۴. دستاورد نهایی برای کارفرما`,
          content: `با تکمیل فرآیند برندسازی، کسب‌وکار شما دارای یک ستون فقرات استوار می‌شود؛ سیستمی مستقل از افراد که در تمام نقاط تماس (از بسته‌بندی و وب‌سایت تا قراردادهای کلان تجاری) زبان یکپارچه وقار، اصالت و برتری را جاری می‌سازد.`,
          callout: `خروجی نهایی این دپارتمان یک دیزاین پایدار است؛ چیزی که ۱۰ سال بعد نیز همچنان فاخر، جسورانه و متمایز باقی خواهد ماند.`,
        },
      ],
    },
    {
      id: `doc-brand-02`,
      folderId: `folder-track-1`,
      fileName: `02_فرم_بریف_استراتژیک_هویت_برند.brief`,
      fileExt: `BRIEF`,
      fileSize: `3.2 MB`,
      dateModified: `Aug 20`,
      title: `پرسشنامه و بریف کشف هویت و دکترین برند`,
      subtitle: `فرم ساختاریافته تدوین فونداسیون استراتژیک، مخاطب هدف و افق تمایز`,
      author: `سامانه بریف استودیو // دپارتمان هویت برند`,
      readTime: `زمان تکمیل: ۴ دقیقه`,
      category: `INTAKE PROTOCOL`,
      glyph: `brief`,
      badgeColor: `#FF9500`,
      isBriefTrigger: !0,
      briefPrefill: `درخواست خدمات دپارتمان معماری و هویت برند (Brand Strategy & DNA)`,
      sections: [
        {
          heading: `راهنمای کارفرما جهت تکمیل بریف هویت برند`,
          content: `این بریف ابزاری استراتژیک برای شناخت بیزنس شما، چالش‌های رقابتی و جهان‌بینی برند است. پاسخ‌های شما مستقیماً توسط سرپرستان ارشد دپارتمان تحلیل شده و فونداسیون جلسه کشف را می‌سازد.`,
          callout: `جهت تکمیل مستقیم و ارسال الکترونیکی، روی دکمه «تکمیل و ثبت بریف آنلاین» در پایین این صفحه کلیک فرمایید.`,
        },
        {
          heading: `محورهای ۵ گانه پرسشنامه بریف هویت:`,
          content: `پرسشنامه شامل پنج بخش استاندارد بدون درگیری با مفاهیم پیچیده است:`,
          bullets: [
            `شناسنامه کسب‌وکار: نام برند، بازار هدف و نشانی وب‌سایت یا شبکه‌های فعال.`,
            `صورت‌مسئله در یک جمله: تعریف محصول یا خدمت به زبان ساده و قابل فهم.`,
            `جای خالی در بازار: ارزشی که در غیاب شما هیچ رقیب دیگری قادر به تأمین آن نیست.`,
            `دشمن مشترک: کلیشه‌ها و رفتارهای ناخوشایندی که برند شما علیه آن قیام کرده است.`,
            `خروجی‌های مورد انتظار: لوگوتایپ، سیستم تایپوگرافی، بسته‌بندی یا گایدلاین کامل.`,
          ],
        },
      ],
    },
    {
      id: `doc-brand-03`,
      folderId: `folder-track-1`,
      fileName: `03_دستورالعمل_گرید_بصری_و_تایپوگرافی.pdf`,
      fileExt: `PDF`,
      fileSize: `3.4 MB`,
      dateModified: `Oct 04`,
      title: `دستورالعمل جامع گریدبندی ادیتوریال و تایپوگرافی`,
      subtitle: `قواعد ریاضیاتی فواصل، هارمونی حروف فارسی و انگلیسی و دیزاین سیستم`,
      author: `آتلیه تایپوگرافی // Creativity Juice`,
      readTime: `زمان مطالعه: ۴ دقیقه`,
      category: `TYPOGRAPHY & GRIDS`,
      glyph: `ruler`,
      badgeColor: `#FF3B30`,
      sections: [
        {
          heading: `اصول معماری تایپوگرافی در استودیو`,
          content: `تایپوگرافی صدای خاموش متن است. در پروژه‌های استودیو، هماهنگی وزن، زاویه کرسی و فواصل حروف فارسی با خطوط لاتین بر پایه یک گرید اختصاصی ۱۲ ستونه تنظیم می‌شود تا هیچ گسست بصری در اسناد دو زبانه حس نشود.`,
          bullets: [
            `تنظیم دقیق نسبت‌های طلایی در سلسله‌مراتب تیترها و متون بدنه`,
            `طراحی پترن‌ها و ساختارهای شبکه‌ای ادیتوریال هماهنگ با چاپ و صفحه دیجیتال`,
            `قواعد حاشیه‌گذاری و فضای منفی جهت خلق پرستیژ بصری آرامش‌بخش`,
          ],
        },
      ],
    },
    {
      id: `doc-content-01`,
      folderId: `folder-track-2`,
      fileName: `01_سند_جامع_استانداردهای_تولید_محتوا_و_سینما.doc`,
      fileExt: `DOC`,
      fileSize: `5.2 MB`,
      dateModified: `Sep 02`,
      title: `تولید محتوای ادیتوریال، فشن و سینمای تبلیغاتی`,
      subtitle: `کالبدشکافی استانداردهای پروداکشن، سناریونویسی و ویدیوهای پرستیژ استودیو`,
      author: `دپارتمان سینما و آرت‌دایرکشن // Creativity Juice`,
      readTime: `زمان مطالعه: ۵ دقیقه`,
      category: `CINEMA & CONTENT PRODUCTION`,
      glyph: `cinema`,
      badgeColor: `#AF52DE`,
      sections: [
        {
          heading: `۱. تفاوت محتوای ادیتوریال با بلاگری‌های بازاری`,
          content: `شبکه‌های اجتماعی سرشار از ویدیوهای تکراری، بلاگری‌های سطحی و تیزرهای پر سر و صدای تلویزیونی هستند که به محض تمام شدن فراموش می‌شوند. نگرش استودیو Creativity Juice در نقطه مقابل این رویکرد قرار دارد: ما تصویر تجاری را به زبان «سینما و ادیتوریال» ترجمه می‌کنیم. هر فریم از ویدیوهای ما باید مثل یک عکس مجله ووگ یا صحنه‌ای از یک فیلم بلند سینمایی دارای استایل، داستان و اتمسفر باشد.`,
          callout: `«اگر ویدیوی برند شما بتواند بدون صدا هم مخاطب را مجذوب زیبایی و وقار خود کند، به استاندارد سینمایی دست یافته‌اید.»`,
        },
        {
          heading: `۲. چرا برندهای فاخر به زبان تصویر سینمایی نیاز دارند؟`,
          content: `مشتریان هوشمند با تیزرهای معمولی قانع نمی‌شوند؛ آن‌ها در پی لمس حس برتری، کیفیت ساخت و جهان زیبایی‌شناختی محصول هستند. یک فیلم تبلیغاتی خوب، کاتالوگ فروش نیست؛ بیانیه‌ای تصویری است که جایگاه رفیع برند را به رخ بازار می‌کشد.`,
          bullets: [
            `ایجاد کشش روانی و جاذبه حسی نسبت به متریال و طراحی محصول`,
            `خلق پرستیژ بصری ماندگار که حتی پس از سال‌ها ارزش آرشیوی دارد`,
            `ایجاد تمایز قاطع در پلتفرم‌های اجتماعی با کاهش نرخ رد شدن ویدیو (Skip Rate)`,
          ],
        },
        {
          heading: `۳. فرآیند ۵ مرحله‌ای پروداکشن استودیو`,
          content: `فرآیند تولید ویدیو در استودیو از نخستین واژه سناریو تا تحویل مستر نهایی تحت نظارت دقیق سرپرستان پیش می‌رود:`,
          bullets: [
            `فاز اول // سناریونویسی سینمایی و استوری‌بورد (Screenwriting & Storyboard): خلق زاویه دید غیرمنتظره، استعاره‌های داستانی و شات‌لیست دقیق.`,
            `فاز دوم // کستینگ و مکان‌یابی معماری (Casting & Location Scouting): انتخاب مدل‌ها و فضاهای معماری که حامل اتمسفر واقعی برند باشند.`,
            `فاز سوم // روز فیلمبرداری با تجهیزات استاندارد 4K/ProRes: نورپردازی هایپررئال ادیتوریال، مدیریت لنزهای سینمایی و حرکت دوربین پویا.`,
            `فاز چهارم // تدوین ریتم‌محور و اصلاح رنگ سینمایی (Editorial Cut & Color Grading): هماهنگ‌سازی کنتراست و تنالیته رنگ با پالت هویت برند.`,
            `فاز پنجم // طراحی صدا و موسیقی متن اختصاصی (Foley & Audio Mastery): عمق‌بخشی به فضا با اصوات واقع‌گرایانه و تم اختصاصی.`,
          ],
        },
        {
          heading: `۴. فرمت‌های اجرایی قابل ارائه`,
          content: `ما پکیج‌های متنوعی متناسب با نیاز برندها ارائه می‌دهیم: از تیزرهای لانچ محدود (Hero Films) و مستندسازی روند خلق معماری، تا ریتینرهای محتوای پیوسته که صفحه اجتماعی شما را به یک نشریه زنده باوقار بدل می‌سازد.`,
        },
      ],
    },
    {
      id: `doc-content-02`,
      folderId: `folder-track-2`,
      fileName: `02_فرم_بریف_تولید_محتوا_و_ویدیو.brief`,
      fileExt: `BRIEF`,
      fileSize: `3.1 MB`,
      dateModified: `Sep 10`,
      title: `پرسشنامه و بریف تخصصی تولید محتوا و رسانه`,
      subtitle: `سند کشف نیازمندی‌های ویدیویی، فرمت‌های پروداکشن و اهداف دیده‌شدن`,
      author: `سامانه بریف استودیو // دپارتمان محتوا و سینما`,
      readTime: `زمان تکمیل: ۴ دقیقه`,
      category: `INTAKE PROTOCOL`,
      glyph: `brief`,
      badgeColor: `#FF9500`,
      isBriefTrigger: !0,
      briefPrefill: `درخواست خدمات دپارتمان تولید محتوا و فیلم‌های تجاری (Commercial & Visual Films)`,
      sections: [
        {
          heading: `راهنمای ثبت بریف تولید محتوا`,
          content: `برای رسیدن به بالاترین کیفیت تولید، نیازمند آگاهی از گلوگاه فعلی دیده‌شدن برند، فرمت مدنظر شما و احساسی هستیم که می‌خواهید مخاطب پس از تماشای ویدیو تجربه کند.`,
          callout: `جهت تکمیل مستقیم و ارسال الکترونیکی، روی دکمه «تکمیل و ثبت بریف آنلاین» در پایین این صفحه کلیک فرمایید.`,
        },
        {
          heading: `محورهای کلیدی این پرسشنامه:`,
          content: `بررسی نیازهای ویدئویی از منظر کارگردانی:`,
          bullets: [
            `گلوگاه دیده‌شدن: مشکل ترافیک، عدم اعتماد به پرستیژ، یا لیدهای کم‌کیفیت.`,
            `فرمت خروجی مورد انتظار: فیلم تبلیغاتی لانچ، ریتینر ویدیویی، یا مستندسازی معماری.`,
            `خطوط قرمز زیبایی‌شناختی: چه کارهایی در صنف شما انجام می‌شود که از آن متنفرید.`,
            `مراجع تحسین‌شده: ۲ یا ۳ فیلم یا ویدیوی شاخص جهانی که سلیقه آن را تحسین می‌کنید.`,
          ],
        },
      ],
    },
    {
      id: `doc-content-03`,
      folderId: `folder-track-2`,
      fileName: `03_چک_لیست_روز_فیلمبرداری_و_پروداکشن.md`,
      fileExt: `MD`,
      fileSize: `840 KB`,
      dateModified: `Oct 08`,
      title: `چک‌لیست استانداردهای فیلمبرداری و مدیریت صحنه`,
      subtitle: `پروتکل پیش‌تولید، نورپردازی، صدا و مسترینگ نهایی استودیو`,
      author: `تیم پروداکشن سینمایی // Creativity Juice`,
      readTime: `زمان مطالعه: ۳ دقیقه`,
      category: `PRODUCTION CHECKLIST`,
      glyph: `cinema`,
      badgeColor: `#30B0C7`,
      sections: [
        {
          heading: `استانداردهای پروداکشن در روز فیلمبرداری`,
          content: `تمام مراحل صحنه بر اساس یک برنامه‌ریزی زمان‌بندی‌شده (Call Sheet) اداره می‌شود تا بالاترین بهره‌وری از نور طبیعی و تمرکز بازیگران و تیم حاصل گردد.`,
          bullets: [
            `تطبیق فریم‌ها با استوری‌بورد و شات‌لیست مصوب کارفرما`,
            `مانیتورینگ لایو رنگ و نور توسط آرت‌دایرکتور در لوکیشن`,
            `ثبت هم‌زمان صداهای محیطی و کلوزآپ‌های بافت متریال`,
          ],
        },
      ],
    },
    {
      id: `doc-team-01`,
      folderId: `folder-manifesto`,
      fileName: `01_بیانیه_برند_و_مانیفست_Creativity_Juice.doc`,
      fileExt: `DOC`,
      fileSize: `4.8 MB`,
      dateModified: `Aug 15`,
      title: `مانیفست بنیادین و جهان‌بینی استودیو Creativity Juice`,
      subtitle: `داستان پیدایش استودیو، سه اصل ضد کلیشه و جهان مستقل ما`,
      author: `شورای عالی خلاقیت // استودیو Creativity Juice`,
      readTime: `زمان مطالعه: ۵ دقیقه`,
      category: `STUDIO MANIFESTO`,
      glyph: `scroll`,
      badgeColor: `#007AFF`,
      sections: [
        {
          heading: `۱. داستان پیدایش استودیو: پناهگاهی در برابر ابتذال`,
          content: `استودیو Creativity Juice نه یک شرکت تبلیغاتی پیمانکاری معمولی، بلکه یک جریان مستقل ادیتوریال است که از خستگی عمیق نسبت به خروجی‌های شبیه به هم، تکراری و بی‌هویت آژانس‌های مرسوم زاده شد. ما باور داریم که هر برند شاخص، شایسته خلق یک دنیای سینمایی، باوقار و اصیل است؛ دنیایی که به جای التماس برای توجه، با پرستیژ خود نگاه‌ها را خیره کند.`,
          callout: `«ما با مشتریانی همکاری می‌کنیم که شهامت متفاوت بودن دارند و ترجیح می‌دهند یک اثر ماندگار خلق کنند تا یک آگهی فراموش‌شدنی.»`,
        },
        {
          heading: `۲. سه اصل ضد کلیشه در استودیو`,
          content: `اصول سه‌گانه زیر در تمام خطوط طراحی، سناریونویسی و تصمیمات استراتژیک استودیو بدون هیچ‌گونه مصالحه‌ای جاری است:`,
          bullets: [
            `اصل اول // تکینگی فرم و فرمول‌گریزی (Singularity of Form): هیچ قالبی از پیش آماده وجود ندارد. ما مخالف بسته‌های آماده و پکیج‌های فرمولی هستیم؛ هر برند روحی مستقل دارد و باید کالبدی منحصر به فرد برای آن تراشیده شود.`,
            `اصل دوم // ارجحیت وقار ادیتوریال بر هیاهوی سخیف (Quiet Editorial Dignity): قدرت در داد زدن نیست، بلکه در اصالت لحن و عمق زیبایی‌شناسی است. برندهای لوکس و ماندگار تاریخ هرگز التماس نمی‌کنند؛ آنها مجذوب می‌کنند.`,
            `اصل سوم // ساخت جهان منسجم نه یک تصویر منفرد (World-Building Cohesion): هویت بصری، کلمات، فیلم‌ها و وب‌سایت باید مانند قطعات یک پازل بی‌نقص در کنار هم قرار گیرند تا مخاطب احساس کند وارد یک جهان مستقل شده است.`,
          ],
        },
        {
          heading: `۳. مدل همکاری: شراکت استراتژیک به جای کارفرمایی و پیمانکاری`,
          content: `ما خود را امانت‌دار و سنگربان ارزش برند شما می‌دانیم. ارتباط ما با پروژه‌ها یک رابطه مکانیکی فروش خدمت نیست، بلکه شراکتی نزدیک و متعهدانه در بالاترین سطوح تصمیم‌گیری برای تضمین ماندگاری نام برند در تاریخ بازار است.`,
        },
      ],
    },
    {
      id: `doc-team-02`,
      folderId: `folder-manifesto`,
      fileName: `02_معرفی_اعضای_تیم_و_سرپرستان_ارشد.doc`,
      fileExt: `DOC`,
      fileSize: `3.6 MB`,
      dateModified: `Sep 10`,
      title: `پرونده معرفی سرپرستان ارشد دپارتمان‌های استودیو`,
      subtitle: `کارنامه حرفه‌ای، تخصص‌ها و فلسفه ۵ لیدر استودیو در راهبری پروژه‌ها`,
      author: `هیئت راهبری // Creativity Juice`,
      readTime: `زمان مطالعه: ۴ دقیقه`,
      category: `LEADERSHIP DOSSIER`,
      glyph: `team`,
      badgeColor: `#007AFF`,
      sections: [
        {
          heading: `ساختار فرماندهی و سرپرستی پروژه‌ها`,
          content: `در استودیو Creativity Juice، هر پرونده توسط ۵ سرپرست ارشد هدایت و کنترل کیفی می‌شود تا از یکپارچگی استراتژی، بصری و اجرایی اطمینان حاصل گردد:`,
          bullets: [
            `۱. سرپرست ارشد هویت و معماری برند: هدایت کالبدشکافی جایگاه، استعاره محوری، تایپوگرافی اختصاصی و کتابچه راهنما.`,
            `۲. سرپرست ارشد کارگردانی و تولید محتوای سینمایی: نگارش سناریو، استوری‌بورد، کارگردانی میدانی و نظارت بر مسترینگ فیلم‌ها.`,
            `۳. سرپرست ارشد مارکتینگ و استراتژی کمپین: تدوین نقشه‌راه لانچ، مهندسی رسانه، اینفلوئنسر سیدینگ و فعال‌سازی‌های بین‌رشته‌ای.`,
            `۴. سرپرست ارشد تکنولوژی و تجارب تعاملی وب ۳بعدی: معماری تجارب وب، شیدرهای سه‌بعدی و نوآوری‌های دیجیتال تعاملی.`,
            `۵. مدیر هماهنگی ارشد و ارتباط با کارفرما: پایش ددلاین‌ها، همگام‌سازی تصمیمات اتاق فکر و پشتیبانی اختصاصی از کارفرمایان.`,
          ],
        },
        {
          heading: `تعهد حرفه‌ای تیم`,
          content: `تیم استودیو به صورت متمرکز و با ظرفیت محدود پروژه می‌پذیرد تا کیفیت و توجه شخصی به تک‌تک جزئیات در بالاترین سطح ممکن باقی بماند.`,
        },
      ],
    },
    {
      id: `doc-team-03`,
      folderId: `folder-manifesto`,
      fileName: `03_فرم_بریف_استعلام_همکاری_با_تیم.brief`,
      fileExt: `BRIEF`,
      fileSize: `2.9 MB`,
      dateModified: `Sep 15`,
      title: `پرسشنامه و بریف استعلام همکاری با استودیو`,
      subtitle: `فرم درخواست جلسه اولیه کشف، عارضه‌یابی و مشاوره با سرپرستان ارشد`,
      author: `سامانه بریف استودیو // دبیرخانه همکاری‌ها`,
      readTime: `زمان تکمیل: ۴ دقیقه`,
      category: `INTAKE PROTOCOL`,
      glyph: `brief`,
      badgeColor: `#FF9500`,
      isBriefTrigger: !0,
      briefPrefill: `درخواست جلسه استراتژیک کشف و بررسی همکاری با سرپرستان ارشد دپارتمان‌ها`,
      sections: [
        {
          heading: `راهنمای ثبت درخواست همکاری با تیم`,
          content: `این فرم برای کسب‌وکارهایی طراحی شده که مایلند پیش از آغاز هر پروژه، چالش‌های کلیدی برند خود را در یک جلسه فشرده عارضه‌یابی با حضور سرپرستان ارشد به بحث بگذارند.`,
          callout: `جهت تکمیل مستقیم و ارسال الکترونیکی، روی دکمه «تکمیل و ثبت بریف آنلاین» در پایین این صفحه کلیک فرمایید.`,
        },
      ],
    },
    {
      id: `doc-proj-01`,
      folderId: `folder-projects`,
      fileName: `01_پرونده_آرکا_معماری_معاصر.case`,
      fileExt: `CASE`,
      fileSize: `38.5 MB`,
      dateModified: `2025`,
      title: `پرونده آرکا // بازآفرینی هویت و مستندسازی سینمایی معماری`,
      subtitle: `ری‌برندینگ کامل، معماری تایپوگرافی دوزبانه و فیلم معرفی کالکشن`,
      author: `دپارتمان پرونده‌های شاخص // استودیو Creativity Juice`,
      readTime: `زمان مطالعه: ۴ دقیقه`,
      category: `CASE STUDY // ARCHITECTURE`,
      glyph: `case`,
      badgeColor: `#FF9500`,
      sections: [
        {
          heading: `۱. چالش کارفرما و صورت‌مسئله`,
          content: `استودیو معماری آرکا با بیش از یک دهه سابقه در پروژه‌های مسکونی لوکس، دارای هویت بصری سنتی و نامنسجمی بود که توان رقابت با برندهای بین‌المللی معماری را نداشت. زبان بصری قدیمی، عدم وجود گایدلاین و فیلم‌های غیرحرفه‌ای، اعتبار پروژه‌های عظیم آن‌ها را در نگاه سرمایه‌گذاران زیر سؤال برده بود.`,
        },
        {
          heading: `۲. استراتژی اتخاذ شده توسط استودیو`,
          content: `ما با بازتعریف استعاره محوری برند حول مفهوم «هندسه سکوت و بتن صیقلی»، هویت آرکا را از پایه بازطراحی کردیم. طراحی لوگوتایپ مینیمال مونوکروم، تایپوگرافی اختصاصی و یک فیلم سینمایی ۴ دقیقه‌ای از ویلاهای لواسان و نیاوران با اصلاح رنگ سینمایی و موسیقی اختصاصی پیانو، جایگاه آرکا را دگرگون ساخت.`,
          bullets: [
            `طراحی سیستم لوگوتایپ اختصاصی و نماد مونوکروم برداری`,
            `تدوین کتابچه راهنمای جامع برند (Brand Book) در ۱۴۰ صفحه`,
            `کارگردانی فیلم سینمایی معرفی استودیو با دوربین‌های 4K و نورپردازی طبیعی`,
            `طراحی وب‌سایت ادیتوریال تعاملی با گالری‌های مینیمال تمام‌صفحه`,
          ],
        },
        {
          heading: `۳. دستاوردها و خروجی تجاری`,
          content: `پروژه آرکا به عنوان یکی از برترین پروژه‌های سال در نشریات معماری شناخته شد و به جذب پروژه‌های شاخص ویلایی در کمتر از سه ماه انجامید.`,
        },
      ],
    },
    {
      id: `doc-proj-02`,
      folderId: `folder-projects`,
      fileName: `02_پرونده_اورا_مد_و_پوشاک_فاخر.case`,
      fileExt: `CASE`,
      fileSize: `42.1 MB`,
      dateModified: `2025`,
      title: `پرونده خانه مد اورا // کمپین فصلی و هویت بصری پرستیژ`,
      subtitle: `استراتژی دی‌ان‌ای، آرت‌دایرکشن فشن‌فیلم و پکیجینگ لوکس محصولات`,
      author: `دپارتمان پرونده‌های شاخص // استودیو Creativity Juice`,
      readTime: `زمان مطالعه: ۴ دقیقه`,
      category: `CASE STUDY // FASHION`,
      glyph: `case`,
      badgeColor: `#FF9500`,
      sections: [
        {
          heading: `۱. کالبدشکافی چالش برند`,
          content: `خانه مد اورا نیازمند خروج از الگوهای رایج مزون‌های داخلی و ورود مقتدرانه به رده اوت‌کوتور (Haute Couture) و پوشاک فاخر با پرستیژ جهانی بود. آن‌ها نیازمند داستانی فراتر از پارچه و دوخت بودند.`,
        },
        {
          heading: `۲. راهکار Creativity Juice`,
          content: `خلق مانیفست «وقار در سایه‌ها»، طراحی بسته‌بندی‌های لوکس با کاغذهای بافت‌دار وارداتی و کارگردانی فشن‌فیلم با حضور مدل‌های بین‌المللی در کاخ‌های تاریخی، اورا را به نامی بی‌رقیب در صحنه مد فاخر بدل کرد.`,
        },
      ],
    },
    {
      id: `doc-proj-03`,
      folderId: `folder-projects`,
      fileName: `03_پرونده_سولاریس_پلتفرم_فناوری.case`,
      fileExt: `CASE`,
      fileSize: `31.8 MB`,
      dateModified: `2025`,
      title: `پرونده پلتفرم سولاریس // برندینگ نوآور و تجارب وب سه‌بعدی`,
      subtitle: `دیزاین سیستم جامع، شیدرهای تعاملی WebGL و زبان هویت فین‌تک`,
      author: `دپارتمان پرونده‌های شاخص // استودیو Creativity Juice`,
      readTime: `زمان مطالعه: ۳ دقیقه`,
      category: `CASE STUDY // TECH & FINTECH`,
      glyph: `case`,
      badgeColor: `#FF9500`,
      sections: [
        {
          heading: `۱. صورت‌مسئله`,
          content: `سولاریس پلتفرمی فناورانه در حوزه فین‌تک و دارایی‌های دیجیتال بود که به دلیل رابط کاربری پیچیده و هویت نامفهوم، در جلب اعتماد سرمایه‌گذاران سنتی با مقاومت روبرو می‌شد.`,
        },
        {
          heading: `۲. راهکار استودیو`,
          content: `بازآفرینی کامل هویت با دیزاین سیستم مینیمال، تایپوگرافی فنی فوق‌دقیق و پیاده‌سازی تجربه کاربری سه‌بعدی تعاملی که پیچیده‌ترین نمودارهای مالی را با روانی و وقار بصری به نمایش می‌گذارد.`,
        },
      ],
    },
  ],
  Gd = ({
    document: e,
    onClose: t,
    onSaveDocument: n,
    onResetDocument: r,
    onDeleteDocument: i,
    onOpenBriefWithPrefill: a,
  }) => {
    let [o, s] = (0, S.useState)(!1),
      [c, l] = (0, S.useState)(!1),
      [u, d] = (0, S.useState)(!1),
      [f, p] = (0, S.useState)(e.title),
      [m, h] = (0, S.useState)(e.subtitle),
      [g, _] = (0, S.useState)(e.sections),
      v = () => {
        W.playPop();
        let t = `${e.title}\n${e.subtitle}\n\n`;
        (e.sections.forEach((e, n) => {
          ((t += `[${n + 1}] ${e.heading}\n${e.content}\n`),
            e.callout && (t += `نکته: ${e.callout}\n`),
            e.bullets &&
              e.bullets.forEach((e) => {
                t += `• ${e}\n`;
              }),
            (t += `
`));
        }),
          navigator.clipboard &&
            (navigator.clipboard.writeText(t),
            l(!0),
            setTimeout(() => l(!1), 2e3)));
      },
      y = (t) => {
        (t.preventDefault(),
          W.playWindowOpen(),
          n({
            ...e,
            title: f,
            subtitle: m,
            sections: g,
            dateModified: `Updated`,
          }),
          s(!1),
          d(!0),
          setTimeout(() => d(!1), 3e3));
      },
      b = () => {
        (W.playClick(), r(e.id), s(!1));
      },
      x = () => {
        (addToTrash({
          originalId: e.id,
          title: e.fileName || e.title,
          type: `document`,
          source: `اسناد استودیو`,
          summary: e.description || e.subtitle,
          size: e.fileSize,
          data: e,
        }),
        W.playTrash(),
        i && i(e.id),
        t());
      };
    return (0, H.jsx)(`div`, {
      className: `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm select-none`,
      children: (0, H.jsxs)(`div`, {
        dir: `ltr`,
        className: `w-full max-w-4xl bg-[#FAF9F6] rounded-2xl border border-neutral-300 shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[88vh] animate-window-pop text-neutral-900 font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `h-11 bg-[#F4F2EE] border-b border-neutral-200 flex items-center justify-between px-3 sm:px-4 select-none shrink-0`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center space-x-2`,
                children: [
                  (0, H.jsx)(`button`, {
                    onClick: () => {
                      (W.playWindowClose(), t());
                    },
                    className: `w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 flex items-center justify-center hover:opacity-90 active:scale-90 transition-all cursor-pointer`,
                    title: `بستن سند`,
                    children: (0, H.jsx)(Vd, {
                      className: `w-2.5 h-2.5 sm:w-2 sm:h-2 text-black/70`,
                    }),
                  }),
                  (0, H.jsx)(`span`, {
                    className: `w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 hidden sm:inline-block opacity-60`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 hidden sm:inline-block opacity-60`,
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `flex items-center space-x-2 truncate px-2 sm:px-3 text-xs font-mono font-bold text-neutral-700`,
                children: [
                  (0, H.jsx)(`span`, { children: `📄` }),
                  (0, H.jsx)(`span`, {
                    className: `truncate max-w-[130px] sm:max-w-none`,
                    children: e.fileName,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-neutral-800 hidden sm:inline`,
                    children: e.fileExt,
                  }),
                ],
              }),
              (0, H.jsx)(`div`, {
                className: `flex items-center space-x-1.5 sm:space-x-2`,
                children: o
                  ? (0, H.jsxs)(`div`, {
                      className: `flex items-center space-x-1.5 sm:space-x-2`,
                      children: [
                        (0, H.jsxs)(`button`, {
                          type: `button`,
                          onClick: x,
                          className: `px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-700 flex items-center gap-1 transition-colors cursor-pointer shadow-xs`,
                          title: `پاک کردن و حذف دائمی این سند از فولدر`,
                          children: [
                            (0, H.jsx)(Id, {
                              className: `w-3 h-3 text-red-600`,
                            }),
                            (0, H.jsx)(`span`, { children: `پاک کردن سند` }),
                          ],
                        }),
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300`,
                          children: `ویرایش فعال است`,
                        }),
                      ],
                    })
                  : (0, H.jsxs)(H.Fragment, {
                      children: [
                        (0, H.jsx)(`button`, {
                          onClick: v,
                          className: `px-2 sm:px-2.5 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-[11px] font-bold text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer shadow-xs`,
                          title: `کپی متن کامل سند`,
                          children: c
                            ? (0, H.jsxs)(H.Fragment, {
                                children: [
                                  (0, H.jsx)(X, {
                                    className: `w-3 h-3 text-emerald-600`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `hidden sm:inline`,
                                    children: `کپی شد`,
                                  }),
                                ],
                              })
                            : (0, H.jsxs)(H.Fragment, {
                                children: [
                                  (0, H.jsx)(od, {
                                    className: `w-3 h-3 text-neutral-600`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `hidden sm:inline`,
                                    children: `کپی متن`,
                                  }),
                                ],
                              }),
                        }),
                        (0, H.jsxs)(`button`, {
                          onClick: () => {
                            (W.playClick(), s(!0));
                          },
                          className: `px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-100/80 hover:bg-amber-200/80 text-[11px] font-black text-amber-900 flex items-center gap-1 transition-colors cursor-pointer shadow-xs`,
                          title: `ویرایش متن سند`,
                          children: [
                            (0, H.jsx)(wd, {
                              className: `w-3 h-3 text-amber-800`,
                            }),
                            (0, H.jsx)(`span`, { children: `ویرایش ✏️` }),
                          ],
                        }),
                        (0, H.jsx)(`button`, {
                          onClick: t,
                          className: `sm:hidden px-2 py-1 rounded-lg bg-neutral-200/80 text-[11px] font-bold text-neutral-700 flex items-center gap-1 cursor-pointer`,
                          children: (0, H.jsx)(Vd, { className: `w-3 h-3` }),
                        }),
                      ],
                    }),
              }),
            ],
          }),
          u &&
            (0, H.jsxs)(`div`, {
              className: `bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2`,
              dir: `rtl`,
              children: [
                (0, H.jsx)(X, { className: `w-3.5 h-3.5` }),
                (0, H.jsx)(`span`, {
                  children: `تغییرات شما در این سند با موفقیت ذخیره و به‌روزرسانی شد.`,
                }),
              ],
            }),
          (0, H.jsx)(`div`, {
            className: `flex-1 overflow-y-auto p-4 sm:p-10 bg-white text-right`,
            dir: `rtl`,
            children: o
              ? (0, H.jsxs)(`form`, {
                  onSubmit: y,
                  className: `max-w-3xl mx-auto space-y-6`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `border-b border-neutral-200 pb-4`,
                      children: [
                        (0, H.jsxs)(`h3`, {
                          className: `text-lg font-black text-neutral-900`,
                          children: [`ویرایش متن سند: `, e.fileName],
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs text-neutral-500 mt-1`,
                          children: `می‌توانید تیترها، توضیحات و سرفصل‌های این سند را به صورت مستقیم تغییر دهید. تغییرات شما ذخیره خواهد شد.`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-bold text-neutral-800 mb-1`,
                          children: `عنوان اصلی سند:`,
                        }),
                        (0, H.jsx)(`input`, {
                          type: `text`,
                          required: !0,
                          value: f,
                          onChange: (e) => p(e.target.value),
                          className: `w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm font-bold text-neutral-900 outline-none`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-bold text-neutral-800 mb-1`,
                          children: `زیرعنوان و شعار سند:`,
                        }),
                        (0, H.jsx)(`input`, {
                          type: `text`,
                          value: m,
                          onChange: (e) => h(e.target.value),
                          className: `w-full px-4 py-2 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs text-neutral-700 outline-none`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `space-y-6 pt-3`,
                      children: [
                        (0, H.jsxs)(`span`, {
                          className: `block text-xs font-black text-neutral-800 uppercase tracking-wider font-mono`,
                          children: [
                            `بخش‌ها و پاراگراف‌های سند (`,
                            g.length,
                            ` بخش)`,
                          ],
                        }),
                        g.map((e, t) =>
                          (0, H.jsxs)(
                            `div`,
                            {
                              className: `p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-3`,
                              children: [
                                (0, H.jsxs)(`div`, {
                                  children: [
                                    (0, H.jsxs)(`label`, {
                                      className: `block text-xs font-bold text-neutral-700 mb-1`,
                                      children: [`تیتر بخش `, t + 1, `:`],
                                    }),
                                    (0, H.jsx)(`input`, {
                                      type: `text`,
                                      value: e.heading,
                                      onChange: (e) => {
                                        let n = [...g];
                                        ((n[t].heading = e.target.value), _(n));
                                      },
                                      className: `w-full px-3 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-900 bg-white`,
                                    }),
                                  ],
                                }),
                                (0, H.jsxs)(`div`, {
                                  children: [
                                    (0, H.jsx)(`label`, {
                                      className: `block text-xs font-bold text-neutral-700 mb-1`,
                                      children: `متن و توضیحات:`,
                                    }),
                                    (0, H.jsx)(`textarea`, {
                                      rows: 4,
                                      value: e.content,
                                      onChange: (e) => {
                                        let n = [...g];
                                        ((n[t].content = e.target.value), _(n));
                                      },
                                      className: `w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-xs text-neutral-800 leading-relaxed bg-white`,
                                    }),
                                  ],
                                }),
                                e.callout &&
                                  (0, H.jsxs)(`div`, {
                                    children: [
                                      (0, H.jsx)(`label`, {
                                        className: `block text-xs font-bold text-amber-800 mb-1`,
                                        children: `متن نقل‌قول یا کادر شاخص:`,
                                      }),
                                      (0, H.jsx)(`input`, {
                                        type: `text`,
                                        value: e.callout,
                                        onChange: (e) => {
                                          let n = [...g];
                                          ((n[t].callout = e.target.value),
                                            _(n));
                                        },
                                        className: `w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs text-amber-900 bg-amber-50`,
                                      }),
                                    ],
                                  }),
                              ],
                            },
                            t,
                          ),
                        ),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex flex-wrap items-center gap-2`,
                          children: [
                            (0, H.jsx)(`button`, {
                              type: `button`,
                              onClick: () => s(!1),
                              className: `px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer`,
                              children: `انصراف`,
                            }),
                            (0, H.jsxs)(`button`, {
                              type: `button`,
                              onClick: b,
                              className: `px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer`,
                              title: `بازنشانی متن به نسخه اولیه استودیو`,
                              children: [
                                (0, H.jsx)(Od, { className: `w-3 h-3` }),
                                (0, H.jsx)(`span`, {
                                  children: `بازنشانی به پیش‌فرض`,
                                }),
                              ],
                            }),
                            (0, H.jsxs)(`button`, {
                              type: `button`,
                              onClick: x,
                              className: `px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs active:scale-95`,
                              title: `پاک کردن و حذف دائمی این سند از فولدر`,
                              children: [
                                (0, H.jsx)(Id, { className: `w-3.5 h-3.5` }),
                                (0, H.jsx)(`span`, {
                                  children: `پاک کردن سند 🗑️`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, H.jsxs)(`button`, {
                          type: `submit`,
                          className: `px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-transform`,
                          children: [
                            (0, H.jsx)(kd, {
                              className: `w-3.5 h-3.5 text-amber-300`,
                            }),
                            (0, H.jsx)(`span`, {
                              children: `ذخیره تغییرات سند 💾`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                })
              : (0, H.jsxs)(`article`, {
                  className: `max-w-3xl mx-auto space-y-8 select-text`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `border-b border-neutral-200 pb-6 space-y-3`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex items-center justify-between text-xs font-mono text-neutral-500`,
                          dir: `ltr`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-800 uppercase tracking-wider text-[10px]`,
                              children: e.category,
                            }),
                            (0, H.jsxs)(`span`, {
                              children: [e.readTime, ` • `, e.fileSize],
                            }),
                          ],
                        }),
                        (0, H.jsx)(`h1`, {
                          className: `text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 tracking-tight leading-tight`,
                          children: e.title,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed`,
                          children: e.subtitle,
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `pt-2 text-[11px] text-neutral-400 font-mono flex items-center justify-between border-t border-neutral-100`,
                          children: [
                            (0, H.jsx)(`span`, { children: e.author }),
                            (0, H.jsxs)(`span`, {
                              children: [`آخرین ویرایش: `, e.dateModified],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `space-y-8 text-neutral-800 text-sm sm:text-[15px] leading-loose`,
                      children: e.sections.map((e, t) =>
                        (0, H.jsxs)(
                          `section`,
                          {
                            className: `space-y-3.5`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900 tracking-tight border-r-4 border-r-amber-500 pr-3`,
                                children: e.heading,
                              }),
                              (0, H.jsx)(`p`, {
                                className: `text-neutral-700 leading-relaxed font-normal text-justify`,
                                children: e.content,
                              }),
                              e.callout &&
                                (0, H.jsx)(`div`, {
                                  className: `p-4 rounded-xl bg-amber-500/10 border-r-4 border-r-amber-500 text-amber-950 font-medium text-xs sm:text-sm leading-relaxed my-3`,
                                  children: e.callout,
                                }),
                              e.bullets &&
                                e.bullets.length > 0 &&
                                (0, H.jsx)(`div`, {
                                  className: `space-y-2 pr-2 pt-1`,
                                  children: e.bullets.map((e, t) =>
                                    (0, H.jsxs)(
                                      `div`,
                                      {
                                        className: `flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800`,
                                        children: [
                                          (0, H.jsx)(`span`, {
                                            className: `w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0`,
                                          }),
                                          (0, H.jsx)(`span`, {
                                            className: `leading-relaxed`,
                                            children: e,
                                          }),
                                        ],
                                      },
                                      t,
                                    ),
                                  ),
                                }),
                            ],
                          },
                          t,
                        ),
                      ),
                    }),
                    e.isBriefTrigger &&
                      (0, H.jsxs)(`div`, {
                        className: `p-6 rounded-2xl bg-neutral-900 text-white space-y-3 text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl my-6`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            children: [
                              (0, H.jsxs)(`h3`, {
                                className: `font-black text-base flex items-center justify-center sm:justify-start gap-2`,
                                children: [
                                  (0, H.jsx)(Pd, {
                                    className: `w-4 h-4 text-amber-400`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `آماده ثبت پروژه و هماهنگی جلسه کشف هستید؟`,
                                  }),
                                ],
                              }),
                              (0, H.jsx)(`p`, {
                                className: `text-xs text-neutral-400 mt-1`,
                                children: `پرسشنامه کشف پروژه و تدوین بریف را با تمرکز بر اولویت‌های تجاری پر کنید.`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`button`, {
                            onClick: () => {
                              (W.playWindowOpen(),
                                t(),
                                a && a(e.briefPrefill || e.title));
                            },
                            className: `px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0 active:scale-95`,
                            children: [
                              (0, H.jsx)(jd, { className: `w-3.5 h-3.5` }),
                              (0, H.jsx)(`span`, {
                                children: `تکمیل و ثبت بریف آنلاین 🚀`,
                              }),
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
          }),
          (0, H.jsxs)(`div`, {
            className: `h-10 bg-[#FAF9F7] border-t border-neutral-200 px-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 select-none shrink-0`,
            dir: `ltr`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, H.jsx)(q, { className: `w-3.5 h-3.5 text-neutral-400` }),
                  (0, H.jsx)(`span`, {
                    children: `Creativity Juice // Document Architecture`,
                  }),
                ],
              }),
              (0, H.jsx)(`div`, {
                className: `flex items-center gap-3`,
                children: (0, H.jsx)(`button`, {
                  onClick: () => {
                    (W.playClick(), t());
                  },
                  className: `text-neutral-700 hover:text-black font-bold cursor-pointer`,
                  children: `بستن پنجره (Esc)`,
                }),
              }),
            ],
          }),
        ],
      }),
    });
  },
  Kd = `cj_studio_documents`,
  qd = ({
    initialFolderId: e,
    onClose: t,
    zIndex: n,
    onFocus: r,
    containerRef: i,
    onOpenBriefWithService: a,
    onOpenManifesto: o,
    onOpenCalculator: s,
    onOpenProject: cp,
  }) => {
    let [c, l] = (0, S.useState)(e),
      [u, d] = (0, S.useState)(`grid`),
      [f, p] = (0, S.useState)(``),
      [m, h] = (0, S.useState)(``),
      [g, _] = (0, S.useState)(null),
      [v, y] = (0, S.useState)(!1),
      [b, x] = (0, S.useState)(``),
      [C, ee] = (0, S.useState)(``),
      [w, te] = (0, S.useState)(``),
      [T, E] = (0, S.useState)(() => {
        try {
          let e = localStorage.getItem(Kd);
          if (e) return JSON.parse(e);
        } catch {}
        return Wd;
      }),
      D = (e) => {
        E(e);
        try {
          localStorage.setItem(Kd, JSON.stringify(e));
        } catch {}
      },
      ne = (e) => {
        let t = T.map((t) => (t.id === e.id ? e : t));
        (D(t), _(e));
      },
      re = (e) => {
        let t = Wd.find((t) => t.id === e);
        if (t) {
          let n = T.map((n) => (n.id === e ? t : n));
          (D(n), _(t));
        }
      },
      ie = (e) => {
        W.playTrash();
        let t = T.filter((t) => t.id !== e);
        (D(t), _(null), m === e && h(``));
      },
      ae = Au.map((folder) => ({
        id: folder.id,
        name: folder.nameEn || folder.name,
        nameFa: folder.name,
        iconType: folder.iconType === `manifesto` ? `dossier` : folder.iconType,
      })),
      oe = () => {
        if (c === `folder-projects`) {
          let projects = cf();
          return projects.map((proj, idx) => ({
            id: `proj-${proj.id}`,
            folderId: `folder-projects`,
            name: `${String(idx + 1).padStart(2, '0')}_${(proj.title || 'پرونده').replace(/\s+/g, '_')}.case`,
            size: `${(28 + (idx * 3.4)).toFixed(1)} MB`,
            date: proj.year || `۱۴۰۳`,
            badge: `CASE`,
            glyphType: `case`,
            titleFa: proj.title,
            subtitleFa: proj.subtitle,
            description: proj.description || `${proj.title} • ${proj.client}`,
            author: proj.client || `استودیو Creativity Juice`,
            readTime: `زمان مطالعه: ۳ دقیقه`,
            category: proj.categoryLabel || proj.category || `CASE STUDY`,
            deliverables:
              Array.isArray(proj.deliverables) && proj.deliverables.length > 0
                ? proj.deliverables
                : [`استراتژی و هویت`, `مستند ادیتوریال`],
            isBriefTrigger: !1,
            projectData: proj,
          }));
        }
        return T.filter((e) => e.folderId === c).map((e) => {
          let t = e.sections.flatMap((e) => e.bullets || []);
          return {
            id: e.id,
            folderId: e.folderId,
            name: e.fileName,
            size: e.fileSize,
            date: e.dateModified,
            badge: e.fileExt,
            glyphType: e.glyph,
            titleFa: e.title,
            subtitleFa: e.subtitle,
            description:
              e.sections[0]?.content || `سند رسمی استودیو Creativity Juice.`,
            author: e.author,
            readTime: e.readTime,
            category: e.category,
            deliverables:
              t.length > 0
                ? t.slice(0, 4)
                : [`مستند ادیتوریال تدوین‌شده`, `فایل رسمی استودیو`],
            isBriefTrigger: e.isBriefTrigger,
            briefPrefill: e.briefPrefill,
            fullDoc: e,
          };
        });
      },
      O = ae.find((e) => e.id === c) || ae[0],
      se = oe().filter((e) => {
        if (!f.trim()) return !0;
        let t = f.toLowerCase();
        return (
          e.name.toLowerCase().includes(t) ||
          e.titleFa.toLowerCase().includes(t) ||
          e.description.toLowerCase().includes(t)
        );
      });
    (0, S.useEffect)(() => {
      se.length > 0 && !se.some((e) => e.id === m) && h(se[0].id);
    }, [c, se]);
    let k = se.find((e) => e.id === m) || se[0],
      ce = (e) => {
        (W.playClick(), l(e), h(``));
      },
      le = (e) => {
        (W.playClick(), h(e.id));
      },
      A = (e) => {
        W.playWindowOpen();
        if (e.projectData && cp) {
          cp(e.projectData);
        } else if (e.glyphType === `brief` && a) {
          a(e.briefPrefill || e.titleFa);
        } else if (e.fullDoc) {
          _(e.fullDoc);
        }
      },
      ue = () => {
        k && A(k);
      },
      de = (e) => {
        if ((e.preventDefault(), !b.trim())) return;
        W.playPop();
        let t = b.includes(`.`) ? b.split(`.`).pop()?.toUpperCase() : `DOC`,
          n = b.trim().includes(`.`) ? b.trim() : `${b.trim()}.doc`,
          r = {
            id: `doc-custom-${Date.now()}`,
            folderId: c,
            fileName: n,
            fileExt: [`DOC`, `PDF`, `KEY`, `MD`, `CASE`, `BRIEF`].includes(
              t || ``,
            )
              ? t
              : `DOC`,
            fileSize: `1.2 MB`,
            dateModified: `Today`,
            title: C.trim() || n.replace(/\.[^/.]+$/, ``),
            subtitle: `سند اختصاصی تدوین‌شده توسط کارفرما یا تیم`,
            author: `کارفرما // استودیو Creativity Juice`,
            readTime: `زمان مطالعه: ۳ دقیقه`,
            category: `CUSTOM DOSSIER`,
            glyph: `scroll`,
            badgeColor: `#007AFF`,
            sections: [
              {
                heading: `۱. صورت‌جلسه و اهداف این سند`,
                content:
                  w.trim() ||
                  `این سند برای تکمیل پرونده پروژه به این فولدر اضافه شده است. برای ویرایش کامل روی دکمه ویرایش کلیک کنید.`,
                callout: `شما می‌توانید هر زمان خواستید این سند را ویرایش کرده یا بخش‌های جدید به آن اضافه نمایید.`,
              },
            ],
          },
          i = [...T, r];
        (D(i), x(``), ee(``), te(``), y(!1), h(r.id), _(r));
      },
      fe = (e) => {
        let t = {
          PDF: { bg: `#FF3B30`, text: `#ffffff` },
          DOC: { bg: `#007AFF`, text: `#ffffff` },
          KEY: { bg: `#FF9500`, text: `#ffffff` },
          MD: { bg: `#30B0C7`, text: `#ffffff` },
          AI: { bg: `#FF8400`, text: `#ffffff` },
          IND: { bg: `#E03E6C`, text: `#ffffff` },
          MOV: { bg: `#AF52DE`, text: `#ffffff` },
          APP: { bg: `#5856D6`, text: `#ffffff` },
          CASE: { bg: `#10B981`, text: `#ffffff` },
          BRIEF: { bg: `#F59E0B`, text: `#ffffff` },
        }[e.badge] || { bg: `#FF3B30`, text: `#ffffff` };
        return (0, H.jsxs)(`div`, {
          className: `relative w-16 h-20 mx-auto select-none group-hover:scale-105 transition-transform shrink-0`,
          children: [
            (0, H.jsxs)(`div`, {
              className: `w-full h-full bg-white rounded-lg border border-neutral-300 shadow-[0_4px_12px_rgba(0,0,0,0.08)] relative overflow-hidden flex flex-col justify-center items-center`,
              children: [
                (0, H.jsx)(`div`, {
                  className: `absolute top-0 right-0 w-4 h-4 bg-neutral-200 border-b border-l border-neutral-300 rounded-bl`,
                }),
                (0, H.jsx)(`div`, {
                  className: `w-8 h-0.5 bg-neutral-200 rounded-full mb-1 mt-2`,
                }),
                (0, H.jsx)(`div`, {
                  className: `w-10 h-0.5 bg-neutral-200 rounded-full mb-2`,
                }),
                (0, H.jsxs)(`div`, {
                  className: `my-auto text-xl`,
                  children: [
                    e.glyphType === `scroll` && `📜`,
                    e.glyphType === `ruler` && `📐`,
                    e.glyphType === `team` && `👥`,
                    e.glyphType === `chart` && `📊`,
                    e.glyphType === `cinema` && `🎬`,
                    e.glyphType === `code` && `🧮`,
                    e.glyphType === `brand` && `💎`,
                    e.glyphType === `brief` && `🚀`,
                    e.glyphType === `case` && `🏛️`,
                  ],
                }),
                (0, H.jsx)(`div`, {
                  className: `w-10 h-0.5 bg-neutral-100 rounded-full mb-3`,
                }),
              ],
            }),
            (0, H.jsx)(`div`, {
              className: `absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-black tracking-tight shadow-md border border-white`,
              style: { backgroundColor: t.bg, color: t.text },
              children: e.badge,
            }),
          ],
        });
      };
    return (0, H.jsx)(Ud, {
      id: `folder-${O.id}`,
      title: `📁 ${O.name} — ${O.nameFa}  (${se.length} سند)`,
      onClose: t,
      zIndex: n,
      onFocus: r,
      containerRef: i,
      width: `w-[96vw] sm:w-[94vw] md:w-[90vw] lg:w-[86vw] xl:w-[80vw]`,
      maxWidth: `max-w-6xl`,
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col flex-1 h-full min-h-[560px] bg-white text-neutral-900 select-none font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            dir: `ltr`,
            className: `px-4 py-2.5 bg-[#FAF9F7] border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs select-none shrink-0`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center space-x-2 text-neutral-600 font-medium truncate`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-500`,
                    children: `Creativity Juice`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-400`,
                    children: `/`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-500`,
                    children: `Dossiers`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-400`,
                    children: `/`,
                  }),
                  (0, H.jsxs)(`span`, {
                    className: `text-neutral-900 font-bold flex items-center gap-1.5`,
                    dir: `rtl`,
                    children: [
                      (0, H.jsx)(dd, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, { children: O.nameFa }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `flex items-center space-x-2.5`,
                children: [
                  k &&
                    (0, H.jsxs)(`button`, {
                      onClick: ue,
                      className: `px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs`,
                      children: [
                        (0, H.jsx)(q, {
                          className: `w-3.5 h-3.5 text-amber-700`,
                        }),
                        (0, H.jsx)(`span`, { children: `مطالعه / ویرایش سند` }),
                      ],
                    }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (W.playPop(), y(!0));
                    },
                    className: `px-2.5 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors`,
                    children: [
                      (0, H.jsx)(Td, { className: `w-3 h-3 text-neutral-700` }),
                      (0, H.jsx)(`span`, { children: `افزودن سند` }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex bg-neutral-200/80 rounded-lg p-0.5 border border-neutral-300/80`,
                    children: [
                      (0, H.jsx)(`button`, {
                        onClick: () => {
                          (W.playClick(), d(`grid`));
                        },
                        className: `p-1 rounded cursor-pointer ${u === `grid` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-600 hover:text-black`}`,
                        title: `Grid View`,
                        children: (0, H.jsx)(gd, { className: `w-3.5 h-3.5` }),
                      }),
                      (0, H.jsx)(`button`, {
                        onClick: () => {
                          (W.playClick(), d(`list`));
                        },
                        className: `p-1 rounded cursor-pointer ${u === `list` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-600 hover:text-black`}`,
                        title: `List View`,
                        children: (0, H.jsx)(_d, { className: `w-3.5 h-3.5` }),
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `relative`,
                    children: [
                      (0, H.jsx)(`input`, {
                        type: `text`,
                        value: f,
                        onChange: (e) => p(e.target.value),
                        placeholder: `جستجو در اسناد...`,
                        className: `w-32 sm:w-44 bg-white border border-neutral-300 rounded-lg pl-7 pr-2.5 py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-700 text-right`,
                        dir: `rtl`,
                      }),
                      (0, H.jsx)(Ad, {
                        className: `w-3.5 h-3.5 absolute left-2 top-2 text-neutral-400 pointer-events-none`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `flex-1 flex overflow-hidden`,
            children: [
              (0, H.jsxs)(`div`, {
                dir: `ltr`,
                className: `hidden md:flex w-48 sm:w-56 bg-[#F6F5F2] border-r border-neutral-200 p-3.5 shrink-0 flex-col justify-between select-none overflow-y-auto`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `space-y-5`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        children: [
                          (0, H.jsx)(`span`, {
                            className: `block text-[11px] font-mono font-bold tracking-wider text-neutral-400 uppercase mb-2`,
                            children: `FOLDERS & DOSSIERS`,
                          }),
                          (0, H.jsx)(`div`, {
                            className: `space-y-1`,
                            children: ae.map((e) => {
                              let t = c === e.id;
                              return (0, H.jsx)(
                                `button`,
                                {
                                  onClick: () => ce(e.id),
                                  className: `w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${t ? `bg-[#FDE68A]/75 text-neutral-900 font-bold shadow-xs` : `text-neutral-700 hover:bg-neutral-200/60`}`,
                                  children: (0, H.jsxs)(`div`, {
                                    className: `flex items-center gap-2 truncate`,
                                    children: [
                                      (0, H.jsx)(`img`, {
                                        src: `/assets/aistudio/folder-icon-mac-png-23_a819e89f.png`,
                                        alt: ``,
                                        className: `w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]`,
                                      }),
                                      (0, H.jsx)(`span`, {
                                        className: `truncate`,
                                        children: e.name,
                                      }),
                                    ],
                                  }),
                                },
                                e.id,
                              );
                            }),
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        children: [
                          (0, H.jsx)(`span`, {
                            className: `block text-[11px] font-mono font-bold tracking-wider text-neutral-400 uppercase mb-2`,
                            children: `STATUS TAGS`,
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5 text-xs text-neutral-600 font-medium`,
                            children: [
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center gap-2 px-1`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `w-2.5 h-2.5 rounded-full bg-emerald-500`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `تأییدشده و فعال`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center gap-2 px-1`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `w-2.5 h-2.5 rounded-full bg-blue-500`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `قابل ویرایش زنده`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center gap-2 px-1`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `w-2.5 h-2.5 rounded-full bg-amber-500`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `متصل به سامانه بریف`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, H.jsx)(`div`, {
                    className: `pt-4 border-t border-neutral-200`,
                    children: (0, H.jsxs)(`button`, {
                      onClick: () => {
                        o && o();
                      },
                      className: `w-full py-1.5 px-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 text-[11px] font-bold text-neutral-800 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer`,
                      children: [
                        (0, H.jsx)(`span`, { children: `دکترین استودیو` }),
                        (0, H.jsx)(`span`, {
                          className: `text-[10px] text-neutral-400 font-mono`,
                          children: `⌘M`,
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `flex-1 flex flex-col overflow-hidden bg-white`,
                children: [
                  (0, H.jsx)(`div`, {
                    className: `md:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F6F5F2] border-b border-neutral-200 overflow-x-auto shrink-0 select-none`,
                    dir: `rtl`,
                    children: ae.map((e) => {
                      let t = c === e.id;
                      return (0, H.jsx)(
                        `button`,
                        {
                          onClick: () => ce(e.id),
                          className: `px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${t ? `bg-neutral-900 text-white shadow-xs` : `bg-white border border-neutral-200 text-neutral-700`}`,
                          children: (0, H.jsxs)(`span`, {
                            className: `flex items-center gap-1.5`,
                            children: [
                              (0, H.jsx)(`img`, {
                                src: `/assets/aistudio/folder-icon-mac-png-23_a819e89f.png`,
                                alt: ``,
                                className: `w-3.5 h-3.5 object-contain`,
                              }),
                              e.nameFa,
                            ],
                          }),
                        },
                        e.id,
                      );
                    }),
                  }),
                  (0, H.jsx)(`div`, {
                    className: `flex-1 overflow-y-auto p-4 sm:p-6`,
                    children:
                      se.length === 0
                        ? (0, H.jsxs)(`div`, {
                            className: `h-64 flex flex-col items-center justify-center text-center text-neutral-400`,
                            children: [
                              (0, H.jsx)(Ad, {
                                className: `w-8 h-8 opacity-40 mb-2`,
                              }),
                              (0, H.jsx)(`p`, {
                                className: `text-xs`,
                                children: `هیچ سندی مطابق با عبارت جستجو پیدا نشد.`,
                              }),
                            ],
                          })
                        : u === `grid`
                          ? (0, H.jsx)(`div`, {
                              className: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`,
                              children: se.map((e) => {
                                let t = m === e.id;
                                return (0, H.jsxs)(
                                  `div`,
                                  {
                                    onClick: () => {
                                      (le(e), window.innerWidth < 768 && A(e));
                                    },
                                    onDoubleClick: () => A(e),
                                    className: `group cursor-pointer select-none transition-all flex flex-col items-center p-3.5 rounded-2xl text-center ${t ? `bg-[#FFF9EE] border border-[#FDE68A] shadow-xs ring-2 ring-[#FDE68A]` : `border border-neutral-200/60 sm:border-transparent hover:bg-neutral-50 bg-white sm:bg-transparent shadow-xs sm:shadow-none`}`,
                                    children: [
                                      fe(e),
                                      (0, H.jsx)(`span`, {
                                        className: `mt-3 text-xs font-bold text-neutral-900 group-hover:text-amber-900 line-clamp-2 leading-tight max-w-[160px] break-all font-mono`,
                                        dir: `ltr`,
                                        title: e.name,
                                        children: e.name,
                                      }),
                                      (0, H.jsx)(`span`, {
                                        className: `mt-1 text-xs text-neutral-700 font-bold line-clamp-1 max-w-[200px]`,
                                        children: e.titleFa,
                                      }),
                                      (0, H.jsxs)(`span`, {
                                        className: `mt-1 text-[10px] font-mono text-neutral-400`,
                                        dir: `ltr`,
                                        children: [e.size, ` • `, e.date],
                                      }),
                                      (0, H.jsx)(`div`, {
                                        className: `mt-2.5 w-full flex items-center justify-center gap-1.5 sm:hidden`,
                                        children: (0, H.jsxs)(`button`, {
                                          type: `button`,
                                          onClick: (t) => {
                                            (t.stopPropagation(), A(e));
                                          },
                                          className: `w-full py-1.5 px-2 rounded-xl bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer`,
                                          children: [
                                            (0, H.jsx)(q, {
                                              className: `w-3 h-3 text-amber-300`,
                                            }),
                                            (0, H.jsx)(`span`, {
                                              children: `مطالعه سند`,
                                            }),
                                          ],
                                        }),
                                      }),
                                    ],
                                  },
                                  e.id,
                                );
                              }),
                            })
                          : (0, H.jsx)(`div`, {
                              className: `border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-xs`,
                              children: (0, H.jsxs)(`table`, {
                                className: `w-full text-right text-xs`,
                                dir: `rtl`,
                                children: [
                                  (0, H.jsx)(`thead`, {
                                    className: `bg-[#FAF9F7] text-neutral-600 font-bold border-b border-neutral-200`,
                                    children: (0, H.jsxs)(`tr`, {
                                      children: [
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-4 text-right`,
                                          children: `نام فایل`,
                                        }),
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-3`,
                                          children: `عنوان سند`,
                                        }),
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-3`,
                                          children: `فرمت`,
                                        }),
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-3`,
                                          children: `حجم`,
                                        }),
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-3`,
                                          children: `تاریخ`,
                                        }),
                                        (0, H.jsx)(`th`, {
                                          className: `py-2.5 px-3 text-left`,
                                          children: `عملیات`,
                                        }),
                                      ],
                                    }),
                                  }),
                                  (0, H.jsx)(`tbody`, {
                                    className: `divide-y divide-neutral-150`,
                                    children: se.map((e) => {
                                      let t = m === e.id;
                                      return (0, H.jsxs)(
                                        `tr`,
                                        {
                                          onClick: () => le(e),
                                          onDoubleClick: () => A(e),
                                          className: `cursor-pointer transition-colors ${t ? `bg-[#FFF9EE] font-bold text-neutral-900` : `hover:bg-neutral-50 text-neutral-800`}`,
                                          children: [
                                            (0, H.jsxs)(`td`, {
                                              className: `py-2.5 px-4 flex items-center gap-2.5 text-right font-medium`,
                                              children: [
                                                (0, H.jsx)(`span`, {
                                                  className: `text-base`,
                                                  children: `📄`,
                                                }),
                                                (0, H.jsx)(`span`, {
                                                  className: `font-mono text-xs`,
                                                  dir: `ltr`,
                                                  children: e.name,
                                                }),
                                              ],
                                            }),
                                            (0, H.jsx)(`td`, {
                                              className: `py-2.5 px-3 font-medium text-neutral-800`,
                                              children: e.titleFa,
                                            }),
                                            (0, H.jsx)(`td`, {
                                              className: `py-2.5 px-3 font-mono text-[10px]`,
                                              children: (0, H.jsx)(`span`, {
                                                className: `px-1.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 font-bold`,
                                                children: e.badge,
                                              }),
                                            }),
                                            (0, H.jsx)(`td`, {
                                              className: `py-2.5 px-3 font-mono text-[11px] text-neutral-500`,
                                              children: e.size,
                                            }),
                                            (0, H.jsx)(`td`, {
                                              className: `py-2.5 px-3 font-mono text-[11px] text-neutral-500`,
                                              children: e.date,
                                            }),
                                            (0, H.jsx)(`td`, {
                                              className: `py-2.5 px-3 text-left`,
                                              children: (0, H.jsx)(`button`, {
                                                onClick: (t) => {
                                                  (t.stopPropagation(), A(e));
                                                },
                                                className: `px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold text-neutral-700 cursor-pointer`,
                                                children: `مطالعه`,
                                              }),
                                            }),
                                          ],
                                        },
                                        e.id,
                                      );
                                    }),
                                  }),
                                ],
                              }),
                            }),
                  }),
                  (0, H.jsxs)(`div`, {
                    dir: `ltr`,
                    className: `h-8 bg-[#FAF9F7] border-t border-neutral-200 px-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 select-none shrink-0`,
                    children: [
                      (0, H.jsx)(`div`, {
                        children: `42.8 GB free \xA0\xA0 Macintosh HD`,
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `truncate max-w-[500px]`,
                        children: [
                          se.length,
                          ` items loaded \xA0•\xA0`,
                          (0, H.jsx)(`span`, {
                            className: `text-neutral-500 font-sans`,
                            children: `برای مطالعه و ویرایش هر سند دو بار کلیک کنید`,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              k &&
                (0, H.jsxs)(`div`, {
                  dir: `rtl`,
                  className: `hidden lg:flex w-72 sm:w-80 border-r border-neutral-200 bg-[#FAF9F6] p-4 flex-col justify-between overflow-y-auto shrink-0 select-none text-right font-sans`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `space-y-4`,
                      children: [
                        (0, H.jsx)(`div`, {
                          className: `py-2 flex justify-center`,
                          children: fe(k),
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `border-b border-neutral-200 pb-3`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-[10px] font-mono font-bold text-neutral-400 block mb-1`,
                              dir: `ltr`,
                              children: k.name,
                            }),
                            (0, H.jsx)(`h3`, {
                              className: `text-sm font-black text-neutral-900 leading-snug`,
                              children: k.titleFa,
                            }),
                            k.subtitleFa &&
                              (0, H.jsx)(`p`, {
                                className: `text-xs text-neutral-500 mt-1 leading-relaxed`,
                                children: k.subtitleFa,
                              }),
                          ],
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `space-y-2 text-xs`,
                          children: [
                            k.readTime &&
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center justify-between text-neutral-600`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `text-neutral-400 font-medium`,
                                    children: `زمان مطالعه:`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `font-bold text-neutral-800`,
                                    children: k.readTime,
                                  }),
                                ],
                              }),
                            k.author &&
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center justify-between text-neutral-600`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `text-neutral-400 font-medium`,
                                    children: `مرجع تدوین:`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `font-bold text-neutral-800 truncate max-w-[180px]`,
                                    children: k.author,
                                  }),
                                ],
                              }),
                            (0, H.jsxs)(`div`, {
                              className: `flex items-center justify-between text-neutral-600`,
                              children: [
                                (0, H.jsx)(`span`, {
                                  className: `text-neutral-400 font-medium`,
                                  children: `وضعیت سند:`,
                                }),
                                (0, H.jsx)(`span`, {
                                  className: `font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200`,
                                  children: `تأییدشده و قابل ویرایش`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `p-3 rounded-xl bg-white border border-neutral-200 space-y-2`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-[11px] font-bold text-neutral-800 block`,
                              children: `خلاصه محتوای سند:`,
                            }),
                            (0, H.jsx)(`p`, {
                              className: `text-xs text-neutral-600 leading-relaxed font-normal`,
                              children: k.description,
                            }),
                          ],
                        }),
                        k.deliverables &&
                          k.deliverables.length > 0 &&
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`span`, {
                                className: `text-[11px] font-bold text-neutral-700 block`,
                                children: `خروجی‌ها و سرفصل‌ها:`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `space-y-1`,
                                children: k.deliverables
                                  .slice(0, 3)
                                  .map((e, t) =>
                                    (0, H.jsxs)(
                                      `div`,
                                      {
                                        className: `flex items-start gap-1.5 text-xs text-neutral-700`,
                                        children: [
                                          (0, H.jsx)(rd, {
                                            className: `w-3.5 h-3.5 text-neutral-800 shrink-0 mt-0.5`,
                                          }),
                                          (0, H.jsx)(`span`, {
                                            className: `line-clamp-2`,
                                            children: e,
                                          }),
                                        ],
                                      },
                                      t,
                                    ),
                                  ),
                              }),
                            ],
                          }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-4 space-y-2 border-t border-neutral-200`,
                      children: [
                        (0, H.jsxs)(`button`, {
                          type: `button`,
                          onClick: ue,
                          className: `w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-98`,
                          children: [
                            (0, H.jsx)(q, {
                              className: `w-3.5 h-3.5 text-amber-300`,
                            }),
                            (0, H.jsx)(`span`, {
                              children: `مطالعه و ویرایش کامل سند 📖`,
                            }),
                          ],
                        }),
                        a &&
                          (0, H.jsxs)(`button`, {
                            type: `button`,
                            onClick: () => {
                              (W.playWindowOpen(),
                                a(k.briefPrefill || k.titleFa));
                            },
                            className: `w-full py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98`,
                            children: [
                              (0, H.jsx)(jd, {
                                className: `w-3.5 h-3.5 text-neutral-600`,
                              }),
                              (0, H.jsx)(`span`, {
                                children: `تنظیم بریف بر اساس این سند 🚀`,
                              }),
                            ],
                          }),
                        k.fullDoc &&
                          (0, H.jsxs)(`button`, {
                            type: `button`,
                            onClick: () => {
                              window.confirm(
                                `آیا از پاک کردن سند «${k.name}» اطمینان دارید؟`,
                              ) && ie(k.id);
                            },
                            className: `w-full py-1.5 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors`,
                            title: `پاک کردن این سند از فولدر`,
                            children: [
                              (0, H.jsx)(Id, { className: `w-3.5 h-3.5` }),
                              (0, H.jsx)(`span`, {
                                children: `پاک کردن این سند از فولدر`,
                              }),
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
          g &&
            (0, H.jsx)(Gd, {
              document: g,
              onClose: () => _(null),
              onSaveDocument: ne,
              onResetDocument: re,
              onDeleteDocument: ie,
              onOpenBriefWithPrefill: (e) => {
                (_(null), a && a(e));
              },
            }),
          v &&
            (0, H.jsx)(`div`, {
              className: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs`,
              children: (0, H.jsxs)(`form`, {
                onSubmit: de,
                className: `bg-white rounded-2xl border border-neutral-300 shadow-2xl max-w-md w-full p-6 space-y-4 text-right font-sans animate-window-pop`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center justify-between border-b border-neutral-200 pb-3`,
                    children: [
                      (0, H.jsx)(`button`, {
                        type: `button`,
                        onClick: () => y(!1),
                        className: `p-1 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer`,
                        children: (0, H.jsx)(Vd, { className: `w-4 h-4` }),
                      }),
                      (0, H.jsx)(`h3`, {
                        className: `font-black text-sm text-neutral-900`,
                        children: `افزودن سند جدید به این فولدر`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`label`, {
                        className: `block text-xs font-bold text-neutral-800 mb-1`,
                        children: `نام فایل و پسوند (مثال: 04_قرارداد_همکاری.doc):`,
                      }),
                      (0, H.jsx)(`input`, {
                        type: `text`,
                        required: !0,
                        value: b,
                        onChange: (e) => x(e.target.value),
                        placeholder: `04_سند_راهبردی.doc`,
                        className: `w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-mono text-left focus:outline-none focus:border-neutral-900`,
                        dir: `ltr`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`label`, {
                        className: `block text-xs font-bold text-neutral-800 mb-1`,
                        children: `عنوان فارسی سند:`,
                      }),
                      (0, H.jsx)(`input`, {
                        type: `text`,
                        required: !0,
                        value: C,
                        onChange: (e) => ee(e.target.value),
                        placeholder: `مثال: دستورالعمل اجرایی اختصاصی`,
                        className: `w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-neutral-900`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`label`, {
                        className: `block text-xs font-bold text-neutral-800 mb-1`,
                        children: `متن و توضیحات اولیه سند:`,
                      }),
                      (0, H.jsx)(`textarea`, {
                        rows: 3,
                        value: w,
                        onChange: (e) => te(e.target.value),
                        placeholder: `شرح اهداف، ساختار و محتوای این سند...`,
                        className: `w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-neutral-900 resize-none`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `pt-2 flex items-center justify-end gap-2 border-t border-neutral-100`,
                    children: [
                      (0, H.jsx)(`button`, {
                        type: `button`,
                        onClick: () => y(!1),
                        className: `px-3 py-1.5 rounded-lg border border-neutral-300 text-xs text-neutral-600 hover:bg-neutral-50 cursor-pointer`,
                        children: `انصراف`,
                      }),
                      (0, H.jsx)(`button`, {
                        type: `submit`,
                        className: `px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold cursor-pointer shadow-xs`,
                        children: `ایجاد و بازگشایی سند`,
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      }),
    });
  },
  Jd = ({
    project: e,
    onClose: t,
    zIndex: n,
    onFocus: r,
    onNextProject: i,
    onPrevProject: a,
    containerRef: o,
    onRequestSimilarProject: s,
    onEditProject: c,
  }) =>
    (0, H.jsx)(Ud, {
      id: `project-${e.id}`,
      title: `مطالعه پرونده: ${e.title}`,
      subtitle: `${e.category} • ${e.client}`,
      onClose: t,
      zIndex: n,
      onFocus: r,
      containerRef: o,
      width: `w-[96vw] sm:w-[88vw] md:w-[78vw] lg:w-[68vw]`,
      maxWidth: `max-w-4xl`,
      headerRightContent: (0, H.jsxs)(`div`, {
        className: `flex items-center space-x-1.5 space-x-reverse`,
        dir: `ltr`,
        children: [
          c &&
            (0, H.jsxs)(`button`, {
              onClick: (t) => {
                (t.stopPropagation(), W.playClick(), c(e));
              },
              className: `px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors`,
              title: `ویرایش و بازنویسی این پرونده`,
              children: [
                (0, H.jsx)(wd, { className: `w-3 h-3 text-amber-700` }),
                (0, H.jsx)(`span`, { children: `ویرایش` }),
              ],
            }),
          (0, H.jsxs)(`div`, {
            className: `flex items-center border border-neutral-300 rounded-md overflow-hidden bg-white`,
            children: [
              (0, H.jsx)(`button`, {
                onClick: (e) => {
                  (e.stopPropagation(), W.playClick(), a());
                },
                className: `p-1 hover:bg-neutral-100 transition-colors text-neutral-600 focus:outline-none cursor-pointer`,
                title: `پرونده قبلی`,
                children: (0, H.jsx)(ed, { className: `w-3.5 h-3.5` }),
              }),
              (0, H.jsx)(`div`, { className: `w-px h-3.5 bg-neutral-200` }),
              (0, H.jsx)(`button`, {
                onClick: (e) => {
                  (e.stopPropagation(), W.playClick(), i());
                },
                className: `p-1 hover:bg-neutral-100 transition-colors text-neutral-600 focus:outline-none cursor-pointer`,
                title: `پرونده بعدی`,
                children: (0, H.jsx)(td, { className: `w-3.5 h-3.5` }),
              }),
            ],
          }),
        ],
      }),
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col bg-white text-right font-sans select-none`,
        dir: `rtl`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `relative w-full bg-[#0d0d0f] overflow-hidden flex items-center justify-center border-b border-black/10 group min-h-[280px] sm:min-h-[340px] max-h-[58vh]`,
            children: [
              (0, H.jsx)(`img`, {
                src: e.highResImage || e.coverImage,
                alt: e.title,
                className: `w-full h-auto max-h-[58vh] object-cover sm:object-contain transition-transform duration-500 group-hover:scale-[1.01]`,
              }),
              (0, H.jsx)(`div`, {
                className: `absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none`,
              }),
              e.metrics &&
                (0, H.jsx)(`div`, {
                  className: `absolute bottom-3 right-4 left-4 sm:left-auto z-10`,
                  children: (0, H.jsxs)(`div`, {
                    className: `px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-xl`,
                    children: [
                      (0, H.jsx)(Ld, {
                        className: `w-3.5 h-3.5 text-amber-400 shrink-0`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `truncate`,
                        children: e.metrics,
                      }),
                    ],
                  }),
                }),
              (0, H.jsxs)(`div`, {
                className: `absolute top-3 right-3 flex items-center gap-1.5 z-10`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold border border-white/10`,
                    children: e.year,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/10`,
                    children: e.category,
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 sm:p-7 space-y-6 bg-[#FAF9F7]`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-neutral-200 pb-4`,
                children: [
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`div`, {
                        className: `flex items-center gap-2 mb-1.5`,
                        children: (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full`,
                          children: e.deptTrack,
                        }),
                      }),
                      (0, H.jsx)(`h2`, {
                        className: `text-xl sm:text-2xl font-black tracking-tight text-neutral-900 leading-tight`,
                        children: e.title,
                      }),
                      e.subtitle &&
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-600 mt-1 font-medium leading-relaxed`,
                          children: e.subtitle,
                        }),
                    ],
                  }),
                  (0, H.jsx)(`div`, {
                    className: `flex flex-wrap items-center gap-1.5 pt-1`,
                    children: e.tags.map((e) =>
                      (0, H.jsxs)(
                        `span`,
                        {
                          className: `px-2.5 py-0.5 rounded-full bg-white text-[11px] font-medium text-neutral-700 border border-neutral-200 shadow-2xs`,
                          children: [`#`, e],
                        },
                        e,
                      ),
                    ),
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `space-y-2 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-xs`,
                children: [
                  (0, H.jsxs)(`h3`, {
                    className: `text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(ud, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `کالبدشکافی پرونده و استراتژی خلق اثر`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`p`, {
                    className: `text-xs sm:text-sm leading-relaxed text-neutral-800 font-normal whitespace-pre-line pt-1`,
                    children: e.description,
                  }),
                ],
              }),
              e.deliverables &&
                e.deliverables.length > 0 &&
                (0, H.jsxs)(`div`, {
                  className: `bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3`,
                  children: [
                    (0, H.jsxs)(`h4`, {
                      className: `text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5`,
                      children: [
                        (0, H.jsx)(nd, {
                          className: `w-3.5 h-3.5 text-green-600`,
                        }),
                        (0, H.jsx)(`span`, {
                          children: `اقلام تحویلی و خروجی‌های این پروژه`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1`,
                      children: e.deliverables.map((e, t) =>
                        (0, H.jsxs)(
                          `div`,
                          {
                            className: `flex items-center gap-2 text-xs text-neutral-800`,
                            children: [
                              (0, H.jsx)(nd, {
                                className: `w-3.5 h-3.5 text-neutral-900 shrink-0`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `font-medium`,
                                children: e,
                              }),
                            ],
                          },
                          t,
                        ),
                      ),
                    }),
                  ],
                }),
              (0, H.jsxs)(`div`, {
                className: `grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `bg-white p-3 rounded-lg border border-neutral-200 shadow-xs`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold`,
                        children: `کارفرما / برند`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `font-bold text-neutral-900 block truncate mt-0.5`,
                        children: e.client,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `bg-white p-3 rounded-lg border border-neutral-200 shadow-xs`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold`,
                        children: `نقش در پروژه`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `font-bold text-neutral-900 block truncate mt-0.5`,
                        children: e.role,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `bg-white p-3 rounded-lg border border-neutral-200 shadow-xs`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold`,
                        children: `سال اجرا`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `font-bold text-neutral-900 block truncate mt-0.5 font-mono`,
                        children: e.year,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `bg-white p-3 rounded-lg border border-neutral-200 shadow-xs`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold`,
                        children: `استودیو همکار`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `font-bold text-neutral-900 block truncate mt-0.5`,
                        children: `Creativity Juice`,
                      }),
                    ],
                  }),
                ],
              }),
              (() => {
                let projectMembers = [];
                try {
                  let allMembers = getTeamMembers();
                  projectMembers = allMembers.filter((m) =>
                    m.projectRoles?.some(
                      (pr) =>
                        pr.projectId === e.id ||
                        pr.projectTitle === e.title ||
                        (pr.projectTitle &&
                          e.title &&
                          (pr.projectTitle.includes(e.title) ||
                            e.title.includes(pr.projectTitle))),
                    ),
                  );
                } catch {}
                if (!projectMembers || projectMembers.length === 0) return null;
                return (0, H.jsxs)(`div`, {
                  className: `p-4 rounded-xl bg-[#FAF9F7] border border-neutral-200/90 shadow-2xs space-y-3`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `flex items-center justify-between border-b border-neutral-200/70 pb-2`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex items-center gap-2`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `w-2 h-2 rounded-full bg-amber-500`,
                            }),
                            (0, H.jsxs)(`span`, {
                              className: `text-xs font-bold text-neutral-900`,
                              children: [
                                `تیم و خالقان اثر در این پروژه (`,
                                projectMembers.length,
                                ` سرپرست ارشد)`,
                              ],
                            }),
                          ],
                        }),
                        (0, H.jsx)(`span`, {
                          className: `text-[10px] font-mono text-neutral-400 font-bold`,
                          children: `CREATIVE TEAM & CREDITS`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-2 gap-2.5`,
                      children: projectMembers.map((m) => {
                        let assignedRole = m.projectRoles?.find(
                          (pr) =>
                            pr.projectId === e.id ||
                            pr.projectTitle === e.title ||
                            (pr.projectTitle &&
                              e.title &&
                              (pr.projectTitle.includes(e.title) ||
                                e.title.includes(pr.projectTitle))),
                        );
                        return (0, H.jsxs)(
                          `div`,
                          {
                            className: `flex items-start gap-3 p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs`,
                            children: [
                              (0, H.jsx)(`img`, {
                                src: m.photo,
                                alt: m.name,
                                className: `w-11 h-11 rounded-full object-cover border border-neutral-300 shrink-0 mt-0.5`,
                              }),
                              (0, H.jsxs)(`div`, {
                                className: `min-w-0 flex-1`,
                                children: [
                                  (0, H.jsxs)(`div`, {
                                    className: `flex items-center justify-between gap-1`,
                                    children: [
                                      (0, H.jsx)(`span`, {
                                        className: `text-xs font-bold text-neutral-900 truncate`,
                                        children: m.name,
                                      }),
                                      (0, H.jsx)(`span`, {
                                        className: `text-[9.5px] font-mono text-neutral-400 shrink-0`,
                                        children: m.initials,
                                      }),
                                    ],
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `inline-block text-[10.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded mt-0.5 max-w-full truncate`,
                                    children: assignedRole?.roleInProject || m.role,
                                  }),
                                  assignedRole?.impact &&
                                    (0, H.jsx)(`p`, {
                                      className: `text-[10px] text-neutral-500 mt-1 line-clamp-1 italic`,
                                      children: assignedRole.impact,
                                    }),
                                  assignedRole?.keyDeliverables &&
                                    assignedRole.keyDeliverables.length > 0 &&
                                    (0, H.jsx)(`div`, {
                                      className: `flex flex-wrap gap-1 mt-1.5`,
                                      children: assignedRole.keyDeliverables.map((del, dIdx) =>
                                        (0, H.jsx)(
                                          `span`,
                                          {
                                            className: `text-[9px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded`,
                                            children: del,
                                          },
                                          dIdx,
                                        ),
                                      ),
                                    }),
                                ],
                              }),
                            ],
                          },
                          m.id,
                        );
                      }),
                    }),
                  ],
                });
              })(),
              (0, H.jsxs)(`div`, {
                className: `pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200`,
                children: [
                  c
                    ? (0, H.jsxs)(`button`, {
                        onClick: () => c(e),
                        className: `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors cursor-pointer`,
                        children: [
                          (0, H.jsx)(wd, {
                            className: `w-3.5 h-3.5 text-neutral-600`,
                          }),
                          (0, H.jsx)(`span`, {
                            children: `ویرایش اطلاعات این پرونده`,
                          }),
                        ],
                      })
                    : (0, H.jsx)(`div`, {}),
                  s &&
                    (0, H.jsxs)(`button`, {
                      onClick: () => s(e.title),
                      className: `inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer`,
                      children: [
                        (0, H.jsx)(`span`, {
                          children: `درخواست شروع پروژه با الهام از این پرونده`,
                        }),
                        (0, H.jsx)(Qu, {
                          className: `w-3.5 h-3.5 text-amber-400`,
                        }),
                      ],
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  Yd = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onSelectServiceForBrief: i,
  }) => {
    let [allServices, setAllServices] = (0, S.useState)(() => {
      try {
        let loaded = getServices();
        if (loaded && loaded.length > 0) return loaded;
      } catch {}
      return ju;
    });

    (0, S.useEffect)(() => {
      let handleData = () => {
        try {
          let s = getServices();
          if (s && s.length > 0) setAllServices(s);
        } catch {}
      };
      window.addEventListener(CJ_STUDIO_DATA_EVENT, handleData);
      return () => window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleData);
    }, []);

    let [a, o] = (0, S.useState)(`all`),
      [s, c] = (0, S.useState)(allServices[0] || ju[0]),
      l = [
        { id: `all`, name: `همه خدمات (${allServices.length})`, trackCode: `ALL TRACKS` },
        {
          id: 1,
          name: `معماری و هویت برند`,
          trackCode: `TRACK 01 // BRAND IDENTITY`,
        },
        {
          id: 2,
          name: `سینما، مد و محتوا`,
          trackCode: `TRACK 02 // CINEMA & VISUALS`,
        },
        {
          id: 3,
          name: `مارکتینگ و کمپین‌ها`,
          trackCode: `TRACK 03 // CAMPAIGNS & ACTIVATIONS`,
        },
        {
          id: 4,
          name: `مشاوره ارشد و کنسلیری`,
          trackCode: `TRACK 04 // STRATEGIC COUNSEL`,
        },
      ],
      u = a === `all` ? allServices : allServices.filter((e) => e.deptId === a);
    return (0, H.jsx)(Ud, {
      id: `services-window`,
      title: `ماتریس خدمات تخصصی • Creativity Juice`,
      subtitle: `کاتالوگ ${allServices.length} خدمت در ۴ تِرَک مهندسی‌شده`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[90vw] md:w-[84vw] lg:w-[74vw]`,
      maxWidth: `max-w-5xl`,
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col md:flex-row min-h-[520px] bg-[#FAF8F5] text-neutral-900 select-none text-right font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `w-full md:w-80 bg-[#F4F2EE] border-b md:border-b-0 md:border-l border-neutral-200 flex flex-col shrink-0`,
            children: [
              (0, H.jsx)(`div`, {
                className: `p-3 border-b border-neutral-200 space-y-1 overflow-x-auto flex md:flex-col gap-1 md:gap-1 shrink-0`,
                children: l.map((e) =>
                  (0, H.jsx)(
                    `button`,
                    {
                      onClick: () => {
                        (W.playClick(), o(e.id));
                      },
                      className: `text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${a === e.id ? `bg-[#18181b] text-white shadow-xs` : `text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900`}`,
                      children: e.name,
                    },
                    String(e.id),
                  ),
                ),
              }),
              (0, H.jsx)(`div`, {
                className: `flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[35vh] md:max-h-[58vh]`,
                children: u.map((e) => {
                  let t = s.id === e.id;
                  return (0, H.jsxs)(
                    `div`,
                    {
                      onClick: () => {
                        (W.playClick(), c(e));
                      },
                      className: `p-3 rounded-xl cursor-pointer border transition-all text-right ${t ? `bg-white border-neutral-300 shadow-sm` : `bg-transparent border-transparent hover:bg-white/60 hover:border-neutral-200`}`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex items-center justify-between text-[10px] font-mono mb-1`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-neutral-500 font-bold`,
                              children: e.code,
                            }),
                            e.popular &&
                              (0, H.jsx)(`span`, {
                                className: `bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[9px] font-bold`,
                                children: `شاخص`,
                              }),
                          ],
                        }),
                        (0, H.jsx)(`h4`, {
                          className: `text-xs sm:text-sm font-bold text-neutral-900 tracking-tight`,
                          children: e.title,
                        }),
                        (0, H.jsx)(`span`, {
                          className: `text-[10px] text-neutral-500 block font-mono mt-0.5`,
                          dir: `ltr`,
                          children: e.titleEn,
                        }),
                      ],
                    },
                    e.id,
                  );
                }),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `flex-1 p-5 sm:p-7 overflow-y-auto max-h-[70vh] space-y-5 bg-white`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `border-b border-neutral-200 pb-4`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-2 space-x-reverse mb-1.5`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-[11px] font-mono uppercase bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-md border border-neutral-200 font-bold`,
                        children: s.deptTrack,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[11px] text-neutral-500 font-medium`,
                        children: s.badge,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`h2`, {
                    className: `text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1`,
                    children: s.title,
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `text-xs font-mono text-neutral-500 mt-0.5`,
                    dir: `ltr`,
                    children: [s.titleEn, ` • `, s.code],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                children: [
                  (0, H.jsx)(`h3`, {
                    className: `text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2`,
                    children: `شرح خدمت و ارزش محوری`,
                  }),
                  (0, H.jsx)(`p`, {
                    className: `text-sm sm:text-base leading-relaxed text-neutral-700 font-normal`,
                    children: s.description,
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `pt-2 border-t border-neutral-200`,
                children: [
                  (0, H.jsxs)(`h4`, {
                    className: `text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(hd, {
                        className: `w-3.5 h-3.5 text-neutral-700`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `خروجی‌های تحویل‌دادنی (Deliverables)`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`div`, {
                    className: `grid grid-cols-1 sm:grid-cols-2 gap-2.5`,
                    children: s.deliverables.map((e, t) =>
                      (0, H.jsxs)(
                        `div`,
                        {
                          className: `flex items-start space-x-2 space-x-reverse p-2.5 rounded-xl bg-[#FAF9F6] border border-neutral-200`,
                          children: [
                            (0, H.jsx)(`div`, {
                              className: `w-4 h-4 rounded-full bg-[#18181b] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]`,
                              children: `✓`,
                            }),
                            (0, H.jsx)(`span`, {
                              className: `text-xs text-neutral-800 font-medium leading-relaxed`,
                              children: e,
                            }),
                          ],
                        },
                        t,
                      ),
                    ),
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-neutral-200`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `bg-[#FAF9F6] p-3.5 rounded-xl border border-neutral-200`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold mb-1`,
                        children: `ایده‌آل و مناسب برای:`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `font-semibold text-neutral-900 block leading-relaxed`,
                        children: s.suitableFor,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `bg-[#FAF9F6] p-3.5 rounded-xl border border-neutral-200`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-neutral-500 block text-[10px] font-bold mb-1`,
                        children: `بازه و قالب زمانی اجرا:`,
                      }),
                      (0, H.jsxs)(`span`, {
                        className: `font-bold text-neutral-900 block flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(ad, {
                            className: `w-3.5 h-3.5 text-amber-600`,
                          }),
                          (0, H.jsx)(`span`, { children: s.timeline }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200`,
                children: [
                  (0, H.jsxs)(`span`, {
                    className: `text-xs text-neutral-500`,
                    children: [
                      `مدل همکاری: `,
                      (0, H.jsx)(`strong`, {
                        className: `text-neutral-900`,
                        children:
                          s.engagementType === `sprint`
                            ? `اسپرینت پروژه‌محور`
                            : s.engagementType === `retainer`
                              ? `ریتینر ماهانه`
                              : `کنسلیری و مشاوره`,
                      }),
                    ],
                  }),
                  i &&
                    (0, H.jsxs)(`button`, {
                      onClick: () => {
                        (W.playClick(), i(s.title));
                      },
                      className: `inline-flex items-center space-x-2 space-x-reverse px-5 py-2.5 rounded-xl bg-[#18181b] hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer`,
                      children: [
                        (0, H.jsx)(`span`, {
                          children: `انتخاب این خدمت در سامانه بریف`,
                        }),
                        (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                      ],
                    }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  Xd = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onProceedToBrief: i,
  }) => {
    let [a, o] = (0, S.useState)(`launch`),
      [s, c] = (0, S.useState)([`track-01`, `track-02`]),
      [l, u] = (0, S.useState)(!1),
      [d, f] = (0, S.useState)(`standard`),
      p = [
        {
          id: `launch`,
          name: `تولد و لانچ برند جدید`,
          desc: `فونداسیون دی‌ان‌ای، هویت بصری کامل و پکیج رونمایی اولیه`,
          baseWeeks: 5,
          baseDeliverables: 14,
          baseLeadHours: 65,
        },
        {
          id: `rebrand`,
          name: `ری‌برندینگ و ارتقای پرستیژ`,
          desc: `عارضه‌یابی عمیق، پالایش زوائد و بازطراحی سیستم بصری و سازمانی`,
          baseWeeks: 6,
          baseDeliverables: 18,
          baseLeadHours: 85,
        },
        {
          id: `campaign`,
          name: `سینمای تجاری و کمپین دراپ`,
          desc: `فیلم‌های تبلیغاتی 4K، عکاسی ادیتوریال و استراتژی فروش محدود`,
          baseWeeks: 4,
          baseDeliverables: 12,
          baseLeadHours: 70,
        },
        {
          id: `counsel`,
          name: `پارتنر دائمی و هدایت فصلی`,
          desc: `مدیریت ارشد خلاقیت (Fractional CD) و ریتینر اختصاصی تولید محتوا`,
          baseWeeks: 12,
          baseDeliverables: 32,
          baseLeadHours: 140,
        },
      ],
      m = [
        {
          id: `track-01`,
          name: `تِرَک ۱: معماری و هویت برند`,
          code: `BRAND DNA & IDENTITY`,
        },
        {
          id: `track-02`,
          name: `تِرَک ۲: سینما، مد و محتوای شاخص`,
          code: `CINEMA & FASHION FILMS`,
        },
        {
          id: `track-03`,
          name: `تِرَک ۳: مارکتینگ فرهنگی و کمپین‌ها`,
          code: `CAMPAIGNS & PRODUCT DROPS`,
        },
        {
          id: `track-04`,
          name: `تِرَک ۴: مشاوره ارشد و کنسلیری`,
          code: `STRATEGIC COUNSEL (FRACTIONAL CD)`,
        },
      ],
      h = (e) => {
        (W.playClick(),
          s.includes(e)
            ? s.length > 1 && c(s.filter((t) => t !== e))
            : c([...s, e]));
      },
      {
        deliverablesMin: g,
        deliverablesMax: _,
        leadHours: v,
        weeks: y,
      } = (() => {
        let e = p.find((e) => e.id === a) || p[0],
          t = e.baseWeeks,
          n = e.baseDeliverables,
          r = e.baseDeliverables + 6,
          i = e.baseLeadHours,
          o = Math.max(0, s.length - 1);
        return (
          (n += o * 4),
          (r += o * 8),
          (i += o * 25),
          l && ((n += 10), (r += 14), (i += 40)),
          d === `express` &&
            ((t = Math.max(2, Math.round(t * 0.65))),
            (i = Math.round(i * 1.2))),
          { deliverablesMin: n, deliverablesMax: r, leadHours: i, weeks: t }
        );
      })();
    return (0, H.jsx)(Ud, {
      id: `calculator-window`,
      title: `ماشین‌حساب هوشمند مقیاس و منابع پروداکشن • Creativity Juice`,
      subtitle: `محاسبه ماتریس تحویل، زمان‌بندی و ساعت‌های نظارت کارگردانی خلاقیت`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[90vw] md:w-[84vw] lg:w-[68vw]`,
      maxWidth: `max-w-4xl`,
      children: (0, H.jsxs)(`div`, {
        className: `bg-white text-neutral-900 p-6 sm:p-7 select-none overflow-y-auto max-h-[75vh] space-y-6 text-right font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `space-y-2.5`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center justify-between`,
                children: [
                  (0, H.jsx)(`label`, {
                    className: `block text-xs font-bold uppercase tracking-wider text-neutral-500`,
                    children: `۱. ماهیت اصلی پروژه و چالش مقیاس`,
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => {
                      (W.playClick(),
                        o(`launch`),
                        c([`track-01`, `track-02`]),
                        u(!1),
                        f(`standard`));
                    },
                    className: `text-[11px] text-neutral-400 hover:text-black flex items-center gap-1 cursor-pointer font-medium`,
                    children: [
                      (0, H.jsx)(Dd, { className: `w-3 h-3` }),
                      (0, H.jsx)(`span`, { children: `تنظیم مجدد` }),
                    ],
                  }),
                ],
              }),
              (0, H.jsx)(`div`, {
                className: `grid grid-cols-1 sm:grid-cols-2 gap-2.5`,
                children: p.map((e) => {
                  let t = a === e.id;
                  return (0, H.jsxs)(
                    `div`,
                    {
                      onClick: () => {
                        (W.playClick(), o(e.id));
                      },
                      className: `p-3.5 rounded-xl cursor-pointer border transition-all ${t ? `bg-neutral-100 border-neutral-900 text-neutral-900 shadow-xs` : `bg-[#FAF9F7] border-neutral-200 text-neutral-700 hover:border-neutral-300`}`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex items-center justify-between mb-1`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-xs sm:text-sm font-bold text-neutral-900`,
                              children: e.name,
                            }),
                            t &&
                              (0, H.jsx)(`span`, {
                                className: `text-neutral-900 font-bold text-xs`,
                                children: `●`,
                              }),
                          ],
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-[11px] leading-relaxed text-neutral-500 font-normal`,
                          children: e.desc,
                        }),
                      ],
                    },
                    e.id,
                  );
                }),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `space-y-2.5 pt-2 border-t border-neutral-200`,
            children: [
              (0, H.jsx)(`label`, {
                className: `block text-xs font-bold uppercase tracking-wider text-neutral-500`,
                children: `۲. تِرَک‌های اجرایی مورد نیاز استودیو`,
              }),
              (0, H.jsx)(`div`, {
                className: `grid grid-cols-1 sm:grid-cols-2 gap-2`,
                children: m.map((e) => {
                  let t = s.includes(e.id);
                  return (0, H.jsxs)(
                    `div`,
                    {
                      onClick: () => h(e.id),
                      className: `p-3 rounded-lg cursor-pointer border transition-all flex items-center justify-between ${t ? `bg-neutral-100 border-neutral-900 text-neutral-900 font-medium` : `bg-[#FAF9F7] border-neutral-200 text-neutral-600 hover:border-neutral-300`}`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-xs font-bold block`,
                              children: e.name,
                            }),
                            (0, H.jsx)(`span`, {
                              className: `text-[10px] font-mono text-neutral-400 font-bold`,
                              dir: `ltr`,
                              children: e.code,
                            }),
                          ],
                        }),
                        (0, H.jsx)(`div`, {
                          className: `w-5 h-5 rounded flex items-center justify-center border ${t ? `bg-[#18181b] border-[#18181b] text-white` : `border-neutral-300`}`,
                          children:
                            t &&
                            (0, H.jsx)(`span`, {
                              className: `font-bold text-xs`,
                              children: `✓`,
                            }),
                        }),
                      ],
                    },
                    e.id,
                  );
                }),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200`,
            children: [
              (0, H.jsxs)(`div`, {
                children: [
                  (0, H.jsx)(`label`, {
                    className: `block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5`,
                    children: `۳. اولویت تحویل و شتاب اسپرینت`,
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex rounded-lg bg-neutral-100 p-1 border border-neutral-200`,
                    children: [
                      (0, H.jsx)(`button`, {
                        type: `button`,
                        onClick: () => {
                          (W.playClick(), f(`standard`));
                        },
                        className: `flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${d === `standard` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-500`}`,
                        children: `استاندارد (کیفیت آتلیه)`,
                      }),
                      (0, H.jsx)(`button`, {
                        type: `button`,
                        onClick: () => {
                          (W.playClick(), f(`express`));
                        },
                        className: `flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${d === `express` ? `bg-[#18181b] text-white shadow-xs` : `text-neutral-500`}`,
                        children: `اسپرینت فشرده (تحویل سریع)`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                children: [
                  (0, H.jsx)(`label`, {
                    className: `block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5`,
                    children: `۴. ریتینر ماهانه تولید محتوا`,
                  }),
                  (0, H.jsxs)(`div`, {
                    onClick: () => {
                      (W.playClick(), u(!l));
                    },
                    className: `p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${l ? `bg-neutral-100 border-neutral-900 text-neutral-900 font-bold` : `bg-[#FAF9F7] border-neutral-200 text-neutral-600`}`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        className: `text-xs`,
                        children: [
                          (0, H.jsx)(`span`, {
                            className: `font-bold block`,
                            children: `افزودن ریتینر ۱۰ ویدیوی سینمایی`,
                          }),
                          (0, H.jsx)(`span`, {
                            className: `text-[10px] text-neutral-500`,
                            children: `تولید مداوم ماهانه همراه با تیم ثابت`,
                          }),
                        ],
                      }),
                      (0, H.jsx)(`input`, {
                        type: `checkbox`,
                        checked: l,
                        onChange: () => {},
                        className: `w-4 h-4 accent-neutral-900 pointer-events-none`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 rounded-2xl bg-[#FAF9F7] border border-neutral-200 shadow-xs space-y-4`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `border-b border-neutral-200 pb-4`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `text-[10px] font-mono uppercase bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded font-bold`,
                    children: `ESTIMATED SCOPE // برآورد مقیاس اجرایی`,
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        className: `bg-white p-3.5 rounded-xl border border-neutral-200`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-center gap-2 text-neutral-500 text-xs mb-1`,
                            children: [
                              (0, H.jsx)(hd, {
                                className: `w-3.5 h-3.5 text-neutral-700`,
                              }),
                              (0, H.jsx)(`span`, {
                                children: `دامنه خروجی‌ها:`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `text-lg font-black text-neutral-900 font-mono`,
                            children: [
                              g,
                              ` الی `,
                              _,
                              ` `,
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-sans text-neutral-500 font-normal`,
                                children: `سند و فایل نهایی`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `bg-white p-3.5 rounded-xl border border-neutral-200`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-center gap-2 text-neutral-500 text-xs mb-1`,
                            children: [
                              (0, H.jsx)(ad, {
                                className: `w-3.5 h-3.5 text-amber-600`,
                              }),
                              (0, H.jsx)(`span`, {
                                children: `زمان‌بندی تحویل:`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `text-lg font-black text-neutral-900 font-mono`,
                            children: [
                              y,
                              ` الی `,
                              y + 2,
                              ` `,
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-sans text-neutral-500 font-normal`,
                                children: `هفته کاری`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `bg-white p-3.5 rounded-xl border border-neutral-200`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-center gap-2 text-neutral-500 text-xs mb-1`,
                            children: [
                              (0, H.jsx)($u, {
                                className: `w-3.5 h-3.5 text-indigo-600`,
                              }),
                              (0, H.jsx)(`span`, {
                                children: `تعهد نظارت ارشد:`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `text-lg font-black text-neutral-900 font-mono`,
                            children: [
                              v,
                              ` `,
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-sans text-neutral-500 font-normal`,
                                children: `ساعت کارگردانی مستقیم`,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsx)(`p`, {
                className: `text-xs text-neutral-500 leading-relaxed font-normal`,
                children: `* این برآورد بر مبنای ظرفیت کارگاهی و متدولوژی اختصاصی Creativity Juice محاسبه شده است. ترکیب قطعی نیازمندی‌ها پس از ثبت بریف و برگزاری جلسه کشف تخصصی نهایی خواهد شد.`,
              }),
              (0, H.jsxs)(`button`, {
                onClick: () => {
                  (W.playWindowOpen(),
                    i &&
                      i(
                        `برآورد مقیاس پروداکشن: ${p.find((e) => e.id === a)?.name} • شامل ${g} الی ${_} خروجی نهایی، ${v} ساعت نظارت ارشد و زمان‌بندی ${y} هفته`,
                      ));
                },
                className: `w-full py-3 rounded-xl bg-[#18181b] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 space-x-reverse active:scale-98 cursor-pointer`,
                children: [
                  (0, H.jsx)(`span`, {
                    children: `انتقال به سامانه بریف بر پایه این مقیاس`,
                  }),
                  (0, H.jsx)(Xu, { className: `w-4 h-4` }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  Zd = ({ onClose: e, zIndex: t, onFocus: n, containerRef: r, onOpenProject: pProj }) => {
    let [liveTeam, setLiveTeam] = (0, S.useState)(() => {
      try {
        let members = getTeamMembers();
        if (members && members.length > 0) return members;
      } catch {}
      return Pu;
    });

    let [liveManifesto, setLiveManifesto] = (0, S.useState)(() => {
      try {
        let manifesto = getManifestoItems();
        if (manifesto && manifesto.length > 0) return manifesto;
      } catch {}
      return Mu;
    });

    (0, S.useEffect)(() => {
      let handleData = () => {
        try {
          let members = getTeamMembers();
          if (members && members.length > 0) {
            setLiveTeam(members);
            s((prev) => members.find((m) => m.id === prev?.id) || members[0]);
          }
          let manifesto = getManifestoItems();
          if (manifesto && manifesto.length > 0) setLiveManifesto(manifesto);
        } catch {}
      };
      window.addEventListener(CJ_STUDIO_DATA_EVENT, handleData);
      return () => window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleData);
    }, []);

    let [i, a] = (0, S.useState)(`manifesto`),
      [o, s] = (0, S.useState)(liveTeam[0] || Pu[0]),
      c = (e) => {
        (W.playClick(), a(e));
      };

    let currentTeam = (liveTeam && liveTeam.length > 0) ? liveTeam : Pu;
    let currentManifesto = (liveManifesto && liveManifesto.length > 0) ? liveManifesto : Mu;
    let selectedMember = currentTeam.find((m) => m && m.id === o?.id) || currentTeam[0] || Pu[0];

    let handleOpenCaseStudy = (role) => {
      if (!pProj) return;
      try {
        let allProjects = getProjects();
        let found = allProjects.find(
          (p) => p.id === role.projectId || p.title === role.projectTitle,
        );
        if (found) {
          pProj(found);
        } else {
          pProj({
            id: role.projectId || `proj-${Date.now()}`,
            title: role.projectTitle,
            titleEn: role.projectTitle,
            subtitle: role.roleInProject,
            client: role.client || `استودیو کریتیویتی جوس`,
            year: role.year || `۱۴۰۳`,
            coverImage:
              role.coverImage ||
              `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85`,
            galleryImages: [
              role.coverImage ||
                `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85`,
            ],
            deliverables: role.keyDeliverables || [],
            badge: `CASE STUDY`,
            category: `branding`,
            categoryLabel: `هویت برند`,
            trackCode: `STUDIO // CASE`,
            challenge: role.impact || `هدایت هویت و اجرای تخصصی پروژه`,
            solution: `طراحی استراتژیک، متریال فاخر و ساختار بصری ماندگار`,
            metrics: role.impact || `تحول ملموس و ارتقای اعتبار برند در بازار`,
            tags: role.keyDeliverables || [`برند`, `استودیو`],
            colorAccent: `#F59E0B`,
          });
        }
      } catch {}
    };

    return (0, H.jsx)(Ud, {
      id: `manifesto-team-window`,
      title: `مانیفست، سرپرستان و مدل‌های همکاری • Creativity Juice`,
      subtitle: `فلسفه بنیادین و ساختار انسانی استودیو`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[90vw] md:w-[84vw] lg:w-[74vw]`,
      maxWidth: `max-w-5xl`,
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col bg-white text-neutral-900 min-h-[520px] select-none font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `p-3 bg-[#F8F7F5] border-b border-neutral-200 flex items-center justify-between`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex rounded-lg bg-neutral-200/70 p-1 space-x-1 space-x-reverse`,
                children: [
                  (0, H.jsx)(`button`, {
                    onClick: () => c(`manifesto`),
                    className: `px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${i === `manifesto` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-600 hover:text-black`}`,
                    children: `اصول و مانیفست بنیادین`,
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => c(`team`),
                    className: `px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${i === `team` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-600 hover:text-black`}`,
                    children: `سرپرستان و تیم خلاقیت (۵)`,
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => c(`models`),
                    className: `px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${i === `models` ? `bg-white text-neutral-900 shadow-xs` : `text-neutral-600 hover:text-black`}`,
                    children: `مدل‌های ۳گانه همکاری`,
                  }),
                ],
              }),
              (0, H.jsx)(`span`, {
                className: `text-[11px] font-mono text-neutral-400 hidden sm:inline font-bold`,
                children: `CREATIVITY JUICE // THE MANIFESTO`,
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 sm:p-7 overflow-y-auto max-h-[68vh] flex-1 bg-white`,
            children: [
              i === `manifesto` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop text-right`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-mono uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold`,
                          children: `EDITORIAL PURITY & CORE MANIFESTO`,
                        }),
                        (0, H.jsx)(`h3`, {
                          className: `text-2xl font-black text-neutral-900 mt-2`,
                          children: `مانیفست خلوص ادیتوریال و خطوط قرمز استودیو`,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed`,
                          children: `ما به تزیینات بی‌پشتوانه و کپی‌برداری از ترندهای گذرا اعتقادی نداریم. این ۳ اصل، راهنمای تصمیم‌گیری ما در هر پروژه است.`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `space-y-4 pt-2`,
                      children: currentManifesto.map((e) =>
                        (0, H.jsxs)(
                          `div`,
                          {
                            className: `p-5 rounded-xl bg-[#FAF9F7] border border-neutral-200 shadow-2xs space-y-3`,
                            children: [
                              (0, H.jsxs)(`div`, {
                                className: `flex items-center justify-between border-b border-neutral-200 pb-2`,
                                children: [
                                  (0, H.jsxs)(`div`, {
                                    className: `flex items-center space-x-2.5 space-x-reverse`,
                                    children: [
                                      (0, H.jsx)(`span`, {
                                        className: `w-6 h-6 rounded-md bg-[#18181b] text-white font-mono font-black text-xs flex items-center justify-center`,
                                        children: e.code,
                                      }),
                                      (0, H.jsx)(`h4`, {
                                        className: `text-base font-bold text-neutral-900`,
                                        children: e.title,
                                      }),
                                    ],
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `text-xs font-mono text-neutral-400 font-bold`,
                                    dir: `ltr`,
                                    children: e.titleEn,
                                  }),
                                ],
                              }),
                              (0, H.jsx)(`p`, {
                                className: `text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal`,
                                children: e.description,
                              }),
                              (0, H.jsxs)(`div`, {
                                className: `p-3.5 rounded-lg bg-white border-r-4 border-amber-500 text-xs text-neutral-700 flex items-start space-x-2 space-x-reverse border border-neutral-200/80`,
                                children: [
                                  (0, H.jsx)(Ed, {
                                    className: `w-4 h-4 text-amber-600 shrink-0 mt-0.5`,
                                  }),
                                  (0, H.jsxs)(`div`, {
                                    children: [
                                      (0, H.jsx)(`p`, {
                                        className: `font-medium italic`,
                                        children: e.quote,
                                      }),
                                      (0, H.jsxs)(`span`, {
                                        className: `text-[10px] text-neutral-500 font-bold not-italic block mt-1`,
                                        children: [`— `, e.author],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          },
                          e.code,
                        ),
                      ),
                    }),
                  ],
                }),
              i === `team` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop text-right`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-mono uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold`,
                          children: `SENIOR LEADERSHIP & DIRECTORS`,
                        }),
                        (0, H.jsx)(`h3`, {
                          className: `text-2xl font-black text-neutral-900 mt-2`,
                          children: `سرپرستان ارشد و معماران خلاقیت`,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-500 mt-1`,
                          children: `پروژه‌ها در استودیو هرگز به پیمانکاران ناشناس واگذار نمی‌شوند؛ این ۵ سرپرست مستقیماً بر تمام جزئیات نظارت دارند.`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2`,
                      children: currentTeam.map((e) => {
                        let t = selectedMember && selectedMember.id === e.id;
                        return (0, H.jsxs)(
                          `div`,
                          {
                            onClick: () => {
                              (W.playClick(), s(e));
                            },
                            className: `p-2.5 rounded-xl cursor-pointer border transition-all text-center ${t ? `bg-neutral-100 border-neutral-900 shadow-xs ring-1 ring-neutral-900` : `bg-[#FAF9F7] border-neutral-200 hover:border-neutral-400`}`,
                            children: [
                              (0, H.jsx)(`div`, {
                                className: `w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border border-neutral-300`,
                                children: (0, H.jsx)(`img`, {
                                  src: e.photo,
                                  alt: e.name,
                                  className: `w-full h-full object-cover`,
                                }),
                              }),
                              (0, H.jsx)(`h4`, {
                                className: `text-xs font-bold text-neutral-900 truncate`,
                                children: e.name,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-[10px] text-neutral-500 block truncate font-medium`,
                                children: (e.role || '').split(`و`)[0] || e.role,
                              }),
                            ],
                          },
                          e.id,
                        );
                      }),
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `p-5 rounded-2xl bg-[#FAF9F7] border border-neutral-200 space-y-4`,
                      children: [
                        (0, H.jsxs)(`div`, {
                          className: `flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3`,
                          children: [
                            (0, H.jsxs)(`div`, {
                              children: [
                                (0, H.jsx)(`span`, {
                                  className: `text-[10px] font-mono font-bold text-amber-700`,
                                  children: selectedMember?.trackCode || `STUDIO // CORE DOSSIER`,
                                }),
                                (0, H.jsx)(`h4`, {
                                  className: `text-xl font-black text-neutral-900`,
                                  children: selectedMember?.name || `همکار استودیو`,
                                }),
                                (0, H.jsxs)(`span`, {
                                  className: `text-xs text-neutral-500 font-medium`,
                                  children: [selectedMember?.role || ``, selectedMember?.roleEn ? ` (${selectedMember.roleEn})` : ``],
                                }),
                              ],
                            }),
                            (0, H.jsx)(`span`, {
                              className: `text-xs font-mono text-neutral-400 font-bold`,
                              dir: `ltr`,
                              children: selectedMember?.department || ``,
                            }),
                          ],
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal`,
                          children: selectedMember?.bio || ``,
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs`,
                          children: [
                            (0, H.jsxs)(`div`, {
                              className: `bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs`,
                              children: [
                                (0, H.jsx)(`span`, {
                                  className: `text-neutral-500 block text-[10px] font-bold mb-1`,
                                  children: `پیشینه و سوابق:`,
                                }),
                                (0, H.jsx)(`p`, {
                                  className: `text-neutral-800 leading-relaxed font-normal`,
                                  children: selectedMember?.experience || ``,
                                }),
                              ],
                            }),
                            (0, H.jsxs)(`div`, {
                              className: `bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs`,
                              children: [
                                (0, H.jsx)(`span`, {
                                  className: `text-neutral-500 block text-[10px] font-bold mb-1`,
                                  children: `فلسفه فردی:`,
                                }),
                                (0, H.jsx)(`p`, {
                                  className: `text-amber-800 font-semibold italic leading-relaxed`,
                                  children: selectedMember?.philosophy || ``,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, H.jsxs)(`div`, {
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-[11px] font-bold text-neutral-600 block mb-2`,
                              children: `تخصص‌های کانونی:`,
                            }),
                            (0, H.jsx)(`div`, {
                              className: `flex flex-wrap gap-1.5`,
                              children: (selectedMember?.specialties || []).map((e, t) =>
                                (0, H.jsx)(
                                  `span`,
                                  {
                                    className: `px-2.5 py-1 rounded-md bg-white text-xs text-neutral-800 border border-neutral-200 font-medium shadow-2xs`,
                                    children: e,
                                  },
                                  t,
                                ),
                              ),
                            }),
                          ],
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `pt-4 border-t border-neutral-200/90 space-y-3`,
                          children: [
                            (0, H.jsxs)(`div`, {
                              className: `flex items-center justify-between`,
                              children: [
                                (0, H.jsxs)(`div`, {
                                  className: `flex items-center gap-2`,
                                  children: [
                                    (0, H.jsx)(`span`, {
                                      className: `w-2 h-2 rounded-full bg-amber-500 animate-pulse`,
                                    }),
                                    (0, H.jsxs)(`h5`, {
                                      className: `text-xs sm:text-sm font-black text-neutral-900`,
                                      children: [
                                        `پروژه‌ها و نقش‌های اختصاصی در استودیو (`,
                                        selectedMember?.projectRoles ? selectedMember.projectRoles.length : 0,
                                        `)`,
                                      ],
                                    }),
                                  ],
                                }),
                                (0, H.jsx)(`span`, {
                                  className: `text-[10px] font-mono text-neutral-400 font-bold`,
                                  children: `PROJECT ROLES & CREDITS`,
                                }),
                              ],
                            }),
                            selectedMember?.projectRoles && selectedMember.projectRoles.length > 0
                              ? (0, H.jsx)(`div`, {
                                  className: `grid grid-cols-1 md:grid-cols-2 gap-3`,
                                  children: selectedMember.projectRoles.map((pr, pIdx) =>
                                    (0, H.jsxs)(
                                      `div`,
                                      {
                                        className: `p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between group`,
                                        children: [
                                          (0, H.jsxs)(`div`, {
                                            className: `space-y-2.5`,
                                            children: [
                                              (0, H.jsxs)(`div`, {
                                                className: `flex items-start gap-3`,
                                                children: [
                                                  pr.coverImage &&
                                                    (0, H.jsx)(`div`, {
                                                      className: `w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100`,
                                                      children: (0, H.jsx)(`img`, {
                                                        src: pr.coverImage,
                                                        alt: pr.projectTitle,
                                                        className: `w-full h-full object-cover group-hover:scale-105 transition-transform duration-300`,
                                                      }),
                                                    }),
                                                  (0, H.jsxs)(`div`, {
                                                    className: `flex-1 min-w-0`,
                                                    children: [
                                                      (0, H.jsxs)(`div`, {
                                                        className: `flex items-center justify-between gap-1`,
                                                        children: [
                                                          (0, H.jsx)(`h6`, {
                                                            className: `text-xs sm:text-sm font-bold text-neutral-900 truncate group-hover:text-amber-800 transition-colors`,
                                                            children: pr.projectTitle,
                                                          }),
                                                          pr.year &&
                                                            (0, H.jsx)(`span`, {
                                                              className: `text-[10px] font-mono text-neutral-400 shrink-0`,
                                                              children: pr.year,
                                                            }),
                                                        ],
                                                      }),
                                                      pr.client &&
                                                        (0, H.jsxs)(`p`, {
                                                          className: `text-[11px] text-neutral-500 truncate mt-0.5`,
                                                          children: [`کارفرما: `, pr.client],
                                                        }),
                                                      (0, H.jsx)(`div`, {
                                                        className: `mt-1.5`,
                                                        children: (0, H.jsx)(`span`, {
                                                          className: `inline-block text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md`,
                                                          children: pr.roleInProject,
                                                        }),
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              pr.impact &&
                                                (0, H.jsxs)(`div`, {
                                                  className: `p-2 rounded-lg bg-neutral-50 border border-neutral-150 text-[11px] text-neutral-700 leading-relaxed`,
                                                  children: [
                                                    (0, H.jsx)(`span`, {
                                                      className: `font-bold text-neutral-500 block text-[10px] mb-0.5`,
                                                      children: `دستاورد و تأثیر:`,
                                                    }),
                                                    pr.impact,
                                                  ],
                                                }),
                                              pr.keyDeliverables &&
                                                pr.keyDeliverables.length > 0 &&
                                                (0, H.jsx)(`div`, {
                                                  className: `flex flex-wrap gap-1`,
                                                  children: pr.keyDeliverables.map((del, dIdx) =>
                                                    (0, H.jsx)(
                                                      `span`,
                                                      {
                                                        className: `text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium`,
                                                        children: del,
                                                      },
                                                      dIdx,
                                                    ),
                                                  ),
                                                }),
                                            ],
                                          }),
                                          pProj &&
                                            (0, H.jsx)(`div`, {
                                              className: `mt-3 pt-2.5 border-t border-neutral-100 flex justify-end`,
                                              children: (0, H.jsxs)(`button`, {
                                                type: `button`,
                                                onClick: () => handleOpenCaseStudy(pr),
                                                className: `inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 hover:text-amber-800 transition-colors cursor-pointer group-hover:translate-x-[-2px] duration-200`,
                                                children: [
                                                  (0, H.jsx)(`span`, { children: `مشاهده پرونده پروژه` }),
                                                  (0, H.jsx)(`span`, { children: `←` }),
                                                ],
                                              }),
                                            }),
                                        ],
                                      },
                                      pIdx,
                                    ),
                                  ),
                                })
                              : (0, H.jsx)(`div`, {
                                  className: `p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-400`,
                                  children: `هنوز پروژه‌ای به این عضو اختصاص نیافته است. در پنل مدیریت می‌توانید پروژه‌ها و نقش‌های همکار را تعیین کنید.`,
                                }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              i === `models` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop text-right`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-mono uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold`,
                          children: `ENGAGEMENT FRAMEWORKS`,
                        }),
                        (0, H.jsx)(`h3`, {
                          className: `text-2xl font-black text-neutral-900 mt-2`,
                          children: `۳ مدل استاندارد همکاری با استودیو`,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed`,
                          children: `همکاری بر اساس نیاز کسب‌وکار شما ساختاربندی می‌شود؛ از اسپرینت‌های فشرده تا همراهی فصلی در هیئت‌مدیره.`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2`,
                      children: Nu.map((e) =>
                        (0, H.jsxs)(
                          `div`,
                          {
                            className: `p-5 rounded-2xl bg-[#FAF9F7] border border-neutral-200 flex flex-col justify-between space-y-4 hover:border-neutral-400 transition-all shadow-2xs`,
                            children: [
                              (0, H.jsxs)(`div`, {
                                children: [
                                  (0, H.jsx)(`span`, {
                                    className: `text-[10px] font-mono text-amber-700 font-bold block mb-1`,
                                    children: e.modelCode,
                                  }),
                                  (0, H.jsx)(`h4`, {
                                    className: `text-base font-bold text-neutral-900 mb-0.5`,
                                    children: e.name,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `text-[10px] font-mono text-neutral-400 font-bold block mb-3`,
                                    dir: `ltr`,
                                    children: e.nameEn,
                                  }),
                                  (0, H.jsx)(`p`, {
                                    className: `text-xs text-neutral-600 leading-relaxed mb-4 font-normal`,
                                    children: e.description,
                                  }),
                                  (0, H.jsx)(`div`, {
                                    className: `space-y-2 border-t border-neutral-200 pt-3`,
                                    children: e.features.map((e, t) =>
                                      (0, H.jsxs)(
                                        `div`,
                                        {
                                          className: `flex items-start space-x-2 space-x-reverse text-xs text-neutral-800`,
                                          children: [
                                            (0, H.jsx)(`span`, {
                                              className: `text-amber-600 font-bold text-xs`,
                                              children: `✓`,
                                            }),
                                            (0, H.jsx)(`span`, {
                                              className: `leading-relaxed font-normal`,
                                              children: e,
                                            }),
                                          ],
                                        },
                                        t,
                                      ),
                                    ),
                                  }),
                                ],
                              }),
                              (0, H.jsx)(`div`, {
                                className: `pt-3 border-t border-neutral-200 text-[11px] font-mono text-neutral-900 font-bold`,
                                children: e.timeline,
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
    });
  },
  Qd = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onOpenBrief: i,
  }) =>
    (0, H.jsx)(Ud, {
      id: `featured-case-window`,
      title: `پرونده کالبدشکافی هویت • آتلیه معماری آرکا`,
      subtitle: `گزارش مستند تحول برند و نتایج تجاری`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[90vw] md:w-[82vw] lg:w-[68vw]`,
      maxWidth: `max-w-4xl`,
      children: (0, H.jsxs)(`div`, {
        className: `bg-[#FAF8F5] text-neutral-900 p-6 sm:p-8 space-y-6 select-none overflow-y-auto max-h-[75vh] text-right font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `border-b border-neutral-200 pb-4`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center space-x-2 space-x-reverse mb-1.5`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `text-[11px] font-mono uppercase bg-neutral-200 text-neutral-800 px-2.5 py-0.5 rounded-md font-bold`,
                    children: `CASE DOSSIER // DEEP DIVE`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-xs text-neutral-500 font-medium`,
                    children: Fu.timeline,
                  }),
                ],
              }),
              (0, H.jsx)(`h2`, {
                className: `text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight`,
                children: Fu.title,
              }),
              (0, H.jsx)(`span`, {
                className: `text-xs font-mono text-neutral-500 block mt-0.5`,
                dir: `ltr`,
                children: Fu.titleEn,
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `relative rounded-2xl overflow-hidden aspect-[16/9] border border-neutral-200 bg-neutral-100 shadow-sm`,
            children: [
              (0, H.jsx)(`img`, {
                src: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85`,
                alt: `Arka Architecture`,
                className: `w-full h-full object-cover`,
              }),
              (0, H.jsx)(`div`, {
                className: `absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80`,
              }),
              (0, H.jsxs)(`div`, {
                className: `absolute bottom-4 right-4 left-4 flex flex-wrap items-center justify-between gap-2`,
                children: [
                  (0, H.jsxs)(`span`, {
                    className: `text-xs font-bold text-white bg-black/70 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20`,
                    children: [`کارفرما: `, Fu.client],
                  }),
                  (0, H.jsxs)(`span`, {
                    className: `text-xs font-mono text-white bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20`,
                    children: [`محدوده: `, Fu.scope],
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 rounded-2xl bg-[#FFFBEB] border border-amber-200 space-y-2.5`,
            children: [
              (0, H.jsxs)(`h3`, {
                className: `text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5`,
                children: [
                  (0, H.jsx)(Md, { className: `w-4 h-4 text-amber-600` }),
                  (0, H.jsx)(`span`, {
                    children: `گلوگاه‌های اولیه قبل از ورود استودیو (Bottlenecks)`,
                  }),
                ],
              }),
              (0, H.jsx)(`ul`, {
                className: `space-y-1.5 pr-2`,
                children: Fu.initialBottlenecks.map((e, t) =>
                  (0, H.jsxs)(
                    `li`,
                    {
                      className: `text-xs text-amber-950 flex items-start space-x-2 space-x-reverse leading-relaxed`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-amber-600 font-bold ml-1.5`,
                          children: `•`,
                        }),
                        (0, H.jsx)(`span`, { children: e }),
                      ],
                    },
                    t,
                  ),
                ),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-2.5`,
            children: [
              (0, H.jsxs)(`h3`, {
                className: `text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5`,
                children: [
                  (0, H.jsx)(Pd, { className: `w-4 h-4 text-amber-600` }),
                  (0, H.jsx)(`span`, {
                    children: `مداخلات استراتژیک استودیو Creativity Juice`,
                  }),
                ],
              }),
              (0, H.jsx)(`ul`, {
                className: `space-y-2 pr-2`,
                children: Fu.studioInterventions.map((e, t) =>
                  (0, H.jsxs)(
                    `li`,
                    {
                      className: `text-xs text-neutral-700 flex items-start space-x-2 space-x-reverse leading-relaxed`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-neutral-900 font-bold ml-1.5`,
                          children: `✓`,
                        }),
                        (0, H.jsx)(`span`, { children: e }),
                      ],
                    },
                    t,
                  ),
                ),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2.5`,
            children: [
              (0, H.jsxs)(`h3`, {
                className: `text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5`,
                children: [
                  (0, H.jsx)(Ld, { className: `w-4 h-4 text-slate-700` }),
                  (0, H.jsx)(`span`, {
                    children: `نتایج ملموس تجاری و پرستیژ برند (Tangible Results)`,
                  }),
                ],
              }),
              (0, H.jsx)(`ul`, {
                className: `space-y-2 pr-2`,
                children: Fu.tangibleResults.map((e, t) =>
                  (0, H.jsxs)(
                    `li`,
                    {
                      className: `text-xs text-slate-800 font-medium flex items-start space-x-2 space-x-reverse leading-relaxed`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-slate-900 font-bold ml-1.5`,
                          children: `★`,
                        }),
                        (0, H.jsx)(`span`, { children: e }),
                      ],
                    },
                    t,
                  ),
                ),
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-4 rounded-xl bg-white border border-neutral-200 border-r-4 border-r-neutral-900 text-xs text-neutral-800 italic flex items-start space-x-2.5 space-x-reverse shadow-xs`,
            children: [
              (0, H.jsx)(Ed, {
                className: `w-5 h-5 text-neutral-400 shrink-0 mt-0.5`,
              }),
              (0, H.jsx)(`p`, {
                className: `leading-relaxed`,
                children: Fu.quote,
              }),
            ],
          }),
          i &&
            (0, H.jsx)(`div`, {
              className: `pt-2 flex justify-end`,
              children: (0, H.jsxs)(`button`, {
                onClick: () => {
                  (W.playWindowOpen(), i());
                },
                className: `px-6 py-2.5 rounded-xl bg-[#18181b] hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-98 flex items-center gap-2 cursor-pointer`,
                children: [
                  (0, H.jsx)(`span`, {
                    children: `شروع اسپرینت مشابه برای برند من`,
                  }),
                  (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                ],
              }),
            }),
        ],
      }),
    }),
  $d = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    prefilledScope: i = ``,
  }) => {
    let [a, o] = (0, S.useState)(1),
      [s, c] = (0, S.useState)(!1),
      [l, u] = (0, S.useState)(``),
      [d, f] = (0, S.useState)(!1),
      [p, m] = (0, S.useState)(!1),
      [h, g] = (0, S.useState)({
        clientName: ``,
        clientUrl: ``,
        problem: i || ``,
        marketTier: `میان‌رده باکیفیت`,
        selectedTrack: `دپارتمان برندینگ`,
        emptySpace: ``,
        enemy: ``,
        persona: ``,
        brandingDeliverables: [
          `لوگوتایپ و سیستم نماد`,
          `معماری تایپوگرافی، پالت رنگ و گرید`,
        ],
        bottleneck: `دیده می‌شویم اما اعتماد نمی‌کنند (مشکل پرستیژ و اعتبار)`,
        objection: ``,
        competitorCliches: ``,
        marketingMedia: [
          `کمپین فصلی شاخص (فیلم‌های تبلیغاتی سینمایی برای لانچ)`,
        ],
        benchmarks: ``,
        dealbreakers: ``,
        deadline: ``,
        productionScale: `پروداکشن استاندارد استودیو (پکیج جامع با تست و نظارت کامل)`,
        decisionStructure: `شخص خودم (یک تصمیم‌گیرنده واحد)`,
      }),
      _ = [
        {
          num: 1,
          code: `STEP 01`,
          title: `انتخاب مسیر`,
          label: `غربالگری و انتخاب مسیر`,
        },
        {
          num: 2,
          code: `TRACK A`,
          title: `دپارتمان برندینگ`,
          label: `معماری هویت برند`,
        },
        {
          num: 3,
          code: `TRACK B`,
          title: `دپارتمان مارکتینگ`,
          label: `محتوا، کمپین و فروش`,
        },
        {
          num: 4,
          code: `STEP 04`,
          title: `سلیقه و خط قرمز`,
          label: `مراجع و مرزهای سلیقه‌ای`,
        },
        {
          num: 5,
          code: `STEP 05`,
          title: `لجستیک و مقیاس`,
          label: `زمان‌بندی، مقیاس و تصمیم‌گیری`,
        },
      ],
      v = (e) => {
        (W.playClick(), o(e));
      },
      y = () => {
        a < 5 && (W.playClick(), o(a + 1));
      },
      b = () => {
        a > 1 && (W.playClick(), o(a - 1));
      },
      x = (e) => {
        (W.playClick(),
          g((t) =>
            t.brandingDeliverables.includes(e)
              ? {
                  ...t,
                  brandingDeliverables: t.brandingDeliverables.filter(
                    (t) => t !== e,
                  ),
                }
              : { ...t, brandingDeliverables: [...t.brandingDeliverables, e] },
          ));
      },
      C = (e) => {
        (W.playClick(),
          g((t) =>
            t.marketingMedia.includes(e)
              ? {
                  ...t,
                  marketingMedia: t.marketingMedia.filter((t) => t !== e),
                }
              : { ...t, marketingMedia: [...t.marketingMedia, e] },
          ));
      },
      ee = () => {
        let e = `=== خلاصه بریف CREATIVITY JUICE ===

`;
        return (
          (e += `• نام برند / کارفرما: ${h.clientName || `ثبت نشده`}\n`),
          (e += `• آدرس وب‌سایت یا اینستاگرام: ${h.clientUrl || `ثبت نشده`}\n`),
          (e += `• صورت‌مسئله در یک جمله: ${h.problem || `-`}\n`),
          (e += `• سطح بازار و زنجیره ارزش: ${h.marketTier || `-`}\n`),
          (e += `• مسیر و دپارتمان انتخابی: ${h.selectedTrack || `-`}\n\n`),
          (e += `[بخش اول: بریف دپارتمان برندینگ]
`),
          (e += `• جای خالی در جهان: ${h.emptySpace || `-`}\n`),
          (e += `• دشمن مشترک (The Anti-Thesis): ${h.enemy || `-`}\n`),
          (e += `• کاراکتر انسانی و استعاره برند: ${h.persona || `-`}\n`),
          (e += `• خروجی‌های مورد نیاز: ${h.brandingDeliverables.join(`، `) || `هیچکدام`}\n\n`),
          (e += `[بخش دوم: بریف دپارتمان مارکتینگ]
`),
          (e += `• گلوگاه واقعی فروش و دیده‌شدن: ${h.bottleneck || `-`}\n`),
          (e += `• تردید و بهانه مشتری (The Objection): ${h.objection || `-`}\n`),
          (e += `• کلیشه‌های خسته‌کننده رقبا: ${h.competitorCliches || `-`}\n`),
          (e += `• خروجی رسانه‌ای مورد انتظار: ${h.marketingMedia.join(`، `) || `هیچکدام`}\n\n`),
          (e += `[بخش سوم: سلیقه و خطوط قرمز]
`),
          (e += `• مراجع تحسین‌شده (Aesthetic Benchmarks): ${h.benchmarks || `-`}\n`),
          (e += `• خط قرمز سلیقه‌ای (Dealbreakers): ${h.dealbreakers || `-`}\n\n`),
          (e += `[بخش چهارم: لجستیک و مقیاس پروداکشن]
`),
          (e += `• ددلاین و زمان‌بندی: ${h.deadline || `-`}\n`),
          (e += `• سطح و مقیاس پروداکشن: ${h.productionScale || `-`}\n`),
          (e += `• ساختار تصمیم‌گیری نهایی: ${h.decisionStructure || `-`}\n`),
          e
        );
      },
      w = () => {
        W.playPop();
        let e = ee();
        navigator.clipboard &&
          navigator.clipboard.writeText(e).then(() => {
            (f(!0), setTimeout(() => f(!1), 2500));
          });
      };
    return (0, H.jsx)(Ud, {
      id: `brief-window`,
      title: `CJ-BRIEF-2026`,
      subtitle: `🚀 پرسشنامه کشف پروژه و تدوین بریف — Discovery Brief & Intake Protocol`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[94vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw]`,
      maxWidth: `max-w-6xl`,
      headerRightContent: (0, H.jsxs)(`div`, {
        className: `flex items-center gap-2.5 text-[10px] font-mono select-none`,
        dir: `ltr`,
        children: [
          (0, H.jsxs)(`span`, {
            className: `flex items-center gap-1 font-bold text-neutral-800`,
            children: [
              (0, H.jsx)(`span`, {
                className: `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`,
              }),
              `AUTOSAVE ON`,
            ],
          }),
          (0, H.jsx)(`span`, {
            className: `text-neutral-400 font-medium`,
            children: `15:33 UTC`,
          }),
        ],
      }),
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col flex-1 h-full min-h-[580px] bg-[#FAF9F6] text-neutral-900 select-none text-right font-sans`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `bg-white border-b border-neutral-200/90 px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `w-3 h-3 rounded-full bg-amber-500 shrink-0`,
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-base sm:text-lg font-black tracking-tight text-neutral-900`,
                        children: `CREATIVITY JUICE`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `mr-2 text-[11px] font-mono text-neutral-500 tracking-wider`,
                        children: `// PROJECT DISCOVERY BRIEF`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `text-[11px] font-mono text-neutral-500 text-left`,
                dir: `ltr`,
                children: [
                  (0, H.jsx)(`strong`, {
                    className: `text-neutral-900 block font-bold`,
                    children: `INDEPENDENT CREATIVE DIRECTION`,
                  }),
                  (0, H.jsx)(`span`, {
                    children: `WORLD-BUILDING & NARRATIVE ENGINE`,
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsx)(`div`, {
            className: `bg-white border-b border-neutral-200 px-3 sm:px-8 py-2.5 sm:py-3 shrink-0`,
            children: (0, H.jsx)(`div`, {
              className: `flex sm:grid sm:grid-cols-5 gap-1.5 sm:gap-2 bg-neutral-100/90 p-1.5 rounded-2xl border border-neutral-200/80 overflow-x-auto no-scrollbar`,
              children: _.map((e) => {
                let t = a === e.num;
                return (0, H.jsxs)(
                  `button`,
                  {
                    type: `button`,
                    onClick: () => v(e.num),
                    className: `py-2 px-3 sm:px-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer shrink-0 min-w-[95px] sm:min-w-0 ${t ? `bg-neutral-900 text-white shadow-sm font-bold` : `text-neutral-600 hover:text-neutral-900 hover:bg-white/80`}`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] font-mono ${t ? `text-amber-300 font-bold` : `text-neutral-400`}`,
                        children: e.code,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-xs font-bold truncate max-w-full`,
                        children: e.title,
                      }),
                    ],
                  },
                  e.num,
                );
              }),
            }),
          }),
          (0, H.jsx)(`div`, {
            className: `flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-8 max-h-[72vh]`,
            children: s
              ? (0, H.jsxs)(`div`, {
                  className: `py-12 px-4 sm:px-12 text-center space-y-6 max-w-2xl mx-auto bg-white rounded-3xl border border-neutral-200 shadow-sm`,
                  children: [
                    (0, H.jsx)(`div`, {
                      className: `w-16 h-16 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-md`,
                      children: (0, H.jsx)(rd, {
                        className: `w-9 h-9 text-amber-300`,
                      }),
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `space-y-2`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-widest`,
                          dir: `ltr`,
                          children: `CREATIVITY JUICE // INTAKE CONSOLE // CJ-2026`,
                        }),
                        (0, H.jsxs)(`h3`, {
                          className: `text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight`,
                          children: [
                            `بریف برند `,
                            h.clientName || `شما`,
                            ` با موفقیت ثبت شد`,
                          ],
                        }),
                        (0, H.jsxs)(`p`, {
                          className: `text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg mx-auto`,
                          children: [
                            `پاسخ‌های کشف پروژه به سرپرست دپارتمان `,
                            h.selectedTrack,
                            ` ارجاع گردید. ظرف حداکثر ۴۸ ساعت کاری پرونده تحلیل و جلسه کشف تخصصی هماهنگ خواهد شد.`,
                          ],
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `p-4 rounded-2xl bg-[#FAF9F6] border border-neutral-200 inline-flex flex-col sm:flex-row items-center gap-3 select-all`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-xs text-neutral-500 font-medium`,
                          children: `کد رهگیری پرونده:`,
                        }),
                        (0, H.jsx)(`span`, {
                          className: `font-mono text-base font-black text-neutral-900 tracking-wider`,
                          children: l,
                        }),
                        (0, H.jsx)(`button`, {
                          type: `button`,
                          onClick: () => {
                            (W.playPop(),
                              navigator.clipboard &&
                                (navigator.clipboard.writeText(l),
                                m(!0),
                                setTimeout(() => m(!1), 2e3)));
                          },
                          className: `px-2.5 py-1 rounded-lg bg-white border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 font-sans transition-colors cursor-pointer`,
                          children: p
                            ? (0, H.jsxs)(H.Fragment, {
                                children: [
                                  (0, H.jsx)(X, {
                                    className: `w-3 h-3 text-emerald-600`,
                                  }),
                                  (0, H.jsx)(`span`, { children: `کپی شد` }),
                                ],
                              })
                            : (0, H.jsxs)(H.Fragment, {
                                children: [
                                  (0, H.jsx)(od, {
                                    className: `w-3 h-3 text-neutral-600`,
                                  }),
                                  (0, H.jsx)(`span`, { children: `کپی کد` }),
                                ],
                              }),
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-4 flex flex-wrap items-center justify-center gap-3`,
                      children: [
                        (0, H.jsxs)(`button`, {
                          type: `button`,
                          onClick: w,
                          className: `px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer`,
                          children: [
                            (0, H.jsx)(ud, {
                              className: `w-3.5 h-3.5 text-neutral-600`,
                            }),
                            (0, H.jsx)(`span`, {
                              children: `کپی متن کامل پرسشنامه`,
                            }),
                          ],
                        }),
                        (0, H.jsxs)(`button`, {
                          type: `button`,
                          onClick: () => {
                            (W.playClick(), c(!1), o(1));
                          },
                          className: `px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer`,
                          children: [
                            (0, H.jsx)(Od, { className: `w-3.5 h-3.5` }),
                            (0, H.jsx)(`span`, { children: `ویرایش پاسخ‌ها` }),
                          ],
                        }),
                        (0, H.jsx)(`button`, {
                          type: `button`,
                          onClick: e,
                          className: `px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-xs`,
                          children: `بستن پنجره`,
                        }),
                      ],
                    }),
                  ],
                })
              : (0, H.jsxs)(`form`, {
                  onSubmit: (e) => {
                    (e.preventDefault(), W.playWindowOpen());
                    let t = `CJ-2026-${Math.floor(1e4 + Math.random() * 9e4)}`;
                    (u(t), c(!0));
                  },
                  className: `space-y-8`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `bg-white border border-neutral-200 border-r-4 border-r-amber-500 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-neutral-700 leading-relaxed shadow-xs`,
                      children: [
                        (0, H.jsx)(`strong`, {
                          className: `font-bold text-neutral-900 ml-1`,
                          children: `یادداشت استودیو برای کارفرما:`,
                        }),
                        `این پرسش‌نامه برای نجات پروژه‌ها از کارهای کلیشه‌ای و تکراری طراحی شده است. شما می‌توانید با کلیک روی هر مرحله، بخش‌های مختلف را بررسی و تکمیل کنید. بخش برندینگ و مارکتینگ کاملاً تفکیک شده‌اند تا زمان و انرژی شما صرف اولویت واقعی شود.`,
                      ],
                    }),
                    a === 1 &&
                      (0, H.jsxs)(`div`, {
                        className: `bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-8 space-y-7 shadow-xs`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-baseline justify-between border-b border-neutral-200 pb-3`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900`,
                                children: `مرحله اول: غربالگری اولیه و انتخاب دپارتمان هدف`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-mono font-bold text-neutral-400`,
                                dir: `ltr`,
                                children: `01 // TRIAGE & TRACK SELECTION`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200`,
                            children: [
                              (0, H.jsxs)(`div`, {
                                children: [
                                  (0, H.jsx)(`label`, {
                                    className: `block text-xs font-bold text-neutral-800 mb-1.5`,
                                    children: `نام برند / کارفرما:`,
                                  }),
                                  (0, H.jsx)(`input`, {
                                    type: `text`,
                                    value: h.clientName,
                                    onChange: (e) =>
                                      g({ ...h, clientName: e.target.value }),
                                    placeholder: `مثال: هلدینگ یا استودیوی ...`,
                                    className: `w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`div`, {
                                children: [
                                  (0, H.jsx)(`label`, {
                                    className: `block text-xs font-bold text-neutral-800 mb-1.5`,
                                    children: `آدرس وب‌سایت یا اینستاگرام:`,
                                  }),
                                  (0, H.jsx)(`input`, {
                                    type: `text`,
                                    value: h.clientUrl,
                                    onChange: (e) =>
                                      g({ ...h, clientUrl: e.target.value }),
                                    placeholder: `مثال: @yourbrand یا website.com`,
                                    dir: `ltr`,
                                    className: `w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm text-left font-mono bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۱. صورت‌مسئله در یک جمله:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `بیزنس شما دقیقاً چه محصول یا خدمتی ارائه می‌دهد؟ (طوری توضیح دهید که یک آدم معمولی بدون کلمات تخصصی بفهمد)`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.problem,
                                onChange: (e) =>
                                  g({ ...h, problem: e.target.value }),
                                placeholder: `پاسخ کوتاه شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۲. سطح بازار و زنجیره ارزش:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `محصول یا خدمت شما در کدام رده و سطح از بازار عرضه می‌شود؟ (انتخابی / رادیوباتن)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1`,
                                children: [
                                  {
                                    id: `mass`,
                                    title: `اقتصادی و عمومی (Mass Market)`,
                                  },
                                  {
                                    id: `mid`,
                                    title: `میان‌رده باکیفیت (Mid-Tier Standard)`,
                                  },
                                  {
                                    id: `luxury`,
                                    title: `لوکس و پرمیوم / دارایی‌محور (High-Ticket)`,
                                  },
                                ].map((e) => {
                                  let t = h.marketTier === e.title;
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => {
                                        (W.playClick(),
                                          g({ ...h, marketTier: e.title }));
                                      },
                                      className: `p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(`span`, {
                                              className: `w-1.5 h-1.5 rounded-full bg-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e.title,
                                        }),
                                      ],
                                    },
                                    e.id,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-3 pt-2`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm sm:text-base font-black text-neutral-900`,
                                children: `۰۳. مسیر همکاری را انتخاب کنید:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `برای تفکیک دقیق استراتژی و اهداف، مشخص کنید در این مقطع به کدام دپارتمان نیاز دارید:`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1`,
                                children: [
                                  {
                                    id: `branding`,
                                    name: `دپارتمان برندینگ`,
                                    badge: `مسیر اول`,
                                    headline: `«ما کیستیم و جهان ما چه شکلی است؟»`,
                                    desc: `ساخت یا بازآفرینی لوگو، استراتژی، لحن، رنگ، تایپوگرافی، هویت فیزیکی و پرستیژ برند از پایه.`,
                                  },
                                  {
                                    id: `marketing`,
                                    name: `دپارتمان مارکتینگ`,
                                    badge: `مسیر دوم`,
                                    headline: `«چطور دیده شویم و بفروشیم؟»`,
                                    desc: `هویت داریم؛ نیازمند سناریونویسی، ویدیوهای سینمایی، استراتژی محتوا، هدایت پیج و جذب لید واقعی هستیم.`,
                                  },
                                  {
                                    id: `full`,
                                    name: `تحول کامل (هر دو مسیر)`,
                                    badge: `مسیر جامع`,
                                    headline: `«از هویت تا اولین کمپین لانچ»`,
                                    desc: `پروژه‌ای که می‌خواهد از صفر هویتش ساخته شود و بلافاصله اولین کمپین مارکتینگی آن لانچ گردد.`,
                                  },
                                ].map((e) => {
                                  let t = h.selectedTrack === e.name;
                                  return (0, H.jsx)(
                                    `div`,
                                    {
                                      onClick: () => {
                                        (W.playClick(),
                                          g({ ...h, selectedTrack: e.name }));
                                      },
                                      className: `p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${t ? `border-neutral-900 bg-white ring-2 ring-neutral-900 shadow-md` : `border-neutral-200 hover:border-neutral-300 bg-[#FAF9F6]`}`,
                                      children: (0, H.jsxs)(`div`, {
                                        children: [
                                          (0, H.jsx)(`span`, {
                                            className: `inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 mb-2`,
                                            children: e.badge,
                                          }),
                                          (0, H.jsx)(`h3`, {
                                            className: `font-black text-base text-neutral-900 mb-1.5`,
                                            children: e.name,
                                          }),
                                          (0, H.jsxs)(`p`, {
                                            className: `text-xs font-bold text-neutral-800 mb-2`,
                                            children: [`پاسخ به: `, e.headline],
                                          }),
                                          (0, H.jsx)(`p`, {
                                            className: `text-xs text-neutral-600 leading-relaxed`,
                                            children: e.desc,
                                          }),
                                        ],
                                      }),
                                    },
                                    e.id,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `pt-4 flex items-center justify-between border-t border-neutral-100`,
                            children: [
                              (0, H.jsx)(`div`, {}),
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: y,
                                className: `px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    children: `ادامه به مرحله بعد`,
                                  }),
                                  (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    a === 2 &&
                      (0, H.jsxs)(`div`, {
                        className: `bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-8 space-y-7 shadow-xs`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-baseline justify-between border-b border-neutral-200 pb-3`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900`,
                                children: `مرحله دوم: بریف دپارتمان برندینگ و معماری هویت`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-mono font-bold text-neutral-400`,
                                dir: `ltr`,
                                children: `TRACK A // BRAND ARCHITECTURE`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۱. جای خالی در جهان:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `اگر برند شما فردا صبح تعطیل شود، بازار چه چیزی را از دست می‌دهد که هیچ رقیب دیگری نمی‌تواند به آن بدهد؟`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.emptySpace,
                                onChange: (e) =>
                                  g({ ...h, emptySpace: e.target.value }),
                                placeholder: `پاسخ صریح شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۲. دشمن مشترک (The Anti-Thesis):`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `برند شما علیه چه چیزی در صنف خود قیام کرده است؟ چه رفتار زشتی در بازار هست که شما از آن متنفرید؟`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.enemy,
                                onChange: (e) =>
                                  g({ ...h, enemy: e.target.value }),
                                placeholder: `پاسخ شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۳. کاراکتر انسانی و استعاره برند:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `اگر برند شما یک آدم واقعی بود، چه تیپی می‌زد، چطور حرف می‌زد و شبیه کدام کاراکتر سینمایی رفتار می‌کرد؟`,
                              }),
                              (0, H.jsx)(`input`, {
                                type: `text`,
                                value: h.persona,
                                onChange: (e) =>
                                  g({ ...h, persona: e.target.value }),
                                placeholder: `مثال: یک معمار مینیمالیست با پالتوی مشکی، کم‌حرف، دقیق و خونسرد...`,
                                className: `w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۴. خروجی‌های مورد نیاز در فاز برندینگ:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `به کدام‌یک از موارد زیر نیاز دارید؟ (چندگزینه‌ای / چک‌باکس)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1`,
                                children: [
                                  `لوگوتایپ و سیستم نماد`,
                                  `معماری تایپوگرافی، پالت رنگ و گرید`,
                                  `کتابچه راهنمای جامع برند (Brand Book)`,
                                  `بسته‌بندی و هویت اقلام فیزیکی/چاپی`,
                                  `زبان عکاسی و آرت‌دایرکشن وب‌سایت`,
                                  `نام‌گذاری مجدد برند (Re-naming)`,
                                ].map((e) => {
                                  let t = h.brandingDeliverables.includes(e);
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => x(e),
                                      className: `p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(X, {
                                              className: `w-3 h-3 text-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e,
                                        }),
                                      ],
                                    },
                                    e,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `pt-4 flex items-center justify-between border-t border-neutral-100`,
                            children: [
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: b,
                                className: `px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer`,
                                children: [
                                  (0, H.jsx)(Zu, { className: `w-3.5 h-3.5` }),
                                  (0, H.jsx)(`span`, {
                                    children: `بازگشت به مرحله قبل`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: y,
                                className: `px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    children: `ادامه به بخش مارکتینگ`,
                                  }),
                                  (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    a === 3 &&
                      (0, H.jsxs)(`div`, {
                        className: `bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-8 space-y-7 shadow-xs`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-baseline justify-between border-b border-neutral-200 pb-3`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900`,
                                children: `مرحله سوم: بریف دپارتمان مارکتینگ، کمپین و محتوا`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-mono font-bold text-neutral-400`,
                                dir: `ltr`,
                                children: `TRACK B // MARKETING & CONTENT ENGINE`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۱. گلوگاه واقعی فروش و دیده‌شدن:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `بزرگ‌ترین درد تجاری شما در حال حاضر کجاست؟ (تک‌انتخابی / رادیوباتن)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1`,
                                children: [
                                  `اصلاً دیده نمی‌شویم (مشکل ریچ و ترافیک)`,
                                  `دیده می‌شویم اما اعتماد نمی‌کنند (مشکل پرستیژ و اعتبار)`,
                                  `ترافیک داریم اما خرید نمی‌کنند (مشکل سناریو و لید)`,
                                ].map((e) => {
                                  let t = h.bottleneck === e;
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => {
                                        (W.playClick(),
                                          g({ ...h, bottleneck: e }));
                                      },
                                      className: `p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(`span`, {
                                              className: `w-1.5 h-1.5 rounded-full bg-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e,
                                        }),
                                      ],
                                    },
                                    e,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۲. تردید و بهانه مشتری (The Objection):`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `مشتری بالقوه‌ای که محصول شما را می‌بیند اما در نهایت کارت نمی‌کشد، عمیقاً به چه چیزی شک دارد یا چه ترسی دارد؟`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.objection,
                                onChange: (e) =>
                                  g({ ...h, objection: e.target.value }),
                                placeholder: `پاسخ شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۳. کلیشه‌های خسته‌کننده رقبا:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `در صنف شما، رقبایتان در اینستاگرام چه کارهای تکراری یا بلاگری‌های نامناسبی انجام می‌دهند که شما از آن متنفرید؟`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.competitorCliches,
                                onChange: (e) =>
                                  g({
                                    ...h,
                                    competitorCliches: e.target.value,
                                  }),
                                placeholder: `پاسخ شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۴. خروجی رسانه‌ای مورد انتظار:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `انتظار تولید چه مدیایی را در این همکاری دارید؟ (چندگزینه‌ای / چک‌باکس)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1`,
                                children: [
                                  `ریتینر ماهانه (۱۰ ویدیوی سینمایی + استوری + هدایت پیج)`,
                                  `کمپین فصلی شاخص (فیلم‌های تبلیغاتی سینمایی برای لانچ)`,
                                  `مستندسازی تخصصی فضا، معماری یا پروژه`,
                                  `بازطراحی کامل چیدمان بصری و استایل صفحه اینستاگرام`,
                                ].map((e) => {
                                  let t = h.marketingMedia.includes(e);
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => C(e),
                                      className: `p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(X, {
                                              className: `w-3 h-3 text-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e,
                                        }),
                                      ],
                                    },
                                    e,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `pt-4 flex items-center justify-between border-t border-neutral-100`,
                            children: [
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: b,
                                className: `px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer`,
                                children: [
                                  (0, H.jsx)(Zu, { className: `w-3.5 h-3.5` }),
                                  (0, H.jsx)(`span`, {
                                    children: `بازگشت به مرحله قبل`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: y,
                                className: `px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    children: `ادامه به سلیقه و خط قرمز`,
                                  }),
                                  (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    a === 4 &&
                      (0, H.jsxs)(`div`, {
                        className: `bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-8 space-y-7 shadow-xs`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-baseline justify-between border-b border-neutral-200 pb-3`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900`,
                                children: `مرحله چهارم: سلیقه بصری و خطوط قرمز پروژه`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-mono font-bold text-neutral-400`,
                                dir: `ltr`,
                                children: `STEP 04 // TASTE & BOUNDARIES`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۱. مراجع تحسین‌شده (Aesthetic Benchmarks):`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `نام ۲ یا ۳ برند، فیلم یا پیج (ایرانی یا جهانی) که سلیقه، وقار یا کیفیت تصویر آن‌ها را قلباً تحسین می‌کنید بنویسید (چرا از آن‌ها خوشتان می‌آید؟):`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 4,
                                value: h.benchmarks,
                                onChange: (e) =>
                                  g({ ...h, benchmarks: e.target.value }),
                                placeholder: `۱. 
۲. 
۳.`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۲. خط قرمز سلیقه‌ای (Dealbreaker):`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `دیدن چه نوع فرمت، لحن، موزیک، افکت یا تصویری در خروجی کار، شما را عصبانی می‌کند و خط قرمز برند شماست؟`,
                              }),
                              (0, H.jsx)(`textarea`, {
                                rows: 3,
                                value: h.dealbreakers,
                                onChange: (e) =>
                                  g({ ...h, dealbreakers: e.target.value }),
                                placeholder: `پاسخ صریح شما...`,
                                className: `w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all resize-none leading-relaxed`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `pt-4 flex items-center justify-between border-t border-neutral-100`,
                            children: [
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: b,
                                className: `px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer`,
                                children: [
                                  (0, H.jsx)(Zu, { className: `w-3.5 h-3.5` }),
                                  (0, H.jsx)(`span`, {
                                    children: `بازگشت به مرحله قبل`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: y,
                                className: `px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs`,
                                children: [
                                  (0, H.jsx)(`span`, {
                                    children: `ادامه به لجستیک و مقیاس`,
                                  }),
                                  (0, H.jsx)(Xu, { className: `w-3.5 h-3.5` }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    a === 5 &&
                      (0, H.jsxs)(`div`, {
                        className: `bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-8 space-y-7 shadow-xs`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            className: `flex items-baseline justify-between border-b border-neutral-200 pb-3`,
                            children: [
                              (0, H.jsx)(`h2`, {
                                className: `text-base sm:text-lg font-black text-neutral-900`,
                                children: `مرحله پنجم: لجستیک، مقیاس پروداکشن و فرآیند تصمیم‌گیری`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `text-xs font-mono font-bold text-neutral-400`,
                                dir: `ltr`,
                                children: `STEP 05 // LOGISTICS & SCALE`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-1.5`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۱. ددلاین و زمان‌بندی انتشار:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `پروژه دقیقاً تا چه تاریخی باید آماده تحویل یا لانچ نهایی باشد؟`,
                              }),
                              (0, H.jsx)(`input`, {
                                type: `text`,
                                value: h.deadline,
                                onChange: (e) =>
                                  g({ ...h, deadline: e.target.value }),
                                placeholder: `مثال: تا انتهای ماه آینده / تا تاریخ ...`,
                                className: `w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-xs sm:text-sm bg-white text-neutral-900 placeholder-neutral-400 outline-none transition-all`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۲. مقیاس اجرایی و سطح پروداکشن مدنظر:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `مشخص کردن این موضوع به ما اجازه می‌دهد معماری تیم، تایم‌لاین و دامنه خروجی‌ها را متناسب با هدف تجاری شما تنظیم کنیم: (تک‌انتخابی / رادیوباتن)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1`,
                                children: [
                                  `اسپرینت چابک و متمرکز (خروجی سریع و مینیمال)`,
                                  `پروداکشن استاندارد استودیو (پکیج جامع با تست و نظارت کامل)`,
                                  `پروداکشن پرچمدار و شاخص (رویکرد سفارشی و چندرشته‌ای)`,
                                  `همکاری بلندمدت و کانسلری فصلی (نظارت مستمر و توسعه فازبه‌فاز)`,
                                ].map((e) => {
                                  let t = h.productionScale === e;
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => {
                                        (W.playClick(),
                                          g({ ...h, productionScale: e }));
                                      },
                                      className: `p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(`span`, {
                                              className: `w-1.5 h-1.5 rounded-full bg-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e,
                                        }),
                                      ],
                                    },
                                    e,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `space-y-2`,
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-sm font-black text-neutral-900`,
                                children: `۰۳. ساختار تصمیم‌گیری نهایی:`,
                              }),
                              (0, H.jsx)(`span`, {
                                className: `block text-xs text-neutral-500`,
                                children: `در فرآیند بررسی اتودها و سناریوها، تأیید نهایی بر عهده چه کسی است؟ (تک‌انتخابی / رادیوباتن)`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1`,
                                children: [
                                  `شخص خودم (یک تصمیم‌گیرنده واحد)`,
                                  `جلسه شرکا / هیئت مدیره (چند نفر)`,
                                ].map((e) => {
                                  let t = h.decisionStructure === e;
                                  return (0, H.jsxs)(
                                    `div`,
                                    {
                                      onClick: () => {
                                        (W.playClick(),
                                          g({ ...h, decisionStructure: e }));
                                      },
                                      className: `p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${t ? `border-neutral-900 bg-neutral-900 text-white font-bold shadow-xs` : `border-neutral-200 hover:border-neutral-300 bg-neutral-50/60 text-neutral-800`}`,
                                      children: [
                                        (0, H.jsx)(`span`, {
                                          className: `w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t ? `border-white bg-white` : `border-neutral-400`}`,
                                          children:
                                            t &&
                                            (0, H.jsx)(`span`, {
                                              className: `w-1.5 h-1.5 rounded-full bg-neutral-900`,
                                            }),
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `text-xs`,
                                          children: e,
                                        }),
                                      ],
                                    },
                                    e,
                                  );
                                }),
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 border-r-4 border-r-amber-500 space-y-3`,
                            children: [
                              (0, H.jsxs)(`div`, {
                                children: [
                                  (0, H.jsx)(`strong`, {
                                    className: `block text-sm sm:text-base font-black text-neutral-900`,
                                    children: `ارسال پاسخ‌ها به استودیو`,
                                  }),
                                  (0, H.jsx)(`p`, {
                                    className: `text-xs text-neutral-600 mt-1 leading-relaxed`,
                                    children: `پاسخ‌های شما در سیستم ذخیره شده‌اند. با کلیک روی دکمه‌های زیر، می‌توانید متن کامل فرم را جهت ارسال سریع در تلگرام/چت کپی کنید یا مستقیماً بریف را در استودیو ثبت فرمایید.`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`div`, {
                                className: `flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1`,
                                children: [
                                  (0, H.jsx)(`button`, {
                                    type: `button`,
                                    onClick: w,
                                    className: `flex-1 py-3 px-4 rounded-xl bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98`,
                                    children: d
                                      ? (0, H.jsxs)(H.Fragment, {
                                          children: [
                                            (0, H.jsx)(X, {
                                              className: `w-4 h-4 text-emerald-600`,
                                            }),
                                            (0, H.jsx)(`span`, {
                                              className: `text-emerald-700 font-black`,
                                              children: `✓ متن خلاصه بریف کپی شد!`,
                                            }),
                                          ],
                                        })
                                      : (0, H.jsxs)(H.Fragment, {
                                          children: [
                                            (0, H.jsx)(od, {
                                              className: `w-4 h-4 text-neutral-600`,
                                            }),
                                            (0, H.jsx)(`span`, {
                                              children: `📋 کپی خلاصه بریف جهت ارسال در چت`,
                                            }),
                                          ],
                                        }),
                                  }),
                                  (0, H.jsxs)(`button`, {
                                    type: `submit`,
                                    className: `flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98`,
                                    children: [
                                      (0, H.jsx)(jd, {
                                        className: `w-4 h-4 text-amber-300`,
                                      }),
                                      (0, H.jsx)(`span`, {
                                        children: `ثبت رسمی و الکترونیکی بریف در استودیو 🚀`,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `pt-4 flex items-center justify-between border-t border-neutral-100`,
                            children: [
                              (0, H.jsxs)(`button`, {
                                type: `button`,
                                onClick: b,
                                className: `px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer`,
                                children: [
                                  (0, H.jsx)(Zu, { className: `w-3.5 h-3.5` }),
                                  (0, H.jsx)(`span`, {
                                    children: `بازگشت به مرحله قبل`,
                                  }),
                                ],
                              }),
                              (0, H.jsx)(`div`, {}),
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
          }),
          (0, H.jsxs)(`div`, {
            dir: `ltr`,
            className: `border-t border-neutral-200/90 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-neutral-500 bg-white select-none shrink-0`,
            children: [
              (0, H.jsx)(`div`, {
                children: `CREATIVITY JUICE // INTAKE PROTOCOL`,
              }),
              (0, H.jsx)(`div`, {
                className: `font-bold text-neutral-800`,
                children: `PROCESSED WITHIN 48 HOURS // AUTEUR PRACTICE`,
              }),
            ],
          }),
        ],
      }),
    });
  },
  ef = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onOpenContact: i,
  }) => {
    let [a, o] = (0, S.useState)(`services`),
      s = (e) => {
        (W.playClick(), o(e));
      };
    return (0, H.jsx)(Ud, {
      id: `agency-dossier`,
      title: `Agency Dossier: ${Bu.name} • ${Bu.email}`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[94vw] sm:w-[88vw] md:w-[78vw] lg:w-[65vw]`,
      maxWidth: `max-w-4xl`,
      children: (0, H.jsxs)(`div`, {
        className: `flex flex-col md:flex-row min-h-[500px] bg-[#EFEBEA]`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `w-full md:w-52 bg-[#E8E4E3] border-b md:border-b-0 md:border-r border-black/15 p-3 flex md:flex-col justify-between shrink-0`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex md:flex-col space-x-1 md:space-x-0 md:space-y-1 w-full`,
                children: [
                  (0, H.jsxs)(`button`, {
                    onClick: () => s(`services`),
                    className: `flex-1 md:flex-none flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${a === `services` ? `bg-white shadow-xs text-neutral-900 font-semibold` : `text-neutral-600 hover:bg-black/5 hover:text-neutral-900`}`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Services Menu` }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] opacity-60 bg-amber-500/15 text-amber-900 px-1.5 py-0.5 rounded-full font-bold`,
                        children: `6`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => s(`stats`),
                    className: `flex-1 md:flex-none flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${a === `stats` ? `bg-white shadow-xs text-neutral-900 font-semibold` : `text-neutral-600 hover:bg-black/5 hover:text-neutral-900`}`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Capabilities & Stats` }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] opacity-60 bg-black/5 px-1.5 py-0.5 rounded-full`,
                        children: `10`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => s(`timeline`),
                    className: `flex-1 md:flex-none flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${a === `timeline` ? `bg-white shadow-xs text-neutral-900 font-semibold` : `text-neutral-600 hover:bg-black/5 hover:text-neutral-900`}`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Agency Journey` }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] opacity-60 bg-black/5 px-1.5 py-0.5 rounded-full`,
                        children: `15+`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`button`, {
                    onClick: () => s(`bts`),
                    className: `flex-1 md:flex-none flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${a === `bts` ? `bg-white shadow-xs text-neutral-900 font-semibold` : `text-neutral-600 hover:bg-black/5 hover:text-neutral-900`}`,
                    children: [
                      (0, H.jsx)(`span`, { children: `Studio Diary` }),
                      (0, H.jsx)(`span`, {
                        className: `text-[10px] opacity-60 bg-black/5 px-1.5 py-0.5 rounded-full`,
                        children: `∞`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `hidden md:flex flex-col space-y-2 pt-4 border-t border-black/10 text-[11px] text-neutral-600`,
                children: [
                  (0, H.jsx)(`div`, {
                    className: `text-[10px] uppercase font-bold text-neutral-400`,
                    children: `Direct Inquiries`,
                  }),
                  (0, H.jsxs)(`a`, {
                    href: `mailto:hello@creativityjuice.com`,
                    className: `flex items-center space-x-1.5 hover:text-black transition-colors`,
                    children: [
                      (0, H.jsx)(vd, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `hello@creativityjuice.com`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`a`, {
                    href: `https://www.instagram.com/`,
                    target: `_blank`,
                    rel: `noopener noreferrer`,
                    className: `flex items-center space-x-1.5 hover:text-black transition-colors`,
                    children: [
                      (0, H.jsx)(md, {
                        className: `w-3.5 h-3.5 text-neutral-700`,
                      }),
                      (0, H.jsx)(`span`, { children: `@creativityjuice` }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-1.5 text-neutral-400 pt-1`,
                    children: [
                      (0, H.jsx)(yd, { className: `w-3 h-3` }),
                      (0, H.jsx)(`span`, {
                        children: `Global Creative Studio`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `flex-1 p-5 sm:p-7 overflow-y-auto max-h-[72vh] bg-white text-neutral-900`,
            children: [
              a === `services` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1`,
                          children: `Agency Philosophy & Mission`,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-base sm:text-lg font-normal leading-relaxed text-neutral-900`,
                          children: Bu.bio,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-2 border-t border-black/10`,
                      children: [
                        (0, H.jsx)(`h3`, {
                          className: `text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3.5`,
                          children: `Core Service Pillars`,
                        }),
                        (0, H.jsx)(`div`, {
                          className: `grid grid-cols-1 sm:grid-cols-2 gap-3`,
                          children: Bu.services.map((e, t) =>
                            (0, H.jsxs)(
                              `div`,
                              {
                                className: `p-3.5 rounded-lg border border-black/5 bg-[#FAF8F7] hover:border-black/15 transition-all`,
                                children: [
                                  (0, H.jsxs)(`h4`, {
                                    className: `text-xs sm:text-sm font-bold text-neutral-900 mb-1 flex items-center gap-1.5`,
                                    children: [
                                      (0, H.jsx)(`span`, {
                                        className: `w-1.5 h-1.5 rounded-full bg-amber-500`,
                                      }),
                                      e.title,
                                    ],
                                  }),
                                  (0, H.jsx)(`p`, {
                                    className: `text-xs text-neutral-600 leading-relaxed font-normal`,
                                    children: e.desc,
                                  }),
                                ],
                              },
                              t,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-4 flex flex-wrap gap-2.5 border-t border-black/10`,
                      children: [
                        i &&
                          (0, H.jsxs)(`button`, {
                            onClick: i,
                            className: `inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold tracking-tight shadow-xs transition-all active:scale-98`,
                            children: [
                              (0, H.jsx)(Pd, {
                                className: `w-3.5 h-3.5 text-amber-400`,
                              }),
                              (0, H.jsx)(`span`, {
                                children: `Submit a Project Brief`,
                              }),
                              (0, H.jsx)(Qu, {
                                className: `w-3 h-3 opacity-60`,
                              }),
                            ],
                          }),
                        (0, H.jsxs)(`a`, {
                          href: `mailto:hello@creativityjuice.com`,
                          className: `inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold tracking-tight transition-all active:scale-98`,
                          children: [
                            (0, H.jsx)(vd, {
                              className: `w-3.5 h-3.5 text-neutral-700`,
                            }),
                            (0, H.jsx)(`span`, {
                              children: `Email Agency Partners`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              a === `stats` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-2`,
                          children: `Proven Impact & Performance`,
                        }),
                        (0, H.jsx)(`div`, {
                          className: `grid grid-cols-2 sm:grid-cols-4 gap-2.5`,
                          children: Bu.stats.map((e, t) =>
                            (0, H.jsxs)(
                              `div`,
                              {
                                className: `p-3 bg-[#FAF8F7] border border-black/5 rounded-lg text-center`,
                                children: [
                                  (0, H.jsx)(`div`, {
                                    className: `text-xl sm:text-2xl font-black text-neutral-900 tracking-tight`,
                                    children: e.value,
                                  }),
                                  (0, H.jsx)(`div`, {
                                    className: `text-[10px] text-neutral-500 font-medium mt-0.5`,
                                    children: e.label,
                                  }),
                                ],
                              },
                              t,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-3 border-t border-black/10`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-3`,
                          children: `Full Spectrum Capabilities`,
                        }),
                        (0, H.jsx)(`div`, {
                          className: `grid grid-cols-1 sm:grid-cols-2 gap-2`,
                          children: Bu.capabilities.map((e) =>
                            (0, H.jsxs)(
                              `div`,
                              {
                                className: `flex items-center space-x-2.5 p-2 rounded-md hover:bg-neutral-50 transition-colors`,
                                children: [
                                  (0, H.jsx)(`div`, {
                                    className: `w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-xs`,
                                    children: (0, H.jsx)(X, {
                                      className: `w-2.5 h-2.5 stroke-[3]`,
                                    }),
                                  }),
                                  (0, H.jsx)(`span`, {
                                    className: `text-xs sm:text-sm font-medium text-neutral-800`,
                                    children: e,
                                  }),
                                ],
                              },
                              e,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
              a === `timeline` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-6 animate-window-pop`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-2`,
                          children: `Agency Trajectory`,
                        }),
                        (0, H.jsx)(`div`, {
                          className: `space-y-3.5`,
                          children: Bu.timeline.map((e, t) =>
                            (0, H.jsxs)(
                              `div`,
                              {
                                className: `p-3.5 rounded-lg border border-black/5 bg-[#FAF8F7] hover:border-black/15 transition-all`,
                                children: [
                                  (0, H.jsxs)(`div`, {
                                    className: `flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1`,
                                    children: [
                                      (0, H.jsxs)(`h4`, {
                                        className: `text-sm font-bold text-neutral-900`,
                                        children: [
                                          e.agency,
                                          ` `,
                                          (0, H.jsxs)(`span`, {
                                            className: `font-normal text-neutral-600`,
                                            children: [`— `, e.role],
                                          }),
                                        ],
                                      }),
                                      (0, H.jsx)(`span`, {
                                        className: `text-[11px] font-mono text-neutral-500`,
                                        children: e.period,
                                      }),
                                    ],
                                  }),
                                  (0, H.jsx)(`p`, {
                                    className: `text-xs text-neutral-600 leading-relaxed font-normal`,
                                    children: e.details,
                                  }),
                                ],
                              },
                              t,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      className: `pt-3 border-t border-black/10`,
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2.5`,
                          children: `Selected Brands & Partners`,
                        }),
                        (0, H.jsx)(`div`, {
                          className: `flex flex-wrap gap-1.5`,
                          children: Bu.clients.map((e) =>
                            (0, H.jsx)(
                              `span`,
                              {
                                className: `px-2.5 py-1 rounded-md bg-neutral-100 text-xs font-semibold text-neutral-800 border border-black/5`,
                                children: e,
                              },
                              e,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
              a === `bts` &&
                (0, H.jsxs)(`div`, {
                  className: `space-y-4 animate-window-pop`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`span`, {
                          className: `text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1`,
                          children: `Behind the Squeeze`,
                        }),
                        (0, H.jsx)(`p`, {
                          className: `text-xs text-neutral-600`,
                          children: `Proofing packaging colors, editorial camera setups, strategy whiteboards, and studio life.`,
                        }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2`,
                      children: Bu.behindTheScenes.map((e) =>
                        (0, H.jsxs)(
                          `div`,
                          {
                            className: `group relative aspect-[3/4] rounded-lg overflow-hidden bg-neutral-100 border border-black/10 shadow-xs`,
                            children: [
                              (0, H.jsx)(`img`, {
                                src: e.url,
                                alt: e.title,
                                loading: `lazy`,
                                className: `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end`,
                                children: (0, H.jsx)(`span`, {
                                  className: `text-[10px] text-white font-medium leading-tight`,
                                  children: e.title,
                                }),
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
    });
  },
  tf = ({ onClose: e, zIndex: t, onFocus: n, containerRef: r }) => {
    let [i, a] = (0, S.useState)(!1),
      [o, s] = (0, S.useState)({
        name: ``,
        email: ``,
        company: ``,
        service: `Full Rebranding & Strategy`,
        budget: `$15k — $30k`,
        message: ``,
      });
    return (0, H.jsx)(Ud, {
      id: `contact-window`,
      title: `Creativity Juice • Project Inquiry & Brief`,
      subtitle: `Let's build something unforgettable`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[94vw] sm:w-[86vw] md:w-[72vw] lg:w-[58vw]`,
      maxWidth: `max-w-3xl`,
      children: (0, H.jsx)(`div`, {
        className: `bg-white min-h-[460px] p-6 sm:p-8 text-neutral-900`,
        children: i
          ? (0, H.jsxs)(`div`, {
              className: `py-16 text-center space-y-4 animate-window-pop`,
              children: [
                (0, H.jsx)(`div`, {
                  className: `w-14 h-14 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto shadow-xs border border-neutral-300`,
                  children: (0, H.jsx)(rd, { className: `w-8 h-8` }),
                }),
                (0, H.jsxs)(`div`, {
                  children: [
                    (0, H.jsx)(`h3`, {
                      className: `text-xl font-bold text-neutral-900`,
                      children: `Brief Received!`,
                    }),
                    (0, H.jsxs)(`p`, {
                      className: `text-sm text-neutral-600 mt-1 max-w-md mx-auto leading-relaxed`,
                      children: [
                        `Thank you, `,
                        (0, H.jsx)(`span`, {
                          className: `font-semibold text-neutral-900`,
                          children: o.name,
                        }),
                        `. Our partners at `,
                        (0, H.jsx)(`strong`, { children: `Creativity Juice` }),
                        ` have received your brief for `,
                        (0, H.jsxs)(`span`, {
                          className: `text-neutral-900 font-medium`,
                          children: [`"`, o.service, `"`],
                        }),
                        ` and will reach out to `,
                        (0, H.jsx)(`span`, {
                          className: `font-mono text-neutral-900`,
                          children: o.email,
                        }),
                        ` within 24 hours.`,
                      ],
                    }),
                  ],
                }),
                (0, H.jsx)(`div`, {
                  className: `pt-4`,
                  children: (0, H.jsx)(`button`, {
                    onClick: () => a(!1),
                    className: `px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-all`,
                    children: `Submit another request`,
                  }),
                }),
              ],
            })
          : (0, H.jsxs)(`form`, {
              onSubmit: (e) => {
                (e.preventDefault(), W.playWindowOpen(), a(!0));
              },
              className: `space-y-6`,
              children: [
                (0, H.jsxs)(`div`, {
                  children: [
                    (0, H.jsx)(`span`, {
                      className: `text-[11px] font-semibold uppercase tracking-wider text-amber-600 block mb-1`,
                      children: `Start a Collaboration`,
                    }),
                    (0, H.jsx)(`h2`, {
                      className: `text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900`,
                      children: `Ready for fresh-squeezed creative strategy?`,
                    }),
                    (0, H.jsx)(`p`, {
                      className: `text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed`,
                      children: `Tell us about your brand, challenges, and timeline. Our partners reply within 24 hours.`,
                    }),
                  ],
                }),
                (0, H.jsxs)(`div`, {
                  className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-semibold text-neutral-700 mb-1`,
                          children: `Your Name *`,
                        }),
                        (0, H.jsx)(`input`, {
                          type: `text`,
                          required: !0,
                          value: o.name,
                          onChange: (e) => s({ ...o, name: e.target.value }),
                          placeholder: `e.g. Alex Morgan`,
                          className: `w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-neutral-50/50`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-semibold text-neutral-700 mb-1`,
                          children: `Work Email *`,
                        }),
                        (0, H.jsx)(`input`, {
                          type: `email`,
                          required: !0,
                          value: o.email,
                          onChange: (e) => s({ ...o, email: e.target.value }),
                          placeholder: `alex@company.com`,
                          className: `w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-neutral-50/50`,
                        }),
                      ],
                    }),
                  ],
                }),
                (0, H.jsxs)(`div`, {
                  className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-semibold text-neutral-700 mb-1`,
                          children: `Company / Brand Name`,
                        }),
                        (0, H.jsx)(`input`, {
                          type: `text`,
                          value: o.company,
                          onChange: (e) => s({ ...o, company: e.target.value }),
                          placeholder: `e.g. Acme Beverage Co.`,
                          className: `w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-neutral-50/50`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`div`, {
                      children: [
                        (0, H.jsx)(`label`, {
                          className: `block text-xs font-semibold text-neutral-700 mb-1`,
                          children: `Estimated Budget`,
                        }),
                        (0, H.jsx)(`select`, {
                          value: o.budget,
                          onChange: (e) => s({ ...o, budget: e.target.value }),
                          className: `w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-neutral-50/50`,
                          children: [
                            `< $10,000`,
                            `$10,000 — $25,000`,
                            `$25,000 — $50,000`,
                            `$50,000 — $100,000+`,
                          ].map((e) =>
                            (0, H.jsx)(`option`, { value: e, children: e }, e),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, H.jsxs)(`div`, {
                  children: [
                    (0, H.jsx)(`label`, {
                      className: `block text-xs font-semibold text-neutral-700 mb-1.5`,
                      children: `Primary Service Needed`,
                    }),
                    (0, H.jsx)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-2 gap-2`,
                      children: [
                        `Brand Strategy & Visual Identity`,
                        `Full Rebranding & Architecture`,
                        `360° Product Launch Campaign`,
                        `Performance Marketing & Paid Social`,
                        `Packaging & CPG Design`,
                        `Content Production & Motion CGI`,
                      ].map((e) =>
                        (0, H.jsx)(
                          `button`,
                          {
                            type: `button`,
                            onClick: () => {
                              (W.playClick(), s({ ...o, service: e }));
                            },
                            className: `text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${o.service === e ? `border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-xs` : `border-neutral-200 bg-neutral-50/50 text-neutral-700 hover:bg-neutral-100`}`,
                            children: e,
                          },
                          e,
                        ),
                      ),
                    }),
                  ],
                }),
                (0, H.jsxs)(`div`, {
                  children: [
                    (0, H.jsx)(`label`, {
                      className: `block text-xs font-semibold text-neutral-700 mb-1`,
                      children: `Project Overview & Goals`,
                    }),
                    (0, H.jsx)(`textarea`, {
                      rows: 3,
                      value: o.message,
                      onChange: (e) => s({ ...o, message: e.target.value }),
                      placeholder: `Share your goals, current challenges, target audience, or launch deadlines...`,
                      className: `w-full px-3.5 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all bg-neutral-50/50`,
                    }),
                  ],
                }),
                (0, H.jsxs)(`div`, {
                  className: `pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `text-[11px] text-neutral-500 flex items-center space-x-1.5`,
                      children: [
                        (0, H.jsx)(vd, {
                          className: `w-3.5 h-3.5 text-amber-600`,
                        }),
                        (0, H.jsx)(`span`, {
                          children: `Direct inquiries: hello@creativityjuice.com`,
                        }),
                      ],
                    }),
                    (0, H.jsxs)(`button`, {
                      type: `submit`,
                      className: `inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-md transition-all active:scale-98`,
                      children: [
                        (0, H.jsx)(`span`, { children: `Send Brief Proposal` }),
                        (0, H.jsx)(jd, { className: `w-3.5 h-3.5` }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
      }),
    });
  },
  nf = ({
    appTitle: e,
    message: t,
    buttonText: n,
    icon: r,
    onDismiss: i,
    zIndex: a,
  }) => {
    let o = () => {
      (W.playClick(), i());
    };
    return (0, H.jsxs)(`div`, {
      className: `fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto`,
      style: { zIndex: a },
      children: [
        (0, H.jsx)(ku.div, {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: o,
          className: `fixed inset-0 bg-black/40 backdrop-blur-xs`,
        }),
        (0, H.jsxs)(ku.div, {
          drag: !0,
          dragMomentum: !1,
          initial: { opacity: 0, scale: 0.9, y: 10 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.92, y: 10 },
          transition: { type: `spring`, stiffness: 420, damping: 26 },
          className: `relative z-10 w-full max-w-sm rounded-xl bg-[#232326] text-white p-5 border border-white/15 shadow-2xl flex flex-col space-y-4 select-none cursor-grab active:cursor-grabbing`,
          children: [
            (0, H.jsxs)(`div`, {
              className: `flex items-center space-x-3`,
              children: [
                (0, H.jsx)(`div`, {
                  className: `w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/30 p-1 flex items-center justify-center shadow-inner`,
                  children: (0, H.jsx)(`img`, {
                    src: r,
                    alt: e,
                    className: `w-full h-full object-contain pointer-events-none`,
                  }),
                }),
                (0, H.jsxs)(`div`, {
                  children: [
                    (0, H.jsx)(`h3`, {
                      className: `text-sm font-semibold tracking-tight text-white/95`,
                      children: e,
                    }),
                    (0, H.jsx)(`span`, {
                      className: `text-[10px] text-amber-400 font-medium`,
                      children: `System Alert • Action Required`,
                    }),
                  ],
                }),
              ],
            }),
            (0, H.jsx)(`p`, {
              className: `text-xs text-neutral-300 leading-relaxed pl-1 font-normal`,
              children: t,
            }),
            (0, H.jsx)(`div`, {
              className: `pt-2 flex justify-end`,
              children: (0, H.jsx)(`button`, {
                onClick: o,
                className: `px-4 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-white text-xs font-medium border border-white/15 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-blue-500`,
                children: n,
              }),
            }),
          ],
        }),
      ],
    });
  },
  rf = ({ onClose: e, zIndex: t, onFocus: n, containerRef: r }) => {
    let [i, a] = (0, S.useState)(Ru),
      [o, s] = (0, S.useState)(!1),
      c = () => {
        (W.playTrash(), a([]), s(!0));
      },
      l = () => {
        (W.playWindowOpen(), a(Ru), s(!1));
      },
      u = (e) =>
        e.endsWith(`.ai`) || e.endsWith(`.ase`)
          ? (0, H.jsx)(cd, { className: `w-5 h-5 text-amber-600` })
          : e.endsWith(`.pdf`) || e.endsWith(`.pptx`)
            ? (0, H.jsx)(ud, { className: `w-5 h-5 text-red-500` })
            : (0, H.jsx)(ld, { className: `w-5 h-5 text-blue-500` });
    return (0, H.jsx)(Ud, {
      id: `bin-window`,
      title: `Bin of Bad Ideas & Cliché Briefs`,
      subtitle: `${i.length} discarded requests`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[92vw] sm:w-[80vw] md:w-[62vw] lg:w-[48vw]`,
      maxWidth: `max-w-2xl`,
      headerRightContent:
        i.length > 0
          ? (0, H.jsxs)(`button`, {
              onClick: c,
              className: `text-[11px] text-red-600 hover:text-red-700 font-medium px-2 py-0.5 rounded hover:bg-black/5 transition-colors flex items-center space-x-1`,
              children: [
                (0, H.jsx)(Id, { className: `w-3 h-3` }),
                (0, H.jsx)(`span`, { children: `Empty` }),
              ],
            })
          : null,
      children: (0, H.jsxs)(`div`, {
        className: `p-5 sm:p-6 bg-white min-h-[340px] flex flex-col justify-between`,
        children: [
          i.length > 0
            ? (0, H.jsxs)(`div`, {
                className: `space-y-3`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `text-xs text-neutral-500 pb-2 border-b border-black/10 flex items-center justify-between`,
                    children: [
                      (0, H.jsxs)(`span`, {
                        children: [`Discarded Clichés (`, i.length, `)`],
                      }),
                      (0, H.jsx)(`span`, {
                        className: `text-[11px]`,
                        children: `Filtered out by Creativity Juice`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`div`, {
                    className: `space-y-2`,
                    children: i.map((e, t) =>
                      (0, H.jsxs)(
                        `div`,
                        {
                          className: `p-3 rounded-lg border border-black/5 bg-[#FAF8F7] hover:bg-[#F3EFEB] transition-colors flex items-start space-x-3 group`,
                          children: [
                            (0, H.jsx)(`div`, {
                              className: `p-2 rounded bg-white border border-black/10 shadow-xs shrink-0 mt-0.5`,
                              children: u(e.title),
                            }),
                            (0, H.jsxs)(`div`, {
                              className: `flex-1 min-w-0`,
                              children: [
                                (0, H.jsxs)(`div`, {
                                  className: `flex items-baseline justify-between gap-2`,
                                  children: [
                                    (0, H.jsx)(`span`, {
                                      className: `text-xs font-semibold text-neutral-900 truncate block font-mono`,
                                      children: e.title,
                                    }),
                                    (0, H.jsx)(`span`, {
                                      className: `text-[10px] font-mono text-neutral-400 shrink-0`,
                                      children: e.size,
                                    }),
                                  ],
                                }),
                                (0, H.jsxs)(`p`, {
                                  className: `text-[11px] text-neutral-600 mt-0.5 italic`,
                                  children: [`"`, e.note, `"`],
                                }),
                                (0, H.jsx)(`span`, {
                                  className: `text-[10px] text-neutral-400 block mt-1`,
                                  children: e.date,
                                }),
                              ],
                            }),
                          ],
                        },
                        t,
                      ),
                    ),
                  }),
                ],
              })
            : (0, H.jsxs)(`div`, {
                className: `py-12 flex flex-col items-center justify-center text-center space-y-3`,
                children: [
                  (0, H.jsx)(`div`, {
                    className: `w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-xs`,
                    children: (0, H.jsx)(Pd, { className: `w-6 h-6` }),
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`h4`, {
                        className: `text-sm font-bold text-neutral-900`,
                        children: `Bin is 100% Cliché-Free!`,
                      }),
                      (0, H.jsx)(`p`, {
                        className: `text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed`,
                        children: `Only pure, high-potency marketing and brand strategy left on the table.`,
                      }),
                    ],
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: l,
                    className: `text-xs font-medium text-amber-600 hover:text-amber-700 underline pt-2`,
                    children: `Restore client clichés`,
                  }),
                ],
              }),
          (0, H.jsxs)(`div`, {
            className: `pt-4 border-t border-black/10 text-[11px] text-neutral-400 flex items-center justify-between`,
            children: [
              (0, H.jsx)(`span`, {
                children: `Bin path: ~/CreativityJuice/Trash/BadBriefs`,
              }),
              (0, H.jsx)(`span`, { children: `Filtered by Brand Standards` }),
            ],
          }),
        ],
      }),
    });
  },
  af = `creativity_juice_projects_v2`,
  of = INITIAL_PROJECTS,
  sf = [
    {
      id: `arch-minimal`,
      label: `معماری و فضا`,
      url: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `fashion-editorial`,
      label: `مد و فشن آنالوگ`,
      url: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `packaging-luxury`,
      label: `بسته‌بندی و شیشه`,
      url: `https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `cpg-beverage`,
      label: `نوشیدنی و متالیک`,
      url: `https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `tech-minimal`,
      label: `تکنولوژی و فین‌تک`,
      url: `https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `organic-skincare`,
      label: `محصولات طبیعی و کهربایی`,
      url: `https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `typography-poster`,
      label: `تایپوگرافی و ادیتوریال`,
      url: `https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85`,
    },
    {
      id: `cinema-motion`,
      label: `سینما و نورپردازی`,
      url: `https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85`,
    },
  ],
  cf = () => {
    if (typeof window > `u`) return of;
    try {
      let items = getProjects();
      if (Array.isArray(items) && items.length > 0) {
        return items.map((p) => ({
          ...p,
          title: p.title || '',
          subtitle: p.subtitle || '',
          client: p.client || 'کارفرمای اختصاصی',
          year: p.year || '۱۴۰۳',
          category: p.categoryLabel || p.category || 'معماری و هویت برند',
          categoryLabel: p.categoryLabel || p.category || 'معماری و هویت برند',
          deptTrack: p.deptTrack || p.trackCode || 'TRACK 01 // BRAND IDENTITY',
          role: p.role || 'استراتژیست هویت و آرت‌دایرکتور',
          description: p.description || (p.challenge ? `${p.challenge}\n\n${p.solution || ''}`.trim() : ''),
          coverImage: p.coverImage || sf[0].url,
          highResImage: p.highResImage || p.coverImage || sf[0].url,
          metrics: p.metrics || '',
          deliverables: Array.isArray(p.deliverables) && p.deliverables.length > 0 ? p.deliverables : ['هویت بصری جامع', 'کتابچه استراتژی'],
          tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['استودیو', 'دیزاین'],
          desktopPos: p.desktopPos || { top: 61, left: 21, mobileTop: 36, mobileLeft: 56 },
        }));
      }
    } catch (e) {
      console.error(`Failed to read projects from adminStore`, e);
    }
    return of;
  },
  lf = (e) => {
    if (typeof window < `u`)
      try {
        saveProjects(e);
        localStorage.setItem(af, JSON.stringify(e));
        window.dispatchEvent(
          new CustomEvent(`projects-updated`, { detail: e }),
        );
        window.dispatchEvent(
          new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'projects', count: e.length } }),
        );
      } catch (e) {
        console.error(`Failed to save projects to localStorage`, e);
      }
  },
  uf = (e) => {
    saveProject(e);
    return cf();
  },
  df = (e) => {
    saveProject(e);
    return cf();
  },
  ff = (e) => {
    deleteProject(e);
    return cf();
  },
  pf = () => {
    let seeds = getProjects();
    return seeds;
  },
  Z = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onSelectProject: i,
    onOpenBrief: a,
  }) =>
    (0, H.jsx)(Ud, {
      id: `gallery-window`,
      title: `گالری آثار و پرونده‌های استودیو • Portfolio Gallery`,
      subtitle: `پرونده‌های شاخص هویت برند، سینمای تجاری، بسته‌بندی و ادیتوریال`,
      onClose: e,
      zIndex: t,
      onFocus: n,
      containerRef: r,
      width: `w-[96vw] sm:w-[92vw] md:w-[86vw] lg:w-[82vw]`,
      maxWidth: `max-w-6xl`,
      children: (0, H.jsx)(PortfolioGallery, {
        onOpenBriefWithProject: (projTitle) => {
          e && e();
          a && a(projTitle);
        },
      }),
    }),
  mf = ({
    currentWallpaper: e,
    onSelectWallpaper: t,
    onClose: n,
    zIndex: r,
    onFocus: i,
    containerRef: a,
  }) => {
    let [cUrl, setCUrl] = (0, S.useState)(``),
      [msg, setMsg] = (0, S.useState)(``),
      [msgType, setMsgType] = (0, S.useState)(`success`),
      fRef = (0, S.useRef)(null),
      isCustom = !zu.some((w) => w.url === e);

    let onFile = (ev) => {
      let file = ev.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith(`image/`)) {
        (setMsgType(`error`),
          setMsg(`لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب کنید.`));
        return;
      }
      let reader = new FileReader();
      reader.onload = (re) => {
        let res = re.target?.result;
        if (typeof res === `string`) {
          (W.playPop(),
            t(res),
            setMsgType(`success`),
            setMsg(`تصویر با موفقیت از دستگاه شما به عنوان پس‌زمینه تنظیم شد.`));
          try {
            localStorage.setItem(`cj-custom-wallpaper`, res);
          } catch {}
          setTimeout(() => setMsg(``), 4000);
        }
      };
      reader.readAsDataURL(file);
    };

    let onUrlSubmit = (ev) => {
      ev.preventDefault();
      let v = cUrl.trim();
      if (!v) return;
      (W.playPop(),
        t(v),
        setCUrl(``),
        setMsgType(`success`),
        setMsg(`تصویر اینترنتی با موفقیت به عنوان پس‌زمینه تنظیم شد.`));
      try {
        localStorage.setItem(`cj-custom-wallpaper`, v);
      } catch {}
      setTimeout(() => setMsg(``), 4000);
    };

    let onReset = () => {
      (W.playClick(),
        t(zu[0].url),
        setMsgType(`success`),
        setMsg(
          `پس‌زمینه به تصویر اصلی استودیو (Creativity Juice) بازگردانده شد.`,
        ));
      try {
        localStorage.removeItem(`cj-custom-wallpaper`);
      } catch {}
      setTimeout(() => setMsg(``), 4000);
    };

    return (0, H.jsx)(Ud, {
      id: `wallpaper-selector`,
      title: `تنظیمات پس‌زمینه و والپیپر • Creativity Juice`,
      subtitle: `انتخاب والپیپر دسکتاپ یا بارگذاری تصویر دلخواه`,
      onClose: n,
      zIndex: r,
      onFocus: i,
      containerRef: a,
      width: `w-[94vw] sm:w-[86vw] md:w-[74vw] lg:w-[64vw]`,
      maxWidth: `max-w-3xl`,
      children: (0, H.jsxs)(`div`, {
        className: `p-5 sm:p-6 bg-[#FAF8F5] text-neutral-900 space-y-4 text-right font-sans`,
        children: [
          (0, H.jsx)(`div`, {
            className: `flex items-center justify-between border-b border-neutral-200 pb-3`,
            children: (0, H.jsxs)(`div`, {
              children: [
                (0, H.jsxs)(`h3`, {
                  className: `text-sm font-bold text-neutral-900 flex items-center gap-1.5`,
                  children: [
                    (0, H.jsx)(Pd, { className: `w-4 h-4 text-amber-500` }),
                    `انتخاب و شخصی‌سازی پس‌زمینه دسکتاپ`,
                  ],
                }),
                (0, H.jsx)(`p`, {
                  className: `text-xs text-neutral-500 mt-0.5`,
                  children: `والپیپر اصلی Creativity Juice یا تصویر دلخواه خود را برای پس‌زمینه انتخاب کنید.`,
                }),
              ],
            }),
          }),
          (0, H.jsxs)(`div`, {
            className: `p-3.5 sm:p-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/30 space-y-3`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center justify-between flex-wrap gap-2`,
                children: [
                  (0, H.jsxs)(`span`, {
                    className: `text-xs font-bold text-amber-950 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(`span`, { children: `🎨` }),
                      `افزودن و تنظیم تصویر دلخواه شما (Custom Background)`,
                    ],
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-[10px] font-mono text-neutral-500`,
                    children: `PNG, JPG, WebP یا لینک اینترنتی`,
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `flex flex-col sm:flex-row items-stretch gap-2`,
                children: [
                  (0, H.jsx)(`input`, {
                    ref: fRef,
                    type: `file`,
                    accept: `image/*`,
                    onChange: onFile,
                    className: `hidden`,
                  }),
                  (0, H.jsxs)(`button`, {
                    type: `button`,
                    onClick: () => fRef.current?.click(),
                    className: `flex-1 py-2 px-3 rounded-lg bg-white border border-amber-300 hover:border-amber-400 text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer active:scale-98 transition-all`,
                    children: [
                      (0, H.jsx)(`svg`, {
                        className: `w-4 h-4 text-amber-600`,
                        fill: `none`,
                        viewBox: `0 0 24 24`,
                        stroke: `currentColor`,
                        strokeWidth: 2,
                        children: (0, H.jsx)(`path`, {
                          strokeLinecap: `round`,
                          strokeLinejoin: `round`,
                          d: `M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z`,
                        }),
                      }),
                      `آپلود عکس از کامپیوتر یا گوشی`,
                    ],
                  }),
                  (0, H.jsxs)(`form`, {
                    onSubmit: onUrlSubmit,
                    className: `flex-1 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(`input`, {
                        type: `url`,
                        value: cUrl,
                        onChange: (ev) => setCUrl(ev.target.value),
                        placeholder: `یا چسباندن لینک عکس (https://...)`,
                        dir: `ltr`,
                        className: `flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-neutral-900 outline-none transition-all placeholder:text-neutral-400 text-left`,
                      }),
                      (0, H.jsx)(`button`, {
                        type: `submit`,
                        disabled: !cUrl.trim(),
                        className: `py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-all shrink-0`,
                        children: `اعمال`,
                      }),
                    ],
                  }),
                ],
              }),
              msg &&
                (0, H.jsx)(`p`, {
                  className: `text-xs font-semibold ${msgType === `error` ? `text-red-600` : `text-emerald-700`} animate-pulse`,
                  children: msg,
                }),
              isCustom &&
                (0, H.jsxs)(`div`, {
                  className: `mt-2 p-2 rounded-lg bg-white/90 border border-amber-300/80 flex items-center justify-between gap-3`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `flex items-center gap-2 truncate`,
                      children: [
                        (0, H.jsx)(`img`, {
                          src: e,
                          alt: `Custom Wallpaper`,
                          className: `w-12 h-8 rounded object-cover border border-neutral-200 shrink-0`,
                        }),
                        (0, H.jsxs)(`div`, {
                          className: `truncate`,
                          children: [
                            (0, H.jsx)(`span`, {
                              className: `text-xs font-bold text-neutral-900 block truncate`,
                              children: `تصویر دلخواه شما در حال استفاده است`,
                            }),
                            (0, H.jsx)(`span`, {
                              className: `text-[10px] text-amber-700 font-mono block`,
                              children: `CUSTOM WALLPAPER ACTIVE`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, H.jsx)(`button`, {
                      type: `button`,
                      onClick: onReset,
                      className: `text-xs font-bold text-neutral-700 hover:text-red-600 hover:underline cursor-pointer shrink-0`,
                      children: `بازگشت به موشن استودیو`,
                    }),
                  ],
                }),
            ],
          }),
          (0, H.jsx)(`div`, {
            className: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1`,
            children: zu.map((n) => {
              let r = e === n.url;
              return (0, H.jsxs)(
                `div`,
                {
                  onClick: () => {
                    (W.playClick(),
                      t(n.url),
                      isCustom &&
                        localStorage.removeItem(`cj-custom-wallpaper`));
                  },
                  className: `group cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1.5 bg-white shadow-xs ${r ? `border-neutral-900 shadow-md ring-2 ring-neutral-900/10` : `border-neutral-200 hover:border-neutral-400`}`,
                  children: [
                    (0, H.jsxs)(`div`, {
                      className: `relative aspect-[16/10] rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-100`,
                      children: [
                        n.url === `live-motion`
                          ? (0, H.jsxs)(`div`, {
                              className: `w-full h-full relative overflow-hidden bg-gradient-to-br from-[#FAF8F5] via-[#F4F1EA] to-[#EEEAE1] flex flex-col items-center justify-center p-3 text-center`,
                              children: [
                                (0, H.jsx)(`div`, {
                                  className: `absolute top-1 right-2 w-16 h-16 rounded-full bg-amber-300/30 blur-xl animate-pulse`,
                                }),
                                (0, H.jsx)(`div`, {
                                  className: `absolute bottom-1 left-2 w-16 h-16 rounded-full bg-orange-300/25 blur-xl animate-pulse`,
                                }),
                                (0, H.jsxs)(`div`, {
                                  className: `relative z-10 flex flex-col items-center`,
                                  children: [
                                    (0, H.jsxs)(`span`, {
                                      className: `px-2 py-0.5 rounded-full bg-white/80 border border-neutral-300 text-neutral-800 font-mono font-bold text-[9px] mb-1 flex items-center gap-1 shadow-2xs`,
                                      children: [
                                        (0, H.jsx)(Pd, {
                                          className: `w-2.5 h-2.5 text-amber-500`,
                                        }),
                                        ` عکس و موشن اصلی استودیو`,
                                      ],
                                    }),
                                    (0, H.jsx)(`span`, {
                                      className: `text-xs sm:text-sm font-black text-neutral-900 tracking-tight`,
                                      children: `Creativity juice`,
                                    }),
                                    (0, H.jsx)(`span`, {
                                      className: `text-[8px] font-mono text-neutral-500 mt-0.5 uppercase tracking-wider`,
                                      children: `Main Studio Artwork`,
                                    }),
                                  ],
                                }),
                              ],
                            })
                          : (0, H.jsx)(`img`, {
                              src: n.url,
                              alt: n.name,
                              className: `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`,
                            }),
                        r &&
                          (0, H.jsxs)(`div`, {
                            className: `absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#18181b] text-white font-black text-[10px] flex items-center gap-1 shadow-md`,
                            children: [
                              (0, H.jsx)(X, {
                                className: `w-3 h-3 stroke-[3]`,
                              }),
                              ` فعال`,
                            ],
                          }),
                      ],
                    }),
                    (0, H.jsx)(`div`, {
                      className: `p-2 text-center`,
                      children: (0, H.jsx)(`span`, {
                        className: `text-xs font-semibold block truncate ${r ? `text-neutral-950 font-bold` : `text-neutral-700`}`,
                        children: n.name,
                      }),
                    }),
                  ],
                },
                n.id,
              );
            }),
          }),
          (0, H.jsxs)(`div`, {
            className: `pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500`,
            children: [
              (0, H.jsx)(`span`, {
                children: `پشتیبانی از فرمت‌های تصویری و نمایشگرهای رتینا (4K UHD)`,
              }),
              (0, H.jsx)(`button`, {
                onClick: onReset,
                className: `text-neutral-900 hover:underline font-bold cursor-pointer`,
                children: `بازگشت به والپیپر اصلی Creativity Juice`,
              }),
            ],
          }),
        ],
      }),
    });
  },
  hf = ({
    x: e,
    y: t,
    onClose: n,
    onResetLayout: r,
    onOpenWallpaper: i,
    onOpenNotes: a,
    onOpenBin: o,
    onOpenContact: s,
    soundEnabled: c,
    onToggleSound: l,
    onOpenServices: u,
    onOpenCalculator: d,
  }) => {
    (0, S.useEffect)(() => {
      let e = () => n();
      return (
        window.addEventListener(`click`, e),
        window.addEventListener(`contextmenu`, e),
        () => {
          (window.removeEventListener(`click`, e),
            window.removeEventListener(`contextmenu`, e));
        }
      );
    }, [n]);
    let f = Math.min(e, window.innerWidth - 240),
      p = Math.min(t, window.innerHeight - 340);
    return (0, H.jsxs)(`div`, {
      style: { left: f, top: p },
      className: `fixed z-50 w-60 rounded-xl bg-white/95 backdrop-blur-xl border border-black/12 p-1.5 text-xs text-neutral-800 shadow-2xl select-none animate-window-pop text-right font-sans`,
      onClick: (e) => e.stopPropagation(),
      children: [
        (0, H.jsx)(`div`, {
          className: `px-3 py-1.5 text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center justify-between border-b border-neutral-200 mb-1`,
          children: (0, H.jsx)(`span`, {
            children: `🍊 سیستم خلاقیت Creativity Juice`,
          }),
        }),
        (0, H.jsxs)(`button`, {
          onClick: () => {
            (W.playClick(), s(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-amber-50 text-amber-800 font-bold flex items-center justify-between transition-colors cursor-pointer`,
          children: [
            (0, H.jsxs)(`span`, {
              className: `flex items-center gap-2`,
              children: [
                (0, H.jsx)(jd, { className: `w-3.5 h-3.5 rotate-180` }),
                (0, H.jsx)(`span`, { children: `ثبت بریف پروژه جدید` }),
              ],
            }),
            (0, H.jsx)(Pd, { className: `w-3 h-3 text-amber-600` }),
          ],
        }),
        u &&
          (0, H.jsx)(`button`, {
            onClick: () => {
              (W.playClick(), u(), n());
            },
            className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
            children: (0, H.jsxs)(`span`, {
              className: `flex items-center gap-2`,
              children: [
                (0, H.jsx)(hd, { className: `w-3.5 h-3.5 text-neutral-500` }),
                (0, H.jsx)(`span`, { children: `کاتالوگ ۱۰ خدمت استودیو` }),
              ],
            }),
          }),
        d &&
          (0, H.jsx)(`button`, {
            onClick: () => {
              (W.playClick(), d(), n());
            },
            className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
            children: (0, H.jsxs)(`span`, {
              className: `flex items-center gap-2`,
              children: [
                (0, H.jsx)(Y, { className: `w-3.5 h-3.5 text-neutral-500` }),
                (0, H.jsx)(`span`, {
                  children: `محاسبه‌گر هوشمند مقیاس و منابع`,
                }),
              ],
            }),
          }),
        (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
        (0, H.jsx)(`button`, {
          onClick: () => {
            (W.playClick(), r(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
          children: (0, H.jsxs)(`span`, {
            className: `flex items-center gap-2`,
            children: [
              (0, H.jsx)(Dd, { className: `w-3.5 h-3.5 text-neutral-500` }),
              (0, H.jsx)(`span`, { children: `مرتب‌سازی آیکون‌ها و پنجره‌ها` }),
            ],
          }),
        }),
        (0, H.jsx)(`button`, {
          onClick: () => {
            (W.playClick(), i(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
          children: (0, H.jsxs)(`span`, {
            className: `flex items-center gap-2`,
            children: [
              (0, H.jsx)(fd, { className: `w-3.5 h-3.5 text-neutral-500` }),
              (0, H.jsx)(`span`, { children: `تغییر والپیپر دسکتاپ…` }),
            ],
          }),
        }),
        (0, H.jsx)(`button`, {
          onClick: () => {
            (l(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
          children: (0, H.jsxs)(`span`, {
            className: `flex items-center gap-2`,
            children: [
              c
                ? (0, H.jsx)(Rd, { className: `w-3.5 h-3.5 text-neutral-500` })
                : (0, H.jsx)(zd, { className: `w-3.5 h-3.5 text-neutral-400` }),
              (0, H.jsx)(`span`, {
                children: c ? `قطع جلوه‌های صوتی` : `فعال‌سازی صدا`,
              }),
            ],
          }),
        }),
        (0, H.jsx)(`div`, { className: `h-px bg-neutral-200 my-1` }),
        (0, H.jsx)(`button`, {
          onClick: () => {
            (W.playClick(), a(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-neutral-100 flex items-center justify-between transition-colors cursor-pointer`,
          children: (0, H.jsxs)(`span`, {
            className: `flex items-center gap-2`,
            children: [
              (0, H.jsx)(pd, { className: `w-3.5 h-3.5 text-neutral-500` }),
              (0, H.jsx)(`span`, { children: `درباره Creativity Juice` }),
            ],
          }),
        }),
        (0, H.jsx)(`button`, {
          onClick: () => {
            (W.playClick(), o(), n());
          },
          className: `w-full text-right px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-between transition-colors cursor-pointer`,
          children: (0, H.jsxs)(`span`, {
            className: `flex items-center gap-2`,
            children: [
              (0, H.jsx)(Id, { className: `w-3.5 h-3.5` }),
              (0, H.jsx)(`span`, { children: `سطل کلیشه‌های تبلیغاتی` }),
            ],
          }),
        }),
      ],
    });
  },
  gf = ({ className: e = `` }) =>
    (0, H.jsxs)(`div`, {
      className: `absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#F7F5F0] ${e}`,
      style: { isolation: `isolate` },
      children: [
        (0, H.jsx)(`div`, {
          className: `absolute inset-0 bg-gradient-to-br from-[#FAF8F5] via-[#F4F1EA] to-[#EEEAE1]`,
        }),
        (0, H.jsx)(ku.div, {
          animate: {
            x: [`-8%`, `12%`, `-4%`, `-8%`],
            y: [`-12%`, `8%`, `-6%`, `-12%`],
            scale: [1, 1.2, 0.95, 1],
          },
          transition: { duration: 18, repeat: 1 / 0, ease: `easeInOut` },
          className: `absolute top-1/4 left-1/3 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-[#FEF08A]/45 via-[#FDE047]/25 to-transparent blur-[120px]`,
        }),
        (0, H.jsx)(ku.div, {
          animate: {
            x: [`12%`, `-8%`, `10%`, `12%`],
            y: [`15%`, `-12%`, `6%`, `15%`],
            scale: [1.1, 0.92, 1.15, 1.1],
          },
          transition: { duration: 22, repeat: 1 / 0, ease: `easeInOut` },
          className: `absolute bottom-1/4 right-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-[#FED7AA]/40 via-[#FDBA74]/20 to-transparent blur-[130px]`,
        }),
        (0, H.jsx)(ku.div, {
          animate: {
            x: [`-15%`, `6%`, `-10%`, `-15%`],
            y: [`8%`, `-18%`, `12%`, `8%`],
            scale: [0.95, 1.12, 1, 0.95],
          },
          transition: { duration: 25, repeat: 1 / 0, ease: `easeInOut` },
          className: `absolute top-1/2 left-1/4 w-[580px] h-[580px] rounded-full bg-gradient-to-tl from-[#FEF9C3]/35 via-[#F5F3FF]/30 to-transparent blur-[140px]`,
        }),
        (0, H.jsxs)(`svg`, {
          className: `absolute inset-0 w-full h-full opacity-[0.16] pointer-events-none`,
          xmlns: `http://www.w3.org/2000/svg`,
          children: [
            (0, H.jsx)(`defs`, {
              children: (0, H.jsxs)(`linearGradient`, {
                id: `topo-light`,
                x1: `0%`,
                y1: `0%`,
                x2: `100%`,
                y2: `100%`,
                children: [
                  (0, H.jsx)(`stop`, { offset: `0%`, stopColor: `#D97706` }),
                  (0, H.jsx)(`stop`, { offset: `50%`, stopColor: `#78716C` }),
                  (0, H.jsx)(`stop`, { offset: `100%`, stopColor: `#EA580C` }),
                ],
              }),
            }),
            (0, H.jsx)(ku.path, {
              d: `M -100 250 C 300 150, 600 350, 1100 200 C 1500 100, 1800 300, 2200 180`,
              fill: `none`,
              stroke: `url(#topo-light)`,
              strokeWidth: `1.5`,
              animate: {
                d: [
                  `M -100 250 C 300 150, 600 350, 1100 200 C 1500 100, 1800 300, 2200 180`,
                  `M -100 280 C 350 200, 650 300, 1150 240 C 1450 150, 1750 260, 2200 220`,
                  `M -100 220 C 280 120, 580 380, 1080 180 C 1520 80, 1820 320, 2200 160`,
                  `M -100 250 C 300 150, 600 350, 1100 200 C 1500 100, 1800 300, 2200 180`,
                ],
              },
              transition: { duration: 24, repeat: 1 / 0, ease: `easeInOut` },
            }),
            (0, H.jsx)(ku.path, {
              d: `M -100 500 C 400 400, 800 580, 1300 440 C 1700 340, 1900 520, 2200 420`,
              fill: `none`,
              stroke: `url(#topo-light)`,
              strokeWidth: `1.2`,
              strokeDasharray: `4 6`,
              animate: {
                d: [
                  `M -100 500 C 400 400, 800 580, 1300 440 C 1700 340, 1900 520, 2200 420`,
                  `M -100 470 C 450 440, 750 520, 1250 480 C 1650 390, 1850 480, 2200 460`,
                  `M -100 530 C 370 370, 830 610, 1330 410 C 1730 310, 1930 550, 2200 400`,
                  `M -100 500 C 400 400, 800 580, 1300 440 C 1700 340, 1900 520, 2200 420`,
                ],
              },
              transition: { duration: 28, repeat: 1 / 0, ease: `easeInOut` },
            }),
          ],
        }),
        (0, H.jsx)(ku.div, {
          animate: {
            x: [`-1.5%`, `1.5%`, `-0.8%`, `-1.5%`],
            y: [`-1%`, `1%`, `-0.5%`, `-1%`],
          },
          transition: { duration: 30, repeat: 1 / 0, ease: `easeInOut` },
          className: `absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden`,
          children: (0, H.jsx)(`span`, {
            className: `text-[13vw] sm:text-[14vw] md:text-[15vw] font-black tracking-tighter text-black/[0.035] uppercase font-mono whitespace-nowrap leading-none select-none`,
            style: { WebkitTextStroke: `1px rgba(0, 0, 0, 0.05)` },
            children: `CREATIVITY JUICE`,
          }),
        }),
        (0, H.jsx)(`div`, {
          className: `absolute inset-0 flex flex-col items-center max-md:justify-end max-md:pb-14 md:justify-center text-center px-4 pointer-events-none`,
          children: (0, H.jsxs)(ku.div, {
            animate: { y: [-4, 4, -4], scale: [1, 1.01, 1] },
            transition: { duration: 9, repeat: 1 / 0, ease: `easeInOut` },
            className: `flex flex-col items-center max-w-[95vw]`,
            children: [
              (0, H.jsxs)(ku.div, {
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1 },
                className: `mb-2 sm:mb-3 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-white/80 border border-black/10 backdrop-blur-md flex items-center gap-1.5 sm:gap-2 shadow-xs`,
                children: [
                  (0, H.jsx)(id, {
                    className: `w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-[9px] sm:text-[11px] font-mono tracking-widest text-neutral-800 uppercase font-bold truncate max-w-[260px] sm:max-w-none`,
                    children: `EST. 2024 • BRAND ARCHITECTURE & CINEMA`,
                  }),
                  (0, H.jsx)(Pd, {
                    className: `w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0`,
                  }),
                ],
              }),
              (0, H.jsxs)(`h1`, {
                className: `relative font-black tracking-tight leading-none select-none text-center`,
                children: [
                  (0, H.jsx)(`span`, {
                    className: `absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent pointer-events-none`,
                    "aria-hidden": `true`,
                    children: `Creativity juice`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `relative z-10 text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-[#18181B] via-[#27272A] to-[#451A03] bg-clip-text text-transparent drop-shadow-xs tracking-tight font-sans whitespace-nowrap`,
                    children: `Creativity juice`,
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `mt-2 sm:mt-4 space-y-1 sm:space-y-1.5`,
                dir: `rtl`,
                children: [
                  (0, H.jsx)(`p`, {
                    className: `text-[11px] sm:text-sm md:text-base font-bold text-neutral-700 tracking-wide font-sans`,
                    children: `استودیو معماری برند، سینمای تجاری و کمپین‌های اثرگذار`,
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center justify-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs font-mono text-neutral-500`,
                    dir: `ltr`,
                    children: [
                      (0, H.jsx)(`span`, { children: `BRAND ARCHITECTURE` }),
                      (0, H.jsx)(`span`, {
                        className: `text-amber-500/80`,
                        children: `•`,
                      }),
                      (0, H.jsx)(`span`, { children: `CINEMA` }),
                      (0, H.jsx)(`span`, {
                        className: `text-amber-500/80`,
                        children: `•`,
                      }),
                      (0, H.jsx)(`span`, { children: `GROWTH` }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        [
          { top: `22%`, left: `18%`, size: `w-2 h-2`, delay: 0, duration: 6 },
          {
            top: `35%`,
            left: `78%`,
            size: `w-2.5 h-2.5`,
            delay: 2,
            duration: 8,
          },
          {
            top: `68%`,
            left: `24%`,
            size: `w-1.5 h-1.5`,
            delay: 1,
            duration: 7,
          },
          { top: `75%`, left: `72%`, size: `w-2 h-2`, delay: 3, duration: 9 },
          { top: `48%`, left: `12%`, size: `w-1 h-1`, delay: 4, duration: 5 },
        ].map((e, t) =>
          (0, H.jsx)(
            ku.div,
            {
              className: `absolute ${e.size} rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]`,
              style: { top: e.top, left: e.left },
              animate: {
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              },
              transition: {
                duration: e.duration,
                delay: e.delay,
                repeat: 1 / 0,
                ease: `easeInOut`,
              },
            },
            t,
          ),
        ),
        (0, H.jsx)(`div`, {
          className: `absolute inset-0 opacity-[0.03] pointer-events-none`,
          style: {
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: `48px 48px`,
          },
        }),
      ],
    }),
  _f = ({
    initialProject: e,
    onClose: t,
    onSave: n,
    onDelete: r,
    zIndex: i,
    onFocus: a,
    containerRef: o,
  }) => {
    let s = !!e,
      [c, l] = (0, S.useState)(e?.title || ``),
      [u, d] = (0, S.useState)(e?.subtitle || ``),
      [f, p] = (0, S.useState)(e?.client || ``),
      [m, h] = (0, S.useState)(e?.year || `۱۴۰۳`),
      [g, _] = (0, S.useState)(e?.category || `معماری و هویت برند`),
      [v, y] = (0, S.useState)(e?.deptTrack || `TRACK 01 // BRAND IDENTITY`),
      [b, x] = (0, S.useState)(e?.role || `استراتژیست هویت و آرت‌دایرکتور`),
      [C, ee] = (0, S.useState)(e?.metrics || `+۲۸۰٪ رشد در تعامل مخاطبان`),
      [w, te] = (0, S.useState)(e?.coverImage || sf[0].url),
      [T, E] = (0, S.useState)(e?.description || ``),
      [D, ne] = (0, S.useState)(
        e?.deliverables || [
          `استراتژی و دی‌ان‌ای برند`,
          `سیستم هویت بصری جامع`,
          `کارگردانی فیلم سینمایی مانیفست`,
        ],
      ),
      [re, ie] = (0, S.useState)(``),
      [ae, oe] = (0, S.useState)(
        e?.tags || [`ری‌برندینگ`, `سینمای تجاری`, `تایپوگرافی`],
      ),
      [O, se] = (0, S.useState)(``),
      k = [
        { label: `معماری و هویت برند`, track: `TRACK 01 // BRAND IDENTITY` },
        {
          label: `سینما، مد و تولید محتوا`,
          track: `TRACK 02 // CINEMA & VISUALS`,
        },
        {
          label: `مارکتینگ و دراپ محصول`,
          track: `TRACK 03 // CAMPAIGNS & ACTIVATIONS`,
        },
        {
          label: `مشاوره ارشد و کانسلری`,
          track: `TRACK 04 // STRATEGIC COUNSEL`,
        },
        { label: `فین‌تک، اپلیکیشن و وب‌سایت`, track: `DIGITAL & PRODUCTS` },
        { label: `طراحی بسته‌بندی لوکس`, track: `PACKAGING & INDUSTRIAL` },
      ],
      ce = () => {
        re.trim() && (W.playClick(), ne((e) => [...e, re.trim()]), ie(``));
      },
      le = (e) => {
        (W.playTrash(), ne((t) => t.filter((t, n) => n !== e)));
      },
      A = () => {
        if (!O.trim()) return;
        W.playClick();
        let e = O.trim().replace(/^#/, ``);
        (ae.includes(e) || oe((t) => [...t, e]), se(``));
      },
      ue = (e) => {
        (W.playTrash(), oe((t) => t.filter((t) => t !== e)));
      };
    return (0, H.jsx)(Ud, {
      id: `project-editor-modal`,
      title: s
        ? `ویرایش پرونده: ${c || `پروژه`}`
        : `📁 ثبت پرونده جدید برای استودیو`,
      subtitle: `تنظیم مشخصات و تدوین دکترین پروژه برای مطالعه کارفرمایان`,
      onClose: t,
      zIndex: i,
      onFocus: a,
      containerRef: o,
      width: `w-[96vw] sm:w-[90vw] md:w-[82vw] lg:w-[68vw]`,
      maxWidth: `max-w-4xl`,
      children: (0, H.jsxs)(`form`, {
        onSubmit: (t) => {
          (t.preventDefault(),
            c.trim()
              ? (W.playSparkle(),
                n({
                  id: e?.id || `proj-${Date.now()}`,
                  title: c.trim(),
                  subtitle: u.trim(),
                  client: f.trim() || `کارفرمای اختصاصی`,
                  year: m.trim() || `۱۴۰۳`,
                  category: g,
                  deptTrack: v,
                  role: b.trim() || `مدیر ارشد خلاقیت`,
                  metrics: C.trim() || `اجرا با بالاترین کیفیت استودیویی`,
                  coverImage: w.trim() || sf[0].url,
                  highResImage: w.trim() || sf[0].url,
                  description:
                    T.trim() ||
                    `کالبدشکافی فرآیند خلق و اجرای این پرونده؛ طراحی منسجم بر پایه استاندارد استودیویی، حل گلوگاه‌های هویتی و ارائه خروجی نهایی متناسب با شأن برند.`,
                  deliverables: D,
                  tags: ae,
                  desktopPos: e?.desktopPos || {
                    top: 61,
                    left: 21,
                    mobileTop: 36,
                    mobileLeft: 56,
                  },
                }))
              : W.playError());
        },
        className: `flex flex-col flex-1 bg-white text-neutral-900 select-none text-right font-sans overflow-hidden`,
        dir: `rtl`,
        children: [
          (0, H.jsxs)(`div`, {
            className: `p-4 bg-gradient-to-r from-amber-500/10 via-[#FAF8F5] to-neutral-100 border-b border-neutral-200 flex items-center justify-between`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `flex items-center gap-2.5`,
                children: [
                  (0, H.jsx)(`div`, {
                    className: `w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-xs`,
                    children: (0, H.jsx)(Pd, { className: `w-5 h-5` }),
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`h3`, {
                        className: `text-sm font-bold text-neutral-900`,
                        children: s
                          ? `ویرایش پرونده پروژه`
                          : `خلق پرونده پروژه جدید`,
                      }),
                      (0, H.jsx)(`p`, {
                        className: `text-[11px] text-neutral-500`,
                        children: `اطلاعات این پرونده مستقیماً در فولدر «پروژه‌ها» ذخیره شده و برای کارفرمایان قابل مطالعه خواهد بود.`,
                      }),
                    ],
                  }),
                ],
              }),
              s &&
                r &&
                (0, H.jsxs)(`button`, {
                  type: `button`,
                  onClick: () => {
                    W.playTrash();
                    r(e.id);
                  },
                  className: `px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer`,
                  children: [
                    (0, H.jsx)(Id, { className: `w-3.5 h-3.5` }),
                    (0, H.jsx)(`span`, { children: `حذف پرونده` }),
                  ],
                }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[70vh]`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `space-y-4 bg-[#FAF9F7] p-4 rounded-xl border border-neutral-200`,
                children: [
                  (0, H.jsxs)(`h4`, {
                    className: `text-xs font-bold text-neutral-800 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(J, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `۱. مشخصات کلی پروژه و کارفرما`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `grid grid-cols-1 sm:grid-cols-2 gap-3.5`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        children: [
                          (0, H.jsxs)(`label`, {
                            className: `block text-xs font-bold text-neutral-700 mb-1`,
                            children: [
                              `عنوان پروژه `,
                              (0, H.jsx)(`span`, {
                                className: `text-red-500`,
                                children: `*`,
                              }),
                            ],
                          }),
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            required: !0,
                            value: c,
                            onChange: (e) => l(e.target.value),
                            placeholder: `مثال: ری‌برندینگ و لانچ کالکشن نکتار`,
                            className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        children: [
                          (0, H.jsx)(`label`, {
                            className: `block text-xs font-bold text-neutral-700 mb-1`,
                            children: `نام کارفرما یا برند`,
                          }),
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            value: f,
                            onChange: (e) => p(e.target.value),
                            placeholder: `مثال: صنایع نکتار / هلدینگ اپکس`,
                            className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `sm:col-span-2`,
                        children: [
                          (0, H.jsx)(`label`, {
                            className: `block text-xs font-bold text-neutral-700 mb-1`,
                            children: `زیرعنوان یا اسلوگان پرونده`,
                          }),
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            value: u,
                            onChange: (e) => d(e.target.value),
                            placeholder: `مثال: طراحی بسته‌بندی، دراپ کپسولی و کارگردانی فیلم‌های تجاری 4K`,
                            className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        children: [
                          (0, H.jsx)(`label`, {
                            className: `block text-xs font-bold text-neutral-700 mb-1`,
                            children: `دسته‌بندی و حوزه خدمت`,
                          }),
                          (0, H.jsx)(`select`, {
                            value: g,
                            onChange: (e) => {
                              _(e.target.value);
                              let t = k.find((t) => t.label === e.target.value);
                              t && y(t.track);
                            },
                            className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 cursor-pointer`,
                            children: k.map((e) =>
                              (0, H.jsx)(
                                `option`,
                                { value: e.label, children: e.label },
                                e.label,
                              ),
                            ),
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `grid grid-cols-2 gap-2`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-xs font-bold text-neutral-700 mb-1`,
                                children: `سال اجرا`,
                              }),
                              (0, H.jsx)(`input`, {
                                type: `text`,
                                value: m,
                                onChange: (e) => h(e.target.value),
                                placeholder: `۱۴۰۳`,
                                className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 text-center font-mono`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-xs font-bold text-neutral-700 mb-1`,
                                children: `نقش استودیو`,
                              }),
                              (0, H.jsx)(`input`, {
                                type: `text`,
                                value: b,
                                onChange: (e) => x(e.target.value),
                                placeholder: `آرت‌دایرکتور`,
                                className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 text-center`,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `space-y-3 bg-[#FAF9F7] p-4 rounded-xl border border-neutral-200`,
                children: [
                  (0, H.jsxs)(`h4`, {
                    className: `text-xs font-bold text-neutral-800 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(fd, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `۲. تصویر شاخص و پوستر پروژه`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex flex-col sm:flex-row gap-4 items-start`,
                    children: [
                      (0, H.jsxs)(`div`, {
                        className: `w-full sm:w-44 aspect-[4/3] rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0 relative shadow-xs`,
                        children: [
                          (0, H.jsx)(`img`, {
                            src: w,
                            alt: `پیش‌نمایش کاور`,
                            className: `w-full h-full object-cover`,
                          }),
                          (0, H.jsx)(`div`, {
                            className: `absolute bottom-1 right-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-white`,
                            children: `پیش‌نمایش`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `flex-1 space-y-3 w-full`,
                        children: [
                          (0, H.jsxs)(`div`, {
                            children: [
                              (0, H.jsx)(`label`, {
                                className: `block text-[11px] font-bold text-neutral-700 mb-1`,
                                children: `آدرس اینترنتی تصویر کاور (URL مستقیم عکس)`,
                              }),
                              (0, H.jsx)(`input`, {
                                type: `url`,
                                value: w,
                                onChange: (e) => te(e.target.value),
                                placeholder: `https://images.unsplash.com/...`,
                                className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono text-left`,
                                dir: `ltr`,
                              }),
                            ],
                          }),
                          (0, H.jsxs)(`div`, {
                            children: [
                              (0, H.jsx)(`span`, {
                                className: `block text-[11px] font-bold text-neutral-600 mb-1.5`,
                                children: `یا انتخاب سریع از تصاویر آماده ادیتوریال:`,
                              }),
                              (0, H.jsx)(`div`, {
                                className: `grid grid-cols-2 sm:grid-cols-4 gap-1.5`,
                                children: sf.map((e) =>
                                  (0, H.jsxs)(
                                    `button`,
                                    {
                                      type: `button`,
                                      onClick: () => {
                                        (W.playClick(), te(e.url));
                                      },
                                      className: `p-1.5 rounded-lg border text-right text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${w === e.url ? `bg-neutral-900 text-white border-neutral-900 shadow-xs` : `bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200`}`,
                                      children: [
                                        (0, H.jsx)(`img`, {
                                          src: e.url,
                                          alt: ``,
                                          className: `w-6 h-6 rounded object-cover shrink-0`,
                                        }),
                                        (0, H.jsx)(`span`, {
                                          className: `truncate`,
                                          children: e.label,
                                        }),
                                      ],
                                    },
                                    e.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `space-y-4 bg-[#FAF9F7] p-4 rounded-xl border border-neutral-200`,
                children: [
                  (0, H.jsxs)(`h4`, {
                    className: `text-xs font-bold text-neutral-800 flex items-center gap-1.5`,
                    children: [
                      (0, H.jsx)(hd, {
                        className: `w-3.5 h-3.5 text-amber-600`,
                      }),
                      (0, H.jsx)(`span`, {
                        children: `۳. کالبدشکافی استراتژی و شرح پرونده`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`label`, {
                        className: `block text-xs font-bold text-neutral-700 mb-1`,
                        children: `شاخص کلیدی موفقیت یا دستاورد ملموس`,
                      }),
                      (0, H.jsx)(`input`, {
                        type: `text`,
                        value: C,
                        onChange: (e) => ee(e.target.value),
                        placeholder: `مثال: +۲۸۰٪ رشد در پروژه‌های لوکس • برنده سالنامه معماری معاصر`,
                        className: `w-full bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    children: [
                      (0, H.jsx)(`label`, {
                        className: `block text-xs font-bold text-neutral-700 mb-1`,
                        children: `شرح پروژه، چالش اولیه کارفرما و راهکار استودیو (متن مطالعه پرونده)`,
                      }),
                      (0, H.jsx)(`textarea`, {
                        rows: 5,
                        value: T,
                        onChange: (e) => E(e.target.value),
                        placeholder: `در این قسمت توضیح دهید که چالش اولیه کارفرما چه بود، استودیوی شما چه استراتژی یا راهکار بصری و سینمایی به کار بست، و این تحول چه نتیجه‌ای برای اعتبار و رشد برند به همراه داشت...`,
                        className: `w-full bg-white border border-neutral-300 rounded-lg p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 leading-relaxed font-sans`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `bg-[#FAF9F7] p-4 rounded-xl border border-neutral-200 space-y-3`,
                    children: [
                      (0, H.jsxs)(`h4`, {
                        className: `text-xs font-bold text-neutral-800 flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(nd, {
                            className: `w-3.5 h-3.5 text-green-600`,
                          }),
                          (0, H.jsx)(`span`, {
                            children: `اقلام تحویلی به کارفرما`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `flex gap-1.5`,
                        children: [
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            value: re,
                            onChange: (e) => ie(e.target.value),
                            onKeyDown: (e) => {
                              e.key === `Enter` && (e.preventDefault(), ce());
                            },
                            placeholder: `افزودن قلم جدید…`,
                            className: `flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900`,
                          }),
                          (0, H.jsxs)(`button`, {
                            type: `button`,
                            onClick: ce,
                            className: `px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer`,
                            children: [
                              (0, H.jsx)(Td, { className: `w-3 h-3` }),
                              (0, H.jsx)(`span`, { children: `ثبت` }),
                            ],
                          }),
                        ],
                      }),
                      (0, H.jsx)(`div`, {
                        className: `space-y-1.5 max-h-36 overflow-y-auto`,
                        children: D.map((e, t) =>
                          (0, H.jsxs)(
                            `div`,
                            {
                              className: `flex items-center justify-between px-2.5 py-1 bg-white rounded-md border border-neutral-200 text-xs text-neutral-800`,
                              children: [
                                (0, H.jsx)(`span`, {
                                  className: `truncate`,
                                  children: e,
                                }),
                                (0, H.jsx)(`button`, {
                                  type: `button`,
                                  onClick: () => le(t),
                                  className: `text-neutral-400 hover:text-red-600 p-0.5 cursor-pointer`,
                                  children: (0, H.jsx)(Vd, {
                                    className: `w-3 h-3`,
                                  }),
                                }),
                              ],
                            },
                            t,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `bg-[#FAF9F7] p-4 rounded-xl border border-neutral-200 space-y-3`,
                    children: [
                      (0, H.jsxs)(`h4`, {
                        className: `text-xs font-bold text-neutral-800 flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(Fd, {
                            className: `w-3.5 h-3.5 text-amber-600`,
                          }),
                          (0, H.jsx)(`span`, {
                            children: `برچسب‌های موضوعی (Tags)`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `flex gap-1.5`,
                        children: [
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            value: O,
                            onChange: (e) => se(e.target.value),
                            onKeyDown: (e) => {
                              e.key === `Enter` && (e.preventDefault(), A());
                            },
                            placeholder: `افزودن برچسب جدید…`,
                            className: `flex-1 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900`,
                          }),
                          (0, H.jsxs)(`button`, {
                            type: `button`,
                            onClick: A,
                            className: `px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer`,
                            children: [
                              (0, H.jsx)(Td, { className: `w-3 h-3` }),
                              (0, H.jsx)(`span`, { children: `ثبت` }),
                            ],
                          }),
                        ],
                      }),
                      (0, H.jsx)(`div`, {
                        className: `flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1`,
                        children: ae.map((e) =>
                          (0, H.jsxs)(
                            `span`,
                            {
                              className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-neutral-300 text-neutral-800 text-[11px] font-medium`,
                              children: [
                                (0, H.jsxs)(`span`, { children: [`#`, e] }),
                                (0, H.jsx)(`button`, {
                                  type: `button`,
                                  onClick: () => ue(e),
                                  className: `text-neutral-400 hover:text-red-600 cursor-pointer`,
                                  children: (0, H.jsx)(Vd, {
                                    className: `w-2.5 h-2.5`,
                                  }),
                                }),
                              ],
                            },
                            e,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `p-3 bg-[#FAF8F5] border-t border-neutral-200 flex items-center justify-between`,
            children: [
              (0, H.jsx)(`button`, {
                type: `button`,
                onClick: t,
                className: `px-4 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-colors cursor-pointer`,
                children: `انصراف`,
              }),
              (0, H.jsxs)(`button`, {
                type: `submit`,
                className: `px-5 py-1.5 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95`,
                children: [
                  (0, H.jsx)(kd, { className: `w-3.5 h-3.5` }),
                  (0, H.jsx)(`span`, {
                    children: s
                      ? `ذخیره تغییرات پرونده`
                      : `ثبت و انتشار پرونده در فولدر`,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  vf = ({
    onClose: e,
    zIndex: t,
    onFocus: n,
    containerRef: r,
    onSelectProject: i,
    onOpenBriefWithProject: a,
  }) => {
    let [o, s] = (0, S.useState)(() => cf()),
      [c, l] = (0, S.useState)(``),
      [u, d] = (0, S.useState)(`all`),
      [f, p] = (0, S.useState)(`grid`),
      [m, h] = (0, S.useState)(null),
      [g, _] = (0, S.useState)(null),
      [v, y] = (0, S.useState)(!1);
    (0, S.useEffect)(() => {
      let e = () => {
        s(cf());
      };
      window.addEventListener(`projects-updated`, e);
      window.addEventListener(CJ_STUDIO_DATA_EVENT, e);
      return () => {
        window.removeEventListener(`projects-updated`, e);
        window.removeEventListener(CJ_STUDIO_DATA_EVENT, e);
      };
    }, []);
    let b = [
        { id: `all`, label: `همه پروژه‌ها (${o.length})` },
        { id: `brand`, label: `معماری و هویت برند` },
        { id: `cinema`, label: `سینما، مد و فیلم تجاری` },
        { id: `campaign`, label: `کمپین و دراپ محصول` },
        { id: `counsel`, label: `مشاوره ارشد و کانسلری` },
      ],
      x = o.filter((e) => {
        let cat = `${e.category || ''} ${e.categoryLabel || ''} ${e.deptTrack || ''}`.toLowerCase();
        if (u !== `all`) {
          if (u === `brand` && !(cat.includes(`هویت`) || cat.includes(`معماری`) || cat.includes(`ری‌برندینگ`) || cat.includes(`brand`))) return !1;
          if (u === `cinema` && !(cat.includes(`سینما`) || cat.includes(`ویدیو`) || cat.includes(`تولید محتوا`) || cat.includes(`cinema`))) return !1;
          if (u === `campaign` && !(cat.includes(`مارکتینگ`) || cat.includes(`دراپ`) || cat.includes(`کمپین`) || cat.includes(`campaign`) || cat.includes(`packaging`) || cat.includes(`بسته‌بندی`))) return !1;
          if (u === `counsel` && !(cat.includes(`مشاوره`) || cat.includes(`کانسلری`) || cat.includes(`counsel`) || cat.includes(`strategy`))) return !1;
        }
        if (!c.trim()) return !0;
        let t = c.toLowerCase();
        return (
          (e.title && e.title.toLowerCase().includes(t)) ||
          (e.subtitle ? e.subtitle.toLowerCase().includes(t) : !1) ||
          (e.client && e.client.toLowerCase().includes(t)) ||
          (e.category && e.category.toLowerCase().includes(t)) ||
          (Array.isArray(e.tags) && e.tags.some((tag) => tag.toLowerCase().includes(t)))
        );
      }),
      C = (e) => {
        (W.playClick(),
          h(e.id),
          typeof window < `u` &&
            window.innerWidth < 768 &&
            (W.playWindowOpen(), i(e)));
      },
      ee = (e) => {
        (W.playWindowOpen(), i(e));
      },
      w = () => {
        (W.playWindowOpen(), _(null), y(!0));
      },
      te = (e, t) => {
        (t && t.stopPropagation(), W.playWindowOpen(), _(e), y(!0));
      },
      T = (e, t) => {
        t && t.stopPropagation();
        W.playTrash();
        let updated = ff(e);
        (s(updated), m === e && h(null));
      };
    return (0, H.jsxs)(H.Fragment, {
      children: [
        (0, H.jsx)(Ud, {
          id: `projects-folder-window`,
          title: `📁 پروژه‌ها (Projects) — ${o.length} پرونده واقعی`,
          subtitle: `آرشیو پرونده‌های اجرایی و کمپین‌های مستند استودیو`,
          onClose: e,
          zIndex: t,
          onFocus: n,
          containerRef: r,
          width: `w-[96vw] sm:w-[92vw] md:w-[86vw] lg:w-[80vw]`,
          maxWidth: `max-w-6xl`,
          headerRightContent: (0, H.jsxs)(`button`, {
            onClick: w,
            className: `px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all`,
            title: `افزودن پرونده پروژه جدید`,
            children: [
              (0, H.jsx)(Td, { className: `w-3.5 h-3.5 text-amber-400` }),
              (0, H.jsx)(`span`, { children: `پروژه جدید` }),
            ],
          }),
          children: (0, H.jsxs)(`div`, {
            className: `flex flex-col flex-1 h-full min-h-[520px] bg-white text-neutral-900 select-none text-right font-sans`,
            children: [
              (0, H.jsxs)(`div`, {
                className: `p-3 bg-[#F8F7F5] border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-1.5 space-x-reverse text-xs text-neutral-600`,
                    children: [
                      (0, H.jsx)(`span`, {
                        className: `opacity-70`,
                        children: `Creativity Juice`,
                      }),
                      (0, H.jsx)(`span`, { children: `/` }),
                      (0, H.jsx)(`span`, {
                        className: `opacity-70`,
                        children: `دسکتاپ استودیو`,
                      }),
                      (0, H.jsx)(`span`, { children: `/` }),
                      (0, H.jsxs)(`span`, {
                        className: `text-neutral-900 font-bold flex items-center gap-1.5`,
                        children: [
                          (0, H.jsx)(`img`, {
                            src: `/assets/aistudio/folder-icon-mac-png-23_a819e89f.png`,
                            alt: ``,
                            className: `w-4 h-4 inline object-contain`,
                          }),
                          (0, H.jsx)(`span`, {
                            children: `پروژه‌ها (Projects)`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center space-x-2 space-x-reverse`,
                    children: [
                      (0, H.jsxs)(`button`, {
                        onClick: w,
                        className: `px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95`,
                        children: [
                          (0, H.jsx)(Td, {
                            className: `w-3.5 h-3.5 stroke-[2.5]`,
                          }),
                          (0, H.jsx)(`span`, { children: `افزودن پروژه` }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `relative`,
                        children: [
                          (0, H.jsx)(`input`, {
                            type: `text`,
                            value: c,
                            onChange: (e) => l(e.target.value),
                            placeholder: `جستجو در پرونده‌ها…`,
                            className: `w-36 sm:w-52 bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-800`,
                          }),
                          (0, H.jsx)(Ad, {
                            className: `w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400 pointer-events-none`,
                          }),
                        ],
                      }),
                      (0, H.jsxs)(`div`, {
                        className: `flex bg-white border border-neutral-300 rounded-lg p-0.5`,
                        children: [
                          (0, H.jsx)(`button`, {
                            onClick: () => {
                              (W.playClick(), p(`grid`));
                            },
                            className: `p-1 rounded cursor-pointer ${f === `grid` ? `bg-[#18181b] text-white` : `text-neutral-600 hover:text-black`}`,
                            title: `نمایش شبکه‌ای آیکون‌ها`,
                            children: (0, H.jsx)(gd, {
                              className: `w-3.5 h-3.5`,
                            }),
                          }),
                          (0, H.jsx)(`button`, {
                            onClick: () => {
                              (W.playClick(), p(`list`));
                            },
                            className: `p-1 rounded cursor-pointer ${f === `list` ? `bg-[#18181b] text-white` : `text-neutral-600 hover:text-black`}`,
                            title: `نمایش جدولی و جزئیات`,
                            children: (0, H.jsx)(_d, {
                              className: `w-3.5 h-3.5`,
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `px-4 py-2 bg-[#F5F4F0] border-b border-neutral-200 flex items-center space-x-2 space-x-reverse overflow-x-auto scrollbar-none`,
                children: [
                  b.map((e) =>
                    (0, H.jsx)(
                      `button`,
                      {
                        onClick: () => {
                          (W.playClick(), d(e.id));
                        },
                        className: `px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${u === e.id ? `bg-[#18181b] text-white shadow-xs font-bold` : `bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200`}`,
                        children: e.label,
                      },
                      e.id,
                    ),
                  ),
                  (0, H.jsxs)(`span`, {
                    className: `text-[11px] font-mono text-neutral-500 mr-auto pl-2 font-medium`,
                    children: [x.length, ` پرونده قابل مطالعه`],
                  }),
                ],
              }),
              (0, H.jsx)(`div`, {
                className: `flex-1 overflow-y-auto p-4 sm:p-6 bg-white`,
                children:
                  o.length === 0
                    ? (0, H.jsxs)(`div`, {
                        className: `h-full flex flex-col items-center justify-center text-center py-16 px-4`,
                        children: [
                          (0, H.jsx)(`div`, {
                            className: `w-16 h-16 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-amber-700 mb-4 shadow-sm`,
                            children: (0, H.jsx)(ud, { className: `w-8 h-8` }),
                          }),
                          (0, H.jsx)(`h3`, {
                            className: `text-base font-bold text-neutral-900`,
                            children: `فولدر پروژه‌های شما خالی است`,
                          }),
                          (0, H.jsx)(`p`, {
                            className: `text-xs text-neutral-500 max-w-md mt-1.5 leading-relaxed`,
                            children: `محتوای تستی قبلی حذف شده است. اکنون می‌توانید پروژه‌هایی را که واقعاً انجام داده‌اید همراه با جزئیات کامل، تصاویر و دکترین اجرایی اضافه کنید تا دیگران آن را مطالعه و بررسی کنند.`,
                          }),
                          (0, H.jsxs)(`div`, {
                            className: `flex flex-wrap items-center gap-3 mt-5`,
                            children: [
                              (0, H.jsxs)(`button`, {
                                onClick: w,
                                className: `px-5 py-2 rounded-xl bg-[#18181b] hover:bg-black text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95`,
                                children: [
                                  (0, H.jsx)(Td, {
                                    className: `w-4 h-4 text-amber-400`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `افزودن اولین پروژه واقعی`,
                                  }),
                                ],
                              }),
                              (0, H.jsxs)(`button`, {
                                onClick: () => {
                                  W.playSparkle();
                                  let e = pf();
                                  s(e);
                                },
                                className: `px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer`,
                                children: [
                                  (0, H.jsx)(Pd, {
                                    className: `w-3.5 h-3.5 text-amber-600`,
                                  }),
                                  (0, H.jsx)(`span`, {
                                    children: `بارگذاری یک پرونده نمونه جهت الگو`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      })
                    : x.length === 0
                      ? (0, H.jsxs)(`div`, {
                          className: `h-full flex flex-col items-center justify-center text-center py-12`,
                          children: [
                            (0, H.jsx)(dd, {
                              className: `w-12 h-12 text-neutral-300 mb-2`,
                            }),
                            (0, H.jsx)(`p`, {
                              className: `text-sm font-semibold text-neutral-600`,
                              children: `هیچ پروژه‌ای با این مشخصات یافت نشد.`,
                            }),
                            (0, H.jsx)(`button`, {
                              onClick: () => {
                                (l(``), d(`all`));
                              },
                              className: `mt-3 px-3.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg text-xs text-neutral-800 font-medium cursor-pointer`,
                              children: `پاک کردن فیلترها`,
                            }),
                          ],
                        })
                      : f === `grid`
                        ? (0, H.jsx)(`div`, {
                            className: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`,
                            children: x.map((e) => {
                              let t = m === e.id;
                              return (0, H.jsxs)(
                                `div`,
                                {
                                  onClick: () => C(e),
                                  onDoubleClick: () => ee(e),
                                  className: `group relative rounded-xl p-2.5 transition-all cursor-pointer flex flex-col border ${t ? `bg-neutral-50 border-neutral-900 shadow-md ring-2 ring-neutral-900/10` : `bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-md`}`,
                                  children: [
                                    (0, H.jsxs)(`div`, {
                                      className: `relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100 mb-2.5 border border-neutral-150`,
                                      children: [
                                        (0, H.jsx)(`img`, {
                                          src: e.coverImage,
                                          alt: e.title,
                                          className: `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`,
                                        }),
                                        (0, H.jsx)(`div`, {
                                          className: `absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`,
                                        }),
                                        (0, H.jsx)(`div`, {
                                          className: `absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300`,
                                          children: e.year,
                                        }),
                                        (0, H.jsxs)(`div`, {
                                          className: `absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity`,
                                          children: [
                                            (0, H.jsx)(`button`, {
                                              onClick: (t) => te(e, t),
                                              className: `p-1 rounded bg-black/75 hover:bg-black text-white text-[10px] transition-colors`,
                                              title: `ویرایش این پرونده`,
                                              children: (0, H.jsx)(wd, {
                                                className: `w-3 h-3`,
                                              }),
                                            }),
                                            (0, H.jsx)(`button`, {
                                              onClick: (t) => T(e.id, t),
                                              className: `p-1 rounded bg-red-600/85 hover:bg-red-700 text-white text-[10px] transition-colors`,
                                              title: `حذف پروژه`,
                                              children: (0, H.jsx)(Id, {
                                                className: `w-3 h-3`,
                                              }),
                                            }),
                                          ],
                                        }),
                                        (0, H.jsx)(`div`, {
                                          className: `absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/95`,
                                          children:
                                            e.deptTrack.split(`//`)[1] ||
                                            e.category,
                                        }),
                                      ],
                                    }),
                                    (0, H.jsxs)(`div`, {
                                      className: `flex-1 flex flex-col justify-between`,
                                      children: [
                                        (0, H.jsxs)(`div`, {
                                          children: [
                                            (0, H.jsx)(`h4`, {
                                              className: `text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors leading-tight`,
                                              children: e.title,
                                            }),
                                            e.subtitle &&
                                              (0, H.jsx)(`p`, {
                                                className: `text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-snug`,
                                                children: e.subtitle,
                                              }),
                                          ],
                                        }),
                                        (0, H.jsxs)(`div`, {
                                          className: `mt-3 pt-2 border-t border-neutral-150 flex items-center justify-between text-[11px]`,
                                          children: [
                                            (0, H.jsxs)(`span`, {
                                              className: `text-neutral-600 truncate max-w-[120px] flex items-center gap-1 font-medium`,
                                              children: [
                                                (0, H.jsx)(J, {
                                                  className: `w-3 h-3 text-neutral-400 shrink-0`,
                                                }),
                                                (0, H.jsx)(`span`, {
                                                  className: `truncate`,
                                                  children: e.client,
                                                }),
                                              ],
                                            }),
                                            (0, H.jsx)(`div`, {
                                              className: `flex items-center gap-1`,
                                              children: (0, H.jsxs)(`button`, {
                                                onClick: (t) => {
                                                  (t.stopPropagation(),
                                                    W.playWindowOpen(),
                                                    i(e));
                                                },
                                                className: `px-2.5 py-0.5 rounded bg-neutral-900 hover:bg-black text-[10px] font-bold text-white transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs`,
                                                children: [
                                                  (0, H.jsx)(`span`, {
                                                    children: `مطالعه پرونده`,
                                                  }),
                                                  (0, H.jsx)(Qu, {
                                                    className: `w-3 h-3`,
                                                  }),
                                                ],
                                              }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                e.id,
                              );
                            }),
                          })
                        : (0, H.jsx)(`div`, {
                            className: `bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs`,
                            children: (0, H.jsxs)(`table`, {
                              className: `w-full text-right text-xs`,
                              children: [
                                (0, H.jsx)(`thead`, {
                                  children: (0, H.jsxs)(`tr`, {
                                    className: `bg-[#FAF9F7] text-neutral-600 border-b border-neutral-200 font-bold text-[11px]`,
                                    children: [
                                      (0, H.jsx)(`th`, {
                                        className: `p-3`,
                                        children: `عنوان پروژه`,
                                      }),
                                      (0, H.jsx)(`th`, {
                                        className: `p-3`,
                                        children: `کارفرما`,
                                      }),
                                      (0, H.jsx)(`th`, {
                                        className: `p-3`,
                                        children: `دسته‌بندی`,
                                      }),
                                      (0, H.jsx)(`th`, {
                                        className: `p-3`,
                                        children: `شاخص کلیدی موفقیت`,
                                      }),
                                      (0, H.jsx)(`th`, {
                                        className: `p-3`,
                                        children: `سال`,
                                      }),
                                      (0, H.jsx)(`th`, {
                                        className: `p-3 text-left`,
                                        children: `اقدامات`,
                                      }),
                                    ],
                                  }),
                                }),
                                (0, H.jsx)(`tbody`, {
                                  className: `divide-y divide-neutral-150`,
                                  children: x.map((e) => {
                                    let t = m === e.id;
                                    return (0, H.jsxs)(
                                      `tr`,
                                      {
                                        onClick: () => C(e),
                                        onDoubleClick: () => ee(e),
                                        className: `cursor-pointer transition-colors ${t ? `bg-neutral-100 text-neutral-900 font-medium` : `hover:bg-neutral-50 text-neutral-800`}`,
                                        children: [
                                          (0, H.jsxs)(`td`, {
                                            className: `p-3 font-bold flex items-center gap-2.5`,
                                            children: [
                                              (0, H.jsx)(`img`, {
                                                src: e.coverImage,
                                                alt: ``,
                                                className: `w-8 h-8 rounded object-cover border border-neutral-200 shrink-0`,
                                              }),
                                              (0, H.jsxs)(`div`, {
                                                children: [
                                                  (0, H.jsx)(`div`, {
                                                    className: `font-bold text-neutral-900`,
                                                    children: e.title,
                                                  }),
                                                  e.subtitle &&
                                                    (0, H.jsx)(`div`, {
                                                      className: `text-[10px] text-neutral-500`,
                                                      children: e.subtitle,
                                                    }),
                                                ],
                                              }),
                                            ],
                                          }),
                                          (0, H.jsx)(`td`, {
                                            className: `p-3 text-neutral-700`,
                                            children: e.client,
                                          }),
                                          (0, H.jsx)(`td`, {
                                            className: `p-3 text-neutral-500 font-mono text-[11px]`,
                                            children: e.category,
                                          }),
                                          (0, H.jsx)(`td`, {
                                            className: `p-3`,
                                            children: (0, H.jsx)(`span`, {
                                              className: `px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200 font-bold`,
                                              children: e.metrics,
                                            }),
                                          }),
                                          (0, H.jsx)(`td`, {
                                            className: `p-3 font-mono text-[11px] text-neutral-500`,
                                            children: e.year,
                                          }),
                                          (0, H.jsx)(`td`, {
                                            className: `p-3 text-left`,
                                            children: (0, H.jsxs)(`div`, {
                                              className: `flex items-center justify-end gap-1.5`,
                                              children: [
                                                (0, H.jsx)(`button`, {
                                                  onClick: (t) => te(e, t),
                                                  className: `p-1 rounded hover:bg-neutral-200 text-neutral-600 transition-colors`,
                                                  title: `ویرایش`,
                                                  children: (0, H.jsx)(wd, {
                                                    className: `w-3.5 h-3.5`,
                                                  }),
                                                }),
                                                (0, H.jsx)(`button`, {
                                                  onClick: (t) => T(e.id, t),
                                                  className: `p-1 rounded hover:bg-red-50 text-red-500 transition-colors`,
                                                  title: `حذف`,
                                                  children: (0, H.jsx)(Id, {
                                                    className: `w-3.5 h-3.5`,
                                                  }),
                                                }),
                                                (0, H.jsxs)(`button`, {
                                                  onClick: (t) => {
                                                    (t.stopPropagation(),
                                                      W.playWindowOpen(),
                                                      i(e));
                                                  },
                                                  className: `px-2.5 py-1 rounded bg-[#18181b] hover:bg-black text-[11px] font-bold text-white transition-colors inline-flex items-center gap-1 cursor-pointer`,
                                                  children: [
                                                    (0, H.jsx)(`span`, {
                                                      children: `مطالعه`,
                                                    }),
                                                    (0, H.jsx)(sd, {
                                                      className: `w-3 h-3`,
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          }),
                                        ],
                                      },
                                      e.id,
                                    );
                                  }),
                                }),
                              ],
                            }),
                          }),
              }),
              (0, H.jsxs)(`div`, {
                className: `p-3 bg-[#FAF9F7] border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2`,
                children: [
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center gap-3`,
                    children: [
                      (0, H.jsxs)(`span`, {
                        className: `font-mono text-neutral-900 font-bold`,
                        children: [o.length, ` پرونده ثبت‌شده در فولدر`],
                      }),
                      (0, H.jsx)(`span`, {
                        className: `opacity-40`,
                        children: `•`,
                      }),
                      (0, H.jsx)(`span`, {
                        className: `hidden sm:inline font-medium`,
                        children: `برای مطالعه یا ویرایش هر پرونده روی آن کلیک کنید`,
                      }),
                    ],
                  }),
                  (0, H.jsxs)(`div`, {
                    className: `flex items-center gap-2`,
                    children: [
                      (0, H.jsxs)(`button`, {
                        onClick: w,
                        className: `px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-900 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer`,
                        children: [
                          (0, H.jsx)(Td, {
                            className: `w-3.5 h-3.5 stroke-[2.5]`,
                          }),
                          (0, H.jsx)(`span`, { children: `+ ثبت پروژه جدید` }),
                        ],
                      }),
                      a &&
                        (0, H.jsxs)(`button`, {
                          onClick: () => {
                            (W.playClick(),
                              a(
                                (m && o.find((e) => e.id === m)?.title) ||
                                  `پروژه‌های استودیو`,
                              ));
                          },
                          className: `px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-black text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer`,
                          children: [
                            (0, H.jsx)(jd, { className: `w-3 h-3 rotate-180` }),
                            (0, H.jsx)(`span`, {
                              children: `ثبت بریف بر پایه این پرونده‌ها`,
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        v &&
          (0, H.jsx)(_f, {
            initialProject: g,
            onClose: () => {
              (y(!1), _(null));
            },
            onSave: (e) => {
              if (g) {
                let t = df(e);
                s(t);
              } else {
                let t = uf(e);
                s(t);
              }
              (y(!1), _(null));
            },
            onDelete: (e) => {
              let proj = Iu.find((item) => item.id === e);
              if (proj) {
                addToTrash({
                  originalId: proj.id,
                  title: proj.title,
                  type: `project`,
                  source: `آرشیو پرونده‌های استودیو`,
                  summary: proj.description,
                  data: proj,
                });
              }
              (T(e), y(!1), _(null));
            },
            zIndex: t + 10,
            onFocus: n,
            containerRef: r,
          }),
      ],
    });
  },
  AdminPinModal = ({ isOpen: e, onClose: t, onSuccess: n }) => {
    let [pin, setPin] = (0, S.useState)(``),
      [err, setErr] = (0, S.useState)(``),
      ref = (0, S.useRef)(null);
    (0, S.useEffect)(() => {
      if (e) {
        setPin(``);
        setErr(``);
        setTimeout(() => ref.current?.focus(), 100);
      }
    }, [e]);
    if (!e) return null;
    let submit = (ev) => {
      ev.preventDefault();
      if (verifyAdminPin(pin)) {
        W.playWindowOpen();
        n();
      } else {
        W.playError();
        setErr(`پین‌کد وارد شده صحیح نمی‌باشد (رمز پیش‌فرض: 1234)`);
        setPin(``);
      }
    };
    return (0, H.jsx)(`div`, {
      dir: `rtl`,
      className: `fixed inset-0 z-[150] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none`,
      onClick: t,
      children: (0, H.jsxs)(`div`, {
        className: `w-full max-w-sm bg-[#161619] border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-white text-right space-y-4 animate-window-pop relative`,
        onClick: (e) => e.stopPropagation(),
        children: [
          (0, H.jsx)(`div`, {
            className: `w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl mx-auto shadow-lg shadow-amber-500/10`,
            children: `🔒`,
          }),
          (0, H.jsxs)(`div`, {
            className: `text-center`,
            children: [
              (0, H.jsx)(`h3`, {
                className: `font-bold text-base text-white`,
                children: `ورود امن به پنل مدیریت استودیو`,
              }),
              (0, H.jsx)(`p`, {
                className: `text-xs text-neutral-400 mt-1 leading-relaxed`,
                children: `بخش مدیریت برای کارفرمایان و بازدیدکنندگان مخفی است. برای ورود لطفاً رمز عبور را وارد کنید:`,
              }),
            ],
          }),
          (0, H.jsxs)(`form`, {
            onSubmit: submit,
            className: `space-y-3`,
            children: [
              (0, H.jsxs)(`div`, {
                children: [
                  (0, H.jsx)(`input`, {
                    ref: ref,
                    type: `password`,
                    maxLength: 8,
                    value: pin,
                    onChange: (e) => {
                      setPin(e.target.value);
                      setErr(``);
                    },
                    placeholder: `••••`,
                    className: `w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-center text-lg text-white font-mono tracking-widest focus:outline-none focus:border-amber-500`,
                  }),
                  err &&
                    (0, H.jsx)(`p`, {
                      className: `text-[11px] text-rose-400 text-center mt-1.5 font-medium`,
                      children: err,
                    }),
                ],
              }),
              (0, H.jsxs)(`div`, {
                className: `flex gap-2`,
                children: [
                  (0, H.jsx)(`button`, {
                    type: `button`,
                    onClick: t,
                    className: `flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer`,
                    children: `انصراف`,
                  }),
                  (0, H.jsx)(`button`, {
                    type: `submit`,
                    className: `flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20`,
                    children: `ورود به داشبورد`,
                  }),
                ],
              }),
            ],
          }),
          (0, H.jsxs)(`div`, {
            className: `pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 text-center space-y-0.5`,
            children: [
              (0, H.jsxs)(`div`, {
                children: [
                  `پین‌کد پیش‌فرض: `,
                  (0, H.jsx)(`span`, {
                    className: `font-mono text-amber-400 font-bold`,
                    children: `1234`,
                  }),
                  ` (قابل تغییر در پنل)`,
                ],
              }),
              (0, H.jsxs)(`div`, {
                children: [
                  `کلید میانبر در هر لحظه: `,
                  (0, H.jsx)(`span`, {
                    className: `font-mono text-neutral-400`,
                    children: `Ctrl + Shift + A`,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  yf = () => {
    let e = (0, S.useRef)(null),
      [t, n] = (0, S.useState)(() => {
        try {
          let saved = localStorage.getItem(`cj-custom-wallpaper`);
          if (
            saved &&
            saved !== `steamed-glass` &&
            !saved.includes(`9CGS5vDnNEb9gNflSwYWSyamhQU`)
          ) {
            return saved;
          }
        } catch {}
        return zu[0].url;
      }),
      [r, i] = (0, S.useState)(!0),
      [a, o] = (0, S.useState)({}),
      [s, c] = (0, S.useState)({}),
      [l, u] = (0, S.useState)(null),
      [d, f] = (0, S.useState)(null),
      [p, m] = (0, S.useState)(() => cf()),
      [h, g] = (0, S.useState)(null),
      [isAdminMode, setIsAdminMode] = (0, S.useState)(!1),
      [isAdminAuth, setIsAdminAuth] = (0, S.useState)(() => isAdminAuthenticated()),
      [showPinModal, setShowPinModal] = (0, S.useState)(!1),
      [activeClient, setActiveClient] = (0, S.useState)(() => getActiveClient());
    (0, S.useEffect)(() => {
      let e = () => {
        m(cf());
      };
      let handleClientSync = () => setActiveClient(getActiveClient());
      window.addEventListener(`projects-updated`, e);
      window.addEventListener(`CJ_STUDIO_DATA_CHANGED`, e);
      window.addEventListener(CLIENT_PORTAL_EVENT, handleClientSync);

      // Check ?admin=true or hash #admin
      if (typeof window !== `undefined`) {
        try {
          let params = new URLSearchParams(window.location.search);
          if (params.get(`admin`) === `true` || window.location.hash === `#admin`) {
            if (isAdminAuthenticated()) {
              setIsAdminMode(!0);
            } else {
              setShowPinModal(!0);
            }
          }
        } catch {}
      }

      // Shortcut: Ctrl+Shift+A or Cmd+Shift+A
      let handleKeyDown = (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && (ev.key === `A` || ev.key === `a` || ev.code === `KeyA`)) {
          ev.preventDefault();
          if (isAdminAuthenticated()) {
            setIsAdminMode((prev) => !prev);
          } else {
            setShowPinModal(!0);
          }
        }
      };

      let handleAuthEvent = () => {
        setIsAdminAuth(isAdminAuthenticated());
      };

      window.addEventListener(`keydown`, handleKeyDown);
      window.addEventListener(CJ_STUDIO_DATA_EVENT, handleAuthEvent);
      return () => {
        window.removeEventListener(`projects-updated`, e);
        window.removeEventListener(`CJ_STUDIO_DATA_CHANGED`, e);
        window.removeEventListener(CLIENT_PORTAL_EVENT, handleClientSync);
        window.removeEventListener(`keydown`, handleKeyDown);
        window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleAuthEvent);
      };
    }, []);
    let [_, v] = (0, S.useState)([]),
      [y, b] = (0, S.useState)(32),
      [x, C] = (0, S.useState)(null),
      [ee, w] = (0, S.useState)(null),
      te = () => {
        let e = !r;
        (i(e), (W.enabled = e), e && W.playClick());
      },
      T = (0, S.useCallback)((e) => {
        (b((t) => {
          let n = t + 1;
          return (
            v((t) => t.map((t) => (t.id === e ? { ...t, zIndex: n } : t))),
            n
          );
        }),
          window.dispatchEvent(
            new CustomEvent(`restore-mac-window`, { detail: { id: e } }),
          ));
      }, []),
      E = (0, S.useCallback)((e) => {
        (W.playWindowClose(), v((t) => t.filter((t) => t.id !== e)));
      }, []),
      D = (0, S.useCallback)(
        (e) => {
          W.playWindowOpen();
          let t = `folder-window-${e}`;
          if (e === `folder-projects`) {
            let e = `projects-folder-window`;
            v((t) => {
              if (t.find((t) => t.id === e)) return (T(e), t);
              let n = y + 1;
              return (
                b(n),
                [...t, { id: e, type: `projects-folder`, zIndex: n }]
              );
            });
          } else if (e === `folder-manifesto` || e === `manifesto`) {
            let e = `manifesto-window`;
            v((t) => {
              if (t.find((t) => t.id === e)) return (T(e), t);
              let n = y + 1;
              return (
                b(n),
                [...t, { id: e, type: `manifesto`, zIndex: n }]
              );
            });
          } else if (e === `folder-calendar` || e === `calendar`) {
            let e = `calendar-window`;
            v((t) => {
              if (t.find((t) => t.id === e)) return (T(e), t);
              let n = y + 1;
              return (
                b(n),
                [...t, { id: e, type: `calendar`, zIndex: n }]
              );
            });
          } else if (e === `folder-client-portal` || e === `client-portal`) {
            let e = `client-portal-window`;
            v((t) => {
              if (t.find((t) => t.id === e)) return (T(e), t);
              let n = y + 1;
              return (
                b(n),
                [...t, { id: e, type: `client-portal`, zIndex: n }]
              );
            });
          } else
            v((n) => {
              if (n.find((e) => e.id === t)) return (T(t), n);
              let r = y + 1;
              return (
                b(r),
                [...n, { id: t, type: `folder`, data: e, zIndex: r }]
              );
            });
        },
        [y, T],
      ),
      ne = (0, S.useCallback)(
        (e) => {
          W.playWindowOpen();
          let t = `project-${e.id}`;
          v((n) => {
            if (n.find((e) => e.id === t)) return (T(t), n);
            let r = y + 1;
            return (
              b(r),
              [...n, { id: t, type: `project`, data: e, zIndex: r }]
            );
          });
        },
        [y, T],
      ),
      re = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `calculator-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `calculator`, zIndex: n }]);
        });
      }, [y, T]),
      ie = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `manifesto-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `manifesto`, zIndex: n }]);
        });
      }, [y, T]),
      ae = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `featured-case-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `featured-case`, zIndex: n }]);
        });
      }, [y, T]),
      oe = (0, S.useCallback)(
        (e) => {
          W.playWindowOpen();
          let t = `brief-window`;
          v((n) => {
            if (n.find((e) => e.id === t))
              return (
                T(t),
                n.map((n) =>
                  n.id === t ? { ...n, data: e || n.data, zIndex: y + 1 } : n,
                )
              );
            let r = y + 1;
            return (b(r), [...n, { id: t, type: `brief`, data: e, zIndex: r }]);
          });
        },
        [y, T],
      ),
      O = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `notes-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `notes`, zIndex: n }]);
        });
      }, [y, T]),
      se = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `projects-folder-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `projects-folder`, zIndex: n }]);
        });
      }, [y, T]),
      k = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `bin-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `bin`, zIndex: n }]);
        });
      }, [y, T]),
      ce = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `wallpaper-selector`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `wallpaper`, zIndex: n }]);
        });
      }, [y, T]),
      pe = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `calendar-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `calendar`, zIndex: n }]);
        });
      }, [y, T]),
      openClientPortal = (0, S.useCallback)(() => {
        W.playWindowOpen();
        let e = `client-portal-window`;
        v((t) => {
          if (t.find((t) => t.id === e)) return (T(e), t);
          let n = y + 1;
          return (b(n), [...t, { id: e, type: `client-portal`, zIndex: n }]);
        });
      }, [y, T]);

    (0, S.useEffect)(() => {
      let handleOpenCal = () => pe();
      let handleOpenNotes = () => O();
      let handleOpenPortal = () => openClientPortal();
      window.addEventListener('open-calendar-window', handleOpenCal);
      window.addEventListener('open-notes-window', handleOpenNotes);
      window.addEventListener('open-client-portal-window', handleOpenPortal);
      return () => {
        window.removeEventListener('open-calendar-window', handleOpenCal);
        window.removeEventListener('open-notes-window', handleOpenNotes);
        window.removeEventListener('open-client-portal-window', handleOpenPortal);
      };
    }, [pe, O, openClientPortal]);

    let le = (e) => {
        let t = Lu.find((t) => t.id === e);
        t &&
          (t.dialogData
            ? (W.playError(), C(t.dialogData))
            : t.id === `admin`
              ? (W.playClick(), setIsAdminMode(!0))
              : t.id === `notes`
                ? O()
              : t.id === `services`
                ? D(`folder-track-1`)
                : t.id === `calendar`
                  ? pe()
                  : t.id === `client-portal`
                    ? openClientPortal()
                  : t.id === `calculator`
                    ? re()
                    : t.id === `manifesto`
                      ? ie()
                      : t.id === `featured-case`
                        ? ae()
                        : t.id === `gallery`
                          ? se()
                          : t.id === `brief`
                            ? oe()
                            : t.id === `bin` && k());
      },
      A = () => {
        (W.playTrash(), o({}), c({}), u(null), f(null));
      },
      ue = (e) => {
        (e.preventDefault(), W.playPop(), w({ x: e.clientX, y: e.clientY }));
      };
    (0, S.useEffect)(() => {
      let e = (e) => {
        if (e.key === `Escape`) {
          if (x) C(null);
          else if (_.length > 0) {
            let e = [..._].sort((e, t) => t.zIndex - e.zIndex)[0];
            e && E(e.id);
          }
        }
      };
      return (
        window.addEventListener(`keydown`, e),
        () => window.removeEventListener(`keydown`, e)
      );
    }, [_, x, E]);
    let de = [
      ..._.map((e) =>
        e.type === `notes`
          ? `notes`
          : e.type === `folder` || e.type === `services`
            ? `services`
          : e.type === `calculator`
            ? `calculator`
            : e.type === `manifesto`
              ? `manifesto`
              : e.type === `featured-case`
                ? `featured-case`
                : e.type === `brief` || e.type === `contact`
                  ? `brief`
                  : e.type === `gallery`
                    ? `gallery`
                    : e.type === `calendar`
                      ? `calendar`
                      : e.type === `client-portal`
                        ? `client-portal`
                      : e.type === `bin`
                        ? `bin`
                        : ``,
      ),
      x ? `diagnostic` : ``,
    ].filter(Boolean);
    if (isAdminMode) {
      return (0, H.jsx)(AdminPanel, {
        onExit: () => setIsAdminMode(!1),
        onLockAndExit: () => {
          setAdminAuthenticated(!1);
          setIsAdminAuth(!1);
          setIsAdminMode(!1);
        },
        onSetWallpaper: (e) => n(e),
      });
    }
    return (0, H.jsxs)(`div`, {
      ref: e,
      onContextMenu: ue,
      onClick: () => {
        (u(null), f(null), w(null));
      },
      className: `relative w-screen h-screen overflow-hidden select-none bg-[#F5F4F0] font-sans`,
      children: [
        (0, H.jsx)(`div`, {
          className: `absolute inset-0 z-0 pointer-events-none`,
          children:
            t === `live-motion`
              ? (0, H.jsx)(gf, {})
              : (0, H.jsxs)(H.Fragment, {
                    children: [
                      (0, H.jsx)(`img`, {
                        src: t,
                        alt: `Creativity Juice Desktop`,
                        className: `w-full h-full object-cover object-center filter contrast-[1.03] brightness-95 transition-all duration-700`,
                      }),
                      (0, H.jsx)(`div`, {
                        className: `absolute inset-0 bg-radial from-transparent via-black/10 to-black/40 pointer-events-none`,
                      }),
                    ],
                  }),
        }),
        (0, H.jsx)(Hd, {
          isAdminAuth: isAdminAuth,
          onOpenAdmin: () => {
            W.playClick();
            setIsAdminMode(!0);
          },
          onPromptAdminLogin: () => {
            W.playPop();
            setShowPinModal(!0);
          },
          onOpenNotes: O,
          onOpenManifesto: ie,
          onOpenError: () => {
            (W.playError(),
              C(Lu.find((e) => e.dialogData)?.dialogData || null));
          },
          onOpenBin: k,
          onOpenContact: () => oe(),
          onOpenFolder: (e) => D(e),
          onOpenBrief: () => oe(),
          onOpenGallery: se,
          onResetLayout: A,
          soundEnabled: r,
          onToggleSound: te,
          onOpenWallpaperSelector: ce,
          onOpenCalendar: pe,
          onOpenClientPortal: openClientPortal,
          activeClient: activeClient,
          currentWallpaperName: zu.find((e) => e.url === t)?.name || `Custom`,
        }),
        (0, H.jsx)(`div`, {
          className: `absolute inset-0 top-8 bottom-0 z-10 overflow-hidden pointer-events-none`,
          children: Au.filter((t) => t.id !== `folder-projects` && t.id !== `folder-client-portal`).map((t) => {
            let n =
              t.id === `folder-projects`
                ? {
                    ...t,
                    itemCount: p.length,
                    badge: `${p.length} پرونده واقعی`,
                  }
                : t;
            return (0, H.jsx)(
              Vu,
              {
                folder: n,
                isSelected: d === t.id,
                onSelect: () => {
                  (f(t.id), u(null));
                },
                onOpen: () => D(t.id),
                containerRef: e,
                currentPos: s[t.id],
                onDragEnd: (e) => c((n) => ({ ...n, [t.id]: e })),
              },
              t.id,
            );
          }),
        }),
        (0, H.jsx)(Hu, { onOpenApp: le, activeAppIds: de, isAdminAuth: isAdminAuth }),
        (0, H.jsx)(kc, {
          children: _.map((r) => {
            if (r.type === `folder` && r.data)
              return (0, H.jsx)(
                qd,
                {
                  initialFolderId: r.data,
                  onClose: () => E(r.id),
                  zIndex: r.zIndex,
                  onFocus: () => T(r.id),
                  containerRef: e,
                  onOpenBriefWithService: (e) => oe(`سند انتخابی: ${e}`),
                  onOpenManifesto: () => ie(),
                  onOpenProject: (proj) => ne(proj),
                },
                r.id,
              );
            if (r.type === `project` && r.data) {
              let t = r.data,
                n = p.find((e) => e.id === t.id) || t,
                i = p.findIndex((e) => e.id === n.id),
                a = p.length > 0 ? p[(i + 1) % p.length] : n,
                o = p.length > 0 ? p[(i - 1 + p.length) % p.length] : n;
              return (0, H.jsx)(
                Jd,
                {
                  project: n,
                  onClose: () => E(r.id),
                  zIndex: r.zIndex,
                  onFocus: () => T(r.id),
                  containerRef: e,
                  onNextProject: () => {
                    v((e) =>
                      e.map((e) => (e.id === r.id ? { ...e, data: a } : e)),
                    );
                  },
                  onPrevProject: () => {
                    v((e) =>
                      e.map((e) => (e.id === r.id ? { ...e, data: o } : e)),
                    );
                  },
                  onEditProject: (e) => {
                    g(e);
                  },
                  onRequestSimilarProject: () =>
                    oe(`درخواست پروژه مشابه: ${n.title}`),
                },
                r.id,
              );
            }
            return r.type === `services`
              ? (0, H.jsx)(
                  Yd,
                  {
                    onClose: () => E(r.id),
                    zIndex: r.zIndex,
                    onFocus: () => T(r.id),
                    containerRef: e,
                    onSelectServiceForBrief: (e) => oe(`خدمت انتخابی: ${e}`),
                  },
                  r.id,
                )
              : r.type === `calculator`
                ? (0, H.jsx)(
                    Xd,
                    {
                      onClose: () => E(r.id),
                      zIndex: r.zIndex,
                      onFocus: () => T(r.id),
                      containerRef: e,
                      onProceedToBrief: (e) => oe(`پیکربندی ماشین‌حساب: ${e}`),
                    },
                    r.id,
                  )
                : r.type === `manifesto`
                  ? (0, H.jsx)(
                      Zd,
                      {
                        onClose: () => E(r.id),
                        zIndex: r.zIndex,
                        onFocus: () => T(r.id),
                        containerRef: e,
                        onOpenProject: ne,
                      },
                      r.id,
                    )
                  : r.type === `featured-case`
                    ? (0, H.jsx)(
                        Qd,
                        {
                          onClose: () => E(r.id),
                          zIndex: r.zIndex,
                          onFocus: () => T(r.id),
                          containerRef: e,
                          onOpenBrief: () =>
                            oe(`پرونده آرکا: درخواست ری‌برندینگ و تحول مشابه`),
                        },
                        r.id,
                      )
                    : r.type === `brief`
                      ? (0, H.jsx)(
                          $d,
                          {
                            onClose: () => E(r.id),
                            zIndex: r.zIndex,
                            onFocus: () => T(r.id),
                            containerRef: e,
                            prefilledScope: r.data,
                          },
                          r.id,
                        )
                      : r.type === `notes`
                        ? (0, H.jsx)(
                            Ud,
                            {
                              id: `notes-window`,
                              title: activeClient
                                ? `دفترچه یادداشت‌ها و سناریوها • ${activeClient.brandName}`
                                : `دفترچه یادداشت، ایده‌ها و طوفان فکری • Creativity Juice Notes`,
                              subtitle: activeClient
                                ? `فضای اختصاصی یادداشت‌ها و سناریوهای ${activeClient.brandName} (کارفرما: ${activeClient.ownerName})`
                                : `فضای اختصاصی کارفرما و تیم برای ثبت ایده‌ها، سناریوها، چک‌لیست و بریف`,
                              onClose: () => E(r.id),
                              zIndex: r.zIndex,
                              onFocus: () => T(r.id),
                              containerRef: e,
                              width: `w-[96vw] sm:w-[92vw] md:w-[84vw] lg:w-[78vw]`,
                              maxWidth: `max-w-5xl`,
                              children: (0, H.jsx)(NotesWindow, {
                                onClose: () => E(r.id),
                                onOpenContact: () => oe(),
                              }),
                            },
                            r.id,
                          )
                        : r.type === `contact`
                          ? (0, H.jsx)(
                              tf,
                              {
                                onClose: () => E(r.id),
                                zIndex: r.zIndex,
                                onFocus: () => T(r.id),
                                containerRef: e,
                              },
                              r.id,
                            )
                          : r.type === `gallery`
                            ? (0, H.jsx)(
                                Z,
                                {
                                  onClose: () => E(r.id),
                                  zIndex: r.zIndex,
                                  onFocus: () => T(r.id),
                                  containerRef: e,
                                  onSelectProject: (e) => {
                                    let t = p.find((item) => item.id === e) || Iu.find((item) => item.id === e);
                                    t && ne(t);
                                  },
                                  onOpenBrief: (t) => oe(t),
                                },
                                r.id,
                              )
                            : r.type === `bin`
                              ? (0, H.jsx)(
                                  Ud,
                                  {
                                    id: `bin-window`,
                                    title: `سطل زباله و اقلام کنار گذاشته شده • Creativity Juice Bin`,
                                    subtitle: `اقلام تا زمان تصمیم شما برای پاک کردن دائمی، در اینجا نگهداری می‌شوند`,
                                    onClose: () => E(r.id),
                                    zIndex: r.zIndex,
                                    onFocus: () => T(r.id),
                                    containerRef: e,
                                    width: `w-[96vw] sm:w-[92vw] md:w-[84vw] lg:w-[75vw]`,
                                    maxWidth: `max-w-4xl`,
                                    children: (0, H.jsx)(TrashBinWindow, {
                                      onClose: () => E(r.id),
                                    }),
                                  },
                                  r.id,
                                )
                              : r.type === `wallpaper`
                                ? (0, H.jsx)(
                                    mf,
                                    {
                                      currentWallpaper: t,
                                      onSelectWallpaper: (e) => n(e),
                                      onClose: () => E(r.id),
                                      zIndex: r.zIndex,
                                      onFocus: () => T(r.id),
                                      containerRef: e,
                                    },
                                    r.id,
                                  )
                                : r.type === `projects-folder`
                                  ? (0, H.jsx)(
                                      vf,
                                      {
                                        onClose: () => E(r.id),
                                        zIndex: r.zIndex,
                                        onFocus: () => T(r.id),
                                        containerRef: e,
                                        onSelectProject: (e) => ne(e),
                                        onOpenBriefWithProject: (e) =>
                                          oe(`درخواست پروژه بر پایه: ${e}`),
                                      },
                                      r.id,
                                    )
                                  : r.type === `calendar`
                                    ? (0, H.jsx)(
                                        Ud,
                                        {
                                          id: `calendar-window`,
                                          title: activeClient
                                            ? `تقویم محتوای اختصاصی • ${activeClient.brandName}`
                                            : `تقویم محتوایی و برنامه‌ریزی سوشال مدیا • Creativity Juice`,
                                          subtitle: activeClient
                                            ? `برنامه‌ریزی، زمان‌بندی و انتشار محتوای اختصاصی برای برند ${activeClient.brandName}`
                                            : `برنامه‌ریزی، زمان‌بندی و انتشار محتوای اینستاگرام، لینکدین و یوتیوب`,
                                          onClose: () => E(r.id),
                                          zIndex: r.zIndex,
                                          onFocus: () => T(r.id),
                                          containerRef: e,
                                          width: `w-[96vw] sm:w-[92vw] md:w-[86vw] lg:w-[82vw]`,
                                          maxWidth: `max-w-6xl`,
                                          children: (0, H.jsx)(ContentCalendarWindow, {
                                            onClose: () => E(r.id),
                                          }),
                                        },
                                        r.id,
                                      )
                                  : r.type === `client-portal`
                                    ? (0, H.jsx)(
                                        Ud,
                                        {
                                          id: `client-portal-window`,
                                          title: `پورتال کارفرما و فضای کار اختصاصی • Creativity Juice Client Workspace`,
                                          subtitle: `درگاه امن رصد پیشرفت، پیش‌نمایش خروجی‌های سینمایی، بازبینی و تأییدیه فایل‌ها`,
                                          onClose: () => E(r.id),
                                          zIndex: r.zIndex,
                                          onFocus: () => T(r.id),
                                          containerRef: e,
                                          width: `w-[96vw] sm:w-[94vw] md:w-[90vw] lg:w-[86vw]`,
                                          maxWidth: `max-w-7xl`,
                                          children: (0, H.jsx)(ClientPortalWindow, {
                                            onClose: () => E(r.id),
                                            isAdminAuth: isAdminAuth,
                                            onSelectProject: (proj) => ne(proj),
                                            onOpenBrief: (scope) => oe(scope),
                                            onOpenCalendar: () => pe(),
                                          }),
                                        },
                                        r.id,
                                      )
                                  : null;
          }),
        }),
        (0, H.jsx)(kc, {
          children:
            x &&
            (0, H.jsx)(nf, {
              appTitle: x.appTitle,
              message: x.message,
              buttonText: x.buttonText,
              icon: x.icon,
              onDismiss: () => C(null),
              zIndex: y + 50,
            }),
        }),
        h &&
          (0, H.jsx)(_f, {
            initialProject: h,
            onClose: () => g(null),
            onSave: (e) => {
              let t = df(e);
              (m(t),
                v((t) =>
                  t.map((t) =>
                    t.id === `project-${e.id}` ? { ...t, data: e } : t,
                  ),
                ),
                g(null));
            },
            onDelete: (e) => {
              let proj = p.find((item) => item.id === e) || Iu.find((item) => item.id === e);
              if (proj) {
                addToTrash({
                  originalId: proj.id,
                  title: proj.title,
                  type: `project`,
                  source: `آرشیو پرونده‌های استودیو`,
                  summary: proj.description,
                  data: proj,
                });
              }
              let t = ff(e);
              (m(t), E(`project-${e}`), g(null));
            },
            zIndex: y + 60,
            onFocus: () => {},
            containerRef: e,
          }),
        ee &&
          (0, H.jsx)(hf, {
            x: ee.x,
            y: ee.y,
            onClose: () => w(null),
            onResetLayout: A,
            onOpenWallpaper: ce,
            onOpenNotes: O,
            onOpenBin: k,
            onOpenContact: () => oe(),
            onOpenServices: () => D(`folder-track-1`),
            onOpenCalculator: re,
            soundEnabled: r,
            onToggleSound: te,
          }),
        (0, H.jsx)(AdminPinModal, {
          isOpen: showPinModal,
          onClose: () => setShowPinModal(!1),
          onSuccess: () => {
            setIsAdminAuth(!0);
            setShowPinModal(!1);
            setIsAdminMode(!0);
          },
        }),
      ],
    });
  };
function bf() {
  let [e, t] = (0, S.useState)(!0);
  return (
    (0, S.useEffect)(() => {
      let e = setTimeout(() => {
        t(!1);
      }, 8e3);
      return () => clearTimeout(e);
    }, []),
    (0, H.jsxs)(`div`, {
      className: `relative w-screen h-screen overflow-hidden bg-[#F5F4F0] font-sans`,
      dir: `rtl`,
      children: [
        (0, H.jsx)(yf, {}),
        (0, H.jsx)(kc, {
          children:
            e &&
            (0, H.jsx)(ku.div, {
              initial: { opacity: 0, y: -20, scale: 0.95 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: -20, scale: 0.95 },
              transition: { duration: 0.35, ease: `easeOut` },
              className: `fixed top-11 left-1/2 -translate-x-1/2 z-50 pointer-events-auto`,
              children: (0, H.jsxs)(`div`, {
                className: `px-4 py-2 rounded-full bg-white/92 backdrop-blur-xl border border-black/10 text-neutral-800 text-xs shadow-xl flex items-center space-x-2.5 space-x-reverse`,
                children: [
                  (0, H.jsx)(`span`, { className: `text-sm`, children: `🍊` }),
                  (0, H.jsx)(`span`, {
                    className: `font-extrabold text-neutral-900`,
                    children: `Creativity Juice`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-300`,
                    children: `•`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-700 font-semibold`,
                    children: `پورتفولیو و استودیو خدمات مارکتینگ و برندسازی`,
                  }),
                  (0, H.jsx)(`span`, {
                    className: `text-neutral-300 hidden sm:inline`,
                    children: `•`,
                  }),
                  (0, H.jsxs)(`span`, {
                    className: `text-neutral-500 hidden sm:flex items-center gap-1 text-[11px] font-medium`,
                    children: [
                      (0, H.jsx)(Cd, {
                        className: `w-3 h-3 inline opacity-70`,
                      }),
                      ` جابه‌جایی آزاد فایل‌ها روی دسکتاپ`,
                    ],
                  }),
                  (0, H.jsx)(`button`, {
                    onClick: () => t(!1),
                    className: `mr-2 text-neutral-400 hover:text-black p-0.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer`,
                    title: `بستن پیام`,
                    children: (0, H.jsx)(Vd, { className: `w-3.5 h-3.5` }),
                  }),
                ],
              }),
            }),
        }),
      ],
    })
  );
}

export default bf;
