# 📦 Sistema de Gestión de Inventarios

Sistema de inventarios basado en una arquitectura sencilla con backend Express y almacenamiento local en archivos JSON.

## 🗂️ Estructura del Proyecto

```
Gestión de Inventarios_v6/
├── 📁 data/                   # Datos persistentes en JSON
│   ├── clientes.json          # Información de clientes
│   ├── productos.json         # Inventario de productos
│   ├── proveedores.json       # Datos de proveedores
│   ├── users.json             # Usuarios del sistema
│   └── ventas.json            # Ventas registradas
│
├── 📁 public/                 # Frontend estático
│   ├── Confirmacion.html
│   ├── Dashboard.html
│   ├── Login.html
│   ├── ModuloCliente.html
│   ├── ModuloProductos.html
│   ├── ModuloProveedor.html
│   ├── ModuloReportes.html
│   ├── ├── ModuloVentas.html
│   ├── Registro.html
│   └── assets/
│       ├── css/style.css
│       └── js/
│           ├── backend-check.js
│           ├── Dashboard.js
│           ├── ModuloCliente.js
│           ├── ModuloProductos.js
│           ├── ModuloProveedor.js
│           ├── ModuloReportes.js
│           ├── ModuloVentas.js
│           ├── pagination.js
│           ├── register.js
│           ├── login.js
│           ├── storage.js
│           ├── ui.js
│           └── user-display.js
│
├── server.js                 # Servidor Express y API REST
├── package.json              # Configuración del proyecto
├── package-lock.json         # Lock de dependencias
└── README.md                 # Documentación del proyecto
```

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js v14 o superior
- npm instalado

### Pasos

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor:
```bash
npm start
```

3. Abrir el navegador en:
```text
http://localhost:3000
```

> El servidor sirve el frontend estático desde `public/` y expone la API en el mismo puerto.

## 🧩 Qué hace el proyecto

Este proyecto ofrece un sistema para gestionar:
- usuarios y sesiones de acceso
- productos de inventario
- clientes
- proveedores
- ventas con múltiples productos
- reportes visuales y exportables

Los datos se guardan en archivos JSON dentro de `data/`, por lo que no se requiere base de datos externa.

## 🧠 Funcionalidades principales

### Autenticación y usuarios
- Registro de nuevos usuarios usando `POST /api/register`
- Inicio de sesión con `POST /api/login`
- Sesión básica almacenada en `localStorage`
- Página de confirmación tras registro

### Dashboard
- Verificación de sesión antes de mostrar el dashboard
- Métricas de ingresos, inventario y ventas pendientes
- Gráficos de categorias y ventas
- Navegación a todos los módulos del sistema

### Módulo de Productos
- Lista completa de productos
- Paginación y filtrado en tiempo real
- Formulario para crear nuevos productos
- Edición del formulario en frontend

### Módulo de Clientes
- Lista de clientes con paginación
- Búsqueda y filtrado dinámico
- Creación de clientes
- Edición de cliente en frontend

### Módulo de Proveedores
- Lista de proveedores con paginación
- Búsqueda y filtrado dinámico
- Creación de proveedores
- Edición de proveedor en frontend

### Módulo de Ventas
- Registro de ventas con múltiples productos
- Cálculo automático del total
- Filtros y búsqueda de ventas
- Visualización de detalle de venta
- Edición de ventas mediante `PUT /api/ventas/:id`

### Módulo de Reportes
- Gráficos de ventas por mes
- Gráficos de distribución de productos
- Tarjetas resumen de inventario y clientes
- Exportación configurable a PDF
- Exportación a Excel con hojas separadas

## 🔧 Backend disponible

### Endpoints de autenticación
- `POST /api/register` — Registrar usuario
- `POST /api/login` — Iniciar sesión
- `GET /api/users` — Obtener usuarios registrados

### CRUD básico de recursos
- `GET /api/productos` — Listar productos
- `POST /api/productos` — Crear producto
- `GET /api/clientes` — Listar clientes
- `POST /api/clientes` — Crear cliente
- `GET /api/proveedores` — Listar proveedores
- `POST /api/proveedores` — Crear proveedor

### Ventas
- `GET /api/ventas` — Listar ventas
- `POST /api/ventas` — Crear venta
- `PUT /api/ventas/:id` — Actualizar venta existente

### Utilidades
- `GET /ping` — Verificar salud del servidor
- `GET /` — Cargar `Login.html`

## 📌 Notas de implementación

- El backend usa `express.static` para servir los archivos de `public/`.
- El almacenamiento es local en JSON; cualquier cambio se escribe directamente en los archivos bajo `data/`.
- El hashing de contraseñas usa SHA-256 con `crypto`.
- El frontend está construido con HTML, CSS y JavaScript vanilla.
- Las páginas usan `fetch()` para comunicarse con la API.

## 📝 Limitaciones actuales

- No hay endpoints DELETE implementados para productos, clientes o proveedores.
- El módulo de productos y clientes dispone de formularios de edición en frontend, pero la API actual solo implementa creación (`POST`) y no actualiza registros existentes.
- La gestión de sesión es simple y no incluye tokens JWT ni seguridad avanzada.

## 🛠️ Desarrollo

Para modificar el proyecto:
1. Actualiza los datos en `data/`
2. Cambia la lógica de frontend en `public/assets/js/`
3. Ajusta las vistas en `public/*.html`
4. Modifica rutas y lógica del backend en `server.js`
5. Edita estilos en `public/assets/css/style.css`

## 📄 Tecnologías usadas

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript vanilla
- Chart.js
- jsPDF
- SheetJS (`xlsx`)

---

**Versión actual del proyecto:** 1.0.0
**Última actualización:** Abril 2026
