/* ENCLAV — HEIC→JPG converter engine (migracja z https://heic2jpg-dys.pages.dev/ — source: .27:/root/heic2jpg-repo).
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
      tool_hero_b: "Darmowy konwerter HEIC na JPG. Konwertuj zdjęcia HEIC i HEIF bezpośrednio w przeglądarce. Przetwarzanie odbywa się lokalnie, bez przesyłania plików na serwer.",
      tool_hero_c: "Bez konta i bez opłat. Konwertuj wiele zdjęć jednocześnie i pobieraj wyniki pojedynczo lub w archiwum ZIP.",
      badge: "Zdjęcia nie są wysyłane",
      hint: "Otwórz narzędzia deweloperskie przeglądarki (DevTools), przejdź do zakładki Network i uruchom konwersję. Możesz również odciąć dostęp do internetu po pierwszym załadowaniu strony — konwersja i pobieranie wyników nadal działają.",
      proof_title: "Możesz to sprawdzić samodzielnie",
      proof_lead: "Cały proces — plik, silnik WASM i wynik — dzieje się wewnątrz Twojego urządzenia. Chmura jest na zewnątrz i nie dostaje nic.",
      live_idle: "Licznik aktualizuje się podczas konwersji.",
      live: "Podczas konwersji: {n} żądań sieciowych — zdjęcia pozostają na Twoim urządzeniu",
      net_since: "Od załadowania strony",
      net_conv: "Podczas konwersji",
      net_req: "żądań",
      net_note: "Licznik opiera się na API Resource Timing przeglądarki i pokazuje żądania zasobów strony oraz pobrane bajty. Konwerter nie ma funkcji wysyłania plików, a CSP ogranicza wybrane połączenia sieciowe.",
      conv_title: "Darmowy konwerter HEIC na JPG",
      conv_intro: "Darmowy konwerter HEIC na JPG. Konwertuj zdjęcia HEIC i HEIF bezpośrednio w przeglądarce. Przetwarzanie odbywa się lokalnie, bez przesyłania plików na serwer.",
      pick: "Wybierz zdjęcia",
      drop: "Albo przeciągnij tu pliki .heic / .heif. Możesz dodać kilka naraz.",
      quality: "Jakość JPG",
      maxside: "Maksymalny dłuższy bok",
      ms_orig: "Oryginalny rozmiar (bez skalowania)",
      aszip: "Pobierz wyniki jako ZIP (2 lub więcej plików)",
      convert: "Konwertuj",
      zip: "Pobierz ZIP",
      clear: "Wyczyść",
      w1t: "WebAssembly zamiast serwera",
      w1d: "Dekoder libheif działa lokalnie w przeglądarce dzięki WebAssembly. Zdjęcia nie są wysyłane do zewnętrznej usługi konwersji.",
      w2t: "Działa offline",
      w2d: "Po pierwszym załadowaniu strony możesz odciąć dostęp do internetu i nadal konwertować zdjęcia oraz pobierać wyniki.",
      w3t: "Zawsze za darmo",
      w3d: "Bez rejestracji, abonamentu i opłat za konwersję.",
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
      clouds: "POZA URZĄDZENIEM",
      finale: "Nic nie wysłano.",
      finale2: "0 requestów • 0 bajtów",
      st_wait: "czeka",
      st_working: "konwersja…",
      st_ok: "gotowy",
      st_err: "błąd",
      err_type: "nieobsługiwany lub uszkodzony format obrazu",
      err_decode: "nie udało się zdekodować",
      status_idle: "Dodaj pliki i kliknij Konwertuj.",
      status_run: "Konwersja {done}/{total}…",
      status_done: "Gotowe: {ok} OK, {err} błędów.",
      need_files: "Najpierw dodaj pliki HEIC/HEIF.",
      zip_name: "heic-jpg.zip",
      jpg_suffix: ".jpg",
      how: "Jak to działa",
      how_pl: "Jak to działa",
      cta_convert: "Konwertuj",
      cta_how: "Jak to działa"
    },
    en: {
      support: "Support",
      hero_a: "Your photos never leave",
      hero_b: "your device.",
      hero_sub: "Free HEIC → JPG converter powered by WebAssembly — everything happens on your device. 0 bytes sent to any server.",
      tool_hero_a: "Your photos never leave your device.",
      tool_hero_b: "Convert HEIC and HEIF photos to JPG directly in your browser. Your photos are processed locally and are not uploaded to a server.",
      tool_hero_c: "No account or subscription required. Convert multiple photos at once and download your results individually or as a ZIP archive.",
      badge: "Your photos are not uploaded",
      hint: "Open your browser's Developer Tools (DevTools), select Network, and start a conversion. You can also disconnect from the internet after the page has loaded — conversion and downloading keep working.",
      proof_title: "Verify it yourself",
      proof_lead: "The whole pipeline — file, WASM engine and result — happens inside your device. The cloud is outside and gets nothing.",
      live_idle: "The counter updates during conversion.",
      live: "During conversion: {n} network requests — your photos stay on your device",
      net_since: "Since page load",
      net_conv: "During conversion",
      net_req: "requests",
      net_note: "This counter uses the browser's Resource Timing API and counts page resource requests and downloaded bytes. The converter has no upload functionality, and the CSP restricts selected network connections.",
      conv_title: "Free HEIC to JPG Converter",
      conv_intro: "Convert HEIC and HEIF photos to JPG directly in your browser. Your photos are processed locally and are not uploaded to a server.",
      pick: "Choose photos",
      drop: "Or drag and drop .heic / .heif files here. You can add several at once.",
      quality: "JPG quality",
      maxside: "Maximum long edge",
      ms_orig: "Original (no scaling)",
      aszip: "Download results as a ZIP (2+ files)",
      convert: "Convert",
      zip: "Download ZIP",
      clear: "Clear",
      w1t: "WebAssembly, not a server",
      w1d: "The libheif decoder runs directly in your browser using WebAssembly. Your photos are never sent to an external conversion service.",
      w2t: "Works offline",
      w2d: "After the page has loaded, disconnect from the internet. You can still convert multiple photos and download JPG results or a ZIP archive.",
      w3t: "Always free",
      w3d: "No account, subscription or payment required.",
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
      clouds: "OUTSIDE THE DEVICE",
      finale: "Nothing uploaded.",
      finale2: "0 requests • 0 bytes",
      st_wait: "queued",
      st_working: "converting…",
      st_ok: "ready",
      st_err: "error",
      err_type: "unsupported or damaged image format",
      err_decode: "failed to decode",
      status_idle: "Add files and hit Convert.",
      status_run: "Converting {done}/{total}…",
      status_done: "Done: {ok} OK, {err} errors.",
      need_files: "Add HEIC/HEIF files first.",
      zip_name: "heic-jpg.zip",
      jpg_suffix: ".jpg",
      how: "How it works",
      cta_convert: "Convert"
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

  /* ---------------- network monitor (proof) ----------------
     Pomiar oparty wyłącznie na Resource Timing API: liczba wpisów zasobów i suma ich
     transferSize. API nie udostępnia bajtów wysłanych, dlatego licznik NIE deklaruje
     zmierzonej wysyłki — opis w interfejsie mówi wprost, że konwerter nie zawiera kodu
     wysyłki plików, a CSP (connect-src 'none') blokuje fetch/XHR/WebSocket.
     „Podczas konwersji" = różnica wpisów i bajtów między startem a stanem bieżącym. */
  function netStats() {
    var req = 0, bytes = 0;
    try {
      var rs = performance.getEntriesByType("resource");
      req = rs.length;
      for (var i = 0; i < rs.length; i++) bytes += rs[i].transferSize || 0;
    } catch (e) { /* API niedostępne -> zera, bez sztucznych wartości */ }
    return { req: req, bytes: bytes };
  }
  function fmtBytes(n) {
    if (!n || n < 0) return "0 B";
    if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
    if (n >= 1024) return Math.round(n / 1024) + " kB";
    return n + " B";
  }
  var convMark = null;
  var convWindow = { req: 0, bytes: 0 };
  function updateNet() {
    var now = netStats();
    var el = document.getElementById("netCount");
    if (el) el.textContent = String(now.req);
    var eb = document.getElementById("netBytes");
    if (eb) eb.textContent = fmtBytes(now.bytes);
    if (convMark) convWindow = { req: Math.max(0, now.req - convMark.req), bytes: Math.max(0, now.bytes - convMark.bytes) };
    var ec = document.getElementById("netConv");
    if (ec) ec.textContent = String(convWindow.req);
    var ecb = document.getElementById("netConvBytes");
    if (ecb) ecb.textContent = fmtBytes(convWindow.bytes);
    var live = document.getElementById("liveNet");
    if (live && convMark) live.textContent = fill(t("live"), { n: convWindow.req });
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

  /*
   * Rozpoznawanie po sygnaturze, nie po nazwie/MIME. ISO-BMFF ftyp zawiera
   * markę główną oraz listę marek kompatybilnych — sprawdzamy wszystkie.
   */
  function sniffImageFormat(file) {
    return file.slice(0, 65536).arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return "jpeg";
      }
      var heifBrands = { heic: 1, heix: 1, hevc: 1, hevx: 1, mif1: 1, msf1: 1 };
      // ftyp jest zwykle pierwszym boxem; skan ograniczonego nagłówka pozwala
      // obsłużyć pliki z poprzedzającym boxem oraz różne marki kompatybilności.
      for (var pos = 0; pos + 16 <= bytes.length; pos++) {
        if (bytes[pos + 4] !== 0x66 || bytes[pos + 5] !== 0x74 ||
            bytes[pos + 6] !== 0x79 || bytes[pos + 7] !== 0x70) continue;
        var size = (bytes[pos] * 0x1000000) + (bytes[pos + 1] << 16) +
          (bytes[pos + 2] << 8) + bytes[pos + 3];
        var end = size === 1
          ? bytes.length
          : Math.min(bytes.length, pos + (size >= 16 ? size : bytes.length - pos));
        var brandStart = pos + 8 + (size === 1 ? 8 : 0);
        for (var brandPos = brandStart; brandPos + 4 <= end; brandPos += 4) {
          var brand = String.fromCharCode(bytes[brandPos], bytes[brandPos + 1], bytes[brandPos + 2], bytes[brandPos + 3]);
          if (heifBrands[brand]) return "heif";
        }
      }
      return "unsupported";
    });
  }

  function jpgName(name, idx) {
    var base = String(name || "photo").replace(/\.(heic|heif|jpe?g)$/i, "");
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

  function decodeOne(file, q, format) {
    if (format === "jpeg") return Promise.resolve([file]);
    return window.heic2any({ blob: file, toType: "image/jpeg", quality: q })
      .then(function (out) { return Array.isArray(out) ? out : [out]; });
  }

  function maybeDownscale(blob, maxSide, q, forceEncode) {
    if (!forceEncode && (!maxSide || maxSide <= 0)) return Promise.resolve(blob);
    function encodeFromImage(image, width, height, close) {
      var w = width, h = height;
      var m = Math.max(w, h);
      if (maxSide > 0 && m > maxSide) {
        var scale = maxSide / m;
        w = Math.round(w * scale); h = Math.round(h * scale);
      }
      if (!forceEncode && w === width && h === height) {
        if (close) close();
        return Promise.resolve(blob);
      }
      var cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      var ctx = cv.getContext("2d");
      ctx.drawImage(image, 0, 0, w, h);
      if (close) close();
      return new Promise(function (res) {
        cv.toBlob(function (b) { res(b || (forceEncode ? null : blob)); }, "image/jpeg", q);
      });
    }
    if (window.createImageBitmap) return window.createImageBitmap(blob).then(function (bmp) {
      var w = bmp.width, h = bmp.height;
      return encodeFromImage(bmp, w, h, bmp.close ? function () { bmp.close(); } : null);
    }).catch(function () {
      if (!forceEncode) return blob;
      return imageFallback(blob, encodeFromImage);
    });
    if (!forceEncode) return Promise.resolve(blob);
    return imageFallback(blob, encodeFromImage);
  }

  function imageFallback(blob, encodeFromImage) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var image = new Image();
      image.onload = function () {
        encodeFromImage(image, image.naturalWidth, image.naturalHeight).then(resolve, reject)
          .then(function () { URL.revokeObjectURL(url); }, function () { URL.revokeObjectURL(url); });
      };
      image.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Image decode failed")); };
      image.src = url;
    });
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
    state.running = true;
    convertBtn.disabled = true;
    zipBtn.disabled = true;
    state.results = [];
    progress.classList.add("show");
    convMark = netStats();
    convWindow = { req: 0, bytes: 0 };
    updateNet();
    var q = (parseInt(quality.value, 10) || 92) / 100;
    var ms = parseInt(maxside.value, 10) || 0;
    var done = 0, ok = 0, errs = 0;
    var total = state.entries.length;

    function step(i) {
      if (i >= total) {
        state.running = false;
        convertBtn.disabled = false;
        zipBtn.disabled = state.results.length === 0;
        barFill.style.width = "100%";
        updateNet();
        // auto-ZIP ustawia własny status „konwersja…" — końcowy komunikat musi wygrać
        if (asZip.checked && state.results.length > 1) doZip(true);
        setStatus(fill(t("status_done"), { ok: ok, err: errs }));
        return;
      }
      var e = state.entries[i];
      e.status = "run"; e.msg = ""; renderList();
      setStatus(fill(t("status_run"), { done: done + 1, total: total }));
      (function (entry) {
        sniffImageFormat(entry.file).then(function (format) {
          if (format === "unsupported") {
            entry.status = "err"; entry.msg = t("err_type"); errs++;
            return;
          }
          if (format === "heif" && typeof window.heic2any !== "function") {
            entry.status = "err"; entry.msg = t("err_decode") + " (lib)"; errs++;
            return;
          }
          return decodeOne(entry.file, q, format).then(function (blobs) {
          var chain = Promise.resolve();
          blobs.forEach(function (b, bi) {
            chain = chain.then(function () {
              return maybeDownscale(b, ms, q, format === "jpeg").then(function (finalBlob) {
                if (!finalBlob) throw new Error("JPEG encoding failed");
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
          });
        }).catch(function () {
          entry.status = "err"; entry.msg = t("err_decode");
          errs++;
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
  var liveNet = document.getElementById("liveNet");
  if (liveNet) liveNet.textContent = t("live_idle");
  updateNet();
  window.setInterval(updateNet, 2000);
})();
