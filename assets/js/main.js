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
  const t = (k) => (UI_STRINGS[lang] && UI_STRINGS[lang][k]) || k;

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
      `<div class="stat"><b>${lang === "ar" ? s.value_ar : s.value_en}</b><span>${labels[i] || ""}</span></div>`
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
      <div class="service-card reveal" data-delay="${i % 3}">
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
    const cats = [{ id: "all", name_ar: t("filter_all"), name_en: t("filter_all") }].concat(content.portfolio_categories);
    $("#filterBar").innerHTML = cats.map((c) =>
      `<button class="filter-btn ${c.id === activeFilter ? "active" : ""}" data-cat="${c.id}">${lang === "ar" ? c.name_ar : c.name_en}</button>`
    ).join("");
    document.querySelectorAll(".filter-btn").forEach((b) =>
      b.addEventListener("click", () => {
        activeFilter = b.getAttribute("data-cat");
        renderPortfolio();
      })
    );
    const catName = (id) => {
      const c = (content.portfolio_categories || []).find((x) => x.id === id);
      return c ? (lang === "ar" ? c.name_ar : c.name_en) : id;
    };
    $("#worksGrid").innerHTML = content.portfolio
      .filter((w) => activeFilter === "all" || w.category === activeFilter)
      .map((w, i) => `
      <div class="work-card reveal in" data-delay="${i % 3}">
        <div class="work-media"><img src="${w.image}" alt="${lang === "ar" ? w.title_ar : w.title_en}" loading="lazy"></div>
        <div class="work-meta">
          <h3>${lang === "ar" ? w.title_ar : w.title_en}</h3>
          <span class="work-cat">${catName(w.category)}</span>
        </div>
      </div>`).join("");
  }

  function renderAbout() {
    if (content.about.image) $("#aboutImg").src = content.about.image;
    $("#aboutText").textContent = lang === "ar" ? content.about.text_ar : content.about.text_en;
    const points = lang === "ar" ? content.about.points_ar : content.about.points_en;
    $("#aboutPoints").innerHTML = (points || []).map((p) =>
      `<li><span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>${p}</li>`
    ).join("");
  }

  function renderContact() {
    $("#cEmail").textContent = content.contact.email || "";
    $("#cPhone").textContent = content.contact.phone || "";
    $("#cLocation").textContent = lang === "ar" ? content.contact.location_ar : content.contact.location_en;
    $("#socials").innerHTML = (content.contact.socials || [])
      .filter((s) => s.url)
      .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join("");
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
          category: w.category, image: w.image_url
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
    status.textContent = t("form_sending");
    const { error } = await supabase.from("contact_messages").insert({
      name: $("#fName").value.trim(),
      email: $("#fEmail").value.trim(),
      message: $("#fMsg").value.trim()
    });
    if (error) { status.textContent = t("form_error"); status.classList.add("err"); }
    else {
      status.textContent = t("form_sent"); status.classList.add("ok");
      e.target.reset();
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
