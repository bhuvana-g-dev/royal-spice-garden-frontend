/* ==============================================
   ROYAL SPICE GARDEN — SCRIPT v3
   CHANGE LOG (v2 → v3):
   ✅ Sections 6 & 7 now make real fetch() calls
      to the Express backend instead of simulating.
   ✅ Handles backend success & error responses.
   ✅ All other sections unchanged from v2.
   ============================================== */

// ──────────────────────────────────────────────
// BACKEND URL — change this if your backend runs
// on a different port or domain in production.
// ──────────────────────────────────────────────
const API_BASE = 'https://royal-spice-garden-backend.onrender.com';


/* ══════════════════════════════════════════════
   1. NAVBAR
══════════════════════════════════════════════ */
const navbar      = document.getElementById('navbar');
const navToggle   = document.getElementById('navToggle');
const navLinks    = document.getElementById('navLinks');
const navBackdrop = document.getElementById('navBackdrop');
const allNavLinks = document.querySelectorAll('.nav-link');

const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNavLink();
};
window.addEventListener('scroll', onScroll, { passive: true });

function openMenu() {
  navLinks.classList.add('open');
  navBackdrop.classList.add('visible');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Close navigation menu');
  navBackdrop.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('open');
  navBackdrop.classList.remove('visible');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation menu');
  navBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

navBackdrop.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (navLinks.classList.contains('open')) closeMenu();
    if (!modalOverlay.hidden)               closeModal();
  }
});

const sections = document.querySelectorAll('main section[id]');

function updateActiveNavLink() {
  let currentSection = '';
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(section => {
    const top = section.offsetTop;
    if (scrollMid >= top && scrollMid < top + section.offsetHeight) {
      currentSection = section.getAttribute('id');
    }
  });
  allNavLinks.forEach(link => {
    const isActive = link.dataset.section === currentSection;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}
updateActiveNavLink();


/* ══════════════════════════════════════════════
   2. MENU FILTER TABS
══════════════════════════════════════════════ */
const tabBtns    = document.querySelectorAll('.tab-btn');
const menuCards  = document.querySelectorAll('.menu-card');
const menuStatus = document.getElementById('menuStatus');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    let visibleCount = 0;

    menuCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
        visibleCount++;
        card.style.transitionDelay = `${(visibleCount - 1) * 0.05}s`;
        if (card.classList.contains('revealed')) {
          card.classList.remove('revealed');
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('revealed')));
        }
      } else {
        card.classList.add('hidden');
        card.style.transitionDelay = '0s';
      }
    });

    if (menuStatus) {
      menuStatus.textContent = `${visibleCount} item${visibleCount !== 1 ? 's' : ''} shown for "${btn.textContent.trim()}"`;
    }
  });
});


/* ══════════════════════════════════════════════
   3. SCROLL REVEAL
══════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));


/* ══════════════════════════════════════════════
   4. MODAL
══════════════════════════════════════════════ */
const modalOverlay  = document.getElementById('modalOverlay');
const modalTitle    = document.getElementById('modalTitle');
const modalMsg      = document.getElementById('modalMsg');
const modalCloseBtn = document.getElementById('modalCloseBtn');
let modalOpener     = null;

function openModal(title, message, opener = null) {
  modalTitle.textContent = title;
  modalMsg.textContent   = message;
  modalOpener = opener;
  modalOverlay.removeAttribute('hidden');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modalOverlay.classList.add('open');
      modalCloseBtn.focus();
      document.body.style.overflow = 'hidden';
    });
  });
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    modalOverlay.setAttribute('hidden', '');
    if (modalOpener) modalOpener.focus();
    modalOpener = null;
  }, 350);
}

modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
modalOverlay.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); modalCloseBtn.focus(); } });
window.closeModal = closeModal;
modalOverlay.setAttribute('hidden', '');


/* ══════════════════════════════════════════════
   5. FORM VALIDATION HELPERS
══════════════════════════════════════════════ */
function setFieldError(input, msg) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const errId = input.getAttribute('aria-describedby');
  if (errId) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = msg;
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  input.setAttribute('aria-invalid', 'false');
  const errId = input.getAttribute('aria-describedby');
  if (errId) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  }
}

function validateField(input) {
  const value = input.value.trim();
  if (input.required && !value) {
    setFieldError(input, 'This field is required.');
    return false;
  }
  if (input.type === 'tel' && value && !/^[0-9+\s\-]{7,15}$/.test(value)) {
    setFieldError(input, 'Enter a valid phone number.');
    return false;
  }
  if (input.type === 'number' && value) {
    const num = Number(value);
    if (num < Number(input.min || -Infinity)) { setFieldError(input, `Minimum is ${input.min}.`); return false; }
    if (num > Number(input.max || Infinity))  { setFieldError(input, `Maximum is ${input.max}.`); return false; }
  }
  clearFieldError(input);
  return true;
}

