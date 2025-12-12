require('dotenv').config();
const { Telegraf, Markup, session } = require('telegraf');
const { nanoid } = require('nanoid');
const { t } = require('./strings');
const storage = require('./storage');

// Load static config
const organizations = require('../config/organizations.json');
const appealTypes = require('../config/appealTypes.json');
const locations = require('../config/locations.json');
const faqItems = require('../config/faq.json');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const LOG_CHAT_ID = process.env.LOG_CHAT_ID;
const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'uz';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is required in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(
  session({
    defaultSession: () => ({}),
  })
);

function normalizePhone(phone) {
  if (!phone) return null;
  let cleaned = phone.replace(/\s+/g, '');
  cleaned = cleaned.replace(/^00/, '+');
  if (!cleaned.startsWith('+') && cleaned.startsWith('998')) cleaned = `+${cleaned}`;
  if (!cleaned.startsWith('+') && cleaned.startsWith('8')) cleaned = `+998${cleaned.slice(1)}`;
  if (!cleaned.startsWith('+') && cleaned.startsWith('9')) cleaned = `+${cleaned}`;
  if (cleaned.startsWith('998') && cleaned.length === 12) cleaned = `+${cleaned}`;
  if (!/^\+\d{11,15}$/.test(cleaned)) return null;
  return cleaned;
}

function getLang(ctx) {
  if (ctx.session && ctx.session.lang) return ctx.session.lang;
  const saved = storage.getUser(ctx.from.id);
  if (saved && saved.language) return saved.language;
  return DEFAULT_LANGUAGE;
}

function setLang(ctx, lang) {
  ctx.session.lang = lang;
  const user = storage.getUser(ctx.from.id);
  if (user) storage.saveUser({ ...user, language: lang });
}

function findMahalla(mahallaId) {
  return locations.mahallas.find((m) => m.id === mahallaId);
}

function nameByLang(obj, lang) {
  if (!obj || !obj.name) return '';
  return obj.name[lang] || obj.name.uz || '';
}

function typeLabel(typeId, lang) {
  const found = appealTypes.find((t) => t.id === typeId);
  if (!found) return typeId;
  return found.label[lang] || found.label.uz;
}

function orgLabel(orgId, lang) {
  const org = organizations.find((o) => o.id === orgId);
  if (!org) return orgId;
  return nameByLang(org, lang);
}

function summaryAddress(lang, payload) {
  if (!payload || !payload.mahallaId) return payload.street || '';
  const mahalla = findMahalla(payload.mahallaId);
  const parts = [];
  if (mahalla) parts.push(nameByLang(mahalla, lang));
  if (payload.street) parts.push(payload.street);
  return parts.join(', ');
}

function logTo(chatId, text) {
  if (!chatId || chatId === '0') return;
  bot.telegram.sendMessage(chatId, text).catch(() => {});
}

function resolveForwardChats(org) {
  if (!org) return [];
  const envVar = org.envVar;
  const envVal = envVar ? process.env[envVar] : null;
  const list = [];
  if (envVal) {
    envVal
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((id) => list.push(id));
  } else if (org.forwardChatId) {
    list.push(org.forwardChatId);
  }
  if (!list.length && ADMIN_CHAT_ID && ADMIN_CHAT_ID !== '0') {
    list.push(ADMIN_CHAT_ID);
  }
  return list.filter(Boolean);
}

function askLanguage(ctx) {
  ctx.session.flow = null;
  ctx.session.step = null;
  const lang = getLang(ctx);
  return ctx.reply(
    t(lang, 'choose_language'),
    Markup.inlineKeyboard([
      [Markup.button.callback('O‘zbek (Lotin)', 'lang|uz')],
      [Markup.button.callback("Узбек (Кирил)", 'lang|uz_cyrl')],
    ])
  );
}

function startProfile(ctx) {
  const lang = getLang(ctx);
  ctx.session.flow = 'profile';
  ctx.session.step = 'ask_contact';
  ctx.session.profileDraft = {};
  return ctx.reply(
    t(lang, 'share_contact'),
    Markup.keyboard([[Markup.button.contactRequest(t(lang, 'share_contact_button'))]])
      .oneTime()
      .resize()
  );
}

