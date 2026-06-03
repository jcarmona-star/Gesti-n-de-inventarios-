// ModuloCliente.js – Gestión de Clientes con paginación

document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Clientes
   * Carga clientes desde el backend, permite crear, editar y eliminar, con paginación.
   */
  const btnNuevoCliente = document.getElementById('btnNuevoCliente');
  const formularioCliente = document.getElementById('formularioCliente');
  const cancelarCliente = document.getElementById('cancelarCliente');
  const tablaBody = document.querySelector('#tablaClientes tbody');
  const formCliente = document.getElementById('formCliente');
  const filtroInput = document.getElementById('filtroClientes');

  let editingId = null;
  let clientsData = []; // cache de clientes
  let pagination = null; // instancia de Pagination

  /**
   * Crea una fila de tabla para un cliente.
   */
  function createRow(cliente) {
    const tr = document.createElement('tr');
    tr.dataset.id = cliente.id;
    tr.innerHTML = `
      <td>${cliente.id}</td>
      <td>${cliente.nombre}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefono}</td>
      <td>${cliente.fecha}</td>
      <td>${cliente.pedidos || 0}</td>
      <td>$${parseFloat(cliente.comprado || 0).toLocaleString('es-CO')}</td>
      <td>
        <button class="btn-edit" title="Editar"><span class="icono">✏️</span></button>
        <button class="btn-delete" title="Eliminar"><span class="icono eliminar">🗑️</span></button>
      </td>
    `;
    return tr;
  }

  /**
   * Carga los clientes y muestra la página actual.
   */
  async function loadClients() {
    try {
      const res = await fetch('/api/clientes');
      const clients = await res.json();
      console.log('Clientes cargados:', clients.length);
      clientsData = clients;
      pagination = new Pagination(clientsData, 10);
      const renderCurrentPage = () => {
        tablaBody.innerHTML = '';
        pagination.getCurrentPageItems().forEach(item => tablaBody.appendChild(createRow(item)));
      };
      pagination.onPageChange = renderCurrentPage;
      renderCurrentPage();
      pagination.renderControls('paginationClientes');
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  }

  // Inicializar datos
  loadClients();
  console.debug('ModuloCliente: inicializando...');

  // --- FILTRADO DE TABLA ---
  if (filtroInput) {
    filtroInput.addEventListener('input', function () {
      const term = this.value.toLowerCase();
      const filtered = clientsData.filter(c => Object.values(c).some(v => String(v).toLowerCase().includes(term)));
      pagination.updateItems(filtered);
      pagination.renderControls('paginationClientes');
      pagination.onPageChange();
    });
  }

  /**
   * Mostrar formulario para crear/editar cliente.
   */
  function openForm(edit = false) {
    formularioCliente.style.display = 'block';
    formularioCliente.classList.toggle('editing', edit);
    const submitBtn = formCliente.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = edit ? 'Actualizar' : 'Guardar';
      submitBtn.classList.toggle('update', edit);
    }
  }

  btnNuevoCliente.addEventListener('click', function () {
    editingId = null;
    formCliente.reset();
    openForm(false);
  });

  cancelarCliente.addEventListener('click', function () {
    editingId = null;
    formularioCliente.style.display = 'none';
    formularioCliente.classList.remove('editing');
    formCliente.reset();
  });

  /**
   * Guardar cliente (crear o actualizar).
   */
  formCliente.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const fecha = document.getElementById('fechaRegistro').value;
    const pedidos = document.getElementById('totalPedidos').value;
    const comprado = parseFloat(document.getElementById('totalComprado').value) || 0;
    const cliente = {
      id: editingId || Date.now(),
      nombre,
      email,
      telefono,
      fecha,
      pedidos,
      comprado
    };
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
      if (res.ok) {
        if (window.ui && ui.showToast) ui.showToast('Cliente guardado', 'success');
        loadClients();
      } else {
        if (window.ui && ui.showToast) ui.showToast('Error al guardar', 'error');
      }
    } catch (err) {
      console.error('ModuloCliente: error al guardar cliente:', err);
      if (window.ui && ui.showToast) ui.showToast('Error de conexión', 'error');
    }
    formularioCliente.style.display = 'none';
    editingId = null;
    formularioCliente.classList.remove('editing');
    formCliente.reset();
  });

  /**
   * Delegación de eventos para editar y eliminar clientes.
   */
  tablaBody.addEventListener('click', function (e) {
    const btnEdit = e.target.closest('.btn-edit');
    const btnDelete = e.target.closest('.btn-delete');
    const row = e.target.closest('tr');
    if (!row) return;
    const id = row.dataset.id ? parseInt(row.dataset.id, 10) : null;
    if (btnEdit) {
      if (!id) return;
      const cells = row.querySelectorAll('td');
      document.getElementById('nombreCliente').value = cells[1].textContent;
      document.getElementById('emailCliente').value = cells[2].textContent;
      document.getElementById('telefonoCliente').value = cells[3].textContent;
      document.getElementById('fechaRegistro').value = cells[4].textContent;
      document.getElementById('totalPedidos').value = cells[5].textContent;
      document.getElementById('totalComprado').value = cells[6].textContent.replace(/[$. ]/g, '');
      editingId = id;
      openForm(true);
    }
    if (btnDelete) {
      if (!id) return;
      if (window.ui && ui.confirmAction) {
        ui.confirmAction('¿Eliminar este cliente?').then(confirmed => {
          if (confirmed) {
            // Placeholder: backend delete not implemented yet
            if (window.ui && ui.showToast) ui.showToast('Función eliminar pendiente', 'info');
          }
        });
      } else if (confirm('¿Eliminar este cliente?')) {
        if (window.ui && ui.showToast) ui.showToast('Función eliminar pendiente', 'info');
      }
    }
  });
});