# Davlat Tashkilotlariga Murojaat Botlari Uchun Texnik Zadacha (yangilangan)

## 1. Loyihaning umumiy tavsifi
Telegram (yoki o'xshash messenjer) uchun murojaat bot: fuqarolarning murojaatlarini davlat tashkilotlari, mahalliy idoralar va mahalla uchastkavoylariga tez, qulay, shaffof yetkazish, kuzatish va monitoring qilish. Backend asosiy texnologiya: Node.js/TypeScript yoki Python (Express/NestJS yoki FastAPI), SQL baza (PostgreSQL/MySQL).

## 2. Til va yozuv talablari
- Yozuv: O'zbek (Lotin), O'zbek (Kirill).
- Til tanlash /start da yoki Til sozlamalari menyusida; tanlov profilga saqlanadi.
- Matnlar uchun markazlashtirilgan i18n (Lotin/Kirill), fallback qoidasi (standart Lotin).
- Emoji/diakritika va uzunlik cheklovlari aniq belgilanadi.

## 3. Asosiy funksional talablari
1) Ro'yxatdan o'tish va profil:
   - Telefon raqami majburiy: Telegram contact share orqali olish; raqam format validatsiyasi; optik ko'rsatma va rad etish oqimi.
   - Manzil/geo: viloyat/tuman/mahalla tanlash menyusi yoki geo-pin; ko'cha nomi ixtiyoriy; aniqlanmagan bo'lsa qo'lda kiritish.
   - Profil maydonlari: ism-familiya (ixtiyoriy), telefon (majburiy), manzil (viloyat/tuman/mahalla), ko'cha (ixtiyoriy), yosh (ixtiyoriy, diapazon validatsiyasi), til/yozuv.
   - Profilni ko'rish/yangilash/o'chirish oqimlari; ma'lumotlardan keyingi murojaatlarda avtomatik foydalanish.
2) Interaktiv menyu:
   - Tashkilot tanlash: tuman tibbiyot, elektr tarmoqlari, hokimlik, IIB (uchastka), mahalla sektorlari, boshqalar (konfiguratsiyalanadi).
   - Murojaat turi: shikoyat, taklif, ma'lumot so'rash, avariya/xavfli holat, boshqa (erkin matn).
   - Murojaat matni: erkin matn; qo'shimcha ma'lumot so'roqlari (manzil, vaqt, geo, rasm/fayl).
3) AI/NLP yordamchi:
   - "Boshqa" tanlanganda yoki noto'g'ri toifa bo'lsa, AI tashkilot va tur bo'yicha tavsiya/auto-tanlash.
   - FAQ uchun avtomatik javob (kesh va yangilanish davri belgilanishi kerak).
   - AI ishlamasa/failover: default toifaga o'tkazish yoki foydalanuvchidan qayta aniqlashtirish.
4) Murojaatni ro'yxatga olish:
   - Unikal ID (UUID yoki raqamli format), foydalanuvchi identi, kontaktlar, tashkilot, tur, matn, sana/vaqt, statuslar, attachmentlar, geo/manzil.
   - Statuslar va tranzitsiya qoidalari: yuborildi -> qabul qilindi -> ko'rib chiqilmoqda -> javob berildi/yopildi -> baholandi. Noto'g'ri/nagruzkaga tushgan holatlar uchun "rad etildi", "qo'shimcha ma'lumot kerak".
5) Yetkazish kanallari (config bilan):
   - Telegram DM/guruh, SMS/telefon gateway, email (ixtiyoriy), webhook.
   - Har tashkilot uchun yo'naltirish profili: qaysi kanal(lar), qaysi kontakt(lar), format/shablon.
6) Holatni kuzatish:
   - "Mening murojaatlarim" ro'yxati, status ko'rish.
   - Status yangilanishi admin/operator paneli yoki DB orqali; bot push xabarnoma yuboradi.
7) Nazorat va monitoring:
   - Maxsus nazorat guruhi/admin kanali: har bir murojaat nusxasi.
   - Web-based monitoring panel (keyinroq): statistika, taqsimot, o'rtacha ko'rib chiqish vaqti.
8) Mahalla uchastkavoylari integratsiyasi:
   - Foydalanuvchi profilidagi mahalla/geo asosida tegishli uchastkavoy kontaktiga avtomatik forward.
   - Uchastkavoylar alohida yo'naltirish profili (Telegram/guruh/telefon), limit va formatlari.
   - Agar geo aniqlanmasa, foydalanuvchiga mahalla tanlash menyusi yoki qo'lda kiritish.
9) Mahalla bo'limiga murojaat oqimi (profilni qayta ishlatish):
   - Tashkilot yoki tur mahalla bilan bog'liq bo'lsa, bot foydalanuvchining saqlangan mahallasini ko'rsatadi: "O'zingizning mahallangizga murojaat qilasizmi?"
   - Foydalanuvchi "ha" desa, profil manzili ishlatiladi; "yo'q" bo'lsa, boshqa mahalla tanlash menyusi chiqadi va yuborish shu mahallaga yo'naltiriladi.

