# Implementation Plan: قسم المدرسين لعرض المذكرات وطلب الأسعار

**Branch**: `001-teachers-booklet-showcase` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-teachers-booklet-showcase/spec.md`

## Summary

نبني على متجر المذكرات الموجود (`Booklet` و`BookletsController`) بدل نظام موازٍ: نضيف عروض الكميات وصفحات العينات (صور بعلامة مائية تُولَّد على السيرفر) وطلبات المدرسين، وصفحة عامة `/teachers` ولوحة إدارة. الاكتشاف الأهم أن المعاينة الحالية `GET /api/booklets/{id}/preview` تعيد **ملف PDF كاملاً** (تحديد الصفحات يتم في المتصفح فقط)، فلا يصلح لمتطلب «عدم كشف الملف الكامل» (FR-005)؛ لذلك العينات تُولَّد كصور على السيرفر ولا يخرج الـ PDF الأصلي مطلقاً في هذا القسم.

## Technical Context

**Language/Version**: C# / .NET 8 (ASP.NET Core، Controllers) للخلفية؛ TypeScript 5 / React 19 (Vite) للواجهة

**Primary Dependencies**: EF Core 8 (Npgsql للإنتاج وSQLite محلياً)، TanStack Query 5، Tailwind 3.4، framer-motion، lucide-react؛ جديد: `PDFtoImage` (PDFium) + `SkiaSharp` لتحويل صفحات PDF إلى صور ورسم العلامة المائية

**Storage**: PostgreSQL (إنتاج) / SQLite (محلي) عبر EF migrations؛ ملفات صور العينات تحت `wwwroot/uploads/samples/` (نفس نمط رفع الملفات الحالي) على Volume دائم

**Testing**: `dotnet test` (xUnit) لمنطق التحقق والتسعير وتوليد العينات؛ اختبار يدوي موثق في `quickstart.md` للواجهة (لا يوجد إطار اختبار واجهة حالياً)

**Target Platform**: Docker على VPS (صورة واحدة تخدم الواجهة والـ API)، متصفحات الهاتف والحاسوب

**Project Type**: web-application (frontend + backend)

**Performance Goals**: صفحة `/teachers` تظهر محتواها الأول خلال 2 ثانية على شبكة 4G؛ العينات تُحمَّل تدريجياً (lazy) وبحجم لا يتجاوز ~150KB للصورة

**Constraints**: العربية RTL والوضع الليلي؛ لا كشف للملف الكامل؛ حد معدل لطلبات المدرسين؛ لا دفع أونلاين؛ لا حسابات للمدرسين

**Scale/Scope**: عشرات المذكرات، مئات الطلبات شهرياً، مشرف واحد

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

ملف `.specify/memory/constitution.md` ما زال القالب الافتراضي غير معبّأ، فلا توجد بوابات رسمية. نطبّق الممارسات القائمة في المشروع كبوابات ضمنية:

- ✅ **البناء على الموجود**: توسيع `Booklet` و`BookletsController` بدل جداول موازية.
- ✅ **ترحيلات متوافقة مع Postgres**: كل عمود مُعرَّف بنوع صريح (`[Column(TypeName=...)]`) ونمط الهوية (ما تعلمناه من مشاكل SQLite→Postgres السابقة).
- ✅ **الصلاحيات**: كل عمليات الإدارة `Authorize(Roles = "Admin")` مثل `BookletsController`.
- ✅ **إتاحة الوصول وRTL** وتباين الألوان وأحجام اللمس 44px.
- ⚠️ لا توجد constitution مكتوبة: يُنصح بتشغيل `/speckit-constitution` لاحقاً لتثبيت هذه القواعد.

**Re-check بعد التصميم**: لا مخالفات. التعقيد الوحيد المضاف مكتبة PDFium/Skia (موثقة في `research.md` مع بديل).

## Project Structure

### Documentation (this feature)

```text
specs/001-teachers-booklet-showcase/
├── plan.md              # هذا الملف
├── research.md          # قرارات وبدائل
├── data-model.md        # الكيانات
├── quickstart.md        # سيناريوهات تحقق
├── contracts/
│   └── teachers-api.md  # عقود الـ API
├── checklists/requirements.md
└── tasks.md             # يُنشأ بأمر /speckit-tasks
```

### Source Code (repository root)

```text
Backend/EduPlatform.API/
├── Models/
│   ├── Booklet.cs                      # + TeacherShowcase, TeacherSummary (حقول جديدة)
│   ├── BookletQuantityOffer.cs         # جديد
│   ├── BookletSamplePage.cs            # جديد
│   └── TeacherInquiry.cs               # جديد
├── Data/AppDbContext.cs                # DbSets + علاقات
├── Migrations/                         # AddTeacherShowcase (Postgres-safe)
├── Controllers/
│   ├── TeacherBookletsController.cs    # عام: قائمة/تفاصيل/عينات + إدارة
│   └── TeacherInquiriesController.cs   # عام: إرسال طلب؛ إدارة: قائمة/حالة
├── Services/
│   ├── SampleRenderer.cs               # PDF → صور + علامة مائية
│   └── InquiryNotifier.cs              # إشعار واتساب/بريد للأستاذ
└── Program.cs                          # تسجيل الخدمات + سياسة rate limit "inquiries"

Frontend/src/
├── api/teachers.ts
├── pages/landing/TeachersPage.tsx           # الصفوف + كروت المذكرات
├── pages/landing/TeacherBookletPage.tsx     # التفاصيل + العينات + النموذج
├── pages/admin/TeacherShowcaseManager.tsx   # إدارة المذكرات والعينات
├── pages/admin/TeacherInquiriesAdmin.tsx    # متابعة الطلبات
├── components/teachers/{SampleViewer,InquiryForm,QuantityTable}.tsx
└── App.tsx / Navbar.tsx / Footer.tsx        # مسارات وروابط

Backend/EduPlatform.API.Tests/               # جديد: xUnit
```

**Structure Decision**: تطبيق ويب (Option 2) داخل الهيكل الحالي `Backend/` و`Frontend/`، دون مشاريع جديدة عدا مشروع اختبارات صغير.

## Complexity Tracking

| الإضافة | لماذا لازمة | البديل الأبسط المرفوض لأن |
|---------|-------------|---------------------------|
| مكتبة PDFium/Skia على السيرفر | توليد عينات بعلامة مائية دون كشف الملف الكامل (FR-005, FR-013) | إعادة PDF كاملاً بحد صفحات في المتصفح (الحالي) يكشف الملف كاملاً |
| 3 جداول جديدة | عروض كميات وعينات وطلبات لا تناسب حقول `Booklet` | حشرها في أعمدة JSON يصعب الاستعلام والتصفية |
