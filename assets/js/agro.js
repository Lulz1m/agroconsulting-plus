/* AgroConsulting Plus homepage interactions. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Sticky header and mobile navigation */
  var header = $('#site-header');
  if (header) {
    var updateHeader = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  var menuButton = $('#menu-button');
  var mobileMenu = $('#mobile-menu');
  if (menuButton && mobileMenu) {
    function setMenu(open) {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Mbyll menynë' : 'Hap menynë');
      mobileMenu.classList.toggle('hidden', !open);
      var openIcon = $('[data-icon-open]', menuButton);
      var closeIcon = $('[data-icon-close]', menuButton);
      if (openIcon) openIcon.classList.toggle('hidden', open);
      if (closeIcon) closeIcon.classList.toggle('hidden', !open);
    }
    menuButton.addEventListener('click', function () {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    $$('a', mobileMenu).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* Four service slides: buttons, keyboard, touch and accessible state */
  var carousel = $('[data-hero-carousel]');
  if (carousel) {
    var slides = $$('[data-hero-slide]', carousel);
    var controls = $$('[data-hero-go-to]', carousel);
    var status = $('[data-hero-status]', carousel);
    var currentNumber = $('[data-hero-current]', carousel);
    var activeIndex = 0;
    var touchStart = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === activeIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.toggleAttribute('inert', !active);
      });
      controls.forEach(function (control, controlIndex) {
        control.setAttribute('aria-pressed', String(controlIndex === activeIndex));
      });
      if (currentNumber) currentNumber.textContent = String(activeIndex + 1).padStart(2, '0');
      if (status) status.textContent = 'Slajdi ' + (activeIndex + 1) + ' nga ' + slides.length + ': ' + slides[activeIndex].getAttribute('data-slide-name');
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function () {
        showSlide(parseInt(control.getAttribute('data-hero-go-to'), 10));
      });
    });
    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(activeIndex + 1); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(activeIndex - 1); }
      else if (event.key === 'Home') { event.preventDefault(); showSlide(0); }
      else if (event.key === 'End') { event.preventDefault(); showSlide(slides.length - 1); }
    });
    carousel.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'touch' || event.target.closest('button')) return;
      touchStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });
    carousel.addEventListener('pointerup', function (event) {
      if (!touchStart) return;
      var deltaX = event.clientX - touchStart.x;
      var deltaY = event.clientY - touchStart.y;
      touchStart = null;
      if (event.target.closest('button') || Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      showSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    });
    carousel.addEventListener('pointercancel', function () { touchStart = null; });
    showSlide(0);
  }

  /* Reveal content as it enters the viewport; show it immediately for reduced motion. */
  var reveals = $$('.reveal, .spin-in');
  function revealAll() { reveals.forEach(function (element) { element.classList.add('is-visible'); }); }
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (element) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (element) { observer.observe(element); });
  }

  /* Back-to-top control */
  if (!document.querySelector('.back-to-top')) {
    var topButton = document.createElement('button');
    topButton.type = 'button';
    topButton.className = 'back-to-top';
    topButton.setAttribute('aria-label', 'Kthehu në krye të faqes');
    topButton.title = 'Kthehu në krye të faqes';
    topButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    document.body.appendChild(topButton);

    var footerTopLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (link) {
      return /kthehu në fillim/i.test(link.textContent);
    });
    function footerLinkVisible() {
      return footerTopLinks.some(function (link) {
        var rect = link.getBoundingClientRect();
        return rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0;
      });
    }
    function updateTopButton() {
      topButton.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !footerLinkVisible());
    }
    window.addEventListener('scroll', updateTopButton, { passive: true });
    window.addEventListener('resize', updateTopButton);
    updateTopButton();
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      var main = $('#main');
      if (main) {
        if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
      }
    });
  }
})();
