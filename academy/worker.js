/**
 * أكاديمية المستقبل للتدريب المهني — يطا، فلسطين
 * Cloudflare Worker: واجهات التسجيل وحجز الاستشارات والدفع عبر PayPal.
 * صفحات الموقع تُخدم من مجلد public عبر ربط ASSETS.
 *
 * المتغيرات السرية (اختيارية — الموقع يعمل بدونها في وضع تجريبي):
 *   PAYPAL_CLIENT_ID     معرّف تطبيق PayPal (REST App)
 *   PAYPAL_SECRET        المفتاح السري لتطبيق PayPal
 *   PAYPAL_ENV           sandbox (افتراضي) أو live
 *   PAYPAL_WEBHOOK_ID    معرّف الويب هوك للتحقق من الإشعارات (اختياري)
 *   NOTIFY_WEBHOOK_URL   رابط اختياري تُرسل إليه بيانات كل طلب جديد
 *   USD_RATE             سعر تحويل الشيكل للدولار (يتجاوز القيمة في courses.json)
 *   BANK_*               بيانات الحساب البنكي (تتجاوز القيم في courses.json)
 * الربط الاختياري: BOOKINGS (KV Namespace) لتخزين الطلبات.
 */

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

const PAYMENT_MODES = ['full', 'deposit', 'cash'];
const PAY_METHODS = ['paypal', 'bank', 'cash'];
const MAX_SEATS = 5;
const GROUP_DISCOUNT_MIN_SEATS = 3;
const GROUP_DISCOUNT_RATE = 0.10;
const RECORD_TTL = 60 * 60 * 24 * 365;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const fail = (message, status = 400) => json({ ok: false, error: message }, status);

const clean = (value, max = 200) => String(value == null ? '' : value).trim().slice(0, max);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => /^[+0-9\s()-]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8;
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);

function isFutureDate(value) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return new Date(value + 'T00:00:00Z') > today;
}

function reference(prefix) {
  const d = new Date();
  const stamp = String(d.getUTCFullYear()).slice(2)
    + String(d.getUTCMonth() + 1).padStart(2, '0')
    + String(d.getUTCDate()).padStart(2, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(36).toUpperCase().padStart(2, '0')).join('').slice(0, 4);
  return `${prefix}-${stamp}-${rand}`;
}

/* ---------------------------------------------------------------
   كتالوج الدورات والاستشارات — مصدر واحد للأسعار (لا يُوثق بالمتصفح)
   --------------------------------------------------------------- */
async function loadCatalog(request, env) {
  if (!env.ASSETS) throw new Error('ASSETS binding is not configured.');
  const url = new URL('/data/courses.json', request.url);
  const res = await env.ASSETS.fetch(new Request(url.toString(), { headers: { accept: 'application/json' } }));
  if (!res.ok) throw new Error('تعذّر تحميل كتالوج الدورات.');
  return res.json();
}

function bankDetails(env, meta) {
  const base = (meta && meta.bank) || {};
  return {
    name: env.BANK_NAME || base.name || '',
    accountName: env.BANK_ACCOUNT_NAME || base.accountName || '',
    accountNo: env.BANK_ACCOUNT_NO || base.accountNo || '',
    iban: env.BANK_IBAN || base.iban || '',
    swift: env.BANK_SWIFT || base.swift || '',
    currencies: env.BANK_CURRENCIES || base.currencies || ''
  };
}

const usdRate = (env, meta) => Number(env.USD_RATE) || Number((meta || {}).usdRate) || 3.7;

/** تحويل مبلغ الشيكل إلى دولار بخانتين عشريتين (PayPal لا يدعم ILS). */
const toUsd = (ils, rate) => (Math.round((Number(ils) || 0) / rate * 100) / 100).toFixed(2);

/** حساب رسوم الدورة في الخادم — لا يُعتمد على أي مبلغ قادم من المتصفح. */
function quote(course, seats, payment, meta) {
  const subtotal = course.price * seats;
  const discount = seats >= GROUP_DISCOUNT_MIN_SEATS ? Math.round(subtotal * GROUP_DISCOUNT_RATE) : 0;
  const total = subtotal - discount;
  const depositRate = Number(meta.depositRate) || 0.3;
  let payNow = 0;
  if (payment === 'full') payNow = total;
  else if (payment === 'deposit') payNow = Math.round(total * depositRate);
  return { subtotal, discount, total, payNow, remaining: total - payNow };
}

