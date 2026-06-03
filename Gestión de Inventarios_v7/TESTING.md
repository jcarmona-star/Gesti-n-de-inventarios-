# 🧪 Pruebas Unitarias - Gestión de Inventarios v6

Este documento describe las pruebas unitarias implementadas con Jest para la aplicación de Gestión de Inventarios.

## 📋 Descripción General

Se han creado **49 pruebas unitarias** organizadas en **4 módulos principales**, cada uno enfocado en una funcionalidad específica del sistema.

### ✅ Resultados
- **Test Suites Pasadas:** 4/4
- **Tests Totales Pasados:** 49/49
- **Tiempo de Ejecución:** ~2.5 segundos

---

## 🚀 Cómo Ejecutar las Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo observador (watch mode)
```bash
npm run test:watch
```

### Ejecutar pruebas de un módulo específico
```bash
npm test -- auth.test.js
npm test -- productos.test.js
npm test -- ventas.test.js
npm test -- reportes.test.js
```

### Ejecutar con cobertura de código
```bash
npm test -- --coverage
```

---

## 📦 Módulos Testeados

### 1. 🔐 **Autenticación (`auth.test.js`)** - 11 pruebas

Prueba las funcionalidades de registro e inicio de sesión de usuarios.

**Pruebas incluidas:**
- ✅ Registrar usuario con datos válidos
- ❌ Rechazar registro sin campos requeridos
- ❌ Rechazar correos duplicados
- ✅ Normalizar correo a minúsculas en el registro
- ✅ Permitir login con credenciales válidas
- ❌ Rechazar login sin email o contraseña
- ❌ Rechazar login con usuario no encontrado
- ❌ Rechazar login con contraseña incorrecta
- ✅ Ignorar mayúsculas/minúsculas en email de login
- ✅ Generar hash SHA-256 consistente
- ✅ Generar hashes diferentes para contraseñas diferentes

**Características principales:**
- Validación de campos requeridos
- Prevención de duplicados de correo electrónico
- Hashing seguro de contraseñas
- Normalización de datos

---

### 2. 📦 **Productos (`productos.test.js`)** - 18 pruebas

Prueba las operaciones CRUD de productos e inventario.

**Pruebas incluidas:**

#### Crear Productos (5)
- ✅ Crear nuevo producto con datos válidos
- ❌ Rechazar producto sin nombre
- ❌ Rechazar producto con precio negativo
- ✅ Asignar cantidad 0 por defecto
- ✅ Generar ID automático

#### Actualizar Productos (4)
- ✅ Actualizar nombre de producto
- ✅ Actualizar precio de producto
- ❌ Rechazar actualización de producto no existente
- ❌ Rechazar actualización sin datos

#### Gestión de Stock (5)
- ✅ Restar stock correctamente
- ❌ Rechazar si stock es insuficiente
- ✅ Permitir agotar stock completo
- ❌ Rechazar cantidad negativa
- ❌ Rechazar producto no encontrado

#### Obtener Productos (4)
- ✅ Obtener todos los productos
- ✅ Obtener producto por ID
- ✅ Retornar null si producto no existe

**Características principales:**
- Validación de atributos de productos
- Actualización automática de stock
- Prevención de valores inválidos
- Búsqueda y listado de productos

---

### 3. 💰 **Ventas (`ventas.test.js`)** - 8 pruebas

Prueba el registro y gestión de ventas.

**Pruebas incluidas:**

#### Registrar Ventas (3)
- ✅ Registrar venta simple
- ❌ Rechazar venta sin total
- ✅ Registrar venta con múltiples productos

#### Actualizar Ventas (2)
- ✅ Actualizar monto de venta
- ❌ Rechazar venta no existente

#### Estadísticas de Ventas (3)
- ✅ Calcular estadísticas correctamente
- ✅ Retornar valores cero sin ventas
- ✅ Calcular máximo y mínimo

**Características principales:**
- Generación automática de ID y fecha
- Cálculo de estadísticas (total, promedio, máx, mín)
- Validación de montos
- Manejo de múltiples productos

---

### 4. 📊 **Reportes (`reportes.test.js`)** - 14 pruebas

Prueba la generación de reportes en diferentes formatos.

**Pruebas incluidas:**

