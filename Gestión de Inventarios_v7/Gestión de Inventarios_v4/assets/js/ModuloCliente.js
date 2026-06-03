document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Clientes
   * Carga clientes desde appStorage, permite crear, editar y eliminar.
   */
  const btnNuevoCliente = document.getElementById('btnNuevoCliente');
  const formularioCliente = document.getElementById('formularioCliente');
  const cancelarCliente = document.getElementById('cancelarCliente');
  const tablaBody = document.querySelector('#tablaClientes tbody');
  const formCliente = document.getElementById('formCliente');

  let editingId = null;

  /**
   * createRow(cliente) -> HTMLElement
   * Genera una fila de tabla (<tr>) con los datos del cliente.
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
      <td>${cliente.pedidos}</td>
      <td>$${cliente.comprado}</td>
      <td>
        <button class="btn-edit" title="Editar"><span class="icono">✏️</span></button>
        <button class="btn-delete" title="Eliminar"><span class="icono eliminar">🗑️</span></button>
      </td>
    `;
    return tr;
  }

  /**
   * loadClients()
   * Lee los clientes de appStorage y actualiza la tabla.
   */
  function loadClients() {
    tablaBody.innerHTML = '';
    const clients = (window.appStorage && appStorage.getClients) ? appStorage.getClients() : [];
    clients.forEach(c => tablaBody.appendChild(createRow(c)));
  }

  loadClients();
  console.debug('ModuloCliente: inicializando, appStorage disponible=', !!window.appStorage);
  // Escuchar cambios de storage para recargar la tabla si otros módulos la modifican
  window.addEventListener('storageChanged', function (e) { if (!e.detail || e.detail.key === 'clients') loadClients(); });

  btnNuevoCliente.addEventListener('click', function () {
    // Mostrar formulario en modo creación (sin id de edición)
    formularioCliente.style.display = 'block';
    editingId = null;
    formularioCliente.classList.remove('editing');
    const submitBtn = formCliente.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
  });

  cancelarCliente.addEventListener('click', function () {
    editingId = null;
    formularioCliente.classList.remove('editing');
    const submitBtn = formCliente.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
    formCliente.reset();
    formularioCliente.style.display = 'none';
  });

  /**
   * Maneja el envío del formulario de cliente: crear o actualizar.
   */
  formCliente.addEventListener('submit', function (e) {
    e.preventDefault();
    console.debug('ModuloCliente: submit detectado');
    const nombre = document.getElementById('nombreCliente').value.trim();
    const email = document.getElementById('emailCliente').value.trim();
    const telefono = document.getElementById('telefonoCliente').value.trim();
    const fecha = document.getElementById('fechaRegistro').value;
    const pedidos = document.getElementById('totalPedidos').value;
    const comprado = parseFloat(document.getElementById('totalComprado').value) || 0;

    if (editingId) {
      const updated = { id: editingId, nombre, email, telefono, fecha, pedidos, comprado };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.updateClient(updated);
        ui && ui.showToast && ui.showToast('Cliente actualizado', 'success');
      } catch (err) {
        console.error('ModuloCliente: error al actualizar cliente:', err);
      }
      editingId = null;
      formularioCliente.classList.remove('editing');
    } else {
      const id = Date.now();
      const cliente = { id, nombre, email, telefono, fecha, pedidos, comprado };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.addClient(cliente);
        // Rely on storageChanged -> loadClients() to re-render and avoid duplicates
      } catch (err) {
        console.error('ModuloCliente: error al agregar cliente:', err);
      }
      ui && ui.showToast && ui.showToast('Cliente creado', 'success');
    }

    formCliente.reset();
    formularioCliente.style.display = 'none';
  });

  /**
   * Delegación de eventos para Editar/Eliminar en la tabla de clientes.
   */
  tablaBody.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row && row.dataset && row.dataset.id ? parseInt(row.dataset.id, 10) : null;
    if (btn.classList.contains('btn-delete') || btn.title === 'Eliminar') {
  const doDelete = () => { if (id) appStorage.deleteClient(id); ui && ui.showToast && ui.showToast('Cliente eliminado','info'); };
      if (window.ui && ui.confirmModal) ui.confirmModal('¿Eliminar este cliente?').then(ok => { if (ok) doDelete(); });
      else if (confirm('¿Eliminar este cliente?')) doDelete();
      return;
    }
    if (btn.classList.contains('btn-edit') || btn.title === 'Editar') {
      if (!id) return;
      const clients = appStorage.getClients();
      const c = clients.find(x => x.id === id);
      if (!c) return;
      document.getElementById('nombreCliente').value = c.nombre || '';
      document.getElementById('emailCliente').value = c.email || '';
      document.getElementById('telefonoCliente').value = c.telefono || '';
      document.getElementById('fechaRegistro').value = c.fecha || '';
      document.getElementById('totalPedidos').value = c.pedidos || '';
      document.getElementById('totalComprado').value = c.comprado || '';

      editingId = id;
      formularioCliente.style.display = 'block';
      formularioCliente.classList.add('editing');
      const submitBtn = formCliente.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.textContent = 'Actualizar'; submitBtn.classList.add('update'); }
    }
  });

});