/**
 * Tests de Ventas
 * Pruebas de registro de ventas y estadísticas
 */

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

// Funciones de ventas
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

async function getAll(ventasFilePath) {
  const data = await readFile(ventasFilePath, { ventas: [] });
  return data.ventas || [];
}

async function registrarVenta(nuevaVenta, ventasFilePath) {
  if (!nuevaVenta || nuevaVenta.total === undefined) {
    return { success: false, message: 'Datos de venta requeridos' };
  }

  if (!nuevaVenta.id) nuevaVenta.id = Date.now();
  if (!nuevaVenta.fecha) nuevaVenta.fecha = new Date().toISOString();

  const data = await readFile(ventasFilePath, { ventas: [] });
  data.ventas.push(nuevaVenta);
  await writeFile(ventasFilePath, data);

  return { success: true, message: 'Venta registrada.', venta: nuevaVenta };
}

async function updateVenta(id, ventaDatos, ventasFilePath) {
  if (!ventaDatos || Object.keys(ventaDatos).length === 0) {
    return { success: false, message: 'No hay datos para actualizar' };
  }

  const data = await readFile(ventasFilePath, { ventas: [] });
  const index = data.ventas.findIndex(v => v.id == id);

  if (index === -1) {
    return { success: false, message: 'Venta no encontrada' };
  }

  data.ventas[index] = { ...data.ventas[index], ...ventaDatos, id: Number(id) };
  await writeFile(ventasFilePath, data);

  return { success: true, venta: data.ventas[index] };
}

async function obtenerEstadisticas(ventasFilePath) {
  const ventas = await getAll(ventasFilePath);

  if (ventas.length === 0) {
    return { totalVentas: 0, cantidadVentas: 0, montoPromedio: 0, montoMaximo: 0, montoMinimo: 0 };
  }

  const montos = ventas.map(v => v.total || 0);
  const totalVentas = montos.reduce((a, b) => a + b, 0);

  return {
    totalVentas,
    cantidadVentas: ventas.length,
    montoPromedio: totalVentas / ventas.length,
    montoMaximo: Math.max(...montos),
    montoMinimo: Math.min(...montos)
  };
}

describe('💰 Módulo de Ventas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registrar Ventas', () => {
    test('✓ Debe registrar una venta simple', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ ventas: [] }));
      fs.writeFile.mockResolvedValue();

      const resultado = await registrarVenta({ total: 150000, cliente: 'Juan' }, 'test.json');

      expect(resultado.success).toBe(true);
      expect(resultado.venta.total).toBe(150000);
      expect(resultado.venta.id).toBeDefined();
      expect(resultado.venta.fecha).toBeDefined();
    });

    test('✗ Debe rechazar venta sin total', async () => {
      const resultado = await registrarVenta({ cliente: 'Juan' }, 'test.json');
      expect(resultado.success).toBe(false);
    });

    test('✓ Debe registrar venta con múltiples productos', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ ventas: [] }));
      fs.writeFile.mockResolvedValue();

      const resultado = await registrarVenta({
        total: 1500000,
        productos: [{ id: 1, cantidad: 2 }, { id: 2, cantidad: 3 }]
      }, 'test.json');

      expect(resultado.success).toBe(true);
      expect(resultado.venta.productos).toHaveLength(2);
    });
  });

  describe('Actualizar Ventas', () => {
    test('✓ Debe actualizar una venta', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ ventas: [{ id: 1, total: 100000 }] }));
      fs.writeFile.mockResolvedValue();

      const resultado = await updateVenta(1, { total: 150000 }, 'test.json');

      expect(resultado.success).toBe(true);
      expect(resultado.venta.total).toBe(150000);
    });

    test('✗ Debe rechazar venta no existente', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ ventas: [] }));

      const resultado = await updateVenta(999, { total: 500 }, 'test.json');

      expect(resultado.success).toBe(false);
    });
  });

  describe('Estadísticas de Ventas', () => {
    test('✓ Debe calcular estadísticas correctamente', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({
        ventas: [
          { id: 1, total: 100000 },
          { id: 2, total: 200000 },
          { id: 3, total: 300000 }
        ]
      }));

      const resultado = await obtenerEstadisticas('test.json');

      expect(resultado.cantidadVentas).toBe(3);
      expect(resultado.totalVentas).toBe(600000);
      expect(resultado.montoPromedio).toBe(200000);
      expect(resultado.montoMaximo).toBe(300000);
      expect(resultado.montoMinimo).toBe(100000);
    });

    test('✓ Debe retornar valores cero sin ventas', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify({ ventas: [] }));

      const resultado = await obtenerEstadisticas('test.json');

      expect(resultado.cantidadVentas).toBe(0);
      expect(resultado.totalVentas).toBe(0);
    });
  });
});
