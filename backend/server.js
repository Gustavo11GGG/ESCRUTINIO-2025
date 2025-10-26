// backend/server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta raíz del proyecto (sube un nivel desde /backend)
const ROOT_DIR = path.resolve(__dirname, "..");

// Paths de datos
const MESAS_PATH = path.join(ROOT_DIR, "assets", "data", "mesas.json");
const CERT_DIR = path.join(ROOT_DIR, "assets", "certificados");
const CERT_PROV_DIR = path.join(CERT_DIR, "provincial");
const CERT_NAC_DIR = path.join(CERT_DIR, "nacional");

// Asegurar carpetas
for (const dir of [CERT_DIR, CERT_PROV_DIR, CERT_NAC_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// --- utilidades ---
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));
const writeJSON = (p, data) => fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");

// ---------- ENDPOINTS ----------

// Mesas (opcional: podés seguir sirviéndolo directo como archivo)
app.get("/api/mesas", (req, res) => {
  try {
    if (!fs.existsSync(MESAS_PATH)) {
      return res.status(404).json({ error: "mesas.json no existe" });
    }
    const data = readJSON(MESAS_PATH);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error leyendo mesas.json" });
  }
});

// Guardar certificado (provincial o nacional)
app.post("/api/certificados", (req, res) => {
  try {
    const { tipo, data } = req.body; // data = resultadoMesa
    if (!tipo || !data || !data.mesa) {
      return res.status(400).json({ error: "Faltan campos: tipo y data.mesa" });
    }

    const mesa = Number(data.mesa);
    const dir = tipo === "nacional" ? CERT_NAC_DIR : CERT_PROV_DIR;
    const filePath = path.join(dir, `mesa_${mesa}.json`);

    writeJSON(filePath, data);
    return res.json({ ok: true, message: `Guardado ${tipo} mesa ${mesa}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error guardando certificado" });
  }
});

// Obtener certificado por tipo y mesa
app.get("/api/certificados/:tipo/:mesa", (req, res) => {
  try {
    const { tipo, mesa } = req.params;
    const dir = tipo === "nacional" ? CERT_NAC_DIR : CERT_PROV_DIR;
    const filePath = path.join(dir, `mesa_${Number(mesa)}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "No existe certificado para esa mesa/tipo" });
    }
    const data = readJSON(filePath);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error leyendo certificado" });
  }
});

// 📊 Obtener todos los certificados provinciales
app.get("/api/certificados/provinciales", (req, res) => {
  try {
    if (!fs.existsSync(CERT_PROV_DIR)) {
      return res.status(404).json({ error: "No existe el directorio provincial" });
    }

    const archivos = fs.readdirSync(CERT_PROV_DIR).filter(f => f.endsWith(".json"));
    if (archivos.length === 0) {
      return res.json([]);
    }

    const resultados = archivos.map(archivo => {
      const data = readJSON(path.join(CERT_PROV_DIR, archivo));
      return data;
    });

    res.json(resultados);
  } catch (error) {
    console.error("Error leyendo certificados provinciales:", error);
    res.status(500).json({ error: "Error leyendo certificados provinciales" });
  }
});

// 📊 Obtener todos los certificados nacionales
app.get("/api/certificados/nacionales", (req, res) => {
  try {
    if (!fs.existsSync(CERT_NAC_DIR)) {
      return res.status(404).json({ error: "No existe el directorio nacional" });
    }
    const archivos = fs.readdirSync(CERT_NAC_DIR).filter(f => f.endsWith(".json"));
    if (archivos.length === 0) return res.json([]);
    const resultados = archivos.map(a => readJSON(path.join(CERT_NAC_DIR, a)));
    res.json(resultados);
  } catch (err) {
    console.error("Error leyendo certificados nacionales:", err);
    res.status(500).json({ error: "Error leyendo certificados nacionales" });
  }
});

// 🗑️ ELIMINAR CERTIFICADO PROVINCIAL POR NÚMERO DE MESA
app.delete("/api/certificados/provinciales/:mesa", async (req, res) => {
  const numeroMesa = parseInt(req.params.mesa);

  try {
    // Leer los datos actuales
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "data", "certificados_provinciales.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo de certificados no encontrado." });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const nuevosDatos = data.filter(c => c.mesa !== numeroMesa);

    // Guardar el archivo actualizado
    fs.writeFileSync(filePath, JSON.stringify(nuevosDatos, null, 2));

    console.log(`🧹 Mesa ${numeroMesa} eliminada correctamente.`);
    res.json({ message: `Mesa ${numeroMesa} eliminada correctamente.` });

  } catch (error) {
    console.error("❌ Error al eliminar mesa:", error);
    res.status(500).json({ error: "Error interno del servidor al eliminar la mesa." });
  }
});



// Servir archivos estáticos (sin definir index por defecto)
app.use(express.static(ROOT_DIR, { index: false }));

// Forzar login.html como página de inicio
app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "login.html"));
});



// Arranque
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});
