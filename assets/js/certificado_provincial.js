// 📋 Carga y almacenamiento del Certificado Provincial
document.addEventListener("DOMContentLoaded", () => {
  const infoMesaDiv = document.getElementById("infoMesa");
  const formularioContainer = document.getElementById("formularioContainer");

  const params = new URLSearchParams(window.location.search);
  const numeroMesa = parseInt(params.get("mesa"));
  const mesaSeleccionada = JSON.parse(localStorage.getItem("mesaSeleccionada"));

  if (!mesaSeleccionada) {
    infoMesaDiv.innerHTML = `<p class="error">⚠ No se encontraron datos de la mesa seleccionada.</p>`;
    return;
  }

  const { departamento, municipio, escuela, localidad } = mesaSeleccionada;

  // 📋 Mostrar información de cabecera
  infoMesaDiv.innerHTML = `
    <p><strong>Mesa:</strong> ${numeroMesa}</p>
    <p><strong>Departamento:</strong> ${departamento}</p>
    <p><strong>Municipio:</strong> ${municipio}</p>
    <p><strong>Localidad:</strong> ${localidad}</p>
    <p><strong>Escuela:</strong> ${escuela}</p>
  `;

  // 🧩 Normalización de nombres
  const dep = departamento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_");
  const muni = municipio.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_");

  let ruta = "";

  // 🗂 Lógica de carga de archivo según el departamento
  if (dep === "fray_mamerto_esquiu") {
    ruta = `assets/data/fuerzas/fuerzas_fray_mamerto_esquiu_${muni.split("_").pop()}.json`;
  } else if (dep === "tinogasta") {
    ruta = `assets/data/fuerzas/fuerzas_tinogasta_${muni}.json`;
  } else {
    ruta = muni.startsWith(dep + "_")
      ? `assets/data/fuerzas/fuerzas_${muni}.json`
      : `assets/data/fuerzas/fuerzas_${dep}_${muni}.json`;
  }

  console.log("📂 Cargando archivo provincial:", ruta);

  // 🔹 Cargar archivo JSON de fuerzas políticas
  fetch(ruta)
    .then(res => {
      if (!res.ok) throw new Error(`Archivo no encontrado (${ruta})`);
      return res.json();
    })
    .then(async data => {
      const fuerzas = data.fuerzas || [];
      if (fuerzas.length === 0) throw new Error("No se encontraron fuerzas políticas.");

      const columnas = ["Diputado Provincial", "Senador Provincial", "Intendente Municipal", "Concejales Municipales"];

      let html = `
        <h3>🗳 CARGA DE RESULTADOS - PROVINCIAL</h3>
        <table class="tabla-certificado">
          <thead>
            <tr>
              <th>N°</th>
              <th>AGRUPACIÓN POLÍTICA</th>
              ${columnas.map(c => `<th>${c}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
      `;

      // 🧱 Construcción de filas
      fuerzas.forEach(f => {
        html += `<tr>
          <td>${f.nro_lista}</td>
          <td>${f.fuerza_politica}</td>`;

        columnas.forEach(col => {
          const key = col.toLowerCase().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const habilitado = f[key] === true;
          html += `
            <td class="${habilitado ? "habilitada" : "inhabilitada"}">
              <input type="number" ${habilitado ? "" : "disabled"} placeholder="${habilitado ? "" : "—"}">
            </td>`;
        });

        html += `</tr>`;
      });

      // 🧾 Agregar filas de totales
      const filasFinales = [
        "VOTOS NULOS",
        "VOTOS RECURRIDOS",
        "VOTOS EN BLANCO",
        "TOTAL DE VOTOS*",
        "VOTOS DE IDENTIDAD IMPUGNADA"
      ];

      filasFinales.forEach(fila => {
        html += `
          <tr class="totales">
            <td colspan="2"><strong>${fila}</strong></td>
            ${columnas.map(() => `<td><input type="number"></td>`).join("")}
          </tr>`;
      });

      html += `
          </tbody>
        </table>

        <div style="text-align:center; margin-top: 20px;">
          <button id="guardarCertificado" class="btn-accion">💾 Guardar Certificado Provincial</button>
        </div>
      `;

      formularioContainer.innerHTML = html;

      // 🟣 Precargar datos guardados
      const mesaExistente = await obtenerResultado(numeroMesa, "provincial");

      if (mesaExistente) {
        console.log("📄 Precargando datos guardados para mesa:", numeroMesa);

        mesaExistente.fuerzas.forEach(f => {
          const fila = [...formularioContainer.querySelectorAll("tbody tr")]
            .find(tr => tr.children[0]?.innerText.trim() === f.nro_lista);
          if (fila) {
            const inputs = fila.querySelectorAll("input[type='number']");
            f.votos.forEach((v, i) => {
              if (inputs[i]) inputs[i].value = v;
            });
          }
        });

        const aviso = document.createElement("p");
        aviso.textContent = "✅ Certificado cargado previamente. Puede editar los valores si es necesario.";
        aviso.style.color = "#28a745";
        aviso.style.fontWeight = "bold";
        aviso.style.marginTop = "10px";
        formularioContainer.prepend(aviso);
      }

      // 💾 Guardar certificado
      document.getElementById("guardarCertificado").addEventListener("click", () => {
        const filas = formularioContainer.querySelectorAll("tbody tr");
        const fuerzasGuardadas = [];

        filas.forEach(fila => {
          const celdas = fila.querySelectorAll("td");
          if (celdas.length > 2 && !fila.classList.contains("totales")) {
            const fuerza = {
              nro_lista: celdas[0].innerText.trim(),
              fuerza_politica: celdas[1].innerText.trim(),
              votos: []
            };
            const inputs = fila.querySelectorAll("input");
            inputs.forEach(input => fuerza.votos.push(parseInt(input.value) || 0));
            fuerzasGuardadas.push(fuerza);
          }
        });

        const resultadoMesa = {
          mesa: numeroMesa,
          departamento,
          municipio,
          escuela,
          localidad,
          fuerzas: fuerzasGuardadas,
          votos_nulos: 0,
          votos_en_blanco: 0,
          votos_recurridos: 0,
          votos_impugnados: 0,
          total_votos: fuerzasGuardadas.reduce((a, f) => a + f.votos.reduce((x, y) => x + y, 0), 0)
        };

        guardarResultado(resultadoMesa, "provincial");

        const aviso = document.createElement("div");
        aviso.textContent = "💾 Certificado guardado correctamente";
        aviso.style.position = "fixed";
        aviso.style.bottom = "20px";
        aviso.style.right = "20px";
        aviso.style.background = "#28a745";
        aviso.style.color = "white";
        aviso.style.padding = "10px 15px";
        aviso.style.borderRadius = "8px";
        aviso.style.fontWeight = "bold";
        aviso.style.zIndex = "9999";
        document.body.appendChild(aviso);
        setTimeout(() => aviso.remove(), 2000);
      });
    })
    .catch(err => {
      formularioContainer.innerHTML = `<p class="error">⚠ Error: ${err.message}</p>`;
      console.error("❌", err);
    });
});


// 🧹 LIMPIAR DATOS DEL FORMULARIO
document.addEventListener("DOMContentLoaded", () => {
  const btnLimpiar = document.getElementById("btnLimpiarDatos");
  if (!btnLimpiar) return;

  btnLimpiar.addEventListener("click", () => {
    if (confirm("⚠ ¿Seguro que deseas borrar todos los datos ingresados (solo del formulario)?")) {
      const inputs = document.querySelectorAll("input[type='number']");
      inputs.forEach(input => (input.value = ""));
      alert("✅ Campos del formulario vaciados correctamente.");
    }
  });
});