## 4. Cheklovlar va qo'shimcha imkoniyatlar
- Matn uzunligi limiti (masalan 2000-4000 belgi, konfiguratsiya qilinadi).
- Attachmentlar: rasm/pdf/doc; maksimal hajm (masalan 10 MB) va soni (masalan 3 dona); saqlash strategiyasi (local yoki S3-compatible), vaqtinchalik URL.
- Kunlik/mavsumiy rate limit: foydalanuvchi uchun X ta murojaat/kun; anti-spam/captcha zarur holatda.
- Profil: ism-familiya, telefon, manzil (viloyat/tuman/mahalla), ko'cha, yosh saqlash; yangilash/o'chirish ssenariylari.
- Bildirishnomalar: qabul qilindi, status o'zgardi, javob berildi; til/yozuvga mos matnlar.
- Fikr-mulohaza: yakunda 1-5 reyting + izoh.

## 5. Xavfsizlik va maxfiylik
- TLS majburiy; token/env maxfiy saqlash.
- RBAC: rollar (admin, operator, nazoratchi, texnik), aniq ruxsatlar (ko'rish/tahrir/status o'zgartirish/eksport).
- Audit log: har bir status o'zgarishi va admin amali qayd etiladi.
- PII (telefon, manzil, yosh) tranzitda TLS, at-rest shifrlash (DB/TDE yoki ustun darajasida); backuplar shifrlanadi.
- Rate limiting va anti-spam (IP/user_id/bot session).
- Ma'lumotlarni saqlash muddati va o'chirish siyosati: foydalanuvchi profili va murojaatlari uchun retention qoidalari.
- Fayl xavfsizligi: fayl turlari filtri, virus skan (ixtiyoriy).
- Admin panelga 2FA/SAML/OAuth (agar kerak).

## 6. Infratuzilma va deployment
- Muhitlar: dev/stage/prod ajratilishi; alohida token/baza.
- Webhook vs polling: webhook tavsiya; polling fallback (rate limitlarga rioya).
- Queue: xabarnoma va yo'naltirishlar uchun navbat (masalan, Redis-based).
- Log/monitoring: strukturalangan loglar, Sentry/Prometheus/Grafana (yoki ekvivalenti); alerting.
- Backup/restore va migratsiya rejasi; versiyalanadigan konfiguratsiya (tashkilot/marshrutlar).
- CI/CD: testlar, lint, migratsiyalarni avtomatik qo'llash.