function promptMahalla(ctx, mode) {
  const lang = getLang(ctx);
  const rows = locations.mahallas.map((m) => [Markup.button.callback(nameByLang(m, lang), `mahalla|${mode}|${m.id}`)]);
  return ctx.reply(t(lang, 'ask_mahalla'), Markup.inlineKeyboard(rows));
}

function askStreet(ctx) {
  const lang = getLang(ctx);
  ctx.session.step = 'ask_street';
  return ctx.reply(
    t(lang, 'ask_street'),
    Markup.keyboard([[t(lang, 'skip')]]).oneTime().resize()
  );
}

function askAge(ctx) {
  const lang = getLang(ctx);
  ctx.session.step = 'ask_age';
  return ctx.reply(
    t(lang, 'ask_age'),
    Markup.keyboard([[t(lang, 'skip')]]).oneTime().resize()
  );
}

function finishProfile(ctx) {
  const lang = getLang(ctx);
  const draft = ctx.session.profileDraft;
  const user = storage.saveUser({
    telegramId: ctx.from.id,
    username: ctx.from.username,
    firstName: ctx.from.first_name,
    language: lang,
    phone: draft.phone,
    mahallaId: draft.mahallaId,
    street: draft.street || null,
    age: draft.age || null,
    updatedAt: Date.now(),
  });
  ctx.session.flow = null;
  ctx.session.step = null;
  ctx.session.profileDraft = null;
  ctx.reply(t(lang, 'profile_saved'), Markup.removeKeyboard());
  // Immediately offer to submit an appeal
  return startAppeal(ctx);
}

function ensureProfile(ctx) {
  const user = storage.getUser(ctx.from.id);
  if (!user || !user.phone || !user.mahallaId) {
    return false;
  }
  return true;
}

function startAppeal(ctx) {
  const lang = getLang(ctx);
  if (!ensureProfile(ctx)) {
    ctx.reply(t(lang, 'please_finish_profile'));
    return startProfile(ctx);
  }
  ctx.session.flow = 'appeal';
  ctx.session.appealDraft = {};
  ctx.session.step = 'choose_org';
  const rows = organizations.map((o) => [Markup.button.callback(orgLabel(o.id, lang), `org|${o.id}`)]);
  return ctx.reply(t(lang, 'choose_org'), Markup.inlineKeyboard(rows));
}

function askUseProfileMahalla(ctx) {
  const lang = getLang(ctx);
  ctx.session.step = 'ask_use_profile_mahalla';
  return ctx.reply(
    t(lang, 'use_profile_mahalla'),
    Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'use_profile_yes'), 'mahalla_use|yes')],
      [Markup.button.callback(t(lang, 'use_profile_no'), 'mahalla_use|no')],
    ])
  );
}

function showMainMenu(ctx) {
  const lang = getLang(ctx);
  return ctx.reply(
    t(lang, 'main_menu'),
    Markup.inlineKeyboard([
      [Markup.button.callback(t(lang, 'menu_new'), 'menu|new')],
      [Markup.button.callback(t(lang, 'menu_my'), 'menu|my')],
      [Markup.button.callback(t(lang, 'menu_profile'), 'menu|profile')],
      [Markup.button.callback(t(lang, 'menu_faq'), 'menu|faq')],
    ])
  );
}

function showMyAppeals(ctx) {
  const lang = getLang(ctx);
  const appeals = storage.listAppealsByUser(ctx.from.id);
  if (!appeals.length) return ctx.reply(t(lang, 'no_appeals'));
  const lines = appeals.slice(0, 10).map((a) => {
    return `${a.id} | ${orgLabel(a.orgId, lang)} | ${typeLabel(a.typeId, lang)} | ${a.status}`;
  });
  return ctx.reply([t(lang, 'my_appeals_header'), ...lines].join('\n'));
}

function showFaq(ctx) {
  const lang = getLang(ctx);
  if (!faqItems || !faqItems.length) return ctx.reply(t(lang, 'faq_empty'));
  const lines = [t(lang, 'faq_header')];
  faqItems.forEach((item, idx) => {
    const q = (item.q && (item.q[lang] || item.q.uz)) || '';
    const a = (item.a && (item.a[lang] || item.a.uz)) || '';
    lines.push(`${idx + 1}. ${q}\n${a}`);
  });
  return ctx.reply(lines.join('\n\n'));
}

