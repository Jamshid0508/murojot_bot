# Status va RBAC jadvali

## Status tranzitsiyasi (jadval)
| From                   | To                         | Kim o'zgartiradi            | Shartlar/izoh |
|------------------------|----------------------------|-----------------------------|---------------|
| yuborildi              | qabul qilindi              | operator/admin              | Yangi murojaatni qabul qilishda. |
| qabul qilindi          | ko'rib chiqilmoqda         | operator/admin              | Ish boshlanganda. |
| ko'rib chiqilmoqda     | javob berildi/yopildi      | operator/admin              | Javob tayyor bo'lganda yoki ish yakunida. |
| javob berildi/yopildi  | baholandi                  | foydalanuvchi               | Reyting yuborilganda. |
| yuborildi              | rad etildi                 | operator/admin              | Noto'g'ri toifa, dublikat yoki nomaqbul kontent. |
| yuborildi/qabul qilindi| qo'shimcha ma'lumot kerak  | operator/admin              | Ma'lumot yetarli emas; foydalanuvchidan so'rov. |
| qo'shimcha ma'lumot kerak | ko'rib chiqilmoqda      | operator/admin              | Foydalanuvchi javobidan so'ng. |

**Qoidalar:**
- "yuborildi" ni tizim yaratadi; foydalanuvchi o'zgartirmaydi.
- "baholandi" ga faqat foydalanuvchi o'tkazadi (reyting). Foydalanuvchi reyting yubormasa, status javob berildi/yopildi da qoladi.
- Har o'zgarish auditga yoziladi (kim, qachon, eski->yangi).

## RBAC matritsa (jadval)
| Huquq / Rol                       | Admin | Operator (org/mahalla) | Nazoratchi | Texnik | Bot foydalanuvchisi |
|-----------------------------------|:-----:|:----------------------:|:----------:|:------:|:-------------------:|
| Murojaatlarni ko'rish (hamma)     |  X    |     faqat o'zlari      |     X      |  cheklangan  | faqat o'zi |
| Status o'zgartirish               |  X    |          X             |            |          |        |
| Izoh/javob yuborish               |  X    |          X             |            |          |        |
| Konfiguratsiya (tashkilot/kanal)  |  X    |                        |            |    X     |        |
| Mahalla katalogini boshqarish     |  X    |                        |            |    X     |        |
| Eksport (CSV/Excel)               |  X    |   ixtiyoriy ruxsat     |     X      |          |        |
| Audit log ko'rish                 |  X    |   faqat o'zlari        |     X      |    X     |        |
| Monitoring/metrics                |  X    |                        |     X      |    X     |        |
| Deploy/CI/CD                      |  X    |                        |            |    X     |        |
| Foydalanuvchi profil ma'lumoti    |  X    |   o'z tashkiloti doirasida |   ko'rish  | cheklangan | faqat o'zi |
| Murojaat yaratish                 |       |                        |            |          |    X   |

**Izohlar:**
- Operator faqat o'ziga biriktirilgan tashkilot/mahalla appeal-larini ko'radi va boshqaradi.
- Nazoratchi statusni o'zgartirmaydi, lekin barcha appeal va auditni ko'radi.
- Texnik konfiguratsiya va monitoringga kiradi, ammo foydalanuvchi PII ga minimal kirish; diagnostika uchun cheklangan ruxsat.
- Bot foydalanuvchisi faqat o'z appeal va profilini ko'radi/yaratadi/yangilaydi.