/* ---------------------------------------------------------------
   PayPal — Orders v2
   --------------------------------------------------------------- */
const paypalBase = (env) =>
  String(env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const paypalEnabled = (env) => Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_SECRET);

async function paypalToken(env) {
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
  const res = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      authorization: `Basic ${auth}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || `PayPal auth failed (${res.status})`);
  }
  return data.access_token;
}

async function paypalCreateOrder(env, { amountUsd, amountIls, reference: ref, title, description, origin, kind }) {
  const token = await paypalToken(env);
  const returnUrl = `${origin}/booking/success.html?ref=${encodeURIComponent(ref)}&kind=${kind}`;
  const cancelUrl = `${origin}/booking/cancel.html?ref=${encodeURIComponent(ref)}`;

  const body = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: ref,
      custom_id: ref,
      description: String(description || title).slice(0, 127),
      invoice_id: ref,
      amount: { currency_code: 'USD', value: amountUsd }
    }],
    application_context: {
      brand_name: 'Future Vocational Academy — Yatta',
      locale: 'ar-EG',
      landing_page: 'NO_PREFERENCE',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl
    }
  };

  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'paypal-request-id': `${ref}-${amountIls}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    throw new Error(data?.message || `PayPal order error ${res.status}`);
  }
  const link = (data.links || []).find((l) => l.rel === 'approve' || l.rel === 'payer-action');
  if (!link) throw new Error('PayPal لم يُرجع رابط الدفع.');
  return { id: data.id, approveUrl: link.href };
}