function askAppealType(ctx, orgId) {
  const lang = getLang(ctx);
  const org = organizations.find((o) => o.id === orgId);
  const typeRows = (org?.typeIds || appealTypes.map((a) => a.id)).map((typeId) => {
    const label = typeLabel(typeId, lang);
    return [Markup.button.callback(label, `atype|${typeId}`)];
  });
  ctx.session.step = 'choose_type';
  return ctx.reply(t(lang, 'choose_type'), Markup.inlineKeyboard(typeRows));
}

function askAppealText(ctx) {
  const lang = getLang(ctx);
  ctx.session.step = 'ask_text';
  return ctx.reply(t(lang, 'ask_text'), Markup.removeKeyboard());
}

function finalizeAppeal(ctx, text) {
  const lang = getLang(ctx);
  const draft = ctx.session.appealDraft || {};
  const user = storage.getUser(ctx.from.id);
  const id = `APL-${nanoid(6)}`;
  const appeal = {
    id,
    telegramId: ctx.from.id,
    orgId: draft.orgId,
    typeId: draft.typeId,
    text,
    status: 'submitted',
    createdAt: Date.now(),
    mahallaId: draft.mahallaId || user.mahallaId,
    street: draft.street || user.street || null,
  };
  storage.addAppeal(appeal);
  ctx.session.flow = null;
  ctx.session.step = null;
  ctx.session.appealDraft = null;

  const org = organizations.find((o) => o.id === appeal.orgId);
  const forwardChats = resolveForwardChats(org);
  const addressText = summaryAddress(lang, appeal);
  const orgName = orgLabel(appeal.orgId, lang);
  const typeName = typeLabel(appeal.typeId, lang);
  const msg = [
    `#${appeal.id}`,
    `Tashkilot: ${orgName}`,
    `Tur: ${typeName}`,
    `Foydalanuvchi: ${user.firstName || ''} @${user.username || ''}`,
    `Tel: ${user.phone || '-'}`,
    addressText ? `Manzil: ${addressText}` : null,
    `Matn: ${appeal.text}`,
  ]
    .filter(Boolean)
    .join('\n');

  const sentSet = new Set();
  forwardChats.forEach((chatId) => {
    sentSet.add(chatId);
    bot.telegram.sendMessage(chatId, msg).catch((err) => {
      console.error('Forward error', err);
      logTo(LOG_CHAT_ID, `Forward xato: ${err.message}`);
    });
  });
  if (LOG_CHAT_ID && LOG_CHAT_ID !== '0' && !sentSet.has(LOG_CHAT_ID)) {
    bot.telegram.sendMessage(LOG_CHAT_ID, msg).catch(() => {});
  }
  ctx.reply(t(lang, 'appeal_saved', { id }));
  return showMainMenu(ctx);
}

bot.start(async (ctx) => {
  const lang = getLang(ctx);
  await ctx.reply(t(lang, 'welcome'));
  return askLanguage(ctx);
});

