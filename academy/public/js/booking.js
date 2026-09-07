/* أكاديمية المستقبل — منطق نموذج الحجز والدفع */
(function () {
  'use strict';

  const form = document.getElementById('bookingForm');
  const courseSel = document.getElementById('course');
  const seatsSel = document.getElementById('seats');
  const startDate = document.getElementById('startDate');
  const submitBtn = document.getElementById('submitBtn');
  const submitLabel = document.getElementById('submitLabel');
  const errorBox = document.getElementById('formError');
  const infoBox = document.getElementById('formInfo');

  let META = { symbol: 'ر.س', depositRate: 0.3 };
  let COURSES = [];
  let CATEGORIES = [];

  const money = (v) => window.Academy.money(v, META.symbol);
  const selectedCourse = () => COURSES.find((c) => c.id === courseSel.value) || null;
  const paymentMode = () => (form.querySelector('input[name="payment"]:checked') || {}).value || 'full';

  /* ---------- حساب الرسوم (نفس المعادلة المطبّقة في الخادم) ---------- */
  function quote() {
    const course = selectedCourse();
    if (!course) return null;
    const seats = Math.min(5, Math.max(1, parseInt(seatsSel.value, 10) || 1));
    const subtotal = course.price * seats;
    const discount = seats >= 3 ? Math.round(subtotal * 0.10) : 0;
    const total = subtotal - discount;
    const mode = paymentMode();
    let payNow = 0;
    if (mode === 'full') payNow = total;
    else if (mode === 'deposit') payNow = Math.round(total * (META.depositRate || 0.3));
    return { course, seats, subtotal, discount, total, payNow, remaining: total - payNow, mode };
  }

  function renderSummary() {
    const q = quote();
    const cat = q ? (CATEGORIES.find((c) => c.id === q.course.category) || {}).name : '';

    document.getElementById('sumTitle').textContent = q ? q.course.title : 'اختاري دورة للبدء';
    document.getElementById('sumCat').textContent = q ? cat : '—';
    document.getElementById('sumDuration').textContent = q ? q.course.duration : '—';
    document.getElementById('sumHours').textContent = q ? q.course.hours + ' ساعة' : '—';
    document.getElementById('sumSeats').textContent = q ? q.seats : '1';
    document.getElementById('sumSubtotal').textContent = q ? money(q.subtotal) : '—';
    document.getElementById('sumTotal').textContent = q ? money(q.total) : '—';
    document.getElementById('sumNow').textContent = q ? money(q.payNow) : '—';

    const discountRow = document.getElementById('discountRow');
    discountRow.style.display = q && q.discount ? 'flex' : 'none';
    if (q && q.discount) document.getElementById('sumDiscount').textContent = '− ' + money(q.discount);

    const remainingRow = document.getElementById('remainingRow');
    remainingRow.style.display = q && q.remaining > 0 ? 'flex' : 'none';
    if (q && q.remaining > 0) document.getElementById('sumRemaining').textContent = money(q.remaining);

    // أسعار خيارات الدفع
    const fullTag = document.querySelector('[data-pay-full]');
    const depTag = document.querySelector('[data-pay-deposit]');
    if (q) {
      fullTag.textContent = money(q.total);
      depTag.textContent = money(Math.round(q.total * (META.depositRate || 0.3)));
    } else {
      fullTag.textContent = '—';
      depTag.textContent = '—';
    }

    submitLabel.textContent = q && q.mode === 'cash'
      ? 'تأكيد الحجز بدون دفع'
      : (q ? 'الدفع الآمن — ' + money(q.payNow) : 'المتابعة إلى الدفع الآمن');
  }

  /* ---------- التحقق ---------- */
  function setInvalid(id, invalid) {
    const el = document.getElementById(id);
    if (el && el.closest('.field')) el.closest('.field').classList.toggle('invalid', invalid);
  }

  function validate() {
    let ok = true;
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const city = document.getElementById('city').value.trim();

    const bad = (id, cond) => { setInvalid(id, cond); if (cond) ok = false; };

    bad('fullName', name.length < 5 || !name.includes(' '));
    bad('phone', !/^[+0-9\s()-]{8,20}$/.test(phone) || (phone.replace(/\D/g, '').length < 8));
    bad('email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    bad('city', city.length < 2);
    bad('course', !courseSel.value);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const chosen = startDate.value ? new Date(startDate.value + 'T00:00:00') : null;
    bad('startDate', !chosen || chosen <= today);

    const terms = document.getElementById('terms').checked;
    document.getElementById('termsError').style.display = terms ? 'none' : 'block';
    if (!terms) ok = false;

    return ok;
  }

  /* ---------- الإرسال ---------- */
  async function submit(e) {
    e.preventDefault();
    errorBox.classList.remove('show');
    infoBox.classList.remove('show');

    if (!validate()) {
      errorBox.textContent = 'يرجى تصحيح الحقول المظللة بالأحمر ثم إعادة المحاولة.';
      errorBox.classList.add('show');
      const firstInvalid = form.querySelector('.field.invalid');
      if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const q = quote();
    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      city: document.getElementById('city').value.trim(),
      level: document.getElementById('level').value,
      courseId: courseSel.value,
      session: document.getElementById('session').value,
      startDate: startDate.value,
      seats: q.seats,
      notes: document.getElementById('notes').value.trim().slice(0, 800),
      payment: q.mode
    };

    submitBtn.disabled = true;
    const prevLabel = submitLabel.textContent;
    submitLabel.textContent = 'جارٍ تجهيز الحجز…';

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'تعذّر إتمام الطلب، يرجى المحاولة مرة أخرى.');
      }

      if (data.checkoutUrl) {
        submitLabel.textContent = 'يتم تحويلك إلى صفحة الدفع…';
        window.location.href = data.checkoutUrl;
        return;
      }

      const params = new URLSearchParams({
        ref: data.reference || '',
        mode: data.mode || payload.payment,
        amount: String(data.payNow != null ? data.payNow : q.payNow),
        course: q.course.title
      });
      window.location.href = '/booking/success.html?' + params.toString();
    } catch (err) {
      submitBtn.disabled = false;
      submitLabel.textContent = prevLabel;
      errorBox.textContent = err.message || 'حدث خطأ غير متوقع.';
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ---------- التهيئة ---------- */
  (async function init() {
    // الحد الأدنى لتاريخ البدء = الغد
    const tomorrow = new Date(Date.now() + 86400000);
    startDate.min = tomorrow.toISOString().slice(0, 10);

    try {
      const data = await window.Academy.load();
      META = data.meta;
      COURSES = data.courses;
      CATEGORIES = data.categories;

      courseSel.innerHTML = '<option value="">— اختاري الدورة —</option>' +
        CATEGORIES.map(function (cat) {
          const items = COURSES.filter(function (c) { return c.category === cat.id; });
          if (!items.length) return '';
          return '<optgroup label="' + cat.name + '">' + items.map(function (c) {
            return '<option value="' + c.id + '">' + c.title + ' — ' + money(c.price) + '</option>';
          }).join('') + '</optgroup>';
        }).join('');

      const requested = new URLSearchParams(location.search).get('course');
      if (requested && COURSES.some(function (c) { return c.id === requested; })) {
        courseSel.value = requested;
      }
      renderSummary();
    } catch (err) {
      errorBox.textContent = 'تعذّر تحميل قائمة الدورات. يرجى تحديث الصفحة.';
      errorBox.classList.add('show');
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'payment') {
        form.querySelectorAll('#payOptions .option').forEach(function (o) {
          o.classList.toggle('selected', o.contains(e.target));
        });
      }
      renderSummary();
    });
    form.addEventListener('input', function (e) {
      if (e.target.closest('.field.invalid')) e.target.closest('.field').classList.remove('invalid');
    });
    form.addEventListener('submit', submit);
  })();
})();
