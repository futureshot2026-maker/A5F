/* أكاديمية المستقبل للتدريب المهني — منطق نموذج التسجيل والدفع */
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
  const methodSection = document.getElementById('methodSection');

  let META = { symbol: '₪', depositRate: 0.3, usdRate: 3.7 };
  let COURSES = [];
  let CATEGORIES = [];

  const el = (id) => document.getElementById(id);
  const money = (v) => window.Academy.money(v, META.symbol);
  const usd = (v) => window.Academy.usdText(v, META);
  const selectedCourse = () => COURSES.find((c) => c.id === courseSel.value) || null;
  const paymentMode = () => (form.querySelector('input[name="payment"]:checked') || {}).value || 'full';
  const payMethod = () => (form.querySelector('input[name="method"]:checked') || {}).value || 'paypal';

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
    const isCash = paymentMode() === 'cash';

    el('sumTitle').textContent = q ? q.course.title : 'اختاري دورة للبدء';
    el('sumCat').textContent = q ? cat : '—';
    el('sumDuration').textContent = q ? q.course.duration : '—';
    el('sumHours').textContent = q ? q.course.hours + ' ساعة' : '—';
    el('sumSeats').textContent = q ? q.seats : '1';
    el('sumSubtotal').textContent = q ? money(q.subtotal) : '—';
    el('sumTotal').textContent = q ? money(q.total) : '—';
    el('sumNow').textContent = q ? money(q.payNow) : '—';

    el('discountRow').style.display = q && q.discount ? 'flex' : 'none';
    if (q && q.discount) el('sumDiscount').textContent = '− ' + money(q.discount);

    el('remainingRow').style.display = q && q.remaining > 0 ? 'flex' : 'none';
    if (q && q.remaining > 0) el('sumRemaining').textContent = money(q.remaining);

    // ما يعادله بالدولار — يظهر فقط مع PayPal ومبلغ مستحق
    const showUsd = q && q.payNow > 0 && payMethod() === 'paypal';
    el('usdRow').style.display = showUsd ? 'flex' : 'none';
    if (showUsd) el('sumUsd').textContent = usd(q.payNow);

    // أسعار خيارات الدفع
    const fullTag = document.querySelector('[data-pay-full]');
    const depTag = document.querySelector('[data-pay-deposit]');
    fullTag.textContent = q ? money(q.total) : '—';
    depTag.textContent = q ? money(Math.round(q.total * (META.depositRate || 0.3))) : '—';

    const usdTag = document.querySelector('[data-method-usd]');
    const ilsTag = document.querySelector('[data-method-ils]');
    if (usdTag) usdTag.textContent = q && q.payNow > 0 ? usd(q.payNow) : '—';
    if (ilsTag) ilsTag.textContent = q && q.payNow > 0 ? money(q.payNow) : '—';

    // إخفاء طريقة الدفع عند اختيار الدفع في المقر
    methodSection.hidden = isCash;

    if (isCash) {
      submitLabel.textContent = 'تأكيد الحجز بدون دفع الآن';
    } else if (!q) {
      submitLabel.textContent = 'المتابعة إلى الدفع';
    } else if (payMethod() === 'bank') {
      submitLabel.textContent = 'تأكيد الطلب واستلام بيانات التحويل — ' + money(q.payNow);
    } else {
      submitLabel.textContent = 'الدفع عبر PayPal — ' + usd(q.payNow);
    }
  }

  function renderBank() {
    const b = META.bank || {};
    const set = (id, v) => { const n = el(id); if (n) n.textContent = v || '—'; };
    set('bankName', b.name);
    set('bankAccountName', b.accountName);
    set('bankAccountNo', b.accountNo);
    set('bankIban', b.iban);
    set('bankSwift', b.swift);
    const note = el('rateNote');
    if (note) {
      note.textContent = 'PayPal لا يدعم الشيكل كعملة تحصيل، لذلك يتم الدفع بالدولار وفق سعر تحويل معتمد: 1 دولار = '
        + (META.usdRate || 3.7) + ' شيكل. المبلغ بالشيكل هو المرجع في سجلات الأكاديمية.';
    }
  }

  /* ---------- التحقق ---------- */
  function setInvalid(id, invalid) {
    const node = el(id);
    if (node && node.closest('.field')) node.closest('.field').classList.toggle('invalid', invalid);
  }

  function validate() {
    let ok = true;
    const name = el('fullName').value.trim();
    const phone = el('phone').value.trim();
    const email = el('email').value.trim();
    const city = el('city').value.trim();

    const bad = (id, cond) => { setInvalid(id, cond); if (cond) ok = false; };

    bad('fullName', name.length < 5 || !name.includes(' '));
    bad('phone', !/^[+0-9\s()-]{8,20}$/.test(phone) || (phone.replace(/\D/g, '').length < 8));
    bad('email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    bad('city', city.length < 2);
    bad('course', !courseSel.value);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const chosen = startDate.value ? new Date(startDate.value + 'T00:00:00') : null;
    bad('startDate', !chosen || chosen <= today);

    const terms = el('terms').checked;
    el('termsError').style.display = terms ? 'none' : 'block';
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
      fullName: el('fullName').value.trim(),
      phone: el('phone').value.trim(),
      email: el('email').value.trim(),
      city: el('city').value.trim(),
      level: el('level').value,
      courseId: courseSel.value,
      session: el('session').value,
      startDate: startDate.value,
      seats: q.seats,
      notes: el('notes').value.trim().slice(0, 800),
      payment: q.mode,
      method: q.mode === 'cash' ? 'cash' : payMethod()
    };

    submitBtn.disabled = true;
    const prevLabel = submitLabel.textContent;
    submitLabel.textContent = 'جارٍ تجهيز الطلب…';

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

      if (data.approveUrl) {
        submitLabel.textContent = 'يتم تحويلك إلى PayPal…';
        window.location.href = data.approveUrl;
        return;
      }

      // بيانات الحساب البنكي القادمة من الخادم (قد تتجاوز ما في courses.json)
      if (data.bank) {
        try { sessionStorage.setItem('fa_bank', JSON.stringify(data.bank)); } catch (e) { /* تجاهل */ }
      }

      const params = new URLSearchParams({
        ref: data.reference || '',
        mode: data.mode || payload.payment,
        amount: String(data.payNow != null ? data.payNow : q.payNow),
        symbol: META.symbol || '₪',
        kind: 'booking',
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
      renderBank();
      renderSummary();
    } catch (err) {
      errorBox.textContent = 'تعذّر تحميل قائمة الدورات. يرجى تحديث الصفحة.';
      errorBox.classList.add('show');
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'payment' || e.target.name === 'method') {
        const group = e.target.name === 'payment' ? '#payOptions .option' : '#methodOptions .option';
        form.querySelectorAll(group).forEach(function (o) {
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
