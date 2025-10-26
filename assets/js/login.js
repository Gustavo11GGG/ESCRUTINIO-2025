document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");
  const mensaje = document.getElementById("mensaje");

  // 🔹 Lista de usuarios permitidos
  const usuarios = [
    { user: "admin", pass: "1234" },
    { user: "LEON1",  pass: "LLACATA2025"  },
    { user: "LEON2",  pass: "LLACATA2025A" },
    { user: "LEON3",  pass: "LLACATA2025B" },
    { user: "LEON4",  pass: "LLACATA2025C" },
    { user: "LEON5",  pass: "LLACATA2025D" },
    { user: "LEON6",  pass: "LLACATA2025E" },
    { user: "LEON7",  pass: "LLACATA2025F" },
    { user: "LEON8",  pass: "LLACATA2025G" },
    { user: "LEON9",  pass: "LLACATA2025H" },
    { user: "LEON10", pass: "LLACATA2025I" },
    { user: "LEON11", pass: "LLACATA2025J" },
    { user: "LEON12", pass: "LLACATA2025K" },
    { user: "LEON13", pass: "LLACATA2025L" },
    { user: "LEON14", pass: "LLACATA2025M" },
    { user: "LEON15", pass: "LLACATA2025N" }
  ];

  btnLogin.addEventListener("click", () => {
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usuario || !password) {
      mensaje.textContent = "⚠️ Complete todos los campos.";
      return;
    }

    const encontrado = usuarios.find(u => u.user === usuario && u.pass === password);

    if (encontrado) {
      // ✅ Guardar sesión
      localStorage.setItem("usuarioActivo", JSON.stringify(encontrado));
      window.location.href = "index.html";
    } else {
      mensaje.textContent = "❌ Usuario o contraseña incorrectos.";
    }
  });
});
