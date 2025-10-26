document.addEventListener("DOMContentLoaded", () => {
  const inputMesa = document.getElementById("numeroMesa");
  const btnBuscar = document.getElementById("btnBuscar");
  const opcionesDiv = document.getElementById("opcionesCertificados");
  const mensaje = document.getElementById("mensaje");

  let mesaEncontrada = null;

  // 🔍 Buscar mesa en el archivo mesas.json
  const buscarMesa = async (numeroMesa) => {
    try {
      const res = await fetch("assets/data/mesas.json");
      if (!res.ok) throw new Error("No se pudo cargar el archivo mesas.json");
      const data = await res.json();
      return data.mesas.find(m => m.mesa === numeroMesa) || null;
    } catch (error) {
      console.error("Error cargando mesas:", error);
      mensaje.innerHTML = `<p class="error">⚠️ Error al leer las mesas: ${error.message}</p>`;
      return null;
    }
  };

  // 🔘 Evento buscar
  btnBuscar.addEventListener("click", async () => {
    const numeroMesa = parseInt(inputMesa.value);

    if (isNaN(numeroMesa)) {
      mensaje.innerHTML = `<p class="error">⚠️ Ingrese un número de mesa válido.</p>`;
      opcionesDiv.style.display = "none";
      return;
    }

    mensaje.innerHTML = `<p class="ok">🔎 Buscando mesa ${numeroMesa}...</p>`;
    mesaEncontrada = await buscarMesa(numeroMesa);

    // 🔹 Verificar si la mesa ya tiene certificados cargados
    const resultadosProv = JSON.parse(localStorage.getItem("resultados_provinciales")) || [];
    const resultadosNac = JSON.parse(localStorage.getItem("resultados_nacionales")) || [];

    const yaTieneProv = resultadosProv.some(r => r.mesa === numeroMesa);
    const yaTieneNac = resultadosNac.some(r => r.mesa === numeroMesa);

    if (mesaEncontrada) {
      let texto = `
        ✅ Mesa <strong>${mesaEncontrada.mesa}</strong> encontrada:<br>
        <strong>${mesaEncontrada.departamento}</strong> / ${mesaEncontrada.municipio}
      `;

      if (yaTieneProv) texto += `<br>🟣 Certificado Provincial cargado.`;
      if (yaTieneNac) texto += `<br>🔵 Certificado Nacional cargado.`;

      mensaje.innerHTML = `<p class="ok">${texto}</p>`;
      opcionesDiv.style.display = "block";
    } else {
      mensaje.innerHTML = `<p class="error">❌ Mesa no encontrada en ningún departamento.</p>`;
      opcionesDiv.style.display = "none";
    }
  });

  // 🟣 Ir al certificado provincial
  document.getElementById("btnProvincial").addEventListener("click", () => {
    if (!mesaEncontrada) return alert("Primero busque una mesa válida.");
    localStorage.setItem("mesaSeleccionada", JSON.stringify(mesaEncontrada));
    window.location.href = `certificado_provincial.html?mesa=${mesaEncontrada.mesa}`;
  });

  // 🔵 Ir al certificado nacional
  document.getElementById("btnNacional").addEventListener("click", () => {
    if (!mesaEncontrada) return alert("Primero busque una mesa válida.");
    localStorage.setItem("mesaSeleccionada", JSON.stringify(mesaEncontrada));
    window.location.href = `certificado_nacional.html?mesa=${mesaEncontrada.mesa}`;
  });
});
