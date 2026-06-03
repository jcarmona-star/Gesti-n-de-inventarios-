document.addEventListener('DOMContentLoaded', function () {
  /**
   * backend-check.js
   * Comprueba si el backend está disponible (GET /ping) y muestra un banner
   * visible si no lo está, con opción de reintento al hacer click.
   */
  // Determinar API_BASE (mismo patrón usado en otros scripts)
  const API_BASE = (function () {
    try {
      if (location.protocol === 'file:') return 'http://localhost:3000';
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        if (location.port && location.port !== '3000') return 'http://localhost:3000';
        return '';
      }
    } catch (e) {
      return 'http://localhost:3000';
    }
    return '';
  })();

  const pingUrl = `${API_BASE}/ping`;

  // Crear banner (oculto inicialmente)
  /**
   * Crea y configura un banner informativo que se muestra si el backend no responde.
   */
  const banner = document.createElement('div');
  banner.id = 'backend-banner';
  banner.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#fff3cd;border:1px solid #ffecb5;color:#856404;padding:10px 16px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.08);font-family:Arial,Helvetica,sans-serif;display:none;max-width:90%;text-align:center;';
  banner.textContent = 'Comprobando backend...';
  document.body.appendChild(banner);

  // Hacer ping al backend para verificar disponibilidad
  fetch(pingUrl, { method: 'GET' , mode: 'cors'})
    .then(res => res.json())
    .then(data => {
      // Si responde correctamente, asegurarse de que el banner esté oculto
      banner.style.display = 'none';
    })
    .catch(err => {
      console.warn('Fallo al comprobar el backend:', err);
      banner.textContent = `Backend no disponible en http://localhost:3000 — inicia el servidor con npm start`; 
      banner.style.display = 'block';
    });

  // Reintentar al hacer click en el banner
  banner.addEventListener('click', function () {
    banner.textContent = 'Reintentando...';
    fetch(pingUrl, { method: 'GET', mode: 'cors' })
      .then(res => res.json())
      .then(() => { banner.style.display = 'none'; })
      .catch(() => { banner.textContent = `Backend no disponible en http://localhost:3000 — inicia el servidor con npm start`; });
  });
});