## 7. Ma'lumotlar modeli (minimal)
- Users: id, telegram_id, ism, telefon, yosh, til/yozuv, manzil (viloyat/tuman/mahalla), ko'cha, geo point/aniqlik flag, rate limit statistikasi.
- Organizations: id, nom, tur, kontaktlar, kanallar, geo/mahalla mapping, uchastkavoy flag.
- AppealTypes: umumiy va tashkilotga xos turlar.
- Appeals: id, user_id, org_id, type_id, matn, status, timestamps, ai_tavsiyasi, geo/manzil (foydalanuvchi tanlovi yoki profil ma'lumotidan olingan), mahalla override flag.
- Attachments: appeal_id, url/path, tur, hajm, checksum.
- StatusHistory/Audit: appeal_id, eski_yangi_status, kim o'zgartirdi, vaqt.
- FAQ/KB: savol-javoblar, til/yozuv, yangilanish va kesh.

## 8. Integratsiyalar va formatlar
- Telegram: keyboard/inline, rasm/fayl qabul; forwarding shabloni (ID, org, tur, matn, kontakt, geo/mahalla, status URL).
- SMS/telefon gateway: protokol/API, throttling, eskalatsiya ssenariylari.
- Email (ixtiyoriy): SMTP/API, shablonlar.
- Geo/mahalla mapping: simple catalog (viloyat/tuman/mahalla -> uchastkavoy kontakt) yoki tashqi servis (agar mavjud).

## 9. Test va sifat talablari
- Unit test: menyu oqimlari, status tranzitsiyalari, rate limit, i18n fallback, profil yaratish/yangilash, telefon validatsiyasi.
- Integration test: Telegram webhook/polling, DB tranzaksiyalari, AI fallback, mahalla mapping.
- E2E: til almashtirish, "Boshqa" + AI tavsiyasi, attachment limiti, geo asosida uchastkavoyga yuborish, "o'zingizning mahallangizmi yoki boshqa" oqimi.
- AI sifat mezonlari: baseline dataset, precision/recall, monitoring; qo'lda tasdiqlash jarayoni; model yangilanishi uchun rollout rejasi.
- Performance: asosiy so'rovlar uchun javob vaqti (masalan <2s), parallel yuborishlarda navbatga qo'yish.

## 10. SLA va operatsion masalalar
- Kutilyotgan javob berish vaqti (yuborishdan tashkilotga yetkazish vaqti, status yangilanishi).
- Ishlamaslik holatida foydalanuvchini xabardor qilish (servis bandligi xabari).
- Texnik xizmat oynalari va audit uchun log saqlash muddati.

## 11. Foydalanuvchi oqimi (qisqacha)
1. /start -> til/yozuv tanlash (Lotin/Kirill).
2. Telefon raqamini ulashish (majburiy) va profil yaratish: viloyat/tuman/mahalla tanlash yoki geo-pin; ko'cha va yoshni kiritish (ixtiyoriy).
3. "Murojaat yuborish" -> tashkilot yoki "Aniq emas/Boshqa". Mahalla bilan bog'liq bo'lsa: "O'zingizning mahallangizga murojaat qilasizmi?" -> ha/yo'q (boshqa mahalla tanlash).
4. Murojaat turi (shikoyat/taklif/ma'lumot/avariya/boshqa).
5. Murojaat matni + qo'shimcha ma'lumot so'roqlari (manzil/geo/vaqt/attachment). Zarur hollarda profil manzilidan avtomatik to'ldirish, foydalanuvchi tasdiqlashi bilan.
6. AI tavsiyasi (agar kerak) -> foydalanuvchi tasdiqlaydi yoki bot avtomatik tanlaydi (config).
7. Ro'yxatga olish, ID yuborish, tanlangan kanallarga yetkazish (jumladan mahalla uchastkavoy, agar mos kelsa).
8. "Mening murojaatlarim" orqali status kuzatish; status push xabarnomalari.
9. Yakunda baholash (1-5) va izoh.

## 12. Status tranzitsiyasi (matnli diagramma)
- Asosiy oqim: yuborildi -> qabul qilindi -> ko'rib chiqilmoqda -> javob berildi/yopildi -> baholandi.
- Muqobil holatlar: yuborildi -> rad etildi; yuborildi/qabul qilindi -> qo'shimcha ma'lumot kerak -> (foydalanuvchi javobi) -> ko'rib chiqilmoqda.
- Qoidalar: "yuborildi" ni tizim yaratadi; "qabul qilindi" va undan keyingi statuslarni faqat tegishli tashkilot operatori yoki admin o'zgartiradi; "baholandi" ga faqat foydalanuvchi o'tkazadi (reyting yuborganida); auditga har o'zgarish yoziladi.

## 13. RBAC (minimal matritsa)
- Admin: hamma narsani ko'rish/tahrir, status o'zgartirish, konfiguratsiya (tashkilot/mahalla/kanal), foydalanuvchi boshqaruvi, eksport, audit ko'rish, monitoring.
- Operator (tashkilot/mahalla/uchastkavoy): o'z tashkilotiga tegishli murojaatlarni ko'rish, status o'zgartirish, izoh qo'shish, javob yuborish, auditni ko'rish (faqat o'zlari bo'yicha), eksport (ixtiyoriy).
- Nazoratchi: hamma murojaatlarni ko'rish, statistikani ko'rish, auditni ko'rish, statusni o'zgartirmaydi.
- Texnik: monitoring/loglarni ko'rish, deploy/konfiguratsiya (CI/CD), foydalanuvchi ma'lumotlariga kirish cheklangan (faqat zaruriy diagnostika).
- Bot foydalanuvchisi: faqat o'z murojaatlari va profili ustidan amallar.

## 14. Mahalla katalogi va mapping formati
- Ma'lumotlar bazasi jadvali: region_code, district_code, mahalla_code, nomi, sector_id (agar mavjud), uchastkavoy_contact_id, uchastkavoy_telegram, uchastkavoy_phone, geo_polygon/point (ixtiyoriy), status (aktiv/nonaktiv), updated_at.
- JSON/CSV konfiguratsiya namunasi (import uchun): { "region": "Toshkent", "district": "Mirzo Ulug'bek", "mahalla": "X", "sector_id": "S-01", "tg": "@inspektor", "phone": "+99890xxxxxxx" }.
- Foydalanish: foydalanuvchi tanlagan yoki profilidagi mahalla code asosida tegishli uchastkavoy kontaktini topish; topilmasa fallback - umumiy mahalla sektori kanali.

## 15. Validatsiya qoidalari (telefon/yosh/manzil)
- Telefon: E.164 formatga normalizatsiya (+998XXXXXXXXX); 12 belgi ("+" bilan). "998" yoki "0" bilan kiritilsa ham qabul qilinadi, lekin saqlashda +998 formatida. Telegram contact share majburiy, lekin texnik sabablarga ko'ra bo'lmasa, qo'lda kiritishda ikki bosqichli tasdiq (raqamni qayta ko'rsatish va "tasdiqlash" tugmasi).
- Yosh: sonli, masalan 16-100 oralig'i; tashqi cheklovlar kerak bo'lsa konfiguratsiya qilinadi. Diapazondan tashqarida bo'lsa, xato va qayta kiritish.
- Manzil: viloyat/tuman/mahalla majburiy, ko'cha ixtiyoriy; geo-pin bo'lsa, mahalla mappingga urinish, muvaffaqiyatsiz bo'lsa foydalanuvchidan tanlash talab qilinadi. Profil va murojaat vaqtida kiritilgan manzil mos kelmasa, foydalanuvchidan tasdiq/yangilash so'raladi.

---
