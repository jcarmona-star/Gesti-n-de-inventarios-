/**
 * Módulo que completa el nombre del usuario en la interfaz.
 * - Lee `localStorage.user` y actualiza elementos con clase `.topbar-user` y
 *   elementos con id `topbarUser`.
 * - También rellena campos administrativos (ej. adminVenta) si existen.
 */
document.addEventListener('DOMContentLoaded', function () {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const name = (user && (user.nombre || user.correo)) ? (user.nombre || user.correo) : null;

    // Rellenar elementos .topbar-user con 'Usuario: <nombre>' o 'Invitado'
    document.querySelectorAll('.topbar-user').forEach(el => {
      if (name) {
        el.textContent = `Usuario: ${name}`;
      } else {
        // si no hay user, mostrar invitado
        el.textContent = 'Usuario: Invitado';
      }
    });

    // Si existe elemento con id topbarUser, rellenarlo también (solo nombre)
    const topbarSpan = document.getElementById('topbarUser');
    if (topbarSpan) {
      if (name) topbarSpan.textContent = name;
      else topbarSpan.textContent = 'Invitado';
    }

    // Rellenar campos administrativos en formularios (por ejemplo adminVenta)
    const adminInputs = ['adminVenta'];
    adminInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.value = name || '';
      }
    });

  } catch (e) {
    console.warn('user-display: no se pudo leer el usuario de localStorage', e);
  }
});
