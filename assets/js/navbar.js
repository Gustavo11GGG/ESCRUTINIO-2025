document.addEventListener("DOMContentLoaded", () => {
  fetch("assets/components/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);

      // 🔹 Mostrar usuario logueado
      const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
      const nombreUsuario = document.getElementById("nombreUsuario");
      if (usuarioActivo) {
        nombreUsuario.textContent = `👤 ${usuarioActivo.user}`;
      }

      // 🔹 Cerrar sesión
      document.getElementById("cerrarSesion").addEventListener("click", () => {
        if (confirm("¿Desea cerrar sesión?")) {
          localStorage.removeItem("usuarioActivo");
          window.location.href = "login.html";
        }
      });
    })
    .catch(err => console.error("Error cargando navbar:", err));
});
