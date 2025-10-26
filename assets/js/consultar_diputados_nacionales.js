// 📊 Consulta de resultados de Diputados Nacionales desde JSONBin.io
// Usa las constantes API_KEY y BIN_NACIONALES ya declaradas en almacenamiento.js

document.addEventListener("DOMContentLoaded", () => {
  const btnConsultar = document.querySelector("button");
  const selectDepto = document.querySelector("select");
  const resultadosDiv = document.createElement("div");
  resultadosDiv.classList.add("resultados");
  document.body.appendChild(resultadosDiv);

  btnConsultar.addEventListener("click", async () => {
    const depto = selectDepto.value.trim().toUpperCase();
    resultadosDiv.innerHTML = `<p>⏳ Consultando resultados para ${depto}...</p>`;

    try {
      // ✅ Llamada directa a JSONBin (sin backend local)
      const resp = await fetch(BIN_NACIONALES, { 
        headers: { "X-Master-Key": API_KEY }
      });

      if (!resp.ok) throw new Error(`Error al acceder al bin (${resp.status})`);
      const data = await resp.json();

      const resultados = data.record?.resultados || data.resultados || [];

      // 🔍 Filtrar mesas por departamento
      const mesasDepto = resultados.filter(r => 
        r.departamento && r.departamento.toUpperCase() === depto
      );

      if (mesasDepto.length === 0) {
        resultadosDiv.innerHTML = `<p class="error">⚠ No hay resultados registrados para ${depto}.</p>`;
        return;
      }

      // 📈 Sumar votos por fuerza política
      const totales = {};
      mesasDepto.forEach(mesa => {
        mesa.fuerzas.forEach(f => {
          if (!totales[f.fuerza_politica]) totales[f.fuerza_politica] = 0;
          totales[f.fuerza_politica] += f.votos.reduce((a, b) => a + b, 0);
        });
      });

      // 🔽 Ordenar por cantidad de votos (de mayor a menor)
      const fuerzasOrdenadas = Object.entries(totales)
        .sort((a, b) => b[1] - a[1]);

      // 🧾 Renderizar tabla de resultados
      let html = `
        <h3>📊 Resultados de Diputados Nacionales - ${depto}</h3>
        <table class="tabla-resultados">
          <thead>
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
    }
  });
});