bot.command('profile', (ctx) => startProfile(ctx));
bot.command('appeal', (ctx) => startAppeal(ctx));
bot.command('my', (ctx) => showMyAppeals(ctx));
bot.command('menu', (ctx) => showMainMenu(ctx));
bot.command('faq', (ctx) => showFaq(ctx));

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data || '';
  const parts = data.split('|');
  const kind = parts[0];
  const lang = getLang(ctx);

  if (kind === 'lang') {
    const langCode = parts[1];
    setLang(ctx, langCode);
    await ctx.answerCbQuery('OK');
    await ctx.reply(t(langCode, 'thanks'));
    return startProfile(ctx);
  }

  if (kind === 'region') {
    await ctx.answerCbQuery('OK');
    return ctx.answerCbQuery('OK');
  }

  if (kind === 'district') {
    await ctx.answerCbQuery('OK');
    return ctx.answerCbQuery('OK');
  }

  if (kind === 'mahalla') {
    const mode = parts[1];
    const mahallaId = parts[2];
    if (mode === 'profile') {
      ctx.session.profileDraft = ctx.session.profileDraft || {};
      ctx.session.profileDraft.mahallaId = mahallaId;
      await ctx.answerCbQuery('OK');
      return askStreet(ctx);
    } else if (mode === 'appeal') {
      ctx.session.appealDraft = ctx.session.appealDraft || {};
      ctx.session.appealDraft.mahallaId = mahallaId;
      await ctx.answerCbQuery('OK');
      return askAppealType(ctx, ctx.session.appealDraft.orgId);
    }
  }

  if (kind === 'org') {
    const orgId = parts[1];
    ctx.session.appealDraft = ctx.session.appealDraft || {};
    ctx.session.appealDraft.orgId = orgId;
    const org = organizations.find((o) => o.id === orgId);
    await ctx.answerCbQuery('OK');
    if (org && org.isMahallaAware) {
      return askUseProfileMahalla(ctx);
    }
    return askAppealType(ctx, orgId);
  }

  if (kind === 'mahalla_use') {
    const choice = parts[1];
    const user = storage.getUser(ctx.from.id);
    await ctx.answerCbQuery('OK');
    if (choice === 'yes' && user && user.mahallaId) {
      ctx.session.appealDraft = ctx.session.appealDraft || {};
      ctx.session.appealDraft.mahallaId = user.mahallaId;
      return askAppealType(ctx, ctx.session.appealDraft.orgId);
    }
    ctx.session.step = 'choose_mahalla_appeal';
    return promptMahalla(ctx, 'appeal');
  }

  if (kind === 'atype') {
    const typeId = parts[1];
    ctx.session.appealDraft = ctx.session.appealDraft || {};
    ctx.session.appealDraft.typeId = typeId;
    await ctx.answerCbQuery('OK');
    return askAppealText(ctx);
  }

  if (kind === 'menu') {
    const action = parts[1];
    await ctx.answerCbQuery('OK');
    if (action === 'new') return startAppeal(ctx);
    if (action === 'my') return showMyAppeals(ctx);
    if (action === 'profile') return startProfile(ctx);
    if (action === 'faq') return showFaq(ctx);
  }

  return ctx.answerCbQuery('OK');
});

bot.on('contact', (ctx) => {
  if (ctx.session.flow !== 'profile' || ctx.session.step !== 'ask_contact') {
    return;
  }
  const lang = getLang(ctx);
  const phone = normalizePhone(ctx.message.contact.phone_number);
  if (!phone) {
    return ctx.reply(t(lang, 'invalid_number'));
  }
  ctx.session.profileDraft = ctx.session.profileDraft || {};
  ctx.session.profileDraft.phone = phone;
  ctx.reply(t(lang, 'contact_saved'));
  ctx.session.step = 'ask_mahalla';
  return promptMahalla(ctx, 'profile');
});

bot.on('text', (ctx) => {
  const lang = getLang(ctx);
  const text = ctx.message.text;

  if (ctx.session.flow === 'profile') {
    if (ctx.session.step === 'ask_street') {
      if (text === t(lang, 'skip')) {
        ctx.session.profileDraft.street = null;
        ctx.reply(t(lang, 'skipped'));
      } else {
        ctx.session.profileDraft.street = text;
      }
      return askAge(ctx);
    }
    if (ctx.session.step === 'ask_age') {
      if (text === t(lang, 'skip')) {
        ctx.session.profileDraft.age = null;
        ctx.reply(t(lang, 'skipped'), Markup.removeKeyboard());
        return finishProfile(ctx);
      }
      const ageNum = parseInt(text, 10);
      if (Number.isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
        return ctx.reply(t(lang, 'invalid_age'));
      }
      ctx.session.profileDraft.age = ageNum;
      ctx.reply(t(lang, 'thanks'), Markup.removeKeyboard());
      return finishProfile(ctx);
    }
  }

  if (ctx.session.flow === 'appeal' && ctx.session.step === 'ask_text') {
    const trimmed = text.trim();
    if (!trimmed.length) return;
    return finalizeAppeal(ctx, trimmed);
  }
});

bot.catch((err, ctx) => {
  console.error('Bot error', err);
  logTo(LOG_CHAT_ID, `Bot error: ${err.message}`);
  ctx.reply('Xatolik yuz berdi.').catch(() => {});
});

bot.launch().then(() => {
  console.log('Bot started');
  logTo(LOG_CHAT_ID, 'Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
