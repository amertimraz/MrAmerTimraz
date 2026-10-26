# Data Model: قسم المدرسين

## تعديل: Booklet (موجود)

| حقل | نوع | ملاحظة |
|-----|-----|--------|
| `TeacherShowcase` | bool (default false) | يظهر في صفحة المدرسين فقط عند true **وقيمة `IsPublished` true** |
| `TeacherSummary` | string? (≤ 1000) | وصف مختصر موجّه للمدرس (مميزات، محتوى) |
| `TeacherPrice` | decimal? (موجود) | سعر المدرس الأساسي؛ null ⇒ «اسأل عن السعر» |

`GradeLevel` و`Subject` و`Term` و`PageCount` و`CoverImageUrl` موجودة وتُستعمل كما هي. `PdfUrl` لا يُسلَّم أبداً في استجابات هذا القسم.

## جديد: BookletQuantityOffer

| حقل | نوع | قاعدة |
|-----|-----|-------|
| `Id` | int PK | |
| `BookletId` | int FK → Booklet (cascade) | |
| `MinQuantity` | int | ≥ 2 |
| `UnitPrice` | decimal | > 0 وأقل من سعر الوحدة الأساسي |
| فهرس فريد | (BookletId, MinQuantity) | لا تكرار للحد الأدنى |

**قاعدة الحساب**: سعر الوحدة للكمية q = `UnitPrice` لأكبر `MinQuantity ≤ q`، وإلا `TeacherPrice`.

## جديد: BookletSamplePage

| حقل | نوع | قاعدة |
|-----|-----|-------|
| `Id` | int PK | |
| `BookletId` | int FK (cascade) | |
| `PageNumber` | int | رقم الصفحة في الملف الأصلي |
| `ImageUrl` | string | مسار الصورة بعلامة مائية |
| `SortOrder` | int | ترتيب العرض |
| `CreatedAt` | timestamp | |
| حد أقصى | 8 صفحات لكل مذكرة | |

## جديد: TeacherInquiry

| حقل | نوع | قاعدة |
|-----|-----|-------|
| `Id` | int PK | |
| `BookletId` | int? FK (SetNull) | اختياري لطلب عام |
| `Name` | string (2–100) | مطلوب |
| `Phone` | string (11) | يُوحَّد إلى `01XXXXXXXXX` بعد تحويل الأرقام العربية؛ مطلوب |
| `Governorate` | string (≤ 50) | من قائمة المحافظات |
| `GradeLevel` | string? (≤ 50) | |
| `Subject` | string? (≤ 100) | |
| `Quantity` | int | 1–5000 |
| `Notes` | string? (≤ 1000) | |
| `Status` | enum | `New`, `Contacted`, `Sold`, `Cancelled` (افتراضي New) |
| `AdminNote` | string? (≤ 1000) | |
| `IpHash` | string? | تجزئة IP لكشف التكرار دون تخزين العنوان |
| `CreatedAt` / `UpdatedAt` | timestamp | |

**انتقالات الحالة**: New → Contacted → Sold | Cancelled (ويُسمح بالرجوع للمشرف).

**ملاحظة ترحيل**: كل الأعمدة بأنواع Postgres صريحة (`boolean`, `numeric`, `timestamp without time zone`) ونمط identity، حسب تجربة ترحيلات المشروع السابقة.
