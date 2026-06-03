document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Ventas
   * Gestiona la creación, edición y eliminación de ventas y su persistencia en appStorage.
   */
  const btnNuevaVenta = document.getElementById('btnNuevaVenta');
  const formularioVenta = document.getElementById('formularioVenta');
  const cancelarVenta = document.getElementById('cancelarVenta');
  const tablaBody = document.querySelector('#tablaVentas tbody');
  const formVenta = document.getElementById('formVenta');

  let editingId = null;

  /**
   * createRow(venta) -> HTMLElement
   * Construye una fila de tabla con los datos de la venta.
   */
  function createRow(venta) {
    const tr = document.createElement('tr');
    tr.dataset.id = venta.id;
    tr.innerHTML = `
      <td>${venta.id}</td>
      <td>${venta.cliente}</td>
      <td>${venta.fecha}</td>
      <td>${venta.estado}</td>
      <td>$${venta.total}</td>
      <td>${venta.descripcion}</td>
      <td>${venta.admin}</td>
      <td>
        <button class="btn-edit" title="Editar"><span class="icono">✏️</span></button>
        <button class="btn-delete" title="Eliminar"><span class="icono eliminar">🗑️</span></button>
      </td>
    `;
    return tr;
  }

  /**
   * loadSales()
   * Carga las ventas desde appStorage y renderiza la lista en la tabla.
   */
  function loadSales() {
    tablaBody.innerHTML = '';
    const sales = (window.appStorage && appStorage.getSales) ? appStorage.getSales() : [];
    sales.forEach(s => tablaBody.appendChild(createRow(s)));
  }

  loadSales();
  console.debug('ModuloVentas: inicializando, appStorage disponible=', !!window.appStorage);
  // Escucha cambios globales de storage para recargar la tabla si es necesario
  window.addEventListener('storageChanged', function (e) { if (!e.detail || e.detail.key === 'sales') loadSales(); });

  btnNuevaVenta.addEventListener('click', function () {
    // Mostrar formulario en modo creación
    formularioVenta.style.display = 'block';
    editingId = null;
    formularioVenta.classList.remove('editing');
    const submitBtn = formVenta.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
  });

  cancelarVenta.addEventListener('click', function () {
    editingId = null;
    formularioVenta.classList.remove('editing');
    const submitBtn = formVenta.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
    formVenta.reset();
    formularioVenta.style.display = 'none';
  });

  /**
   * Maneja el envío del formulario de venta (crear o actualizar) y persiste los cambios.
   */
  formVenta.addEventListener('submit', function (e) {
    e.preventDefault();
    console.debug('ModuloVentas: submit detectado');
    const cliente = document.getElementById('clienteVenta').value.trim();
    const fecha = document.getElementById('fechaVenta').value;
    const estado = document.getElementById('estadoVenta').value;
    const total = parseFloat(document.getElementById('totalVenta').value) || 0;
    const descripcion = document.getElementById('descripcionVenta').value.trim();
    const admin = document.getElementById('adminVenta').value.trim();

    if (editingId) {
      const updated = { id: editingId, cliente, fecha, estado, total, descripcion, admin };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.updateSale(updated);
        ui && ui.showToast && ui.showToast('Venta actualizada', 'success');
      } catch (err) {
        console.error('ModuloVentas: error al actualizar venta:', err);
      }
      editingId = null;
      formularioVenta.classList.remove('editing');
    } else {
      const id = Date.now();
      const sale = { id, cliente, fecha, estado, total, descripcion, admin };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.addSale(sale);
        // Esperar al evento storageChanged para recargar la tabla y evitar duplicados
      } catch (err) {
        console.error('ModuloVentas: error al agregar venta:', err);
      }
      ui && ui.showToast && ui.showToast('Venta creada', 'success');
    }

    formVenta.reset();
    formularioVenta.style.display = 'none';
  });

  /**
   * Delegación de eventos para botones Editar/Eliminar en la tabla de ventas.
   */
  tablaBody.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row && row.dataset && row.dataset.id ? parseInt(row.dataset.id, 10) : null;
    if (btn.classList.contains('btn-delete') || btn.title === 'Eliminar') {
  const doDelete = () => { if (id) appStorage.deleteSale(id); ui && ui.showToast && ui.showToast('Venta eliminada','info'); };
      if (window.ui && ui.confirmModal) ui.confirmModal('¿Eliminar esta venta?').then(ok => { if (ok) doDelete(); });
      else if (confirm('¿Eliminar esta venta?')) doDelete();
      return;
    }
    if (btn.classList.contains('btn-edit') || btn.title === 'Editar') {
      if (!id) return;
      const sales = appStorage.getSales();
      const s = sales.find(x => x.id === id);
      if (!s) return;
      document.getElementById('clienteVenta').value = s.cliente || '';
      document.getElementById('fechaVenta').value = s.fecha || '';
      document.getElementById('estadoVenta').value = s.estado || '';
      document.getElementById('totalVenta').value = s.total || '';
      document.getElementById('descripcionVenta').value = s.descripcion || '';
      document.getElementById('adminVenta').value = s.admin || '';

      editingId = id;
      formularioVenta.style.display = 'block';
      formularioVenta.classList.add('editing');
      const submitBtn = formVenta.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.textContent = 'Actualizar'; submitBtn.classList.add('update'); }
    }
  });

});