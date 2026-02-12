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
  var modalVideo = document.querySelector('.modal__video');
  var modalTitle = document.getElementById('modalTitle');
  var modalYear = document.getElementById('modalYear');
  var modalDescription = document.getElementById('modalDescription');
  var modalCredits = document.getElementById('modalCredits');
  var modalLinks = document.getElementById('modalLinks');
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

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();


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

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();


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
    var description = card.getAttribute('data-description');
    var credits = card.getAttribute('data-credits');
    var linksData = card.getAttribute('data-links');

    // Show or hide video player based on whether there's a YouTube ID
    if (youtubeId) {
      modalIframe.src =
        'https://www.youtube.com/embed/' +
        youtubeId +
        '?autoplay=1&rel=0';
      modalIframe.title = title + ' — Video Player';
      modalVideo.style.display = '';
    } else {
      modalIframe.src = '';
      modalVideo.style.display = 'none';
    }

    modalTitle.textContent = title;
    modalYear.textContent = year;
    modalDescription.textContent = description;
    modalCredits.textContent = credits;

    // Build external links (Film Freeway, etc.)
    modalLinks.innerHTML = '';
    if (linksData) {
      var links = linksData.split(',');
      links.forEach(function (linkStr) {
        var parts = linkStr.trim().split(':');
        var label = parts[0];
        var url = parts.slice(1).join(':');
        if (label && url) {
          var a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'modal__ext-link';
          a.textContent = label === 'filmfreeway' ? 'View on FilmFreeway' : label;
          modalLinks.appendChild(a);
        }
      });
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
    // Stop video playback
    modalIframe.src = '';
    modalVideo.style.display = '';

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
