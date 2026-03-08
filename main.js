/* ============================================================
   HARRINGTON & COLE LLP — Main JavaScript
   ============================================================ */

'use strict';

/* ---------- Utility: debounce ---------- */
function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ---------- 1. Sticky Header ---------- */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // run once on load
})();

/* ---------- 2. Mobile Navigation ---------- */
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');
  if (!hamburger || !nav) return;

  let overlay = null;

  function openNav() {
    hamburger.classList.add('open');
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Create overlay
    overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.5)',
      zIndex: '999',
      cursor: 'pointer'
    });
    overlay.addEventListener('click', closeNav);
    document.body.appendChild(overlay);
  }

  function closeNav() {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (overlay) { overlay.remove(); overlay = null; }
  }

  hamburger.addEventListener('click', () => {
    nav.classList.contains('open') ? closeNav() : openNav();
  });

  // Close when a nav link is clicked
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
  });
})();

/* ---------- 3. Smooth scroll for anchor links ---------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = document.getElementById('site-header')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top, behavior: 'smooth' });

      // Update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();

/* ---------- 4. Scroll Reveal ---------- */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ---------- 5. Back to Top ---------- */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  function updateBtn() {
    if (window.scrollY > 500) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  }

  window.addEventListener('scroll', updateBtn, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ---------- 6. Set footer year ---------- */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------- 7. Contact Form Validation ---------- */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),    error: form.querySelector('#name-error'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your full name.' },
    email:   { el: form.querySelector('#email'),   error: form.querySelector('#email-error'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.' },
    message: { el: form.querySelector('#message'), error: form.querySelector('#message-error'), validate: v => v.trim().length >= 10 ? '' : 'Please provide a brief description (at least 10 characters).' }
  };

  const consent = form.querySelector('#consent');

  // Live validation on blur
  Object.values(fields).forEach(({ el, error, validate }) => {
    if (!el) return;
    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      error.textContent = msg;
      el.classList.toggle('error', !!msg);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const msg = validate(el.value);
        error.textContent = msg;
        el.classList.toggle('error', !!msg);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    // Validate all fields
    Object.values(fields).forEach(({ el, error, validate }) => {
      if (!el) return;
      const msg = validate(el.value);
      error.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) valid = false;
    });

    // Check consent
    if (consent && !consent.checked) {
      consent.focus();
      alert('Please confirm your consent to proceed.');
      valid = false;
    }

    if (!valid) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate successful submission
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      successMsg.removeAttribute('hidden');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1200);
  });
})();

/* ---------- 8. Typewriter effect in hero (optional subtle animation) ---------- */
(function initHeroUnderline() {
  // Adds a subtle animated underline to the hero eyebrow after page loads
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (!eyebrow) return;

  eyebrow.style.setProperty('--underline-width', '0%');
})();

/* ---------- 9. Active nav link highlighting on scroll ---------- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const headerHeight = document.getElementById('site-header')?.offsetHeight || 80;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.main-nav a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, {
    rootMargin: `-${headerHeight}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
})();
