/**
 * Tests de Productos
 * Pruebas de CRUD de productos e inventario
 */

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

// Funciones de productos
async function readFile(filePath, defaultContent) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || JSON.stringify(defaultContent));
  } catch (err) {
    return defaultContent;
  }
}

async function writeFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

async function getAll(productosFilePath) {
  const data = await readFile(productosFilePath, { productos: [] });
  return data.productos || [];
}

async function getById(id, productosFilePath) {
  const productos = await getAll(productosFilePath);
  return productos.find(p => p.id == id) || null;
}

async function create(nuevoProducto, productosFilePath) {
  if (!nuevoProducto || !nuevoProducto.nombre || nuevoProducto.precio === undefined) {
    return { success: false, message: 'Faltan campos requeridos: nombre y precio' };
  }

  if (nuevoProducto.precio < 0) {
    return { success: false, message: 'El precio no puede ser negativo' };
  }

  if (nuevoProducto.cantidad === undefined) {
    nuevoProducto.cantidad = 0;
  }

  if (nuevoProducto.cantidad < 0) {
    return { success: false, message: 'La cantidad no puede ser negativa' };
  }

  if (!nuevoProducto.id) {
    nuevoProducto.id = Date.now();
  }

  const data = await readFile(productosFilePath, { productos: [] });
  data.productos.push(nuevoProducto);
  await writeFile(productosFilePath, data);

  return { success: true, message: 'Producto creado correctamente.', producto: nuevoProducto };
}

async function update(id, productoDatos, productosFilePath) {
  if (!productoDatos || Object.keys(productoDatos).length === 0) {
    return { success: false, message: 'No hay datos para actualizar' };
  }

  const data = await readFile(productosFilePath, { productos: [] });
  const index = data.productos.findIndex(p => p.id == id);

  if (index === -1) {
    return { success: false, message: 'Producto no encontrado.' };
  }

  if (productoDatos.precio !== undefined && productoDatos.precio < 0) {
    return { success: false, message: 'El precio no puede ser negativo' };
  }

  if (productoDatos.cantidad !== undefined && productoDatos.cantidad < 0) {
    return { success: false, message: 'La cantidad no puede ser negativa' };
  }

  data.productos[index] = {
    ...data.productos[index],
    ...productoDatos,
    id: Number(id)
  };

  await writeFile(productosFilePath, data);

  return {
    success: true,
    message: 'Producto actualizado correctamente.',
    producto: data.productos[index]
  };
}

async function updateStock(id, cantidad, productosFilePath) {
  if (cantidad === undefined) {
    return { success: false, message: 'La cantidad es requerida' };
  }

  if (typeof cantidad !== 'number' || cantidad < 0) {
    return { success: false, message: 'La cantidad debe ser un número positivo' };
  }

  const data = await readFile(productosFilePath, { productos: [] });
  const index = data.productos.findIndex(p => p.id == id);

  if (index === -1) {
    return { success: false, message: 'Producto no encontrado.' };
  }

  const producto = data.productos[index];
  const stockAnterior = producto.cantidad || 0;

  if (stockAnterior < cantidad) {
    return {
      success: false,
      message: `Stock insuficiente. Disponible: ${stockAnterior}, Requerido: ${cantidad}`
    };
  }

  const stockNuevo = stockAnterior - cantidad;
  data.productos[index].cantidad = stockNuevo;

  await writeFile(productosFilePath, data);

  return {
    success: true,
    message: 'Stock actualizado correctamente.',
    producto: data.productos[index],
    stockAnterior,
    stockNuevo
  };
}

