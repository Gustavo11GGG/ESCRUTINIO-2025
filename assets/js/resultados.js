document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Cargando Chart.js de prueba...");

  const ctx = document.createElement("canvas");
  document.body.appendChild(ctx);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Fuerza A', 'Fuerza B', 'Fuerza C'],
      datasets: [{
        label: 'Votos Totales',
        data: [120, 90, 45],
        backgroundColor: ['#6c3db8', '#3498db', '#2ecc71']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Resultados de prueba - Chart.js activo' }
      }
    }
  });
});
