document.addEventListener('DOMContentLoaded', function () {
  /**
   * Módulo de Productos
   * Este archivo gestiona la UI de productos: carga desde el backend,
   * renderiza filas en la tabla, y permite crear/editar/eliminar productos.
   */
  const btnNuevo = document.getElementById('btnNuevoProducto');
  const formulario = document.getElementById('formularioProducto');
  const cancelar = document.getElementById('cancelarProducto');
  const tablaBody = document.querySelector('#tablaProductos tbody');
  const formProducto = document.getElementById('formProducto');

  let editingId = null;

  /**
   * createRow(product) -> HTMLElement
   * Crea y devuelve un elemento <tr> con los datos del producto.
   */
  function createRow(product) {
    const tr = document.createElement('tr');
    tr.dataset.id = product.id;
    tr.innerHTML = `
      <td>${product.id}</td>
      <td>${product.nombre}</td>
      <td>${product.categoria}</td>
      <td>${product.marca}</td>
      <td>$${product.precio}</td>
      <td>${product.stock}</td>
      <td>${product.proveedor}</td>
      <td>${product.estado}</td>
      <td>
        <button class="btn-edit" title="Editar"><span class="icono">✏️</span></button>
        <button class="btn-delete" title="Eliminar"><span class="icono eliminar">🗑️</span></button>
      </td>
    `;
    return tr;
  }

  /**
   * loadProducts()
   * Carga los productos desde el backend y re-renderiza la tabla.
   */
  async function loadProducts() {
    tablaBody.innerHTML = '';
    try {
      const res = await fetch('http://localhost:3000/api/productos');
      const products = await res.json();
      products.forEach(p => tablaBody.appendChild(createRow(p)));
    } catch (err) {
      console.error('Error al cargar productos desde el servidor:', err);
    }
  }

  // Carga inicial
  console.debug('ModuloProductos: inicializando...');
  loadProducts();

  // Mostrar el formulario para crear un nuevo producto
  btnNuevo.addEventListener('click', function () {
    formulario.style.display = 'block';
    editingId = null;
    formulario.classList.remove('editing');
    const submitBtn = formProducto.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Guardar';
      submitBtn.classList.remove('update');
    }
  });

  // Cancelar creación/edición
  cancelar.addEventListener('click', function () {
    editingId = null;
    formulario.classList.remove('editing');
    const submitBtn = formProducto.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Guardar';
      submitBtn.classList.remove('update');
    }
    formProducto.reset();
    formulario.style.display = 'none';
  });

  // Envío del formulario para crear o actualizar producto
  formProducto.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.debug('ModuloProductos: submit detectado');

    const nombre = document.getElementById('nombreProducto').value.trim();
    const categoria = document.getElementById('categoriaProducto').value.trim();
    const marca = document.getElementById('marcaProducto').value.trim();
    const precio = parseFloat(document.getElementById('precioProducto').value) || 0;
    const stock = parseInt(document.getElementById('stockProducto').value, 10) || 0;
    const proveedor = document.getElementById('proveedorProducto').value.trim();
    const estado = document.getElementById('estadoProducto').value;

    const producto = {
      id: editingId || Date.now(),
      nombre,
      categoria,
      marca,
      precio,
      stock,
      proveedor,
      estado
    };

    try {
      const res = await fetch('http://localhost:3000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
      });
      const data = await res.json();
      console.log('Respuesta del servidor:', data);
      ui && ui.showToast && ui.showToast('Producto guardado en servidor', 'success');
      loadProducts(); // Recargar tabla
    } catch (err) {
      console.error('Error al guardar producto en el servidor:', err);
      ui && ui.showToast && ui.showToast('Error al guardar en servidor', 'error');
    }

    formProducto.reset();
    formulario.style.display = 'none';
    editingId = null;
    formulario.classList.remove('editing');
  });

  // Delegación de eventos para editar y eliminar
  tablaBody.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row && row.dataset && row.dataset.id ? parseInt(row.dataset.id, 10) : null;

    if (btn.classList.contains('btn-edit') || btn.title === 'Editar') {
      if (!id) return;
      const cells = row.querySelectorAll('td');
      document.getElementById('nombreProducto').value = cells[1].textContent;
      document.getElementById('categoriaProducto').value = cells[2].textContent;
      document.getElementById('marcaProducto').value = cells[3].textContent;
      document.getElementById('precioProducto').value = cells[4].textContent.replace('$', '');
      document.getElementById('stockProducto').value = cells[5].textContent;
      document.getElementById('proveedorProducto').value = cells[6].textContent;
      document.getElementById('estadoProducto').value = cells[7].textContent;

      editingId = id;
      formulario.style.display = 'block';
      formulario.classList.add('editing');
      const submitBtn = formProducto.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Actualizar';
        submitBtn.classList.add('update');
      }
    }

    if (btn.classList.contains('btn-delete') || btn.title === 'Eliminar') {
      if (!id) return;
      if (confirm('¿Eliminar este producto?')) {
        console.warn('Eliminar producto aún no implementado en backend');
        ui && ui.showToast && ui.showToast('Función eliminar pendiente', 'info');
      }
    }
  });
});