"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function Home() {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;

    // Theme setup
    const getCurTheme = () => {
      return (
        root.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    };

    try {
      const sv = localStorage.getItem("rg-theme");
      if (sv === "dark" || sv === "light") {
        root.dataset.theme = sv;
      } else {
        root.dataset.theme = getCurTheme();
      }
    } catch {
      root.dataset.theme = getCurTheme();
    }

    const handleThemeToggle = () => {
      root.classList.add("tt");
      const next = getCurTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("rg-theme", next);
      } catch {}
      setTimeout(() => {
        root.classList.remove("tt");
      }, 700);
    };

    const themeButtons = document.querySelectorAll("[data-t]");
    themeButtons.forEach((b) => {
      b.addEventListener("click", handleThemeToggle);
    });

    // Clock setup
    const updateClock = () => {
      let t = "--:--";
      try {
        t = new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date());
      } catch {}
      document.querySelectorAll(".clk").forEach((n) => {
        n.textContent = t;
      });
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 30000);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const pre = document.getElementById("pre");
      if (pre) pre.remove();
      return () => {
        clearInterval(clockInterval);
        themeButtons.forEach((b) => b.removeEventListener("click", handleThemeToggle));
      };
    }

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    const hd = document.getElementById("hd");
    let lenis = null;

    // Smooth scroll with Lenis
    try {
      lenis = new Lenis({
        lerp: 0.09,
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const onTicker = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(onTicker);
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    } catch (err) {
      console.warn("Lenis init error:", err);
    }

    // Anchor links smooth scroll
    const handleAnchorClick = (e) => {
      const a = e.currentTarget;
      const h = a.getAttribute("href");
      if (!h || !h.startsWith("#")) return;
      const target = h === "#top" ? 0 : document.querySelector(h);
      if (target === null) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.5 });
      } else {
        window.scrollTo({
          top: target === 0 ? 0 : target.offsetTop,
          behavior: "smooth",
        });
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick));

    // ScrollTrigger: Header shrink & Top bar progress
    const headerTrigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        if (hd) hd.classList.toggle("sm", s.scroll() > 60);
      },
    });

    const barAnim = gsap.to("#bar", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        scrub: 0.3,
        start: 0,
        end: "max",
      },
    });

    // Blur-in reveals
    const reveals = [];
    document.querySelectorAll("[data-rv]").forEach((el) => {
      reveals.push(
        gsap.from(el, {
          y: 40,
          opacity: 0,
          filter: "blur(10px)",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        })
      );
    });

    // Work rows reveal
    document.querySelectorAll(".row").forEach((el) => {
      reveals.push(
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
        })
      );
    });

    // Process section
    const psAnim = gsap.from(".ps", {
      y: 50,
      opacity: 0,
      filter: "blur(8px)",
      duration: 1.2,
      ease: "expo.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".proc", start: "top 85%", once: true },
    });

    const plineAnim = gsap.to(".pline", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".proc",
        start: "top 80%",
        end: "bottom 70%",
        scrub: true,
      },
    });

    // About section word reveal
    const ab = document.getElementById("ab");
    let aboutAnim = null;
    if (ab) {
      ab.innerHTML = ab.textContent
        .trim()
        .split(/\s+/)
        .map((w) => `<span class="wd">${w}</span>`)
        .join(" ");

      aboutAnim = gsap.fromTo(
        ab.querySelectorAll(".wd"),
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
        }
      );
    }

    // Offer price animation
    const po = { v: 0 };
    const pn = document.getElementById("pn");
    const offerTrigger = ScrollTrigger.create({
      trigger: ".price",
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(po, {
          v: 2000,
          duration: 1.8,
          ease: "expo.out",
          onUpdate: () => {
            if (pn) pn.textContent = Math.round(po.v).toLocaleString("en-US");
          },
        });
      },
    });

    const offerMainAnim = gsap.from(".of .main > :not(.price)", {
      y: 30,
      opacity: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".of h3", start: "top 90%" },
    });

    const barScaleAnim = gsap.from(".bar > div", {
      scaleX: 0,
      duration: 1.3,
      ease: "expo.inOut",
      stagger: 0.15,
      scrollTrigger: { trigger: ".bar", start: "top 92%" },
    });

    // Contact reveals
    const contactTitleAnim = gsap.from(".ct h2 .ln > span", {
      yPercent: 110,
      duration: 1.3,
      ease: "expo.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".ct h2", start: "top 82%" },
    });

    const contactMailAnim = gsap.from(".mail", {
      opacity: 0,
      y: 20,
      duration: 1,
      delay: 0.3,
      scrollTrigger: { trigger: ".ct h2", start: "top 82%" },
    });

    // Hero scroll-out
    const heroScrollAnim = gsap.to(".ht", {
      y: -50,
      opacity: 0,
      filter: "blur(10px)",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "40% top",
        scrub: true,
      },
    });

    // Hero stage tilt & chips parallax
    const st = document.getElementById("stage");
    const win = document.querySelector(".win");
    const chipElements = Array.from(document.querySelectorAll(".chip"));
    const chips = chipElements.map((c) => ({
      x: gsap.quickTo(c, "x", { duration: 1.2, ease: "power3" }),
      y: gsap.quickTo(c, "y", { duration: 1.2, ease: "power3" }),
      d: Number(c.dataset.d) || 0,
    }));

    if (win) {
      gsap.set(win, { xPercent: -50, transformPerspective: 1000 });
    }
    const ry = win ? gsap.quickTo(win, "rotationY", { duration: 1.1, ease: "power3" }) : null;
    const rx = win ? gsap.quickTo(win, "rotationX", { duration: 1.1, ease: "power3" }) : null;

    const handlePointerMoveStage = (e) => {
      if (!st) return;
      const r = st.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (ry) ry(x * 12);
      if (rx) rx(-y * 9);
      chips.forEach((c) => {
        c.x(x * c.d);
        c.y(y * c.d);
      });
    };

    const handlePointerLeaveStage = () => {
      if (ry) ry(0);
      if (rx) rx(0);
      chips.forEach((c) => {
        c.x(0);
        c.y(0);
      });
    };

    if (st) {
      st.addEventListener("pointermove", handlePointerMoveStage);
      st.addEventListener("pointerleave", handlePointerLeaveStage);
    }

    // Custom Cursor & Work Preview Card
    let cleanupCursor = () => {};
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const cr = document.getElementById("cur");
      let cx = 0,
        cy = 0,
        tx = 0,
        ty = 0,
        seen = false;
      let rafId = null;

      const onPointerMove = (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!seen && cr) {
          seen = true;
          cx = tx;
          cy = ty;
          cr.style.opacity = "1";
        }
      };

      const followLoop = () => {
        cx += (tx - cx) * 0.16;
        cy += (ty - cy) * 0.16;
        if (cr) {
          cr.style.transform = `translate3d(${cx}px,${cy}px,0)`;
        }
        rafId = requestAnimationFrame(followLoop);
      };
      rafId = requestAnimationFrame(followLoop);

      const onPointerOver = (e) => {
        if (cr) {
          cr.classList.toggle(
            "big",
            !!e.target.closest("a,button") && !e.target.closest(".row")
          );
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerover", onPointerOver);

      // Work preview card hover logic
      const pv = document.getElementById("pv");
      const layers = document.querySelectorAll("#pv > div");
      const px = pv ? gsap.quickTo(pv, "x", { duration: 0.7, ease: "power3" }) : null;
      const py = pv ? gsap.quickTo(pv, "y", { duration: 0.7, ease: "power3" }) : null;
      const ls = document.getElementById("ls");

      const onLsPointerMove = (e) => {
        if (px && py && pv) {
          px(e.clientX + 34);
          py(e.clientY - pv.offsetHeight / 2);
        }
      };

      const rows = document.querySelectorAll(".row");
      const rowEnterHandlers = [];
      rows.forEach((r) => {
        const handler = () => {
          layers.forEach((l, i) => {
            l.classList.toggle("on", i === Number(r.dataset.i));
          });
        };
        r.addEventListener("pointerenter", handler);
        rowEnterHandlers.push({ el: r, handler });
      });

      const onLsEnter = () => {
        if (pv) {
          gsap.to(pv, {
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0% round 22px)",
            duration: 0.8,
            ease: "expo.out",
          });
        }
      };

      const onLsLeave = () => {
        if (pv) {
          gsap.to(pv, {
            opacity: 0,
            clipPath: "inset(12% 12% 12% 12% round 22px)",
            duration: 0.5,
            ease: "power3.in",
          });
        }
      };

      if (ls) {
        ls.addEventListener("pointermove", onLsPointerMove);
        ls.addEventListener("pointerenter", onLsEnter);
        ls.addEventListener("pointerleave", onLsLeave);
      }

      cleanupCursor = () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerover", onPointerOver);
        if (ls) {
          ls.removeEventListener("pointermove", onLsPointerMove);
          ls.removeEventListener("pointerenter", onLsEnter);
          ls.removeEventListener("pointerleave", onLsLeave);
        }
        rowEnterHandlers.forEach(({ el, handler }) => {
          el.removeEventListener("pointerenter", handler);
        });
      };
    }

    // Intro Entrance Animation
    gsap.set(".hero h1 .ln > span", { yPercent: 112 });
    gsap.set(".eb, .lead, .hbtn, .logos", { opacity: 0, y: 28, filter: "blur(10px)" });
    if (st) gsap.set(st, { opacity: 0, y: 90, scale: 0.94, filter: "blur(14px)" });
    if (win) gsap.set(win, { opacity: 0, y: 60, scale: 0.9 });
    gsap.set(".chip", { opacity: 0, scale: 0.5 });
    if (hd) gsap.set(hd, { opacity: 0, y: -30 });

    const c = { v: 0 };
    const cnt = document.getElementById("cnt");
    const introTl = gsap.timeline();

    introTl
      .to("#pl", { scaleX: 1, duration: 1, ease: "power2.inOut" })
      .to(
        c,
        {
          v: 100,
          duration: 1,
          ease: "power2.inOut",
          onUpdate: () => {
            if (cnt) cnt.textContent = Math.round(c.v);
          },
        },
        0
      )
      .to("#pre", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "+=0.1")
      .to(".eb", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out" }, "-=0.5")
      .to(".hero h1 .ln > span", { yPercent: 0, duration: 1.4, ease: "expo.out" }, "-=0.9")
      .to(
        ".lead, .hbtn",
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", stagger: 0.1 },
        "-=1.0"
      )
      .to(
        st,
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.6, ease: "expo.out" },
        "-=1.0"
      )
      .to(win, { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "expo.out" }, "-=1.2")
      .to(
        ".chip",
        { opacity: 1, scale: 1, duration: 1.3, ease: "back.out(1.7)", stagger: 0.12 },
        "-=1.0"
      )
      .to(".logos", { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "expo.out" }, "-=1.0")
      .to(hd, { opacity: 1, y: 0, duration: 1, ease: "expo.out" }, "-=1.4")
      .set("#pre", { display: "none" })
      .call(() => {
        ScrollTrigger.refresh();
      });

    ScrollTrigger.refresh();

    // Cleanup on unmount
    return () => {
      clearInterval(clockInterval);
      themeButtons.forEach((b) => b.removeEventListener("click", handleThemeToggle));
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick));
      if (st) {
        st.removeEventListener("pointermove", handlePointerMoveStage);
        st.removeEventListener("pointerleave", handlePointerLeaveStage);
      }
      cleanupCursor();
      introTl.kill();
      headerTrigger.kill();
      barAnim.kill();
      reveals.forEach((r) => r.kill());
      psAnim.kill();
      plineAnim.kill();
      if (aboutAnim) aboutAnim.kill();
      offerTrigger.kill();
      offerMainAnim.kill();
      barScaleAnim.kill();
      contactTitleAnim.kill();
      contactMailAnim.kill();
      heroScrollAnim.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Top scroll progress bar */}
      <div id="bar"></div>

      {/* Custom smooth cursor ring */}
      <div id="cur"></div>

      {/* Preloader */}
      <div id="pre">
        <div>
          <span className="mono">
            <span>Ritesh Ghodela</span>
            <span id="cnt">0</span>
          </span>
          <div className="hl" id="pl"></div>
        </div>
      </div>

      {/* Navigation Header */}
      <header id="hd">
        <div className="nav glass">
          <a href="#top" className="logo">
            Ritesh Ghodela
          </a>
          <nav className="links">
            <a href="#work">Work</a>
            <a href="#process">Process</a>
            <a href="#offer">Offer</a>
            <a href="#contact">Contact</a>
          </nav>
          <span className="vs"></span>
          <button className="tgl" data-t aria-label="Toggle light and dark theme">
            <svg className="ic-moon" viewBox="0 0 24 24">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            <svg className="ic-sun" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>
          <a href="#contact" className="cta">
            Start a project
          </a>
        </div>
      </header>

      {/* Frame Container */}
      <div className="frame" id="top">
        <main>
          {/* Hero Section */}
          <div className="hero pad">
            <div className="ht">
              <span className="eb glass">
                <i></i>Frontend development · Websites &amp; web apps
              </span>
              <h1>
                <span className="ln">
                  <span>Websites built to turn visitors into customers.</span>
                </span>
              </h1>
              <p className="lead">
                I design and build fast, animated websites for founders and businesses — from the
                first idea to a polished, live launch.
              </p>
              <div className="hbtn">
                <a className="btn" href="#contact">
                  Start a project
                </a>
                <a className="btn g" href="#work">
                  View selected work
                </a>
              </div>
            </div>

            <div className="stage" id="stage">
              <div className="orb a"></div>
              <div className="orb b"></div>
              <div className="win glass">
                <div className="wbar">
                  <i></i>
                  <i></i>
                  <i></i>
                  <span>yourbrand.com</span>
                </div>
                <div className="wb">
                  <div className="t">
                    Your product,
                    <br />
                    clearly explained.
                  </div>
                  <div className="sk"></div>
                  <div className="sk s"></div>
                  <span className="p"></span>
                  <div className="cds">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
              <div className="chip c1" data-d="26">
                <div className="fl glass">Next.js · React</div>
              </div>
              <div className="chip c2" data-d="-34">
                <div className="fl glass">Smooth motion</div>
              </div>
              <div className="chip c3" data-d="40">
                <div className="fl glass">24-hour feedback</div>
              </div>
              <div className="chip c4" data-d="-22">
                <div className="fl glass">Live previews</div>
              </div>
            </div>

            <div className="logos">
              <span className="mono" style={{ alignSelf: "center" }}>
                Selected projects
              </span>
              <span>GadgetGyan</span>
              <span>Horloge</span>
              <span>SolowebHQ</span>
              <span>ContentAI Studio</span>
            </div>
          </div>

          {/* About Section */}
          <section className="sec pad" id="about">
            <div className="row2">
              <div className="lab mono">(About)</div>
              <p className="ab" id="ab">
                I’m Ritesh, a self-taught frontend developer from Mandsaur, India. After three
                years working through an agency, I now design and build websites and web apps on my
                own — quick to load, considered in the details, and animated only where it helps.
              </p>
            </div>
            <div className="facts">
              <div className="fact" data-rv>
                <span className="mono">Websites</span>
                <p>Landing pages and marketing sites that explain the product fast.</p>
                <span className="t">Responsive, SEO-ready, built to load quickly.</span>
              </div>
              <div className="fact" data-rv>
                <span className="mono">Web apps</span>
                <p>Dashboards, tools and SaaS MVPs, end to end.</p>
                <span className="t">React, Next.js, Node.js, MongoDB.</span>
              </div>
              <div className="fact" data-rv>
                <span className="mono">Motion</span>
                <p>Interaction that guides attention instead of decorating.</p>
                <span className="t">GSAP, smooth scroll, reduced-motion safe.</span>
              </div>
            </div>
          </section>

          {/* Selected Work Section */}
          <section className="sec pad" id="work">
            <div className="sh" data-rv>
              <div>
                <span className="mono">(Selected work)</span>
                <h2 className="h2">The work, in context</h2>
              </div>
              <p>Products I designed, built and shipped myself.</p>
            </div>
            <div className="list" id="ls">
              <a
                className="row"
                href="https://gadgetgyan.shop"
                target="_blank"
                rel="noopener noreferrer"
                data-i="0"
              >
                <span className="mono">01</span>
                <span className="nm">GadgetGyan</span>
                <span className="mono ds">Micro-SaaS · Next.js</span>
                <span className="ar">↗</span>
              </a>
              <a className="row" href="#contact" data-i="1">
                <span className="mono">02</span>
                <span className="nm">Horloge</span>
                <span className="mono ds">Productivity suite · React</span>
                <span className="ar">→</span>
              </a>
              <a
                className="row"
                href="https://solowebhq.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                data-i="2"
              >
                <span className="mono">03</span>
                <span className="nm">SolowebHQ</span>
                <span className="mono ds">Studio site · GSAP</span>
                <span className="ar">↗</span>
              </a>
              <a className="row" href="#contact" data-i="3">
                <span className="mono">04</span>
                <span className="nm">ContentAI Studio</span>
                <span className="mono ds">AI app · Next.js</span>
                <span className="ar">→</span>
              </a>
            </div>
          </section>

          {/* Work Floating Preview Card */}
          <div id="pv" aria-hidden="true">
            <div className="p1">
              <span>GadgetGyan</span>
            </div>
            <div className="p2">
              <span>Horloge</span>
            </div>
            <div className="p3">
              <span>SolowebHQ</span>
            </div>
            <div className="p4">
              <span>ContentAI Studio</span>
            </div>
          </div>

          {/* Process Section */}
          <section className="sec pad" id="process">
            <div className="sh" data-rv>
              <div>
                <span className="mono">(Process)</span>
                <h2 className="h2">Simple, fast, transparent</h2>
              </div>
              <p>Short feedback loops, real previews and no surprises from first call to launch.</p>
            </div>
            <div className="proc">
              <div className="pline"></div>
              <div className="ps">
                <span className="bd glass">01</span>
                <div>
                  <h3>Discover</h3>
                  <p>
                    We agree the goal, audience and scope. I research and collect references into a
                    clear direction.
                  </p>
                </div>
              </div>
              <div className="ps">
                <span className="bd glass">02</span>
                <div>
                  <h3>Design</h3>
                  <p>
                    I propose a few design directions, and we choose one together before wider
                    production begins.
                  </p>
                </div>
              </div>
              <div className="ps">
                <span className="bd glass">03</span>
                <div>
                  <h3>Build</h3>
                  <p>
                    Built in Next.js with live Vercel previews and a 24-hour feedback loop on every
                    round.
                  </p>
                </div>
              </div>
              <div className="ps">
                <span className="bd glass">04</span>
                <div>
                  <h3>Launch</h3>
                  <p>
                    Tested, optimized and deployed — with the files and guidance you need to run it
                    afterward.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Offer Section */}
          <section className="sec pad" id="offer">
            <div className="of">
              <div className="lab mono">(The offer)</div>
              <div className="main">
                <p className="price">
                  <sup>$</sup>
                  <span id="pn">2,000</span>
                </p>
                <h3>One fixed-price website build.</h3>
                <p className="sub">
                  A custom-designed, fully built and launched website for a single fixed fee. No
                  hourly billing, no surprises.
                </p>
                <div className="inc">
                  <div>
                    <span className="mono">01</span>
                    <b>Research &amp; direction</b>
                    <span>Goals, audience, references and a clear creative direction.</span>
                  </div>
                  <div>
                    <span className="mono">02</span>
                    <b>Custom design &amp; build</b>
                    <span>Responsive, built in Next.js, up to 5 pages.</span>
                  </div>
                  <div>
                    <span className="mono">03</span>
                    <b>Motion &amp; interaction</b>
                    <span>Smooth scroll and purposeful animation, nothing gratuitous.</span>
                  </div>
                  <div>
                    <span className="mono">04</span>
                    <b>Live previews</b>
                    <span>Vercel previews throughout, with a 24-hour feedback loop.</span>
                  </div>
                  <div>
                    <span className="mono">05</span>
                    <b>Launch &amp; handover</b>
                    <span>Deployment, source files and guidance for your team.</span>
                  </div>
                </div>
                <div className="pay">
                  <span className="mono">(Payment)</span>
                  <div className="bar">
                    <div className="a40">
                      <span className="mono">40% advance</span>
                      <b>$800</b>
                    </div>
                    <div className="a60">
                      <span className="mono">60% on delivery</span>
                      <b>$1,200</b>
                    </div>
                  </div>
                </div>
                <a
                  className="btn"
                  href="mailto:riteshghodela52@gmail.com?subject=Website%20build%20(%242%2C000)&body=Hi%20Ritesh%2C%0A%0AI%E2%80%99d%20like%20to%20start%20a%20project.%20Here%E2%80%99s%20a%20bit%20about%20my%20business%20and%20goals%3A%0A"
                >
                  Start with the $800 advance →
                </a>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="sec pad ct" id="contact">
            <div className="mono" style={{ marginBottom: "28px" }}>
              (Contact)
            </div>
            <h2>
              <span className="ln">
                <span>Have a project</span>
              </span>
              <span className="ln">
                <span className="m">in mind?</span>
              </span>
            </h2>
            <a className="mail" href="mailto:riteshghodela52@gmail.com">
              riteshghodela52@gmail.com
            </a>
          </section>
        </main>

        {/* Footer */}
        <footer className="pad mono">
          <span>© 2026 Ritesh Ghodela</span>
          <span>
            Mandsaur, India — <span className="clk">--:--</span> IST
          </span>
          <button data-t>Light / Dark</button>
          <a href="#top">Top ↑</a>
        </footer>
      </div>
    </div>
  );
}
