function acumularConcejalesCapital() {
  const resultados = JSON.parse(localStorage.getItem("resultados_provinciales")) || [];

  // Filtrar solo mesas del municipio CAPITAL
  const mesasCapital = resultados.filter(
    m => m.municipio?.toUpperCase() === "CAPITAL"
  );

  const totales = {};

  mesasCapital.forEach(mesa => {
    mesa.fuerzas.forEach(f => {
      const nombre = f.fuerza_politica;
      const votosConcejales = f.votos[3] || 0;

      if (!totales[nombre]) totales[nombre] = 0;
      totales[nombre] += votosConcejales;
    });
  });

  console.log("🧮 Totales Concejales CAPITAL:", totales);
  return totales;
}

// Para testear manualmente en consola:
acumularConcejalesCapital();
