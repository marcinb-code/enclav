'use strict';
/* ENCLAV — otwieranie/zamykanie ukrytej sekcji #contact-form + wysyłka przez Resend (D-021).
   Wywoławcze: linki/przyciski z atrybutem data-open-contact.
   Bez JS: href="#contact-form" działa jako fallback (sekcja pozostaje ukryta),
   formularz zachowuje natywny action="mailto:..." (fallback transportu). */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  /* #contact-form to <section>; prawdziwy <form> z polami leży wewnątrz — transport operuje na <form>. */
  var f = (form.querySelector && form.querySelector('form')) || form;

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
  f.addEventListener('submit', function (event) {
    event.preventDefault();
    var hp = f.querySelector('input[name="_hp"]');
    if (hp && hp.value) { /* honeypot: udana "wysylka" bez maila */
      setStatus('ok', f.getAttribute('data-done') || 'Dziękujemy — wiadomość wysłana.');
      f.reset();
      return;
    }
    if (!f.reportValidity()) return;
    var body = {
      _section: f.getAttribute('data-section') || 'contact',
      _lang: f.getAttribute('data-lang') || 'en'
    };
    var els = f.querySelectorAll('input, textarea, select');
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (!el.name || el.name === '_hp') continue;
      body[el.name] = el.value;
    }
    var btn = f.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
    var done = function (ok) {
      if (ok) {
        setStatus('ok', f.getAttribute('data-done') || 'Dziękujemy — wiadomość wysłana.');
        if (btn) { btn.disabled = false; btn.style.background = '#34d399'; btn.textContent = f.getAttribute('data-done') || 'Dziękujemy — wiadomość wysłana.'; }
        f.reset();
      } else {
        setStatus('err', f.getAttribute('data-err') || 'Wysyłanie nie powiodło się — napisz do contact@enclav.cc');
        /* niepowodzenie: guzik czarny + info o błędzie */
        if (btn) { btn.disabled = true; btn.style.background = '#09090b'; }
      }
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
