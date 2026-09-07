/* أكاديمية المستقبل للتدريب المهني — منطق نموذج حجز الاستشارة */
(function () {
  'use strict';

  const form = document.getElementById('consultForm');
  const typeSel = document.getElementById('type');
  const dateInput = document.getElementById('date');
  const submitBtn = document.getElementById('submitBtn');
  const submitLabel = document.getElementById('submitLabel');
  const errorBox = document.getElementById('formError');
  const infoBox = document.getElementById('formInfo');
  const paySection = document.getElementById('paySection');

  let META = { symbol: '₪', usdRate: 3.7 };
  let TYPES = [];

  const el = (id) => document.getElementById(id);
  const money = (v) => window.Academy.money(v, META.symbol);
  const usd = (v) => window.Academy.usdText(v, META);
  const selectedType = () => TYPES.find((t) => t.id === typeSel.value) || null;
  const payMethod = () => (form.querySelector('input[name="payment"]:checked') || {}).value || 'paypal';

  function renderSummary() {
    const t = selectedType();
    const paid = !!(t && t.price > 0);

    el('sumTitle').textContent = t ? t.title : 'اختاري نوع الاستشارة';
    el('sumDuration').textContent = t ? t.duration : '—';
    el('sumMode').textContent = t ? t.mode : '—';
    el('sumDate').textContent = dateInput.value || '—';
    el('sumPrice').textContent = t ? (paid ? money(t.price) : 'مجانية') : '—';
    el('typeDesc').textContent = t ? t.desc : '';

    const showUsd = paid && payMethod() === 'paypal';
    el('usdRow').style.display = showUsd ? 'flex' : 'none';
    if (showUsd) el('sumUsd').textContent = usd(t.price);

    paySection.hidden = !paid;
    document.querySelectorAll('[data-pay-amount]').forEach(function (node) {
      const isPaypal = node.closest('.option').querySelector('input').value === 'paypal';
      node.textContent = paid ? (isPaypal ? usd(t.price) : money(t.price)) : '—';
    });

    if (!t) submitLabel.textContent = 'إرسال طلب الاستشارة';
    else if (!paid) submitLabel.textContent = 'إرسال طلب الاستشارة المجانية';
    else if (payMethod() === 'bank') submitLabel.textContent = 'تأكيد الطلب واستلام بيانات التحويل — ' + money(t.price);
    else submitLabel.textContent = 'الدفع عبر PayPal — ' + usd(t.price);
  }

  function renderBank() {
    const b = META.bank || {};
    const set = (id, v) => { const n = el(id); if (n) n.textContent = v || '—'; };
    set('bankName', b.name);
    set('bankAccountName', b.accountName);
    set('bankAccountNo', b.accountNo);
    set('bankIban', b.iban);
    set('bankCurrencies', b.currencies);
  }

  function setInvalid(id, invalid) {
    const node = el(id);
    if (node && node.closest('.field')) node.closest('.field').classList.toggle('invalid', invalid);
  }

  function validate() {
    let ok = true;
    const bad = (id, cond) => { setInvalid(id, cond); if (cond) ok = false; };
    const name = el('fullName').value.trim();
    const phone = el('phone').value.trim();
    const email = el('email').value.trim();

    bad('fullName', name.length < 5 || !name.includes(' '));
    bad('phone', !/^[+0-9\s()-]{8,20}$/.test(phone) || (phone.replace(/\D/g, '').length < 8));
    bad('email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    bad('city', el('city').value.trim().length < 2);
    bad('type', !typeSel.value);
    bad('message', el('message').value.trim().length < 10);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const chosen = dateInput.value ? new Date(dateInput.value + 'T00:00:00') : null;
    bad('date', !chosen || chosen <= today);

    const terms = el('terms').checked;
    el('termsError').style.display = terms ? 'none' : 'block';
    if (!terms) ok = false;

    return ok;
  }

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

    const t = selectedType();
    const payload = {
      fullName: el('fullName').value.trim(),
      phone: el('phone').value.trim(),
      email: el('email').value.trim(),
      city: el('city').value.trim(),
      typeId: typeSel.value,
      date: dateInput.value,
      slot: el('slot').value,
      channel: el('channel').value,
      message: el('message').value.trim().slice(0, 1200),
      method: t && t.price > 0 ? payMethod() : 'free'
    };

    submitBtn.disabled = true;
    const prevLabel = submitLabel.textContent;
    submitLabel.textContent = 'جارٍ إرسال الطلب…';

    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'تعذّر إرسال الطلب، يرجى المحاولة مرة أخرى.');
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
        mode: data.mode || payload.method,
        amount: String(data.payNow != null ? data.payNow : (t ? t.price : 0)),
        symbol: META.symbol || '₪',
        kind: 'consultation',
        title: t ? t.title : 'استشارة مهنية'
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

  (async function init() {
    const tomorrow = new Date(Date.now() + 86400000);
    dateInput.min = tomorrow.toISOString().slice(0, 10);

    try {
      const data = await window.Academy.load();
      META = data.meta;
      TYPES = data.consultations || [];

      typeSel.innerHTML = '<option value="">— اختاري نوع الاستشارة —</option>' +
        TYPES.map(function (t) {
          const price = t.price > 0 ? money(t.price) : 'مجانية';
          return '<option value="' + t.id + '">' + t.title + ' — ' + price + '</option>';
        }).join('');

      const requested = new URLSearchParams(location.search).get('type');
      if (requested && TYPES.some(function (t) { return t.id === requested; })) {
        typeSel.value = requested;
      } else if (TYPES.length) {
        typeSel.value = TYPES[0].id;
      }

      renderBank();
      renderSummary();
    } catch (err) {
      errorBox.textContent = 'تعذّر تحميل أنواع الاستشارات. يرجى تحديث الصفحة.';
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
      if (e.target === dateInput) renderSummary();
    });
    form.addEventListener('submit', submit);
  })();
})();
