document.addEventListener("DOMContentLoaded", async () => {
  const cuerpoTabla = document.getElementById("tablaMesasBody");

  // 🔹 Obtener resultados guardados en localStorage
  const provinciales = JSON.parse(localStorage.getItem("resultados_provinciales")) || [];
  const nacionales = JSON.parse(localStorage.getItem("resultados_nacionales")) || [];

  // 🔹 Obtener todas las mesas registradas y ordenarlas
  const todasLasMesas = [
    ...new Set([...provinciales.map(m => m.mesa), ...nacionales.map(m => m.mesa)])
  ].sort((a, b) => a - b);

  if (todasLasMesas.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:#fff; font-weight:bold;">
          ⚠️ No hay mesas cargadas todavía.
        </td>
      </tr>`;
    return;
  }

  // 🔹 Crear filas dinámicamente
  todasLasMesas.forEach(numMesa => {
    const prov = provinciales.find(m => m.mesa === numMesa);
    const nac = nacionales.find(m => m.mesa === numMesa);
    const mesaBase = prov || nac;

    let estado = "";
    let claseEstado = "";

    if (prov && nac) {
      estado = "✅ MESA CARGADA";
      claseEstado = "estado-verde";
    } else if (!prov && nac) {
      estado = "⚠️ FALTA CERTIFICADO PROVINCIAL";
      claseEstado = "estado-naranja";
    } else if (prov && !nac) {
      estado = "⚠️ FALTA CERTIFICADO NACIONAL";
      claseEstado = "estado-naranja";
    }

    // 🧾 Crear fila de la tabla
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${numMesa}</td>
      <td>${mesaBase.departamento}</td>
      <td>${mesaBase.municipio}</td>
      <td>${mesaBase.localidad}</td>
      <td class="${claseEstado}" style="font-weight:bold;">${estado}</td>
    `;

    // 🟢 Efecto hover suave
    fila.addEventListener("mouseover", () => (fila.style.backgroundColor = "#f3f6ff"));
    fila.addEventListener("mouseout", () => (fila.style.backgroundColor = "#fff"));

    cuerpoTabla.appendChild(fila);
  });
});
