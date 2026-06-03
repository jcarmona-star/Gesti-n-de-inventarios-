document.addEventListener("DOMContentLoaded", async function () {
  /**
   * Dashboard.js
   * Controla la lógica de la página principal: verificación de sesión,
   * navegación, métricas y gráficos.
   */

  // Verifica si el usuario está logueado
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "Login.html";
    return;
  }

  // Evento para cerrar sesión
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault && e.preventDefault();
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("user");
      window.location.href = "Login.html";
    });
  }

  // Navegación
  const navIds = ["dashboardBtn", "productosBtn", "ventasBtn", "clientesBtn", "proveedoresBtn", "reportesBtn"];
  const navUrls = ["Dashboard.html", "ModuloProductos.html", "ModuloVentas.html", "ModuloCliente.html", "ModuloProveedor.html", "ModuloReportes.html"];

  navIds.forEach((id, index) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => window.location.href = navUrls[index]);
  });

  // Rellenar información de usuario
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

  // --- LÓGICA DEL DASHBOARD ---

  async function fetchData(endpoint) {
    try {
      const res = await fetch(endpoint);
      return await res.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      return [];
    }
  }

  async function initDashboard() {
    const [productos, ventas, clientes] = await Promise.all([
      fetchData('/api/productos'),
      fetchData('/api/ventas'),
      fetchData('/api/clientes')
    ]);

    // 1. Calcular Métricas
    const totalIngresos = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
    const valorInventario = productos.reduce((sum, p) => sum + ((parseFloat(p.precio) || 0) * (parseInt(p.stock) || 0)), 0);
    const ventasPendientes = ventas.filter(v => v.estado === 'Pendiente').length;
    const stockCritico = productos.filter(p => (parseInt(p.stock) || 0) < 5).length;

    // Actualizar DOM
    document.querySelector('.metric-card.ingresos p').textContent = `$${totalIngresos.toLocaleString()}`;
    document.querySelector('.metric-card.inventario p').textContent = `$${valorInventario.toLocaleString()}`;
    document.querySelector('.metric-card.pendientes p').textContent = ventasPendientes;
    document.querySelector('.metric-card.critico p').textContent = stockCritico;

    // 2. Gráficos
    renderCharts(productos, ventas);

    // 3. Tabla de Productos más vendidos (Simulado basado en ventas si hubiera detalle, o mock)
    updateTopProductsTable(productos);
  }

  function renderCharts(productos, ventas) {
    // Gráfico de Categorías (Pie)
    const categorias = {};
    productos.forEach(p => {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    });

    const ctxPie = document.getElementById('categoriasPie').getContext('2d');
    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Gráfico de Ventas por Fecha (últimos 7 días o todas)
    const ventasPorFecha = {};
    ventas.forEach(v => {
      const fecha = v.fecha.split('T')[0]; // Asumiendo ISO string
      ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + (parseFloat(v.total) || 0);
    });

    const sortedDates = Object.keys(ventasPorFecha).sort();
    const dataVentas = sortedDates.map(d => ventasPorFecha[d]);

    const ctxLine = document.getElementById('pedidosPorFecha').getContext('2d');
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{
          label: 'Ventas ($)',
          data: dataVentas,
          borderColor: '#36A2EB',
          fill: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Gráfico de Barras (ej. Stock por marca)
    const marcas = {};
    productos.forEach(p => {
      marcas[p.marca] = (marcas[p.marca] || 0) + (parseInt(p.stock) || 0);
    });

    const ctxBar = document.getElementById('ventasPorCategoria').getContext('2d'); // Reusando el canvas ID aunque sea marcas
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: Object.keys(marcas),
        datasets: [{
          label: 'Stock por Marca',
          data: Object.values(marcas),
          backgroundColor: '#4BC0C0'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function updateTopProductsTable(productos) {
    // Simplemente mostramos los productos con menos stock (asumiendo que se vendieron más)
    // O los primeros 5
    const sorted = [...productos].sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 5);
    const tbody = document.querySelector('.ventas-table tbody');
    tbody.innerHTML = '';
    sorted.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.nombre}</td><td>${p.stock} (Stock restante)</td>`;
      tbody.appendChild(tr);
    });
  }

  initDashboard();
});