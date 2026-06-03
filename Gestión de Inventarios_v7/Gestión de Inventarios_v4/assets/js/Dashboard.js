document.addEventListener("DOMContentLoaded", function () {
  /**
   * Dashboard.js
   * Controla la lógica de la página principal: verificación de sesión,
   * navegación entre módulos y mostrar el nombre del usuario en la barra superior.
   */
  // Verifica si el usuario está logueado
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (isLoggedIn !== "true") {
    // Si no está logueado, redirigir al login
    window.location.href = "Login.html";
    return;
  }

  // Evento para cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      // evitar navegación por href por defecto
      e.preventDefault && e.preventDefault();
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      window.location.href = "Login.html";
    });
  }

  // Eventos para navegación entre módulos (botones en el menú)
  const dashboardBtn = document.getElementById("dashboardBtn");
  const productosBtn = document.getElementById("productosBtn");
  const ventasBtn = document.getElementById("ventasBtn");
  const clientesBtn = document.getElementById("clientesBtn");
  const proveedoresBtn = document.getElementById("proveedoresBtn");
  const reportesBtn = document.getElementById("reportesBtn");

  dashboardBtn.addEventListener("click", function () {
    window.location.href = "Dashboard.html";
  });

  productosBtn.addEventListener("click", function () {
    window.location.href = "ModuloProductos.html";
  });

  ventasBtn.addEventListener("click", function () {
    window.location.href = "ModuloVentas.html";
  });

  clientesBtn.addEventListener("click", function () {
    window.location.href = "ModuloCliente.html";
  });

  proveedoresBtn.addEventListener("click", function () {
    window.location.href = "ModuloProveedor.html";
  });

  reportesBtn.addEventListener("click", function () {
    window.location.href = "ModuloReportes.html";
  });

  // Rellenar información de usuario en la barra superior
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const topbarUser = document.getElementById('topbarUser');
      if (topbarUser) {
        topbarUser.textContent = user.nombre || user.correo || 'Usuario';
      }
    }
  } catch (e) {
    console.warn('No se pudo leer localStorage.user:', e);
  }
});