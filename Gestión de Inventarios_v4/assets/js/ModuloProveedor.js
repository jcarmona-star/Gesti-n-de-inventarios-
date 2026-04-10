document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Proveedores
   * Gestiona la lista de proveedores: carga desde appStorage, crear, editar y eliminar.
   */
  const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
  const formularioProveedor = document.getElementById('formularioProveedor');
  const cancelarProveedor = document.getElementById('cancelarProveedor');
  const tablaBody = document.querySelector('#tablaProveedores tbody');
  const formProveedor = document.getElementById('formProveedor');

  let editingId = null;

  /**
   * createRow(proveedor) -> HTMLElement
   * Crea una fila de tabla con los datos del proveedor.
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
   * loadProviders()
   * Lee los proveedores desde appStorage y actualiza la tabla.
   */
  function loadProviders() {
    tablaBody.innerHTML = '';
    const providers = (window.appStorage && appStorage.getProviders) ? appStorage.getProviders() : [];
    providers.forEach(p => tablaBody.appendChild(createRow(p)));
  }

  loadProviders();
  console.debug('ModuloProveedor: inicializando, appStorage disponible=', !!window.appStorage);
  // Escuchar storageChanged para mantener la UI sincronizada
  window.addEventListener('storageChanged', function (e) { if (!e.detail || e.detail.key === 'providers') loadProviders(); });

  btnNuevoProveedor.addEventListener('click', function () {
    // Mostrar formulario para crear proveedor
    formularioProveedor.style.display = 'block';
    editingId = null;
    formularioProveedor.classList.remove('editing');
    const submitBtn = formProveedor.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
  });

  cancelarProveedor.addEventListener('click', function () {
    editingId = null;
    formularioProveedor.classList.remove('editing');
    const submitBtn = formProveedor.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.textContent = 'Guardar'; submitBtn.classList.remove('update'); }
    formProveedor.reset();
    formularioProveedor.style.display = 'none';
  });

  /**
   * Maneja el envío del formulario de proveedor: crear o actualizar.
   */
  formProveedor.addEventListener('submit', function (e) {
    e.preventDefault();
    console.debug('ModuloProveedor: submit detectado');
    const nombre = document.getElementById('nombreProveedor').value.trim();
    const contacto = document.getElementById('nombreContacto').value.trim();
    const correo = document.getElementById('correoProveedor').value.trim();
    const telefono = document.getElementById('telefonoProveedor').value.trim();
    const direccion = document.getElementById('direccionProveedor').value.trim();

    if (editingId) {
      const updated = { id: editingId, nombre, contacto, correo, telefono, direccion };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.updateProvider(updated);
      } catch (err) {
        console.error('ModuloProveedor: error al actualizar proveedor:', err);
      }
      const row = tablaBody.querySelector(`tr[data-id="${editingId}"]`);
      if (row) {
        const cells = row.querySelectorAll('td');
        cells[1].textContent = nombre;
        cells[2].textContent = contacto;
        cells[3].textContent = correo;
        cells[4].textContent = telefono;
        cells[5].textContent = direccion;
      }
      ui && ui.showToast && ui.showToast('Proveedor actualizado', 'success');
      editingId = null;
      formularioProveedor.classList.remove('editing');
    } else {
      const id = Date.now();
      const provider = { id, nombre, contacto, correo, telefono, direccion };
      try {
        if (!window.appStorage) throw new Error('appStorage no disponible');
        appStorage.addProvider(provider);
        // No agregar la fila manualmente: loadProviders() se ejecutará vía storageChanged
      } catch (err) {
        console.error('ModuloProveedor: error al agregar proveedor:', err);
      }
      ui && ui.showToast && ui.showToast('Proveedor creado', 'success');
    }

    formProveedor.reset();
    formularioProveedor.style.display = 'none';
  });

  /**
   * Delegación de eventos para Editar/Eliminar en la tabla de proveedores.
   */
  tablaBody.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row && row.dataset && row.dataset.id ? parseInt(row.dataset.id, 10) : null;
    if (btn.classList.contains('btn-delete') || btn.title === 'Eliminar') {
  const doDelete = () => { if (id) appStorage.deleteProvider(id); ui && ui.showToast && ui.showToast('Proveedor eliminado','info'); };
      if (window.ui && ui.confirmModal) ui.confirmModal('¿Eliminar este proveedor?').then(ok => { if (ok) doDelete(); });
      else if (confirm('¿Eliminar este proveedor?')) doDelete();
      return;
    }
    if (btn.classList.contains('btn-edit') || btn.title === 'Editar') {
      if (!id) return;
      const providers = appStorage.getProviders();
      const p = providers.find(x => x.id === id);
      if (!p) return;
      document.getElementById('nombreProveedor').value = p.nombre || '';
      document.getElementById('nombreContacto').value = p.contacto || '';
      document.getElementById('correoProveedor').value = p.correo || '';
      document.getElementById('telefonoProveedor').value = p.telefono || '';
      document.getElementById('direccionProveedor').value = p.direccion || '';

      editingId = id;
      formularioProveedor.style.display = 'block';
      formularioProveedor.classList.add('editing');
      const submitBtn = formProveedor.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.textContent = 'Actualizar'; submitBtn.classList.add('update'); }
    }
  });

});