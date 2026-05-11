import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, ScrollView, Pressable } from 'react-native';
import DiaCard from './components/DiaCard';
import { agruparPorData } from './utils/agruparPorData';
import dados from './assets/dados.json'

export default function App() {
  const [favoritos, setFavoritos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('TODOS');

  const jogos = dados.jogos;

  const grupos = useMemo(
    () => ['TODOS', ...Array.from(new Set(jogos.map((jogo) => jogo.grupo))).sort()],
    [jogos]
  );

  const jogosFiltrados =
    selectedGroup === 'TODOS'
      ? jogos
      : jogos.filter((jogo) => jogo.grupo === selectedGroup);

  const jogosAgrupados = agruparPorData(jogosFiltrados);

  const jogosTratados = Object.keys(jogosAgrupados).map(data => {
    return {
      title: data,
      data: jogosAgrupados[data]
    }
  })

  const toggleFavorito = (id) => {
    setFavoritos((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <ImageBackground style={styles.container}
      source={require('./assets/bg-overlay.png')}>
      <Image style={styles.logo}
        source={require('./assets/unicopa.png')}
      />

      <Text style={styles.title}>CALENDÁRIO</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupFilterContainer}
        style={{ width: '100%', marginTop: 12 }}
      >
        {grupos.map((grupo) => (
          <Pressable
            key={grupo}
            onPress={() => setSelectedGroup(grupo)}
            style={[
              styles.groupButton,
              selectedGroup === grupo && styles.groupButtonActive,
            ]}
          >
            <Text
              style={[
                styles.groupButtonText,
                selectedGroup === grupo && styles.groupButtonTextActive,
              ]}
            >
              {grupo}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {jogosTratados.map((dia) => (
          <DiaCard
            key={dia.title}
            data={dia.title}
            jogos={dia.data}
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        ))}
      </ScrollView>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#040b13',
    alignItems: 'center',
  },
  logo: {
    marginTop: 20,
    width: 200,
    height: 50,
    resizeMode: 'contain'
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  groupFilterContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  groupButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2b3c52',
    backgroundColor: '#08111d',
    marginRight: 10,
  },
  groupButtonActive: {
    backgroundColor: '#f2cc2f',
    borderColor: '#f2cc2f',
  },
  groupButtonText: {
    color: '#8fa3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  groupButtonTextActive: {
    color: '#040b13',
  },
  card: {
    marginTop: 20,
    backgroundColor: '#0c1b2a',
    width: 320,
    borderRadius: 12,
    padding: 15,
  },
  data: {
    color: '#f2cc2f',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },

  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d3d',
    paddingBottom: 15
  },
});