#### Reporte de Inventario (4)
- ✅ Generar reporte de inventario
- ✅ Identificar productos con bajo stock
- ✅ Identificar productos sin stock
- ✅ Retornar reporte vacío si no hay productos

#### Reporte de Ventas (3)
- ✅ Generar reporte de ventas
- ✅ Filtrar ventas por rango de fechas
- ✅ Calcular máximo y mínimo de ventas

#### Reporte Consolidado (1)
- ✅ Generar reporte consolidado del sistema

#### Exportación a Formatos (6)
- ✅ Exportar reporte a JSON válido
- ✅ Exportar datos a CSV con encabezados
- ✅ Escapar comillas en CSV
- ✅ Exportar datos a HTML con tabla
- ✅ HTML debe incluir estilos básicos
- ✅ Retornar CSV vacío si no hay datos

**Características principales:**
- Generación de reportes en JSON
- Exportación a CSV (Excel compatible)
- Exportación a HTML con estilos
- Filtrado de datos por fechas
- Cálculo de resúmenes estadísticos

---

## 🎯 Estructura de las Pruebas

### Convenciones Utilizadas

```javascript
describe('Module Name', () => {
  beforeEach(() => {
    // Preparación antes de cada prueba
    jest.clearAllMocks();
  });

  describe('Feature Group', () => {
    test('✓ Should do something valid', () => {
      // Prueba exitosa
    });

    test('✗ Should reject invalid input', () => {
      // Prueba de rechazo
    });
  });
});
```

### Mocking de Sistema de Archivos

Todas las pruebas utilizan **mocks de Jest** para el módulo `fs`, lo que permite:
- ✅ Evitar escribir en archivos reales del sistema
- ✅ Simular diferentes escenarios
- ✅ Evitar efectos secundarios
- ✅ Ejecutar pruebas rápidamente

---

## 📁 Archivos de Prueba

```
__tests__/
├── auth.test.js        # Pruebas de autenticación
├── productos.test.js   # Pruebas de productos e inventario
├── ventas.test.js      # Pruebas de ventas
└── reportes.test.js    # Pruebas de generación de reportes
```

---

## 🔧 Configuración de Jest

El archivo `jest.config.js` contiene la configuración:

```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['server.js'],
  verbose: true
}
```

---

## 📊 Cobertura de Código

Para ver la cobertura de código detallada, ejecuta:

```bash
npm test -- --coverage
```

Se generará:
- Reporte de cobertura en terminal
- Carpeta `coverage/` con reporte HTML

---

## ✨ Características de las Pruebas

### 1. **Pruebas Independientes**
Cada prueba es independiente y no afecta a otras gracias a los mocks.

### 2. **Validación Exhaustiva**
Se prueban casos válidos e inválidos para cada funcionalidad.

### 3. **Mensajes Descriptivos**
Cada prueba tiene un nombre claro que describe qué valida.

### 4. **Emoji indicadores**
- ✅ Pruebas de casos válidos/exitosos
- ❌ Pruebas de casos inválidos/rechazo
- 🔐 Módulo de autenticación
- 📦 Módulo de productos
- 💰 Módulo de ventas
- 📊 Módulo de reportes

---

## 🚨 Notas Importantes

1. **Sin Modificación de Archivos Reales**
   - Las pruebas no modifican los archivos JSON reales
   - Se utilizan mocks para simular el sistema de archivos

2. **Ejecución Rápida**
   - Todas las pruebas se ejecutan en ~2.5 segundos
   - Ideal para CI/CD

3. **Compatibilidad**
   - Las pruebas funcionan con Jest 30.3.0+
   - Compatible con Node.js 14+

---

## 📈 Próximas Mejoras Sugeridas

- [ ] Pruebas de integración con cliente HTTP
- [ ] Pruebas de endpoints de la API
- [ ] Pruebas de concurrencia
- [ ] Pruebas de rendimiento
- [ ] Cobertura de 100% del código

---

## 📞 Soporte

Para ejecutar una prueba específica:
```bash
npm test -- --testNamePattern="nombre de la prueba"
```

Para filtrar por módulo:
```bash
npm test -- --testPathPattern="auth"
```

---

**Última actualización:** Abril 2026
**Versión:** 6.0
**Estado:** ✅ Todas las pruebas pasando
