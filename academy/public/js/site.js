/* أكاديمية المستقبل — سكربت مشترك */
(function () {
  'use strict';

  /* ------- التنقل ------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------- ظهور العناصر ------- */
  const revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }

  /* ------- سنة الحقوق ------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();

/* ------- أدوات مشتركة ------- */
window.Academy = {
  data: null,

  async load() {
    if (this.data) return this.data;
    const res = await fetch('/data/courses.json', { headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error('تعذّر تحميل بيانات الدورات.');
    this.data = await res.json();
    return this.data;
  },

  money(value, symbol) {
    const n = Number(value) || 0;
    return n.toLocaleString('ar-EG-u-nu-latn', { maximumFractionDigits: 0 }) + ' ' + (symbol || 'ر.س');
  },

  icon(name) {
    const paths = {
      scissors: '<path d="M6 4 18 20M18 4 6 20"/><circle cx="6" cy="20" r="2.4"/><circle cx="18" cy="20" r="2.4"/>',
      brush: '<path d="M4 20c3 1 6-1 6-4 0-1.6-1.4-3-3-3s-3 1.4-3 3c0 2-.6 3.2 0 4Z"/><path d="M10.5 14.5 20 5a2 2 0 0 0-2.8-2.8L7.5 11.5"/>',
      sparkle: '<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
      polish: '<rect x="8" y="9" width="8" height="12" rx="2.5"/><path d="M10 9V5a2 2 0 0 1 4 0v4"/><path d="M9 14h6"/>',
      chart: '<path d="M4 20h16"/><rect x="6" y="11" width="3.4" height="9" rx="1"/><rect x="12" y="6" width="3.4" height="14" rx="1"/><rect x="17.6" y="14" width="3" height="6" rx="1"/>',
      crown: '<path d="M4 18h16l1-9-5 3-4-6-4 6-5-3 1 9Z"/><path d="M5 21h14"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="26" height="26">' + (paths[name] || paths.sparkle) + '</svg>';
  },

  courseCard(course, meta, opts) {
    const options = opts || {};
    const cat = (this.data.categories.find((c) => c.id === course.category) || {}).name || '';
    const ribbon = course.popular ? '<span class="ribbon">الأكثر طلبًا</span>' : '';
    const old = course.oldPrice ? '<s>' + this.money(course.oldPrice, meta.symbol) + '</s>' : '';
    const outcomes = (course.outcomes || []).slice(0, options.outcomes || 4)
      .map((o) => '<li>' + o + '</li>').join('');
    return [
      '<article class="course-card reveal">',
      ribbon,
      '<div class="course-top"><span class="cat">' + cat + '</span><h3>' + course.title + '</h3></div>',
      '<div class="course-body">',
      '<p>' + course.desc + '</p>',
      '<div class="course-meta">',
      '<span class="chip">⏱ ' + course.duration + '</span>',
      '<span class="chip">' + course.hours + ' ساعة تدريب</span>',
      '<span class="chip chip--gold">' + course.level + '</span>',
      '</div>',
      '<ul class="course-outcomes">' + outcomes + '</ul>',
      '</div>',
      '<div class="course-foot">',
      '<div class="price-tag"><b>' + this.money(course.price, meta.symbol) + '</b>' + old + '<span>شامل المواد والشهادة</span></div>',
      '<a class="btn btn-primary" href="/booking/?course=' + course.id + '">احجزي مقعدك</a>',
      '</div>',
      '</article>'
    ].join('');
  },

  observeNew(root) {
    const items = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
    items.forEach((el) => io.observe(el));
  }
};
