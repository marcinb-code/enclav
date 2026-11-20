'use strict';
/* ENCLAV — otwieranie/zamykanie ukrytej sekcji #contact-form.
   Wywoławcze: linki/przyciski z atrybutem data-open-contact.
   Bez JS: href="#contact-form" działa jako fallback (sekcja pozostaje ukryta). */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* bez obsługi reduced-motion: domyślnie natychmiast */ }

  function openForm() {
    form.style.display = 'block';
    var first = form.querySelector('input, textarea, select, button');
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
})();