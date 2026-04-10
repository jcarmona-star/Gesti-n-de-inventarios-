// Importación de módulos necesarios
const express = require('express');                     // Framework para crear el servidor
const path = require('path');                           // Módulo para manejar rutas de archivos
const fs = require('fs').promises;                      // Módulo para leer y escribir archivos de forma asíncrona
const crypto = require('crypto');                       // Módulo para generar hash de contraseñas
const app = express();                                  // Inicialización de la aplicación Express
const port = process.env.PORT || 3000;                  // Puerto de escucha del servidor

// Rutas de archivos de almacenamiento local
const USERS_FILE = path.join(__dirname, 'users.json');  // Archivo donde se guardan los usuarios
const DATA_FILE = path.join(__dirname, 'data.json');    // Archivo donde se guardan los productos

// Middleware para interpretar el cuerpo de las peticiones como JSON
app.use(express.json());

// Middleware para registrar en consola cada petición recibida
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware para permitir peticiones desde otros orígenes (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204); // Respuesta rápida a preflight
  next();
});

// Funciones auxiliares

/**
 * hashPassword(password) -> string
 * Genera un hash SHA-256 de la contraseña.
 * (Uso demostrativo — en producción se recomienda bcrypt o scrypt).
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * readUsers() -> Array
 * Lee el archivo users.json y devuelve el array de usuarios.
 * Si el archivo no existe, devuelve un array vacío.
 */
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

/**
 * writeUsers(users)
 * Guarda el array de usuarios en el archivo users.json.
 */
async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * readData() -> Object
 * Lee el archivo data.json y devuelve el objeto con productos.
 * Si no existe, devuelve un objeto vacío con array de productos.
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data || '{"productos": []}');
  } catch (err) {
    return { productos: [] };
  }
}

/**
 * writeData(data)
 * Guarda el objeto de productos en el archivo data.json.
 */
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Endpoints de la API

// Registro de nuevos usuarios
app.post('/api/register', async (req, res) => {
  const { nombre, documento, correo, telefono, password } = req.body || {};
  if (!nombre || !documento || !correo || !telefono || !password) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos.' });
  }

  const users = await readUsers();
  const exists = users.find(u => u.correo && u.correo.toLowerCase() === correo.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
  }

  const newUser = {
    id: Date.now(),
    nombre,
    documento,
    correo: correo.toLowerCase(),
    telefono,
    password: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeUsers(users);

  return res.json({ success: true, message: 'Usuario registrado correctamente.' });
});

// Inicio de sesión (login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan campos.' });
  }

  const users = await readUsers();
  const user = users.find(u => u.correo === (email || '').toLowerCase());
  if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });

  if (user.password === hashPassword(password)) {
    const safeUser = { id: user.id, nombre: user.nombre, correo: user.correo };
    return res.json({ success: true, message: 'Login exitoso.', user: safeUser });
  }

  return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
});

// ✅ Obtener lista de usuarios registrados
app.get('/api/users', async (req, res) => {
  const users = await readUsers();
  res.json({ success: true, usuarios: users });
});

// Middleware para servir archivos estáticos (HTML, JS, CSS) desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '.')));

// Comprobación simple para verificar que el servidor está activo
app.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Ruta raíz: carga el archivo Login.html por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Login.html'));
});

// Obtener lista de productos desde data.json
app.get('/api/productos', async (req, res) => {
  const data = await readData();
  res.json(data.productos);
});

// Agregar un nuevo producto a data.json
app.post('/api/productos', async (req, res) => {
  const nuevoProducto = req.body;
  if (!nuevoProducto || !nuevoProducto.id || !nuevoProducto.nombre) {
    return res.status(400).json({ success: false, message: 'Datos incompletos del producto.' });
  }

  const data = await readData();
  data.productos.push(nuevoProducto);
  await writeData(data);

  res.status(201).json({ success: true, message: 'Producto agregado correctamente.' });
});

//////////////////////////////
// Inicio del servidor
//////////////////////////////

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://0.0.0.0:${port}`);
  console.log('Puedes acceder usando:');
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Red local: http://<tu-ip-local>:${port}`);
});