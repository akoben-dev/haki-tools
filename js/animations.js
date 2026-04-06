/**
 * ============================================================
 * HAKI TOOLS — Scroll Animations & GSAP ScrollTrigger (v3)
 * ============================================================
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Intersection Observer fallback ──────────────────────────
  function setupIntersectionObserver() {
    const elements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => observer.observe(el));
  }

  // ── GSAP ScrollTrigger setup ─────────────────────────────────
  function setupGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setupIntersectionObserver();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: just show everything immediately
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }

    // ── Reveal animations ─────────────────────────────────────
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Hero content: fade out early in the 320vh pin ──────────
    // Content (Charleston, logo, tagline, CTAs) fades out in the
    // first 25% of the pin, clearing the field for the particle
    // convergence and final SVG logo reveal.
    const heroContent = document.querySelector('.hero-content');
    const heroPinWrapper = document.getElementById('hero-pin');
    if (heroContent && heroPinWrapper) {
      ScrollTrigger.create({
        trigger: heroPinWrapper,
        start: 'top top',
        end: '25% top',
        scrub: 0.4,
        onUpdate: (self) => {
          const fade = Math.max(0, 1 - self.progress * 3.5);
          heroContent.style.opacity = fade;
          heroContent.style.pointerEvents = fade < 0.05 ? 'none' : 'all';
        }
      });
    }
    // Story-dots and band pin managed by horizontal.js

    // ── Glow orb parallax ─────────────────────────────────────
    gsap.utils.toArray('.glow-orb').forEach(orb => {
      gsap.to(orb, {
        y: -70,
        scrollTrigger: {
          trigger: orb.closest('section') || orb.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        }
      });
    });
  }

  // ── Navigation scroll behavior ──────────────────────────────
  function setupNav() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    let ticking = false;
    function handleScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ── Mobile nav drawer ───────────────────────────────────────
  function setupMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const drawer = document.querySelector('.nav-mobile-drawer');
    if (!toggle || !drawer) return;

    function openDrawer() {
      toggle.classList.add('open');
      drawer.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
      toggle.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.classList.contains('open')) closeDrawer();
    });
  }

  // ── FAQ Accordion ───────────────────────────────────────────
  function setupFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(i => {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          if (a) a.style.maxHeight = null;
          const btn = i.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        // Open clicked if was closed
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          question.setAttribute('aria-expanded', 'true');
        }
      });

      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  // ── Smooth scroll ───────────────────────────────────────────
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupMobileNav();
    setupFAQ();
    setupSmoothScroll();

    if (document.readyState === 'complete') {
      setupGSAP();
    } else {
      window.addEventListener('load', setupGSAP);
    }
  });

})();
