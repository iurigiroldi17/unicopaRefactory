export function agruparPorData(jogos) {
  // Agrupa jogos por data normalizada (YYYY-MM-DD). Normaliza entradas que
  // podem conter timestamps ou formatos diferentes.
  const grouped = jogos.reduce((acc, jogo) => {
    const raw = jogo.data_brasilia ?? jogo.data_et ?? '';
    let dataKey = 'sem-data';

    if (raw) {
      // Se vier no formato ISO com tempo, cortar para a parte da data
      dataKey = raw.includes('T') ? raw.split('T')[0] : raw;
      // Garantir padronização YYYY-MM-DD (remover barras ou espaços)
      dataKey = dataKey.replace(/\//g, '-').trim();
    }

    if (!acc[dataKey]) acc[dataKey] = [];
    acc[dataKey].push(jogo);
    return acc;
  }, {});

  // Ordenar os jogos dentro de cada data por hora_brasilia
  Object.keys(grouped).forEach((k) => {
    grouped[k].sort((a, b) => {
      const parseTime = (t = '') => {
        const parts = (t || '').split(':').map(Number);
        return (parts[0] || 0) * 60 + (parts[1] || 0);
      };
    
      return parseTime(a.hora_brasilia) - parseTime(b.hora_brasilia);
    });
  });

  return grouped;
}
