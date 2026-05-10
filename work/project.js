/* ─────────────────────────────────────────────
   Project Detail Pages — project.js
   GSAP 3 + ScrollTrigger + Lenis
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Reduced motion check ── */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── GSAP register ── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Lenis smooth scroll ── */
  const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });

  // Sync Lenis → GSAP ticker (official integration)
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  /* ── Cursor ── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (dot && ring) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
    }, { passive: true });

    (function tick() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(tick);
    })();

    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));

    document.addEventListener('mouseover', e => {
      const over = e.target.closest(
        'a, button, .proj-step, .proj-metric-row, .proj-hscroll-outer'
      );
      ring.classList.toggle('is-hovering', !!over);
    }, { passive: true });

    document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));
  }

  /* ── Scroll progress bar ── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── Page transition — sweep out on load ── */
  const pageOverlay = document.getElementById('pageTransition');

  function sweepOverlayOut() {
    if (!pageOverlay) return;
    pageOverlay.style.pointerEvents = 'auto';
    gsap.set(pageOverlay, { transformOrigin: 'right center', scaleX: 1 });
    gsap.to(pageOverlay, {
      scaleX: 0, duration: 0.85, ease: 'expo.inOut', delay: 0.05,
      onComplete: () => { pageOverlay.style.pointerEvents = 'none'; }
    });
  }

  sweepOverlayOut();

  // bfcache: re-sweep if page is restored via browser back/forward
  window.addEventListener('pageshow', e => {
    if (e.persisted) sweepOverlayOut();
  });

  if (pageOverlay) {
    // Sweep in when navigating away
    document.querySelectorAll('a[href]:not([href^="#"])').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('mailto') || href.startsWith('http') && a.target === '_blank') return;
        e.preventDefault();
        gsap.set(pageOverlay, { transformOrigin: 'left center' });
        gsap.to(pageOverlay, {
          scaleX: 1, duration: 0.5, ease: 'expo.in',
          onComplete: () => { window.location.href = href; }
        });
      });
    });
  }

  /* ── Navbar ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  }

  /* ── Theme toggle ── */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  if (themeToggle) {
    const lbl  = themeToggle.querySelector('.toggle-label');
    const icon = themeToggle.querySelector('.toggle-icon');
    const sync = () => {
      const dark = html.getAttribute('data-theme') === 'dark';
      if (lbl) lbl.textContent = dark ? 'LIGHT' : 'DARK';
      icon.textContent = dark ? '◐' : '◑';
    };
    sync();
    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      sync();
    });
  }

  /* ── Smooth anchor clicks via Lenis ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
    });
  });

  /* ── Right-side scroll progress track ── */
  const scrollTrack = document.getElementById('projScrollTrack');
  const scrollFill  = document.getElementById('projScrollFill');
  if (scrollTrack && scrollFill) {
    // Update via Lenis scroll event (synced) + native fallback
    const updateTrack = () => {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? Math.min(scrolled / total * 100, 100) : 0;
      scrollFill.style.height = pct + '%';
      scrollTrack.classList.toggle('visible', scrolled > 60);
    };
    lenis.on('scroll', updateTrack);
    window.addEventListener('scroll', updateTrack, { passive: true });
  }

  /* ── Skip heavy animations on reduced motion ── */
  if (reduced) {
    document.querySelectorAll('.proj-hero-topbar, .proj-hero-tags, .proj-hero-stats, .proj-scroll-cue')
      .forEach(el => { el.style.opacity = '1'; });
    return;
  }

  /* ─────────────────────────────────────────────
     HERO ANIMATIONS
  ───────────────────────────────────────────── */
  const heroTitle = document.querySelector('.proj-title');
  if (heroTitle) {
    // Word-by-word clip reveal
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.innerHTML = words.map(w =>
      `<span class="word-wrap"><span class="word">${w}</span></span>`
    ).join(' ');

    gsap.from('.proj-title .word', {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.045,
      ease: 'power4.out',
      delay: 0.2,
    });
  }

  // Top bar, tags, stats cascade — using fromTo to avoid GSAP overwrite conflicts
  gsap.fromTo('.proj-hero-topbar',
    { opacity: 0, y: -12 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 }
  );

  gsap.fromTo('.proj-hero-tags',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.75 }
  );

  gsap.fromTo('.proj-hero-stats',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.9 }
  );

  gsap.fromTo('.proj-scroll-cue',
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 1.2 }
  );

  // Big background number parallax
  const bgNum = document.querySelector('.proj-hero-bg-num');
  if (bgNum) {
    gsap.from(bgNum, { opacity: 0, duration: 1.4, ease: 'power2.out', delay: 0.5 });
    gsap.to(bgNum, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.proj-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  /* ─────────────────────────────────────────────
     SCROLL-TRIGGERED SECTION ANIMATIONS
  ───────────────────────────────────────────── */

  // Section labels
  gsap.utils.toArray('.proj-section-label').forEach(el => {
    gsap.from(el, {
      y: 10, opacity: 0, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  // Section headings
  gsap.utils.toArray('.proj-section-heading').forEach(el => {
    gsap.from(el, {
      y: 28, opacity: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 87%', once: true }
    });
  });

  // Body paragraphs
  gsap.utils.toArray('.proj-section-body').forEach(el => {
    gsap.from(el, {
      y: 20, opacity: 0, duration: 0.75, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  // Callouts
  gsap.utils.toArray('.proj-callout').forEach(el => {
    gsap.from(el, {
      x: -20, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 87%', once: true }
    });
  });

  // Stack tags
  gsap.utils.toArray('.proj-stack').forEach(stack => {
    gsap.from(stack.querySelectorAll('.tag'), {
      y: 8, opacity: 0, stagger: 0.06, duration: 0.4, ease: 'power2.out',
      scrollTrigger: { trigger: stack, start: 'top 90%', once: true }
    });
  });

  // Link buttons
  gsap.utils.toArray('.proj-links').forEach(links => {
    gsap.from(links.querySelectorAll('a, span'), {
      y: 14, opacity: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: links, start: 'top 88%', once: true }
    });
  });

  /* ─────────────────────────────────────────────
     PROCESS — grid stagger reveal
  ───────────────────────────────────────────── */
  const hOuter = document.querySelector('.proj-hscroll-outer');
  const hTrack = document.querySelector('.proj-hscroll-track');

  if (hOuter && hTrack) {
    gsap.from(hTrack.querySelectorAll('.proj-step'), {
      y: 36, opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: hOuter, start: 'top 82%', once: true }
    });
  }

  /* ─────────────────────────────────────────────
     RESULTS — large metrics with counter animation
  ───────────────────────────────────────────── */
  gsap.utils.toArray('.proj-metric-row').forEach((row, i) => {
    const valEl = row.querySelector('.proj-metric-big-val');
    const lblEl = row.querySelector('.proj-metric-big-lbl');

    // Slide in from left (value) and right (label)
    gsap.from(valEl, {
      x: -40, opacity: 0, duration: 0.9, ease: 'power3.out',
      delay: i * 0.08,
      scrollTrigger: {
        trigger: row, start: 'top 84%', once: true,
        onEnter: () => {
          if (!valEl) return;
          const original = valEl.textContent.trim();
          const numMatch = original.match(/[\d.]+/);
          if (!numMatch) return;

          const num    = parseFloat(numMatch[0]);
          const prefix = original.slice(0, original.indexOf(numMatch[0]));
          const suffix = original.slice(original.indexOf(numMatch[0]) + numMatch[0].length);

          // Skip if 0, very large, or compound (like 5→1)
          if (num <= 0 || num > 9999 || suffix.includes('→')) return;

          gsap.to({ n: 0 }, {
            n: num, duration: 1.8, ease: 'power2.out', delay: 0.1 + i * 0.08,
            onUpdate() {
              const v = this.targets()[0].n;
              valEl.textContent = prefix +
                (Number.isInteger(num) ? Math.round(v) : v.toFixed(1)) + suffix;
            },
            onComplete() { valEl.textContent = original; }
          });
        }
      }
    });

    if (lblEl) {
      gsap.from(lblEl, {
        x: 30, opacity: 0, duration: 0.75, ease: 'power2.out',
        delay: i * 0.08 + 0.1,
        scrollTrigger: { trigger: row, start: 'top 84%', once: true }
      });
    }
  });

  // Next project section
  const projNext = document.querySelector('.proj-next');
  if (projNext) {
    gsap.from(projNext.children, {
      y: 28, opacity: 0, stagger: 0.12, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: projNext, start: 'top 88%', once: true }
    });
  }

  /* ─────────────────────────────────────────────
     DYNAMIC SIDENAV (right side, desktop only)
  ───────────────────────────────────────────── */
  const sections = document.querySelectorAll('.proj-section[id]');
  if (sections.length >= 2 && window.innerWidth > 1280) {
    const nav = document.createElement('nav');
    nav.className = 'proj-sidenav';

    sections.forEach(section => {
      const label = section.querySelector('.proj-section-label')?.textContent || section.id.toUpperCase();
      const a = document.createElement('a');
      a.className = 'proj-sidenav-dot';
      a.href = `#${section.id}`;
      a.innerHTML = `
        <span class="proj-sidenav-dot-label">${label}</span>
        <span class="proj-sidenav-dot-inner"></span>
      `;
      a.addEventListener('click', e => {
        const t = document.querySelector(`#${section.id}`);
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
      });
      nav.appendChild(a);
    });

    document.body.appendChild(nav);

    window.addEventListener('scroll', () => {
      nav.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });

    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          nav.querySelectorAll('.proj-sidenav-dot').forEach(d => d.classList.remove('active'));
          nav.querySelector(`[href="#${e.target.id}"]`)?.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => sectionObs.observe(s));
  }

});