function validateForm(form) {
  const fields = form.querySelectorAll('input, select, textarea');
  let allValid = true, firstInvalid = null;
  fields.forEach(field => {
    if (!validateField(field)) { allValid = false; if (!firstInvalid) firstInvalid = field; }
  });
  if (firstInvalid) firstInvalid.focus();
  return allValid;
}

function setButtonLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

// Live validation (clear error as user corrects field)
document.querySelectorAll('.form input, .form select, .form textarea').forEach(field => {
  field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});


/* ══════════════════════════════════════════════
   6. TABLE BOOKING FORM
   ✅ Now calls the real backend API.
      On success: shows modal with confirmation.
      On failure: shows modal with error message.
══════════════════════════════════════════════ */
const bookingForm      = document.getElementById('bookingForm');
const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Run client-side validation first — don't hit the server if fields are empty
  if (!validateForm(bookingForm)) return;

  // Read the endpoint from the form's data-api attribute
  // data-api="/api/bookings" → full URL becomes http://localhost:5000/api/bookings
  const endpoint = API_BASE + bookingForm.dataset.api;

  // Build the payload that matches our Booking model fields
  const payload = {
    name:   document.getElementById('b-name').value.trim(),
    phone:  document.getElementById('b-phone').value.trim(),
    date:   document.getElementById('b-date').value,
    time:   document.getElementById('b-time').value,
    guests: document.getElementById('b-guests').value,
    notes:  document.getElementById('b-notes').value.trim(),
  };

  try {
    // Show spinner, disable button so user can't double-submit
    setButtonLoading(bookingSubmitBtn, true);

    // POST the payload to the backend as JSON
    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    // Parse the JSON body the server sends back
    const data = await response.json();

    if (!response.ok) {
      // Server responded with 4xx or 5xx — show the server's error message
      throw new Error(data.message || 'Something went wrong. Please try again.');
    }

    // ✅ Success — booking was saved to MongoDB
    openModal(
      'Booking Confirmed! 🎉',
      `Thank you, ${payload.name}! Your table has been reserved. We'll confirm by calling ${payload.phone} shortly.`,
      bookingSubmitBtn
    );

    bookingForm.reset();
    bookingForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  } catch (error) {
    // Network failure (server is offline) or server-side error
    console.error('Booking error:', error);
    openModal(
      'Something went wrong 😔',
      error.message || 'Unable to send booking. Please call us directly at +91 98765 43210.',
      bookingSubmitBtn
    );

  } finally {
    // Always re-enable the button, whether success or failure
    setButtonLoading(bookingSubmitBtn, false);
  }
});


/* ══════════════════════════════════════════════
   7. CATERING FORM
   ✅ Now calls the real backend API.
══════════════════════════════════════════════ */
const cateringForm      = document.getElementById('cateringForm');
const cateringSubmitBtn = document.getElementById('cateringSubmitBtn');

cateringForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm(cateringForm)) return;

  const endpoint = API_BASE + cateringForm.dataset.api;

  // Read the human-friendly event label for the modal message
  const eventSelect = document.getElementById('c-event');
  const eventLabel  = eventSelect.options[eventSelect.selectedIndex].text;

  const payload = {
    name:       document.getElementById('c-name').value.trim(),
    phone:      document.getElementById('c-phone').value.trim(),
    eventType:  document.getElementById('c-event').value,         // e.g. 'wedding'
    guestCount: document.getElementById('c-guests').value,        // number string
    eventDate:  document.getElementById('c-date').value,
    notes:      document.getElementById('c-msg').value.trim(),
  };

  try {
    setButtonLoading(cateringSubmitBtn, true);

    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong. Please try again.');
    }

    // ✅ Success — catering request saved to MongoDB
    openModal(
      'Request Received! ✨',
      `Thank you, ${payload.name}! Your catering enquiry for "${eventLabel}" is confirmed. We'll reach you at ${payload.phone} within 24 hours.`,
      cateringSubmitBtn
    );

    cateringForm.reset();
    cateringForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  } catch (error) {
    console.error('Catering error:', error);
    openModal(
      'Something went wrong 😔',
      error.message || 'Unable to send request. Please call us directly at +91 98765 43210.',
      cateringSubmitBtn
    );

  } finally {
    setButtonLoading(cateringSubmitBtn, false);
  }
});


/* ══════════════════════════════════════════════
   8. UTILITY HELPERS
══════════════════════════════════════════════ */

// Smooth-scroll polyfill for older Safari
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ══════════════════════════════════════════════
   9. DATE INPUT — MIN DATE
══════════════════════════════════════════════ */
const today = new Date().toISOString().split('T')[0];

const bookingDate = document.getElementById('b-date');
if (bookingDate) bookingDate.setAttribute('min', today);

const cateringDate = document.getElementById('c-date');
if (cateringDate) cateringDate.setAttribute('min', today);
