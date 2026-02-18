/* ===================================================================
   MAIN.JS — Bohemian Portfolio
   ================================================================ */

(() => {
  'use strict';

  /* —————————————————————————————————————
     DOM References
  ————————————————————————————————————— */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const nav        = $('#nav');
  const navToggle  = $('#navToggle');
  const navLinks   = $('#navLinks');
  const modal      = $('#modal');
  const backdrop   = $('#modalBackdrop');
  const closeBtn   = $('#modalClose');
  const iframe     = $('#modalIframe');
  const fallbackImg = $('#modalImage');
  const titleEl    = $('#modalTitle');
  const yearEl     = $('#modalYear');
  const detailsEl  = $('#modalDetails');
  const mandala    = $('.hero__mandala');

  let lastFocused  = null;

  /* —————————————————————————————————————
     Navigation — Scroll State
  ————————————————————————————————————— */
  const updateNav = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* —————————————————————————————————————
     Navigation — Active Section
  ————————————————————————————————————— */
  const sections = $$('section[id]');
  const navItems = $$('.nav__link[data-section]');

  const markActive = () => {
    let current = '';
    const offset = window.innerHeight * 0.35;
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= offset) current = sec.id;
    }
    navItems.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  };
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

  /* —————————————————————————————————————
     Navigation — Mobile Toggle
  ————————————————————————————————————— */
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  /* Close mobile nav on link click */
  $$('.nav__link', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  });

  /* —————————————————————————————————————
     Smooth Scroll
  ————————————————————————————————————— */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* —————————————————————————————————————
     Scroll Animations (Intersection Observer)
  ————————————————————————————————————— */
  const animEls = $$('.anim-reveal, .anim-fade-up');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    animEls.forEach(el => io.observe(el));
  } else {
    animEls.forEach(el => el.classList.add('visible'));
  }

  /* —————————————————————————————————————
     Parallax on Hero Mandala
  ————————————————————————————————————— */
  if (mandala) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const rotate = scrollY * 0.02;
          const scale = Math.max(0.9, 1 - scrollY * 0.0003);
          mandala.style.transform = `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;
          mandala.style.opacity = Math.max(0, 0.6 - scrollY * 0.001);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* —————————————————————————————————————
     Modal System
  ————————————————————————————————————— */
  const openModal = card => {
    lastFocused = document.activeElement;
    const youtube = card.dataset.youtube;
    const title = card.dataset.title || '';
    const year = card.dataset.year || '';
    const tpl = card.querySelector('template.card-detail');

    titleEl.textContent = title;
    yearEl.textContent = year;

    /* Clear previous detail injections (keep title/year) */
    $$('.modal__injected', detailsEl).forEach(el => el.remove());

    if (tpl) {
      const clone = tpl.content.cloneNode(true);
      const wrapper = document.createElement('div');
      wrapper.classList.add('modal__injected');
      wrapper.appendChild(clone);
      detailsEl.appendChild(wrapper);
    }

    if (youtube) {
      iframe.src = `https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0`;
      iframe.style.display = '';
      fallbackImg.style.display = 'none';
    } else {
      iframe.src = '';
      iframe.style.display = 'none';
      /* Show card image as fallback */
      const img = card.querySelector('img');
      if (img) {
        fallbackImg.src = img.src;
        fallbackImg.alt = img.alt;
        fallbackImg.style.display = '';
      }
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    iframe.src = '';
    fallbackImg.style.display = 'none';
    fallbackImg.src = '';
    if (lastFocused) lastFocused.focus();
  };

  /* Card click */
  $$('.work__card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  /* Close triggers */
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  /* Focus trap */
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal.querySelector('.modal__content'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

})();
