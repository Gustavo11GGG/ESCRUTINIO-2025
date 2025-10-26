// 🗂 Manejo global de resultados (provinciales y nacionales) con JSONBin.io

// 🔑 API Key (X-MASTER-KEY) y URLs de los nuevos bins
const API_KEY = "$2a$10$wTPVX8Drzqq6./FQLpRXrennzxxdycT./vqdfiXwGdVILuRAV6cju"; // Master Key
const BIN_PROVINCIALES = "https://api.jsonbin.io/v3/b/68fea1d043b1c97be9831773";
const BIN_NACIONALES = "https://api.jsonbin.io/v3/b/68fea1afd0ea881f40be116d";

/**
 * 💾 Guarda o actualiza un certificado (provincial o nacional)
 */
async function guardarResultado(resultadoMesa, tipo) {
  const url = tipo === "nacional" ? BIN_NACIONALES : BIN_PROVINCIALES;

  try {
    console.log(`📤 Intentando guardar resultado ${tipo}...`);
    console.log("➡ Datos a enviar:", resultadoMesa);

    // 🔹 Obtener los datos actuales del bin
    const resp = await fetch(url, { headers: { "X-Master-Key": API_KEY } });
    if (!resp.ok) throw new Error(`Error al leer bin (${resp.status})`);
    const data = await resp.json();

    const resultados = data.record?.resultados || [];
    const index = resultados.findIndex(r => r.mesa === resultadoMesa.mesa);

    if (index >= 0) resultados[index] = resultadoMesa;
    else resultados.push(resultadoMesa);

    // 🔹 Guardar actualización en el bin
    const respPut = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({ resultados })
    });

    const jsonResp = await respPut.json();
    if (!respPut.ok) throw new Error(`Error al guardar (${respPut.status})`);

    console.log(`✅ Certificado ${tipo} guardado online (Mesa ${resultadoMesa.mesa})`);
    console.log("📦 Respuesta JSONBin:", jsonResp);

    mostrarAviso(`✅ Certificado ${tipo} guardado correctamente`, "#28a745");
  } catch (error) {
    console.error(`❌ Error al guardar resultado ${tipo}: ${error.message}`);
    mostrarAviso(`❌ Error al guardar certificado ${tipo}: ${error.message}`, "#dc3545");
  }
}

/**
 * 🔍 Obtiene un certificado desde el servidor online
 */
async function obtenerResultado(mesa, tipo) {
  const url = tipo === "nacional" ? BIN_NACIONALES : BIN_PROVINCIALES;

  try {
    const resp = await fetch(url, { headers: { "X-Master-Key": API_KEY } });
    if (!resp.ok) throw new Error(`Error al leer bin (${resp.status})`);
    const data = await resp.json();

    const resultados = data.record?.resultados || [];
    const mesaData = resultados.find(r => r.mesa === Number(mesa));

    if (mesaData) {
      console.log(`📄 Resultado ${tipo} encontrado online (Mesa ${mesa})`);
      return mesaData;
    } else {
      console.log(`❌ No se encontró el resultado ${tipo} para la mesa ${mesa}`);
      return null;
    }
  } catch (error) {
    console.error(`⚠ No se pudo obtener resultado ${tipo}: ${error.message}`);
    mostrarAviso(`⚠ No se pudo obtener resultado ${tipo}: ${error.message}`, "#ffc107");
    return null;
  }
}

/**
 * 🪄 Muestra un aviso visual en pantalla
 */
function mostrarAviso(mensaje, color) {
  const aviso = document.createElement("div");
  aviso.textContent = mensaje;
  aviso.style.position = "fixed";
  aviso.style.bottom = "20px";
  aviso.style.right = "20px";
  aviso.style.background = color;
  aviso.style.color = "white";
  aviso.style.padding = "10px 15px";
  aviso.style.borderRadius = "8px";
  aviso.style.fontWeight = "bold";
  aviso.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  aviso.style.zIndex = "9999";
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 3500);
}
