// 🗂 Manejo global de resultados (provinciales y nacionales) con JSONBin.io

// 🔑 API Key y URLs de los bins
const API_KEY = "$2a$10$Lwzz7WhRvlY0eZJf1d86y.xQWxafQlPBjwksFa2iaRXJDwD4nmYZy";
const BIN_PROVINCIALES = "https://api.jsonbin.io/v3/b/68fe89a0ae596e708f2eac38";
const BIN_NACIONALES = "https://api.jsonbin.io/v3/b/68fe8a7c43b1c97be982f11f";

/**
 * 💾 Guarda o actualiza un certificado (provincial o nacional)
 */
async function guardarResultado(resultadoMesa, tipo) {
  const url = tipo === "nacional" ? BIN_NACIONALES : BIN_PROVINCIALES;

  try {
    const resp = await fetch(url, { headers: { "X-Master-Key": API_KEY } });
    if (!resp.ok) throw new Error(`Error al leer bin (${resp.status})`);
    const data = await resp.json();

    const resultados = data.record.resultados || [];
    const index = resultados.findIndex(r => r.mesa === resultadoMesa.mesa);

    if (index >= 0) resultados[index] = resultadoMesa;
    else resultados.push(resultadoMesa);

    const respPut = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({ resultados })
    });

    if (!respPut.ok) throw new Error(`Error al guardar (${respPut.status})`);
    console.log(`✅ Certificado ${tipo} guardado online (Mesa ${resultadoMesa.mesa})`);
  } catch (error) {
    console.error(`❌ Error al guardar resultado ${tipo}:`, error.message);
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

    const resultados = data.record.resultados || [];
    const mesaData = resultados.find(r => r.mesa === Number(mesa));

    if (mesaData) {
      console.log(`📄 Resultado ${tipo} encontrado online (Mesa ${mesa})`);
      return mesaData;
    } else {
      console.log(`❌ No se encontró el resultado ${tipo} para la mesa ${mesa}`);
      return null;
    }
  } catch (error) {
    console.error(`⚠ No se pudo obtener resultado ${tipo}:`, error.message);
    return null;
  }
}