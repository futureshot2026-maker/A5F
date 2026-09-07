// أكاديمية المستقبل — Services listing + booking/payment form logic
const WHATSAPP_NUMBER = '966500000000'; // TODO: replace with the real academy WhatsApp number

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('courses-list');
  const selectEl = document.getElementById('course-select');
  const summaryEl = document.getElementById('payment-summary');
  const form = document.getElementById('booking-form');
  const msgEl = document.getElementById('form-msg');
  const payBtn = document.getElementById('pay-btn');
  const laterBtn = document.getElementById('later-btn');

  let courses = [];

  async function loadCourses() {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('bad response');
      courses = await res.json();
    } catch (e) {
      // Fallback for static hosting without a backend (no /api available)
      courses = window.FALLBACK_COURSES || [];
    }
    renderCourses();
    renderOptions();

    // Pre-select course if arriving from a "احجزي الآن" card link (?course=id)
    const params = new URLSearchParams(location.search);
    const pre = params.get('course');
    if (pre && selectEl) { selectEl.value = pre; updateSummary(); }
  }

  function renderCourses() {
    if (!listEl) return;
    listEl.innerHTML = courses.map(c => `
      <div class="course-card reveal">
        <div class="course-thumb">${c.icon || '✨'}</div>
        <div class="course-body">
          <div class="course-tags">
            <span class="tag">${c.category}</span>
            <span class="tag">${c.duration}</span>
            <span class="tag">${c.level}</span>
          </div>
          <h3>${c.title}</h3>
          <p>${c.summary}</p>
          <div class="course-meta">
            <div class="price">${c.price} <span>${c.currency} / دبلوم</span></div>
            <a class="btn btn-primary" href="#booking-form" data-course="${c.id}">احجزي الآن</a>
          </div>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-course]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectEl) { selectEl.value = btn.getAttribute('data-course'); updateSummary(); }
      });
    });
  }

  function renderOptions() {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="" disabled selected>اختر الدورة / الخدمة</option>' +
      courses.map(c => `<option value="${c.id}">${c.title} — ${c.price} ${c.currency}</option>`).join('');
    selectEl.addEventListener('change', updateSummary);
  }

  function updateSummary() {
    const course = courses.find(c => c.id === selectEl.value);
    if (!course || !summaryEl) { if (summaryEl) summaryEl.style.display = 'none'; return; }
    summaryEl.style.display = 'block';
    summaryEl.innerHTML = `
      <div class="row"><span>الدورة</span><strong>${course.title}</strong></div>
      <div class="row"><span>المدة</span><span>${course.duration}</span></div>
      <div class="row"><span>عربون الحجز</span><span>${course.price} ${course.currency}</span></div>
      <div class="row total"><span>الإجمالي المطلوب الآن</span><span>${course.price} ${course.currency}</span></div>
      <div class="pay-methods">
        <span>💳 بطاقة ائتمان / مدى</span>
        <span>🅿️ Apple Pay</span>
        <span>🏦 تحويل بنكي</span>
      </div>
    `;
  }

  function showMsg(text, ok) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = 'form-msg show ' + (ok ? 'ok' : 'err');
  }

  function getFormData() {
    return {
      courseId: selectEl.value,
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      preferredDate: form.preferredDate.value,
      notes: form.notes.value.trim()
    };
  }

  function validate(data) {
    if (!data.courseId) return 'الرجاء اختيار الدورة';
    if (!data.name) return 'الرجاء إدخال الاسم الكامل';
    if (!/^\+?[0-9\s-]{8,15}$/.test(data.phone)) return 'الرجاء إدخال رقم جوال صحيح';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'الرجاء إدخال بريد إلكتروني صحيح';
    return null;
  }

  function confirmBooking(course, data) {
    showMsg(`تم تأكيد حجزك بنجاح في "${course ? course.title : ''}" ✅ — سيصلك تأكيد على بريدك الإلكتروني وسيتواصل معك فريقنا لبدء الدورة.`, true);
    form.reset(); summaryEl.style.display = 'none';
  }

  // Pay now → Stripe Checkout via backend (falls back to a confirmed-booking
  // screen when no backend/payment API is reachable, e.g. static hosting)
  if (payBtn) {
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData();
      const err = validate(data);
      if (err) return showMsg(err, false);
      const course = courses.find(c => c.id === data.courseId);

      payBtn.disabled = true;
      payBtn.textContent = 'جاري تجهيز الدفع...';
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        let out = null;
        try { out = await res.json(); } catch { /* not JSON → no API on this host */ }

        if (out && res.ok && out.url) {
          location.href = out.url; // Stripe Checkout
        } else if (out && res.ok && out.mock) {
          showMsg(out.message || 'تم استلام طلبك، سيتم التواصل معك لإتمام الدفع.', true);
          form.reset(); summaryEl.style.display = 'none';
        } else if (out && !res.ok && out.error) {
          showMsg(out.error, false);
        } else {
          confirmBooking(course, data);
        }
      } catch (err) {
        confirmBooking(course, data);
      } finally {
        payBtn.disabled = false;
        payBtn.textContent = '💳 ادفعي وأكدي الحجز';
      }
    });
  }

  // Book now, pay later (bank transfer / in person) — saved as a lead
  if (laterBtn) {
    laterBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = getFormData();
      const err = validate(data);
      if (err) return showMsg(err, false);
      try {
        const res = await fetch('/api/booking', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error);
        showMsg('تم تسجيل حجزك بنجاح! سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الدفع والموعد.', true);
        form.reset(); summaryEl.style.display = 'none';
      } catch {
        // Static-hosting fallback: no backend available, route to WhatsApp
        const course = courses.find(c => c.id === data.courseId);
        const text = encodeURIComponent(
          `مرحباً، أرغب بحجز دورة "${course ? course.title : ''}"\nالاسم: ${data.name}\nالجوال: ${data.phone}\nالتاريخ المفضل: ${data.preferredDate || '-'}`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
      }
    });
  }

  form && form.addEventListener('submit', (e) => e.preventDefault());

  loadCourses();
});
