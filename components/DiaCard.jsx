import { View, Text, StyleSheet } from 'react-native';
import GameCard from './GameCard';

export default function DiaCard({ data, jogos }) {
  const hoje = new Date().toISOString().split('T')[0];
  const isHoje = data === hoje;

  return (
    <View style={[styles.card, isHoje && styles.todayCard]}>
      <Text style={[styles.data, isHoje && styles.todayData]}>{data}</Text>
      {jogos.map((jogo) => (
        <GameCard key={jogo.id} game={jogo} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  todayCard: {
    borderWidth: 3,
    borderColor: '#f2cc2f',
    backgroundColor: 'rgba(242, 204, 47, 0.1)',
  },
  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  todayData: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
