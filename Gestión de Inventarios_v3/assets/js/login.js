// assets/js/login.js
document.addEventListener("DOMContentLoaded", function () {
  // Botón de inicio de sesión
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      const validEmail = "admin@correo.com";
      const validPassword = "123456";

      if (email === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (email === validEmail && password === validPassword) {
        localStorage.setItem("loggedIn", "true"); // Guarda estado de sesión
        window.location.href = "Dashboard.html";
      } else {
        alert("Credenciales incorrectas.");
      }
    });
  }

  // Botón de registro
  const registroBtn = document.getElementById("registroBtn");
  if (registroBtn) {
    registroBtn.addEventListener("click", function () {
      window.location.href = "Registro.html";
    });
  }
});