// ModuloProveedor.js – Gestión de Proveedores con paginación

document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Proveedores
   * Carga proveedores desde el backend, permite crear, editar y eliminar, con paginación.
   */
  const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
  const formularioProveedor = document.getElementById('formularioProveedor');
  const cancelarProveedor = document.getElementById('cancelarProveedor');
  const tablaBody = document.querySelector('#tablaProveedores tbody');
  const formProveedor = document.getElementById('formProveedor');
  const filtroInput = document.getElementById('filtroProveedores');

  let editingId = null;
  let providersData = []; // cache de proveedores
  let pagination = null; // instancia de Pagination

  /**
   * Crea una fila de tabla para un proveedor.
   */
  function createRow(proveedor) {
    const tr = document.createElement('tr');
    tr.dataset.id = proveedor.id;
    tr.innerHTML = `
      <td>${proveedor.id}</td>
      <td>${proveedor.nombre}</td>
      <td>${proveedor.contacto}</td>
      <td>${proveedor.correo}</td>
      <td>${proveedor.telefono}</td>
      <td>${proveedor.direccion}</td>
      <td>
        <button class="btn-edit" title="Editar"><span class="icono">✏️</span></button>
        <button class="btn-delete" title="Eliminar"><span class="icono eliminar">🗑️</span></button>
      </td>
    `;
    return tr;
  }

  /**
   * Carga los proveedores y muestra la página actual.
   */
  async function loadProviders() {
    try {
      const res = await fetch('/api/proveedores');
      const providers = await res.json();
      console.log('Proveedores cargados:', providers.length);
      providersData = providers;
      pagination = new Pagination(providersData, 10);
      const renderCurrentPage = () => {
        tablaBody.innerHTML = '';
        pagination.getCurrentPageItems().forEach(item => tablaBody.appendChild(createRow(item)));
      };
      pagination.onPageChange = renderCurrentPage;
      renderCurrentPage();
      pagination.renderControls('paginationProveedores');
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  }

  // Inicializar datos
  loadProviders();
  console.debug('ModuloProveedor: inicializando...');

  // --- FILTRADO DE TABLA ---
  if (filtroInput) {
    filtroInput.addEventListener('input', function () {
      const term = this.value.toLowerCase();
      const filtered = providersData.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(term)));
      pagination.updateItems(filtered);
      pagination.renderControls('paginationProveedores');
      pagination.onPageChange();
    });
  }

  /**
   * Mostrar formulario para crear/editar proveedor.
   */
  function openForm(edit = false) {
    formularioProveedor.style.display = 'block';
    formularioProveedor.classList.toggle('editing', edit);
    const submitBtn = formProveedor.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = edit ? 'Actualizar' : 'Guardar';
      submitBtn.classList.toggle('update', edit);
    }
  }

  btnNuevoProveedor.addEventListener('click', function () {
    editingId = null;
    formProveedor.reset();
    openForm(false);
  });

  cancelarProveedor.addEventListener('click', function () {
    editingId = null;
    formularioProveedor.style.display = 'none';
    formularioProveedor.classList.remove('editing');
    formProveedor.reset();
  });

  /**
   * Guardar proveedor (crear o actualizar).
   */
  formProveedor.addEventListener('submit', async function (e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreProveedor').value.trim();
    const contacto = document.getElementById('nombreContacto').value.trim();
    const correo = document.getElementById('correoProveedor').value.trim();
    const telefono = document.getElementById('telefonoProveedor').value.trim();
    const direccion = document.getElementById('direccionProveedor').value.trim();
    const provider = {
      id: editingId || Date.now(),
      nombre,
      contacto,
      correo,
      telefono,
      direccion
    };
    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider)
      });
      if (res.ok) {
        if (window.ui && ui.showToast) ui.showToast('Proveedor guardado', 'success');
        loadProviders();
      } else {
        if (window.ui && ui.showToast) ui.showToast('Error al guardar', 'error');
      }
    } catch (err) {
      console.error('ModuloProveedor: error al guardar proveedor:', err);
      if (window.ui && ui.showToast) ui.showToast('Error de conexión', 'error');
    }
    formularioProveedor.style.display = 'none';
    editingId = null;
    formularioProveedor.classList.remove('editing');
    formProveedor.reset();
  });

  /**
   * Delegación de eventos para editar y eliminar proveedores.
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
      document.getElementById('nombreProveedor').value = cells[1].textContent;
      document.getElementById('nombreContacto').value = cells[2].textContent;
      document.getElementById('correoProveedor').value = cells[3].textContent;
      document.getElementById('telefonoProveedor').value = cells[4].textContent;
      document.getElementById('direccionProveedor').value = cells[5].textContent;
      editingId = id;
      openForm(true);
    }
    if (btnDelete) {
      if (!id) return;
      if (window.ui && ui.confirmAction) {
        ui.confirmAction('¿Eliminar este proveedor?').then(confirmed => {
          if (confirmed) {
            // Placeholder: backend delete not implemented yet
            if (window.ui && ui.showToast) ui.showToast('Función eliminar pendiente', 'info');
          }
        });
      } else if (confirm('¿Eliminar este proveedor?')) {
        if (window.ui && ui.showToast) ui.showToast('Función eliminar pendiente', 'info');
      }
    }
  });
});