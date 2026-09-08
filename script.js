// ====================================
// Medical Center Website - JavaScript
// Interactive Functions & Dynamic Features
// ====================================

// ===== Utility Functions =====
function scrollToElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToBooking() {
    scrollToElement('#booking');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showCallUs() {
    alert('☎️ اتصل بنا: +970-XXXXXXX\n💬 WhatsApp: +970-XXXXXXX\n📧 البريد: info@yatta-medical.ps');
}

function callEmergency() {
    alert('🚑 خدمة الطوارئ\n\n☎️ رقم الطوارئ: +970-XXXXXXX\n\n⚠️ يرجى الاتصال فوراً في حالات الطوارئ!');
}

// ===== Scroll to Top Button =====
window.addEventListener('scroll', () => {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

// ===== Mobile Menu Toggle =====
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        // Close menu when link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }

    // Handle dropdown in mobile
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
});

// ===== Booking Form Handler =====
function handleBooking(event) {
    event.preventDefault();

    // Get form values
    const formData = new FormData(document.getElementById('bookingForm'));
    const service = formData.get('service');
    const date = formData.get('date');
    const time = formData.get('time');
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const notes = formData.get('notes');

    // Validate form
    if (!service || !date || !time || !name || !phone) {
        showMessage('bookingMessage', 'يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }

    // Validate phone format
    const phoneRegex = /^[+0-9\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
        showMessage('bookingMessage', 'يرجى إدخال رقم هاتف صحيح', 'error');
        return;
    }

    // Validate date (must be future date)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showMessage('bookingMessage', 'يرجى اختيار تاريخ مستقبلي', 'error');
        return;
    }

    // Prepare data for backend
    const bookingData = {
        service: service,
        date: date,
        time: time,
        patient_name: name,
        phone: phone,
        email: email || null,
        notes: notes || null,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    // Simulate sending data to backend
    console.log('Booking Data:', bookingData);

    // Show success message
    showMessage('bookingMessage', `✓ تم حجز موعدك بنجاح!\n
        الخدمة: ${getServiceName(service)}\n
        التاريخ: ${date}\n
        الوقت: ${time}\n
        سيتم التأكيد عبر الهاتف في أسرع وقت`, 'success');

    // Reset form
    document.getElementById('bookingForm').reset();

    // In production, send data to backend via fetch/axios
    // sendBookingToBackend(bookingData);
}

function getServiceName(service) {
    const services = {
        'emergency': '🚑 الطوارئ',
        'lab': '🧪 فحص مختبري',
        'xray': '🖼️ أشعة عادية',
        'ultrasound': '🖼️ موجات فوق صوتية',
        'ct': '🖼️ أشعة مقطعية',
        'mri': '🖼️ رنين مغناطيسي'
    };
    return services[service] || service;
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// ===== Contact Form Handler =====
function handleContact(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        created_at: new Date().toISOString()
    };

    console.log('Contact Data:', contactData);

    alert('شكراً لتواصلك معنا!\nسيتم الرد على بريدك الإلكتروني في أقرب وقت.');
    event.target.reset();

    // In production, send data to backend
    // sendContactToBackend(contactData);
}

// ===== FAQ Toggle =====
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const allFaqItems = document.querySelectorAll('.faq-item');

    // Close all other FAQs
    allFaqItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });

    // Toggle current FAQ
    faqItem.classList.toggle('active');
}

// ===== Set Minimum Date for Booking =====
window.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);

        // Set maximum date to 60 days from now
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 60);
        const maxDateStr = maxDate.toISOString().split('T')[0];
        dateInput.setAttribute('max', maxDateStr);
    }
});

// ===== Smooth Scroll for All Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Performance Monitoring =====
window.addEventListener('load', () => {
    // Log page load time
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page Load Time: ' + pageLoadTime + 'ms');

        // Log if load time exceeds 3 seconds
        if (pageLoadTime > 3000) {
            console.warn('⚠️ Page load time exceeded 3 seconds');
        }
    }
});

// ===== Form Input Validation =====
document.addEventListener('DOMContentLoaded', () => {
    // Phone input real-time validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value;
            // Remove non-numeric characters except +, -, space, parentheses
            value = value.replace(/[^\d+\-\s()]/g, '');
            e.target.value = value;
        });
    });

    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            const email = e.target.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                e.target.style.borderColor = '#dc3545';
            } else {
                e.target.style.borderColor = '#e0e0e0';
            }
        });
    });
});

// ===== Service Cards Animation on Scroll =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-card, .pricing-card, .stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// ===== Backend API Functions (Template) =====

/**
 * Send booking data to backend
 * @param {Object} bookingData - The booking information
 */
function sendBookingToBackend(bookingData) {
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Booking created:', data);
        showMessage('bookingMessage', 'تم تأكيد الحجز بنجاح!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('bookingMessage', 'حدث خطأ. يرجى المحاولة مجدداً.', 'error');
    });
}

/**
 * Send contact message to backend
 * @param {Object} contactData - The contact information
 */
function sendContactToBackend(contactData) {
    fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(contactData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Message sent:', data);
        alert('شكراً! تم استقبال رسالتك.');
    })
    .catch(error => console.error('Error:', error));
}

/**
 * Get CSRF token from meta tag
 */
function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}

// ===== Local Storage Functions for User Preferences =====

/**
 * Save user preferences (font size, theme, etc.)
 */
function saveUserPreference(key, value) {
    try {
        localStorage.setItem(`medical_center_${key}`, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
}

/**
 * Get user preference
 */
function getUserPreference(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(`medical_center_${key}`);
        return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.warn('localStorage not available:', e);
        return defaultValue;
    }
}

// ===== Dark Mode Toggle (Optional Feature) =====
function initializeDarkMode() {
    const isDarkMode = getUserPreference('darkMode', false);
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    saveUserPreference('darkMode', isDarkMode);
}

// ===== Analytics Tracking (Template) =====

/**
 * Track user actions (booking, form submission, etc.)
 */
function trackEvent(eventName, eventData = {}) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log(`Event tracked: ${eventName}`, eventData);
}

// Track page view on load
window.addEventListener('load', () => {
    trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname
    });
});

// ===== Error Handling =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send error to backend for logging
    // trackEvent('javascript_error', {
    //     message: event.message,
    //     filename: event.filename,
    //     lineno: event.lineno
    // });
});

// ===== Service Worker Registration (PWA Support) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is ready
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏥 Medical Center Website Loaded');
    console.log('Version: 1.0.0');
    console.log('Author: Medical Center Development Team');

    // Initialize features
    initializeDarkMode();

    // Log important information
    console.log('✓ Navigation initialized');
    console.log('✓ Booking form ready');
    console.log('✓ Contact form ready');
    console.log('✓ Analytics ready');
});

// Export functions for global access (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        scrollToElement,
        scrollToBooking,
        scrollToTop,
        showCallUs,
        callEmergency,
        handleBooking,
        handleContact,
        toggleFAQ,
        saveUserPreference,
        getUserPreference,
        toggleDarkMode,
        trackEvent
    };
}