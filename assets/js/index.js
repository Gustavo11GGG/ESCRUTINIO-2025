document.addEventListener("DOMContentLoaded", () => {
  const inputMesa = document.getElementById("numeroMesa");
  const btnBuscar = document.getElementById("btnBuscar");
  const mensaje = document.getElementById("mensaje");

  const departamentosArchivos = [
    "ambato.json",
    "andalgala.json",
    "ancasti.json",
    "antofagasta.json",
    "belen.json",
    "capital.json",
    "capayan.json",
    "el_alto.json",
    "fray_mamerto_esquiu.json",
    "huillapima.json",
    "la_paz.json",
    "paclin.json",
    "poman.json",
    "santa_maria.json",
    "santa_rosa.json",
    "tinogasta.json",
    "valle_viejo.json"
  ];

  btnBuscar.addEventListener("click", async () => {
    const numeroMesa = parseInt(inputMesa.value.trim());
    mensaje.innerHTML = "";

    if (isNaN(numeroMesa)) {
      mensaje.innerHTML = "<p style='color:red;'>⚠️ Ingrese un número de mesa válido.</p>";
      return;
    }

    let mesaEncontrada = null;

    for (const archivo of departamentosArchivos) {
      try {
        const res = await fetch(`assets/data/departamentos/${archivo}`);
        if (!res.ok) continue;
        const data = await res.json();

        for (const municipio of data.municipios) {
          for (const localidad of municipio.localidades) {
            for (const escuela of localidad.escuelas) {
              if (numeroMesa >= escuela.mesa_desde && numeroMesa <= escuela.mesa_hasta) {
                mesaEncontrada = {
                  departamento: data.departamento,
                  municipio: municipio.nombre,
                  localidad: localidad.nombre,
                  escuela: escuela.nombre,
                  numeroMesa
                };
                break;
              }
            }
            if (mesaEncontrada) break;
          }
          if (mesaEncontrada) break;
        }
      } catch (err) {
        console.error(`⚠️ Error leyendo ${archivo}:`, err);
      }
      if (mesaEncontrada) break;
    }

    if (mesaEncontrada) {
      localStorage.setItem("mesaSeleccionada", JSON.stringify(mesaEncontrada));
      window.location.href = "mesa.html";
    } else {
      mensaje.innerHTML = "<p style='color:red;'>⚠️ Mesa no encontrada en ningún departamento.</p>";
    }
  });
});
