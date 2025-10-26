document.addEventListener("DOMContentLoaded", () => {
  const nroMesaInput = document.getElementById("nroMesa");
  const buscarMesaBtn = document.getElementById("buscarMesaBtn");
  const infoMesaDiv = document.getElementById("infoMesa");
  const botonesDiv = document.getElementById("botones-categorias");
  const certificadoContainer = document.getElementById("certificado-container");
  const guardarBtn = document.getElementById("guardar-btn");

  let mesaSeleccionada = null;

  // 🔹 Limpiar datos previos
  localStorage.removeItem("certificado_actual");

  // ✅ Buscar mesa
  buscarMesaBtn.addEventListener("click", async () => {
    const nroMesa = parseInt(nroMesaInput.value.trim());
    if (!nroMesa) {
      alert("Ingrese un número de mesa válido.");
      return;
    }

    mesaSeleccionada = await buscarMesa(nroMesa);

    if (!mesaSeleccionada) {
      infoMesaDiv.innerHTML = `<p class="error">⚠️ Mesa no encontrada en ningún departamento.</p>`;
      botonesDiv.style.display = "none";
      certificadoContainer.innerHTML = "";
      guardarBtn.style.display = "none";
      return;
    }

    const { departamento, municipio, localidad, escuela } = mesaSeleccionada;

    infoMesaDiv.innerHTML = `
      <h3>Mesa ${nroMesa}</h3>
      <p><strong>Departamento:</strong> ${departamento}</p>
      <p><strong>Municipio:</strong> ${municipio}</p>
      <p><strong>Localidad:</strong> ${localidad}</p>
      <p><strong>Escuela:</strong> ${escuela}</p>
    `;

    botonesDiv.style.display = "flex";
    certificadoContainer.innerHTML = "";
    guardarBtn.style.display = "none";
  });

  // ✅ Buscar mesa en todos los departamentos
  async function buscarMesa(nroMesa) {
    const ruta = "assets/data/departamentos/";
    const archivos = [
      "ambato.json", "ancasti.json", "andalgala.json", "antofagasta.json",
      "belen.json", "capayan.json", "el_alto.json", "fray_mamerto.json",
      "la_paz.json", "paclin.json", "poman.json", "santa_maria.json",
      "santa_rosa.json", "tinogasta.json", "valle_viejo.json", "capital.json"
    ];

    for (const archivo of archivos) {
      try {
        const res = await fetch(`${ruta}${archivo}`);
        if (!res.ok) continue;
        const data = await res.json();

        for (const municipio of data.municipios) {
          for (const localidad of municipio.localidades) {
            for (const esc of localidad.escuelas) {
              if (nroMesa >= esc.mesa_desde && nroMesa <= esc.mesa_hasta) {
                return {
                  departamento: data.departamento,
                  municipio: municipio.nombre,
                  localidad: localidad.nombre,
                  escuela: esc.nombre,
                  numeroMesa: nroMesa
                };
              }
            }
          }
        }
      } catch (err) {
        console.warn(`⚠️ Error leyendo ${archivo}:`, err);
      }
    }

    return null;
  }

  // ✅ Cargar certificado (versión definitiva)
function cargarCertificado(tipoCategoria) {
  // Normaliza el nombre del municipio: minúsculas, sin acentos ni espacios
  const municipio = mesaSeleccionada.municipio
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_");

  const ruta = `assets/data/fuerzas/fuerzas_${municipio}.json`;

  console.log("📂 Intentando cargar:", ruta);

  fetch(ruta)
    .then(res => {
      if (!res.ok) throw new Error(`Archivo no encontrado (${ruta})`);
      return res.json();
    })
    .then(data => {
      // 🔹 Aseguramos obtener las fuerzas sin importar la estructura
      const fuerzas = Array.isArray(data)
        ? data
        : Array.isArray(data.fuerzas)
        ? data.fuerzas
        : [];

      if (fuerzas.length === 0) {
        throw new Error("No se encontraron fuerzas políticas en el archivo.");
      }

      const categorias =
        tipoCategoria === "nacional"
          ? ["diputado_nacional", "senador_nacional"]
          : [
              "diputado_provincial",
              "senador_provincial",
              "intendente_municipal",
              "concejales_municipales"
            ];

      let html = `
        <h3>${
          tipoCategoria === "nacional"
            ? "🟦 CATEGORÍA NACIONAL"
            : "🏛️ CATEGORÍA PROVINCIAL"
        }</h3>
      `;

      categorias.forEach(categoria => {
        html += `
          <h4>${categoria.replace(/_/g, " ").toUpperCase()}</h4>
          <table>
            <tr><th>N° Lista</th><th>Fuerza Política</th><th>Votos</th></tr>
        `;

        fuerzas.forEach(f => {
          const habilitado = f[categoria] === true;
          html += `
            <tr class="${habilitado ? "habilitada" : "inhabilitada"}">
              <td>${f.nro_lista}</td>
              <td>${f.fuerza_politica}</td>
              <td><input type="number" ${
                habilitado ? "" : "disabled"
              } placeholder="${habilitado ? "Votos" : "No participa"}"></td>
            </tr>
          `;
        });

        html += "</table>";
      });

      certificadoContainer.innerHTML = html;
      guardarBtn.style.display = "block";
    })
    .catch(err => {
      certificadoContainer.innerHTML = `
        <p class="error">⚠️ Error al cargar las fuerzas políticas.</p>
        <small style="color:#555">(${err.message})</small>
      `;
      console.error("❌ Error cargando archivo de fuerzas:", err);
    });
}


  // ✅ Botones
  document.getElementById("btnNacional").addEventListener("click", () => {
    if (mesaSeleccionada) cargarCertificado("nacional");
  });

  document.getElementById("btnProvincial").addEventListener("click", () => {
    if (mesaSeleccionada) cargarCertificado("provincial");
  });

  // ✅ Guardar datos localmente
  guardarBtn.addEventListener("click", () => {
    const filas = certificadoContainer.querySelectorAll("tr.habilitada");
    const datos = Array.from(filas).map(fila => ({
      lista: fila.children[0].innerText,
      fuerza: fila.children[1].innerText,
      votos: fila.querySelector("input")?.value || "—"
    }));

    localStorage.setItem("certificado_actual", JSON.stringify(datos));
    alert("✅ Certificado guardado temporalmente.");
  });
});
