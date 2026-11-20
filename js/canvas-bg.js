/* ENCLAV — tło canvas v2: warstwy węzłów, połączenia, poszukiwacze, fale,
   interakcja myszką. Efekt pochodzi z pliku źródłowego
   /root/enclav/Ideas into experiences-2.html (Packly v2). Plik źródłowy
   nie jest modyfikowany. Ten skrypt jest używany wyłącznie w wariantach
   review canvas-bg.html / canvas-bg-pl.html.

   Bezpieczny fallback:
   - jeśli canvas / JS nie jest dostępny, body nie receives klasę .canvas-ready
     i CSS pokazuje tylko tło radialne fallback;
   - jeśli prefers-reduced-motion: reduce, animacja canvas jest wyłączona —
     węzły i poszukiwacze nie poruszają się, widoczne jest tylko tło radialne.
*/

(function(){
  var cv = document.getElementById('bgCanvas');
  if (!cv) { return; }

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(hover:none) and (pointer:coarse)').matches;
  var x = cv.getContext('2d'), W, H, D, L, gap, layers, nodes, edges, seekers, ripples, seen, nid, acc = 0,
      mouse = { x: -999, y: -999 }, dist = 0, lastP = null;
  var MU = [161, 161, 170], EM = [52, 211, 153], MAX = 14;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function rgba(t, a) {
    return 'rgba(' +
      Math.round(MU[0] + (EM[0] - MU[0]) * t) + ',' +
      Math.round(MU[1] + (EM[1] - MU[1]) * t) + ',' +
      Math.round(MU[2] + (EM[2] - MU[2]) * t) + ',' +
      a + ')';
  }
  function mk(px, py, t, o) {
    var n = {
      hx: px, hy: py, x: px, y: py, t: t, a: 0, ph: rnd(0, 6.28), out: [], inc: 0, id: nid++,
      fade: 1, goal: false, tmp: false, life: 0, dead: false
    };
    for (var k in o) n[k] = o[k];
    nodes.push(n);
    return n;
  }
  function link(a, b, tmp) {
    var k = a.id + '-' + b.id;
    if (seen[k]) return;
    seen[k] = 1;
    var e = {
      a: a, b: b, ph: rnd(0, 6.28), t: (a.t + b.t) / 2, g: tmp ? .9 : 0, h: 0, age: tmp ? 0 : 1,
      tmp: !!tmp, dead: false
    };
    edges.push(e);
    a.out.push(e);
    b.inc++;
  }
  function byY(y) { return function(p, q) { return Math.abs(p.hy - y) - Math.abs(q.hy - y); }; }
  function build() {
    D = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = mobile ? (cv.clientHeight || innerHeight) : innerHeight;
    cv.width = W * D;
    cv.height = H * D;
    x.setTransform(D, 0, 0, D, 0, 0);
    layers = [];
    nodes = [];
    edges = [];
    seekers = [];
    ripples = [];
    seen = {};
    nid = 0;

    L = Math.max(5, Math.min(9, Math.round(W / 150)));
    gap = W * 0.9 / (L - 1);
    var N = Math.max(4, Math.min(8, Math.round(H / 105)));

    for (var i = 0; i < L; i++) {
      var t = i / (L - 1);
      var cnt = Math.max(3, Math.round(N * (.55 + .45 * Math.min(1, t * 1.6))));
      var col = [];
      var px = W * (.05 + .9 * t);
      for (var j = 0; j < cnt; j++) {
        col.push(mk(
          px + rnd(-1, 1) * W * 0.015,
          H * (.12 + .76 * j / (cnt - 1)) + rnd(-1, 1) * H * 0.035,
          t, { li: i, goal: i === L - 1 }
        ));
      }
      layers.push(col);
    }

    for (i = 0; i < L - 1; i++) {
      var A = layers[i], B = layers[i + 1];
      A.forEach(function(a) {
        if (i > 0 && Math.random() < 0.22) return;
        var pool = B.slice().sort(byY(a.hy)).slice(0, 3).sort(function() { return Math.random() - 0.5; });
        var k = 1 + (Math.random() < 0.35 ? 1 : 0);
        for (var m = 0; m < k && m < pool.length; m++) { link(a, pool[m]); }
      });
    }

    for (i = 1; i < L; i++) {
      layers[i].forEach(function(n) {
        if (!n.inc && !n.out.length) {
          var s = layers[i - 1].slice().sort(byY(n.hy));
          link(s[0], n);
        }
      });
    }

    document.body.classList.add('canvas-ready');
  }

  function ctl(e, T) {
    var w = Math.sin(T * 0.9 + e.ph) * 5;
    var m = (e.a.x + e.b.x) / 2;
    return [m, e.a.y + w, m, e.b.y - w];
  }
  function bez(e, u, T) {
    var c = ctl(e, T), i = 1 - u;
    return [
      i * i * i * e.a.x + 3 * i * i * u * c[0] + 3 * i * u * u * c[2] + u * u * u * e.b.x,
      i * i * i * e.a.y + 3 * i * i * u * c[1] + 3 * i * u * u * c[3] + u * u * u * e.b.y
    ];
  }
  function spawn() {
    var l = layers[0].filter(function(n) { return n.out.length; });
    var n = l[Math.floor(Math.random() * l.length)];
    if (!n) return;
    var e = n.out[Math.floor(Math.random() * n.out.length)];
    n.a = 1;
    seekers.push({
      node: n, e: e, p: 0, sp: rnd(0.45, 0.7), path: [e], ph: rnd(0, 6.28),
      fd: 1, dead: false, stuck: false, wait: 0, x: n.x, y: n.y
    });
  }
  function drop(px, py) {
    var tmps = nodes.filter(function(n) { return n.tmp && !n.dead; });
    if (tmps.length > 36) {
      tmps.sort(function(p, q) { return p.life - q.life; });
      tmps[0].life = 0;
    }
    var n = mk(px, py, Math.max(0.05, Math.min(1, px / W)), { tmp: true, life: 14, a: 1 });
    var reach = gap * 1.4, c = [];
    nodes.forEach(function(m) {
      if (m === n || m.dead) return;
      var d = Math.hypot(m.hx - px, m.hy - py);
      if (d < reach && Math.abs(m.hx - px) > 10) c.push({ m: m, d: d });
    });
    c.sort(function(p, q) { return p.d - q.d; });
    var b = 0, f = 0;
    c.forEach(function(o) {
      if (o.m.hx < px && b < 2) { link(o.m, n, true); b++; }
      else if (o.m.hx > px && f < 2) { link(n, o.m, true); f++; }
    });
  }
  function pick(s, n) {
    var o = n.out;
    if (!o.length) return false;
    var c = o.slice().sort(function() { return Math.random() - 0.5; });
    var base = s.path.slice();
    if (c.length > 1 && Math.random() < 0.25 && seekers.length < MAX) {
      seekers.push({
        node: n, e: c[1], p: 0, sp: s.sp * rnd(0.9, 1.1), path: base.concat(c[1]),
        ph: rnd(0, 6.28), fd: 1, dead: false, stuck: false, wait: 0, x: n.x, y: n.y
      });
    }
    s.e = c[0];
    s.p = 0;
    s.path.push(c[0]);
    s.stuck = false;
    return true;
  }
  function step(s, dt, T) {
    if (s.dead) { s.fd -= dt * 2; return s.fd > 0; }
    if (s.stuck) {
      s.x = s.node.x;
      s.y = s.node.y;
      s.wait -= dt;
      if (s.node.dead) { s.dead = true; return true; }
      if (pick(s, s.node)) return true;
      if (s.wait <= 0) s.dead = true;
      return true;
    }
    if (s.e.dead) { s.dead = true; return true; }
    s.p += dt * s.sp;
    s.e.g = Math.max(s.e.g, 0.4);
    var q = bez(s.e, Math.min(1, s.p), T);
    s.x = q[0];
    s.y = q[1];
    if (s.p < 1) return true;
    var to = s.e.b;
    to.a = 1;
    s.node = to;
    if (to.goal) {
      s.path.forEach(function(e) { e.h = 1; e.g = 0; });
      ripples.push({ x: to.x, y: to.y, r: 5, al: 0.9 });
      to.a = 1.6;
      s.dead = true;
      s.x = to.x;
      s.y = to.y;
      console.log('GOAL REACHED detected');

      var title = document.querySelector('.direction--canvas-bg .hero__title span:last-child');
      var contactHeading = document.querySelector('#contact h2');

      if (title && title._flashing !== true) {
        title._flashing = true;
        if (title._origStyle === undefined) title._origStyle = title.style.cssText;
        title.style.cssText = 'color:#ffffff; text-shadow:0 0 12px rgba(255,255,255,1),0 0 28px rgba(52,211,153,1); animation:none;';
        title.classList.add('flash-emerald');
        setTimeout(function() { title.classList.remove('flash-emerald'); }, 400);
      }
      if (contactHeading && contactHeading._flashing !== true) {
        contactHeading._flashing = true;
        if (contactHeading._origStyle === undefined) contactHeading._origStyle = contactHeading.style.cssText;
        contactHeading.style.cssText = 'color:#ffffff; text-shadow:0 0 12px rgba(255,255,255,1),0 0 28px rgba(52,211,153,1); animation:none;';
        contactHeading.classList.add('flash-emerald');
        setTimeout(function() { contactHeading.classList.remove('flash-emerald'); }, 400);
        console.log('contact heading found and flashed');
      } else if (contactHeading) {
        console.log('contact heading already flashing');
      } else {
        console.log('contact heading NOT found');
      }
      document.body.classList.add('goal-reached');

      setTimeout(function() {
        document.body.classList.remove('goal-reached');
        if (title && title._origStyle !== undefined) { title.style.cssText = title._origStyle; title._flashing = false; }
        if (contactHeading && contactHeading._origStyle !== undefined) { contactHeading.style.cssText = contactHeading._origStyle; contactHeading._flashing = false; }
      }, 400);
      return true;
    }
    if (!pick(s, to)) { s.stuck = true; s.wait = 8; }
    return true;
  }
  var last = performance.now(), t0 = last, acc = 0, formShown = false, isTouch = matchMedia('(pointer: coarse)').matches;

  var addPointerMove = !isTouch;

  function showContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) { return; }
    form.style.display = 'block';
    form.style.opacity = 1;
    form.style.visibility = 'visible';
    formShown = true;
    document.body.classList.add('contact-form-open');
    try { form.scrollIntoView({behavior: 'smooth', block: 'start'}); } catch(e) {}
  }

  function hideContactForm() {
    var form = document.getElementById('contact-form');
    if (form) {
      form.style.display = 'none';
      document.body.classList.remove('contact-form-open');
      formShown = false;
    }
  }

  function frame(now) {
    if (reduced) { return; }
    var dt = Math.min(0.05, (now - last) / 1000);
    T = (now - t0) / 1000;
    last = now;
    x.clearRect(0, 0, W, H);
    var dirty = false;

    nodes.forEach(function(n) {
      n.x = n.hx + Math.sin(T * 0.4 + n.ph) * 3;
      n.y = n.hy + Math.cos(T * 0.35 + n.ph) * 3;
      n.a = Math.max(0, n.a - dt * 0.6);
      if (n.tmp) {
        n.life -= dt;
        n.fade = Math.max(0, Math.min(1, n.life / 3));
        if (n.life <= 0) { n.dead = true; dirty = true; }
      }
    });

    if (dirty) {
      edges.forEach(function(e) { if (e.a.dead || e.b.dead) e.dead = true; });
      edges = edges.filter(function(e) { return !e.dead; });
      nodes = nodes.filter(function(n) { return !n.dead; });
      nodes.forEach(function(n) {
        n.out = n.out.filter(function(e) { return !e.dead; });
      });
    }

    edges.forEach(function(e) {
      e.age = Math.min(1, e.age + dt * 1.5);
      var fd = Math.min(e.a.fade, e.b.fade) * e.age;
      var c = ctl(e, T);
      x.beginPath();
      x.moveTo(e.a.x, e.a.y);
      x.bezierCurveTo(c[0], c[1], c[2], c[3], e.b.x, e.b.y);
      x.lineWidth = 1;
      x.strokeStyle = rgba(e.t, (0.1 + e.t * 0.16) * (e.tmp ? 1.7 : 1) * fd);
      x.stroke();
      if (e.g > 0.01) {
        x.strokeStyle = 'rgba(250,250,250,' + (e.g * 0.5 * fd) + ')';
        x.stroke();
        e.g = Math.max(0, e.g - dt * 0.8);
      }
      if (e.h > 0.01) {
        x.strokeStyle = 'rgba(52,211,153,' + ((0.2 + 0.8 * e.h) * fd) + ')';
        x.lineWidth = 1 + 1.6 * e.h;
        x.stroke();
        e.h = Math.max(0, e.h - dt * 0.2);
      }
    });

    nodes.forEach(function(n) {
      var r = 1.8 + n.t * 2.4, f = n.fade;
      if (n.t > 0.8 && !n.tmp) {
        x.strokeStyle = rgba(1, 0.08 + 0.1 * (0.5 + 0.5 * Math.sin(T * 1.3 + n.ph)));
        x.beginPath();
        x.arc(n.x, n.y, r + 5, 0, 6.283);
        x.stroke();
      }
      if (n.a > 0.02) {
        var g = x.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
        g.addColorStop(0, rgba(Math.max(n.t, 0.7), Math.min(1, n.a) * 0.55 * f));
        g.addColorStop(1, rgba(1, 0));
        x.fillStyle = g;
        x.beginPath();
        x.arc(n.x, n.y, 16, 0, 6.283);
        x.fill();
      }
      x.fillStyle = rgba(n.tmp ? Math.max(n.t, 0.5) : n.t, Math.min(1, 0.35 + n.t * 0.5 + n.a * 0.4) * f);
      x.beginPath();
      x.arc(n.x, n.y, r, 0, 6.283);
      x.fill();
    });

    acc += dt;
    if (acc > 1.6 && seekers.length < MAX) { acc = 0; spawn(); }
    seekers = seekers.filter(function(s) { return step(s, dt, T); });

    seekers.forEach(function(s) {
      var k = s.fd * (s.stuck ? 0.55 + 0.35 * Math.sin(T * 3 + s.ph) : 1);
      var r = 4 + Math.sin(T * 5 + s.ph) * 1.2;
      var R = r * 3;
      var g = x.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
      g.addColorStop(0, 'rgba(250,250,250,' + k + ')');
      g.addColorStop(0.3, 'rgba(190,255,230,' + 0.4 * k + ')');
      g.addColorStop(1, 'rgba(52,211,153,0)');
      x.fillStyle = g;
      x.beginPath();
      x.arc(s.x, s.y, R, 0, 6.283);
      x.fill();
    });

    ripples = ripples.filter(function(p) {
      p.r += dt * 60;
      p.al -= dt * 0.7;
      if (p.al <= 0) return false;
      x.strokeStyle = 'rgba(52,211,153,' + p.al + ')';
      x.lineWidth = 1.5;
      x.beginPath();
      x.arc(p.x, p.y, p.r, 0, 6.283);
      x.stroke();
      return true;
    });

    // Okrągły znacznik w tle pod systemową strzałką myszki.
    if (mouse.x > -100) {
      x.strokeStyle = 'rgba(52,211,153,0.22)';
      x.lineWidth = 1;
      x.beginPath();
      x.arc(mouse.x, mouse.y, 12, 0, 6.283);
      x.stroke();
    }

    requestAnimationFrame(frame);
  }

  addEventListener('pointermove', function(e) {
    if (mobile) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (lastP) dist += Math.hypot(e.clientX - lastP.x, e.clientY - lastP.y);
    lastP = { x: e.clientX, y: e.clientY };
    if (dist >= gap * 0.55) { dist = 0; drop(e.clientX, e.clientY); }
  });
  addEventListener('pointerleave', function() {
    mouse.x = mouse.y = -999;
    lastP = null;
  });
  // Sieć odbudowuje się przy zmianie szerokości (obrót telefonu).
  // Zmiany wysokości (pasek adresu na mobile) są ignorowane.
  var lastW = innerWidth;
  addEventListener('resize', function() {
    if (mobile && innerWidth === lastW) return;
    lastW = innerWidth;
    build();
  });

  build();

  var contactBtns = document.querySelectorAll('a.button[href="#contact-note"]');
  contactBtns.forEach(function(contactBtn) {
    contactBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showContactForm();
    });
  });

  var closeBtn = document.querySelector('.contact-form__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideContactForm();
    });
  }

  if (!reduced) {
    requestAnimationFrame(frame);
  }
})();
