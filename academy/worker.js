/**
 * أكاديمية المستقبل للتعليم المهني — Cloudflare Worker
 * يخدم واجهات الحجز والدفع، بينما تُخدم صفحات الموقع من مجلد public.
 *
 * المتغيرات السرية (اختيارية — الموقع يعمل بدونها في وضع تجريبي):
 *   STRIPE_SECRET_KEY      مفتاح Stripe السري (sk_live_… أو sk_test_…)
 *   STRIPE_WEBHOOK_SECRET  سر التحقق من ويب هوك Stripe (whsec_…)
 *   NOTIFY_WEBHOOK_URL     رابط اختياري تُرسل إليه بيانات كل حجز جديد
 * الربط الاختياري: BOOKINGS (KV Namespace) لتخزين الحجوزات.
 */

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

const PAYMENT_MODES = ['full', 'deposit', 'cash'];
const MAX_SEATS = 5;
const GROUP_DISCOUNT_MIN_SEATS = 3;
const GROUP_DISCOUNT_RATE = 0.10;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const fail = (message, status = 400) => json({ ok: false, error: message }, status);

const clean = (value, max = 200) => String(value == null ? '' : value).trim().slice(0, max);

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => /^[+0-9\s()-]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8;

function reference() {
  const d = new Date();
  const stamp = String(d.getUTCFullYear()).slice(2)
    + String(d.getUTCMonth() + 1).padStart(2, '0')
    + String(d.getUTCDate()).padStart(2, '0');
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(36).toUpperCase().padStart(2, '0')).join('').slice(0, 4);
  return `FA-${stamp}-${rand}`;
}

/** تحميل كتالوج الدورات من الملفات الثابتة — مصدر واحد للأسعار. */
async function loadCatalog(request, env) {
  if (!env.ASSETS) throw new Error('ASSETS binding is not configured.');
  const url = new URL('/data/courses.json', request.url);
  const res = await env.ASSETS.fetch(new Request(url.toString(), { headers: { accept: 'application/json' } }));
  if (!res.ok) throw new Error('تعذّر تحميل كتالوج الدورات.');
  return res.json();
}

/** حساب الرسوم في الخادم — لا يُوثق بأي مبلغ قادم من المتصفح. */
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

function validate(body, catalog) {
  const fullName = clean(body.fullName, 120);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 160).toLowerCase();
  const city = clean(body.city, 80);
  const courseId = clean(body.courseId, 60);
  const payment = clean(body.payment, 20) || 'full';
  const seats = Math.min(MAX_SEATS, Math.max(1, parseInt(body.seats, 10) || 1));
  const startDate = clean(body.startDate, 10);

  if (fullName.length < 5 || !fullName.includes(' ')) return { error: 'يرجى إدخال الاسم الكامل.' };
  if (!isPhone(phone)) return { error: 'رقم الجوال غير صحيح.' };
  if (!isEmail(email)) return { error: 'البريد الإلكتروني غير صحيح.' };
  if (city.length < 2) return { error: 'يرجى إدخال المدينة.' };
  if (!PAYMENT_MODES.includes(payment)) return { error: 'طريقة الدفع غير مدعومة.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return { error: 'تاريخ البدء غير صحيح.' };

  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  if (new Date(startDate + 'T00:00:00Z') <= today) return { error: 'يرجى اختيار تاريخ بدء لاحق لتاريخ اليوم.' };

  const course = (catalog.courses || []).find((c) => c.id === courseId);
  if (!course) return { error: 'الدورة المطلوبة غير متاحة.' };

  return {
    booking: {
      fullName, phone, email, city, seats, payment, startDate, course,
      level: clean(body.level, 60),
      session: clean(body.session, 60),
      notes: clean(body.notes, 800)
    }
  };
}

