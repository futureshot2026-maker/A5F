/* أكاديمية المستقبل — سكربت الموقع العام */
(function () {
  "use strict";

  /* سنة الفوتر */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* قائمة الجوال */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ====================== صفحة الخدمات: فلترة حسب التصنيف ====================== */
  const filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    const buttons = filterBar.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll("[data-category]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const cat = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const show = cat === "all" || card.getAttribute("data-category") === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ====================== صفحة الحجز ====================== */
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    /* تعبئة الخدمة تلقائيًا من رابط الصفحة ?service=slug */
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get("service");
    const serviceSelect = document.getElementById("service");
    if (serviceParam && serviceSelect) {
      const opt = Array.from(serviceSelect.options).find((o) => o.value === serviceParam);
      if (opt) serviceSelect.value = serviceParam;
    }

    /* إظهار/إخفاء تفاصيل طريقة الدفع */
    const payRadios = bookingForm.querySelectorAll('input[name="payment"]');
    const payDetails = bookingForm.querySelectorAll(".pay-detail");
    function syncPayDetails() {
      const checked = bookingForm.querySelector('input[name="payment"]:checked');
      payDetails.forEach((d) => d.classList.remove("is-visible"));
      if (checked) {
        const target = bookingForm.querySelector(`.pay-detail[data-for="${checked.value}"]`);
        if (target) target.classList.add("is-visible");
      }
    }
    payRadios.forEach((r) => r.addEventListener("change", syncPayDetails));
    syncPayDetails();

    /* التحقق من الحقول */
    function showError(field, message) {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("has-error");
      const msg = wrap.querySelector(".error-msg");
      if (msg) msg.textContent = message;
    }
    function clearError(field) {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.remove("has-error");
    }

    const phonePattern = /^(\+970|0)?5[6-9][0-9]{7}$/;

    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      const required = bookingForm.querySelectorAll("[required]");
      required.forEach((field) => {
        clearError(field);
        if (field.type === "checkbox") {
          if (!field.checked) {
            valid = false;
            showError(field, "هذا الحقل مطلوب");
          }
        } else if (field.type === "radio") {
          const group = bookingForm.querySelectorAll(`[name="${field.name}"]`);
          const anyChecked = Array.from(group).some((r) => r.checked);
          if (!anyChecked) {
            valid = false;
            showError(field, "الرجاء الاختيار");
          }
        } else if (!field.value.trim()) {
          valid = false;
          showError(field, "هذا الحقل مطلوب");
        }
      });

      const nameField = document.getElementById("fullName");
      const phoneField = document.getElementById("phone");
      const emailField = document.getElementById("email");

      if (nameField && nameField.value.trim() && nameField.value.trim().length < 3) {
        valid = false;
        showError(nameField, "الرجاء إدخال الاسم كاملاً");
      }

      if (phoneField && phoneField.value.trim() && !phonePattern.test(phoneField.value.trim())) {
        valid = false;
        showError(phoneField, "رقم جوال فلسطيني غير صحيح، مثال: 0599xxxxxx");
      }

      if (emailField && emailField.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
        valid = false;
        showError(emailField, "بريد إلكتروني غير صحيح");
      }

      if (!valid) {
        const firstError = bookingForm.querySelector(".has-error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      /* تجميع بيانات الحجز */
      const data = Object.fromEntries(new FormData(bookingForm).entries());
      const optionText = (select) => (select && select.selectedIndex > -1 ? select.options[select.selectedIndex].text : "");
      const serviceLabel = optionText(serviceSelect);
      const ageGroupLabel = optionText(document.getElementById("ageGroup"));
      const attendanceLabel = optionText(document.getElementById("attendance"));
      const timeSlotLabel = optionText(document.getElementById("timeSlot"));
      const payLabelEl = bookingForm.querySelector('input[name="payment"]:checked');
      const payLabel = payLabelEl ? payLabelEl.closest(".pay-option").querySelector("strong").textContent : "";

      const summaryEl = document.getElementById("bookingSummary");
      if (summaryEl) {
        summaryEl.innerHTML = `
          <div><span>الاسم</span><span>${escapeHtml(data.fullName || "")}</span></div>
          <div><span>الجوال</span><span>${escapeHtml(data.phone || "")}</span></div>
          <div><span>الخدمة</span><span>${escapeHtml(serviceLabel)}</span></div>
          <div><span>الموعد المفضل</span><span>${escapeHtml(data.preferredDate || "—")} / ${escapeHtml(timeSlotLabel || "—")}</span></div>
          <div><span>طريقة الدفع</span><span>${escapeHtml(payLabel)}</span></div>
        `;
      }

      const waMessage = encodeURIComponent(
        `مرحبًا أكاديمية المستقبل، أرغب بتأكيد حجز:\n- الاسم: ${data.fullName}\n- الجوال: ${data.phone}\n- الخدمة: ${serviceLabel}\n- الموعد المفضل: ${data.preferredDate || "-"} (${timeSlotLabel || "-"})\n- طريقة الدفع: ${payLabel}\n- ملاحظات: ${data.notes || "-"}`
      );
      const waLink = document.getElementById("waConfirmLink");
      if (waLink) waLink.href = `https://wa.me/970599000000?text=${waMessage}`;

      const mailSubject = encodeURIComponent("طلب حجز جديد - أكاديمية المستقبل");
      const mailBody = encodeURIComponent(
        `الاسم: ${data.fullName}\nالجوال: ${data.phone}\nالبريد: ${data.email || "-"}\nالخدمة: ${serviceLabel}\nالفئة العمرية: ${ageGroupLabel || "-"}\nطريقة الحضور: ${attendanceLabel || "-"}\nالموعد المفضل: ${data.preferredDate || "-"} (${timeSlotLabel || "-"})\nطريقة الدفع: ${payLabel}\nملاحظات: ${data.notes || "-"}`
      );
      const mailLink = document.getElementById("mailConfirmLink");
      if (mailLink) mailLink.href = `mailto:booking@future-academy-yatta.ps?subject=${mailSubject}&body=${mailBody}`;

      bookingForm.classList.add("is-hidden");
      const successPanel = document.getElementById("bookingSuccess");
      if (successPanel) {
        successPanel.classList.add("is-visible");
        successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
