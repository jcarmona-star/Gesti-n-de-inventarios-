document.addEventListener("DOMContentLoaded", async function () {
    /**
     * ModuloReportes.js
     * Lógica para la visualización de reportes, gráficos y exportación de datos.
     */

    // --- LÓGICA DE REPORTES ---

    async function fetchData(endpoint) {
        try {
            const res = await fetch(endpoint);
            return await res.json();
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return [];
        }
    }

    let globalData = {
        productos: [],
        ventas: [],
        clientes: [],
        proveedores: []
    };

    async function initReportes() {
        const [productos, ventas, clientes, proveedores] = await Promise.all([
            fetchData('/api/productos'),
            fetchData('/api/ventas'),
            fetchData('/api/clientes'),
            fetchData('/api/proveedores')
        ]);

        globalData = { productos, ventas, clientes, proveedores };

        // 1. Actualizar Tarjetas de Resumen
        const totalIngresos = ventas.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0);
        const stockCritico = productos.filter(p => (parseInt(p.stock) || 0) < 5).length;

        // Buscar elementos de tarjetas (ajustar selectores según HTML)
        const cards = document.querySelectorAll('.card');
        if (cards.length >= 4) {
            cards[0].innerHTML = `Ingresos Totales: <strong>$${totalIngresos.toLocaleString()}</strong>`;
            cards[1].innerHTML = `Total Productos: <strong>${productos.length}</strong>`;
            cards[2].innerHTML = `Total Clientes: <strong>${clientes.length}</strong>`;
            cards[3].innerHTML = `Stock Crítico: <strong>${stockCritico}</strong>`;
        }

        // 2. Gráficos
        renderCharts(productos, ventas);
    }

    function renderCharts(productos, ventas) {
        // Gráfico de Ventas por Mes
        const ventasMes = {};
        ventas.forEach(v => {
            const date = new Date(v.fecha);
            const mes = date.toLocaleString('es-ES', { month: 'long' });
            ventasMes[mes] = (ventasMes[mes] || 0) + (parseFloat(v.total) || 0);
        });

        const ctxVentas = document.getElementById('ventasMes').getContext('2d');
        new Chart(ctxVentas, {
            type: 'bar',
            data: {
                labels: Object.keys(ventasMes),
                datasets: [{
                    label: 'Ventas por Mes ($)',
                    data: Object.values(ventasMes),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Gráfico de Categorías (Pie)
        const categorias = {};
        productos.forEach(p => {
            categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
        });

        // Ocultar lista de categorías para evitar duplicación
        const listaCat = document.querySelector('.grafico-pie ul');
        if (listaCat) {
            listaCat.style.display = 'none';
        }

        const ctxPie = document.getElementById('categoriasPie').getContext('2d');
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: Object.keys(categorias),
                datasets: [{
                    data: Object.values(categorias),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#4BC0C0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    initReportes();

    // --- DIÁLOGO DE SELECCIÓN DE DATOS ---

    /**
     * Muestra un diálogo para seleccionar qué datos exportar
     * @returns {Promise<Object>} Objeto con las selecciones del usuario
     */
    function showExportDialog() {
        return new Promise((resolve) => {
            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'export-overlay';
            overlay.innerHTML = `
                <div class="export-dialog">
                    <h3>Seleccionar Datos a Exportar</h3>
                    <p>Marca los datos que deseas incluir en el reporte:</p>
                    
                    <div class="export-options">
                        <label>
                            <input type="checkbox" id="export-productos" checked>
                            <span>Productos (${globalData.productos.length} registros)</span>
                        </label>
                        <label>
                            <input type="checkbox" id="export-ventas" checked>
                            <span>Ventas (${globalData.ventas.length} registros)</span>
                        </label>
                        <label>
                            <input type="checkbox" id="export-clientes" checked>
                            <span>Clientes (${globalData.clientes.length} registros)</span>
                        </label>
                        <label>
                            <input type="checkbox" id="export-proveedores" checked>
                            <span>Proveedores (${globalData.proveedores.length} registros)</span>
                        </label>
                        <label>
                            <input type="checkbox" id="export-consolidado" checked>
                            <span>Consolidado de Ventas (resumen por mes)</span>
                        </label>
                        <label>
                            <input type="checkbox" id="export-inventario" checked>
                            <span>Resumen de Inventario (stock y valores)</span>
                        </label>
                    </div>
                    
                    <div class="export-actions">
                        <button class="btn-export-confirm">Exportar</button>
                        <button class="btn-export-cancel">Cancelar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Manejar confirmación
            overlay.querySelector('.btn-export-confirm').addEventListener('click', () => {
                const selection = {
                    productos: document.getElementById('export-productos').checked,
                    ventas: document.getElementById('export-ventas').checked,
                    clientes: document.getElementById('export-clientes').checked,
                    proveedores: document.getElementById('export-proveedores').checked,
                    consolidado: document.getElementById('export-consolidado').checked,
                    inventario: document.getElementById('export-inventario').checked
                };
                document.body.removeChild(overlay);
                resolve(selection);
            });

            // Manejar cancelación
            overlay.querySelector('.btn-export-cancel').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(null);
            });
        });
    }

    /**
     * Genera datos consolidados de ventas por mes
     */
    function getConsolidadoVentas() {
        const consolidado = {};
        globalData.ventas.forEach(v => {
            const date = new Date(v.fecha);
            const mes = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            if (!consolidado[mes]) {
                consolidado[mes] = { mes, cantidad: 0, total: 0, promedio: 0 };
            }
            consolidado[mes].cantidad++;
            consolidado[mes].total += parseFloat(v.total) || 0;
        });

        // Calcular promedios
        Object.values(consolidado).forEach(c => {
            c.promedio = c.total / c.cantidad;
            c.total = c.total.toFixed(2);
            c.promedio = c.promedio.toFixed(2);
        });

        return Object.values(consolidado);
    }

    /**
     * Genera resumen de inventario
     */
    function getResumenInventario() {
        const resumen = globalData.productos.map(p => ({
            nombre: p.nombre,
            categoria: p.categoria,
            marca: p.marca,
            stock: p.stock,
            precio: p.precio,
            valorTotal: (parseFloat(p.precio) * parseInt(p.stock)).toFixed(2),
            estado: p.estado
        }));
        return resumen;
    }

    // --- EXPORTACIÓN PDF ---

    document.getElementById('btnExportPDF').addEventListener('click', async () => {
        const selection = await showExportDialog();
        if (!selection) return; // Usuario canceló

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Reporte de Gestión de Inventarios', 14, 22);
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

        let y = 40;

        // Resumen General
        doc.setFontSize(14);
        doc.text('Resumen General:', 14, y);
        y += 10;
        doc.setFontSize(10);

        if (selection.productos) {
            doc.text(`Total Productos: ${globalData.productos.length}`, 14, y); y += 6;
        }
        if (selection.clientes) {
            doc.text(`Total Clientes: ${globalData.clientes.length}`, 14, y); y += 6;
        }
        if (selection.ventas) {
            doc.text(`Total Ventas: ${globalData.ventas.length}`, 14, y); y += 6;
        }
        if (selection.proveedores) {
            doc.text(`Total Proveedores: ${globalData.proveedores.length}`, 14, y); y += 6;
        }
        y += 10;

        // Consolidado de Ventas
        if (selection.consolidado) {
            const consolidado = getConsolidadoVentas();
            doc.setFontSize(14);
            doc.text('Consolidado de Ventas por Mes:', 14, y);
            y += 10;
            doc.setFontSize(9);
            consolidado.forEach(c => {
                doc.text(`${c.mes}: ${c.cantidad} ventas - Total: $${c.total} - Promedio: $${c.promedio}`, 14, y);
                y += 6;
                if (y > 280) { doc.addPage(); y = 20; }
            });
            y += 10;
        }

        // Productos
        if (selection.productos) {
            doc.setFontSize(14);
            doc.text('Productos:', 14, y);
            y += 10;
            doc.setFontSize(9);
            globalData.productos.slice(0, 20).forEach(p => {
                doc.text(`- ${p.nombre} (${p.categoria}) - Stock: ${p.stock} - $${p.precio}`, 14, y);
                y += 6;
                if (y > 280) { doc.addPage(); y = 20; }
            });
            y += 10;
        }

        // Clientes
        if (selection.clientes) {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.text('Clientes:', 14, y);
            y += 10;
            doc.setFontSize(9);
            globalData.clientes.slice(0, 15).forEach(c => {
                doc.text(`- ${c.nombre} - ${c.email} - Tel: ${c.telefono}`, 14, y);
                y += 6;
                if (y > 280) { doc.addPage(); y = 20; }
            });
        }

        doc.save('reporte_inventario.pdf');
    });

    // --- EXPORTACIÓN EXCEL ---

    document.getElementById('btnExportExcel').addEventListener('click', async () => {
        const selection = await showExportDialog();
        if (!selection) return; // Usuario canceló

        const wb = XLSX.utils.book_new();

        // Hoja de Productos
        if (selection.productos) {
            const wsProductos = XLSX.utils.json_to_sheet(globalData.productos);
            XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");
        }

        // Hoja de Ventas
        if (selection.ventas) {
            const wsVentas = XLSX.utils.json_to_sheet(globalData.ventas);
            XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");
        }

        // Hoja de Clientes
        if (selection.clientes) {
            const wsClientes = XLSX.utils.json_to_sheet(globalData.clientes);
            XLSX.utils.book_append_sheet(wb, wsClientes, "Clientes");
        }

        // Hoja de Proveedores
        if (selection.proveedores) {
            const wsProveedores = XLSX.utils.json_to_sheet(globalData.proveedores);
            XLSX.utils.book_append_sheet(wb, wsProveedores, "Proveedores");
        }

        // Hoja de Consolidado de Ventas
        if (selection.consolidado) {
            const consolidado = getConsolidadoVentas();
            const wsConsolidado = XLSX.utils.json_to_sheet(consolidado);
            XLSX.utils.book_append_sheet(wb, wsConsolidado, "Consolidado Ventas");
        }

        // Hoja de Resumen de Inventario
        if (selection.inventario) {
            const inventario = getResumenInventario();
            const wsInventario = XLSX.utils.json_to_sheet(inventario);
            XLSX.utils.book_append_sheet(wb, wsInventario, "Resumen Inventario");
        }

        XLSX.writeFile(wb, "reporte_completo.xlsx");
    });

});
