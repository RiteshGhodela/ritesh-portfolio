(function () {
  var $ = function (s, c) {
      return (c || document).querySelector(s);
    },
    $$ = function (s, c) {
      return [].slice.call((c || document).querySelectorAll(s));
    },
    root = document.documentElement;
  function cur() {
    return (
      root.dataset.theme ||
      (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light")
    );
  }
  try {
    var sv = localStorage.getItem("rg-theme");
    if (sv === "dark" || sv === "light") root.dataset.theme = sv;
  } catch (e) {}
  root.dataset.theme = cur();
  function loadBg(c) {
    var e = $(".bg." + c);
    if (e && e.dataset.src && !e.style.backgroundImage)
      e.style.backgroundImage = "url(" + e.dataset.src + ")";
  }
  loadBg(cur() === "dark" ? "d" : "l");
  (
    window.requestIdleCallback ||
    function (f) {
      setTimeout(f, 2500);
    }
  )(function () {
    loadBg("l");
    loadBg("d");
  });
  $$("[data-t]").forEach(function (b) {
    b.onclick = function () {
      root.classList.add("tt");
      var n = cur() === "dark" ? "light" : "dark";
      root.dataset.theme = n;
      loadBg(n === "dark" ? "d" : "l");
      try {
        localStorage.setItem("rg-theme", n);
      } catch (e) {}
      setTimeout(function () {
        root.classList.remove("tt");
      }, 700);
    };
  });
  function tick() {
    var t = "--:--";
    try {
      t = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(new Date());
    } catch (e) {}
    $$(".clk").forEach(function (n) {
      n.textContent = t;
    });
  }
  tick();
  setInterval(tick, 30000);
  /* fit footer wordmark to width */
  var wm = $("#wm"),
    wms = $("span", wm);
  function fit() {
    wm.style.fontSize = "100px";
    var cs = getComputedStyle(wm),
      pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight),
      w = wms.getBoundingClientRect().width;
    wm.style.fontSize = (100 * (wm.clientWidth - pad)) / w + "px";
  }
  fit();
  addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var mp = null;
  try {
    mp = localStorage.getItem("rg-motion");
  } catch (e) {}
  var osReduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var reduce = mp === "on" ? false : mp === "off" ? true : osReduce;
  var mt = $("#mt");
  if (mt) {
    mt.textContent = "Motion: " + (reduce ? "Off" : "On");
    mt.onclick = function () {
      try {
        localStorage.setItem("rg-motion", reduce ? "on" : "off");
      } catch (e) {}
      location.reload();
    };
  }
  if (osReduce && mp === null) {
    var seenT = null;
    try {
      seenT = localStorage.getItem("rg-motion-seen");
    } catch (e) {}
    if (!seenT) {
      var tz = $("#mtoast");
      setTimeout(function () {
        tz.hidden = false;
      }, 900);
      $("#mtOn").onclick = function () {
        try {
          localStorage.setItem("rg-motion", "on");
        } catch (e) {}
        location.reload();
      };
      $("#mtOff").onclick = function () {
        try {
          localStorage.setItem("rg-motion-seen", "1");
        } catch (e) {}
        tz.hidden = true;
      };
    }
  }
  /* smooth fluid trail (plain JS, works even if GSAP is unavailable) */
  if (!reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var cv = $("#ft"),
      cx = cv.getContext("2d"),
      W = 0,
      H = 0,
      D = Math.min(devicePixelRatio || 1, 2);
    function rs() {
      W = innerWidth;
      H = innerHeight;
      cv.width = W * D;
      cv.height = H * D;
      cx.setTransform(D, 0, 0, D, 0, 0);
    }
    rs();
    addEventListener("resize", rs);
    var mx = 0,
      my = 0,
      hx = 0,
      hy = 0,
      vx = 0,
      vy = 0,
      rx = 0,
      ry = 0,
      seen = false,
      pts = [],
      sp = [],
      rp = [],
      ringR = 0,
      ringT = 0,
      spd = 0,
      blob = 10,
      run = false,
      lastMove = 0,
      ACC = "255,90,31",
      NP = 46;
    function kick() {
      if (!run) {
        run = true;
        requestAnimationFrame(frame);
      }
    }
    addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var dx = e.clientX - mx,
        dy = e.clientY - my;
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        seen = true;
        hx = rx = mx;
        hy = ry = my;
        vx = vy = 0;
        pts = [];
      }
      spd = Math.min(60, Math.sqrt(dx * dx + dy * dy));
      lastMove = performance.now();
      ringT = e.target.closest && e.target.closest("a,button,summary") ? 30 : 0;
      kick();
    });
    addEventListener("pointerdown", function (e) {
      rp.push({ x: e.clientX, y: e.clientY, r: 6, a: 1 });
      kick();
    });
    document.documentElement.addEventListener("pointerleave", function () {
      ringT = 0;
      lastMove = 0;
      kick();
    });
    function frame(t) {
      cx.clearRect(0, 0, W, H);
      var moving = t - lastMove < 110,
        i,
        k,
        p,
        a,
        b,
        c;
      /* spring-damped head for a silky follow */
      vx = (vx + (mx - hx) * 0.2) * 0.64;
      vy = (vy + (my - hy) * 0.2) * 0.64;
      hx += vx;
      hy += vy;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      spd *= 0.94;
      if (seen) {
        pts.push({ x: hx, y: hy });
        if (pts.length > NP) pts.shift();
        if (!moving && pts.length) pts.shift();
      }
      var n = pts.length,
        boost = 0.7 + (Math.min(spd, 40) / 40) * 0.9;
      if (n > 3) {
        cx.lineCap = "round";
        cx.lineJoin = "round";
        var passes = [
          [26, 0.1, ACC],
          [13, 0.22, ACC],
          [3.6, 0.95, "255,238,225"],
        ];
        for (var q = 0; q < 3; q++) {
          var ps = passes[q];
          for (i = 2; i < n; i++) {
            k = Math.pow(i / n, 1.5);
            a = pts[i - 2];
            b = pts[i - 1];
            c = pts[i];
            cx.strokeStyle =
              "rgba(" + ps[2] + "," + ps[1] * (0.25 + 0.75 * k) + ")";
            cx.lineWidth = ps[0] * k * boost;
            cx.beginPath();
            cx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
            cx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
            cx.stroke();
          }
        }
        blob += (9 + Math.min(spd, 50) * 0.28 - blob) * 0.14;
        var g = cx.createRadialGradient(hx, hy, 0, hx, hy, blob * 2.2);
        g.addColorStop(0, "rgba(255,246,238,.95)");
        g.addColorStop(0.35, "rgba(" + ACC + ",.55)");
        g.addColorStop(1, "rgba(" + ACC + ",0)");
        cx.fillStyle = g;
        cx.beginPath();
        cx.arc(hx, hy, blob * 2.2, 0, 6.283);
        cx.fill();
      }
      if (moving && spd > 20 && seen) {
        sp.push({
          x: hx + (Math.random() - 0.5) * 10,
          y: hy + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4 - 0.25,
          l: 1,
          s: 1.2 + Math.random() * 2,
        });
      }
      for (i = sp.length - 1; i >= 0; i--) {
        p = sp[i];
        p.l -= 0.02;
        if (p.l <= 0) {
          sp.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        cx.fillStyle = "rgba(" + ACC + "," + p.l * 0.9 + ")";
        cx.beginPath();
        cx.arc(p.x, p.y, p.s * p.l + 0.3, 0, 6.283);
        cx.fill();
      }
      for (i = rp.length - 1; i >= 0; i--) {
        p = rp[i];
        p.r += (84 - p.r) * 0.08;
        p.a -= 0.024;
        if (p.a <= 0) {
          rp.splice(i, 1);
          continue;
        }
        cx.strokeStyle = "rgba(" + ACC + "," + p.a + ")";
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 6.283);
        cx.stroke();
      }
      ringR += (ringT - ringR) * 0.18;
      if (ringR > 1.5 && seen) {
        cx.fillStyle = "rgba(" + ACC + ",.12)";
        cx.strokeStyle = "rgba(" + ACC + ",.9)";
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.arc(rx, ry, ringR, 0, 6.283);
        cx.fill();
        cx.stroke();
      }
      if (
        !moving &&
        n < 2 &&
        !sp.length &&
        !rp.length &&
        ringR < 1.5 &&
        ringT === 0
      ) {
        run = false;
        cx.clearRect(0, 0, W, H);
        return;
      }
      requestAnimationFrame(frame);
    }
  }
  if (!window.gsap || reduce) {
    $("#pre").remove();
    return;
  }
  gsap.registerPlugin.apply(
    gsap,
    [
      window.ScrollTrigger,
      window.ScrollSmoother,
      window.SplitText,
      window.DrawSVGPlugin,
    ].filter(Boolean),
  );
  var hd = $("#hd");
  var smoother = null;
  if (window.ScrollSmoother) {
    try {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.6,
        effects: true,
        smoothTouch: 0.1,
      });
    } catch (e) {
      smoother = null;
    }
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var h = a.getAttribute("href"),
        t = h === "#top" ? 0 : $(h);
      if (t === null) return;
      e.preventDefault();
      if (smoother)
        smoother.scrollTo(t, true, t === 0 ? undefined : "top 90px");
      else
        window.scrollTo({
          top: t === 0 ? 0 : t.offsetTop,
          behavior: "smooth",
        });
    });
  });
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (s) {
      hd.classList.toggle("sm", s.scroll() > 60);
    },
  });
  gsap.to("#bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { scrub: 0.3, start: 0, end: "max" },
  });
  $$("[data-rv]").forEach(function (el) {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 92%" },
    });
  });
  $$(".row").forEach(function (el) {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 94%" },
    });
  });
  gsap.from(".ps", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: "expo.out",
    stagger: 0.12,
    scrollTrigger: { trigger: ".proc", start: "top 85%" },
  });
  gsap.to(".pline", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".proc",
      start: "top 80%",
      end: "bottom 70%",
      scrub: true,
    },
  });
  var ab = $("#ab");
  ab.innerHTML = ab.textContent
    .split(" ")
    .map(function (w) {
      return '<span class="wd">' + w + "</span>";
    })
    .join(" ");
  gsap.fromTo(
    $$(".wd", ab),
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.12,
      scrollTrigger: {
        trigger: ab,
        start: "top 82%",
        end: "bottom 52%",
        scrub: true,
      },
    },
  );
  var po = { v: 0 },
    pn = $("#pn");
  ScrollTrigger.create({
    trigger: ".price",
    start: "top 88%",
    once: true,
    onEnter: function () {
      gsap.to(po, {
        v: 2000,
        duration: 1.8,
        ease: "expo.out",
        onUpdate: function () {
          pn.textContent = Math.round(po.v).toLocaleString("en-US");
        },
      });
    },
  });
  gsap.from(".of .main>:not(.price)", {
    y: 30,
    opacity: 0,
    duration: 1.1,
    ease: "expo.out",
    stagger: 0.1,
    scrollTrigger: { trigger: ".of h3", start: "top 90%" },
  });
  gsap.from(".bar>div", {
    scaleX: 0,
    duration: 1.3,
    ease: "expo.inOut",
    stagger: 0.15,
    scrollTrigger: { trigger: ".bar", start: "top 92%" },
  });
  gsap.from(".cg h2 .ln>span", {
    yPercent: 110,
    duration: 1.3,
    ease: "expo.out",
    stagger: 0.12,
    scrollTrigger: { trigger: ".cg", start: "top 80%" },
  });
  gsap.from(wms, {
    yPercent: 60,
    opacity: 0,
    duration: 1.6,
    ease: "expo.out",
    scrollTrigger: { trigger: wm, start: "top 100%" },
  });
  /* hero: parallax + scroll-out */
  var hero = $("#hero"),
    bgs = $("#bgs");
  gsap.to(bgs, {
    yPercent: 8,
    scale: 1.04,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
  gsap.to(".hc", {
    y: -60,
    opacity: 0,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "60% top",
      scrub: true,
    },
  });
  /* image mouse trail */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    var sx = 0,
      sy = 0,
      tx2 = 0,
      ty2 = 0,
      sOn = false;
    gsap.ticker.add(function () {
      if (!sOn) return;
      sx += (tx2 - sx) * 0.12;
      sy += (ty2 - sy) * 0.12;
      hero.style.setProperty("--sx", sx + "px");
      hero.style.setProperty("--sy", sy + "px");
    });
    var T = $$(".tr"),
      ti = 0,
      lx = null,
      ly = null,
      rbgx = gsap.quickTo(bgs, "x", { duration: 1.4, ease: "power3" }),
      rbgy = gsap.quickTo(bgs, "y", { duration: 1.4, ease: "power3" });
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(),
        x = e.clientX - r.left,
        y = e.clientY - r.top;
      rbgx((x / r.width - 0.5) * -26);
      rbgy((y / r.height - 0.5) * -18);
      tx2 = x;
      ty2 = y;
      if (!sOn) {
        sx = x;
        sy = y;
        sOn = true;
        hero.classList.add("lit");
      }
      if (lx === null) {
        lx = x;
        ly = y;
        return;
      }
      var dx = x - lx,
        dy = y - ly,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < 120) return;
      var el = T[ti++ % T.length],
        w = el.offsetWidth,
        h = el.offsetHeight,
        nx = dx / d,
        ny = dy / d;
      lx = x;
      ly = y;
      gsap.killTweensOf(el);
      gsap.set(el, {
        x: x - w / 2,
        y: y - h / 2,
        rotation: gsap.utils.random(-10, 10),
        scale: 0.55,
        opacity: 0,
        zIndex: ti,
      });
      gsap
        .timeline()
        .to(el, {
          opacity: 1,
          scale: 1,
          x: x - w / 2 + nx * 34,
          y: y - h / 2 + ny * 34,
          duration: 0.7,
          ease: "expo.out",
        })
        .to(
          el,
          {
            opacity: 0,
            scale: 0.8,
            x: x - w / 2 + nx * 92,
            y: y - h / 2 + ny * 92,
            duration: 0.9,
            ease: "power2.in",
          },
          "+=.28",
        );
    });
    hero.addEventListener("pointerleave", function () {
      lx = null;
      ly = null;
      rbgx(0);
      rbgy(0);
      hero.classList.remove("lit");
      sOn = false;
    });
  }
  /* work previews */
  var fine2 = matchMedia("(hover:hover) and (pointer:fine)").matches;
  $$(".shots").forEach(function (s) {
    var d = $(".dk", s),
      im = $("img", s);
    gsap.from(d, {
      y: 90,
      opacity: 0,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: { trigger: s, start: "top 90%" },
    });
    gsap.fromTo(
      im,
      { yPercent: -3.5, scale: 1.07 },
      {
        yPercent: 3.5,
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
    if (fine2) {
      s.addEventListener("pointermove", function (e) {
        var r = s.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(d, {
          rotationY: x * 4,
          rotationX: -y * 3,
          transformPerspective: 1400,
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
      s.addEventListener("pointerleave", function () {
        gsap.to(d, {
          rotationY: 0,
          rotationX: 0,
          duration: 1.1,
          ease: "expo.out",
          overwrite: "auto",
        });
      });
    }
  });
  /* section transitions */
  $$("main > section.sec").forEach(function (sec, i, all) {
    var line;
    if (window.DrawSVGPlugin) {
      line = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      line.setAttribute("class", "sl");
      line.setAttribute("preserveAspectRatio", "none");
      line.setAttribute("viewBox", "0 0 100 2");
      line.innerHTML =
        '<path d="M0 1H100" vector-effect="non-scaling-stroke"/>';
      sec.insertBefore(line, sec.firstChild);
      gsap.fromTo(
        $("path", line),
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1.8,
          ease: "expo.inOut",
          scrollTrigger: { trigger: sec, start: "top 85%" },
        },
      );
    } else {
      line = document.createElement("i");
      line.className = "sl";
      sec.insertBefore(line, sec.firstChild);
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: "0 50%",
        duration: 1.6,
        ease: "expo.inOut",
        scrollTrigger: { trigger: sec, start: "top 85%" },
      });
    }
    gsap.fromTo(
      sec,
      { y: 60 },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top 105%",
          end: "top 60%",
          scrub: 0.5,
        },
      },
    );
  });
  /* split headings */
  if (window.SplitText) {
    $$(".h2").forEach(function (h) {
      try {
        var sp = SplitText.create(h, { type: "words", mask: "words" });
        gsap.from(sp.words, {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: h, start: "top 88%" },
        });
      } catch (e) {}
    });
  }
  /* intro */
  function mSplit(el) {
    var out = [];
    (function w(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split("").forEach(function (ch) {
            if (ch === " ") {
              f.appendChild(document.createTextNode(" "));
            } else {
              var s = document.createElement("span");
              s.className = "ch";
              s.textContent = ch;
              out.push(s);
              f.appendChild(s);
            }
          });
          c.replaceWith(f);
        } else if (
          c.nodeType === 1 &&
          !c.closest("svg") &&
          c.tagName.toLowerCase() !== "svg"
        )
          w(c);
      });
    })(el);
    return out;
  }
  var h1 = $("#h1"),
    chars = null,
    hasDraw = !!window.DrawSVGPlugin;
  if (window.SplitText) {
    try {
      chars = SplitText.create(h1, {
        type: "words,chars",
        charsClass: "ch",
      }).chars;
    } catch (e) {
      chars = null;
    }
  }
  if (!chars || !chars.length) chars = mSplit(h1);
  gsap.set(chars, {
    yPercent: 115,
    rotationX: -80,
    opacity: 0,
    transformOrigin: "50% 100%",
  });
  if (hasDraw) gsap.set(".scr path,.sq path,.trust li path", { drawSVG: "0%" });
  function arm() {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    var base = [],
      qs = chars.map(function (c) {
        return {
          x: gsap.quickTo(c, "x", { duration: 0.7, ease: "power3" }),
          y: gsap.quickTo(c, "y", { duration: 0.7, ease: "power3" }),
          r: gsap.quickTo(c, "rotation", {
            duration: 0.7,
            ease: "power3",
          }),
        };
      });
    function measure() {
      var hr = hero.getBoundingClientRect();
      base = chars.map(function (c) {
        var r = c.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - hr.left - (gsap.getProperty(c, "x") || 0),
          y: r.top + r.height / 2 - hr.top - (gsap.getProperty(c, "y") || 0),
        };
      });
    }
    measure();
    addEventListener("resize", measure);
    ScrollTrigger.addEventListener("scrollEnd", measure);
    hero.addEventListener("pointermove", function (e) {
      var hr = hero.getBoundingClientRect(),
        mx0 = e.clientX - hr.left,
        my0 = e.clientY - hr.top;
      for (var i = 0; i < chars.length; i++) {
        var dx = base[i].x - mx0,
          dy = base[i].y - my0,
          d = Math.sqrt(dx * dx + dy * dy) || 1,
          f = Math.max(0, 1 - d / 150),
          p = f * f * 46;
        qs[i].x((dx / d) * p);
        qs[i].y((dy / d) * p);
        qs[i].r((dx / d) * f * 14);
      }
    });
    hero.addEventListener("pointerleave", function () {
      qs.forEach(function (q) {
        q.x(0);
        q.y(0);
        q.r(0);
      });
    });
  }
  gsap.set("#hch,#hlead,#hbtn,#hf>*", {
    opacity: 0,
    y: 30,
    filter: "blur(10px)",
  });
  gsap.set(bgs, { scale: 1.16 });
  gsap.set(hd, { opacity: 0, y: -30 });
  var c = { v: 0 },
    tl = gsap.timeline();
  tl.to("#pl", { scaleX: 1, duration: 1, ease: "power2.inOut" })
    .to(
      c,
      {
        v: 100,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: function () {
          $("#cnt").textContent = Math.round(c.v);
        },
      },
      0,
    )
    .to("#pre", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=.1")
    .to(bgs, { scale: 1, duration: 2.2, ease: "expo.out" }, "-=.7")
    .to(
      "#hch",
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        clearProps: "filter",
        duration: 1.1,
        ease: "expo.out",
      },
      "-=1.5",
    )
    .to(
      chars,
      {
        yPercent: 0,
        rotationX: 0,
        opacity: 1,
        duration: 1.5,
        ease: "expo.out",
        stagger: { each: 0.028, from: "start" },
      },
      "-=1.2",
    )
    .to(
      ".sq path",
      { drawSVG: "100%", duration: 1, ease: "power2.inOut" },
      "-=.6",
    )
    .to(
      ".scr path",
      { drawSVG: "100%", duration: 1.3, ease: "power2.inOut" },
      "-=.7",
    )

    .to(
      "#hlead,#hbtn",
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        clearProps: "filter",
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.1,
      },
      "-=1.0",
    )
    .to(
      "#hf>*",
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        clearProps: "filter",
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.12,
      },
      "-=1.0",
    )
    .to(hd, { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, "-=1.5")
    .to(
      ".trust li path",
      {
        drawSVG: "100%",
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.18,
      },
      "-=.6",
    )
    .call(arm)
    .set("#pre", { display: "none" });
  addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
