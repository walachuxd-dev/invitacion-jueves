/* =====================================================
   Invitación · Jueves — lógica de "Confirmar asistencia"
   =====================================================

   Qué hace este script (y qué NO hace):
   - Al tocar el botón, cambia su estado visual (de "Confirmar mi
     asistencia" a "¡Asistencia confirmada!") y lanza un pequeño
     estallido de confeti desde el botón.
   - Recuerda la elección en ESTE dispositivo (localStorage), así
     que si la persona vuelve a entrar desde el mismo celular, ve
     su botón ya confirmado.
   - NO hace ninguna llamada a internet, no cuenta cuántas personas
     confirmaron en total y no depende de ningún servicio externo.
     Es 100% visual/local.
   ===================================================== */

(function () {
  'use strict';

  // ---- 1. Configuración ----
  var LOCAL_KEY = 'rsvp-jueves-mi-vida-es-mi-testimonio';
  var CONFETTI_COLORS = ['#ff2e88', '#31e4e0', '#ffd166', '#ffffff', '#a78bfa'];
  var CONFETTI_COUNT = 28;

  // ---- 2. Referencias al DOM ----
  var btn = document.getElementById('rsvpBtn');
  var note = document.getElementById('rsvpNote');

  var checkIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var heartIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>';

  // ---- 3. Helpers de localStorage (estado de ESTE dispositivo) ----
  function isConfirmedLocally() {
    try {
      return window.localStorage.getItem(LOCAL_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setConfirmedLocally(value) {
    try {
      window.localStorage.setItem(LOCAL_KEY, value ? '1' : '0');
    } catch (e) {
      /* si el navegador bloquea localStorage, seguimos igual */
    }
  }

  // ---- 4. Pintar el estado del botón ----
  function renderButton(confirmed) {
    btn.classList.toggle('confirmed', confirmed);
    if (confirmed) {
      btn.innerHTML = checkIcon + '<span>¡Asistencia confirmada!</span>';
      note.textContent = 'Genial, ¡te esperamos el jueves! Vuelve a tocar si cambias de idea.';
      note.classList.add('on');
    } else {
      btn.innerHTML = heartIcon + '<span>Confirmar mi asistencia</span>';
      note.textContent = 'Toca para avisar que vienes.';
      note.classList.remove('on');
    }
  }

  // ---- 5. Confeti: una explosión de piezas de colores desde el botón ----
  function launchConfetti(originEl) {
    var rect = originEl.getBoundingClientRect();
    var originX = rect.left + rect.width / 2;
    var originY = rect.top + rect.height / 2;

    for (var i = 0; i < CONFETTI_COUNT; i++) {
      createConfettiPiece(originX, originY);
    }
  }

  function createConfettiPiece(originX, originY) {
    var piece = document.createElement('div');
    piece.className = 'confetti-piece';

    var color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    var size = 6 + Math.random() * 6; // 6px a 12px
    var isCircle = Math.random() > 0.5;

    piece.style.background = color;
    piece.style.width = size + 'px';
    piece.style.height = size + 'px';
    piece.style.borderRadius = isCircle ? '50%' : '2px';
    piece.style.left = originX + 'px';
    piece.style.top = originY + 'px';
    piece.style.opacity = '1';
    piece.style.transform = 'translate(-50%, -50%) rotate(0deg)';

    document.body.appendChild(piece);

    // Dirección y distancia aleatorias (explosión hacia todos lados,
    // con un poco más de fuerza hacia arriba).
    var angle = Math.random() * Math.PI * 2;
    var distance = 60 + Math.random() * 110;
    var dx = Math.cos(angle) * distance;
    var dy = Math.sin(angle) * distance - 40;
    var rotation = Math.random() * 720 - 360;

    // Forzamos un reflow para que el navegador registre el estado
    // inicial antes de animar al estado final.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        piece.style.transform =
          'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) rotate(' + rotation + 'deg)';
        piece.style.opacity = '0';
      });
    });

    piece.addEventListener('transitionend', function () {
      piece.remove();
    });

    // Red de seguridad por si transitionend no dispara (pestaña en
    // segundo plano, etc.).
    setTimeout(function () {
      if (piece.parentNode) piece.remove();
    }, 1200);
  }

  // ---- 6. Estado inicial al cargar la página ----
  var confirmed = isConfirmedLocally();
  renderButton(confirmed);

  // ---- 7. Click del botón ----
  btn.addEventListener('click', function () {
    confirmed = !confirmed;
    setConfirmedLocally(confirmed);
    renderButton(confirmed);

    if (confirmed) {
      launchConfetti(btn);
    }
  });
})();
