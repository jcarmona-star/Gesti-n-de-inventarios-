const crypto = require('crypto');

/**
 * Tests de Autenticación
 * Prueba de login y registro de usuarios
 */

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const fs = require('fs').promises;

// Funciones de autenticación
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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

async function register(userData, usersFilePath) {
  const { nombre, documento, correo, telefono, password } = userData || {};

  if (!nombre || !documento || !correo || !telefono || !password) {
    return { success: false, message: 'Faltan campos requeridos.' };
  }

  const users = await readFile(usersFilePath, []);

  const exists = users.find(u => u.correo && u.correo.toLowerCase() === correo.toLowerCase());
  if (exists) {
    return { success: false, message: 'El correo ya está registrado.' };
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
  await writeFile(usersFilePath, users);

  return { success: true, message: 'Usuario registrado correctamente.' };
}

async function login(email, password, usersFilePath) {
  if (!email || !password) {
    return { success: false, message: 'Faltan campos.' };
  }

  const users = await readFile(usersFilePath, []);
  const user = users.find(u => u.correo === (email || '').toLowerCase());

  if (!user) {
    return { success: false, message: 'Usuario no encontrado.' };
  }

  if (user.password === hashPassword(password)) {
    const safeUser = { id: user.id, nombre: user.nombre, correo: user.correo };
    return { success: true, message: 'Login exitoso.', user: safeUser };
  }

  return { success: false, message: 'Contraseña incorrecta.' };
}

describe('🔐 Módulo de Autenticación', () => {
  const testUsersFile = 'test-users.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registro de Usuarios', () => {
    test('✓ Debe registrar un usuario con datos válidos', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
      fs.writeFile.mockResolvedValueOnce();

      const resultado = await register({
        nombre: 'Juan Pérez',
        documento: '1234567890',
        correo: 'juan@example.com',
        telefono: '3001234567',
        password: 'password123'
      }, testUsersFile);

      expect(resultado.success).toBe(true);
      expect(resultado.message).toContain('registrado');
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('✗ Debe rechazar registro sin campos requeridos', async () => {
      const resultado = await register({
        nombre: 'Juan',
        correo: 'juan@example.com'
        // Falta documento, telefono y password
      }, testUsersFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('Faltan campos');
    });

    test('✗ Debe rechazar correos duplicados', async () => {
      const usuarioExistente = {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@example.com',
        password: hashPassword('pass123')
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify([usuarioExistente]));

      const resultado = await register({
        nombre: 'otro',
        documento: '123',
        correo: 'juan@example.com',
        telefono: '123',
        password: 'pass456'
      }, testUsersFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('ya está registrado');
    });

    test('✓ Debe normalizar correo a minúsculas', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
      fs.writeFile.mockResolvedValueOnce();

      await register({
        nombre: 'Juan',
        documento: '123',
        correo: 'JUAN@EXAMPLE.COM',
        telefono: '123',
        password: 'pass123'
      }, testUsersFile);

      const argsEscrituraArchivo = fs.writeFile.mock.calls[0][1];
      const usuarioGuardado = JSON.parse(argsEscrituraArchivo)[0];
      expect(usuarioGuardado.correo).toBe('juan@example.com');
    });
  });

  describe('Login de Usuarios', () => {
    test('✓ Debe permitir login con credenciales válidas', async () => {
      const passwordHash = hashPassword('password123');
      const usuarioRegistrado = {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@example.com',
        password: passwordHash
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify([usuarioRegistrado]));

      const resultado = await login('juan@example.com', 'password123', testUsersFile);

      expect(resultado.success).toBe(true);
      expect(resultado.user).toBeDefined();
      expect(resultado.user.nombre).toBe('Juan');
      expect(resultado.user.correo).toBe('juan@example.com');
      expect(resultado.user.password).toBeUndefined();
    });

    test('✗ Debe rechazar login sin email o contraseña', async () => {
      const resultado1 = await login('', 'password123', testUsersFile);
      expect(resultado1.success).toBe(false);

      const resultado2 = await login('juan@example.com', '', testUsersFile);
      expect(resultado2.success).toBe(false);
    });

    test('✗ Debe rechazar login con usuario no encontrado', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify([]));

      const resultado = await login('noexiste@example.com', 'password123', testUsersFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('no encontrado');
    });

    test('✗ Debe rechazar login con contraseña incorrecta', async () => {
      const passwordHash = hashPassword('password123');
      const usuarioRegistrado = {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@example.com',
        password: passwordHash
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify([usuarioRegistrado]));

      const resultado = await login('juan@example.com', 'passwordIncorrecto', testUsersFile);

      expect(resultado.success).toBe(false);
      expect(resultado.message).toContain('Contraseña incorrecta');
    });

    test('✓ Debe ignorar mayúsculas/minúsculas en email de login', async () => {
      const passwordHash = hashPassword('password123');
      const usuarioRegistrado = {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@example.com',
        password: passwordHash
      };

      fs.readFile.mockResolvedValueOnce(JSON.stringify([usuarioRegistrado]));

      const resultado = await login('JUAN@EXAMPLE.COM', 'password123', testUsersFile);

      expect(resultado.success).toBe(true);
    });
  });

  describe('Hash de Contraseña', () => {
    test('✓ Debe generar hash SHA-256 consistente', () => {
      const pass = 'myPassword123';
      const hash1 = hashPassword(pass);
      const hash2 = hashPassword(pass);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 genera 64 caracteres hexadecimales
    });

    test('✓ Debe generar hashes diferentes para contraseñas diferentes', () => {
      const hash1 = hashPassword('password1');
      const hash2 = hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
