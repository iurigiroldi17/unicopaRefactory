import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { formatDate } from '../utils/formatDate';
import { flags } from './flags';

export default function GameCard({ game, favoritos = [], onToggleFavorito }) {
  const isFavorito = favoritos.includes(game.id);

  const isBrazilGame = game.sigla_casa === 'BRA' || game.sigla_fora === 'BRA';

    return (
        <View style={[styles.jogo, isBrazilGame && styles.brazilGame]}>

            <Text style={styles.grupo}>
                GRUPO {game.grupo}  {game.confronto}
            </Text>

            <View style={styles.linhaPrincipal}>

                <View style={styles.time}>
                    <Image
                        style={styles.bandeira}
                        source={flags[game.sigla_casa]}
                    />
                    <Text style={styles.sigla}>{game.sigla_casa}</Text>
                </View>

                <View style={styles.horario}>
                   <Text style={styles.hora}>{game.hora_brasilia}</Text>
                   <Text style={styles.subTitulo}>{formatDate(game.data_brasilia)}</Text>
                </View>

                <View style={styles.time}>
                    <Text style={styles.sigla}>{game.sigla_fora}</Text>
                    <Image
                        style={styles.bandeira}
                        source={flags[game.sigla_fora]}
                    />
                </View>

            </View>

            <View style={styles.local}>
                <View>
                  <Text style={styles.subTitulo}>{game.estadio}</Text>
                  <Text style={styles.subTitulo}>
                      {game.cidade} • {game.pais}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onToggleFavorito(game.id)}
                  style={({ pressed }) => [
                    styles.favoriteButton,
                    pressed && styles.favoriteButtonPressed,
                  ]}
                >
                  <Text style={[styles.favoriteIcon, isFavorito && styles.favoriteIconActive]}>
                    {isFavorito ? '★' : '☆'}
                  </Text>
                </Pressable>
            </View>

        </View>
    )

}

const styles = StyleSheet.create({
  jogo: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d3d',
    paddingBottom: 15
  },
  brazilGame: {
    borderLeftWidth: 4,
    borderLeftColor: '#f2cc2f',
    backgroundColor: 'rgba(242, 204, 47, 0.05)',
    paddingLeft: 10,
    borderRadius: 8
  },
  grupo: {
    color: '#8fa3b8',
    fontSize: 12,
    marginBottom: 10
  },
  linhaPrincipal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bandeira: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  sigla: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  horario: {
    alignItems: 'center'
  },
  hora: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  local: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 999,
  },
  favoriteButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  favoriteIcon: {
    color: '#8fa3b8',
    fontSize: 18,
  },
  favoriteIconActive: {
    color: '#f2cc2f',
  },
  subTitulo: {
    color: '#8fa3b8',
    fontSize: 12
  }
});