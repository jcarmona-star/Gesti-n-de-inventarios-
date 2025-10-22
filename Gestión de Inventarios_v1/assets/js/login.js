document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");

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
      // Ocultar login y mostrar dashboard
      document.getElementById("login-section").style.display = "none";
      document.getElementById("dashboard-section").style.display = "block";
    } else {
      alert("Credenciales incorrectas.");
    }
  });
});