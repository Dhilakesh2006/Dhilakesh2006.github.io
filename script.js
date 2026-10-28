/* =========================================================
   DHILAKESH B — PORTFOLIO SCRIPT  (v3)

   Table of contents
    1. Helpers and feature checks
    2. Entrance: fonts ready -> html.is-loaded, intro delays
    3. Text splitting (hero letters, heading words)
    4. Grid lines: + marks at the intersections
    5. Scroll: nav state, progress bar, hero parallax
    6. Full-screen menu
    7. Active section (scroll spy) + sliding nav underline
    8. Scroll reveal + animated counters
    9. Marquee (duplicate items for a seamless loop)
   10. Card spotlight (injected glow layer)
   11. 3D tilt on cards
   12. Buttons: magnetic pull + liquid-fill entry point
   13. Hero mouse parallax
   14. Custom cursor (with labels)
   15. Contact form (front-end only)

   Performance rules:
   - Pointer events only store numbers; the DOM is written inside
     requestAnimationFrame and only transform-type properties change.
   - Animation loops stop themselves once everything has settled.
   - Mouse-only effects are skipped on touch devices and when the user
     prefers reduced motion.
   ========================================================= */
(() => {
  'use strict';

  /* -------------------------------------------------------
     1. HELPERS AND FEATURE CHECKS
     ------------------------------------------------------- */
  const $  = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp  = (a, b, t) => a + (b - a) * t;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canUseMouseFx = finePointer && !reduceMotion;

  const yearNow = String(new Date().getFullYear());
  ['#year', '#heroYear'].forEach((sel) => {
    const el = $(sel);
    if (el) el.textContent = yearNow;
  });


  /* -------------------------------------------------------
     2. ENTRANCE
     Each [data-intro="n"] element gets a delay of n * 110ms. Once fonts are
     ready (or after a short timeout, whichever is first) <html> gets
     "is-loaded" and CSS plays the staged entrance.
     ------------------------------------------------------- */
  $$('[data-intro]').forEach((el) => {
    const n = parseFloat(el.dataset.intro) || 0;
    el.style.setProperty('--d', Math.round(n * 110) + 'ms');
  });

  const startIntro = () => {
    if (!root.classList.contains('is-loaded')) root.classList.add('is-loaded');
  };
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 1200))])
    .then(() => requestAnimationFrame(() => requestAnimationFrame(startIntro)));


  /* -------------------------------------------------------
     3. TEXT SPLITTING
     [data-chars]  -> every letter in its own span (hero name)
     [data-words]  -> every word wrapped in a mask (section titles)
     CSS then slides them up from below their mask.
     ------------------------------------------------------- */
  $$('[data-chars]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    Array.from(text).forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--ci', i);
      span.textContent = ch;
      el.appendChild(span);
    });
  });

  $$('[data-words]').forEach((el) => {
    // Section titles: measure the word so very long ones (EXPERIENCE,
    // CERTIFICATIONS) can scale to fit one line (see .section-head.long in CSS)
    if (el.classList.contains('sh-title')) {
      const first = el.firstChild;
      const letters = (first && first.nodeType === Node.TEXT_NODE ? first.textContent : el.textContent).trim().length;
      el.style.setProperty('--len', letters);
      if (letters > 8 && el.parentElement) el.parentElement.classList.add('long');
    }

    let index = 0;
    const wrap = (node) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--wi', index++);
      inner.appendChild(node);
      outer.appendChild(inner);
      return outer;
    };

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else frag.appendChild(wrap(document.createTextNode(part)));
        });
        el.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        el.replaceChild(wrap(node.cloneNode(true)), node);   // e.g. <sup>(07)</sup>
      }
    });
  });


  /* -------------------------------------------------------
     4. GRID LINES
     The hairlines are CSS; the little + marks at the 4 x 4 intersections
     are added here (and pop in with a stagger).
     ------------------------------------------------------- */
  $$('[data-lines]').forEach((box) => {
    let n = 0;
    for (let y = 0; y <= 3; y++) {
      for (let x = 0; x <= 3; x++) {
        const mark = document.createElement('b');
        mark.style.setProperty('--gx', x);
        mark.style.setProperty('--gy', y);
        mark.style.setProperty('--bi', n++);
        box.appendChild(mark);
      }
    }
  });


  /* -------------------------------------------------------
     5. SCROLL: NAV STATE, PROGRESS BAR, HERO PARALLAX
     One passive listener, work batched into a single frame.
     ------------------------------------------------------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const heroPanel = $('#heroPanel');
  let scrollQueued = false;

  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      nav.classList.toggle('scrolled', y > 40);
      progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
      // The portrait drifts down slowly while the page scrolls past the hero
      if (heroPanel && !reduceMotion && y < window.innerHeight * 1.4) {
        heroPanel.style.setProperty('--sy', (y * 0.09).toFixed(1));
      }
      scrollQueued = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* -------------------------------------------------------
     6. FULL-SCREEN MENU
     ------------------------------------------------------- */
  const burger = $('#burger');
  const menu = $('#menu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setMenu(false);
      burger.focus();
    }
  });


  /* -------------------------------------------------------
     7. ACTIVE SECTION + SLIDING NAV UNDERLINE
     The underline is one element moved with translateX/scaleX.
     Sections without a link in the slim top bar (experience, coding,
     certifications) simply hide it; the menu still marks them.
     ------------------------------------------------------- */
  const topLinks = $$('#navLinks a');
  const menuLinks = $$('#menuNav a');
  const navBar = $('#navBar');

  function placeBar(link) {
    if (!navBar) return;
    if (!link || !link.offsetWidth) {
      navBar.style.setProperty('--bs', '0');
      return;
    }
    navBar.style.setProperty('--bx', (link.offsetLeft + 16) + 'px');
    navBar.style.setProperty('--bs', ((link.offsetWidth - 32) / 100).toFixed(3));
  }

  function setActive(id) {
    let activeTop = null;
    topLinks.forEach((link) => {
      const on = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', on);
      if (on) { link.setAttribute('aria-current', 'true'); activeTop = link; }
      else link.removeAttribute('aria-current');
    });
    menuLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + id));
    placeBar(activeTop);
  }

  const spiedSections = menuLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    // A thin band across the middle of the viewport decides the active section
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spiedSections.forEach((section) => spy.observe(section));
  }

  const refreshBar = () => placeBar($('#navLinks a.active'));
  window.addEventListener('resize', refreshBar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshBar);
  setActive('home');


  /* -------------------------------------------------------
     8. SCROLL REVEAL + ANIMATED COUNTERS
     Stagger: each child of a group gets a --i index that CSS turns
     into a small transition delay.
     ------------------------------------------------------- */
  $$('.bento, .stats').forEach((group) => {
    $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--i', i));
  });

  function animateCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!isFinite(target) || reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const revealTargets = $$('.reveal, [data-words]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        $$('[data-count]', entry.target).forEach(animateCount);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    // Very old browsers: just show everything
    revealTargets.forEach((el) => el.classList.add('in'));
    $$('[data-count]').forEach(animateCount);
  }


  /* -------------------------------------------------------
     9. MARQUEE
     Clone the items once so translating by -50% loops seamlessly.
     ------------------------------------------------------- */
  const track = $('.marquee-track');
  if (track) {
    Array.from(track.children).forEach((item) => track.appendChild(item.cloneNode(true)));
  }


  /* -------------------------------------------------------
     10. CARD SPOTLIGHT
     Adds a soft glow layer to every .card. Tilt (below) moves it with
     the cursor. Opt out with data-no-glow.
     ------------------------------------------------------- */
  $$('.card').forEach((card) => {
    if (card.hasAttribute('data-no-glow')) return;
    const fx = document.createElement('span');
    fx.className = 'card-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<span class="card-glow"></span>';
    card.prepend(fx);
  });


  /* -------------------------------------------------------
     11. 3D TILT
     Rotation follows the cursor inside the element. Strength per element:
     data-tilt-max="2.5" (degrees). The rectangle is measured once on
     pointerenter, so moving the mouse never forces layout.
     ------------------------------------------------------- */
  if (canUseMouseFx) {
    $$('.tilt').forEach((el) => {
      const max = parseFloat(el.dataset.tiltMax) || 3;
      const glow = $('.card-glow', el);
      let box = null;
      let frame = 0;
      let rotX = 0, rotY = 0, glowX = 0, glowY = 0;

      const paint = () => {
        frame = 0;
        el.style.transform =
          `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
        if (glow) glow.style.transform = `translate3d(${glowX.toFixed(1)}px, ${glowY.toFixed(1)}px, 0)`;
      };

      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        box = { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
        el.classList.add('is-tilting');
      });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || !box) return;
        const x = e.clientX + window.scrollX - box.x;
        const y = e.clientY + window.scrollY - box.y;
        const px = clamp(x / box.w, 0, 1) - 0.5;
        const py = clamp(y / box.h, 0, 1) - 0.5;
        rotY = px * max * 2;
        rotX = -py * max * 2;
        glowX = x - 190;                            // half of the 380px glow
        glowY = y - 190;
        if (!frame) frame = requestAnimationFrame(paint);
      });

      el.addEventListener('pointerleave', () => {
        box = null;
        el.classList.remove('is-tilting');
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        el.style.transform = '';   // CSS transition eases it back to flat
      });
    });
  }


  /* -------------------------------------------------------
     12. BUTTONS
     a) Liquid fill: on pointerenter/leave we tell CSS exactly where the
        cursor crossed the edge (--fx/--fy) so the fill grows from there.
     b) Magnetic pull: buttons with class "magnetic" drift toward the
        cursor when it is near, then spring back (one shared loop).
     ------------------------------------------------------- */
  $$('.btn').forEach((btn) => {
    const setOrigin = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--fx', (e.clientX - r.left).toFixed(0) + 'px');
      btn.style.setProperty('--fy', (e.clientY - r.top).toFixed(0) + 'px');
    };
    btn.addEventListener('pointerenter', setOrigin);
    btn.addEventListener('pointerleave', setOrigin);
  });

  if (canUseMouseFx) {
    const magnets = $$('.magnetic').map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));
    const mouse = { x: -9999, y: -9999 };
    let running = false;

    const loop = () => {
      let moving = false;
      magnets.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        // Centre without the current offset, so the button doesn't chase itself
        const cx = r.left + r.width / 2 - m.x;
        const cy = r.top + r.height / 2 - m.y;
        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const reach = Math.max(r.width, r.height) * 0.7 + 34;

        if (Math.hypot(dx, dy) < reach) { m.tx = dx * 0.3; m.ty = dy * 0.3; }
        else { m.tx = 0; m.ty = 0; }

        m.x = lerp(m.x, m.tx, 0.18);
        m.y = lerp(m.y, m.ty, 0.18);
        if (Math.abs(m.x - m.tx) > 0.05 || Math.abs(m.y - m.ty) > 0.05) moving = true;
        else { m.x = m.tx; m.y = m.ty; }

        m.el.style.transform = `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`;
      });
      if (moving) requestAnimationFrame(loop);
      else running = false;
    };

    const kick = () => {
      if (!running) { running = true; requestAnimationFrame(loop); }
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      kick();
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
      kick();
    });
  }


  /* -------------------------------------------------------
     13. HERO MOUSE PARALLAX
     Writes two CSS variables (--mx, --my in -1..1) on the hero panel.
     The ghost name, portrait and cards use them in their transforms, each
     at a different depth. Eases back to centre when the cursor leaves.
     ------------------------------------------------------- */
  if (canUseMouseFx && heroPanel) {
    let frame = 0;
    let tx = 0, ty = 0;

    const apply = () => {
      frame = 0;
      heroPanel.style.setProperty('--mx', tx.toFixed(3));
      heroPanel.style.setProperty('--my', ty.toFixed(3));
    };

    heroPanel.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = heroPanel.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      if (!frame) frame = requestAnimationFrame(apply);
    });
    heroPanel.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    });
  }


  /* -------------------------------------------------------
     14. CUSTOM CURSOR
     A dot that follows exactly and a ring that trails behind.
     State classes are put on <html> and styled in style.css:
       cursor-link     over links and buttons
       cursor-card     over tilt cards
       cursor-labelled over [data-cursor-label] elements (ring shows the text)
       cursor-text     over form fields (custom cursor hides)
       cursor-down     while the mouse button is held
     ------------------------------------------------------- */
  if (canUseMouseFx) {
    root.classList.add('has-cursor');

    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    const labelEl = $('.cursor-label');
    const LINK_SELECTOR = 'a, button, [role="button"], label, summary';
    const TEXT_SELECTOR = 'input, textarea, select';

    let mx = -100, my = -100;   // real pointer position
    let rx = -100, ry = -100;   // ring position (eased)
    let shown = false;
    let running = false;

    const frame = () => {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      if (Math.abs(rx - mx) > 0.1 || Math.abs(ry - my) > 0.1) requestAnimationFrame(frame);
      else running = false;
    };

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        rx = mx;
        ry = my;
        root.classList.add('cursor-on');
      }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });

    document.addEventListener('pointerover', (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const labelled = target.closest('[data-cursor-label]');
      const isText = !!target.closest(TEXT_SELECTOR);
      const isLink = !isText && !labelled && !!target.closest(LINK_SELECTOR);
      const isCard = !isText && !isLink && !labelled && !!target.closest('.tilt');
      if (labelled) labelEl.textContent = labelled.dataset.cursorLabel;
      root.classList.toggle('cursor-labelled', !!labelled);
      root.classList.toggle('cursor-text', isText);
      root.classList.toggle('cursor-link', isLink);
      root.classList.toggle('cursor-card', isCard);
    });

    window.addEventListener('pointerdown', () => root.classList.add('cursor-down'));
    window.addEventListener('pointerup', () => root.classList.remove('cursor-down'));
    document.addEventListener('mouseleave', () => root.classList.remove('cursor-on'));
    document.addEventListener('mouseenter', () => { if (shown) root.classList.add('cursor-on'); });
  }


  /* -------------------------------------------------------
     15. CONTACT FORM (front-end only)
     No backend: validates, then opens the visitor's email app with the
     message filled in. To send from the page itself later, replace the
     mailto block below with a fetch() call to an email service
     (EmailJS, Formspree, your own API...).
     ------------------------------------------------------- */
  const form = $('#contactForm');
  const statusEl = $('#formStatus');
  const MY_EMAIL = 'dhilakesh5@gmail.com';

  if (form) {
    $$('input, textarea', form).forEach((field) => {
      field.addEventListener('input', () => field.classList.remove('invalid'));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      form.elements.name.classList.toggle('invalid', !name);
      form.elements.email.classList.toggle('invalid', !emailOk);
      form.elements.message.classList.toggle('invalid', !message);

      if (!name || !emailOk || !message) {
        statusEl.textContent = 'Please fill in your name, a valid email and a message.';
        return;
      }

      const subject = encodeURIComponent('Portfolio enquiry from ' + name);
      const body = encodeURIComponent(message + '\n\n' + name + '\n' + email);
      statusEl.textContent = 'Opening your email app. If nothing opens, write to ' + MY_EMAIL + ' directly.';
      window.location.href = `mailto:${MY_EMAIL}?subject=${subject}&body=${body}`;
    });
  }
})();
