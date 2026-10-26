# Contracts: Teachers API

كل المسارات تحت `/api`. الاستجابات JSON. العام = `AllowAnonymous`؛ الإدارة = `Authorize(Roles = "Admin")`.

## عام

### `GET /teacher-booklets`
قائمة المذكرات المعروضة للمدرسين (`TeacherShowcase && IsPublished`)، يمكن تصفيتها: `?grade=Prim4`.
```json
{ "items": [
  { "id": 12, "title": "مذكرة...", "gradeLevel": "Prim4", "subject": "...", "term": "الترم الأول",
    "pageCount": 80, "coverImageUrl": "/uploads/...", "teacherPrice": 45.0,
    "minOfferPrice": 35.0, "hasSamples": true }
] }
```
لا يحوي `pdfUrl` أبداً.

### `GET /teacher-booklets/{id}`
```json
{ "id": 12, "title": "...", "teacherSummary": "...", "description": "...",
  "gradeLevel": "Prim4", "subject": "...", "term": "...", "pageCount": 80,
  "coverImageUrl": "...", "teacherPrice": 45.0,
  "quantityOffers": [ { "minQuantity": 10, "unitPrice": 40.0 }, { "minQuantity": 50, "unitPrice": 35.0 } ],
  "samples": [ { "id": 1, "imageUrl": "/uploads/samples/12/1.webp", "sortOrder": 1 } ] }
```
404 إذا غير منشورة أو غير معروضة للمدرسين.

### `POST /teacher-inquiries`  (rate limit: `inquiries`)
```json
{ "bookletId": 12, "name": "أحمد", "phone": "01012345678", "governorate": "القاهرة",
  "gradeLevel": "Prim4", "subject": "تكنولوجيا المعلومات", "quantity": 20, "notes": "", "website": "" }
```
- `website` حقل مصيدة: إن لم يكن فارغاً يُرجَع 200 دون حفظ.
- **201** `{ "id": 5, "whatsAppUrl": "https://wa.me/..." }`
- **400** `{ "errors": { "phone": "رقم الهاتف غير صالح" } }`
- **429** عند تجاوز الحد.

### `POST /visits/teachers` و`GET /visits/teachers`
نفس عقد `VisitsController` الحالي بعد إضافة `teachers` للصفحات المسموحة.

## إدارة

| الطريقة | المسار | الوظيفة |
|---------|--------|---------|
| GET | `/admin/teacher-booklets` | كل المذكرات مع حالة العرض |
| PUT | `/admin/teacher-booklets/{id}` | تعديل `TeacherShowcase`, `TeacherSummary`, `TeacherPrice` |
| PUT | `/admin/teacher-booklets/{id}/offers` | استبدال عروض الكميات (قائمة) |
| POST | `/admin/teacher-booklets/{id}/samples/generate` | body: `{ "pages": [1,2,5] }` يولّد صور العينات من PDF المذكرة |
| POST | `/admin/teacher-booklets/{id}/samples/upload` | رفع صور عينات يدوياً (بديل) |
| DELETE | `/admin/teacher-booklets/{id}/samples/{sampleId}` | حذف عينة |
| PUT | `/admin/teacher-booklets/{id}/samples/order` | `{ "ids": [3,1,2] }` |
| GET | `/admin/teacher-inquiries` | `?status=&governorate=&bookletId=&page=` |
| PUT | `/admin/teacher-inquiries/{id}` | `{ "status": "Contacted", "adminNote": "..." }` |

أخطاء الإدارة: 401/403 لغير المشرف، 400 للتحقق، 404 لغير الموجود، 422 عند فشل توليد العينات (رسالة عربية واضحة).
