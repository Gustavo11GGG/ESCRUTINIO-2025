function totalizarNacional(resultados) {
  const totales = {};
  resultados.forEach(r => {
    if (!totales[r.departamento]) totales[r.departamento] = {};
    r.fuerzas.forEach(f => {
      totales[r.departamento][f.fuerza_politica] =
        (totales[r.departamento][f.fuerza_politica] || 0) + (f.diputado_nacional || 0);
    });
  });
  return totales;
}

function totalizarProvincial(resultados) {
  const totales = {
    provincia: {},
    departamentos: {},
    municipios: {}
  };

  resultados.forEach(r => {
    r.fuerzas.forEach(f => {
      totales.provincia[f.fuerza_politica] =
        (totales.provincia[f.fuerza_politica] || 0) + (f.diputado_provincial || 0);

      if (!totales.departamentos[r.departamento]) totales.departamentos[r.departamento] = {};
      totales.departamentos[r.departamento][f.fuerza_politica] =
        (totales.departamentos[r.departamento][f.fuerza_politica] || 0) + (f.senador_provincial || 0);

      if (!totales.municipios[r.municipio]) totales.municipios[r.municipio] = {};
      totales.municipios[r.municipio][f.fuerza_politica] =
        (totales.municipios[r.municipio][f.fuerza_politica] || 0) +
        (f.intendente_municipal || 0) + (f.concejales_municipales || 0);
    });
  });

  return totales;
}
