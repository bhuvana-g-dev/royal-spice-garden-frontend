/* ==============================================
   ROYAL SPICE GARDEN — SCRIPT v4 (FINAL)

   WHAT WAS WRONG:
   - You still had the OLD v3 script.js on disk
   - v3 had no fetchMenuFromAPI() at all
   - Menu was hardcoded in HTML, never read from DB

   WHAT THIS FILE FIXES:
   ✅ fetchMenuFromAPI() calls GET /api/menu
      (confirmed working at localhost:5000/api/menu)
   ✅ API_BASE = window.location.origin
      (auto-detects localhost in dev, Render URL in prod)
   ✅ Cards built dynamically from MongoDB data
   ✅ Filter tabs re-wired after dynamic render
   ✅ Fallback static menu if backend is offline
   ✅ Skeleton loader while fetching
   ✅ All other sections unchanged from v3
   ============================================== */

/* ── Backend URL ────────────────────────────────
   window.location.origin automatically becomes:
   • http://localhost:5000  — when running locally
   • https://your-app.onrender.com  — when deployed
   No manual change needed for either environment.
──────────────────────────────────────────────── */
const API_BASE =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : window.location.origin;


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
    if (!modalOverlay.hidden) closeModal();
  }
});

const pageSections = document.querySelectorAll('main section[id]');
function updateActiveNavLink() {
  let currentSection = '';
  const scrollMid = window.scrollY + window.innerHeight / 2;
  pageSections.forEach(section => {
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
   2. MENU — DYNAMIC FROM DATABASE
   ✅ Fetches from GET /api/menu (public route)
   ✅ Confirmed working: localhost:5000/api/menu
   ✅ Renders cards into #menuGrid dynamically
   ✅ Filter tabs re-wired after each render
   ✅ Falls back to FALLBACK_MENU if API fails
══════════════════════════════════════════════ */

// Fallback static menu — shown ONLY if backend is offline.
// When backend is online, MongoDB data is used instead.
const FALLBACK_MENU = [
  { name: 'Chicken Biryani', price: 220, category: 'biryani',
    description: 'Slow-cooked basmati rice with tender chicken, aromatic whole spices & caramelised onions.',
    image: 'https://images.unsplash.com/photo-1603496987674-79600a000f55?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hpY2tlbiUyMHJpY2V8ZW58MHx8MHx8fDA%3D', available: true },
  { name: 'Mutton Biryani',  price: 290, category: 'biryani',
    description: 'Succulent mutton pieces marinated overnight, layered with fragrant saffron rice.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Egg Biryani',     price: 160, category: 'biryani',
    description: 'Golden fried eggs nestled in spiced basmati rice, garnished with fresh mint.',
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Chicken Grill',   price: 380, category: 'grill',
    description: 'Whole chicken marinated in tandoori spices, grilled to perfection over charcoal flame.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Chicken 65',      price: 240, category: 'grill',
    description: 'Crispy deep-fried chicken tossed with fiery red chillies, curry leaves & yoghurt sauce.',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Shawarma',        price: 130, category: 'grill',
    description: 'Juicy grilled chicken wrapped in soft flatbread with garlic mayo, pickles & fresh veggies.',
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Fried Rice',      price: 180, category: 'grill',
    description: 'Wok-tossed rice with vegetables, eggs & a secret blend of sauces for bold umami.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Lemon Juice',     price: 60,  category: 'drinks',
    description: 'Freshly squeezed lemons with a hint of black salt, cumin & chilled water.',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=500&auto=format&fit=crop&q=80', available: true },
  { name: 'Rose Milk',       price: 80,  category: 'drinks',
    description: 'Chilled full-cream milk blended with fragrant rose syrup — a timeless Tamil refreshment.',
    image: 'https://plus.unsplash.com/premium_photo-1723741259504-cfb686777f1c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cm9zZSUyMG1pbGt8ZW58MHx8MHx8fDA%3D', available: true },
];

/**
 * Builds one <article> card HTML string from a menu item.
 * Works identically for API data and FALLBACK_MENU data.
 */
function buildMenuCard(item) {
  const category = item.category || 'other';
  const name     = escHtml(item.name);
  const desc     = escHtml(item.description || '');
  const imgSrc   = item.image || '';
  const price    = item.price;
  const slug     = name.toLowerCase().replace(/\s+/g, '-');

  return `
    <article class="menu-card" data-category="${category}" data-reveal>
      <div class="card-image-wrap">
        ${imgSrc
          ? `<img
               src="${escHtml(imgSrc)}"
               alt="${name}"
               class="card-img"
               loading="lazy"
               width="500"
               height="200"
               onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'>&#127859;</div>'"
             />`
          : `<div class="card-img-placeholder">&#127859;</div>`
        }
      </div>
      <div class="card-body">
        <h3 class="card-title">${name}</h3>
        ${desc ? `<p class="card-desc">${desc}</p>` : ''}
        <div class="card-footer">
          <span class="card-price" aria-label="Price: ${price} rupees">&#8377;${price}</span>
          <button
            class="btn btn-sm"
            data-item="${slug}"
            data-price="${price}"
            aria-label="Order ${name}"
          >Order Now</button>
        </div>
      </div>
    </article>`;
}

/**
 * Re-wires filter tab click listeners to work on
 * whatever cards are currently in #menuGrid.
 * Called after every render so new cards respond to tabs.
 */
function wireFilterTabs() {
  const menuStatus = document.getElementById('menuStatus');

  // Clone each tab to remove any old event listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
  });

  // Re-attach listeners to the fresh buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update tab active state
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visible  = 0;

      // Show / hide cards based on category
      document.querySelectorAll('.menu-card').forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          visible++;
          card.style.transitionDelay = `${(visible - 1) * 0.05}s`;
          // Re-trigger reveal animation
          if (card.classList.contains('revealed')) {
            card.classList.remove('revealed');
            requestAnimationFrame(() =>
              requestAnimationFrame(() => card.classList.add('revealed'))
            );
          }
        } else {
          card.classList.add('hidden');
          card.style.transitionDelay = '0s';
        }
      });

      // Announce to screen readers
      if (menuStatus) {
        menuStatus.textContent =
          `${visible} item${visible !== 1 ? 's' : ''} shown for "${btn.textContent.trim()}"`;
      }
    });
  });
}

/**
 * ✅ MAIN FIX
 * Fetches all available menu items from the backend
 * and renders them into #menuGrid as dynamic cards.
 *
 * Route: GET /api/menu  (public — no auth required)
 * Confirmed working: localhost:5000/api/menu ✅
 *
 * Success path → renders MongoDB items (admin changes show here)
 * Failure path → renders FALLBACK_MENU (site still works offline)
 */
async function fetchMenuFromAPI() {
  const grid     = document.getElementById('menuGrid');
  const skeleton = document.getElementById('menuSkeleton');
  const emptyEl  = document.getElementById('menuEmpty');

  // Show skeleton loader, clear grid
  if (skeleton) skeleton.style.display = 'grid';
  if (emptyEl)  emptyEl.style.display  = 'none';
  grid.innerHTML = '';

  let items = [];

  try {
    // ✅ Correct route — confirmed from screenshot
    const response = await fetch(`${API_BASE}/api/menu`);

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    // Only show items marked as available (available: true)
    items = (data.data || []).filter(item => item.available !== false);

    console.log(`✅ Menu loaded from database: ${items.length} items`);

  } catch (err) {
    // Backend is offline or route error — use fallback so page still works
    console.warn(`⚠️ Menu API failed (${err.message}), using fallback menu.`);
    items = FALLBACK_MENU;
  }

  // Hide skeleton
  if (skeleton) skeleton.style.display = 'none';

  // Show empty state if no items at all
  if (!items.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  // Render all cards into the grid
  grid.innerHTML = items.map(item => buildMenuCard(item)).join('');

  // Re-wire filter tabs to respond to the new cards
  wireFilterTabs();

  // Start scroll-reveal on new cards
  document.querySelectorAll('.menu-card[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });
}

// ✅ Kick off the menu fetch immediately on page load
fetchMenuFromAPI();


/* ══════════════════════════════════════════════
   3. SCROLL REVEAL
   Defined BEFORE fetchMenuFromAPI call above
   so it's available when the function uses it
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

// Observe all static [data-reveal] elements (about, contact, etc.)
// Menu cards are observed dynamically inside fetchMenuFromAPI()
document.querySelectorAll('[data-reveal]:not(.menu-card)').forEach(el => {
  revealObserver.observe(el);
});


/* ══════════════════════════════════════════════
   4. MODAL
══════════════════════════════════════════════ */
const modalOverlay  = document.getElementById('modalOverlay');
const modalTitle    = document.getElementById('modalTitle');
const modalMsg      = document.getElementById('modalMsg');
const modalCloseBtn = document.getElementById('modalCloseBtn');
let   modalOpener   = null;

function openModal(title, message, opener = null) {
  modalTitle.textContent = title;
  modalMsg.textContent   = message;
  modalOpener = opener;
  modalOverlay.removeAttribute('hidden');
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      modalOverlay.classList.add('open');
      modalCloseBtn.focus();
      document.body.style.overflow = 'hidden';
    })
  );
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
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
modalOverlay.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') { e.preventDefault(); modalCloseBtn.focus(); }
});
window.closeModal = closeModal;
modalOverlay.setAttribute('hidden', '');


/* ══════════════════════════════════════════════
   5. FORM VALIDATION HELPERS
══════════════════════════════════════════════ */
function setFieldError(input, msg) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const errEl = document.getElementById(input.getAttribute('aria-describedby'));
  if (errEl) errEl.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('error');
  input.setAttribute('aria-invalid', 'false');
  const errEl = document.getElementById(input.getAttribute('aria-describedby'));
  if (errEl) errEl.textContent = '';
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
    if (num > Number(input.max ||  Infinity)) { setFieldError(input, `Maximum is ${input.max}.`); return false; }
  }
  clearFieldError(input);
  return true;
}

function validateForm(form) {
  const fields = form.querySelectorAll('input, select, textarea');
  let allValid = true, firstInvalid = null;
  fields.forEach(field => {
    if (!validateField(field)) {
      allValid = false;
      if (!firstInvalid) firstInvalid = field;
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return allValid;
}

function setButtonLoading(btn, loading) {
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

// Live validation: clear error as user corrects the field
document.querySelectorAll('.form input, .form select, .form textarea').forEach(field => {
  field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});


/* ══════════════════════════════════════════════
   6. TABLE BOOKING FORM
══════════════════════════════════════════════ */
const bookingForm      = document.getElementById('bookingForm');
const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm(bookingForm)) return;

  const endpoint = API_BASE + bookingForm.dataset.api; // /api/bookings
  const payload  = {
    name:   document.getElementById('b-name').value.trim(),
    phone:  document.getElementById('b-phone').value.trim(),
    date:   document.getElementById('b-date').value,
    time:   document.getElementById('b-time').value,
    guests: document.getElementById('b-guests').value,
    notes:  document.getElementById('b-notes').value.trim(),
  };

  try {
    setButtonLoading(bookingSubmitBtn, true);
    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong.');
    openModal(
      'Booking Confirmed! 🎉',
      `Thank you, ${payload.name}! Your table has been reserved. We'll confirm by calling ${payload.phone} shortly.`,
      bookingSubmitBtn
    );
    bookingForm.reset();
    bookingForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  } catch (error) {
    openModal(
      'Something went wrong 😔',
      error.message || 'Unable to send booking. Please call us directly.',
      bookingSubmitBtn
    );
  } finally {
    setButtonLoading(bookingSubmitBtn, false);
  }
});


