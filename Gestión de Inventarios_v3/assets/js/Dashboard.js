document.addEventListener("DOMContentLoaded", function () {
  // Verifica si el usuario está logueado
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (isLoggedIn !== "true") {
  window.location.href = "Dashboard.html"; // Redirige al login si no está logueado
    return;
  }

  // Evento para cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("loggedIn");
    window.location.href = "Login.html";
  });

  // Eventos para navegación entre módulos
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
});