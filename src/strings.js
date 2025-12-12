const STRINGS = {
  uz: {
    welcome: "Assalomu alaykum! Davlat tashkilotlari va mahalla murojaatlari botiga xush kelibsiz.",
    choose_language: "Til/yozuvni tanlang:",
    share_contact: "Iltimos, telefon raqamingizni ulashing.",
    share_contact_button: "Telefon raqamni ulashish",
    contact_saved: "Raqam qabul qilindi.",
    ask_region: "Viloyatni tanlang:",
    ask_district: "Tuman (yoki shahar) ni tanlang:",
    ask_mahalla: "Mahallani tanlang:",
    ask_street: "Ko'cha nomi (ixtiyoriy). Matn yuboring yoki \"Otish\" tugmasini bosing.",
    ask_age: "Yoshingizni kiriting (ixtiyoriy, 16-100) yoki \"Otish\" bosing.",
    skipped: "O'tkazib yuborildi.",
    skip: "Otish",
    profile_saved: "Profil saqlandi. Endi murojaat yuborishingiz mumkin.",
    choose_org: "Qaysi tashkilotga murojaat yuborasiz?",
    choose_type: "Murojaat turini tanlang:",
    ask_text: "Murojaatingiz matnini yozing. Zarur bo'lsa, qo'shimcha ma'lumot (manzil/vaqt) ni ham kiriting.",
    appeal_saved: "Murojaat qabul qilindi. ID: {{id}}",
    my_appeals_header: "Sizning murojaatlaringiz:",
    no_appeals: "Hali murojaat yubormagansiz.",
    use_profile_mahalla: "Profilingizdagi mahallaga yuborilsinmi?",
    use_profile_yes: "Ha, shu mahallaga",
    use_profile_no: "Yo'q, boshqa mahalla",
    ask_region_other: "Yangi mahalla uchun viloyatni tanlang:",
    thanks: "Rahmat!",
    invalid_number: "Telefon raqami noto'g'ri formatda. Iltimos, qayta yuboring.",
    invalid_age: "Yosh 16-100 oralig'ida bo'lishi kerak.",
    please_finish_profile: "Avval profilni to'ldiring. /profile",
    cancel: "Bekor qilish",
    cancelled: "Bekor qilindi.",
    main_menu: "Bosh menyu:",
    menu_new: "Yangi murojaat",
    menu_my: "Mening murojaatlarim",
    menu_profile: "Profilni yangilash"
  },
  uz_cyrl: {
    welcome: "Ассалому алайкум! Давлат ташкилотлари ва маҳалла мурожаатлари ботига хуш келибсиз.",
    choose_language: "Тил/ёзувни танланг:",
    share_contact: "Илтимос, телефон рақамингизни улашинг.",
    share_contact_button: "Телефон рақамни улашиш",
    contact_saved: "Рақам қабул қилинди.",
    ask_region: "Вилоятни танланг:",
    ask_district: "Туман (ёки шаҳар) ни танланг:",
    ask_mahalla: "Маҳаллани танланг:",
    ask_street: "Кўча номи (ихтиёрий). Матн юборинг ёки \"Ўтиш\" тугмаси.",
    ask_age: "Ёшингизни киритинг (ихтиёрий, 16-100) ёки \"Ўтиш\" тугмаси.",
    skipped: "Ўтказиб юборилди.",
    skip: "Ўтиш",
    profile_saved: "Профил сақланди. Энди мурожаат юборишингиз мумкин.",
    choose_org: "Қайси ташкилотга мурожаат юборилади?",
    choose_type: "Мурожаат турини танланг:",
    ask_text: "Мурожаат матнини ёзинг. Зарур бўлса, қўшимча маълумот (манзил/вақт) ни ҳам киритинг.",
    appeal_saved: "Мурожаат қабул қилинди. ID: {{id}}",
    my_appeals_header: "Сизнинг мурожаатларингиз:",
    no_appeals: "Ҳали мурожаат юбормагансиз.",
    use_profile_mahalla: "Профилингиздаги маҳаллага юборилсинми?",
    use_profile_yes: "Ҳа, шу маҳалла",
    use_profile_no: "Йўқ, бошқа маҳалла",
    ask_region_other: "Янги маҳалла учун вилоятни танланг:",
    thanks: "Раҳмат!",
    invalid_number: "Телефон рақами нотўғри форматда. Илтимос, қайта юборинг.",
    invalid_age: "Ёш 16-100 оралиғида бўлиши керак.",
    please_finish_profile: "Аввал профильни тўлдиринг. /profile",
    cancel: "Бекор қилиш",
    cancelled: "Бекор қилинди.",
    main_menu: "Бош меню:",
    menu_new: "Янги мурожаат",
    menu_my: "Мени мурожаатларим",
    menu_profile: "Профилни янгилаш"
  },
};

function t(lang, key, vars = {}) {
  const locale = STRINGS[lang] ? lang : 'uz';
  const fallback = STRINGS['uz'];
  const raw = (STRINGS[locale] && STRINGS[locale][key]) || fallback[key] || key;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

module.exports = {
  t,
  STRINGS,
};
