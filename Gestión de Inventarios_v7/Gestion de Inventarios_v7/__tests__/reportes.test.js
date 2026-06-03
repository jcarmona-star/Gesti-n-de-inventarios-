/**
 * Tests de Reportes
 * Pruebas de generación de reportes en JSON, CSV, HTML
 */

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

// Funciones de reportes
async function readFile(filePath, defaultContent) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || JSON.stringify(defaultContent));
  } catch (err) {
    return defaultContent;
  }
}

async function reporteInventario(productosFilePath) {
  const data = await readFile(productosFilePath, { productos: [] });
  const productos = data.productos || [];

  const totalProductos = productos.length;
  const totalValorInventario = productos.reduce((acc, p) => {
    return acc + ((p.precio || 0) * (p.cantidad || 0));
  }, 0);

  const productosABajo = productos.filter(p => (p.cantidad || 0) < 10);
  const productosSinStock = productos.filter(p => (p.cantidad || 0) === 0);

  return {
    tipo: 'Reporte de Inventario',
    fechaGeneracion: new Date().toISOString(),
    resumen: {
      totalProductos,
      totalValorInventario,
      productosABajo: productosABajo.length,
      productosSinStock: productosSinStock.length
    },
    detalles: {
      productos,
      productosABajo,
      productosSinStock
    }
  };
}

async function reporteVentas(ventasFilePath, fechaInicio = null, fechaFin = null) {
  const data = await readFile(ventasFilePath, { ventas: [] });
  let ventas = data.ventas || [];

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    ventas = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha >= inicio && fecha <= fin;
    });
  }

  const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
  const cantidadVentas = ventas.length;
  const montoPromedio = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

  return {
    tipo: 'Reporte de Ventas',
    fechaGeneracion: new Date().toISOString(),
    periodoReporte: {
      desde: fechaInicio,
      hasta: fechaFin
    },
    resumen: {
      cantidadVentas,
      totalVentas,
      montoPromedio,
      montoMaximo: ventas.length > 0 ? Math.max(...ventas.map(v => v.total || 0)) : 0,
      montoMinimo: ventas.length > 0 ? Math.min(...ventas.map(v => v.total || 0)) : 0
    },
    detalles: ventas
  };
}

async function reporteConsolidado(productosFilePath, ventasFilePath, usuariosFilePath) {
  const productosData = await readFile(productosFilePath, { productos: [] });
  const ventasData = await readFile(ventasFilePath, { ventas: [] });
  const usuariosData = await readFile(usuariosFilePath, []);

  const productos = productosData.productos || [];
  const ventas = ventasData.ventas || [];

  const totalValorInventario = productos.reduce((acc, p) => {
    return acc + ((p.precio || 0) * (p.cantidad || 0));
  }, 0);

  const totalVentas = ventas.reduce((acc, v) => acc + (v.total || 0), 0);

  return {
    tipo: 'Reporte Consolidado del Sistema',
    fechaGeneracion: new Date().toISOString(),
    resumen: {
      inventario: {
        totalProductos: productos.length,
        valorTotal: totalValorInventario
      },
      ventas: {
        cantidadVentas: ventas.length,
        montoTotal: totalVentas
      },
      usuarios: {
        totalUsuarios: usuariosData.length
      }
    }
  };
}

function exportarJSON(reporte) {
  return JSON.stringify(reporte, null, 2);
}

function exportarCSV(datos, columnas) {
  if (!Array.isArray(datos) || datos.length === 0) {
    return '';
  }

  const headers = columnas.join(',');
  const filas = datos.map(item => {
    return columnas.map(col => {
      const valor = item[col];
      if (valor === null || valor === undefined) return '';
      if (typeof valor === 'string' && valor.includes(',')) {
        return `"${valor}"`;
      }
      return String(valor);
    }).join(',');
  });

  return [headers, ...filas].join('\n');
}

