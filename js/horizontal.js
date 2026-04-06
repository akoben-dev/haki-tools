/**
 * ============================================================
 * HAKI TOOLS — Pinned Horizontal Storytelling Band (v3.1)
 * ============================================================
 *
 * READABILITY FIX
 * ───────────────────────────────────────────────────────────
 * The old approach used `overflow: hidden` on panels and pinned
 * on a fixed scroll distance (track.scrollWidth - window.innerWidth).
 * That clipped tall content at the bottom.
 *
 * v3.1 approach:
 *   - Remove overflow:hidden from panels (done in CSS)
 *   - Calculate pin end distance as:
 *       (number of panels - 1) × window.innerWidth
 *     This gives exactly one full viewport of horizontal travel
 *     per panel transition — no more, no less.
 *   - Each panel's content is allowed full vertical height.
 *     Because the section is pinned (sticky), tall content that
 *     exceeds 100vh is scrolled through vertically BEFORE
 *     advancing to the next horizontal panel.
 *
 * HOW VERTICAL-THEN-HORIZONTAL WORKS
 * ───────────────────────────────────────────────────────────
 * Standard GSAP pin: the section is pinned at top=0 and the
 * scrub drives x translation. The "end" of the trigger is the
 * total scroll distance needed to advance all panels.
 *
 * For full readability within each panel, we add extra scroll
 * distance per panel proportional to its content height beyond
 * the viewport. A panel that is 1.4× the viewport height gets
 * 0.4vh extra scroll budget before the horizontal advances.
 *
 * Mobile (≤ 768px): horizontal disabled, normal vertical flow.
 * ============================================================
 */

(function () {
  'use strict';

  const MOBILE_BP = 768;

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function initHorizontalBand() {
    const bandSection = document.getElementById('story-band');
    const track       = document.getElementById('story-track');
    if (!bandSection || !track) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    if (isMobile()) {
      gsap.set(track, { clearProps: 'x,transform' });
      return;
    }

    const panels = gsap.utils.toArray('.story-panel');
    if (!panels.length) return;

    // ── Compute total scroll distance ──────────────────────────
    // Base: (numPanels - 1) × 100vw (one viewport per panel transition)
    // Extra: for each panel, if its content is taller than 100vh,
    //        add the overflow height as extra scroll space so the
    //        user can read it fully before advancing.
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal travel distance
    const horizontalTravel = (panels.length - 1) * vw;

    // Per-panel overflow budget: how many extra scroll pixels each panel
    // needs so its full content is visible before x starts advancing.
    // Using exact overflow (no cap) + 80px buffer ensures the last item
    // is genuinely on screen before the transition begins.
    const panelExtras = panels.map(panel => {
      const inner = panel.querySelector('.story-panel-inner');
      if (!inner) return 0;
      const overflow = inner.scrollHeight - vh;
      return overflow > 0 ? overflow + 80 : 0;
    });
    const extraScroll = panelExtras.reduce((a, b) => a + b, 0);

    const totalScrollDistance = horizontalTravel + extraScroll;

    // ── GSAP timeline: horizontal scrub ───────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'story-band-pin',
        trigger: bandSection,
        start: 'top top',
        end: () => '+=' + totalScrollDistance,
        pin: true,
        scrub: 1.0,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: () => {
          // Derive active panel from actual x translation.
          // During a dwell phase x is constant (= -i × vw) so the
          // correct dot stays highlighted without flickering.
          const rawX   = gsap.getProperty(track, 'x') || 0;
          const idx    = Math.round(Math.abs(rawX) / vw);
          const active = Math.min(Math.max(idx, 0), panels.length - 1);
          document.querySelectorAll('.story-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === active);
          });
        },
      }
    });

    // Segmented timeline: for each panel, hold x constant for the
    // panel's overflow budget (dwell), then advance x by vw (transition).
    // This is the only change from v3.3 — everything else is unchanged.
    // Result: tall content is fully readable before horizontal move begins.
    let currentX = 0;
    panels.forEach((panel, i) => {
      const extra = panelExtras[i];

      // Dwell phase — hold x constant AND translate panel inner upward
      // to reveal content below the fold. Mirrors natural vertical
      // scrolling: header/row-1 scroll up as row-2+ come into view.
      // The last 15% of the dwell budget is a hold at the fully-
      // revealed position before the horizontal transition begins.
      if (extra > 0) {
        const dwellDuration  = extra / totalScrollDistance;
        const actualOverflow = extra - 80; // exact overflow without buffer

        // Hold x constant
        tl.to(track, { x: currentX, duration: dwellDuration, ease: 'none' });

        // Simultaneously scroll panel inner up to reveal hidden items.
        // Starts at the same time (<) as the track hold above.
        if (actualOverflow > 0) {
          const inner = panel.querySelector('.story-panel-inner');
          if (inner) {
            tl.to(inner, {
              y:        -actualOverflow,
              duration: dwellDuration * 0.85, // finishes with 15% hold at bottom
              ease:     'none',
            }, '<');
          }
        }
      }

      // Transition phase — advance to next panel
      if (i < panels.length - 1) {
        currentX -= vw;
        tl.to(track, {
          x:        currentX,
          duration: vw / totalScrollDistance,
          ease:     'none',
        });
      }
    });

    // ── Panel entrance animations ──────────────────────────────
    // Fade-in each panel's inner content as it slides into view
    panels.forEach((panel, i) => {
      if (i === 0) return; // first panel starts visible
      const inner = panel.querySelector('.story-panel-inner');
      if (!inner) return;
      gsap.fromTo(inner,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tl.scrollTrigger.animation,
            start: 'left 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // ── Story dots visibility ──────────────────────────────────
    ScrollTrigger.create({
      trigger: bandSection,
      start: 'top top',
      end: 'bottom top',
      onEnter:     () => bandSection.classList.add('is-pinned'),
      onLeave:     () => bandSection.classList.remove('is-pinned'),
      onEnterBack: () => bandSection.classList.add('is-pinned'),
      onLeaveBack: () => bandSection.classList.remove('is-pinned'),
    });

    // ── Resize handling ────────────────────────────────────────
    ScrollTrigger.addEventListener('refreshInit', () => {
      if (isMobile()) {
        const pinST = ScrollTrigger.getById('story-band-pin');
        if (pinST) pinST.kill();
        gsap.set(track, { clearProps: 'x,transform' });
        bandSection.classList.remove('is-pinned');
      }
    });
  }

  function tryInit() {
    if (typeof gsap !== 'undefined') {
      initHorizontalBand();
    } else {
      setTimeout(tryInit, 120);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
