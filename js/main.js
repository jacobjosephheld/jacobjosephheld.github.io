/* ============================================
   Jacob Joseph Held — Portfolio JS
   ============================================ */

(function () {
  'use strict';

  // --- DOM Elements ---
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var navLinkEls = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('section[id]');
  var modal = document.getElementById('modal');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalClose = document.getElementById('modalClose');
  var modalIframe = document.getElementById('modalIframe');
  var modalImage = document.getElementById('modalImage');
  var modalVideo = document.querySelector('.modal__video');
  var modalTitle = document.getElementById('modalTitle');
  var modalYear = document.getElementById('modalYear');
  var modalDetails = document.getElementById('modalDetails');
  var workCards = document.querySelectorAll('.work__card');

  // Track which card opened the modal for focus return
  var lastFocusedCard = null;


  // --- Navigation: Scroll State ---
  function updateNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }


  // --- Navigation: Active Section Highlight ---
  var workSectionIds = ['filmmaking', 'theatre', 'commercial'];
  var workParentLink = document.querySelector('.nav__item--dropdown > .nav__link');

  function updateActiveSection() {
    var scrollPos = window.scrollY + window.innerHeight / 3;
    var activeId = null;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        activeId = id;
      }
    });

    // Clear all active states
    navLinkEls.forEach(function (link) {
      link.classList.remove('active');
    });

    if (activeId) {
      // Highlight matching sub-links
      navLinkEls.forEach(function (link) {
        if (link.getAttribute('data-section') === activeId) {
          link.classList.add('active');
        }
      });

      // Highlight "Work" parent link when in any work section
      if (workParentLink && workSectionIds.indexOf(activeId) !== -1) {
        workParentLink.classList.add('active');
      }
    }
  }

  var isScrollTicking = false;

  function runScrollUpdates() {
    updateNavScroll();
    updateActiveSection();
  }

  function onScroll() {
    if (isScrollTicking) return;

    isScrollTicking = true;
    window.requestAnimationFrame(function () {
      runScrollUpdates();
      isScrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  runScrollUpdates();


  // --- Navigation: Mobile Toggle ---
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  navLinkEls.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Close mobile nav on outside click
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });


  // --- Scroll Animations (IntersectionObserver) ---
  function initScrollAnimations() {
    var animElements = document.querySelectorAll('.anim-reveal, .anim-fade-up');

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -40px 0px',
        }
      );

      animElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: just show everything
      animElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }

  initScrollAnimations();


  // --- Modal: Open ---
  function openModal(card) {
    var youtubeId = card.getAttribute('data-youtube');
    var title = card.getAttribute('data-title');
    var year = card.getAttribute('data-year');

    // Show or hide video player based on whether there's a YouTube ID
    if (youtubeId) {
      modalIframe.src =
        'https://www.youtube.com/embed/' +
        youtubeId +
        '?autoplay=1&rel=0';
      modalIframe.title = title + ' — Video Player';
      modalVideo.style.display = '';
      modalIframe.style.display = '';
      modalImage.style.display = 'none';
    } else {
      var cardImg = card.querySelector('.work__thumbnail-img');
      modalIframe.src = '';
      modalIframe.style.display = 'none';
      if (cardImg) {
        modalImage.src = cardImg.src;
        modalImage.alt = cardImg.alt;
        modalImage.style.display = 'block';
        modalVideo.style.display = '';
      } else {
        // No image (e.g. Coming Soon cards) — hide video section entirely
        modalVideo.style.display = 'none';
      }
    }

    // Set title and year
    modalTitle.textContent = title;
    modalYear.textContent = year;

    // Remove any previously cloned template content (everything after modalYear)
    var detailChildren = Array.prototype.slice.call(modalDetails.children);
    detailChildren.forEach(function (child) {
      if (child !== modalTitle && child !== modalYear) {
        modalDetails.removeChild(child);
      }
    });

    // Clone and inject the card's <template> content
    var tpl = card.querySelector('template.card-detail');
    if (tpl) {
      var clone = document.importNode(tpl.content, true);
      modalDetails.appendChild(clone);
    }

    lastFocusedCard = card;
    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Move focus into the modal
    modalClose.focus();
  }

  workCards.forEach(function (card) {
    card.addEventListener('click', function () {
      openModal(card);
    });

    // Keyboard activation (Enter / Space)
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });


  // --- Modal: Close ---
  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    // Stop video playback and clear image
    modalIframe.src = '';
    modalIframe.style.display = '';
    modalImage.src = '';
    modalImage.style.display = 'none';
    modalVideo.style.display = '';

    // Remove cloned template content (everything after title and year)
    var detailChildren = Array.prototype.slice.call(modalDetails.children);
    detailChildren.forEach(function (child) {
      if (child !== modalTitle && child !== modalYear) {
        modalDetails.removeChild(child);
      }
    });

    // Return focus to the card that triggered the modal
    if (lastFocusedCard) {
      lastFocusedCard.focus();
      lastFocusedCard = null;
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // --- Modal: Focus Trap ---
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !modal.classList.contains('active')) return;

    // Get all focusable elements inside the modal
    var focusable = modal.querySelectorAll(
      'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });


  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = 72; // matches --nav-height in CSS
        var offsetTop = target.offsetTop - navHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
})();