describe('📦 Módulo de Productos', () => {
  const testProductosFile = 'test-productos.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Crear Productos', () => {
    test('✓ Debe crear un nuevo producto con datos válidos', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await create({
        nombre: 'Laptop',
        precio: 1200,
        cantidad: 5,
        descripcion: 'Laptop Dell XPS'
      }, testProductosFile);

      expect(resultado.success).toBe(true);
      expect(resultado.producto.nombre).toBe('Laptop');
      expect(resultado.producto.precio).toBe(1200);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('✗ Debe rechazar producto sin nombre', async () => {
      const resultado = await create({
        precio: 100,
        cantidad: 10
      }, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('nombre y precio');
    });

    test('✗ Debe rechazar producto con precio negativo', async () => {
      const resultado = await create({
        nombre: 'Producto',
        precio: -50
      }, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('no puede ser negativo');
    });

    test('✓ Debe asignar cantidad 0 por defecto', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await create({
        nombre: 'Producto sin stock',
        precio: 50
      }, testProductosFile);

      expect(resultado.producto.cantidad).toBe(0);
    });

    test('✓ Debe generar ID automático', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await create({
        nombre: 'Producto',
        precio: 100
      }, testProductosFile);

      expect(resultado.producto.id).toBeDefined();
      expect(typeof resultado.producto.id).toBe('number');
    });
  });

  describe('Actualizar Productos', () => {
    test('✓ Debe actualizar nombre de producto', async () => {
      const productosExistentes = [{
        id: 1,
        nombre: 'Laptop Vieja',
        precio: 800
      }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await update(1, { nombre: 'Laptop Nueva' }, testProductosFile);

      expect(resultado.success).toBe(true);
      expect(resultado.producto.nombre).toBe('Laptop Nueva');
    });

    test('✓ Debe actualizar precio de producto', async () => {
      const productosExistentes = [{
        id: 1,
        nombre: 'Laptop',
        precio: 1000
      }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await update(1, { precio: 1200 }, testProductosFile);

      expect(resultado.success).toBe(true);
      expect(resultado.producto.precio).toBe(1200);
    });

    test('✗ Debe rechazar actualización de producto no existente', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));

      const resultado = await update(999, { nombre: 'Test' }, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('no encontrado');
    });

    test('✗ Debe rechazar actualización sin datos', async () => {
      const resultado = await update(1, {}, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('No hay datos');
    });
  });

  describe('Gestión de Stock', () => {
    test('✓ Debe restar stock correctamente', async () => {
      const productosExistentes = [{
        id: 1,
        nombre: 'Producto',
        cantidad: 100
      }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await updateStock(1, 30, testProductosFile);

      expect(resultado.success).toBe(true);
      expect(resultado.stockAnterior).toBe(100);
      expect(resultado.stockNuevo).toBe(70);
    });

    test('✗ Debe rechazar si stock es insuficiente', async () => {
      const productosExistentes = [{
        id: 1,
        nombre: 'Producto',
        cantidad: 10
      }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));

      const resultado = await updateStock(1, 50, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('Stock insuficiente');
    });

    test('✓ Debe permitir agotar stock completo', async () => {
      const productosExistentes = [{
        id: 1,
        nombre: 'Producto',
        cantidad: 25
      }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await updateStock(1, 25, testProductosFile);

      expect(resultado.success).toBe(true);
      expect(resultado.stockNuevo).toBe(0);
    });

    test('✗ Debe rechazar cantidad negativa', async () => {
      const resultado = await updateStock(1, -5, testProductosFile);

      expect(resultado.success).toBe(false);
    });

    test('✗ Debe rechazar producto no encontrado', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));

      const resultado = await updateStock(999, 10, testProductosFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('no encontrado');
    });
  });

  describe('Obtener Productos', () => {
    test('✓ Debe obtener todos los productos', async () => {
      const productosExistentes = [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));

      const resultado = await getAll(testProductosFile);

      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado.length).toBe(2);
    });

    test('✓ Debe obtener producto por ID', async () => {
      const productosExistentes = [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ];

      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: productosExistentes }));

      const resultado = await getById(1, testProductosFile);

      expect(resultado).not.toBeNull();
      expect(resultado.nombre).toBe('Producto 1');
    });

    test('✓ Debe retornar null si producto no existe', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));

      const resultado = await getById(999, testProductosFile);

      expect(resultado).toBeNull();
    });
  });
});