document.addEventListener('DOMContentLoaded', function () {
  // Módulo de registro de usuarios
  // Busca el botón de registro y gestiona el envío hacia el endpoint /api/register
  const registerBtn = document.getElementById('registerBtn');
  if (!registerBtn) return;

  /**
   * API_BASE
   * Determina la URL base del backend. Si los HTML se sirven desde otro puerto
   * (ej. Live Server en :5500), apuntamos por defecto a http://localhost:3000.
   */
  const API_BASE = (function () {
    try {
      if (location.protocol === 'file:') return 'http://localhost:3000';
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        if (location.port && location.port !== '3000') return 'http://localhost:3000';
        return '';
      }
    } catch (e) {
      // por seguridad, fallback al puerto 3000
      return 'http://localhost:3000';
    }
    return '';
  })();

  // Manejador que envía los datos del formulario al backend para registrar el usuario.
  registerBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!nombre || !documento || !correo || !telefono || !password) {
      alert('Por favor completa todos los campos.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, documento, correo, telefono, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Guardar temporalmente los datos registrados para mostrarlos en la página de confirmación
        // Incluimos la contraseña en sessionStorage sólo para el flujo de demostración.
        const recent = { nombre, documento, correo, telefono, password };
        try {
          sessionStorage.setItem('recentlyRegisteredUser', JSON.stringify(recent));
        } catch (e) {
          console.warn('No se pudo almacenar en sessionStorage:', e);
        }
        // Redirigir a la página de confirmación donde se mostrarán los datos
        window.location.href = 'Confirmacion.html';
      } else {
        alert(data.message || 'Error en el registro');
      }
    } catch (err) {
      console.error('Error en fetch /api/register:', err);
      alert('Error al conectar con el servidor. Asegúrate de que el backend esté corriendo en http://localhost:3000');
    }
  });
});
