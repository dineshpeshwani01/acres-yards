/* Acres & Yards — site behaviour (Motion + Lenis, no framework) */
(function () {
  'use strict';

  var root = document.getElementById('page');
  if (!root) { return; }
  var M = window.Motion;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motionOn = !!M && !reduced;
  var ease = [0.22, 1, 0.36, 1];
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }
  function done(anim, fn) {
    if (anim && anim.finished && anim.finished.then) { anim.finished.then(fn, fn); }
    else if (anim && anim.then) { anim.then(fn, fn); }
    else { fn(); }
  }

  /* ---------- hero video: make sure it plays muted inline everywhere ---------- */
  all('video[data-m="video"]').forEach(function (v) {
    v.muted = true; v.loop = true; v.playsInline = true;
    var p = v.play && v.play();
    if (p && p.catch) { p.catch(function () {}); }
  });

  /* ---------- smooth scrolling (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // anchor links (fallback when Lenis anchors are unavailable)
  all('a[href^="#"]', document).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      e.preventDefault();
      if (lenis) { lenis.scrollTo(target, { duration: 1.4 }); }
      else { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- enquiry form → WhatsApp (works on static hosting, no server needed) ---------- */
  var contact = document.getElementById('contact');
  var sendBtn = contact && contact.querySelector('button.btn-copper');
  if (sendBtn) {
    sendBtn.addEventListener('click', function () {
      var lines = ['Hello Acres & Yards, I would like a call back.'];
      all('label.field', contact).forEach(function (lab) {
        var f = lab.querySelector('input, select, textarea');
        if (!f || !f.value.trim()) { return; }
        var name = lab.childNodes[0] && lab.childNodes[0].textContent.trim();
        lines.push(name + ': ' + f.value.trim());
      });
      window.open('https://wa.me/971566786429?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* ---------- tabs: sliding underline + exit/entry ---------- */
  var tablist = root.querySelector('[data-m="tabs"]');
  var ind = root.querySelector('[data-m="tabind"]');
  var wrap = root.querySelector('[data-m="tabwrap"]');
  var tabs = tablist ? all('button[data-tab]', tablist) : [];
  var current = 'offplan';
  var busy = false;

  function placeIndicator(tab, animate) {
    if (!tablist || !ind) { return; }
    var b = tablist.querySelector('button[data-tab="' + tab + '"]');
    if (!b) { return; }
    var x = b.offsetLeft, w = b.offsetWidth;
    if (animate && motionOn) {
      M.animate(ind, { x: x, width: w + 'px' }, { duration: 0.5, ease: [0.65, 0, 0.35, 1] });
    } else {
      ind.style.transform = 'translateX(' + x + 'px)';
      ind.style.width = w + 'px';
    }
  }
  function panel(tab) { return root.querySelector('[data-panel="' + tab + '"]'); }
  function clearInline(p) {
    if (!p) { return; }
    Array.prototype.slice.call(p.children).forEach(function (k) {
      if (k.getAnimations) { k.getAnimations().forEach(function (an) { try { an.cancel(); } catch (e) {} }); }
      k.style.opacity = ''; k.style.transform = ''; k.style.filter = '';
    });
  }
  function setPhase(ph) { wrap.className = 'tabpanel is-' + ph; }
  function selectTab(tab) {
    tabs.forEach(function (b) {
      var on = b.getAttribute('data-tab') === tab;
      b.classList.toggle('tab-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }
  function switchTab(tab) {
    if (tab === current || busy || !wrap) { return; }
    var from = panel(current), to = panel(tab);
    clearInline(from); clearInline(to);
    selectTab(tab);
    placeIndicator(tab, true);
    if (!motionOn) {
      from.hidden = true; to.hidden = false; current = tab; return;
    }
    busy = true;
    setPhase('out');
    setTimeout(function () {
      from.hidden = true;
      setPhase('in');
      to.hidden = false;
      void wrap.offsetHeight;               // commit the "in" start state
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          setPhase('idle');
          current = tab;
          busy = false;
        });
      });
    }, 280);
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
    b.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
      var i = tabs.indexOf(b) + (e.key === 'ArrowRight' ? 1 : -1);
      var next = tabs[(i + tabs.length) % tabs.length];
      next.focus(); switchTab(next.getAttribute('data-tab'));
    });
  });
  placeIndicator(current, false);
  window.addEventListener('resize', function () { placeIndicator(current, false); });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { placeIndicator(current, false); }); }

  /* ---------- motion ---------- */
  if (!motionOn) { return; }

  // hero entrance
  M.animate(all('[data-m="hero"]'), { opacity: [0, 1], y: [32, 0] },
    { duration: 1, delay: M.stagger(0.14, { startDelay: 0.2 }), ease: ease });
  all('video[data-m="video"]').forEach(function (v) {
    M.animate(v, { opacity: [0, 1], scale: [1.12, 1] }, { duration: 2.4, ease: ease });
  });

  // hero parallax
  var bg = root.querySelector('[data-m="heroBg"]');
  var hero = root.querySelector('[data-m="heroSection"]');
  if (bg && hero) {
    M.scroll(M.animate(bg, { y: [0, 180], scale: [1, 1.08] }, { ease: 'linear' }),
      { target: hero, offset: ['start start', 'end start'] });
  }

  // whole-section reveal (light sections open like a card out of the dark backdrop)
  var small = window.innerWidth < 700;
  var clipFrom = small ? 'inset(2.5% 3% 0% 3% round 22px)' : 'inset(5% 4.5% 0% 4.5% round 44px)';
  all('section, footer').forEach(function (sec) {
    var c = (getComputedStyle(sec).backgroundColor.match(/\d+/g) || [255, 255, 255]).map(Number);
    var lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    if (lum >= 0.3) {
      M.scroll(M.animate(sec, { clipPath: [clipFrom, 'inset(0% 0% 0% 0% round 0px)'] }, { ease: 'linear' }),
        { target: sec, offset: ['start end', 'start 0.3'] });
    }
    var inner = sec.querySelector(':scope > .wrap, :scope > .mq-row');
    if (inner && !inner.getAttribute('data-m')) {
      M.scroll(M.animate(inner, { y: [small ? 40 : 80, 0] }, { ease: 'linear' }),
        { target: sec, offset: ['start end', 'start 0.35'] });
    }
  });

  // founder backdrop drift
  var cbg = root.querySelector('[data-m="companyBg"]');
  var csec = document.getElementById('company');
  if (cbg && csec) {
    M.scroll(M.animate(cbg, { y: [-50, 50] }, { ease: 'linear' }),
      { target: csec, offset: ['start end', 'end start'] });
  }

  // hairline drawings draw in on view
  all('svg[data-m="hair"]').forEach(function (svg) {
    var els = all('path, circle, ellipse', svg).filter(function (el) {
      return !el.closest('defs') && !el.getAttribute('data-keep') && !el.getAttribute('fill') && el.getTotalLength;
    });
    var lens = els.map(function (el) {
      var L = el.getTotalLength();
      el.style.strokeDasharray = L; el.style.strokeDashoffset = L; return L;
    });
    M.inView(svg, function () {
      els.forEach(function (el, i) {
        M.animate(el, { strokeDashoffset: [lens[i], 0] }, { duration: 3.2, delay: i * 0.12, ease: [0.65, 0, 0.35, 1] });
      });
    }, { amount: 0.05 });
  });

  // gradient sheen: one pass when it comes into view
  all('.gt-anim').forEach(function (el) {
    M.inView(el, function () { el.classList.add('sheen-on'); }, { amount: 0.6 });
  });

  // block reveals
  all('[data-m="reveal"]').forEach(function (el) {
    el.style.opacity = 0;
    M.inView(el, function () {
      done(M.animate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 1, ease: ease }), function () {
        el.style.transform = '';
      });
    }, { amount: 0.25 });
  });
  all('[data-m="stagger"]').forEach(function (g) {
    var kids = Array.prototype.slice.call(g.children);
    kids.forEach(function (k) { k.style.opacity = 0; });
    M.inView(g, function () {
      done(M.animate(kids, { opacity: [0, 1], y: [44, 0] }, { duration: 0.9, delay: M.stagger(0.12), ease: ease }), function () {
        kids.forEach(function (k) { k.style.transform = ''; k.style.opacity = ''; });
      });
    }, { amount: 0.15 });
  });
})();
