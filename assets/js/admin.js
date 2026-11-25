/* Admin panel: Supabase Auth login + content editors */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  let supabase = null;
  let content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));

  /* Theme toggle is not needed here; honor the visitor preference. */
  document.documentElement.setAttribute("data-theme", localStorage.getItem("mf-theme") || "light");

  /* ---------- Boot ---------- */
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || typeof window.supabase === "undefined") {
    $("#offlineNotice") && ($("#offlineNotice").style.display = "block");
    $("#loginStatus").textContent = "Supabase not configured yet — fill assets/js/config.js";
    $("#loginStatus").classList.add("err");
    return;
  }
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  supabase.auth.getSession().then(({ data }) => {
    if (data && data.session) showAdmin();
  });

  /* ---------- Login ---------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#loginStatus");
    status.className = "form-status";
    status.textContent = "...";
    const username = $("#username").value.trim();
    const email = username.includes("@") ? username : username + "@" + ADMIN_EMAIL_DOMAIN;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: $("#password").value
    });
    if (error) {
      status.textContent = "بيانات الدخول غير صحيحة · Wrong credentials";
      status.classList.add("err");
    } else {
      status.textContent = "";
      showAdmin();
    }
  });

  $("#logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    location.reload();
  });

  /* ---------- Load & show ---------- */
  async function showAdmin() {
    $("#loginView").style.display = "none";
    $("#adminShell").style.display = "block";
    await loadContent();
    fillAll();
    loadMessages();
  }

  async function loadContent() {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (!error && data) data.forEach((row) => { content[row.key] = row.value; });
    const { data: works } = await supabase.from("portfolio_items").select("*").order("sort_order");
    if (works && works.length) {
      content.portfolio = works.map((w) => ({
        id: w.id, title_ar: w.title_ar, title_en: w.title_en,
        category: w.category, image: w.image_url, sort_order: w.sort_order, visible: w.visible
      }));
    }
  }

  /* ---------- Tabs ---------- */
  $$(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".admin-tab").forEach((x) => x.classList.remove("active"));
      $$(".admin-panel").forEach((x) => x.classList.remove("active"));
      tab.classList.add("active");
      $(`.admin-panel[data-panel="${tab.dataset.panel}"]`).classList.add("active");
      if (tab.dataset.panel === "messages") loadMessages();
    });
  });

  /* ---------- Fill forms ---------- */
  function fillAll() {
    $("#site_name_ar").value = content.site.name_ar || "";
    $("#site_name_en").value = content.site.name_en || "";
    $("#site_role_ar").value = content.site.role_ar || "";
    $("#site_role_en").value = content.site.role_en || "";
    $("#hero_l1_ar").value = content.hero.title_line1_ar || "";
    $("#hero_l1_en").value = content.hero.title_line1_en || "";
    $("#hero_l2_ar").value = content.hero.title_line2_ar || "";
    $("#hero_l2_en").value = content.hero.title_line2_en || "";
    $("#hero_sub_ar").value = content.hero.subtitle_ar || "";
    $("#hero_sub_en").value = content.hero.subtitle_en || "";
    $("#hero_image").value = content.hero.image || "";

    $("#about_text_ar").value = content.about.text_ar || "";
    $("#about_text_en").value = content.about.text_en || "";
    $("#about_points_ar").value = (content.about.points_ar || []).join("\n");
    $("#about_points_en").value = (content.about.points_en || []).join("\n");
    $("#about_image").value = content.about.image || "";

    renderServicesEditor();
    renderPortfolioEditor();
    fillContact();
    renderColorsEditor();
  }

  function renderServicesEditor() {
    $("#servicesEditor").innerHTML = content.services.map((s, i) => `
      <div class="msg-item" data-svc="${i}">
        <div class="form-grid">
          <div class="field"><label>اسم القسم (عربي)</label><input class="svc-title-ar" value="${esc(s.title_ar)}"></div>
          <div class="field"><label>Category title (EN)</label><input class="svc-title-en" value="${esc(s.title_en)}"></div>
          <div class="field full"><label>الخدمات (عربي) — كل خدمة في سطر</label><textarea class="svc-items-ar">${esc((s.items_ar || []).join("\n"))}</textarea></div>
          <div class="field full"><label>Services (EN) — one per line</label><textarea class="svc-items-en">${esc((s.items_en || []).join("\n"))}</textarea></div>
        </div>
      </div>`).join("");
  }

  function renderPortfolioEditor() {
    const cats = content.portfolio_categories || [];
    $("#portfolioEditor").innerHTML = content.portfolio.map((w, i) => `
      <div class="portfolio-admin-item" data-work="${i}">
        <img src="${w.image}" alt="">
        <div class="fields">
          <input class="w-title-ar" placeholder="العنوان (عربي)" value="${esc(w.title_ar)}">
          <input class="w-title-en" placeholder="Title (EN)" value="${esc(w.title_en)}">
          <select class="w-cat">${cats.map((c) => `<option value="${c.id}" ${c.id === w.category ? "selected" : ""}>${c.name_ar} · ${c.name_en}</option>`).join("")}</select>
          <div style="display:flex;gap:6px">
            <input class="w-image" placeholder="رابط الصورة" value="${esc(w.image)}" style="flex:1">
            <input type="file" class="w-file" accept="image/*" hidden>
            <button class="small-btn w-upload">رفع</button>
          </div>
        </div>
        <div class="row-btns">
          <button class="small-btn danger w-del">حذف</button>
        </div>
      </div>`).join("");

    $$("#portfolioEditor .w-del").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.closest("[data-work]").dataset.work;
        content.portfolio.splice(i, 1);
        renderPortfolioEditor();
      })
    );
    $$("#portfolioEditor .w-upload").forEach((b) =>
      b.addEventListener("click", () => b.closest(".fields").querySelector(".w-file").click())
    );
    $$("#portfolioEditor .w-file").forEach((f) =>
      f.addEventListener("change", async () => {
        const url = await uploadImage(f.files[0]);
        if (url) f.closest(".fields").querySelector(".w-image").value = url;
      })
    );
  }

  $("#addWorkBtn").addEventListener("click", () => {
    syncPortfolioFromForm();
    content.portfolio.push({
      id: "w" + Date.now(), title_ar: "عمل جديد", title_en: "New work",
      category: (content.portfolio_categories[0] || {}).id || "branding", image: ""
    });
    renderPortfolioEditor();
  });

  function fillContact() {
    $("#contact_email").value = content.contact.email || "";
    $("#contact_phone").value = content.contact.phone || "";
    $("#contact_whatsapp").value = content.contact.whatsapp || "";
    $("#contact_location_ar").value = content.contact.location_ar || "";
    $("#contact_location_en").value = content.contact.location_en || "";
    $("#socialsEditor").innerHTML = (content.contact.socials || []).map((s, i) => `
      <div class="field" style="margin-bottom:10px"><label>${s.label}</label>
        <input class="social-url" data-i="${i}" value="${esc(s.url || "")}" placeholder="https://...">
      </div>`).join("");
  }

  const COLOR_FIELDS = [
    ["accent", "اللون المميز · Accent"],
    ["heading", "لون العناوين · Headings"],
    ["bg", "لون الخلفية · Background"]
  ];

  function renderColorsEditor() {
    $("#colorsEditor").innerHTML = ["light", "dark"].map((mode) => `
      <h3 style="margin:14px 0 12px;font-size:.95rem">${mode === "light" ? "الوضع الفاتح · Light" : "الوضع الغامق · Dark"}</h3>
      ${COLOR_FIELDS.map(([k, label]) => `
        <div class="color-row">
          <label>${label}</label>
          <input type="color" data-mode="${mode}" data-key="${k}" value="${content.theme[mode][k] || "#000000"}">
          <input type="text" data-mode="${mode}" data-key="${k}" value="${content.theme[mode][k] || ""}">
        </div>`).join("")}`).join("");
    $$('#colorsEditor input[type="color"]').forEach((c) =>
      c.addEventListener("input", () => {
        $(`#colorsEditor input[type="text"][data-mode="${c.dataset.mode}"][data-key="${c.dataset.key}"]`).value = c.value;
      })
    );
    $$('#colorsEditor input[type="text"]').forEach((c) =>
      c.addEventListener("input", () => {
        if (/^#[0-9a-fA-F]{6}$/.test(c.value))
          $(`#colorsEditor input[type="color"][data-mode="${c.dataset.mode}"][data-key="${c.dataset.key}"]`).value = c.value;
      })
    );
  }

  /* ---------- Image upload ---------- */
  async function uploadImage(file) {
    if (!file) return "";
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = "uploads/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { alert("Upload failed: " + error.message); return ""; }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  $("#hero_image_btn").addEventListener("click", () => $("#hero_image_file").click());
  $("#hero_image_file").addEventListener("change", async (e) => {
    const url = await uploadImage(e.target.files[0]);
    if (url) $("#hero_image").value = url;
  });
  $("#about_image_btn").addEventListener("click", () => $("#about_image_file").click());
  $("#about_image_file").addEventListener("change", async (e) => {
    const url = await uploadImage(e.target.files[0]);
    if (url) $("#about_image").value = url;
  });

  /* ---------- Save ---------- */
  function syncPortfolioFromForm() {
    $$("#portfolioEditor [data-work]").forEach((row) => {
      const i = +row.dataset.work;
      if (!content.portfolio[i]) return;
      content.portfolio[i].title_ar = row.querySelector(".w-title-ar").value;
      content.portfolio[i].title_en = row.querySelector(".w-title-en").value;
      content.portfolio[i].category = row.querySelector(".w-cat").value;
      content.portfolio[i].image = row.querySelector(".w-image").value;
    });
  }

  async function upsert(key, value) {
    return supabase.from("site_content").upsert({ key, value });
  }

  const SAVERS = {
    hero: async () => {
      content.site = {
        name_ar: $("#site_name_ar").value, name_en: $("#site_name_en").value,
        role_ar: $("#site_role_ar").value, role_en: $("#site_role_en").value
      };
      content.hero = Object.assign({}, content.hero, {
        title_line1_ar: $("#hero_l1_ar").value, title_line1_en: $("#hero_l1_en").value,
        title_line2_ar: $("#hero_l2_ar").value, title_line2_en: $("#hero_l2_en").value,
        subtitle_ar: $("#hero_sub_ar").value, subtitle_en: $("#hero_sub_en").value,
        image: $("#hero_image").value
      });
      const r1 = await upsert("site", content.site);
      const r2 = await upsert("hero", content.hero);
      return r1.error || r2.error;
    },
    about: async () => {
      content.about = Object.assign({}, content.about, {
        text_ar: $("#about_text_ar").value, text_en: $("#about_text_en").value,
        points_ar: lines("#about_points_ar"), points_en: lines("#about_points_en"),
        image: $("#about_image").value
      });
      return (await upsert("about", content.about)).error;
    },
    services: async () => {
      $$("#servicesEditor [data-svc]").forEach((row) => {
        const i = +row.dataset.svc;
        content.services[i].title_ar = row.querySelector(".svc-title-ar").value;
        content.services[i].title_en = row.querySelector(".svc-title-en").value;
        content.services[i].items_ar = row.querySelector(".svc-items-ar").value.split("\n").map((x) => x.trim()).filter(Boolean);
        content.services[i].items_en = row.querySelector(".svc-items-en").value.split("\n").map((x) => x.trim()).filter(Boolean);
      });
      return (await upsert("services", content.services)).error;
    },
    portfolio: async () => {
      syncPortfolioFromForm();
      await supabase.from("portfolio_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = content.portfolio.map((w, i) => ({
        title_ar: w.title_ar, title_en: w.title_en, category: w.category,
        image_url: w.image, sort_order: i, visible: true
      }));
      if (!rows.length) return null;
      return (await supabase.from("portfolio_items").insert(rows)).error;
    },
    contact: async () => {
      content.contact = Object.assign({}, content.contact, {
        email: $("#contact_email").value, phone: $("#contact_phone").value,
        whatsapp: $("#contact_whatsapp").value,
        location_ar: $("#contact_location_ar").value, location_en: $("#contact_location_en").value
      });
      $$(".social-url").forEach((inp) => {
        const i = +inp.dataset.i;
        if (content.contact.socials[i]) content.contact.socials[i].url = inp.value;
      });
      return (await upsert("contact", content.contact)).error;
    },
    theme: async () => {
      $$('#colorsEditor input[type="text"]').forEach((inp) => {
        content.theme[inp.dataset.mode][inp.dataset.key] = inp.value;
      });
      return (await upsert("theme", content.theme)).error;
    }
  };

  $$("[data-save]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const key = btn.dataset.save;
      const status = $("#status-" + key);
      status.className = "save-status";
      status.textContent = "...";
      const err = await SAVERS[key]();
      if (err) { status.textContent = "خطأ: " + err.message; status.classList.add("err"); }
      else { status.textContent = "تم الحفظ ✓ Saved"; status.classList.add("ok"); }
    });
  });

  /* ---------- Messages ---------- */
  async function loadMessages() {
    const list = $("#messagesList");
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) { list.innerHTML = "<p>" + error.message + "</p>"; return; }
    if (!data || !data.length) { list.innerHTML = "<p style='color:var(--muted)'>لا رسائل بعد · No messages yet.</p>"; return; }
    list.innerHTML = data.map((m) => `
      <div class="msg-item ${m.read ? "" : "unread"}">
        <div class="meta"><span><b>${esc(m.name || "")}</b> — ${esc(m.email || "")}</span><span>${new Date(m.created_at).toLocaleString()}</span></div>
        <p>${esc(m.message || "")}</p>
      </div>`).join("");
  }

  /* ---------- Helpers ---------- */
  function lines(sel) { return $(sel).value.split("\n").map((x) => x.trim()).filter(Boolean); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
