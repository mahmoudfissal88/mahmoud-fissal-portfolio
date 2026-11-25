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
      content.portfolio = works.map((w) => {
        let category_ar = w.category_ar || "", category_en = w.category_en || "";
        if (!category_ar && !category_en) {
          const c = (content.portfolio_categories || []).find((x) => x.id === w.category);
          if (c) { category_ar = c.name_ar; category_en = c.name_en; }
        }
        return {
          id: w.id, title_ar: w.title_ar, title_en: w.title_en,
          category: w.category, category_ar, category_en,
          image: w.image_url, sort_order: w.sort_order, visible: w.visible,
          img_opacity: w.img_opacity
        };
      });
    }
    const { data: dsgn } = await supabase.from("designs_items").select("*").order("sort_order");
    content.designs = (dsgn || []).map((w) => ({
      id: w.id, title_ar: w.title_ar, title_en: w.title_en,
      category: w.category, category_ar: w.category_ar || "", category_en: w.category_en || "",
      image: w.image_url, sort_order: w.sort_order, visible: w.visible,
      img_opacity: w.img_opacity
    }));
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
    renderStatsEditor();

    $("#about_text_ar").value = content.about.text_ar || "";
    $("#about_text_en").value = content.about.text_en || "";
    $("#about_points_ar").value = (content.about.points_ar || []).join("\n");
    $("#about_points_en").value = (content.about.points_en || []).join("\n");
    $("#about_image").value = content.about.image || "";

    renderServicesEditor();
    renderPortfolioEditor();
    renderDesignsEditor();
    fillContact();
    renderColorsEditor();
  }

  function renderStatsEditor() {
    const stats = content.hero.stats || [];
    const defs = (DEFAULT_CONTENT.hero.stats || []);
    $("#statsEditor").innerHTML = stats.map((s, i) => {
      const d = defs[i] || {};
      return `
      <div class="msg-item" data-stat="${i}">
        <div class="form-grid">
          <div class="field"><label>الرقم (عربي)</label><input class="st-value-ar" value="${esc(s.value_ar)}"></div>
          <div class="field"><label>Number (EN)</label><input class="st-value-en" value="${esc(s.value_en)}"></div>
          <div class="field"><label>الاسم (عربي)</label><input class="st-label-ar" value="${esc(s.label_ar || d.label_ar || "")}"></div>
          <div class="field"><label>Label (EN)</label><input class="st-label-en" value="${esc(s.label_en || d.label_en || "")}"></div>
        </div>
      </div>`;
    }).join("");
  }

  function syncStatsFromForm() {
    $$("#statsEditor [data-stat]").forEach((row) => {
      const i = +row.dataset.stat;
      if (!content.hero.stats[i]) return;
      content.hero.stats[i].value_ar = row.querySelector(".st-value-ar").value;
      content.hero.stats[i].value_en = row.querySelector(".st-value-en").value;
      content.hero.stats[i].label_ar = row.querySelector(".st-label-ar").value;
      content.hero.stats[i].label_en = row.querySelector(".st-label-en").value;
    });
  }

  function renderServicesEditor() {
    $("#servicesEditor").innerHTML = content.services.map((s, i) => `
      <div class="acard" data-svc="${i}">
        <div class="tc-head ${i % 2 ? "tc-head-dark" : "tc-head-light"}"><span>${esc(s.title_ar || "قسم جديد")}${s.title_en ? " · " + esc(s.title_en) : ""}</span>${AC_SVC}</div>
        <div class="acard-body">
        <div class="form-grid">
          <div class="field"><label>اسم القسم (عربي)</label><input class="svc-title-ar" value="${esc(s.title_ar)}"></div>
          <div class="field"><label>Category title (EN)</label><input class="svc-title-en" value="${esc(s.title_en)}"></div>
          <div class="field"><label>الخدمات (عربي) — كل خدمة في سطر</label><textarea class="svc-items-ar">${esc((s.items_ar || []).join("\n"))}</textarea></div>
          <div class="field"><label>Services (EN) — one per line</label><textarea class="svc-items-en">${esc((s.items_en || []).join("\n"))}</textarea></div>
          <div class="field full">
            <label>خلفية القسم · Category background</label>
            <div class="svc-bg-admin">
              ${s.image ? `<img src="${esc(s.image)}" alt="">` : `<span class="svc-bg-none">لا توجد خلفية · No background</span>`}
              <input type="file" class="svc-file" accept="image/*" hidden>
              <button type="button" class="small-btn svc-upload">رفع · Upload</button>
              ${s.image ? `<button type="button" class="small-btn danger svc-bg-del">حذف الخلفية · Remove</button>` : ""}
              <label style="display:flex;align-items:center;gap:8px;margin:0">الشفافية · Opacity
                <input type="range" class="svc-opacity" min="5" max="100" value="${s.bg_opacity || 16}" style="width:120px">
                <span class="svc-op-val">${s.bg_opacity || 16}%</span>
              </label>
              <span style="flex:1"></span>
              <button type="button" class="small-btn danger svc-del">حذف القسم · Delete category</button>
            </div>
          </div>
        </div>
        </div>
      </div>`).join("");
    wireServicesEditor();
  }

  function syncServicesFromForm() {
    $$("#servicesEditor [data-svc]").forEach((row) => {
      const i = +row.dataset.svc;
      if (!content.services[i]) return;
      content.services[i].title_ar = row.querySelector(".svc-title-ar").value;
      content.services[i].title_en = row.querySelector(".svc-title-en").value;
      content.services[i].items_ar = row.querySelector(".svc-items-ar").value.split("\n").map((x) => x.trim()).filter(Boolean);
      content.services[i].items_en = row.querySelector(".svc-items-en").value.split("\n").map((x) => x.trim()).filter(Boolean);
      content.services[i].bg_opacity = +row.querySelector(".svc-opacity").value;
    });
  }

  function wireServicesEditor() {
    $$("#servicesEditor .svc-opacity").forEach((r) =>
      r.addEventListener("input", () => {
        r.closest(".svc-bg-admin").querySelector(".svc-op-val").textContent = r.value + "%";
      })
    );
    $$("#servicesEditor .svc-upload").forEach((b) =>
      b.addEventListener("click", () => b.closest(".svc-bg-admin").querySelector(".svc-file").click())
    );
    $$("#servicesEditor .svc-file").forEach((f) =>
      f.addEventListener("change", async () => {
        const i = +f.closest("[data-svc]").dataset.svc;
        const url = await uploadImage(f.files[0]);
        if (url) {
          syncServicesFromForm();
          if (content.services[i]) content.services[i].image = url;
          renderServicesEditor();
          saveSection("services");
        }
      })
    );
    $$("#servicesEditor .svc-bg-del").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.closest("[data-svc]").dataset.svc;
        syncServicesFromForm();
        if (content.services[i]) content.services[i].image = "";
        renderServicesEditor();
        saveSection("services");
      })
    );
    $$("#servicesEditor .svc-del").forEach((b) =>
      b.addEventListener("click", () => {
        if (!confirm("حذف هذا القسم نهائياً؟ · Delete this category permanently?")) return;
        const i = +b.closest("[data-svc]").dataset.svc;
        content.services.splice(i, 1);
        renderServicesEditor();
        saveSection("services");
      })
    );
  }

  $("#addServiceBtn").addEventListener("click", () => {
    syncServicesFromForm();
    content.services.push({
      id: "cat-" + Date.now(), icon: "sparkle",
      title_ar: "قسم جديد", title_en: "New category",
      items_ar: [], items_en: [], image: ""
    });
    renderServicesEditor();
    saveSection("services");
    $("#addServiceBtn").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function renderPortfolioEditor() {
    $("#portfolioEditor").innerHTML = content.portfolio.map((w, i) => `
      <div class="acard" data-work="${i}">
        <div class="tc-head ${i % 2 ? "tc-head-dark" : "tc-head-light"}"><span>${esc(w.title_ar || "عمل جديد")}${w.title_en ? " · " + esc(w.title_en) : ""}</span>${AC_IMG}</div>
        <div class="acard-body">
        <div class="form-grid">
          <div class="field"><label>العنوان (عربي)</label><input class="w-title-ar" value="${esc(w.title_ar)}"></div>
          <div class="field"><label>Title (EN)</label><input class="w-title-en" value="${esc(w.title_en)}"></div>
          <div class="field"><label>القسم (عربي)</label><input class="w-cat-ar" value="${esc(w.category_ar || "")}"></div>
          <div class="field"><label>Category (EN)</label><input class="w-cat-en" value="${esc(w.category_en || "")}"></div>
          <div class="field full">
            <label>صورة العمل · Work image</label>
            <div class="svc-bg-admin">
              ${w.image ? `<img src="${esc(w.image)}" alt="">` : `<span class="svc-bg-none">لا توجد صورة · No image</span>`}
              <input type="file" class="w-file" accept="image/*" hidden>
              <button type="button" class="small-btn w-upload">رفع · Upload</button>
              ${w.image ? `<button type="button" class="small-btn danger w-img-del">حذف الصورة · Remove</button>` : ""}
              <label style="display:flex;align-items:center;gap:8px;margin:0">الشفافية · Opacity
                <input type="range" class="w-opacity" min="5" max="100" value="${w.img_opacity || 100}" style="width:120px">
                <span class="w-op-val">${w.img_opacity || 100}%</span>
              </label>
              <span style="flex:1"></span>
              <button type="button" class="small-btn danger w-del">حذف العمل · Delete work</button>
            </div>
          </div>
        </div>
        </div>
      </div>`).join("");

    $$("#portfolioEditor .w-opacity").forEach((r) =>
      r.addEventListener("input", () => {
        r.closest(".svc-bg-admin").querySelector(".w-op-val").textContent = r.value + "%";
      })
    );
    $$("#portfolioEditor .w-img-del").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.closest("[data-work]").dataset.work;
        syncPortfolioFromForm();
        if (content.portfolio[i]) content.portfolio[i].image = "";
        renderPortfolioEditor();
        saveSection("portfolio");
      })
    );
    $$("#portfolioEditor .w-del").forEach((b) =>
      b.addEventListener("click", () => {
        if (!confirm("حذف هذا العمل نهائياً؟ · Delete this work permanently?")) return;
        const i = +b.closest("[data-work]").dataset.work;
        content.portfolio.splice(i, 1);
        renderPortfolioEditor();
        saveSection("portfolio");
      })
    );
    $$("#portfolioEditor .w-upload").forEach((b) =>
      b.addEventListener("click", () => b.closest(".svc-bg-admin").querySelector(".w-file").click())
    );
    $$("#portfolioEditor .w-file").forEach((f) =>
      f.addEventListener("change", async () => {
        const i = +f.closest("[data-work]").dataset.work;
        const url = await uploadImage(f.files[0]);
        if (url) {
          syncPortfolioFromForm();
          if (content.portfolio[i]) content.portfolio[i].image = url;
          renderPortfolioEditor();
          saveSection("portfolio");
        }
      })
    );
  }

  $("#addWorkBtn").addEventListener("click", () => {
    syncPortfolioFromForm();
    content.portfolio.push({
      id: "w" + Date.now(), title_ar: "عمل جديد", title_en: "New work",
      category: "", category_ar: "", category_en: "", image: "", img_opacity: 100
    });
    renderPortfolioEditor();
    scheduleAutoSave("portfolio");
  });

  function renderDesignsEditor() {
    $("#designsEditor").innerHTML = (content.designs || []).map((w, i) => `
      <div class="acard" data-design="${i}">
        <div class="tc-head ${i % 2 ? "tc-head-dark" : "tc-head-light"}"><span>${esc(w.title_ar || "تصميم جديد")}${w.title_en ? " · " + esc(w.title_en) : ""}</span>${AC_IMG}</div>
        <div class="acard-body">
        <div class="form-grid">
          <div class="field"><label>العنوان (عربي)</label><input class="d-title-ar" value="${esc(w.title_ar)}"></div>
          <div class="field"><label>Title (EN)</label><input class="d-title-en" value="${esc(w.title_en)}"></div>
          <div class="field"><label>القسم (عربي)</label><input class="d-cat-ar" value="${esc(w.category_ar || "")}"></div>
          <div class="field"><label>Category (EN)</label><input class="d-cat-en" value="${esc(w.category_en || "")}"></div>
          <div class="field full">
            <label>صورة التصميم · Design image</label>
            <div class="svc-bg-admin">
              ${w.image ? `<img src="${esc(w.image)}" alt="">` : `<span class="svc-bg-none">لا توجد صورة · No image</span>`}
              <input type="file" class="d-file" accept="image/*" hidden>
              <button type="button" class="small-btn d-upload">رفع · Upload</button>
              ${w.image ? `<button type="button" class="small-btn danger d-img-del">حذف الصورة · Remove</button>` : ""}
              <label style="display:flex;align-items:center;gap:8px;margin:0">الشفافية · Opacity
                <input type="range" class="d-opacity" min="5" max="100" value="${w.img_opacity || 100}" style="width:120px">
                <span class="d-op-val">${w.img_opacity || 100}%</span>
              </label>
              <span style="flex:1"></span>
              <button type="button" class="small-btn danger d-del">حذف التصميم · Delete design</button>
            </div>
          </div>
        </div>
        </div>
      </div>`).join("");

    $$("#designsEditor .d-opacity").forEach((r) =>
      r.addEventListener("input", () => {
        r.closest(".svc-bg-admin").querySelector(".d-op-val").textContent = r.value + "%";
      })
    );
    $$("#designsEditor .d-img-del").forEach((b) =>
      b.addEventListener("click", () => {
        const i = +b.closest("[data-design]").dataset.design;
        syncDesignsFromForm();
        if (content.designs[i]) content.designs[i].image = "";
        renderDesignsEditor();
        saveSection("designs");
      })
    );
    $$("#designsEditor .d-del").forEach((b) =>
      b.addEventListener("click", () => {
        if (!confirm("حذف هذا التصميم نهائياً؟ · Delete this design permanently?")) return;
        const i = +b.closest("[data-design]").dataset.design;
        content.designs.splice(i, 1);
        renderDesignsEditor();
        saveSection("designs");
      })
    );
    $$("#designsEditor .d-upload").forEach((b) =>
      b.addEventListener("click", () => b.closest(".svc-bg-admin").querySelector(".d-file").click())
    );
    $$("#designsEditor .d-file").forEach((f) =>
      f.addEventListener("change", async () => {
        const i = +f.closest("[data-design]").dataset.design;
        const url = await uploadImage(f.files[0]);
        if (url) {
          syncDesignsFromForm();
          if (content.designs[i]) content.designs[i].image = url;
          renderDesignsEditor();
          saveSection("designs");
        }
      })
    );
  }

  $("#addDesignBtn").addEventListener("click", () => {
    syncDesignsFromForm();
    content.designs = content.designs || [];
    content.designs.push({
      id: "d" + Date.now(), title_ar: "تصميم جديد", title_en: "New design",
      category: "", category_ar: "", category_en: "", image: "", img_opacity: 100
    });
    renderDesignsEditor();
    scheduleAutoSave("designs");
    $("#addDesignBtn").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const CF_TEXT_KEYS = ["send", "sending", "sent", "error"].flatMap((p) => [p + "_ar", p + "_en"]);

  const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M9.9 4.24A9.5 9.5 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.16 3.19M6.61 6.61A16.6 16.6 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/></svg>';
  const TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>';

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

  function renderFormFieldsEditor() {
    const cf = (content.contact_form = normCF(content.contact_form));
    const fields = cf.fields || (cf.fields = []);
    $("#formFieldsEditor").innerHTML = fields.map((f, i) => `
      <div class="cf-field" data-id="${f.id}" style="${f.visible ? "" : "opacity:.55"}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <h3 style="margin:0;font-size:.92rem;flex:1">${esc(f.label_ar || f.label_en || "حقل جديد")}${f.label_en ? " · " + esc(f.label_en) : ""}${f.visible ? "" : " (مخفي)"}</h3>
          <button type="button" class="small-btn cf-eye" data-i="${i}" title="إظهار / إخفاء" style="padding:4px 8px">${f.visible ? EYE_OPEN : EYE_OFF}</button>
          <button type="button" class="small-btn danger cf-del" data-i="${i}" title="حذف" style="padding:4px 8px">${TRASH}</button>
        </div>
        <div class="form-grid">
          <div class="field"><label>العنوان (عربي)</label><input class="cf-label-ar" value="${esc(f.label_ar || "")}"></div>
          <div class="field"><label>Label (EN)</label><input class="cf-label-en" value="${esc(f.label_en || "")}"></div>
          <div class="field"><label>النص داخل الحقل (عربي)</label><input class="cf-ph-ar" value="${esc(f.ph_ar || "")}"></div>
          <div class="field"><label>Placeholder (EN)</label><input class="cf-ph-en" value="${esc(f.ph_en || "")}"></div>
          ${f.builtin ? "" : `<div class="field"><label>النوع · Type</label>
            <select class="cf-type">
              <option value="text" ${f.type === "text" ? "selected" : ""}>نص قصير · Short text</option>
              <option value="textarea" ${f.type === "textarea" ? "selected" : ""}>نص طويل · Long text</option>
            </select></div>`}
        </div>
      </div>`).join("");
    $$("#formFieldsEditor .cf-eye").forEach((b) => b.addEventListener("click", () => {
      syncFormFieldsFromDom();
      const f = content.contact_form.fields[+b.dataset.i];
      f.visible = !f.visible;
      renderFormFieldsEditor();
      saveSection("contact");
    }));
    $$("#formFieldsEditor .cf-del").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("حذف هذا الحقل من النموذج؟ · Delete this field?")) return;
      syncFormFieldsFromDom();
      content.contact_form.fields.splice(+b.dataset.i, 1);
      renderFormFieldsEditor();
      saveSection("contact");
    }));
  }

  function syncFormFieldsFromDom() {
    const cf = content.contact_form || {};
    $$("#formFieldsEditor .cf-field").forEach((div) => {
      const f = (cf.fields || []).find((x) => x.id === div.dataset.id);
      if (!f) return;
      f.label_ar = div.querySelector(".cf-label-ar").value;
      f.label_en = div.querySelector(".cf-label-en").value;
      f.ph_ar = div.querySelector(".cf-ph-ar").value;
      f.ph_en = div.querySelector(".cf-ph-en").value;
      const typeSel = div.querySelector(".cf-type");
      if (typeSel) f.type = typeSel.value;
    });
  }

  function fillContact() {
    const c = content.contact || {};
    ["email", "phone", "whatsapp", "linkedin", "facebook", "instagram"].forEach((k) => {
      const el = $("#contact_" + k);
      if (el) el.value = c[k] || "";
    });
    const cf = (content.contact_form = normCF(content.contact_form));
    CF_TEXT_KEYS.forEach((k) => {
      const el = $("#cf_" + k);
      if (el) el.value = cf[k] || "";
    });
    const inboxEl = $("#cf_inbox_email");
    if (inboxEl) inboxEl.value = cf.inbox_email || "";
    renderFormFieldsEditor();
  }

  const AC_SVC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>';
  const AC_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>';

  const COLOR_FIELDS = [
    ["accent", "اللون المميز · Accent"],
    ["heading", "لون العناوين · Headings"],
    ["bg", "لون الخلفية · Background"]
  ];

  const TC_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19"/></svg>';
  const TC_MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const TC_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  function renderColorsEditor() {
    $("#colorsEditor").innerHTML = `<div class="theme-cards">` +
      ["light", "dark"].map((mode) => `
      <div class="theme-card">
        <div class="tc-head tc-head-${mode}"><span>${mode === "light" ? "الوضع الفاتح · Light" : "الوضع الغامق · Dark"}</span>${mode === "light" ? TC_SUN : TC_MOON}</div>
        <div class="tc-body">
          ${COLOR_FIELDS.map(([k, label]) => `
            <div class="tc-row">
              <span class="tc-swatch"><input type="color" data-mode="${mode}" data-key="${k}" value="${content.theme[mode][k] || "#000000"}"></span>
              <div class="tc-info">
                <div class="tc-label">${label}</div>
                <div class="tc-hex">
                  <input type="text" data-mode="${mode}" data-key="${k}" value="${content.theme[mode][k] || ""}">
                  <button type="button" class="tc-copy" data-mode="${mode}" data-key="${k}" title="نسخ · Copy">${TC_COPY}</button>
                </div>
              </div>
            </div>`).join("")}
        </div>
      </div>`).join("") + `</div>`;
    $$("#colorsEditor .tc-copy").forEach((b) =>
      b.addEventListener("click", () => {
        const inp = $(`#colorsEditor input[type="text"][data-mode="${b.dataset.mode}"][data-key="${b.dataset.key}"]`);
        if (inp && navigator.clipboard) navigator.clipboard.writeText(inp.value).catch(() => {});
      })
    );
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
    if (url) { $("#hero_image").value = url; saveSection("hero"); }
  });
  $("#about_image_btn").addEventListener("click", () => $("#about_image_file").click());
  $("#about_image_file").addEventListener("change", async (e) => {
    const url = await uploadImage(e.target.files[0]);
    if (url) { $("#about_image").value = url; saveSection("about"); }
  });

  /* ---------- Save ---------- */
  function syncPortfolioFromForm() {
    $$("#portfolioEditor [data-work]").forEach((row) => {
      const i = +row.dataset.work;
      if (!content.portfolio[i]) return;
      content.portfolio[i].title_ar = row.querySelector(".w-title-ar").value;
      content.portfolio[i].title_en = row.querySelector(".w-title-en").value;
      content.portfolio[i].category_ar = row.querySelector(".w-cat-ar").value;
      content.portfolio[i].category_en = row.querySelector(".w-cat-en").value;
      content.portfolio[i].img_opacity = +row.querySelector(".w-opacity").value;
    });
  }

  function syncDesignsFromForm() {
    $$("#designsEditor [data-design]").forEach((row) => {
      const i = +row.dataset.design;
      if (!content.designs[i]) return;
      content.designs[i].title_ar = row.querySelector(".d-title-ar").value;
      content.designs[i].title_en = row.querySelector(".d-title-en").value;
      content.designs[i].category_ar = row.querySelector(".d-cat-ar").value;
      content.designs[i].category_en = row.querySelector(".d-cat-en").value;
      content.designs[i].img_opacity = +row.querySelector(".d-opacity").value;
    });
  }

  async function upsert(key, value) {
    return supabase.from("site_content").upsert({ key, value });
  }

  const SAVERS = {
    hero: async () => {
      syncStatsFromForm();
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
      syncServicesFromForm();
      return (await upsert("services", content.services)).error;
    },
    portfolio: async () => {
      syncPortfolioFromForm();
      await supabase.from("portfolio_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = content.portfolio.map((w, i) => ({
        title_ar: w.title_ar, title_en: w.title_en, category: w.category,
        category_ar: w.category_ar || "", category_en: w.category_en || "",
        image_url: w.image, sort_order: i, visible: true, img_opacity: w.img_opacity || 100
      }));
      if (!rows.length) return null;
      return (await supabase.from("portfolio_items").insert(rows)).error;
    },
    designs: async () => {
      syncDesignsFromForm();
      await supabase.from("designs_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const rows = (content.designs || []).map((w, i) => ({
        title_ar: w.title_ar, title_en: w.title_en, category: w.category || "",
        category_ar: w.category_ar || "", category_en: w.category_en || "",
        image_url: w.image, sort_order: i, visible: true, img_opacity: w.img_opacity || 100
      }));
      if (!rows.length) return null;
      return (await supabase.from("designs_items").insert(rows)).error;
    },
    contact: async () => {
      content.contact = Object.assign({}, content.contact, {
        email: $("#contact_email").value, phone: $("#contact_phone").value,
        whatsapp: $("#contact_whatsapp").value,
        linkedin: $("#contact_linkedin").value,
        facebook: $("#contact_facebook").value,
        instagram: $("#contact_instagram").value
      });
      delete content.contact.location_ar;
      delete content.contact.location_en;
      syncFormFieldsFromDom();
      const cfNew = Object.assign({}, content.contact_form);
      CF_TEXT_KEYS.forEach((k) => { const el = $("#cf_" + k); if (el) cfNew[k] = el.value; });
      const inboxEl = $("#cf_inbox_email");
      if (inboxEl) cfNew.inbox_email = inboxEl.value.trim();
      content.contact_form = cfNew;
      const e1 = (await upsert("contact", content.contact)).error;
      if (e1) return e1;
      return (await upsert("contact_form", content.contact_form)).error;
    },
    theme: async () => {
      $$('#colorsEditor input[type="text"]').forEach((inp) => {
        content.theme[inp.dataset.mode][inp.dataset.key] = inp.value;
      });
      return (await upsert("theme", content.theme)).error;
    }
  };

  /* ---------- Auto-save: any edit in a panel saves itself ---------- */
  const PANEL_TO_SAVER = { hero: "hero", about: "about", services: "services", portfolio: "portfolio", designs: "designs", contact: "contact", colors: "theme" };
  const autoSaveTimers = {};
  let saving = false;
  const pendingSaves = [];

  async function saveSection(key) {
    if (saving) { if (!pendingSaves.includes(key)) pendingSaves.push(key); return; }
    saving = true;
    const status = $("#status-" + key);
    if (status) { status.className = "save-status"; status.textContent = "..."; }
    try {
      const err = await SAVERS[key]();
      if (status) {
        if (err) { status.textContent = "خطأ: " + err.message; status.classList.add("err"); }
        else { status.textContent = "تم الحفظ ✓ " + new Date().toLocaleTimeString(); status.classList.add("ok"); }
      }
    } finally {
      saving = false;
      if (pendingSaves.length) saveSection(pendingSaves.shift());
    }
  }

  function scheduleAutoSave(panel) {
    const key = PANEL_TO_SAVER[panel];
    if (!key) return;
    clearTimeout(autoSaveTimers[key]);
    autoSaveTimers[key] = setTimeout(() => saveSection(key), 1400);
  }

  $("#adminShell").addEventListener("input", (e) => {
    const panel = e.target.closest(".admin-panel");
    if (panel) scheduleAutoSave(panel.dataset.panel);
  });

  $$("[data-save]").forEach((btn) => {
    btn.addEventListener("click", () => saveSection(btn.dataset.save));
  });

  $("#addFormField").addEventListener("click", () => {
    syncFormFieldsFromDom();
    const cf = (content.contact_form = normCF(content.contact_form));
    const fields = cf.fields || (cf.fields = []);
    fields.push({ id: "f" + Date.now().toString(36), type: "text", builtin: false, visible: true, label_ar: "", label_en: "", ph_ar: "", ph_en: "" });
    renderFormFieldsEditor();
    saveSection("contact");
  });

  /* ---------- Messages ---------- */
  async function loadMessages() {
    const list = $("#messagesList");
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) { list.innerHTML = "<p>" + error.message + "</p>"; return; }
    if (!data || !data.length) { list.innerHTML = "<p style='color:var(--muted)'>لا رسائل بعد · No messages yet.</p>"; return; }
    list.innerHTML = data.map((m) => `
      <div class="msg-item ${m.read ? "" : "unread"}" data-mid="${m.id}">
        <div class="meta"><span><b>${esc(m.name || "")}</b> — ${esc(m.email || "")}</span><span style="display:flex;align-items:center;gap:8px">${new Date(m.created_at).toLocaleString()}<button type="button" class="small-btn danger msg-del" data-mid="${m.id}" title="حذف · Delete" style="padding:4px 8px">${TRASH}</button></span></div>
        <p>${esc(m.message || "")}</p>
      </div>`).join("");
    $$("#messagesList .msg-del").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!confirm("حذف هذه الرسالة نهائياً؟ · Delete this message permanently?")) return;
        const { error: dErr } = await supabase.from("contact_messages").delete().eq("id", b.dataset.mid);
        if (dErr) { alert("Delete failed: " + dErr.message); return; }
        loadMessages();
      })
    );
  }

  /* ---------- Helpers ---------- */
  function lines(sel) { return $(sel).value.split("\n").map((x) => x.trim()).filter(Boolean); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
