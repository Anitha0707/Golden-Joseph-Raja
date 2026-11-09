(function () {
  const WA = "918667306989";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  /* mobile nav */
  const burger = $(".burger"), nav = $("nav");
  if (burger) {
    burger.addEventListener("click", () => nav.classList.toggle("open"));
    $$("nav a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  /* reveal on scroll */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 }) : null;
  const observe = () => $$(".reveal:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in"));
  observe();

  /* year */
  $$(".yr").forEach(e => e.textContent = new Date().getFullYear());

  /* lightbox */
  const lb = $("#lightbox");
  if (lb) {
    const lbImg = $("img", lb), lbCap = $("p", lb);
    const close = () => lb.classList.remove("open");
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-zoom]");
      if (t) { lbImg.src = t.dataset.zoom; lbCap.textContent = t.dataset.cap || ""; lb.classList.add("open"); }
      else if (e.target === lb || e.target.closest(".x") && lb.contains(e.target)) close();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { close(); closeModal(); } });
  }

  /* plans */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const planCard = p => `
    <article class="card plan reveal ${p.isNew && p.cat === "new" ? "featured-new" : ""}">
      ${p.isNew ? '<span class="newbadge">NEW</span>' : ""}
      <div class="top"><span class="tag">${esc(p.tag)}</span><span class="pno">Plan No. ${esc(p.no)}</span></div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.tagline)}</p>
      <ul>${p.points.slice(0, 3).map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <div class="acts">
        <button class="btn btn-outline" data-plan="${p.id}">View details</button>
        <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Hello Mr. Golden Raja, I'd like to know more about LIC ${p.name} (Plan ${p.no}).`)}">Ask on WhatsApp</a>
      </div>
    </article>`;

  /* modal */
  const modal = $("#planModal");
  function closeModal() { if (modal) modal.classList.remove("open"); }
  function openPlan(id) {
    const p = PLANS.find(x => x.id === id); if (!p || !modal) return;
    const cat = PLAN_CATEGORIES.find(c => c.id === p.cat);
    const facts = Object.entries(p.facts || {});
    $(".modal-box .inner", modal).innerHTML = `
      <span class="tag">${esc(p.tag)}</span> <span class="pno">· Plan No. ${esc(p.no)} · ${esc(cat ? cat.label : "")}</span>
      <h3>LIC ${esc(p.name)}</h3>
      <p style="color:var(--muted)">${esc(p.tagline)}</p>
      ${facts.length ? `<div class="kv">${facts.map(([k, v]) => `<div><b>${esc(k)}</b>${esc(v)}</div>`).join("")}</div>` : ""}
      <h4 style="font-family:var(--serif);margin:14px 0 8px">Key features</h4>
      <ul style="list-style:none;font-size:.95rem">${p.points.map(x => `<li style="padding-left:24px;position:relative;margin-bottom:8px"><span style="position:absolute;left:0;color:var(--wa);font-weight:800">✓</span>${esc(x)}</li>`).join("")}</ul>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
        <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Hello Mr. Golden Raja, please share the premium and full details of LIC ${p.name} (Plan ${p.no}).`)}">Get a quote on WhatsApp</a>
        <a class="btn btn-outline" href="tel:+91${WA.slice(2)}">Call now</a>
      </div>
      <p class="note">Features are a summary for information only. Benefits, eligibility and premiums are governed by the official LIC policy document and prospectus — please read them carefully. Plan availability may change.</p>`;
    modal.classList.add("open");
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-plan]"); if (b) openPlan(b.dataset.plan);
    if (modal && (e.target === modal || (e.target.closest(".x") && modal.contains(e.target)))) closeModal();
  });

  /* featured plans on home */
  const feat = $("#featuredPlans");
  if (feat && typeof PLANS !== "undefined") { feat.innerHTML = PLANS.filter(p => p.featured).map(planCard).join(""); observe(); }

  /* plans page */
  const grid = $("#planGrid");
  if (grid && typeof PLANS !== "undefined") {
    let cat = "all", q = "";
    const pills = $("#pills"), count = $("#count"), empty = $("#empty"), input = $("#q");
    pills.innerHTML = [{ id: "all", label: "All plans" }, ...PLAN_CATEGORIES]
      .map(c => `<button class="pill ${c.id === "all" ? "on" : ""}" data-cat="${c.id}">${esc(c.label)}</button>`).join("");
    const render = () => {
      const list = PLANS.filter(p => (cat === "all" || p.cat === cat) &&
        (!q || (p.name + " " + p.tag + " " + p.no + " " + p.tagline).toLowerCase().includes(q)));
      grid.innerHTML = list.map(planCard).join("");
      count.textContent = `Showing ${list.length} of ${PLANS.length} plans`;
      empty.style.display = list.length ? "none" : "block";
      observe();
    };
    pills.addEventListener("click", e => {
      const b = e.target.closest(".pill"); if (!b) return;
      cat = b.dataset.cat; $$(".pill", pills).forEach(x => x.classList.toggle("on", x === b)); render();
    });
    input.addEventListener("input", () => { q = input.value.trim().toLowerCase(); render(); });
    const h = location.hash.replace("#", "");
    if (PLAN_CATEGORIES.some(c => c.id === h)) { cat = h; $$(".pill", pills).forEach(x => x.classList.toggle("on", x.dataset.cat === h)); }
    render();
  }

  /* enquiry form -> WhatsApp */
  const form = $("#enquiry");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const msg = `Hello Mr. Golden Raja,\nName: ${d.get("name")}\nPhone: ${d.get("phone")}\nInterested in: ${d.get("interest")}\n${d.get("message") ? "Message: " + d.get("message") : ""}`;
    window.open(waLink(msg), "_blank", "noopener");
  });

  /* pause other videos when one plays */
  $$("video").forEach(v => v.addEventListener("play", () => $$("video").forEach(o => o !== v && o.pause())));
})();
