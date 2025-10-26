// ✅ consultar_diputados_nacionales.js
document.addEventListener("DOMContentLoaded", () => {
  const selectDepto = document.getElementById("selectDepartamento_diputados_nac");
  const btnConsultar = document.getElementById("btnConsultar_diputados_nac");
  const chartDiv = document.getElementById("graficoDiputadosNacionales");
  const leyendaDiv = document.getElementById("leyendaDiputadosNacionales");

  const API_BASE = "http://127.0.0.1:3001"; // backend local

  btnConsultar.addEventListener("click", async () => {
    const elegido = selectDepto.value;
    if (!elegido) {
      alert("⚠️ Debes seleccionar un departamento (o A NIVEL PROVINCIAL).");
      return;
    }

    try {
      // 1) Leer TODOS los certificados nacionales
      const res = await fetch(`${API_BASE}/api/certificados/nacionales`);
      if (!res.ok) throw new Error("Error al leer certificados nacionales");
      const certificados = await res.json();

      if (!Array.isArray(certificados) || certificados.length === 0) {
        alert("⚠️ No hay datos nacionales cargados.");
        return;
      }

      // 2) Filtrar por departamento si corresponde
      const fuente = (elegido === "A NIVEL PROVINCIAL")
        ? certificados
        : certificados.filter(c => (c.departamento || "").toUpperCase() === elegido.toUpperCase());

      if (fuente.length === 0) {
        alert("⚠️ No hay datos para el departamento seleccionado.");
        return;
      }

      // 3) Acumular SOLO Diputados Nacionales (índice 1 del array de votos)
      const acumulados = {};
      fuente.forEach(cert => {
        cert.fuerzas.forEach(f => {
          const votosDipNac = Array.isArray(f.votos) ? (f.votos[0] || 0) : 0;
          acumulados[f.fuerza_politica] = (acumulados[f.fuerza_politica] || 0) + votosDipNac;
        });
      });

      // 4) Preparar datos
      let fuerzas = Object.keys(acumulados);
      let votos = Object.values(acumulados);
      const totalVotos = votos.reduce((a, b) => a + b, 0);

      // 5) Colores institucionales + grises para el resto
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

      // 6) Ordenar mayor→menor
      const mix = fuerzas.map((f, i) => ({ fuerza: f, votos: votos[i], color: colores[i] }))
                         .sort((a, b) => b.votos - a.votos);
      fuerzas = mix.map(m => m.fuerza);
      votos = mix.map(m => m.votos);
      colores = mix.map(m => m.color);

      // 7) Destruir gráfico previo
      if (window.graficoDiputadosNacionales && typeof window.graficoDiputadosNacionales.dispose === "function") {
        window.graficoDiputadosNacionales.dispose();
      }

      // 8) Render ECharts (barras horizontales)
      const chart = echarts.init(chartDiv);
      const titulo = (elegido === "A NIVEL PROVINCIAL")
        ? "Resultados - Diputados Nacionales (Total Provincia)"
        : `Resultados - Diputados Nacionales (${elegido})`;

      chart.setOption({
        backgroundColor: "transparent",
        title: {
          text: titulo,
          left: "center",
          top: "2%",
          textStyle: { color: "#fff", fontSize: 20, fontWeight: "bold" }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: p => {
            const item = p[0];
            const pct = totalVotos ? ((item.value / totalVotos) * 100).toFixed(1) : "0.0";
            return `<b>${item.name}</b><br>${item.value} votos (${pct}%)`;
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
            show: true,
            position: "right",
            color: "#fff",
            fontSize: 12,
            formatter: p => totalVotos ? `${((p.value / totalVotos) * 100).toFixed(1)}%` : "0.0%"
          }
        }],
        animationDuration: 800
      });

      window.graficoDiputadosNacionales = chart;

      // 9) Leyenda personalizada debajo
      leyendaDiv.innerHTML = "";
      fuerzas.forEach((f, i) => {
        const pct = totalVotos ? ((votos[i] / totalVotos) * 100).toFixed(1) : "0.0";
        const item = document.createElement("div");
        item.style.display = "inline-block";
        item.style.margin = "8px 15px";
        item.style.fontSize = "15px";
        item.innerHTML = `
          <span style="display:inline-block;width:18px;height:18px;background-color:${colores[i]};border-radius:4px;margin-right:6px;"></span>
          <strong>${f}</strong>: ${pct}%
        `;
        leyendaDiv.appendChild(item);
      });

      console.log("📊 Totales Diputados Nacionales:", acumulados);

    } catch (e) {
      console.error(e);
      alert("❌ Hubo un problema al cargar los resultados de Diputados Nacionales.");
    }
  });
});
