export function formatDate(dateString) {
  if (!dateString) return 'Sem data';

  // Se já vier no formato "DD/MM" apenas retorne
  if (/^\d{2}\/\d{2}$/.test(dateString)) return dateString;

  // Tentar extrair a parte YYYY-MM-DD se houver timestamp
  const raw = dateString.includes('T') ? dateString.split('T')[0] : dateString;

  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    // valor inesperado: retornar original para facilitar debug
    return dateString;
  }

  // Formatar com weekday curto e DD/MM em pt-BR
  try {
    const fmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
    // Intl pode retornar 'dom.' ou 'dom' dependendo do ambiente; normalizar sem terminal ponto
    return fmt.format(d).replace('.', '');
  } catch (e) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }
}
