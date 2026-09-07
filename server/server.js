// أكاديمية المستقبل — Backend: serves the site + handles booking & Stripe Checkout.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const courses = require('./courses');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;
const LEADS_FILE = path.join(__dirname, 'bookings.json');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function readBookings() {
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch { return []; }
}
function saveBooking(entry) {
  const all = readBookings();
  all.push(entry);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));
}

// Public: list courses/services (kept server-side so prices can't be tampered with)
app.get('/api/courses', (req, res) => {
  res.json(courses.map(({ id, title, category, duration, level, price, currency, icon, summary }) =>
    ({ id, title, category, duration, level, price, currency, icon, summary })));
});

// Create a Stripe Checkout session for a course deposit/payment
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { courseId, name, phone, email, notes, preferredDate } = req.body || {};
    const course = courses.find(c => c.id === courseId);
    if (!course) return res.status(400).json({ error: 'الدورة غير موجودة' });
    if (!name || !phone || !email) return res.status(400).json({ error: 'الرجاء إدخال جميع البيانات المطلوبة' });

    const booking = {
      id: `bk_${Date.now()}`,
      courseId, courseTitle: course.title, price: course.price, currency: course.currency,
      name, phone, email, notes: notes || '', preferredDate: preferredDate || '',
      status: 'pending_payment', createdAt: new Date().toISOString()
    };
    saveBooking(booking);

    if (!stripe) {
      // Payment gateway not configured yet — still record the lead and let the
      // front-end fall back to a WhatsApp/manual-payment flow.
      return res.status(200).json({
        mock: true,
        bookingId: booking.id,
        message: 'بوابة الدفع غير مفعّلة بعد على الخادم (STRIPE_SECRET_KEY). تم حفظ طلب الحجز وسيتم التواصل معك لإتمام الدفع.'
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: course.currency.toLowerCase(),
          product_data: { name: course.title, description: `حجز والتسجيل في: ${course.title}` },
          unit_amount: Math.round(course.price * 100)
        },
        quantity: 1
      }],
      metadata: { bookingId: booking.id, courseId, name, phone, preferredDate: preferredDate || '' },
      success_url: `${SITE_URL}/success.html?booking=${booking.id}`,
      cancel_url: `${SITE_URL}/cancel.html?booking=${booking.id}`
    });

    booking.stripeSessionId = session.id;
    const all = readBookings().map(b => b.id === booking.id ? booking : b);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));

    res.json({ url: session.url, bookingId: booking.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء جلسة الدفع' });
  }
});

// Fallback: booking without payment gateway (e.g. "pay later / bank transfer")
app.post('/api/booking', (req, res) => {
  const { courseId, name, phone, email, notes, preferredDate } = req.body || {};
  const course = courses.find(c => c.id === courseId);
  if (!course) return res.status(400).json({ error: 'الدورة غير موجودة' });
  if (!name || !phone) return res.status(400).json({ error: 'الرجاء إدخال الاسم ورقم الجوال' });

  const booking = {
    id: `bk_${Date.now()}`, courseId, courseTitle: course.title, price: course.price,
    currency: course.currency, name, phone, email: email || '', notes: notes || '',
    preferredDate: preferredDate || '', status: 'awaiting_contact', createdAt: new Date().toISOString()
  };
  saveBooking(booking);
  res.json({ ok: true, bookingId: booking.id });
});

// Stripe webhook (optional, needs STRIPE_WEBHOOK_SECRET) to mark bookings as paid
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) return res.status(400).send('Webhook not configured');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata && session.metadata.bookingId;
    if (bookingId) {
      const all = readBookings().map(b => b.id === bookingId ? { ...b, status: 'paid' } : b);
      fs.writeFileSync(LEADS_FILE, JSON.stringify(all, null, 2));
    }
  }
  res.json({ received: true });
});

app.listen(PORT, () => console.log(`أكاديمية المستقبل — server running on ${SITE_URL}`));
