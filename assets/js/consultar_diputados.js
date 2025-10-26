// ✅ consultar_diputados.js (versión ECharts - BARRAS HORIZONTALES ORDENADAS)
document.addEventListener("DOMContentLoaded", () => {
  const selectDepartamento = document.getElementById("selectDepartamento_diputados");
  const btnConsultar = document.getElementById("btnConsultar_diputados");
  const chartDiv = document.getElementById("graficoDiputados");
  const leyendaDiv = document.getElementById("leyendaDiputados");

  const API_BASE = "http://127.0.0.1:3001"; // backend local

  btnConsultar.addEventListener("click", async () => {
    const departamentoSeleccionado = selectDepartamento.value;
    if (!departamentoSeleccionado) {
      alert("⚠️ Debes seleccionar un departamento.");
      return;
    }

    try {
      // 1️⃣ Obtener certificados provinciales
      const res = await fetch(`${API_BASE}/api/certificados/provinciales`);
      if (!res.ok) throw new Error("Error al leer certificados provinciales");
      const certificados = await res.json();

      let certificadosFiltrados;

      // 2️⃣ Si el usuario elige "A NIVEL PROVINCIAL", usamos todos
      if (departamentoSeleccionado.toUpperCase() === "A NIVEL PROVINCIAL") {
        certificadosFiltrados = certificados;
      } else {
        certificadosFiltrados = certificados.filter(
          cert => cert.departamento.toUpperCase() === departamentoSeleccionado.toUpperCase()
        );
      }

      if (certificadosFiltrados.length === 0) {
        alert("⚠️ No hay datos para este departamento.");
        return;
      }

      // 3️⃣ Acumular votos por fuerza política (Diputados Provinciales = índice [0])
      const acumulados = {};
      certificadosFiltrados.forEach(cert => {
        cert.fuerzas.forEach(f => {
          const total = Array.isArray(f.votos) ? f.votos[0] || 0 : 0;
          acumulados[f.fuerza_politica] =
            (acumulados[f.fuerza_politica] || 0) + total;
        });
      });

      // 4️⃣ Preparar datos
      let fuerzas = Object.keys(acumulados);
      let votos = Object.values(acumulados);
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

      const generarGris = () => {
        const tono = Math.floor(Math.random() * 100) + 130;
        return `rgb(${tono}, ${tono}, ${tono})`;
      };

      let colores = fuerzas.map(f => {
        const clave = f.toUpperCase();
        return coloresFijos[clave] || generarGris();
      });

      // 6️⃣ Ordenar de mayor a menor
      const combinados = fuerzas.map((f, i) => ({
        fuerza: f,
        votos: votos[i],
        color: colores[i]
      }));

      combinados.sort((a, b) => b.votos - a.votos);

      fuerzas = combinados.map(c => c.fuerza);
      votos = combinados.map(c => c.votos);
      colores = combinados.map(c => c.color);

      // 7️⃣ Destruir gráfico anterior
      if (window.graficoDiputados && typeof window.graficoDiputados.dispose === "function") {
        window.graficoDiputados.dispose();
      }

      // 8️⃣ Crear gráfico de barras horizontales
      const chart = echarts.init(chartDiv);

      const option = {
        backgroundColor: "transparent",
        title: {
          text:
            departamentoSeleccionado.toUpperCase() === "A NIVEL PROVINCIAL"
              ? "Resultados Generales - DIPUTADOS PROVINCIALES"
              : `Resultados en ${departamentoSeleccionado}`,
          left: "center",
          top: "2%",
          textStyle: {
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: params => {
            const p = params[0];
            const porcentaje = ((p.value / totalVotos) * 100).toFixed(1);
            return `<b>${p.name}</b><br>${p.value} votos (${porcentaje}%)`;
          }
        },
        grid: {
          left: "22%",
          right: "8%",
          top: "14%",
          bottom: "5%",
          containLabel: true
        },
        xAxis: {
          type: "value",
          axisLabel: { color: "#fff" },
          splitLine: { show: false }
        },
        yAxis: {
          type: "category",
          data: fuerzas.map(f => f.toUpperCase()),
          inverse: true, // 🔹 fuerza con más votos arriba
          axisLabel: {
            color: "#fff",
            fontSize: 12,
            interval: 0,
            width: 220,
            overflow: "breakAll"
          }
        },
        series: [
          {
            name: "Votos",
            type: "bar",
            data: votos.map((v, i) => ({
              value: v,
              itemStyle: { color: colores[i] }
            })),
            barWidth: 18,
            label: {
              show: true,
              position: "right",
              color: "#fff",
              fontSize: 12,
              formatter: p =>
                `${((p.value / totalVotos) * 100).toFixed(1)}%`
            },
            emphasis: {
              focus: "series",
              itemStyle: { borderColor: "#fff", borderWidth: 1.5 }
            }
          }
        ],
        animationDuration: 1000
      };

      chart.setOption(option);
      window.graficoDiputados = chart;

      // 9️⃣ Leyenda personalizada
      leyendaDiv.innerHTML = "";
      fuerzas.forEach((f, i) => {
        const porcentaje = ((votos[i] / totalVotos) * 100).toFixed(1);
        const item = document.createElement("div");
        item.style.display = "inline-block";
        item.style.margin = "8px 15px";
        item.style.fontSize = "15px";
        item.innerHTML = `
          <span style="
            display:inline-block;
            width:18px;
            height:18px;
            background-color:${colores[i]};
            border-radius:4px;
            margin-right:6px;
          "></span>
          <strong>${f}</strong>: ${porcentaje}%
        `;
        leyendaDiv.appendChild(item);
      });

      console.log(
        `📊 Totales Diputados Provinciales ${departamentoSeleccionado}:`,
        acumulados
      );

    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("❌ Hubo un problema al cargar los datos.");
    }
  });
});