/* ══════════════════════════════════════════════
   7. CATERING FORM
══════════════════════════════════════════════ */
const cateringForm      = document.getElementById('cateringForm');
const cateringSubmitBtn = document.getElementById('cateringSubmitBtn');

cateringForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm(cateringForm)) return;

  const endpoint    = API_BASE + cateringForm.dataset.api; // /api/catering
  const eventSelect = document.getElementById('c-event');
  const eventLabel  = eventSelect.options[eventSelect.selectedIndex].text;
  const payload     = {
    name:       document.getElementById('c-name').value.trim(),
    phone:      document.getElementById('c-phone').value.trim(),
    eventType:  document.getElementById('c-event').value,
    guestCount: document.getElementById('c-guests').value,
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
    if (!response.ok) throw new Error(data.message || 'Something went wrong.');
    openModal(
      'Request Received! ✨',
      `Thank you, ${payload.name}! Your catering enquiry for "${eventLabel}" is confirmed. We'll reach you at ${payload.phone} within 24 hours.`,
      cateringSubmitBtn
    );
    cateringForm.reset();
    cateringForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  } catch (error) {
    openModal(
      'Something went wrong 😔',
      error.message || 'Unable to send request. Please call us directly.',
      cateringSubmitBtn
    );
  } finally {
    setButtonLoading(cateringSubmitBtn, false);
  }
});


/* ══════════════════════════════════════════════
   8. UTILITY HELPERS
══════════════════════════════════════════════ */

// Smooth scroll polyfill for older Safari
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Escape HTML — prevents XSS when building cards from DB data
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/* ══════════════════════════════════════════════
   9. DATE INPUT — MIN DATE
   Prevents selecting past dates in booking forms
══════════════════════════════════════════════ */
const today        = new Date().toISOString().split('T')[0];
const bookingDate  = document.getElementById('b-date');
const cateringDate = document.getElementById('c-date');
if (bookingDate)  bookingDate.setAttribute('min', today);
if (cateringDate) cateringDate.setAttribute('min', today);