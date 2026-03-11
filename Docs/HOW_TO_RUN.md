# دليل تشغيل منصة الأستاذ عامر التعليمية

## المتطلبات الأساسية

| الأداة | الإصدار | التنزيل |
|--------|---------|---------|
| .NET SDK | 8.0+ | https://dotnet.microsoft.com/download |
| Node.js  | 18+  | https://nodejs.org |
| SQL Server Express | أي إصدار | https://www.microsoft.com/sql-server |
| Visual Studio | 2022+ | https://visualstudio.microsoft.com |

---

## خطوات التشغيل

### 1. إعداد قاعدة البيانات

**الطريقة الأولى — Entity Framework (تلقائي):**
```
المشروع يُنشئ قاعدة البيانات تلقائياً عند أول تشغيل.
تأكد أن SQL Server يعمل وعدّل appsettings.json إذا لزم.
```

**الطريقة الثانية — SQL Script:**
```sql
افتح SQL Server Management Studio وشغّل:
Docs\Database_Setup.sql
```

---

### 2. تشغيل الـ Backend (ASP.NET Core)

> ⚠️ **مهم:** افتح PowerShell أو cmd **كمسؤول** ونفّذ الأوامر التالية:

```powershell
# أضف dotnet للـ PATH في الجلسة الحالية (إذا لم يُتعرّف عليه)
$env:PATH += ";C:\Program Files\dotnet"

# انتقل لمجلد الـ API
cd "F:\Amer\Mr Amer Platform\Backend\EduPlatform.API"

# ابنِ المشروع
dotnet build --no-restore

# شغّل المشروع
dotnet run
```

الـ API سيعمل على: **http://localhost:5000**

أو افتح `Backend\EduPlatform.sln` في Visual Studio واضغط **F5**.

> 💡 **لإضافة dotnet للـ PATH بشكل دائم:**
> اذهب إلى: `System Properties → Environment Variables → Path → New`
> أضف: `C:\Program Files\dotnet`

---

### 3. تشغيل الـ Frontend (React)

```powershell
# من مجلد المشروع الجذر (وليس داخل Backend)
cd "F:\Amer\Mr Amer Platform\Frontend"
npm install
npm run dev
```

الواجهة ستعمل على: **http://localhost:5173**

---

## بيانات الدخول التجريبية

| الدور   | البريد                       | كلمة المرور  |
|---------|------------------------------|--------------|
| مدير    | admin@eduplatform.com        | Admin@123    |
| مدرّس   | teacher@eduplatform.com      | Teacher@123  |
| طالب    | student@eduplatform.com      | Student@123  |

---

## بنية المشروع

```
Mr Amer Platform/
├── Backend/
│   └── EduPlatform.API/
│       ├── Controllers/     ← نقاط نهاية الـ API
│       ├── Models/          ← نماذج قاعدة البيانات
│       ├── Services/        ← منطق الأعمال
│       ├── DTOs/            ← نماذج نقل البيانات
│       ├── Data/            ← DbContext و Seeder
│       ├── Program.cs       ← نقطة بدء التطبيق
│       └── appsettings.json ← الإعدادات
├── Frontend/
│   └── src/
│       ├── api/             ← طبقة الاتصال بالـ API
│       ├── components/      ← مكونات مشتركة
│       ├── pages/           ← صفحات الطالب والمدرّس والأدمن
│       ├── games/           ← ألعاب PhaserJS
│       ├── store/           ← إدارة الحالة (Zustand)
│       ├── types/           ← أنواع TypeScript
│       └── App.tsx          ← التوجيه الرئيسي
└── Docs/
    ├── HOW_TO_RUN.md       ← هذا الملف
    └── Database_Setup.sql  ← سكريبت قاعدة البيانات
```

---

## إعدادات appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=EduPlatformDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "EduPlatform_SuperSecret_Key_2026_MrAmer_Platform_JWT"
  }
}
```

> ⚠️ غيّر اسم السيرفر (`.`) إلى اسم سيرفر SQL الخاص بك إذا كان مختلفاً.

---

## نشر المشروع للإنترنت

### Backend
```bash
dotnet publish -c Release -o ./publish
# ارفع مجلد publish على IIS أو Azure App Service
```

### Frontend
```bash
npm run build
# ارفع مجلد dist على Netlify / Vercel / أي استضافة ثابتة
# عدّل VITE_API_URL في .env ليشير لرابط الـ API الفعلي
```

---

## الميزات الرئيسية

- ✅ تسجيل دخول JWT مع أدوار (Student / Teacher / Admin)
- ✅ لوحة مدرّس: رفع دروس، فيديوهات، اختبارات
- ✅ لوحة طالب: مشاهدة دروس، أداء اختبارات، عرض نتائج
- ✅ لوحة أدمن: إدارة مستخدمين، دروس، إشعارات جماعية
- ✅ أسئلة متعددة: صح/خطأ، اختياري، أكمل، ترتيب
- ✅ ألعاب تعليمية تفاعلية (PhaserJS)
- ✅ Dark Mode / Light Mode
- ✅ تصميم متجاوب مع جميع الأجهزة
- ✅ دعم YouTube وVimeo