function exportarHTML(datos, columnas, titulo = 'Reporte') {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
  <p>Generado: ${new Date().toISOString()}</p>
  <table>
    <thead>
      <tr>
        ${columnas.map(col => `<th>${col}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${datos.map(row => `
      <tr>
        ${columnas.map(col => `<td>${row[col] || ''}</td>`).join('')}
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  return html;
}

describe('📊 Módulo de Reportes', () => {
  const testProductosFile = 'test-productos.json';
  const testVentasFile = 'test-ventas.json';
  const testUsuariosFile = 'test-usuarios.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reporte de Inventario', () => {
    test('✓ Debe generar reporte de inventario', async () => {
      const productosData = {
        productos: [
          { id: 1, nombre: 'Laptop', precio: 1000, cantidad: 5 },
          { id: 2, nombre: 'Mouse', precio: 50, cantidad: 20 }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(productosData));

      const resultado = await reporteInventario(testProductosFile);

      expect(resultado.tipo).toBe('Reporte de Inventario');
      expect(resultado.resumen.totalProductos).toBe(2);
      expect(resultado.resumen.totalValorInventario).toBe(6000);
    });

    test('✓ Debe identificar productos con bajo stock', async () => {
      const productosData = {
        productos: [
          { id: 1, nombre: 'Laptop', precio: 1000, cantidad: 5 },
          { id: 2, nombre: 'Mouse', precio: 50, cantidad: 50 }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(productosData));

      const resultado = await reporteInventario(testProductosFile);

      expect(resultado.resumen.productosABajo).toBe(1);
      expect(resultado.detalles.productosABajo[0].nombre).toBe('Laptop');
    });

    test('✓ Debe identificar productos sin stock', async () => {
      const productosData = {
        productos: [
          { id: 1, nombre: 'Laptop', precio: 1000, cantidad: 0 },
          { id: 2, nombre: 'Mouse', precio: 50, cantidad: 5 }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(productosData));

      const resultado = await reporteInventario(testProductosFile);

      expect(resultado.resumen.productosSinStock).toBe(1);
    });

    test('✓ Debe retornar reporte vacío si no hay productos', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify({ productos: [] }));

      const resultado = await reporteInventario(testProductosFile);

      expect(resultado.resumen.totalProductos).toBe(0);
      expect(resultado.resumen.totalValorInventario).toBe(0);
    });
  });

  describe('Reporte de Ventas', () => {
    test('✓ Debe generar reporte de ventas', async () => {
      const ventasData = {
        ventas: [
          { id: 1, total: 100000, fecha: new Date().toISOString() },
          { id: 2, total: 200000, fecha: new Date().toISOString() }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(ventasData));

      const resultado = await reporteVentas(testVentasFile);

      expect(resultado.tipo).toBe('Reporte de Ventas');
      expect(resultado.resumen.cantidadVentas).toBe(2);
      expect(resultado.resumen.totalVentas).toBe(300000);
      expect(resultado.resumen.montoPromedio).toBe(150000);
    });

    test('✓ Debe filtrar ventas por rango de fechas', async () => {
      const hoy = new Date();
      const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);
      const manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);

      const ventasData = {
        ventas: [
          { id: 1, total: 100000, fecha: hoy.toISOString() },
          { id: 2, total: 200000, fecha: new Date(hoy.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(ventasData));

      const resultado = await reporteVentas(testVentasFile, ayer.toISOString(), manana.toISOString());

      expect(resultado.resumen.cantidadVentas).toBe(1);
    });

    test('✓ Debe calcular máximo y mínimo de ventas', async () => {
      const ventasData = {
        ventas: [
          { id: 1, total: 50000, fecha: new Date().toISOString() },
          { id: 2, total: 200000, fecha: new Date().toISOString() },
          { id: 3, total: 100000, fecha: new Date().toISOString() }
        ]
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify(ventasData));

      const resultado = await reporteVentas(testVentasFile);

      expect(resultado.resumen.montoMaximo).toBe(200000);
      expect(resultado.resumen.montoMinimo).toBe(50000);
    });
  });

  describe('Reporte Consolidado', () => {
    test('✓ Debe generar reporte consolidado del sistema', async () => {
      const productosData = { productos: [{ id: 1, nombre: 'Producto', precio: 1000, cantidad: 5 }] };
      const ventasData = { ventas: [{ id: 1, total: 100000 }] };
      const usuariosData = [{ id: 1, nombre: 'Usuario' }];

      fs.readFile.mockResolvedValueOnce(JSON.stringify(productosData));
      fs.readFile.mockResolvedValueOnce(JSON.stringify(ventasData));
      fs.readFile.mockResolvedValueOnce(JSON.stringify(usuariosData));

      const resultado = await reporteConsolidado(testProductosFile, testVentasFile, testUsuariosFile);

      expect(resultado.tipo).toBe('Reporte Consolidado del Sistema');
      expect(resultado.resumen.inventario.totalProductos).toBe(1);
      expect(resultado.resumen.ventas.cantidadVentas).toBe(1);
      expect(resultado.resumen.usuarios.totalUsuarios).toBe(1);
    });
  });

  describe('Exportación a Formatos', () => {
    test('✓ Debe exportar reporte a JSON válido', () => {
      const reporte = {
        tipo: 'Test',
        resumen: { total: 100 }
      };

      const json = exportarJSON(reporte);
      const parsed = JSON.parse(json);

      expect(parsed.tipo).toBe('Test');
      expect(parsed.resumen.total).toBe(100);
    });

    test('✓ Debe exportar datos a CSV con encabezados', () => {
      const datos = [
        { id: 1, nombre: 'Producto A', precio: 100 },
        { id: 2, nombre: 'Producto B', precio: 200 }
      ];
      const columnas = ['id', 'nombre', 'precio'];

      const csv = exportarCSV(datos, columnas);

      expect(csv).toContain('id,nombre,precio');
      expect(csv).toContain('1,Producto A,100');
      expect(csv).toContain('2,Producto B,200');
    });

    test('✓ Debe escapar comillas en CSV', () => {
      const datos = [
        { nombre: 'Producto, con coma', precio: 100 }
      ];
      const columnas = ['nombre', 'precio'];

      const csv = exportarCSV(datos, columnas);

      expect(csv).toContain('"Producto, con coma"');
    });

    test('✓ Debe exportar datos a HTML con tabla', () => {
      const datos = [
        { id: 1, nombre: 'Producto A' },
        { id: 2, nombre: 'Producto B' }
      ];
      const columnas = ['id', 'nombre'];

      const html = exportarHTML(datos, columnas, 'Mi Reporte');

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<table>');
      expect(html).toContain('Mi Reporte');
      expect(html).toContain('Producto A');
      expect(html).toContain('Producto B');
    });

    test('✓ HTML debe incluir estilos básicos', () => {
      const datos = [{ id: 1 }];
      const columnas = ['id'];

      const html = exportarHTML(datos, columnas);

      expect(html).toContain('<style>');
      expect(html).toContain('#4CAF50'); // Color del encabezado
    });

    test('✓ Debe retornar CSV vacío si no hay datos', () => {
      const csv = exportarCSV([], ['id', 'nombre']);

      expect(csv).toBe('');
    });
  });
});