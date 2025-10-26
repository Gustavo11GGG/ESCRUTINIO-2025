document.addEventListener("DOMContentLoaded", () => {
  const datosMesaDiv = document.getElementById("datosMesa");
  const certificadoContainer = document.getElementById("certificadoContainer");
  const guardarBtn = document.getElementById("guardar-btn");
  const btnNacional = document.getElementById("btnNacional");
  const btnProvincial = document.getElementById("btnProvincial");

  // ✅ Leer mesaSeleccionada (unificado)
  const mesaSeleccionada = JSON.parse(localStorage.getItem("mesaSeleccionada"));

  if (!mesaSeleccionada) {
    datosMesaDiv.innerHTML = `
      <p class="error">⚠️ No hay información de mesa cargada.</p>
      <p>Por favor, vuelva al inicio e ingrese un número de mesa.</p>
    `;
    return;
  }

  // ✅ Mostrar datos
  const { departamento, municipio, localidad, escuela, numeroMesa } = mesaSeleccionada;
  datosMesaDiv.innerHTML = `
    <p><strong>Departamento:</strong> ${departamento}</p>
    <p><strong>Municipio:</strong> ${municipio}</p>
    <p><strong>Localidad:</strong> ${localidad}</p>
    <p><strong>Escuela:</strong> ${escuela}</p>
    <p><strong>N° de Mesa:</strong> ${numeroMesa}</p>
  `;

  // ✅ Botones
  btnNacional.addEventListener("click", () => {
    localStorage.setItem("mesaSeleccionada", JSON.stringify(mesaSeleccionada));
    window.location.href = `certificado_nacional.html?mesa=${numeroMesa}`;
  });

  btnProvincial.addEventListener("click", () => {
    localStorage.setItem("mesaSeleccionada", JSON.stringify(mesaSeleccionada));
    window.location.href = `certificado_provincial.html?mesa=${numeroMesa}`;
  });

  // ⚙️ Función para carga manual (opcional)
  function cargarCertificado(tipoCategoria) {
    let dep = departamento.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_");
    let muni = municipio.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "_");

    if (muni.startsWith(dep + "_")) muni = muni.replace(dep + "_", "");
    const ruta = `assets/data/fuerzas/fuerzas_${dep}_${muni}.json`;
    console.log("📂 Cargando archivo:", ruta);
  }

  guardarBtn.addEventListener("click", () => {
    const filas = certificadoContainer.querySelectorAll("tr.habilitada");
    const datos = Array.from(filas).map(fila => ({
      lista: fila.children[0].innerText,
      fuerza: fila.children[1].innerText,
      votos: fila.querySelector("input")?.value || "—",
    }));

    localStorage.setItem("certificado_actual", JSON.stringify(datos));
    alert("✅ Certificado guardado temporalmente.");
  });
});
