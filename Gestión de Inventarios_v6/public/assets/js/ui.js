// assets/js/ui.js
// Helpers de interfaz: toasts y modal de confirmación
(function () {
  /**
   * ensureContainer
   * Asegura que exista el contenedor donde se colocarán los toasts.
   * Si no existe, lo crea y lo añade al body.
   * Retorna el elemento contenedor.
   * @returns {HTMLElement}
   */
  function ensureContainer() {
    let c = document.querySelector('.toast-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }
  /**
   * showToast(message, type, duration)
   * Muestra un pequeño mensaje flotante (toast) en pantalla.
   * - message: texto a mostrar.
   * - type: 'info'|'success'|'error'|'warning' (añade clase para estilo).
   * - duration: tiempo en ms antes de ocultarse.
   */
  function showToast(message, type = 'info', duration = 3000) {
    const container = ensureContainer();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    container.appendChild(t);
    // provocar reflow para permitir la transición CSS
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  /**
   * confirmModal(message) -> Promise<boolean>
   * Crea y muestra un modal de confirmación no bloqueante.
   * Devuelve una Promise que se resuelve con true (confirmado) o false (cancelado).
   */
  function confirmModal(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';

      const box = document.createElement('div');
      box.className = 'confirm-box';

      const p = document.createElement('p');
      p.textContent = message;

      const actions = document.createElement('div');
      actions.className = 'confirm-actions';

      const btnCancel = document.createElement('button');
      btnCancel.className = 'btn-cancel';
      btnCancel.textContent = 'Cancelar';

      const btnOk = document.createElement('button');
      btnOk.className = 'btn-confirm';
      btnOk.textContent = 'Confirmar';

      actions.appendChild(btnCancel);
      actions.appendChild(btnOk);
      box.appendChild(p);
      box.appendChild(actions);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      function cleanup(val) {
        overlay.remove();
        resolve(val);
      }

      btnCancel.addEventListener('click', () => cleanup(false));
      btnOk.addEventListener('click', () => cleanup(true));

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }

  // Exportar los helpers globalmente en window.ui
  window.ui = {
    showToast,
    confirmModal,
  };
})();