async function paypalCaptureOrder(env, orderId) {
  const token = await paypalToken(env);
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'paypal-request-id': `cap-${orderId}`
    }
  });
  const data = await res.json().catch(() => ({}));

  // الطلب المُحصَّل مسبقًا يعود بخطأ ORDER_ALREADY_CAPTURED — نقرأ حالته بدل اعتباره فشلًا
  const alreadyCaptured = !res.ok &&
    JSON.stringify(data.details || []).includes('ORDER_ALREADY_CAPTURED');
  if (alreadyCaptured) {
    const look = await fetch(`${paypalBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const order = await look.json().catch(() => ({}));
    if (look.ok) return order;
  }
  if (!res.ok) throw new Error(data?.message || `PayPal capture error ${res.status}`);
  return data;
}

/** استخراج الرقم المرجعي والمبلغ من ردّ PayPal. */
function readCapture(order) {
  const unit = (order.purchase_units || [])[0] || {};
  const capture = ((unit.payments || {}).captures || [])[0] || {};
  const amount = capture.amount || unit.amount || {};
  return {
    completed: order.status === 'COMPLETED' || capture.status === 'COMPLETED',
    reference: unit.custom_id || unit.reference_id || unit.invoice_id || '',
    amountUsd: amount.value || '',
    currency: amount.currency_code || 'USD',
    captureId: capture.id || ''
  };
}

/* ---------------------------------------------------------------
   التخزين والإشعارات
   --------------------------------------------------------------- */
async function persist(env, record) {
  if (!env.BOOKINGS) return;
  try {
    await env.BOOKINGS.put(`rec:${record.reference}`, JSON.stringify(record), { expirationTtl: RECORD_TTL });
  } catch (e) {
    console.error('KV write failed', e);
  }
}

async function readRecord(env, ref) {
  if (!env.BOOKINGS || !ref) return null;
  try {
    return await env.BOOKINGS.get(`rec:${ref}`, 'json');
  } catch (e) {
    console.error('KV read failed', e);
    return null;
  }
}

async function notify(env, record) {
  if (!env.NOTIFY_WEBHOOK_URL) return;
  try {
    await fetch(env.NOTIFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (e) {
    console.error('Notify failed', e);
  }
}

/* ---------------------------------------------------------------
   التحقق من المدخلات
   --------------------------------------------------------------- */
function baseContact(body) {
  const fullName = clean(body.fullName, 120);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 160).toLowerCase();
  const city = clean(body.city, 80);

  if (fullName.length < 5 || !fullName.includes(' ')) return { error: 'يرجى إدخال الاسم الكامل.' };
  if (!isPhone(phone)) return { error: 'رقم الجوال غير صحيح.' };
  if (!isEmail(email)) return { error: 'البريد الإلكتروني غير صحيح.' };
  if (city.length < 2) return { error: 'يرجى إدخال المدينة.' };
  return { contact: { fullName, phone, email, city } };
}

function validateBooking(body, catalog) {
  const base = baseContact(body);
  if (base.error) return base;

  const courseId = clean(body.courseId, 60);
  const payment = clean(body.payment, 20) || 'full';
  const method = clean(body.method, 20) || 'paypal';
  const seats = Math.min(MAX_SEATS, Math.max(1, parseInt(body.seats, 10) || 1));
  const startDate = clean(body.startDate, 10);

  if (!PAYMENT_MODES.includes(payment)) return { error: 'طريقة الدفع غير مدعومة.' };
  if (!PAY_METHODS.includes(method)) return { error: 'وسيلة الدفع غير مدعومة.' };
  if (!isDate(startDate)) return { error: 'تاريخ البدء غير صحيح.' };
  if (!isFutureDate(startDate)) return { error: 'يرجى اختيار تاريخ بدء لاحق لتاريخ اليوم.' };

  const course = (catalog.courses || []).find((c) => c.id === courseId);
  if (!course) return { error: 'الدورة المطلوبة غير متاحة.' };

  return {
    booking: {
      ...base.contact,
      seats, payment, startDate, course,
      method: payment === 'cash' ? 'cash' : method,
      level: clean(body.level, 60),
      session: clean(body.session, 60),
      notes: clean(body.notes, 800)
    }
  };
}

function validateConsultation(body, catalog) {
  const base = baseContact(body);
  if (base.error) return base;

  const typeId = clean(body.typeId, 60);
  const date = clean(body.date, 10);
  const message = clean(body.message, 1200);
  const method = clean(body.method, 20) || 'free';

  const type = (catalog.consultations || []).find((t) => t.id === typeId);
  if (!type) return { error: 'نوع الاستشارة غير متاح.' };
  if (!isDate(date)) return { error: 'تاريخ الموعد غير صحيح.' };
  if (!isFutureDate(date)) return { error: 'يرجى اختيار تاريخ لاحق لتاريخ اليوم.' };
  if (message.length < 10) return { error: 'يرجى كتابة موضوع الاستشارة (10 أحرف على الأقل).' };
  if (type.price > 0 && !['paypal', 'bank'].includes(method)) {
    return { error: 'وسيلة الدفع غير مدعومة.' };
  }

  return {
    consultation: {
      ...base.contact,
      type, date, message,
      method: type.price > 0 ? method : 'free',
      slot: clean(body.slot, 60),
      channel: clean(body.channel, 60)
    }
  };
}

/* ---------------------------------------------------------------
   المعالجات
   --------------------------------------------------------------- */
async function startPayment(env, ctx, { record, amountIls, title, description, origin, kind }) {
  const rate = usdRate(env, record.metaRate ? { usdRate: record.metaRate } : null);
  const amountUsd = toUsd(amountIls, rate);

  if (!paypalEnabled(env)) {
    record.status = 'pending_gateway';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({
      ok: true,
      mode: 'demo',
      reference: record.reference,
      payNow: amountIls,
      message: 'تم تسجيل طلبك. بوابة الدفع الإلكتروني قيد التفعيل وسيتواصل معك فريق الأكاديمية لإتمام السداد.'
    });
  }

  try {
    const order = await paypalCreateOrder(env, {
      amountUsd, amountIls, reference: record.reference, title, description, origin, kind
    });
    record.paypalOrderId = order.id;
    record.amountUsd = amountUsd;
    record.usdRate = rate;
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({
      ok: true,
      mode: 'paypal',
      reference: record.reference,
      payNow: amountIls,
      amountUsd,
      approveUrl: order.approveUrl
    });
  } catch (e) {
    console.error('PayPal order failed', e);
    return fail('تعذّر فتح صفحة الدفع حاليًا، يرجى المحاولة لاحقًا أو اختيار التحويل البنكي.', 502);
  }
}

async function handleBooking(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return fail('صيغة الطلب غير صحيحة.'); }

  const catalog = await loadCatalog(request, env);
  const meta = catalog.meta || {};
  const checked = validateBooking(body, catalog);
  if (checked.error) return fail(checked.error);

  const booking = checked.booking;
  const amounts = quote(booking.course, booking.seats, booking.payment, meta);
  const ref = reference('FA');
  const origin = new URL(request.url).origin;

  const record = {
    kind: 'booking',
    reference: ref,
    createdAt: new Date().toISOString(),
    fullName: booking.fullName,
    phone: booking.phone,
    email: booking.email,
    city: booking.city,
    level: booking.level,
    courseId: booking.course.id,
    courseTitle: booking.course.title,
    session: booking.session,
    startDate: booking.startDate,
    seats: booking.seats,
    notes: booking.notes,
    payment: booking.payment,
    method: booking.method,
    currency: meta.currency || 'ILS',
    metaRate: usdRate(env, meta),
    ...amounts,
    status: 'new'
  };

  // الدفع في المقر — لا حاجة لبوابة دفع
  if (booking.payment === 'cash' || amounts.payNow <= 0) {
    record.status = 'reserved_unpaid';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({ ok: true, mode: 'cash', reference: ref, payNow: 0, total: amounts.total });
  }

  // تحويل بنكي — نُرجع بيانات الحساب مع الرقم المرجعي
  if (booking.method === 'bank') {
    record.status = 'awaiting_bank_transfer';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({
      ok: true,
      mode: 'bank',
      reference: ref,
      payNow: amounts.payNow,
      total: amounts.total,
      bank: bankDetails(env, meta)
    });
  }

  record.status = 'awaiting_payment';
  const label = booking.payment === 'deposit'
    ? `عربون تسجيل — ${booking.course.title}`
    : `رسوم دورة — ${booking.course.title}`;
  return startPayment(env, ctx, {
    record,
    amountIls: amounts.payNow,
    title: label,
    description: `${label} · ${booking.seats} مقعد · ${booking.course.duration}`,
    origin,
    kind: 'booking'
  });
}

async function handleConsultation(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return fail('صيغة الطلب غير صحيحة.'); }

  const catalog = await loadCatalog(request, env);
  const meta = catalog.meta || {};
  const checked = validateConsultation(body, catalog);
  if (checked.error) return fail(checked.error);

  const c = checked.consultation;
  const ref = reference('FC');
  const origin = new URL(request.url).origin;
  const price = Number(c.type.price) || 0;

  const record = {
    kind: 'consultation',
    reference: ref,
    createdAt: new Date().toISOString(),
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    city: c.city,
    typeId: c.type.id,
    typeTitle: c.type.title,
    date: c.date,
    slot: c.slot,
    channel: c.channel,
    message: c.message,
    method: c.method,
    currency: meta.currency || 'ILS',
    metaRate: usdRate(env, meta),
    payNow: price,
    total: price,
    status: 'new'
  };

  if (price <= 0) {
    record.status = 'requested_free';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({ ok: true, mode: 'free', reference: ref, payNow: 0 });
  }

  if (c.method === 'bank') {
    record.status = 'awaiting_bank_transfer';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({ ok: true, mode: 'bank', reference: ref, payNow: price, bank: bankDetails(env, meta) });
  }

  record.status = 'awaiting_payment';
  return startPayment(env, ctx, {
    record,
    amountIls: price,
    title: c.type.title,
    description: `${c.type.title} · ${c.type.duration}`,
    origin,
    kind: 'consultation'
  });
}

async function handleCapture(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return fail('صيغة الطلب غير صحيحة.'); }

  const orderId = clean(body.orderId, 40);
  if (!/^[A-Za-z0-9-]{5,40}$/.test(orderId)) return fail('معرّف عملية الدفع غير صحيح.');
  if (!paypalEnabled(env)) return fail('بوابة الدفع غير مفعّلة.', 503);

  let order;
  try {
    order = await paypalCaptureOrder(env, orderId);
  } catch (e) {
    console.error('PayPal capture failed', e);
    return fail('تعذّر تأكيد الدفع لدى PayPal. إن خُصم المبلغ من حسابك تواصلي معنا بالرقم المرجعي.', 502);
  }

  const result = readCapture(order);
  const ref = result.reference || clean(body.reference, 40);
  const stored = await readRecord(env, ref);

  if (result.completed && stored && stored.status !== 'paid') {
    stored.status = 'paid';
    stored.paidAt = new Date().toISOString();
    stored.paypalCaptureId = result.captureId;
    stored.paidUsd = result.amountUsd;
    ctx.waitUntil(Promise.all([
      persist(env, stored),
      notify(env, { event: 'payment_captured', ...stored })
    ]));
  }

  return json({
    ok: true,
    paid: result.completed,
    reference: ref,
    kind: stored ? stored.kind : clean(body.kind, 20),
    title: stored ? (stored.courseTitle || stored.typeTitle || '') : '',
    mode: stored ? (stored.payment || 'full') : 'full',
    amountIls: stored ? stored.payNow : null,
    amountUsd: result.amountUsd
  });
}

/** حالة طلب مخزَّن — للاستعلام بالرقم المرجعي. */
async function handleStatus(request, env) {
  const ref = clean(new URL(request.url).searchParams.get('ref') || '', 40);
  if (!/^F[AC]-\d{6}-[A-Z0-9]{4}$/.test(ref)) return fail('الرقم المرجعي غير صحيح.');
  const stored = await readRecord(env, ref);
  if (!stored) return fail('لم نعثر على طلب بهذا الرقم المرجعي.', 404);
  return json({
    ok: true,
    reference: stored.reference,
    kind: stored.kind,
    title: stored.courseTitle || stored.typeTitle || '',
    status: stored.status,
    payNow: stored.payNow,
    currency: stored.currency
  });
}

/** التحقق من توقيع ويب هوك PayPal عبر واجهة PayPal نفسها. */
async function handleWebhook(request, env, ctx) {
  if (!paypalEnabled(env) || !env.PAYPAL_WEBHOOK_ID) return fail('الويب هوك غير مفعّل.', 503);

  const payload = await request.text();
  let event;
  try { event = JSON.parse(payload); } catch { return fail('حمولة غير صحيحة.'); }

  const h = (name) => request.headers.get(name) || '';
  let token;
  try { token = await paypalToken(env); } catch { return fail('تعذّر التحقق.', 502); }

  const verifyRes = await fetch(`${paypalBase(env)}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: event
    })
  });
  const verify = await verifyRes.json().catch(() => ({}));
  if (!verifyRes.ok || verify.verification_status !== 'SUCCESS') {
    return fail('توقيع غير صالح.', 401);
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const res = event.resource || {};
    const ref = res.custom_id || res.invoice_id || '';
    const stored = await readRecord(env, ref);
    if (stored && stored.status !== 'paid') {
      stored.status = 'paid';
      stored.paidAt = new Date().toISOString();
      stored.paypalCaptureId = res.id || '';
      stored.paidUsd = (res.amount || {}).value || '';
      ctx.waitUntil(persist(env, stored));
    }
    ctx.waitUntil(notify(env, { event: 'payment_succeeded', reference: ref, amount: res.amount || null }));
  }

  return json({ received: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (!path.startsWith('/api/')) {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { allow: 'GET,POST,OPTIONS' } });
    }

    try {
      if (path === '/api/health' && request.method === 'GET') {
        return json({
          ok: true,
          service: 'future-academy-yatta',
          paymentsEnabled: paypalEnabled(env),
          paypalEnv: String(env.PAYPAL_ENV || 'sandbox').toLowerCase()
        });
      }
      if (path === '/api/courses' && request.method === 'GET') {
        return json(await loadCatalog(request, env));
      }
      if (path === '/api/booking' && request.method === 'POST') {
        return await handleBooking(request, env, ctx);
      }
      if (path === '/api/consultation' && request.method === 'POST') {
        return await handleConsultation(request, env, ctx);
      }
      if (path === '/api/paypal/capture' && request.method === 'POST') {
        return await handleCapture(request, env, ctx);
      }
      if (path === '/api/paypal/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env, ctx);
      }
      if (path === '/api/order/status' && request.method === 'GET') {
        return await handleStatus(request, env);
      }
      return fail('المسار غير موجود.', 404);
    } catch (e) {
      console.error(e);
      return fail('حدث خطأ داخلي، يرجى المحاولة لاحقًا.', 500);
    }
  }
};
