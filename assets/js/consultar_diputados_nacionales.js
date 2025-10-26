// 📊 Consulta de resultados de Diputados Nacionales desde JSONBin.io
// Usa las constantes API_KEY y BIN_NACIONALES declaradas en almacenamiento.js

document.addEventListener("DOMContentLoaded", () => {
  const btnConsultar = document.getElementById("btnConsultar_diputados_nac");
  const selectDepto = document.getElementById("selectDepartamento_diputados_nac");
  const resultadosDiv = document.getElementById("leyendaDiputadosNacionales");

  btnConsultar.addEventListener("click", async () => {
    const depto = (selectDepto.value || "").trim().toUpperCase();
    if (!depto) {
      alert("⚠️ Debes seleccionar un departamento.");
      return;
    }

    resultadosDiv.innerHTML = `<p>⏳ Consultando resultados para ${depto}...</p>`;

    try {
      // ✅ Llamada directa a JSONBin (sin backend local)
      const resp = await fetch(BIN_NACIONALES, {
        headers: { "X-Master-Key": API_KEY },
      });

      if (!resp.ok) throw new Error(`Error al acceder al bin (${resp.status})`);
      const data = await resp.json();

      const resultados = data.record?.resultados || data.resultados || [];
      if (!Array.isArray(resultados)) throw new Error("Formato de datos inesperado.");

      // 🔍 Filtrar mesas por departamento
      const mesasDepto = resultados.filter(
        (r) => r.departamento && r.departamento.toUpperCase() === depto
      );

      if (mesasDepto.length === 0) {
        resultadosDiv.innerHTML = `<p class="error">⚠ No hay resultados registrados para ${depto}.</p>`;
        return;
      }

      // 📈 Sumar votos por fuerza política
      const totales = {};
      mesasDepto.forEach((mesa) => {
        (mesa.fuerzas || []).forEach((f) => {
          const nombre = f.fuerza_politica || "SIN NOMBRE";
          const votos = (f.votos || []).reduce((a, b) => a + (Number(b) || 0), 0);
          totales[nombre] = (totales[nombre] || 0) + votos;
        });
      });

      // 🔽 Ordenar por cantidad de votos (de mayor a menor)
      const fuerzasOrdenadas = Object.entries(totales).sort((a, b) => b[1] - a[1]);

      // 🧾 Renderizar tabla de resultados
      let html = `
        <h3>📊 Resultados de Diputados Nacionales - ${depto}</h3>
        <table class="table table-bordered table-sm table-striped bg-light text-dark mt-3 w-75 mx-auto">
          <thead class="table-primary">
            <tr>
              <th>AGRUPACIÓN POLÍTICA</th>
              <th>VOTOS TOTALES</th>
            </tr>
          </thead>
          <tbody>
      `;

      fuerzasOrdenadas.forEach(([fuerza, votos]) => {
        html += `
          <tr>
            <td>${fuerza}</td>
            <td><strong>${votos}</strong></td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      resultadosDiv.innerHTML = html;
    } catch (err) {
      resultadosDiv.innerHTML = `<p class="error">❌ Error: ${err.message}</p>`;
      console.error("❌ Error al consultar resultados:", err);
      alert("❌ Hubo un problema al cargar los resultados de Diputados Nacionales.");
    }
  });
});
