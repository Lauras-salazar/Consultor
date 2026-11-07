/* SOLIS Cloud & Cyber — interacciones del sitio */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* almacenamiento no disponible */ } }
  };

  // Año actual
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  // Menú móvil
  const menuBtn = $("#menuBtn"), links = $("#navLinks");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => links.classList.toggle("open"));
    $$("a", links).forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }

  // Aparición al hacer scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  $$(".reveal").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  // Enlace activo en la navegación
  const sections = $$("main section[id]");
  const navA = $$(".nav-links a");
  window.addEventListener("scroll", () => {
    let cur = "";
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
    navA.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }, { passive: true });

  // Indicador del hero
  const arc = $("#gaugeArc"), num = $("#gaugeNum");
  if (arc && num) {
    const target = 94, C = 389.6;
    setTimeout(() => {
      arc.style.strokeDashoffset = C - (C * target) / 100;
      $$(".bar .fill").forEach(f => (f.style.width = f.dataset.w + "%"));
      let n = 0; const t = setInterval(() => { n += 2; num.textContent = Math.min(n, target) + "%"; if (n >= target) clearInterval(t); }, 30);
    }, 500);
  }

  // Contadores
  const counters = $$("[data-count]");
  const cio = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
      let v = 0; const step = Math.max(1, Math.round(end / 40));
      const t = setInterval(() => { v += step; if (v >= end) { v = end; clearInterval(t); } el.textContent = v + suf; }, 35);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 }) : null;
  counters.forEach(c => cio ? cio.observe(c) : (c.textContent = c.dataset.count + (c.dataset.suffix || "")));

  // Botones de planes -> preseleccionan el servicio en el formulario
  $$("[data-plan]").forEach(b => b.addEventListener("click", () => {
    const sel = $("#servicio"); if (sel) sel.value = b.dataset.plan;
  }));

  // Formulario de contacto
  const form = $("#contactForm");
  if (form) {
    const ok = $("#formSuccess");
    const rules = {
      nombre: v => v.trim().length >= 3,
      correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      telefono: v => v.replace(/\D/g, "").length >= 7,
      servicio: v => v !== "",
      mensaje: v => v.trim().length >= 15
    };
    Object.keys(rules).forEach(id => {
      const el = $("#" + id);
      el.addEventListener("input", () => el.closest(".field").classList.toggle("error", !rules[id](el.value)));
    });
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      let valid = true;
      Object.keys(rules).forEach(id => {
        const el = $("#" + id), good = rules[id](el.value);
        el.closest(".field").classList.toggle("error", !good);
        if (!good) valid = false;
      });
      const consent = $("#consent");
      $("#consentWrap").classList.toggle("error", !consent.checked);
      if (!consent.checked) valid = false;
      if (!valid) { const first = $(".field.error input, .field.error select, .field.error textarea", form) || consent; first.focus(); return; }

      const d = Object.fromEntries(new FormData(form).entries());
      const now = new Date();
      const ticket = "SOL-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + "-" + Math.floor(1000 + Math.random() * 9000);
      const record = { ticket, fecha: now.toISOString(), ...d, autorizacion_datos: true };
      const list = JSON.parse(store.get("solis_solicitudes") || "[]"); list.push(record);
      store.set("solis_solicitudes", JSON.stringify(list));

      const body = "Radicado: " + ticket + "\nNombre: " + d.nombre + "\nEmpresa: " + (d.empresa || "-") + "\nCorreo: " + d.correo + "\nTeléfono: " + d.telefono + "\nServicio: " + d.servicio + "\nNube: " + d.nube + "\n\n" + d.mensaje + "\n\nAutorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012.";
      $("#sMail").href = "mailto:contacto@soliscloudcyber.com.co?subject=" + encodeURIComponent("Solicitud de atención " + ticket) + "&body=" + encodeURIComponent(body);
      $("#sName").textContent = d.nombre.split(" ")[0];
      $("#sTicket").textContent = ticket;
      form.style.display = "none"; ok.classList.add("show");
    });
    $("#newReq").addEventListener("click", () => {
      form.reset(); form.style.display = ""; ok.classList.remove("show");
    });
  }

  // Versión imprimible
  if (location.hash === "#imprimir") setTimeout(() => window.print(), 800);

  // Aviso de cookies
  const cookie = $("#cookie");
  if (cookie && !store.get("solis_cookies")) {
    setTimeout(() => cookie.classList.add("show"), 1200);
    $("#cookieOk").addEventListener("click", () => { store.set("solis_cookies", "1"); cookie.classList.remove("show"); });
  }
})();
