// ✅ consultar_intendentes.js (versión ECharts - Barras horizontales)
document.addEventListener("DOMContentLoaded", () => {
  const selectMunicipio = document.getElementById("selectMunicipio_intendentes");
  const btnConsultar = document.getElementById("btnConsultar_intendentes");
  const chartDiv = document.getElementById("graficoIntendentes");
  const leyendaDiv = document.getElementById("leyendaIntendentes");

  const API_BASE = "http://127.0.0.1:3001";

  btnConsultar.addEventListener("click", async () => {
    const municipio = selectMunicipio.value;
    if (!municipio) {
      alert("⚠️ Debes seleccionar un municipio.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/certificados/provinciales`);
      if (!res.ok) throw new Error("Error al leer certificados provinciales");
      const certificados = await res.json();

      const certificadosFiltrados = certificados.filter(
        cert => (cert.municipio || "").toUpperCase() === municipio.toUpperCase()
      );

      if (certificadosFiltrados.length === 0) {
        alert("⚠️ No hay datos disponibles para este municipio.");
        if (window.graficoIntendentes?.dispose) window.graficoIntendentes.dispose();
        leyendaDiv.innerHTML = "";
        return;
      }

      // 🔹 Acumular votos por fuerza política (índice 2 = Intendentes)
      const acumulados = {};
      certificadosFiltrados.forEach(cert => {
        (cert.fuerzas || []).forEach(f => {
          const total = Array.isArray(f.votos) ? (Number(f.votos[2]) || 0) : 0;
          const clave = f.fuerza_politica || "SIN NOMBRE";
          acumulados[clave] = (acumulados[clave] || 0) + total;
        });
      });

      let fuerzas = Object.keys(acumulados);
      let votos = Object.values(acumulados);
      const totalVotos = votos.reduce((a, b) => a + b, 0);

      const coloresFijos = {
        "FUERZA PATRIA": "#36b2ec",
        "ALIANZA LA LIBERTAD AVANZA": "#371859",
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

      // 🔹 Ordenar de mayor a menor
      const ordenado = fuerzas.map((f, i) => ({
        fuerza: f,
        votos: votos[i],
        color: colores[i]
      })).sort((a, b) => b.votos - a.votos);

      fuerzas = ordenado.map(x => x.fuerza);
      votos = ordenado.map(x => x.votos);
      colores = ordenado.map(x => x.color);

      if (window.graficoIntendentes?.dispose) window.graficoIntendentes.dispose();
      const chart = echarts.init(chartDiv);

      const option = {
        backgroundColor: "transparent",
        title: {
          text: `Resultados en ${municipio}`,
          left: "center",
          top: "2%",
          textStyle: { color: "#fff", fontSize: 20, fontWeight: "bold" }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: p => {
            const d = p[0];
            const perc = totalVotos ? ((d.value / totalVotos) * 100).toFixed(1) : "0";
            return `<b>${d.name}</b><br>${d.value} votos (${perc}%)`;
          }
        },
        grid: { left: "22%", right: "8%", top: "14%", bottom: "5%", containLabel: true },
        xAxis: { type: "value", axisLabel: { color: "#fff" }, splitLine: { show: false } },
        yAxis: {
          type: "category",
          data: fuerzas.map(f => f.toUpperCase()),
          inverse: true,
          axisLabel: { color: "#fff", fontSize: 12, interval: 0, width: 200, overflow: "breakAll" }
        },
        series: [{
          name: "Votos",
          type: "bar",
          data: votos.map((v, i) => ({ value: v, itemStyle: { color: colores[i] } })),
          barWidth: 18,
          label: {
            show: true,
            position: "right",
            color: "#fff",
            fontSize: 12,
            formatter: p => totalVotos ? `${((p.value / totalVotos) * 100).toFixed(1)}%` : "0%"
          },
          emphasis: { focus: "series", itemStyle: { borderColor: "#fff", borderWidth: 1.5 } }
        }]
      };

      chart.setOption(option);
      window.graficoIntendentes = chart;

      leyendaDiv.innerHTML = "";
      fuerzas.forEach((f, i) => {
        const perc = totalVotos ? ((votos[i] / totalVotos) * 100).toFixed(1) : "0";
        const div = document.createElement("div");
        div.style.display = "inline-block";
        div.style.margin = "8px 15px";
        div.style.fontSize = "15px";
        div.innerHTML = `
          <span style="display:inline-block;width:18px;height:18px;background:${colores[i]};
                       border-radius:4px;margin-right:6px;"></span>
          <strong>${f}</strong>: ${perc}%`;
        leyendaDiv.appendChild(div);
      });

      console.log("📊 Totales Intendentes:", acumulados);

    } catch (err) {
      console.error("Error cargando datos:", err);
      alert("❌ Hubo un problema al cargar los datos.");
    }
  });
});
