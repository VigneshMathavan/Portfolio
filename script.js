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


  /* ── Hero reveal (GSAP timeline) ── */
  function revealHero() {
    gsap.set('#heroTag',       { opacity: 0, y: 10 });
    gsap.set('#heroFirstname', { opacity: 0 });
    gsap.set('#heroMainLine',  { opacity: 1, yPercent: 0 });

    const tl = gsap.timeline({ delay: 0.1 });

    tl.to('#heroTag',       { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
      .to('#heroFirstname', { opacity: 1,        duration: 0.5, ease: 'power2.out' }, '-=0.4');
  }


  /* ── Hero Particles — top to bottom ── */
  const canvas = document.getElementById('heroParticles');
  if (canvas) {
    const ctx   = canvas.getContext('2d');
    const COUNT = 22;
    let   particles  = [];
    let   animActive = true;

    function resizeCanvas() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function mkParticle(startY) {
      return {
        x:     Math.random() * canvas.width,
        y:     startY !== undefined ? startY : -10,
        r:     Math.random() * 1.8 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        alpha: 0,
      };
    }

    resizeCanvas();
    for (let i = 0; i < COUNT; i++) {
      particles.push(mkParticle(Math.random() * canvas.height));
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      particles.forEach(p => { p.x = Math.random() * canvas.width; });
    }, { passive: true });

    function drawParticles() {
      if (!animActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.y += p.speed;

        // Fade in at top, fade out at bottom
        const prog = p.y / canvas.height;
        let   a;
        if      (prog < 0.12) a = prog / 0.12;
        else if (prog > 0.80) a = (1 - prog) / 0.20;
        else                  a = 1;
        a = Math.max(0, Math.min(1, a)) * 0.72;

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,39,26,${a})`;
        ctx.fill();

        // Soft glow halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(232,39,26,${a * 0.24})`);
        g.addColorStop(1, 'rgba(232,39,26,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Reset when off-screen bottom
        if (p.y > canvas.height + 12) particles[i] = mkParticle();
      });

      requestAnimationFrame(drawParticles);
    }

    drawParticles();

    // Pause when hero scrolls out of view
    new IntersectionObserver(entries => {
      animActive = entries[0].isIntersecting;
      if (animActive) drawParticles();
    }, { threshold: 0 }).observe(document.getElementById('hero'));
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


  /* ── bfcache: sweep overlay out if page is restored from history ── */
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    // Page was restored from back-forward cache — overlay is still covering screen
    if (pageOverlay) {
      pageOverlay.style.pointerEvents = 'auto';
      gsap.set(pageOverlay, { transformOrigin: 'right center', scaleX: 1 });
      gsap.to(pageOverlay, {
        scaleX: 0,
        duration: 0.85,
        ease: 'expo.inOut',
        onComplete: () => { pageOverlay.style.pointerEvents = 'none'; }
      });
    }
    // Ensure preloader is hidden and body is not locked
    const _pre = document.getElementById('preloader');
    if (_pre) _pre.classList.add('hidden');
    document.body.classList.remove('is-loading');
  });


});

