/**
 * Confirmacion.js
 * Muestra los datos del usuario registrado recientemente y permite:
 * - Iniciar sesión inmediatamente con esos datos (llamando a /api/login)
 * - Ir a la página de Login prellenando el formulario para conveniencia
 */
document.addEventListener('DOMContentLoaded', function () {
	// Leer el usuario registrado recientemente desde sessionStorage
	let recentStr = null;
	try {
		recentStr = sessionStorage.getItem('recentlyRegisteredUser');
	} catch (e) {
		console.warn('No se pudo leer sessionStorage:', e);
	}

	if (!recentStr) {
		// Si no hay datos recientes, redirigir al registro
		console.warn('No hay datos de registro recientes. Redirigiendo a Registro.html');
		window.location.href = 'Registro.html';
		return;
	}

	let recent = null;
	try {
		recent = JSON.parse(recentStr);
	} catch (e) {
		console.error('Error parseando recentlyRegisteredUser:', e);
		window.location.href = 'Registro.html';
		return;
	}

	// Rellenar la UI con los datos recientes
	document.getElementById('nombre').textContent = recent.nombre || '';
	document.getElementById('documento').textContent = recent.documento || '';
	document.getElementById('correo').textContent = recent.correo || '';
	document.getElementById('telefono').textContent = recent.telefono || '';

	const loginNowBtn = document.getElementById('loginNowBtn');
	const goToLoginBtn = document.getElementById('goToLoginBtn');

	/**
	 * API_BASE
	 * Calcula la base del API (misma lógica usada en register.js)
	 */
	const API_BASE = (function () {
		try {
			if (location.protocol === 'file:') return 'http://localhost:3000';
			if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
				if (location.port && location.port !== '3000') return 'http://localhost:3000';
				return '';
			}
		} catch (e) {
			return 'http://localhost:3000';
		}
		return '';
	})();

	// Iniciar sesión automáticamente usando los datos recién registrados
	if (loginNowBtn) {
		loginNowBtn.addEventListener('click', async function () {
			if (!recent || !recent.correo || !recent.password) {
				alert('Faltan datos para iniciar sesión. Ir a la página de inicio de sesión.');
				window.location.href = 'Login.html';
				return;
			}

			try {
				const res = await fetch(`${API_BASE}/api/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: recent.correo, password: recent.password })
				});
				const data = await res.json();
				if (res.ok && data.success) {
					// Guardar estado de login y usuario (igual que en login.js)
					localStorage.setItem('loggedIn', 'true');
					localStorage.setItem('user', JSON.stringify(data.user || {}));

					// Limpiar el password en sessionStorage por seguridad
					try {
						const safe = JSON.parse(sessionStorage.getItem('recentlyRegisteredUser') || '{}');
						delete safe.password;
						sessionStorage.setItem('recentlyRegisteredUser', JSON.stringify(safe));
					} catch (e) {
						sessionStorage.removeItem('recentlyRegisteredUser');
					}

					// Redirigir al dashboard
					window.location.href = 'Dashboard.html';
				} else {
					alert(data.message || 'No se pudo iniciar sesión con estos datos.');
				}
			} catch (err) {
				console.error('Error en fetch /api/login:', err);
				alert('Error al conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000');
			}
		});
	}

	// Ir a la página de login: prellenar el email (y opcionalmente la contraseña) para conveniencia
	if (goToLoginBtn) {
		goToLoginBtn.addEventListener('click', function () {
			try {
				// Guardar credenciales temporales para prellenar el formulario de login
				sessionStorage.setItem('prefillLogin', JSON.stringify({ email: recent.correo, password: recent.password }));
			} catch (e) {
				console.warn('No se pudo establecer prefillLogin:', e);
			}
			// Redirigir al login
			window.location.href = 'Login.html';
		});
	}
});
