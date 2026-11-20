'use strict';
/* ENCLAV — otwieranie/zamykanie ukrytej sekcji #contact-form + wysyłka przez Resend (D-021).
   Wywoławcze: linki/przyciski z atrybutem data-open-contact.
   Bez JS: href="#contact-form" działa jako fallback (sekcja pozostaje ukryta),
   formularz zachowuje natywny action="mailto:..." (fallback transportu). */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* bez obsługi reduced-motion: domyślnie natychmiast */ }

  function openForm() {
    form.style.display = 'block';
    var first = form.querySelector('input:not([name="_hp"]), textarea, select, button');
    if (first) first.focus({ preventScroll: true });
    form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function closeForm() {
    form.style.display = 'none';
  }

  var openers = document.querySelectorAll('[data-open-contact]');
  for (var i = 0; i < openers.length; i++) {
    openers[i].addEventListener('click', function (event) {
      event.preventDefault();
      openForm();
    });
  }
  var close = form.querySelector('.contact-form__close');
  if (close) close.addEventListener('click', closeForm);

  /* ---- transport: POST /contact (CF Pages Function -> Resend); mailto bez JS ---- */
  var status = form.querySelector('.contact-form__status');
  function setStatus(kind, text) {
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
    status.style.color = kind === 'ok' ? '#34d399' : '#f87171';
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var hp = form.querySelector('input[name="_hp"]');
    if (hp && hp.value) { /* honeypot: udana "wysylka" bez maila */
      setStatus('ok', form.getAttribute('data-done') || 'Dziękujemy — wiadomość wysłana.');
      form.reset();
      return;
    }
    if (!form.reportValidity()) return;
    var body = {
      _section: form.getAttribute('data-section') || 'contact',
      _lang: form.getAttribute('data-lang') || 'en'
    };
    var els = form.querySelectorAll('input, textarea, select');
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (!el.name || el.name === '_hp') continue;
      body[el.name] = el.value;
    }
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
    var done = function (ok) {
      if (ok) {
        setStatus('ok', form.getAttribute('data-done') || 'Dziękujemy — wiadomość wysłana.');
        form.reset();
      } else {
        setStatus('err', form.getAttribute('data-err') || 'Wysyłanie nie powiodło się — napisz do contact@enclav.cc');
      }
      if (btn) { btn.disabled = false; btn.textContent = label; }
    };
    fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (j) { return r.status === 200 && j.ok === true; });
    }).then(function (ok) { done(ok); }, function () { done(false); });
  });
})();
