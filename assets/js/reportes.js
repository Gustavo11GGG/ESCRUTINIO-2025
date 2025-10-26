const resultadosNacionales = JSON.parse(localStorage.getItem("resultadosNacionales")) || [];
const resultadosProvinciales = JSON.parse(localStorage.getItem("resultadosProvinciales")) || [];

console.log("Totales Nacionales:", totalizarNacional(resultadosNacionales));
console.log("Totales Provinciales:", totalizarProvincial(resultadosProvinciales));
