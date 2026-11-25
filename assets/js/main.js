/* Visitor page: theme, language, rendering, Supabase content loading */

(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") || localStorage.getItem("mf-lang") || "ar";
  let theme = params.get("theme") || localStorage.getItem("mf-theme") || "light";
  let content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  let supabase = null;
  let activeFilter = "all";

  const $ = (s) => document.querySelector(s);
  const t = (k) => {
    const v = UI_STRINGS[lang] ? UI_STRINGS[lang][k] : undefined;
    return v === undefined ? k : v;
  };

  /* ---------- Theme & language ---------- */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
    applyThemeColors();
  }

  function applyThemeColors() {
    const c = content.theme && content.theme[theme];
    if (!c) return;
    const root = document.documentElement.style;
    if (c.accent) root.setProperty("--accent", c.accent);
    if (c.heading) root.setProperty("--heading", c.heading);
    if (c.bg) root.setProperty("--bg", c.bg);
  }

  function applyLang() {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    $("#langToggle").textContent = lang === "ar" ? "EN" : "عربي";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.getAttribute("data-i18n"));
      el.innerHTML = v;
      el.style.display = v === "" ? "none" : "";
    });
    document.title = lang === "ar"
      ? content.site.name_ar + " | مصمم جرافيك ومطوّر تعليمي"
      : content.site.name_en + " | Graphic Designer & Learning Developer";
    renderAll();
  }

  /* ---------- Rendering ---------- */
  function renderAll() {
    renderHeader();
    renderHero();
    renderMarquee();
    renderServices();
    renderPortfolio();
    renderDesigns();
    renderAbout();
    renderContact();
    observeReveals();
  }

  function renderHeader() {
    $("#logoName").textContent = lang === "ar" ? content.site.name_ar : content.site.name_en;
    $("#logoRole").textContent = lang === "ar" ? content.site.role_ar : content.site.role_en;
    $("#logoMark").textContent = (lang === "ar" ? content.site.name_ar : content.site.name_en).trim().charAt(0);
    $("#footerName").textContent = lang === "ar" ? content.site.name_ar : content.site.name_en;
    $("#year").textContent = new Date().getFullYear();
  }

  function renderHero() {
    $("#heroLine1").textContent = lang === "ar" ? content.hero.title_line1_ar : content.hero.title_line1_en;
    $("#heroLine2").textContent = lang === "ar" ? content.hero.title_line2_ar : content.hero.title_line2_en;
    $("#heroSub").textContent = lang === "ar" ? content.hero.subtitle_ar : content.hero.subtitle_en;
    if (content.hero.image) $("#heroImg").src = content.hero.image;
    const labels = [t("stat_projects"), t("stat_fields"), t("stat_support")];
    $("#heroStats").innerHTML = (content.hero.stats || []).map((s, i) =>
      `<div class="stat"><b>${lang === "ar" ? s.value_ar : s.value_en}</b><span>${(lang === "ar" ? s.label_ar : s.label_en) || labels[i] || ""}</span></div>`
    ).join("");
  }

  function renderMarquee() {
    const items = lang === "ar" ? content.marquee.items_ar : content.marquee.items_en;
    const half = items.map((x) => `<span>${x}</span>`).join("");
    $("#marqueeTrack").innerHTML = half + half;
  }

  const ICONS = {
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 6-10 6L2 8z"/><path d="m2 14 10 6 10-6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>'
  };

  function renderServices() {
    $("#servicesGrid").innerHTML = content.services.map((s, i) => {
      const items = (lang === "ar" ? s.items_ar : s.items_en) || [];
      const count = items.length;
      return `
      <div class="service-card reveal${s.image ? " has-bg" : ""}" data-delay="${i % 3}">
        ${s.image ? `<div class="svc-bg" style="background-image:url('${String(s.image).replace(/'/g, "%27")}');opacity:${(s.bg_opacity || 16) / 100}"></div>` : ""}
        <div class="service-icon">${ICONS[s.icon] || ICONS.sparkle}</div>
        <h3>${lang === "ar" ? s.title_ar : s.title_en}</h3>
        <span class="service-count">${count} ${lang === "ar" ? "خدمة" : "services"}</span>
        <details>
          <summary><span class="sum-label" data-more="${t("services_toggle_more")}" data-less="${t("services_toggle_less")}">${t("services_toggle_more")}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></summary>
          <div class="chip-list">${items.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
        </details>
      </div>`;
    }).join("");
    document.querySelectorAll(".service-card details").forEach((d) => {
      d.addEventListener("toggle", () => {
        const l = d.querySelector(".sum-label");
        l.textContent = d.open ? l.getAttribute("data-less") : l.getAttribute("data-more");
      });
    });
  }

  function renderPortfolio() {
    const catOf = (w) => {
      let ar = w.category_ar || "", en = w.category_en || "";
      if (!ar && !en) {
        const c = (content.portfolio_categories || []).find((x) => x.id === w.category);
        if (c) { ar = c.name_ar; en = c.name_en; } else { ar = en = w.category || ""; }
      }
      return { key: (ar || en).trim(), ar, en };
    };
    const seen = new Map();
    content.portfolio.forEach((w) => { const c = catOf(w); if (c.key && !seen.has(c.key)) seen.set(c.key, c); });
    if (activeFilter !== "all" && !seen.has(activeFilter)) activeFilter = "all";
    const cats = [{ key: "all", ar: t("filter_all"), en: t("filter_all") }].concat(Array.from(seen.values()));
    $("#filterBar").innerHTML = cats.map((c) =>
      `<button class="filter-btn ${c.key === activeFilter ? "active" : ""}" data-cat="${c.key}">${lang === "ar" ? c.ar : (c.en || c.ar)}</button>`
    ).join("");
    document.querySelectorAll(".filter-btn").forEach((b) =>
      b.addEventListener("click", () => {
        activeFilter = b.getAttribute("data-cat");
        renderPortfolio();
      })
    );
    $("#worksGrid").innerHTML = content.portfolio
      .filter((w) => activeFilter === "all" || catOf(w).key === activeFilter)
      .map((w, i) => {
        const c = catOf(w);
        return `
      <div class="work-card reveal in" data-delay="${i % 3}">
        <div class="work-media"><img src="${w.image}" alt="${lang === "ar" ? w.title_ar : w.title_en}" loading="lazy"${w.img_opacity && w.img_opacity < 100 ? ` style="opacity:${w.img_opacity / 100}"` : ""}></div>
        <div class="work-meta">
          <h3>${lang === "ar" ? w.title_ar : w.title_en}</h3>
          <span class="work-cat">${lang === "ar" ? c.ar : (c.en || c.ar)}</span>
        </div>
      </div>`;
      }).join("");
  }

  /* ---------- Designs: projects marquee + coverflow ---------- */
  let dgProject = null, dgIndex = 0;

  function dgName(p) { return lang === "ar" ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar); }
  function dgDesc(p) { return lang === "ar" ? (p.desc_ar || p.desc_en) : (p.desc_en || p.desc_ar); }

  function renderDesigns() {
    const sec = $("#designs"), nav = $("#navDesigns");
    if (sec) sec.style.display = "";
    if (nav) nav.style.display = "";
    const items = content.designs || [];
    const rows = $("#dgRows");
    if (!rows) return;
    if (!items.length) {
      rows.innerHTML = `<p class="designs-empty">${lang === "ar" ? "تصاميم جديدة في الطريق… قريباً" : "New designs on the way… soon"}</p>`;
      $("#dgProject").style.display = "none";
      dgProject = null;
      return;
    }
    const card = (list, p) => `
      <div class="dg-card" data-p="${list === null ? 0 : items.indexOf(p)}">
        <div class="dg-logo"><img src="${p.logo}" alt="${dgName(p)}" loading="lazy"></div>
        <div class="dg-info"><h3>${dgName(p)}</h3><p>${dgDesc(p)}</p></div>
      </div>`;
    const half = (list) => {
      let h = [];
      while (h.length < Math.max(8, list.length * 2)) h = h.concat(list);
      return { html: h.map((p) => card(list, p)).join(""), n: h.length };
    };
    const h1 = half(items), h2 = half(items.slice().reverse());
    rows.innerHTML = `
      <div class="dg-row"><div class="dg-track" style="animation-duration:${h1.n * 4.5}s">${h1.html}${h1.html}</div></div>
      <div class="dg-row dg-rev"><div class="dg-track" style="animation-duration:${h2.n * 4.5}s">${h2.html}${h2.html}</div></div>`;
    rows.querySelectorAll(".dg-card").forEach((c) =>
      c.addEventListener("click", () => openDgProject(+c.dataset.p))
    );
    if (dgProject) {
      if ((content.designs || []).includes(dgProject)) renderDgProject();
      else { dgProject = null; $("#dgProject").style.display = "none"; }
    }
  }

  function openDgProject(i) {
    dgProject = (content.designs || [])[i];
    dgIndex = 0;
    if (!dgProject) return;
    renderDgProject();
    $("#dgProject").style.display = "";
    $("#dgProject").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderDgProject() {
    const box = $("#dgProject");
    const imgs = dgProject.images || [];
    if (!imgs.length) { box.style.display = "none"; return; }
    box.innerHTML = `
      <div class="dg-pj-head">
        <div class="dg-pj-title"><h3>${dgName(dgProject)}</h3><p>${dgDesc(dgProject)}</p></div>
        <button class="dg-close" id="dgClose">${lang === "ar" ? "إغلاق المشروع" : "Close project"}</button>
      </div>
      <div class="dg-stage" id="dgStage">
        ${imgs.map((u, i) => `
          <div class="dg-slide" data-i="${i}">
            <img src="${u}" alt="" loading="lazy">
            <span class="dg-view">${lang === "ar" ? "عرض التصميم" : "View design"}</span>
          </div>`).join("")}
      </div>
      <div class="dg-controls">
        <button class="dg-arrow" id="dgNext" aria-label="next">${lang === "ar" ? "›" : "›"}</button>
        <span class="dg-counter" id="dgCounter"></span>
        <button class="dg-arrow" id="dgPrev" aria-label="prev">‹</button>
      </div>
      <div class="dg-dots" id="dgDots"></div>`;
    layoutDg();
    $("#dgPrev").addEventListener("click", () => { dgIndex = (dgIndex - 1 + imgs.length) % imgs.length; layoutDg(); });
    $("#dgNext").addEventListener("click", () => { dgIndex = (dgIndex + 1) % imgs.length; layoutDg(); });
    $("#dgClose").addEventListener("click", () => { box.style.display = "none"; dgProject = null; });
    box.querySelectorAll(".dg-slide").forEach((s) =>
      s.addEventListener("click", () => {
        const i = +s.dataset.i;
        if (i !== dgIndex) { dgIndex = i; layoutDg(); }
        else openDgLightbox(imgs[i]);
      })
    );
  }

  function layoutDg() {
    const imgs = dgProject.images || [];
    const n = imgs.length;
    document.querySelectorAll("#dgStage .dg-slide").forEach((s) => {
      let o = +s.dataset.i - dgIndex;
      if (o > n / 2) o -= n;
      if (o < -n / 2) o += n;
      const ao = Math.abs(o);
      s.className = "dg-slide" + (o === 0 ? " center" : "");
      s.style.transform = `translate(-50%, 0) translateX(${o * 55}%) translateZ(${-ao * 170}px) rotateY(${o === 0 ? 0 : o < 0 ? 38 : -38}deg)`;
      s.style.zIndex = 20 - ao;
      s.style.opacity = ao > 3 ? 0 : 1 - ao * 0.2;
      s.style.pointerEvents = ao > 3 ? "none" : "auto";
    });
    $("#dgCounter").textContent = lang === "ar" ? `${dgIndex + 1} من ${imgs.length}` : `${dgIndex + 1} of ${imgs.length}`;
    $("#dgDots").innerHTML = imgs.map((_, i) => `<span class="dg-dot${i === dgIndex ? " on" : ""}"></span>`).join("");
  }

  function openDgLightbox(url) {
    let lb = $("#dgLightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "dgLightbox";
      lb.className = "dg-lightbox";
      document.body.appendChild(lb);
      lb.addEventListener("click", () => lb.classList.remove("open"));
    }
    lb.innerHTML = `<img src="${url}" alt="">`;
    requestAnimationFrame(() => lb.classList.add("open"));
  }

  function renderAbout() {
    if (content.about.image) $("#aboutImg").src = content.about.image;
    $("#aboutText").textContent = lang === "ar" ? content.about.text_ar : content.about.text_en;
    const points = lang === "ar" ? content.about.points_ar : content.about.points_en;
    $("#aboutPoints").innerHTML = (points || []).map((p) =>
      `<li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>${p}</li>`
    ).join("");
  }

  /* ---------- Contact channels ---------- */
  const CH_ICONS = {
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 6 10-6"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/></svg>`,
    location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`
  };

  const waDisp = (v) => v.trim().replace(/^https?:\/\/(www\.)?wa\.me\//, "");

  const CONTACT_CHANNELS = [
    { key: "email", icon: "mail", label_ar: "البريد الإلكتروني", label_en: "Email",
      href: (v) => "mailto:" + v.trim(), display: (v) => v.trim() },
    { key: "phone", icon: "phone", label_ar: "رقم الهاتف", label_en: "Phone",
      href: (v) => "tel:" + v.replace(/\s/g, ""), display: (v) => v.trim() },
    { key: "linkedin", icon: "linkedin", label_ar: "LinkedIn", label_en: "LinkedIn",
      href: (v) => /^https?:\/\//i.test(v.trim()) ? v.trim() : (v.trim().includes(".") ? "https://" + v.trim() : "https://linkedin.com/in/" + v.trim().replace(/^@/, "")),
      display: (v) => v.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    { key: "facebook", icon: "facebook", label_ar: "Facebook", label_en: "Facebook",
      href: (v) => /^https?:\/\//i.test(v.trim()) ? v.trim() : (v.trim().includes(".") ? "https://" + v.trim() : "https://facebook.com/" + v.trim().replace(/^@/, "")),
      display: (v) => v.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") },
    { key: "instagram", icon: "instagram", label_ar: "Instagram", label_en: "Instagram",
      href: (v) => /^https?:\/\//i.test(v.trim()) ? v.trim() : "https://instagram.com/" + v.trim().replace(/^@/, ""),
      display: (v) => "@" + v.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^@/, "").replace(/\/$/, "") }
  ];

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function normCF(cf) {
    if (!cf || Array.isArray(cf.fields)) return cf || {};
    const fields = ["name", "email", "msg"].map((id) => ({
      id, type: id === "msg" ? "textarea" : (id === "email" ? "email" : "text"),
      builtin: true, visible: true,
      label_ar: cf[id + "_label_ar"], label_en: cf[id + "_label_en"],
      ph_ar: cf[id + "_ph_ar"], ph_en: cf[id + "_ph_en"]
    }));
    return { inbox_email: cf.inbox_email || "", send_ar: cf.send_ar, send_en: cf.send_en, sending_ar: cf.sending_ar, sending_en: cf.sending_en,
      sent_ar: cf.sent_ar, sent_en: cf.sent_en, error_ar: cf.error_ar, error_en: cf.error_en, fields };
  }

  function renderContactForm() {
    const cf = normCF(content.contact_form);
    const wrap = $("#formFields");
    if (wrap) {
      wrap.innerHTML = (cf.fields || []).filter((f) => f.visible).map((f) => {
        const label = (lang === "ar" ? f.label_ar : f.label_en) || "";
        const ph = (lang === "ar" ? f.ph_ar : f.ph_en) || "";
        const input = f.type === "textarea"
          ? `<textarea id="fld_${f.id}" placeholder="${escHtml(ph)}" required></textarea>`
          : `<input id="fld_${f.id}" type="${f.type === "email" ? "email" : "text"}" placeholder="${escHtml(ph)}" required>`;
        return `<div class="field"><label for="fld_${f.id}"${label === "" ? ' style="display:none"' : ""}>${escHtml(label)}</label>${input}</div>`;
      }).join("");
    }
    const sendSpan = document.querySelector('#contactForm button [data-i18n="form_send"]');
    const sendTxt = cf["send_" + lang];
    if (sendSpan && sendTxt !== undefined) sendSpan.textContent = sendTxt;
  }

  function formStatusText(key) {
    const cf = content.contact_form || {};
    const v = cf[key + "_" + lang];
    return (v === undefined || v === "") ? t("form_" + key) : v;
  }

  function renderContact() {
    const c = content.contact || {};
    const rows = CONTACT_CHANNELS
      .filter((ch) => (c[ch.key] || "").trim())
      .map((ch) => {
        const val = c[ch.key];
        return `<a class="info-row info-link" href="${ch.href(val)}" ${ch.key === "email" || ch.key === "phone" ? "" : 'target="_blank" rel="noopener"'}>
          <span class="ic">${CH_ICONS[ch.icon]}</span>
          <div><b>${lang === "ar" ? ch.label_ar : ch.label_en}</b><span style="direction:ltr">${ch.display(val)}</span></div>
        </a>`;
      });
    const wa = (c.whatsapp || "").trim();
    if (wa) {
      const digits = wa.replace(/[^0-9]/g, "");
      rows.splice(2, 0, `<div class="info-row">
        <span class="ic">${CH_ICONS.whatsapp}</span>
        <div><b>WhatsApp &amp; Telegram</b>
          <span class="ch-links" style="direction:ltr">
            <span class="ch-num">${waDisp(wa)}</span>
            <a class="ch-link" href="https://wa.me/${digits}" target="_blank" rel="noopener" aria-label="WhatsApp">${CH_ICONS.whatsapp}</a>
            <a class="ch-link" href="https://t.me/+${digits}" target="_blank" rel="noopener" aria-label="Telegram">${CH_ICONS.telegram}</a>
          </span>
        </div>
      </div>`);
    }
    $("#contactChannels").innerHTML = rows.join("");
    const fixedKeys = ["email", "phone", "whatsapp", "telegram", "linkedin", "facebook", "instagram"];
    $("#socials").innerHTML = (c.socials || [])
      .filter((s) => s.url && !fixedKeys.includes(s.id))
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join("");
    renderContactForm();
  }

  /* ---------- Reveal on scroll ---------- */
  let observer = null;
  function observeReveals() {
    if (params.get("reveal") === "all") {
      document.documentElement.classList.add("no-anim");
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); observer.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => observer.observe(el));
  }

  /* ---------- Supabase ---------- */
  async function loadRemoteContent() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || typeof window.supabase === "undefined") return;
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) { console.warn("Supabase:", error.message); return; }
      (data || []).forEach((row) => { content[row.key] = row.value; });
      const { data: works } = await supabase.from("portfolio_items").select("*").eq("visible", true).order("sort_order");
      if (works && works.length) {
        content.portfolio = works.map((w) => ({
          id: w.id, title_ar: w.title_ar, title_en: w.title_en,
          category: w.category, category_ar: w.category_ar, category_en: w.category_en,
          image: w.image_url, img_opacity: w.img_opacity
        }));
      }
      const { data: dsgn } = await supabase.from("designs_projects").select("*").eq("visible", true).order("sort_order");
      if (dsgn && dsgn.length) {
        content.designs = dsgn.map((p) => ({
          id: p.id, name_ar: p.name_ar, name_en: p.name_en,
          desc_ar: p.desc_ar, desc_en: p.desc_en,
          logo: p.card_image_url, images: p.images || []
        }));
      }
      applyThemeColors();
      applyLang();
    } catch (e) { console.warn("Supabase offline, using defaults.", e); }
  }

  /* ---------- Contact form ---------- */
  $("#contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#formStatus");
    status.className = "form-status";
    if (!supabase) { status.textContent = t("form_offline"); status.classList.add("err"); return; }
    status.textContent = formStatusText("sending");
    const cf = normCF(content.contact_form);
    const vals = (cf.fields || []).filter((f) => f.visible).map((f) => {
      const el = $("#fld_" + f.id);
      return { f, v: el ? el.value.trim() : "" };
    });
    const get = (id) => { const x = vals.find((o) => o.f.id === id); return x ? x.v : ""; };
    let message = get("msg");
    const extra = vals.filter((o) => !["name", "email", "msg"].includes(o.f.id))
      .map((o) => ((o.f.label_en || o.f.label_ar || "Field") + ": " + o.v));
    if (extra.length) message = (message ? message + "\n\n" : "") + extra.join("\n");
    const { error } = await supabase.from("contact_messages").insert({
      name: get("name"),
      email: get("email"),
      message
    });
    if (error) { status.textContent = formStatusText("error"); status.classList.add("err"); }
    else {
      status.textContent = formStatusText("sent"); status.classList.add("ok");
      e.target.reset();
      const inbox = (cf.inbox_email || "").trim();
      if (inbox) {
        fetch("https://formsubmit.co/ajax/" + encodeURIComponent(inbox), {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "رسالة جديدة من الموقع · New message from your site",
            name: get("name"),
            email: get("email"),
            message
          })
        }).catch(() => {});
      }
    }
  });

  /* ---------- Events ---------- */
  $("#themeToggle").addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("mf-theme", theme);
    applyTheme();
  });

  $("#langToggle").addEventListener("click", () => {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("mf-lang", lang);
    applyLang();
  });

  $("#burger").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  document.querySelectorAll(".main-nav a").forEach((a) =>
    a.addEventListener("click", () => $("#mainNav").classList.remove("open"))
  );

  window.addEventListener("scroll", () => {
    $("#siteHeader").classList.toggle("scrolled", window.scrollY > 12);
  });

  /* ---------- Init ---------- */
  applyTheme();
  applyLang();
  loadRemoteContent();
})();
