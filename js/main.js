/* =========================================================
   NEXA Process: interacciones y animaciones
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Año del pie ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Cabecera al hacer scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  const setMenu = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Enlace activo según la sección ---------- */
  const navAnchors = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navAnchors.forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });

  /* ---------- Aparición al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Contadores ---------- */
  const animateCounter = (el) => {
    const to = Number(el.dataset.to);
    if (reduceMotion || to === 0) { el.textContent = to; return; }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".counter").forEach((el) => counterObserver.observe(el));

  /* ---------- Línea del método ---------- */
  const timelineFill = document.getElementById("timeline-fill");
  if (timelineFill) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting) { timelineFill.style.width = "100%"; obs.disconnect(); }
    }, { threshold: 0.4 }).observe(timelineFill.closest(".timeline"));
  }

  /* ---------- Carrusel de soluciones ----------
     La tarjeta activa queda en el centro y las de los lados se difuminan.
     Avanza solo; al tocar una tarjeta lateral, se coloca en el centro. */
  const track = document.getElementById("carousel-track");
  if (track) {
    const cards = [...track.querySelectorAll(".card")];
    let active = -1;

    const centerOf = (card) => card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    const goTo = (i) => track.scrollTo({ left: centerOf(cards[(i + cards.length) % cards.length]) });

    const updateActive = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      cards.forEach((c, i) => {
        if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i;
      });
      if (best !== active) {
        cards.forEach((c, i) => c.classList.toggle("is-active", i === best));
        active = best;
      }
    };
    let ticking = false;
    track.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateActive(); ticking = false; });
    }, { passive: true });
    window.addEventListener("resize", updateActive);
    // Empieza en la segunda tarjeta para que haya una difuminada a cada lado
    track.style.scrollBehavior = "auto";
    track.scrollLeft = centerOf(cards[1]);
    track.style.scrollBehavior = "";
    updateActive();

    cards.forEach((card, i) => card.addEventListener("click", () => {
      if (i !== active) { goTo(i); restart(); }
    }));

    // Avance automático: se pausa al pasar el ratón, al tocar o si la sección no se ve
    let timer = null;
    let paused = false;
    let inView = false;
    const start = () => {
      if (reduceMotion || timer) return;
      timer = setInterval(() => { if (!paused && inView) goTo(active + 1); }, 3800);
    };
    const restart = () => { clearInterval(timer); timer = null; start(); };
    track.addEventListener("mouseenter", () => { paused = true; });
    track.addEventListener("mouseleave", () => { paused = false; });
    track.addEventListener("touchstart", () => { paused = true; }, { passive: true });
    track.addEventListener("touchend", () => { paused = false; restart(); }, { passive: true });
    new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }, { threshold: 0.4 }).observe(track);
    start();
  }

  /* ---------- Redes sociales aún sin enlace ---------- */
  document.querySelectorAll('.socials a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  /* ---------- Formulario de contacto ----------
     Para recibir los mensajes en tu correo, crea un formulario gratis en https://formspree.io
     y pega aquí su dirección, por ejemplo: "https://formspree.io/f/abcdwxyz" */
  const FORM_ENDPOINT = "";
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    const setStatus = (text, type) => { status.textContent = text; status.className = "form__status is-" + type; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        setStatus("Revisa los campos obligatorios: nombre, email válido, mensaje y la casilla de privacidad.", "error");
        form.querySelector(":invalid").focus();
        return;
      }
      if (!FORM_ENDPOINT) {
        setStatus("El formulario estará activo muy pronto. ¡Gracias por tu interés!", "info");
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus("¡Mensaje enviado! Te responderemos en menos de 24 horas.", "ok");
      } catch (err) {
        setStatus("No se ha podido enviar. Inténtalo de nuevo en unos minutos.", "error");
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- Demo de facturas (hero) ---------- */
  const demo = document.getElementById("demo");
  if (demo) {
    const items = [...document.querySelectorAll("#demo-list li")];
    const status = document.getElementById("demo-status");
    const progress = document.getElementById("demo-progress");
    const count = document.getElementById("demo-count");
    const total = document.getElementById("demo-total");
    const btn = document.getElementById("demo-btn");
    const fmt = { format: (n) => n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") };
    const parse = (s) => Number(s.replace(/[^\d,]/g, "").replace(",", "."));
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const reset = () => {
      items.forEach((li) => {
        li.classList.remove("is-scanning", "is-invoice", "is-other");
        li.querySelector(".tag").textContent = "";
      });
      progress.style.width = "0";
      count.textContent = "0";
      total.textContent = "0,00 €";
      status.textContent = "Analizando bandeja de entrada…";
      btn.classList.remove("is-ready");
    };

    const markItem = (li, state) => {
      const isInvoice = li.dataset.invoice === "1";
      li.classList.add(isInvoice ? "is-invoice" : "is-other");
      li.querySelector(".tag").textContent = isInvoice ? "Factura · " + li.dataset.amount : "Ignorado";
      state.n += isInvoice ? 1 : 0;
      state.sum += isInvoice ? parse(li.dataset.amount) : 0;
      count.textContent = state.n;
      total.textContent = fmt.format(state.sum) + " €";
    };

    const finish = (state) => {
      progress.style.width = "100%";
      status.textContent = "¡Listo! " + state.n + " facturas preparadas";
      btn.classList.add("is-ready");
    };

    if (reduceMotion) {
      const state = { n: 0, sum: 0 };
      items.forEach((li) => markItem(li, state));
      finish(state);
    } else {
      let running = false;
      const run = async () => {
        if (running) return;
        running = true;
        while (true) {
          reset();
          await wait(900);
          const state = { n: 0, sum: 0 };
          for (let i = 0; i < items.length; i++) {
            const li = items[i];
            li.classList.add("is-scanning");
            await wait(650);
            li.classList.remove("is-scanning");
            markItem(li, state);
            progress.style.width = ((i + 1) / items.length) * 100 + "%";
            await wait(250);
          }
          finish(state);
          await wait(4200);
        }
      };
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { run(); obs.disconnect(); }
      }).observe(demo);
    }
  }
})();
