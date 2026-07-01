# ABC Pharma - منصة التعليم الصيدلي

منصة تعليمية متكاملة لتقديم الكورسات الصيدلية مع محاضرات مسجلة وملفات PDF وحماية متقدمة للمحتوى.

## التقنيات المستخدمة

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** للتصميم
- **Supabase** كقاعدة بيانات وتخزين
- **bcryptjs** لتشفير كلمات المرور
- **Font Awesome** للأيقونات
- **Vercel** للنشر

## الألوان والخطوط

- Teal: `#258D89`
- Navy: `#153F66`
- Coral: `#EB544E`
- Gold: `#C9A227`
- خلفية: `#f8fafc`
- العناوين: Tajawal 800
- النصوص: Cairo 400

## خطوات التثبيت

### 1. إعداد Supabase

1. أنشئ مشروع جديد على [Supabase](https://supabase.com)
2. من SQL Editor، نفّذ محتوى ملف `supabase-schema.sql`
3. من Storage، أنشئ bucket جديد باسم `Lectures` (public)
4. من Settings > API، انسخ:
   - `Project URL`
   - `anon public` key

### 2. إعداد المتغيرات البيئية

انسخ `.env.example` إلى `.env.local` واملأ القيم:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_EMAIL=abcpharma000@gmail.com
```

### 3. تثبيت الحزم وتشغيل المشروع

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

### 4. النشر على Vercel

```bash
npm install -g vercel
vercel --prod
```

أضف المتغيرات البيئية في Vercel Dashboard > Settings > Environment Variables.

## حساب الأدمن

- **البريد:** abcpharma000@gmail.com
- **كلمة المرور:** admin123

عند تسجيل الدخول بهذا البريد، يتم ترقية الحساب تلقائياً إلى دور `SUPERADMIN`.

## هيكل المشروع

```
src/
├── app/
│   ├── admin/              # لوحة تحكم الأدمن
│   ├── student/            # صفحات الطالب
│   ├── catalog/            # الكتالوج العام
│   ├── login/              # تسجيل الدخول
│   ├── register/           # إنشاء حساب
│   ├── bundle/[id]/        # تفاصيل الكورس
│   ├── api/                # مسارات API
│   ├── globals.css         # الأنماط العامة
│   ├── layout.tsx          # التخطيط الرئيسي
│   └── page.tsx            # الصفحة الرئيسية
├── components/             # مكونات React
├── lib/
│   ├── supabase.ts         # عميل Supabase
│   └── auth.ts             # دوال المصادقة
└── middleware.ts           # security headers
```

## المميزات

### للأدمن
- إحصائيات شاملة (طلاب، كورسات، مشتريات، إيرادات)
- إدارة الكورسات (إضافة/تعديل/حذف + رفع صور)
- إدارة المحاضرات (روابط YouTube + PDF + ترتيب)
- مراجعة طلبات الاشتراك وقبولها/رفضها
- إدارة الطلاب (قفل/تفعيل/إعادة تعيين كلمة مرور)
- سجل نشاط كامل مع تمييز العمليات المشبوهة بالأحمر

### للطالب
- تصفح الكورسات والبحث
- اشتراك عبر فودافون كاش ورفع إيصال
- مشاهدة المحاضرات مع مشغل YouTube آمن
- فتح ملفات PDF في تاب جديد
- تتبع التقدم في كل كورس
- حماية المحتوى من النسخ والطباعة وأدوات المطور

### حماية المحتوى في StudentLecture
- منع النقر بالزر الأيمن
- منع اختصارات DevTools (F12, Ctrl+Shift+S/I/J/C)
- منع الطباعة (Ctrl+P)
- منع عرض المصدر (Ctrl+U)
- كشف DevTools المفتوح كل ثانية
- تعطيل user-select على المحتوى
- تسجيل كل عملية مشبوهة في `audit_log` بـ action يبدأ بـ `SUSPICIOUS_`

## التواصل

- **واتساب:** +20 101 975 5523
- **البريد:** abcpharma000@gmail.com
- **المالك:** يحيى ياسين عزب

## السوشيال ميديا

- [TikTok](https://www.tiktok.com/@yahya.azab.abcpharma)
- [YouTube](https://youtube.com/@abcpharmaya)
- [Instagram](https://www.instagram.com/yahya.azab.abcpharma)
- [Facebook](https://www.facebook.com/share/1CxsobAfwm/)
- [X (Twitter)](https://x.com/abcpharmaYA)
- [LinkedIn](https://www.linkedin.com/in/yahya-azab-54a579385)

© ABC Pharma. جميع الحقوق محفوظة.
