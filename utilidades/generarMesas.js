// utilidades/generarMesas.js
import fs from "fs";
import { rangos } from "./rangoMesas.js";

const todasLasMesas = [];

// 🔁 Generar todas las mesas a partir de los rangos
for (const r of rangos) {
  for (let i = r.desde; i <= r.hasta; i++) {
    todasLasMesas.push({
      mesa: i,
      departamento: r.dep.toUpperCase(),
      municipio: r.muni.toUpperCase(),
      localidad: r.localidad.toUpperCase(),
      escuela: r.escuela
    });
  }
}

// 📦 Estructura final
const salida = { mesas: todasLasMesas };

// 🧩 Crear carpeta destino si no existe
fs.mkdirSync("./assets/data", { recursive: true });

// 💣 Si existe mesas.json, eliminarlo para evitar duplicados
const rutaArchivo = "./assets/data/mesas.json";
if (fs.existsSync(rutaArchivo)) {
  fs.unlinkSync(rutaArchivo);
  console.log("🗑️ Archivo mesas.json anterior eliminado.");
}

// 💾 Guardar nuevo JSON
fs.writeFileSync(rutaArchivo, JSON.stringify(salida, null, 2), "utf-8");

console.log(`✅ Se generaron ${todasLasMesas.length} mesas en ${rutaArchivo}`);
