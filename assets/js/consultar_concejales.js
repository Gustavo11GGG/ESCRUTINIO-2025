// ✅ consultar_concejales.js (ECharts - Barras horizontales, IDs actualizados)
document.addEventListener("DOMContentLoaded", () => {
  const selectMunicipio = document.getElementById("selectMunicipio_concejales");
  const btnConsultar = document.getElementById("btnConsultar_concejales");
  const chartDiv = document.getElementById("graficoConcejales");
  const leyendaDiv = document.getElementById("leyendaConcejales");

  // Guardas defensivas por si faltara algún nodo en el DOM
  if (!selectMunicipio || !btnConsultar || !chartDiv || !leyendaDiv) {
    console.warn("[Concejales] Faltan elementos del DOM. Revisa los IDs en el HTML.");
    return;
  }

  const API_BASE = "http://127.0.0.1:3001"; // backend local

  btnConsultar.addEventListener("click", async () => {
    const municipioSeleccionado = selectMunicipio.value;
    if (!municipioSeleccionado) {
      alert("⚠️ Debes seleccionar un municipio.");
      return;
    }

    try {
      // 1️⃣ Obtener certificados provinciales
      const res = await fetch(`${API_BASE}/api/certificados/provinciales`, { cache: "no-store" });
      if (!res.ok) throw new Error("Error al leer certificados provinciales");
      const certificados = await res.json();

      // 2️⃣ Filtrar por municipio
      const certificadosMunicipio = certificados.filter(
        cert => (cert.municipio || "").toUpperCase() === municipioSeleccionado.toUpperCase()
      );

      if (certificadosMunicipio.length === 0) {
        alert("⚠️ No hay datos para este municipio.");
        // Limpio gráfico y leyenda si ya había algo
        if (window.graficoConcejales?.dispose) window.graficoConcejales.dispose();
        leyendaDiv.innerHTML = "";
        return;
      }

      // 3️⃣ Acumular votos por fuerza política (solo Concejales = índice 3 del arreglo 'votos')
      const acumulados = {};
      certificadosMunicipio.forEach(cert => {
        (cert.fuerzas || []).forEach(f => {
          const total = Array.isArray(f.votos) ? (Number(f.votos[3]) || 0) : 0;
          const key = f.fuerza_politica || "SIN NOMBRE";
          acumulados[key] = (acumulados[key] || 0) + total;
        });
      });

      // 4️⃣ Preparar datos
      let fuerzas = Object.keys(acumulados);
      let votos = fuerzas.map(f => acumulados[f]);
      const totalVotos = votos.reduce((a, b) => a + b, 0);

      // 5️⃣ Colores institucionales + grises
      const coloresFijos = {
        "ALIANZA LA LIBERTAD AVANZA": "#371859",
        "FUERZA PATRIA": "#36b2ec",
        "ALIANZA SOMOS PROVINCIAS UNIDAS CATAMARCA": "#e52031",
        "MOVIMIENTO DE INTEGRACIÓN Y DESARROLLO - MID": "#0d293d",
        "HACEMOS RENACER CATAMARCA": "#01509b",
        "PRIMERO CATAMARCA": "#ef7d1f"
      };
      const gris = () => {
        const t = Math.floor(Math.random() * 100) + 130;
        return `rgb(${t},${t},${t})`;
      };
      let colores = fuerzas.map(f => coloresFijos[f.toUpperCase()] || gris());

      // 6️⃣ Ordenar de mayor a menor
      const filas = fuerzas.map((f, i) => ({ f, v: votos[i], c: colores[i] }))
                           .sort((a, b) => b.v - a.v);
      fuerzas = filas.map(x => x.f);
      votos   = filas.map(x => x.v);
      colores = filas.map(x => x.c);

      // 7️⃣ Destruir gráfico anterior
      if (window.graficoConcejales?.dispose) window.graficoConcejales.dispose();

      // 8️⃣ Crear gráfico de barras horizontales
      const chart = echarts.init(chartDiv);
      const option = {
        backgroundColor: "transparent",
        title: {
          text: `Resultados en ${municipioSeleccionado}`,
          left: "center",
          top: "2%",
          textStyle: { color: "#fff", fontSize: 20, fontWeight: "bold" }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: params => {
            const p = params[0];
            const porc = totalVotos ? ((p.value / totalVotos) * 100).toFixed(1) : "0.0";
            return `<b>${p.name}</b><br>${p.value} votos (${porc}%)`;
          }
        },
        grid: { left: "22%", right: "8%", top: "14%", bottom: "5%", containLabel: true },
        xAxis: { type: "value", axisLabel: { color: "#fff" }, splitLine: { show: false } },
        yAxis: {
          type: "category",
          data: fuerzas.map(f => f.toUpperCase()),
          inverse: true,
          axisLabel: { color: "#fff", fontSize: 12, interval: 0, width: 220, overflow: "breakAll" }
        },
        series: [{
          name: "Votos",
          type: "bar",
          data: votos.map((v, i) => ({ value: v, itemStyle: { color: colores[i] } })),
          barWidth: 18,
          label: {
            show: true, position: "right", color: "#fff", fontSize: 12,
            formatter: p => totalVotos ? `${((p.value / totalVotos) * 100).toFixed(1)}%` : "0.0%"
          },
          emphasis: { focus: "series", itemStyle: { borderColor: "#fff", borderWidth: 1.5 } }
        }],
        animationDuration: 800
      };
      chart.setOption(option);
      window.graficoConcejales = chart;

      // 9️⃣ Leyenda personalizada
      leyendaDiv.innerHTML = "";
      fuerzas.forEach((f, i) => {
        const p = totalVotos ? ((votos[i] / totalVotos) * 100).toFixed(1) : "0.0";
        const div = document.createElement("div");
        div.style.display = "inline-block";
        div.style.margin = "8px 15px";
        div.style.fontSize = "15px";
        div.innerHTML = `
          <span style="display:inline-block;width:18px;height:18px;background:${colores[i]};
                       border-radius:4px;margin-right:6px;"></span>
          <strong>${f}</strong>: ${p}%`;
        leyendaDiv.appendChild(div);
      });

      console.log("[Concejales] Totales:", acumulados);
    } catch (err) {
      console.error("[Concejales] Error:", err);
      alert("❌ Hubo un problema al cargar los datos.");
    }
  });
});
