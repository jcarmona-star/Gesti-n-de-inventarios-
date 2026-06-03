// Helper simple basado en localStorage para productos, clientes, ventas y proveedores.
// Provee funciones para leer, escribir y emitir un evento `storageChanged` cuando hay cambios.
(function () {
  /**
   * read(key) -> Array
   * Lee y parsea el valor JSON almacenado en localStorage para la clave indicada.
   * Si no existe o hay error, devuelve un array vacío.
   */
  function read(key) {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : [];
    } catch (e) {
      console.error('storage.read error', e);
      return [];
    }
  }

  /**
   * write(key, data) -> boolean
   * Serializa y escribe data en localStorage bajo la clave key.
   * Emite un CustomEvent 'storageChanged' con detail.key para notificar a otras partes del app.
   */
  function write(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('storageChanged', { detail: { key } }));
      return true;
    } catch (e) {
      console.error('storage.write error', e);
      return false;
    }
  }

  /**
   * ensure(arr)
   * Asegura que el valor sea un array; si no lo es, devuelve un array vacío.
   */
  function ensure(arr) { return Array.isArray(arr) ? arr : []; }

  // API pública expuesta en window.appStorage
  const api = {
    // Productos
    /** getProducts() -> Array de productos */
    getProducts() { return read('products'); },
    /** addProduct(p): agrega un producto y guarda */
    addProduct(p) { const arr = ensure(read('products')); arr.push(p); write('products', arr); },
    /** updateProduct(updated): actualiza un producto existente por id */
    updateProduct(updated) { const arr = ensure(read('products')).map(p => p.id === updated.id ? updated : p); write('products', arr); },
    /** deleteProduct(id): elimina un producto por id */
    deleteProduct(id) { const arr = ensure(read('products')).filter(p => p.id !== id); write('products', arr); },
    // Clientes
    /** getClients() -> Array de clientes */
    getClients() { return read('clients'); },
    /** addClient(c): agrega un cliente y guarda */
    addClient(c) { const arr = ensure(read('clients')); arr.push(c); write('clients', arr); },
    /** updateClient(updated): actualiza un cliente por id */
    updateClient(updated) { const arr = ensure(read('clients')).map(c => c.id === updated.id ? updated : c); write('clients', arr); },
    /** deleteClient(id): elimina un cliente por id */
    deleteClient(id) { const arr = ensure(read('clients')).filter(c => c.id !== id); write('clients', arr); },
    // Ventas
    /** getSales() -> Array de ventas */
    getSales() { return read('sales'); },
    /** addSale(s): agrega una venta y guarda */
    addSale(s) { const arr = ensure(read('sales')); arr.push(s); write('sales', arr); },
    /** updateSale(updated): actualiza una venta por id */
    updateSale(updated) { const arr = ensure(read('sales')).map(s => s.id === updated.id ? updated : s); write('sales', arr); },
    /** deleteSale(id): elimina una venta por id */
    deleteSale(id) { const arr = ensure(read('sales')).filter(s => s.id !== id); write('sales', arr); },
    // Proveedores
    /** getProviders() -> Array de proveedores */
    getProviders() { return read('providers'); },
    /** addProvider(p): agrega un proveedor y guarda */
    addProvider(p) { const arr = ensure(read('providers')); arr.push(p); write('providers', arr); },
    /** updateProvider(updated): actualiza un proveedor por id */
    updateProvider(updated) { const arr = ensure(read('providers')).map(pv => pv.id === updated.id ? updated : pv); write('providers', arr); },
    /** deleteProvider(id): elimina un proveedor por id */
    deleteProvider(id) { const arr = ensure(read('providers')).filter(pv => pv.id !== id); write('providers', arr); },
  };

  window.appStorage = api;
})();