async function createCheckoutSession(env, request, booking, amounts, meta, ref) {
  const origin = new URL(request.url).origin;
  const currency = String(meta.currency || 'SAR').toLowerCase();
  const label = booking.payment === 'deposit'
    ? `عربون حجز — ${booking.course.title}`
    : `رسوم دورة — ${booking.course.title}`;

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('locale', 'ar');
  params.set('customer_email', booking.email);
  params.set('client_reference_id', ref);
  params.set('success_url', `${origin}/booking/success.html?ref=${ref}&mode=${booking.payment}&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${origin}/booking/cancel.html?ref=${ref}`);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', currency);
  params.set('line_items[0][price_data][unit_amount]', String(Math.round(amounts.payNow * 100)));
  params.set('line_items[0][price_data][product_data][name]', label);
  params.set('line_items[0][price_data][product_data][description]',
    `${booking.seats} مقعد · ${booking.course.duration} · الفترة ${booking.session || 'غير محددة'}`);

  const metadata = {
    reference: ref,
    course_id: booking.course.id,
    course_title: booking.course.title,
    full_name: booking.fullName,
    phone: booking.phone,
    city: booking.city,
    level: booking.level,
    session_time: booking.session,
    start_date: booking.startDate,
    seats: String(booking.seats),
    payment_mode: booking.payment,
    total: String(amounts.total),
    pay_now: String(amounts.payNow),
    remaining: String(amounts.remaining),
    notes: booking.notes.slice(0, 450)
  };
  for (const [key, value] of Object.entries(metadata)) {
    if (value) params.set(`metadata[${key}]`, String(value).slice(0, 500));
  }
  params.set('payment_intent_data[description]', `${label} — ${ref}`);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Stripe error ${res.status}`);
  return data;
}

async function persist(env, record) {
  if (!env.BOOKINGS) return;
  try {
    await env.BOOKINGS.put(`booking:${record.reference}`, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 365
    });
  } catch (e) {
    console.error('KV write failed', e);
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

async function handleBooking(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return fail('صيغة الطلب غير صحيحة.'); }

  const catalog = await loadCatalog(request, env);
  const meta = catalog.meta || {};
  const checked = validate(body, catalog);
  if (checked.error) return fail(checked.error);

  const booking = checked.booking;
  const amounts = quote(booking.course, booking.seats, booking.payment, meta);
  const ref = reference();

  const record = {
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
    currency: meta.currency || 'SAR',
    ...amounts,
    status: booking.payment === 'cash' ? 'reserved_unpaid' : 'awaiting_payment'
  };

  // الحجز مع الدفع في المقر — لا حاجة لبوابة الدفع
  if (booking.payment === 'cash' || amounts.payNow <= 0) {
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({ ok: true, mode: 'cash', reference: ref, payNow: 0, total: amounts.total });
  }

  // بوابة الدفع غير مفعّلة بعد — نُثبت الطلب ونُعلم المتدربة
  if (!env.STRIPE_SECRET_KEY) {
    record.status = 'pending_gateway';
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({
      ok: true,
      mode: 'demo',
      reference: ref,
      payNow: amounts.payNow,
      total: amounts.total,
      message: 'تم تسجيل طلبك. بوابة الدفع الإلكتروني قيد التفعيل وسيتواصل معك فريق القبول لإتمام السداد.'
    });
  }

  try {
    const session = await createCheckoutSession(env, request, booking, amounts, meta, ref);
    record.stripeSessionId = session.id;
    ctx.waitUntil(Promise.all([persist(env, record), notify(env, record)]));
    return json({ ok: true, mode: 'stripe', reference: ref, payNow: amounts.payNow, checkoutUrl: session.url });
  } catch (e) {
    console.error('Stripe checkout failed', e);
    return fail('تعذّر فتح صفحة الدفع حاليًا، يرجى المحاولة لاحقًا أو التواصل معنا عبر واتساب.', 502);
  }
}

async function handleStatus(request, env) {
  const sessionId = new URL(request.url).searchParams.get('session_id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return fail('معرّف عملية الدفع غير صحيح.');
  if (!env.STRIPE_SECRET_KEY) return fail('بوابة الدفع غير مفعّلة.', 503);

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return fail(data?.error?.message || 'تعذّر التحقق من حالة الدفع.', 502);

  const meta = data.metadata || {};
  const paid = data.payment_status === 'paid';

  if (paid && env.BOOKINGS && meta.reference) {
    try {
      const stored = await env.BOOKINGS.get(`booking:${meta.reference}`, 'json');
      if (stored && stored.status !== 'paid') {
        stored.status = 'paid';
        stored.paidAt = new Date().toISOString();
        await env.BOOKINGS.put(`booking:${meta.reference}`, JSON.stringify(stored), {
          expirationTtl: 60 * 60 * 24 * 365
        });
      }
    } catch (e) { console.error('KV update failed', e); }
  }

  return json({
    ok: true,
    paid,
    reference: meta.reference || '',
    course: meta.course_title || '',
    payment: meta.payment_mode || 'full',
    amount: data.amount_total != null ? data.amount_total / 100 : null,
    symbol: (data.currency || 'sar').toUpperCase() === 'SAR' ? 'ر.س' : (data.currency || '').toUpperCase()
  });
}

/** التحقق من توقيع Stripe للويب هوك (HMAC-SHA256). */
async function verifyStripeSignature(secret, header, payload) {
  const parts = Object.fromEntries(
    String(header || '').split(',').map((p) => p.split('=').map((s) => s.trim()))
  );
  if (!parts.t || !parts.v1) return false;

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts.t}.${payload}`));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');

  if (expected.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}

async function handleWebhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return fail('الويب هوك غير مفعّل.', 503);
  const payload = await request.text();
  const valid = await verifyStripeSignature(
    env.STRIPE_WEBHOOK_SECRET, request.headers.get('stripe-signature'), payload
  );
  if (!valid) return fail('توقيع غير صالح.', 401);

  let event; try { event = JSON.parse(payload); } catch { return fail('حمولة غير صحيحة.'); }

  if (event.type === 'checkout.session.completed') {
    const meta = event.data?.object?.metadata || {};
    if (env.BOOKINGS && meta.reference) {
      const stored = await env.BOOKINGS.get(`booking:${meta.reference}`, 'json');
      const record = stored || { reference: meta.reference, ...meta };
      record.status = 'paid';
      record.paidAt = new Date().toISOString();
      await env.BOOKINGS.put(`booking:${meta.reference}`, JSON.stringify(record), {
        expirationTtl: 60 * 60 * 24 * 365
      });
    }
    await notify(env, { event: 'payment_succeeded', reference: meta.reference || '', metadata: meta });
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
        return json({ ok: true, service: 'future-academy', paymentsEnabled: Boolean(env.STRIPE_SECRET_KEY) });
      }
      if (path === '/api/courses' && request.method === 'GET') {
        return json(await loadCatalog(request, env));
      }
      if (path === '/api/booking' && request.method === 'POST') {
        return await handleBooking(request, env, ctx);
      }
      if (path === '/api/booking/status' && request.method === 'GET') {
        return await handleStatus(request, env);
      }
      if (path === '/api/stripe/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env);
      }
      return fail('المسار غير موجود.', 404);
    } catch (e) {
      console.error(e);
      return fail('حدث خطأ داخلي، يرجى المحاولة لاحقًا.', 500);
    }
  }
};
