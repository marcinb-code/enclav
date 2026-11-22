/* ENCLAV — HEIC➜JPG converter engine (migracja z https://heic2jpg-dys.pages.dev/ — source: .27:/root/heic2jpg-repo).
   Zgodny z oryginalnym app.js: FileReader + heic2any (libheif WASM) + canvas + JSZip — zero kodu sieciowego.
   CSP strony: connect-src 'none' — engine nie wykonuje żadnego requestu poza własnymi zasobami.
   Migracja ENCLAV: locale PL/EN to oddzielne podstrony /pl/heic-to-jpg/ i /en/heic-to-jpg/ (shared engine). */
(function () {
  "use strict";

  var I18N = {
    pl: {
      support: "Wesprzyj",
      hero_a: "Twoje zdjęcia nigdy nie opuszczają",
      hero_b: "Twojego urządzenia.",
      hero_sub: "Darmowy konwerter HEIC → JPG w technologii WebAssembly — całość dzieje się na Twoim urządzeniu. 0 bajtów wysłanych na serwer.",
      tool_hero_a: "Twoje zdjęcia nie opuszczają Twojego urządzenia.",
      tool_hero_b: "Konwertuj zdjęcia HEIC i HEIF do JPG bezpośrednio w przeglądarce. Bez przesyłania plików, bez konta i bez opłat.",
      badge: "0 requestów • 0 uploadów • działa offline",
      hint: "Nie wierzysz? Otwórz DevTools → Network, odetnij internet po załadowaniu strony — konwersja dalej działa.",
      proof_title: "Zobacz, gdzie są Twoje zdjęcia",
      proof_lead: "Cały proces — plik, silnik WASM i wynik — dzieje się wewnątrz Twojego urządzenia. Chmura jest na zewnątrz i nie dostaje nic.",
      live: "na żywo: 0 requestów • 0 bajtów — wszystko na Twoim urządzeniu",
      net_note: "licznik od załadowania strony — konwersja nie dodaje żadnych",
      conv_title: "Konwerter",
      pick: "Wybierz zdjęcia",
      drop: "…albo upuść pliki .heic / .heif tutaj (wiele naraz)",
      quality: "Jakość JPG",
      maxside: "Maks. dłuższy bok",
      ms_orig: "Oryginał (bez skalowania)",
      aszip: "Pakuj wyniki do ZIP (przy 2+ plikach)",
      convert: "Konwertuj",
      zip: "Pobierz ZIP",
      clear: "Wyczyść",
      w1t: "WebAssembly, nie serwer",
      w1d: "Dekoder libheif działa w Twojej przeglądarce. Plik nie jest nigdzie wysyłany — to wymusza nawet polityka CSP strony.",
      w2t: "Działa offline",
      w2d: "Po załadowaniu odetnij internet — batch i ZIP nadal działają. Tak sprawdzisz obietnicę prywatności.",
      w3t: "Darmowy, bez limitów",
      w3d: "Bez konta i bez limitów. Jeśli Ci pomógł, postaw kawę — link prowadzi na zewnętrzny serwis płatności.",
      coffee: "Postaw kawę za darmowy konwerter",
      privacy_link: "Prywatność: jak to działa i jak zweryfikować",
      fine: "Konwertowana jest pierwsza klatka (Live Photo → 1 JPG). Pełny EXIF nie jest przenoszony. Kliknięcie w link kawy prowadzi na zewnętrzny serwis — sam konwerter nic nie wysyła.",
      device: "TWOJE URZĄDZENIE",
      device_right: "ZDJĘCIA ZOSTAJĄ TUTAJ",
      c1t: "PLIK HEIC",
      c1s: "Zdjęcie · lokalnie",
      c2t: "SILNIK WASM",
      c2s: "libheif · lokalnie",
      c3t: "WYNIK JPG",
      c3s: "Gotowy · lokalnie",
      cloudt: "CHMURA",
      cloud0: "0 BAJTÓW WYSŁANO",
      clouds: "poza urządzeniem",
      finale: "Nic nie wysłano.",
      finale2: "0 requestów • 0 bajtów",
      st_wait: "czeka",
      st_working: "konwersja…",
      st_ok: "gotowy ✓",
      st_err: "błąd",
      err_type: "to nie wygląda na HEIC/HEIF",
      err_decode: "nie udało się zdekodować",
      status_idle: "Dodaj pliki i kliknij Konwertuj.",
      status_run: "Konwersja {done}/{total}…",
      status_done: "Gotowe: {ok} OK, {err} błędów.",
      need_files: "Najpierw dodaj pliki HEIC/HEIF.",
      zip_name: "heic-jpg.zip",
      jpg_suffix: ".jpg",
      how: "Jak to działa",
      how_pl: "Jak to działa",
      cta_convert: "Konwertuj HEIC na JPG",
      cta_how: "Jak to działa"
    },
    en: {
      support: "Support",
      hero_a: "Your photos never leave",
      hero_b: "your device.",
      hero_sub: "Free HEIC → JPG converter powered by WebAssembly — everything happens on your device. 0 bytes sent to any server.",
      tool_hero_a: "Your photos never leave your device.",
      tool_hero_b: "Convert HEIC and HEIF images to JPG directly in your browser. No uploads, no account, no subscription.",
      badge: "0 requests • 0 uploads • works offline",
      hint: "Don't believe it? Open DevTools → Network, disconnect after load — conversion still works.",
      proof_title: "See where your photos are",
      proof_lead: "The whole pipeline — file, WASM engine and result — happens inside your device. The cloud is outside and gets nothing.",
      live: "live: 0 requests • 0 bytes — everything on your device",
      net_note: "counter since page load — conversion adds none",
      conv_title: "Converter",
      pick: "Choose photos",
      drop: "…or drop .heic / .heif files here (batch welcome)",
      quality: "JPG quality",
      maxside: "Max long edge",
      ms_orig: "Original (no scaling)",
      aszip: "Pack results into ZIP (2+ files)",
      convert: "Convert",
      zip: "Download ZIP",
      clear: "Clear",
      w1t: "WebAssembly, not a server",
      w1d: "The libheif decoder runs in your browser. Files are never uploaded — even enforced by this page's CSP policy.",
      w2t: "Works offline",
      w2d: "Disconnect after load — batch and ZIP still work. That's how you verify the privacy promise.",
      w3t: "Free, no limits",
      w3d: "No account, no limits. If it helped, buy a coffee — the link goes to an external payment service.",
      coffee: "Buy a coffee for the free converter",
      privacy_link: "Privacy: how it works and how to verify",
      fine: "Only the first frame is converted (Live Photo → 1 JPG). Full EXIF is not carried over. Clicking the coffee link goes to an external service — the converter itself sends nothing.",
      device: "YOUR DEVICE",
      device_right: "PHOTOS STAY HERE",
      c1t: "HEIC FILE",
      c1s: "Photo · on device",
      c2t: "WASM ENGINE",
      c2s: "libheif · local",
      c3t: "JPG RESULT",
      c3s: "Ready · on device",
      cloudt: "CLOUD",
      cloud0: "0 BYTES SENT",
      clouds: "outside the device",
      finale: "Nothing uploaded.",
      finale2: "0 requests • 0 bytes",
      st_wait: "queued",
      st_working: "converting…",
      st_ok: "ready ✓",
      st_err: "error",
      err_type: "doesn't look like HEIC/HEIF",
      err_decode: "failed to decode",
      status_idle: "Add files and hit Convert.",
      status_run: "Converting {done}/{total}…",
      status_done: "Done: {ok} OK, {err} errors.",
      need_files: "Add HEIC/HEIF files first.",
      zip_name: "heic-jpg.zip",
      jpg_suffix: ".jpg",
      how: "How it works",
      cta_convert: "Convert HEIC to JPG"
    }
  };

  var PATHNAME = (window.location && window.location.pathname) ? window.location.pathname : "/pl/heic-to-jpg/";
  var PAGE_LANG = PATHNAME.indexOf("/en/") === 0 ? "en" : "pl";
  var lang = PAGE_LANG;
  try {
    var stored = window.localStorage.getItem("heic-lang");
    if (stored === "pl" || stored === "en") lang = stored;
  } catch (e) { /* storage blocked -> page default */ }
  if (lang !== PAGE_LANG) {
    try { window.localStorage.setItem("heic-lang", PAGE_LANG); } catch (e) { /* noop */ }
    lang = PAGE_LANG;
  }

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.pl[key] || key; }
  function fill(template, vars) { return String(template).replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; }); }

  function applyI18n() {
    document.documentElement.lang = lang;
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var k = els[i].getAttribute("data-i18n");
      if (I18N[lang][k]) els[i].textContent = I18N[lang][k];
    }
    var svgEls = document.querySelectorAll("[data-i18n-svg]");
    for (var j = 0; j < svgEls.length; j++) {
      var k2 = svgEls[j].getAttribute("data-i18n-svg");
      if (I18N[lang][k2]) svgEls[j].textContent = I18N[lang][k2];
    }
    var plBtn = document.getElementById("langPl");
    var enBtn = document.getElementById("langEn");
    if (plBtn) plBtn.classList.toggle("active", lang === "pl");
    if (enBtn) enBtn.classList.toggle("active", lang === "en");
    renderList();
    if (!state.running) setStatus(t("status_idle"));
  }

  /* ---------------- network monitor (proof) ---------------- */
  var netBase = 0;
  try { netBase = performance.getEntriesByType("resource").length; } catch (e) { }
  function updateNet() {
    var n = 0;
    try { n = performance.getEntriesByType("resource").length - netBase; } catch (e) { }
    if (n < 0) n = 0;
    var el = document.getElementById("netCount");
    if (el) el.textContent = String(n);
  }

  /* ---------------- converter ---------------- */
  var state = { entries: [], running: false, results: [] };

  var dropzone = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var fileList = document.getElementById("fileList");
  var convertBtn = document.getElementById("convertBtn");
  var zipBtn = document.getElementById("zipBtn");
  var clearBtn = document.getElementById("clearBtn");
  var quality = document.getElementById("quality");
  var qualityVal = document.getElementById("qualityVal");
  var maxside = document.getElementById("maxside");
  var asZip = document.getElementById("asZip");
  var progress = document.getElementById("progress");
  var barFill = document.getElementById("barFill");
  var statusLine = document.getElementById("statusLine");

  function setStatus(s) { if (statusLine) statusLine.textContent = s; }

  function isHeicName(name) { return /\.(heic|heif)$/i.test(name || ""); }

  function jpgName(name, idx) {
    var base = String(name || "photo").replace(/\.(heic|heif)$/i, "");
    if (idx > 0) base += "-" + (idx + 1);
    return base + t("jpg_suffix");
  }

  function addFiles(files) {
    for (var i = 0; i < files.length; i++) {
      state.entries.push({ file: files[i], status: "wait", msg: "", url: "", outName: "" });
    }
    renderList();
    convertBtn.disabled = state.entries.length === 0 || state.running;
    if (!state.running) setStatus(t("status_idle"));
  }

  function badgeFor(e) {
    if (e.status === "ok") return '<span class="badge ok">' + t("st_ok") + "</span>";
    if (e.status === "err") return '<span class="badge err">' + t("st_err") + "</span>";
    if (e.status === "run") return '<span class="badge wait">' + t("st_working") + "</span>";
    return '<span class="badge wait">' + t("st_wait") + "</span>";
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function renderList() {
    if (!fileList) return;
    var html = "";
    for (var i = 0; i < state.entries.length; i++) {
      var e = state.entries[i];
      var thumb = e.url ? '<img class="thumb" src="' + e.url + '" alt="">' : '<img class="thumb" alt="">';
      var dl = (e.status === "ok" && e.url) ? '<a class="dl" href="' + e.url + '" download="' + esc(e.outName) + '">↓ JPG</a>' : "";
      var msg = e.msg ? ' <span style="color:#dc2626;font-size:12px">' + esc(e.msg) + "</span>" : "";
      html += "<li>" + thumb + '<span class="name">' + esc(e.file.name) + msg + "</span>" + badgeFor(e) + dl + "</li>";
    }
    fileList.innerHTML = html;
  }

  function decodeOne(file, q) {
    return window.heic2any({ blob: file, toType: "image/jpeg", quality: q })
      .then(function (out) { return Array.isArray(out) ? out : [out]; });
  }

  function maybeDownscale(blob, maxSide, q) {
    if (!maxSide || maxSide <= 0) return Promise.resolve(blob);
    if (!window.createImageBitmap) return Promise.resolve(blob);
    return window.createImageBitmap(blob).then(function (bmp) {
      var w = bmp.width, h = bmp.height;
      var m = Math.max(w, h);
      if (m <= maxSide) { if (bmp.close) bmp.close(); return blob; }
      var s = maxSide / m;
      var cw = Math.round(w * s), ch = Math.round(h * s);
      var cv = document.createElement("canvas");
      cv.width = cw; cv.height = ch;
      var ctx = cv.getContext("2d");
      ctx.drawImage(bmp, 0, 0, cw, ch);
      if (bmp.close) bmp.close();
      return new Promise(function (res) { cv.toBlob(function (b) { res(b || blob); }, "image/jpeg", q); });
    }).catch(function () { return blob; });
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    window.setTimeout(function () {
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, 100);
  }

  function runConvert() {
    if (state.running || state.entries.length === 0) {
      if (state.entries.length === 0) setStatus(t("need_files"));
      return;
    }
    if (typeof window.heic2any !== "function") {
      setStatus(t("err_decode") + " (lib)");
      return;
    }
    state.running = true;
    convertBtn.disabled = true;
    zipBtn.disabled = true;
    state.results = [];
    progress.classList.add("show");
    var q = (parseInt(quality.value, 10) || 92) / 100;
    var ms = parseInt(maxside.value, 10) || 0;
    var done = 0, ok = 0, errs = 0;
    var total = state.entries.length;

    function step(i) {
      if (i >= total) {
        state.running = false;
        convertBtn.disabled = false;
        zipBtn.disabled = state.results.length === 0;
        setStatus(fill(t("status_done"), { ok: ok, err: errs }));
        barFill.style.width = "100%";
        if (asZip.checked && state.results.length > 1) doZip(true);
        return;
      }
      var e = state.entries[i];
      e.status = "run"; e.msg = ""; renderList();
      setStatus(fill(t("status_run"), { done: done + 1, total: total }));
      (function (entry) {
        if (!isHeicName(entry.file.name)) {
          entry.status = "err"; entry.msg = t("err_type");
          errs++; done++;
          barFill.style.width = Math.round((done / total) * 100) + "%";
          renderList(); step(i + 1);
          return;
        }
        decodeOne(entry.file, q).then(function (blobs) {
          var chain = Promise.resolve();
          blobs.forEach(function (b, bi) {
            chain = chain.then(function () {
              return maybeDownscale(b, ms, q).then(function (finalBlob) {
                var outName = blobs.length > 1 ? jpgName(entry.file.name, bi) : jpgName(entry.file.name, 0);
                var url = URL.createObjectURL(finalBlob);
                state.results.push({ name: outName, blob: finalBlob });
                if (bi === 0) { entry.url = url; entry.outName = outName; }
              });
            });
          });
          return chain.then(function () {
            entry.status = "ok"; ok++;
          }).catch(function () {
            entry.status = "err"; entry.msg = t("err_decode"); errs++;
          });
        }).catch(function () {
          entry.status = "err"; entry.msg = t("err_decode");
        }).then(function () {
          done++;
          barFill.style.width = Math.round((done / total) * 100) + "%";
          renderList(); step(i + 1);
        });
      })(e);
    }
    step(0);
  }

  function doZip(auto) {
    if (state.results.length === 0) { if (!auto) setStatus(t("need_files")); return; }
    if (typeof window.JSZip !== "function") return;
    setStatus(fill(t("status_run"), { done: state.results.length, total: state.results.length }));
    var zip = new window.JSZip();
    for (var i = 0; i < state.results.length; i++) {
      zip.file(state.results[i].name, state.results[i].blob);
    }
    zip.generateAsync({ type: "blob" }).then(function (content) {
      downloadBlob(content, t("zip_name"));
      if (!auto) setStatus(fill(t("status_done"), { ok: state.results.length, err: 0 }));
    });
  }

  function clearAll() {
    for (var i = 0; i < state.entries.length; i++) {
      if (state.entries[i].url) { try { URL.revokeObjectURL(state.entries[i].url); } catch (e) { } }
    }
    state.entries = []; state.results = [];
    renderList(); barFill.style.width = "0";
    progress.classList.remove("show");
    convertBtn.disabled = true; zipBtn.disabled = true;
    setStatus(t("status_idle"));
    try { fileInput.value = ""; } catch (e) { }
  }

  /* events */
  var pickBtn = document.getElementById("pickBtn");
  if (pickBtn) pickBtn.addEventListener("click", function (ev) { ev.stopPropagation(); fileInput.click(); });
  if (dropzone) {
    dropzone.addEventListener("click", function () { fileInput.click(); });
    dropzone.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fileInput.click(); } });
  }
  if (fileInput) fileInput.addEventListener("change", function () {
    if (fileInput.files && fileInput.files.length) addFiles(fileInput.files);
    try { fileInput.value = ""; } catch (e) { }
  });
  if (dropzone) {
    ["dragenter", "dragover"].forEach(function (evn) { dropzone.addEventListener(evn, function (ev) { ev.preventDefault(); dropzone.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (evn) { dropzone.addEventListener(evn, function (ev) { ev.preventDefault(); dropzone.classList.remove("over"); }); });
    dropzone.addEventListener("drop", function (ev) { if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) addFiles(ev.dataTransfer.files); });
  }
  if (quality) quality.addEventListener("input", function () { if (qualityVal) qualityVal.textContent = quality.value; });
  if (convertBtn) convertBtn.addEventListener("click", runConvert);
  if (zipBtn) zipBtn.addEventListener("click", function () { doZip(false); });
  if (clearBtn) clearBtn.addEventListener("click", clearAll);

  function switchLang(next) {
    if (next === lang) return;
    try { window.localStorage.setItem("heic-lang", next); } catch (e) { }
    lang = next;
    document.documentElement.lang = lang;
    applyI18n();
    if (next !== PAGE_LANG) {
      window.location.href = next === "pl" ? "/pl/heic-to-jpg/" : "/en/heic-to-jpg/";
    }
  }
  var langPlBtn = document.getElementById("langPl");
  var langEnBtn = document.getElementById("langEn");
  if (langPlBtn) langPlBtn.addEventListener("click", function () { switchLang("pl"); });
  if (langEnBtn) langEnBtn.addEventListener("click", function () { switchLang("en"); });

  /* init */
  applyI18n();
  updateNet();
  window.setInterval(updateNet, 2000);
})();
