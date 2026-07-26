/* ─────────────────────────────────────────────
   Mathavan — script.js
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Page transition — sweep out on load ── */
  const pageOverlay = document.getElementById('pageTransition');
  if (pageOverlay) {
    gsap.set(pageOverlay, { transformOrigin: 'right center', scaleX: 1 });
    gsap.to(pageOverlay, {
      scaleX: 0,
      duration: 0.85,
      ease: 'expo.inOut',
      delay: 0.05,
      onComplete: () => { pageOverlay.style.pointerEvents = 'none'; }
    });
  }

  /* ── Cursor — transform only, no layout thrash ── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px,${mouseY}px)`;
  }, { passive: true });

  (function tick() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.transform = `translate(${ringX}px,${ringY}px)`;
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
  document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));

  // Delegation — fires on every move, never gets stuck
  document.addEventListener('mouseover', e => {
    const over = e.target.closest('a, button, .skill-pill, .logo-item, .project-card');
    ring.classList.toggle('is-hovering', !!over);
  }, { passive: true });

  document.addEventListener('mousedown', () => ring.classList.add('is-clicking'));
  document.addEventListener('mouseup',   () => ring.classList.remove('is-clicking'));


  /* ── Scroll Progress ── */
  const progressBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });


  /* ── Text Scramble ── */
  function scramble(el, text, ms) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ&·_';
    let f = 0, total = Math.ceil(ms / 36);
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    const id = setInterval(() => {
      const p = f / total;
      el.textContent = text.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (p > i / text.length) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (++f > total) { el.textContent = text; clearInterval(id); }
    }, 36);
  }


  /* ── Preloader ── */
  const preloader = document.getElementById('preloader');
  const fill      = document.getElementById('preloaderFill');
  const counter   = document.getElementById('preloaderCount');
  document.body.classList.add('is-loading');

  let pct = 0;
  const loader = setInterval(() => {
    pct = Math.min(100, pct + Math.floor(Math.random() * 10) + 3);
    fill.style.width    = pct + '%';
    counter.textContent = String(pct).padStart(3, '0');
    if (pct >= 100) clearInterval(loader);
  }, 70);

  /* ── Lenis + GSAP ── */
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
  });

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);


  /* ── Count-up helper ── */
  function countUp(el) {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    if (isNaN(target)) return;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate() { el.textContent = obj.v.toFixed(decimals) + suffix; },
      onComplete() { el.textContent = target.toFixed(decimals) + suffix; },
    });
  }


  /* ── Hero reveal (GSAP timeline) ── */
  const nlChars = gsap.utils.toArray('#heroMainLine .nl-char');

  function revealHero() {
    gsap.set('#heroMeta',       { opacity: 0, y: -10 });
    gsap.set('#heroTag',        { opacity: 0, y: 10 });
    gsap.set('#heroFirstname',  { opacity: 0, y: 12 });
    gsap.set('#heroMainLine',   { opacity: 1 });
    gsap.set(nlChars,           { yPercent: 118, opacity: 0, rotate: 2.5 });
    gsap.set('#heroTagline',    { opacity: 0, y: 18 });
    gsap.set('#heroCtas',       { opacity: 0, y: 14 });
    gsap.set('#heroSocial',     { opacity: 0 });
    gsap.set('#heroCardTilt',   { opacity: 0, x: 40, rotateY: -9 });
    gsap.set('#heroRail',       { opacity: 0, y: 10 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to('#heroMeta',      { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
      .to('#heroTag',       { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.45')
      .to('#heroFirstname', { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.4')
      // the name — letter by letter
      .to(nlChars, {
        yPercent: 0, opacity: 1, rotate: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.055,
        onComplete() {
          // drop the inline transform so the CSS :hover lift can take over
          gsap.set(nlChars, { clearProps: 'transform,willChange' });
        },
      }, '-=0.3')
      .to('#heroTagline',  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.85')
      .to('#heroCtas',     { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.5')
      .to('#heroSocial',   { opacity: 1,       duration: 0.5, ease: 'power2.out' }, '-=0.35')
      .to('#heroCardTilt', {
        opacity: 1, x: 0, rotateY: 0,
        duration: 1.15, ease: 'power3.out',
        onStart() { document.querySelectorAll('.hvc-stat-val[data-count]').forEach(countUp); },
      }, '-=1.05')
      .to('#heroRail',     { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.6')
      .add(() => { initHeroExit(); ScrollTrigger.refresh(); });
  }


  /* ── bfcache restore — browser back button from work pages ──
     When the user navigates back, the browser restores the page
     from bfcache with the page-transition overlay still at scaleX:1
     (full cover) and all GSAP states frozen. pageshow fires with
     e.persisted=true; re-sweep the overlay and replay hero reveal. */
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;              // normal load — already handled above
    document.body.classList.remove('is-loading');
    document.getElementById('preloader')?.classList.add('hidden');

    if (pageOverlay) {
      gsap.killTweensOf(pageOverlay);
      pageOverlay.style.pointerEvents = 'auto';
      gsap.set(pageOverlay, { transformOrigin: 'right center', scaleX: 1 });
      gsap.to(pageOverlay, {
        scaleX: 0,
        duration: 0.85,
        ease: 'expo.inOut',
        delay: 0.05,
        onComplete: () => { pageOverlay.style.pointerEvents = 'none'; }
      });
    }

    revealHero();
    ScrollTrigger.refresh();
  });


  /* ── Hero constellation — drifting nodes that link to each other
        and reach for the cursor. Repels under the pointer. ── */
  const canvas   = document.getElementById('heroParticles');
  const heroEl   = document.getElementById('hero');
  const lowMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && heroEl) {
    const ctx = canvas.getContext('2d');
    const LINK_D  = 128;   // node ↔ node link radius
    const MOUSE_D = 200;   // cursor influence radius
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    let nodes = [];
    let running = true;
    let rafId = null;
    const mouse = { x: -9999, y: -9999, on: false };

    function nodeCount() {
      if (W < 640) return 26;
      return Math.round(Math.min(96, Math.max(34, (W * H) / 17000)));
    }

    function build() {
      nodes = [];
      const n = nodeCount();
      for (let i = 0; i < n; i++) {
        nodes.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          vx: (Math.random() - 0.5) * 0.26,
          vy: (Math.random() - 0.5) * 0.26,
          r:  Math.random() * 1.35 + 0.65,
        });
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    heroEl.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = true;
    }, { passive: true });

    heroEl.addEventListener('mouseleave', () => {
      mouse.on = false;
      mouse.x = mouse.y = -9999;
    }, { passive: true });

    function frame() {
      rafId = null;
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      // ── move ──
      for (const p of nodes) {
        p.x += p.vx;
        p.y += p.vy;

        // gentle repulsion from the cursor
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_D * MOUSE_D && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = (1 - d / MOUSE_D) * 0.9;
            p.x += (dx / d) * push;
            p.y += (dy / d) * push;
          }
        }

        // wrap at the edges
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      }

      // ── node ↔ node links ──
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_D * LINK_D) continue;
          const t = 1 - Math.sqrt(d2) / LINK_D;
          ctx.strokeStyle = `rgba(232,39,26,${(t * 0.20).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // ── cursor links — brighter, the interactive payoff ──
      if (mouse.on) {
        for (const p of nodes) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > MOUSE_D * MOUSE_D) continue;
          const t = 1 - Math.sqrt(d2) / MOUSE_D;
          ctx.strokeStyle = `rgba(232,39,26,${(t * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      }

      // ── nodes ──
      for (const p of nodes) {
        let boost = 0;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MOUSE_D) boost = 1 - d / MOUSE_D;
        }
        const a = 0.42 + boost * 0.5;
        const r = p.r + boost * 1.1;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        g.addColorStop(0, `rgba(232,39,26,${(a * 0.28).toFixed(3)})`);
        g.addColorStop(1, 'rgba(232,39,26,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,120,105,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(frame);
    }

    function start() { if (!rafId && running) rafId = requestAnimationFrame(frame); }

    resize();
    let rTimer;
    window.addEventListener('resize', () => {
      clearTimeout(rTimer);
      rTimer = setTimeout(resize, 160);
    }, { passive: true });

    if (lowMotion) {
      // draw one static frame, then stop
      running = true; frame(); running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      start();
      // pause the loop whenever the hero is off-screen
      new IntersectionObserver(entries => {
        running = entries[0].isIntersecting;
        if (running) start();
        else if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }, { threshold: 0 }).observe(heroEl);
    }
  }


  /* ── Live Chennai clock (IST, independent of viewer's timezone) ── */
  const clockEl = document.getElementById('heroClock');
  if (clockEl) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const tickClock = () => { clockEl.textContent = fmt.format(new Date()) + ' IST'; };
    tickClock();
    setInterval(tickClock, 1000);
  }


  /* ── Rotating role words ── */
  const roleItems = gsap.utils.toArray('#heroRoles .hero-role-item');
  if (roleItems.length > 1 && !lowMotion) {
    let ri = 0;
    setInterval(() => {
      const cur  = roleItems[ri];
      ri = (ri + 1) % roleItems.length;
      const next = roleItems[ri];

      cur.classList.remove('is-active');
      cur.classList.add('is-out');
      next.classList.remove('is-out');
      // force a reflow so the transition runs from the "below" position
      void next.offsetWidth;
      next.classList.add('is-active');

      setTimeout(() => cur.classList.remove('is-out'), 700);
    }, 2800);
  }


  /* ── Hero card: 3D tilt ── */
  const cardTilt  = document.getElementById('heroCardTilt');
  const cardInner = document.getElementById('heroVisualCard');

  if (cardTilt && cardInner && !lowMotion) {
    let hovering = false;

    cardTilt.addEventListener('mouseenter', () => { hovering = true; });

    cardTilt.addEventListener('mousemove', e => {
      if (!hovering) return;
      const r  = cardTilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 → 1
      const py = (e.clientY - r.top)  / r.height;

      gsap.to(cardInner, {
        rotateY: (px - 0.5) * 15,
        rotateX: (0.5 - py) * 13,
        scale: 1.02,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1100,
      });
    }, { passive: true });

    cardTilt.addEventListener('mouseleave', () => {
      hovering = false;
      gsap.to(cardInner, {
        rotateX: 0, rotateY: 0, scale: 1,
        duration: 0.9, ease: 'elastic.out(1, 0.62)',
      });
    });
  }


  /* ── Magnetic buttons ── */
  if (!lowMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width  / 2) * 0.28,
          y: (e.clientY - r.top  - r.height / 2) * 0.42,
          duration: 0.4, ease: 'power2.out',
        });
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }


  /* ── Hero: subtle counter-parallax on the name + card ── */
  if (heroEl && !lowMotion && window.innerWidth > 1080) {
    heroEl.addEventListener('mousemove', e => {
      const cx = (e.clientX / window.innerWidth  - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      gsap.to('#heroName', { x: cx * -22, y: cy * -12, duration: 1.1, ease: 'power2.out' });
    }, { passive: true });
  }


  /* ── Hero exit: content recedes as you scroll past it.
        Built only AFTER the reveal finishes — a scrub tween created while the
        elements are still at opacity:0 would latch onto that 0 and pin them
        there, overriding the reveal. ── */
  let heroExitTweens = [];
  function initHeroExit() {
    if (!heroEl || lowMotion) return;
    heroExitTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
    heroExitTweens = [
      gsap.fromTo('.hero-split',
        { y: 0, opacity: 1, scale: 1 },
        {
          y: -70, opacity: 0.15, scale: 0.97, ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        }),
      gsap.fromTo(['#heroMeta', '#heroRail'],
        { opacity: 1 },
        {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: '38% top', scrub: 0.4 },
        }),
    ];
  }


  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.classList.remove('is-loading');
    setTimeout(revealHero, 120);
  }, 1550);


  /* ── About manifesto reveal ── */
  ScrollTrigger.create({
    trigger: '.about-manifesto',
    start: 'top 82%',
    onEnter() {
      gsap.from('.about-manifesto-text .manifesto-line', {
        yPercent: 40,
        opacity: 0,
        stagger: 0.14,
        duration: 1.0,
        ease: 'power3.out',
      });
    },
    once: true,
  });


  /* ── Hero name is static — no tilt ── */


  /* ── Navbar + hero corners visibility ── */
  const navbar   = document.getElementById('navbar');
  const heroSect = document.getElementById('hero');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    if (heroSect) {
      const heroBelowFold = window.scrollY > heroSect.offsetHeight - 80;
      document.body.classList.toggle('hero-passed', heroBelowFold);
    }
  }, { passive: true });


  /* ── Scroll indicator ── */
  const scrollIndicator = document.getElementById('scrollIndicator');
  window.addEventListener('scroll', () => {
    scrollIndicator.classList.toggle('hidden', window.scrollY > 200);
  }, { passive: true });


  /* ── Theme toggle ── */
  const themeToggle = document.getElementById('themeToggle');
  const html        = document.documentElement;
  const toggleLabel = themeToggle.querySelector('.toggle-label'); // may be null
  const toggleIcon  = themeToggle.querySelector('.toggle-icon');

  // Sync icon to current theme on load
  (function syncToggle() {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (toggleLabel) toggleLabel.textContent = isDark ? 'LIGHT' : 'DARK';
    toggleIcon.textContent = isDark ? '◐' : '◑';
  })();

  themeToggle.addEventListener('click', () => {
    const dark = html.getAttribute('data-theme') === 'dark';
    const next = dark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (toggleLabel) toggleLabel.textContent = dark ? 'DARK' : 'LIGHT';
    toggleIcon.textContent = dark ? '◑' : '◐';
  });


  /* ── Scroll Reveals ── */
  const revealEls = document.querySelectorAll(
    '.project-card, .more-work, .about-grid, .contact-cta, .contact-footer, footer'
  );

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal', 'in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });

  revealEls.forEach(el => { el.classList.add('reveal'); obs.observe(el); });

  // Section heading reveals — GSAP ScrollTrigger (synced with Lenis)
  document.querySelectorAll('.section-heading').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 0 105% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      }
    );
  });

  document.querySelectorAll('.section-eyebrow').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 10, duration: 0.55, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  document.querySelectorAll('.section-divider').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.18,
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      }
    );
  });


  /* ── Smooth anchors (via Lenis) ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const t = document.querySelector(href);
      if (t) {
        e.preventDefault();
        lenis.scrollTo(t, { offset: -80, duration: 1.4 });
        // Lenis only scrolls — move focus too, or a keyboard user carries on
        // tabbing from the top of the document instead of the target.
        if (a.classList.contains('skip-link')) t.focus({ preventScroll: true });
      }
    });
  });


  /* ── Marquee pause on hover ── */
  document.querySelectorAll('.marquee-track').forEach(t => {
    t.addEventListener('mouseenter', () => t.style.animationPlayState = 'paused',  { passive: true });
    t.addEventListener('mouseleave', () => t.style.animationPlayState = 'running', { passive: true });
  });


  /* ── Magnetic Contact CTA ── */
  const cta = document.querySelector('.contact-cta');
  if (cta) {
    cta.addEventListener('mousemove', e => {
      const r  = cta.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.05;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.05;
      cta.style.transform = `translate(${dx}px,${dy}px)`;
    }, { passive: true });

    cta.addEventListener('mouseenter', () => {
      cta.style.transition = 'transform 0.07s linear, letter-spacing 0.38s cubic-bezier(0.16,1,0.3,1)';
    });

    cta.addEventListener('mouseleave', () => {
      cta.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), letter-spacing 0.38s cubic-bezier(0.16,1,0.3,1)';
      cta.style.transform  = 'translate(0,0)';
    });
  }


  /* ── Card hover lift (no tilt) ── */
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { translateY: -4, duration: 0.28, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { translateY: 0, duration: 0.55, ease: 'power3.out' });
    });
  });




  /* ── Page transition on project card click ── */
  if (pageOverlay) {
    document.querySelectorAll('.project-card').forEach(card => {
      const match = card.getAttribute('onclick')?.match(/location\.href='(.+?)'/);
      if (!match) return;
      const href = match[1];
      card.setAttribute('onclick', '');          // disable inline handler
      card.addEventListener('click', e => {
        if (e.target.closest('.project-link-arrow')) {
          e.stopPropagation();
          gsap.set(pageOverlay, { transformOrigin: 'left center' });
          gsap.to(pageOverlay, {
            scaleX: 1, duration: 0.55, ease: 'expo.in',
            onComplete: () => { window.location.href = href; }
          });
          return;
        }
        e.preventDefault();
        gsap.set(pageOverlay, { transformOrigin: 'left center' });
        gsap.to(pageOverlay, {
          scaleX: 1, duration: 0.55, ease: 'expo.in',
          onComplete: () => { window.location.href = href; }
        });
      }, true);
    });
  }


  /* ── Hero parallax on scroll ── */
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    gsap.to(heroInner, {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }


});

