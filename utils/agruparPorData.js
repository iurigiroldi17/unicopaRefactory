export function agruparPorData(jogos) {
  return jogos.reduce((acc, jogo) => {
    const data = jogo.data_brasilia;

    if (!acc[data]) {
      acc[data] = [];
    }

    acc[data].push(jogo);

    // Ordenar por hora_brasilia em ordem crescente (conversão para minutos)
    acc[data].sort((a, b) => {
      const [horaA, minA] = a.hora_brasilia.split(':').map(Number);
      const [horaB, minB] = b.hora_brasilia.split(':').map(Number);
      const minutosA = horaA * 60 + minA;
      const minutosB = horaB * 60 + minB;
      return minutosA - minutosB;
    });

    return acc;
  }, {});
}
