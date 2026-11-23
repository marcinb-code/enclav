'use strict';
/* ENCLAV — mobilne menu (D-027): dropdown zamyka się automatycznie, gdy użytkownik
   przewinie stronę albo dotknie/kliknie poza obszarem menu. Escape również zamyka.
   Markup pozostaje natywnym <details class="mobile-nav"> — bez JS menu nadal działa. */
(function () {
  function init() {
    var nav = document.querySelector('.mobile-nav');
    if (!nav || !('open' in nav)) return;

    function close() {
      if (nav.open) nav.open = false;
    }

    /* Przewijanie strony (pionowe lub poziome) zamyka panel. Nasłuch bez capture,
       więc przewijanie listy wewnątrz panelu nie zamyka menu. */
    window.addEventListener('scroll', close, { passive: true });

    /* Dotknięcie/klik poza menu — pointerdown pokrywa mysz i dotyk w nowoczesnych
       przeglądarkach; touchstart to fallback dla starszych Safari/iOS. */
    function outside(event) {
      if (!nav.open) return;
      if (event.target instanceof Node && nav.contains(event.target)) return;
      close();
    }
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('touchstart', outside, { passive: true, capture: true });

    /* Escape zamyka panel i wraca fokus na trigger. */
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !nav.open) return;
      close();
      var summary = nav.querySelector('summary');
      if (summary) summary.focus();
    });

    /* Wybór pozycji menu zamyka panel (nawigacja i tak przeładowuje stronę). */
    nav.addEventListener('click', function (event) {
      if (event.target instanceof Node && event.target.closest && event.target.closest('a')) close();
    });
  }

  /* Strony narzędziowe ładują skrypty w <head>; pozostałe na końcu <body>.
     Inicjalizacja musi poczekać na DOM w obu przypadkach. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
