---

description: "Task list for the Teachers booklet showcase (قسم المدرسين)"
---

# Tasks: قسم المدرسين لعرض المذكرات وطلب الأسعار

**Input**: Design documents from `/specs/001-teachers-booklet-showcase/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/teachers-api.md, quickstart.md

**Tests**: لم يُطلب TDD. مهام اختبارات الوحدة الصغيرة (منطق الهاتف والتسعير والحالة) في المرحلة الأخيرة اختيارية؛ التحقق الأساسي عبر `quickstart.md`.

**Organization**: المهام مجمّعة حسب قصة المستخدم لتُنفَّذ وتُختبر مستقلة.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: يمكن تنفيذها بالتوازي (ملفات مختلفة، بدون اعتماد على مهام غير مكتملة)
- **[Story]**: US1..US4 حسب `spec.md`

## Path Conventions

- الخلفية: `Backend/EduPlatform.API/`
- الواجهة: `Frontend/src/`

---

## Phase 1: Setup

- [X] T001 تأكد من نجاح `dotnet build` و`npx tsc -p tsconfig.app.json --noEmit` كخط أساس قبل أي تعديل (المعروف: خطأ واحد في `Frontend/src/components/ui/LibraryLockModal.tsx` ليس من هذه الميزة)
- [ ] T002 أضف حزم `PDFtoImage` و`SkiaSharp.NativeAssets.Linux.NoDependencies` إلى `Backend/EduPlatform.API/EduPlatform.API.csproj` ثم تأكد أن البناء ينجح محلياً
- [ ] T003 **مهمة تقليل المخاطر (R2 في research.md)**: اكتب سكربت/نقطة تجربة مؤقتة تحوّل صفحة واحدة من PDF إلى صورة داخل **صورة Docker الفعلية** (`Dockerfile` في الجذر) وتأكد أنها تعمل؛ إن فشلت اعتمد خيار «رفع صور العينات يدوياً» (T024) ولا تنتظر
- [X] T004 [P] أضف إعدادات تواصل الأستاذ إلى `Backend/EduPlatform.API/appsettings.json` وقراءتها من متغيرات البيئة في `Program.cs`: `TEACHERS_WHATSAPP` (القيمة: `201096066818`، أي 01096066818 بصيغة دولية بدون +)، `TEACHERS_NOTIFY_EMAIL` (القيمة لم تُحدَّد بعد، تحتاج من المالك)

---

## Phase 2: Foundational (يمنع بدء أي قصة)

- [X] T005 [P] أضف الحقول الجديدة إلى `Backend/EduPlatform.API/Models/Booklet.cs`: `TeacherShowcase` (bool, `[Column(TypeName = "boolean")]`, افتراضي false) و`TeacherSummary` (string?, `[MaxLength(1000)]`)
- [X] T006 [P] أنشئ `Backend/EduPlatform.API/Models/BookletQuantityOffer.cs`: `Id` (int PK)، `BookletId` (int FK → Booklet, cascade)، `MinQuantity` (int، ≥ 2)، `UnitPrice` (decimal `numeric`، > 0 وأقل من `TeacherPrice`)، فهرس فريد على (`BookletId`, `MinQuantity`)
- [X] T007 [P] أنشئ `Backend/EduPlatform.API/Models/BookletSamplePage.cs`: `Id`، `BookletId` (FK cascade)، `PageNumber` (int)، `ImageUrl` (string)، `SortOrder` (int)، `CreatedAt` (`timestamp without time zone`)؛ حد أقصى 8 عينات لكل مذكرة
- [X] T008 [P] أنشئ `Backend/EduPlatform.API/Models/TeacherInquiry.cs` بكل الحقول من data-model.md: `BookletId` (int? FK، SetNull)، `Name` (2–100)، `Phone` (11 رقماً بعد التوحيد)، `Governorate` (≤ 50)، `GradeLevel` (≤ 50, اختياري)، `Subject` (≤ 100, اختياري)، `Quantity` (1–5000)، `Notes` (≤ 1000, اختياري)، `Status` (enum: New, Contacted, Sold, Cancelled؛ افتراضي New)، `AdminNote` (≤ 1000)، `IpHash` (string?)، `CreatedAt`/`UpdatedAt` (`timestamp without time zone`)
- [X] T009 سجّل `DbSet` الثلاثة وعلاقاتها في `Backend/EduPlatform.API/Data/AppDbContext.cs` (يعتمد على T005–T008)
- [X] T010 أنشئ الـ migration `AddTeacherShowcase` وتأكد أن كل الأعمدة بأنواع Postgres صريحة ونمط identity (`Npgsql:ValueGenerationStrategy`) كما في ترحيلات المشروع السابقة، وجرّب تطبيقه على SQLite محلياً (يعتمد على T009)
- [X] T011 [P] أضف سياسة rate limit باسم `inquiries` (5 طلبات / 10 دقائق لكل IP، `QueueLimit = 0`) إلى `AddRateLimiter` في `Backend/EduPlatform.API/Program.cs`
- [X] T012 [P] أضف `teachers` إلى `AllowedPages` في `Backend/EduPlatform.API/Controllers/VisitsController.cs`
- [X] T013 [P] أنشئ قائمة الصفوف الثابتة (Prim4…Sec2 + اسم المادة لكل مرحلة) كملف مشترك `Frontend/src/data/grades.ts` واستخرجها من `Frontend/src/pages/landing/AssessmentsPage.tsx` للاستعمال في الصفحتين
- [X] T014 [P] أنشئ `Frontend/src/api/teachers.ts` بالأنواع والدوال حسب `contracts/teachers-api.md` (قائمة، تفاصيل، إرسال طلب، وإدارة)

**Checkpoint**: القاعدة والهياكل جاهزة.

---

## Phase 3: User Story 1 - المدرس يتصفح ويعاين العينات ويعرف السعر (Priority: P1) 🎯 MVP

**Goal**: صفحة عامة `/teachers` بكروت الصفوف والمذكرات والتفاصيل والعينات والسعر وعروض الكميات.

**Independent Test**: سيناريو 1 في `quickstart.md`.

- [X] T015 [US1] أنشئ `Backend/EduPlatform.API/Controllers/TeacherBookletsController.cs` (عام، `AllowAnonymous`) بـ `GET /api/teacher-booklets?grade=` و`GET /api/teacher-booklets/{id}` حسب العقد؛ يعيد فقط `TeacherShowcase && IsPublished`، ولا يعيد `PdfUrl` أبداً، ويعيد 404 لغير المتاح
- [X] T016 [US1] احسب `minOfferPrice` و`hasSamples` في استجابة القائمة، وأعد `quantityOffers` و`samples` (مرتبة بـ `SortOrder`) في التفاصيل (نفس الملف T015)
- [X] T017 [P] [US1] أنشئ `Frontend/src/components/teachers/QuantityTable.tsx` (جدول عروض الكميات، RTL، مع حالة «اسأل عن السعر»)
- [X] T018 [P] [US1] أنشئ `Frontend/src/components/teachers/SampleViewer.tsx` (عرض صور العينات بالتمرير أو الأزرار، `loading="lazy"`، لا زر تنزيل ولا قائمة سياقية على الصورة، رسالة «العينات قريباً» عند الغياب)
- [X] T019 [US1] أنشئ `Frontend/src/pages/landing/TeachersPage.tsx`: كروت الصفوف (المفعّل للصفوف التي بها مذكرات و«قريباً» لغيرها) ثم كروت المذكرات (غلاف، عنوان، سعر)، وعدّاد زيارات `teachers` (نفس نمط الصفحة التقييمات)، ويستخدم `grades.ts` (T013)
- [X] T020 [US1] أنشئ `Frontend/src/pages/landing/TeacherBookletPage.tsx` (التفاصيل + `SampleViewer` + `QuantityTable` + مكان نموذج الطلب)
- [X] T021 [US1] أضف المسارين `/teachers` و`/teachers/:id` داخل مجموعة `LandingLayout` في `Frontend/src/App.tsx` (lazy) وأضف رابط «للمدرسين» في `Frontend/src/components/landing/Navbar.tsx` و`Footer.tsx`
- [X] T022 [US1] تحقق يدوياً من RTL والوضع الليلي وعرض 360px وغياب أي رابط للملف الكامل (SC-005, SC-006)

**Checkpoint**: القصة 1 تعمل وحدها بمحتوى مُدخل يدوياً في القاعدة.

---

## Phase 4: User Story 2 - المدرس يرسل طلب عرض سعر أو شراء (Priority: P1)

**Goal**: نموذج طلب يُحفظ ويُنبَّه به الأستاذ ويُفتح واتساب بنص جاهز.

**Independent Test**: سيناريو 2 في `quickstart.md`.

- [X] T023 [US2] أنشئ `Backend/EduPlatform.API/Services/PhoneNormalizer.cs`: يحوّل الأرقام العربية/الهندية إلى لاتينية ويزيل المسافات والرموز ويقبل `01XXXXXXXXX` (11 رقماً، يبدأ بـ 010/011/012/015) ويرفض غيرها
- [X] T024 [US2] أنشئ `Backend/EduPlatform.API/Controllers/TeacherInquiriesController.cs` بـ `POST /api/teacher-inquiries` (`[EnableRateLimiting("inquiries")]`): تحقق من الحقول بالقيود الواردة في T008، مصيدة `website` (إن لم تكن فارغة أعد 200 دون حفظ)، تخزين `IpHash` (SHA-256 للـ IP + ملح) بدل العنوان، الرد 201 مع `whatsAppUrl` (نص جاهز يحوي اسم المذكرة والكمية)، والأخطاء 400 بصيغة `{ errors: { field: message } }` برسائل عربية
- [X] T025 [US2] أنشئ `Backend/EduPlatform.API/Services/InquiryNotifier.cs` (يرسل بريداً عبر MailKit إلى `TEACHERS_NOTIFY_EMAIL`) واستدعِه بعد الحفظ بشكل غير حاجب (فشله يُسجَّل ولا يُفشل الطلب)
- [X] T026 [US2] سجّل الخدمات (`PhoneNormalizer`, `InquiryNotifier`) في `Backend/EduPlatform.API/Program.cs`
- [X] T027 [P] [US2] أنشئ `Frontend/src/components/teachers/InquiryForm.tsx` (حقول: الاسم، الهاتف، المحافظة من قائمة، المرحلة والمادة، الكمية، ملاحظات، مصيدة مخفية)، رسائل أخطاء عربية من الخادم، حالة نجاح بزر واتساب، ومعالجة 429
- [X] T028 [US2] ضمّن `InquiryForm` في `TeacherBookletPage.tsx` (طلب مرتبط بالمذكرة) وفي أسفل `TeachersPage.tsx` (طلب عام)
- [X] T029 [US2] تحقق من سيناريو 2 كاملاً (هاتف خاطئ، كمية 0، تجاوز الحد 429، وصول الإشعار)

**Checkpoint**: يمكن الإطلاق التجريبي (MVP): تصفح + عينات + طلبات، مع إدخال المذكرات يدوياً.

---

## Phase 5: User Story 3 - الأستاذ يدير المذكرات والأسعار والعينات (Priority: P2)

**Goal**: لوحة إدارة لنشر المذكرة وتحديد سعرها وعروضها وتوليد عيناتها.

**Independent Test**: سيناريو 3 (الخطوات 1–2، 4).

- [ ] T030 [US3] أنشئ `Backend/EduPlatform.API/Services/SampleRenderer.cs`: يحوّل صفحات محددة من PDF المذكرة (محلي من `wwwroot` أو رابط مباشر) إلى صور بعرض ~900px بصيغة WebP/JPEG ≤ 150KB، ويرسم علامة مائية متكررة (اسم المنصة + `amertimraz.com`) ويحفظها في `wwwroot/uploads/samples/{bookletId}/`؛ استعمل صورة PNG جاهزة للعلامة إن تعذّر الخط العربي (R3)
- [ ] T031 [US3] أضف إلى `TeacherBookletsController.cs` (إدارة، `Authorize(Roles = "Admin")`): `GET /api/admin/teacher-booklets`، `PUT /api/admin/teacher-booklets/{id}` (`TeacherShowcase`, `TeacherSummary`, `TeacherPrice`)، `PUT .../{id}/offers` (استبدال عروض الكميات مع التحقق من T006)
- [ ] T032 [US3] أضف نقاط العينات: `POST .../{id}/samples/generate` (body: `{ pages: [..] }`، حد 8 صفحات، 422 برسالة عربية عند الفشل)، `POST .../{id}/samples/upload` (بديل رفع صور مباشرة، يُقبل png/jpg/webp حتى 2MB ويُركَّب عليها العلامة)، `DELETE .../samples/{sampleId}`، `PUT .../samples/order`
- [ ] T033 [US3] أنشئ `Frontend/src/pages/admin/TeacherShowcaseManager.tsx`: قائمة المذكرات بمفتاح «عرض للمدرسين»، تحرير الملخص والسعر وعروض الكميات (إضافة/حذف صفوف)، اختيار صفحات العينات وتوليدها، رفع يدوي، حذف وترتيب، ومعاينة كما يراها المدرس
- [ ] T034 [US3] أضف مسار الإدارة (محمي بدور Admin) في `Frontend/src/App.tsx` ورابطه في قائمة لوحة الإدارة `Frontend/src/components/layout/Sidebar.tsx`
- [ ] T035 [US3] تحقق: سيناريو 3 (نشر، تعديل سعر، إخفاء ⇒ 404، وصول غير المشرف ⇒ 403)

---

## Phase 6: User Story 4 - الأستاذ يتابع طلبات المدرسين (Priority: P2)

**Goal**: شاشة طلبات بتصفية وتغيير حالة وملاحظات.

**Independent Test**: سيناريو 3 (الخطوة 3).

- [ ] T036 [US4] أضف إلى `TeacherInquiriesController.cs` (إدارة): `GET /api/admin/teacher-inquiries?status=&governorate=&bookletId=&page=` (الأحدث أولاً، ترقيم صفحات) و`PUT /api/admin/teacher-inquiries/{id}` (`status`, `adminNote ≤ 1000`، يحدّث `UpdatedAt`)
- [ ] T037 [US4] أنشئ `Frontend/src/pages/admin/TeacherInquiriesAdmin.tsx`: جدول/كروت بالأحدث، شارة «جديد»، تصفية بالحالة والمحافظة والمذكرة، تغيير الحالة وإضافة ملاحظة، زر اتصال/واتساب لكل طلب، وتصدير CSV
- [ ] T038 [US4] أضف المسار ورابط الشريط الجانبي في `Frontend/src/App.tsx` و`Sidebar.tsx`، وشارة عدد الطلبات الجديدة

---

## Phase 7: Polish & Cross-Cutting

- [ ] T039 [P] (اختياري) مشروع اختبارات `Backend/EduPlatform.API.Tests` (xUnit): `PhoneNormalizer`، اختيار سعر الكمية، قيود الحالة
- [ ] T040 [P] تحديث `public/sitemap.xml` ليشمل `/teachers`
- [ ] T041 مراجعة أمنية سريعة: لا يظهر `PdfUrl` في أي استجابة عامة، والصور لا تُظهر المسار الأصلي، ولا تخزين لعنوان IP خام
- [ ] T042 نفّذ `quickstart.md` كاملاً محلياً ثم على الإنتاج بعد النشر (ومنها توليد العينات داخل Docker)
- [ ] T043 فعّل `/speckit-constitution` لتثبيت قواعد المشروع (ترحيلات Postgres، صلاحيات الأدمن، RTL) كي تُطبَّق في الميزات القادمة

---

## Dependencies & Execution Order

- **Phase 1** ← بلا اعتماد؛ T003 يحدد مسار العينات (توليد أو رفع يدوي).
- **Phase 2** ← يعتمد على Phase 1، ويحجب كل القصص (T005–T008 بالتوازي → T009 → T010).
- **US1 و US2** (كلاهما P1) تبدآن بعد Phase 2؛ US2 يمكن البدء به بالتوازي مع US1 (ملفات مختلفة) لكن النموذج يُدمج في صفحة US1.
- **US3** يعتمد على Phase 2 وعلى T003 (قرار التوليد). يمكن تأجيله وإدخال المذكرات يدوياً في MVP.
- **US4** يعتمد على US2 (وجود الطلبات).
- **Polish** بعد القصص المطلوبة.

### Parallel Opportunities

- Phase 2: T005 T006 T007 T008 T011 T012 T013 T014 معاً.
- US1: T017 و T018 معاً؛ US2: T027 مع T023–T025 (واجهة مقابل خلفية).

## Implementation Strategy

### MVP First (US1 + US2)

1. أنجز Phase 1 و2، وفي T003 اتخذ قرار طريقة العينات.
2. أنجز US1 ثم US2 وأدخل أول 2–3 مذكرات يدوياً (قاعدة البيانات) مع صور عينات مُجهّزة يدوياً.
3. **توقّف وتحقق** (سيناريوهات 1 و2) وانشر للتجربة.

### Incremental Delivery

4. أضف US3 لتستغني عن الإدخال اليدوي، ثم US4 لمتابعة الطلبات، ثم Polish.

## Notes

- كل مهمة تنتهي بعمل commit صغير؛ تُنشر بعد كل مرحلة بنفس إجراء النشر الحالي (Docker على السيرفر).
- ترحيلات Postgres: أي عمود جديد بنوع صريح (تجنباً لمشاكل SQLite→Postgres التي ظهرت سابقاً).
