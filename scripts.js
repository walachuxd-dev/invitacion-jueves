/* =====================================================
   Invitación · Jueves — lógica de "Confirmar asistencia"
   =====================================================

   Cómo funciona el contador:
   - Usamos CountAPI (https://countapi.xyz), un servicio gratuito
     y público que guarda un número en un "namespace/key" y lo
     puede sumar o restar con una simple petición GET. No necesita
     backend propio ni configuración: el número que ves es real y
     lo comparten TODOS los que abran esta página, en cualquier
     dispositivo.
   - Cada visitante guarda en su propio navegador (localStorage) si
     YA confirmó, para no sumarse dos veces sin querer y para poder
     "deshacer" su confirmación (eso resta 1 al contador real).
   - Si el visitante no tiene internet o el servicio no responde,
     el botón avisa del error y no altera el contador compartido.

   Para usar esto en tu propio evento:
   1) Cambia NAMESPACE por algo único (por ejemplo el nombre de tu
      iglesia + el nombre del evento, sin espacios).
   2) Cambia KEY si vas a reutilizar este mismo archivo para varios
      días/eventos y quieres un contador distinto para cada uno.
   ===================================================== */

(function () {
  'use strict';

  // ---- 1. Configuración del contador compartido ----
  var COUNTAPI_BASE = 'https://api.countapi.xyz';
  var NAMESPACE = 'idp-zapallal-bajo-jovenes';
  var KEY = 'rsvp-jueves-mi-vida-es-mi-testimonio';
  var LOCAL_KEY = 'rsvp-jueves-mi-vida-es-mi-testimonio'; // clave en localStorage de este dispositivo

  // ---- 2. Referencias al DOM ----
  var btn = document.getElementById('rsvpBtn');
  var countValue = document.getElementById('rsvpCountValue');
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

  // ---- 4. Helpers de CountAPI (contador REAL compartido) ----
  function getCount() {
    var url = COUNTAPI_BASE + '/get/' + NAMESPACE + '/' + KEY;
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('No existe el contador todavía');
        return res.json();
      })
      .then(function (data) {
        return data.value || 0;
      })
      .catch(function () {
        return 0;
      });
  }

  function incrementCount() {
    var url = COUNTAPI_BASE + '/hit/' + NAMESPACE + '/' + KEY;
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudo sumar la confirmación');
        return res.json();
      })
      .then(function (data) {
        return data.value;
      });
  }

  function decrementCount() {
    var url = COUNTAPI_BASE + '/update/' + NAMESPACE + '/' + KEY + '?amount=-1';
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('No se pudo quitar la confirmación');
        return res.json();
      })
      .then(function (data) {
        return data.value;
      });
  }

  // ---- 5. Pintar el estado en pantalla ----
  function renderCount(n) {
    if (typeof n === 'number' && n >= 0) {
      countValue.textContent = n;
    }
  }

  function renderButton(confirmed) {
    btn.classList.toggle('confirmed', confirmed);
    if (confirmed) {
      btn.innerHTML = checkIcon + '<span>¡Asistencia confirmada!</span>';
      note.textContent = 'Genial, ¡te esperamos el jueves! Vuelve a tocar si cambias de idea.';
      note.classList.remove('error');
      note.classList.add('on');
    } else {
      btn.innerHTML = heartIcon + '<span>Confirmar mi asistencia</span>';
      note.textContent = 'Toca para avisar que vienes. El número de arriba se actualiza al momento.';
      note.classList.remove('error');
      note.classList.remove('on');
    }
  }

  function showError(message) {
    note.textContent = message;
    note.classList.remove('on');
    note.classList.add('error');
  }

  // ---- 6. Estado inicial al cargar la página ----
  var confirmed = isConfirmedLocally();
  renderButton(confirmed);

  getCount().then(renderCount);

  // ---- 7. Click del botón: suma o resta del contador real ----
  btn.addEventListener('click', function () {
    var nextState = !confirmed;
    btn.disabled = true;

    var request = nextState ? incrementCount() : decrementCount();

    request
      .then(function (newValue) {
        confirmed = nextState;
        setConfirmedLocally(confirmed);
        renderButton(confirmed);
        renderCount(newValue);
      })
      .catch(function () {
        showError('No pudimos conectarnos para actualizar el contador. Intenta de nuevo en un momento.');
      })
      .finally(function () {
        btn.disabled = false;
      });
  });
})();