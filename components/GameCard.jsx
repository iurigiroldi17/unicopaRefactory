import { View, Text, Image, StyleSheet } from 'react-native';
import { formatDate } from '../utils/formatDate';

export default function GameCard({ game }) {

      const flags = {
        MEX: require('../assets/jogos/mexico.png'),
        RSA: require('../assets/jogos/south africa.png'),
        KOR: require('../assets/jogos/south korea.png'),
        CZE: require('../assets/jogos/czech republic.png'),
        BRA: require('../assets/jogos/brazil.png'),
        ARG: require('../assets/jogos/argentina.png'),
        USA: require('../assets/jogos/united states.png'),
        CAN: require('../assets/jogos/canada.png'),
        HAI: require('../assets/jogos/haiti.png'),
        AUS: require('../assets/jogos/australia.png'),
        QAT: require('../assets/jogos/qatar.png'),
        CIV: require('../assets/jogos/ivory coast.png'),
        GER: require('../assets/jogos/germany.png'),
        NED: require('../assets/jogos/netherlands.png'),
        SWE: require('../assets/jogos/sweden.png'),
        KSA: require('../assets/jogos/saudi arabia.png'),
        ESP: require('../assets/jogos/spain.png'),
        IRN: require('../assets/jogos/iran.png'),
        BEL: require('../assets/jogos/belgium.png'),
        FRA: require('../assets/jogos/france.png'),
        IRQ: require('../assets/jogos/iraq.png'),
        AUT: require('../assets/jogos/austria.png'),
        GHA: require('../assets/jogos/ghana.png'),
        BIH: require('../assets/jogos/bosnia and herzegovina.png'),
        PAR: require('../assets/jogos/paraguay.png'),
        SCO: require('../assets/jogos/scotland.png'),
        TUR: require('../assets/jogos/turkey.png'),
        MAR: require('../assets/jogos/morocco.png'),
        SUI: require('../assets/jogos/switzerland.png'),
        ECU: require('../assets/jogos/ecuador.png'),
        CUW: require('../assets/jogos/curacao.png'),
        JPN: require('../assets/jogos/japan.png'),
        TUN: require('../assets/jogos/tunisia.png'),
        URU: require('../assets/jogos/uruguay.png'),
        CPV: require('../assets/jogos/cape verde.png'),
        NZL: require('../assets/jogos/new zealand.png'),
        EGY: require('../assets/jogos/egypt.png'),
        SEN: require('../assets/jogos/senegal.png'),
        NOR: require('../assets/jogos/norway.png'),
        ALG: require('../assets/jogos/Algeria.png'),
        JOR: require('../assets/jogos/jordan.png'),
        PAN: require('../assets/jogos/panama.png'),
        COL: require('../assets/jogos/colombia.png'),
        COD: require('../assets/jogos/democratic republic of congo.png'),
        CRO: require('../assets/jogos/croatia.png'),
        ENG: require('../assets/jogos/england.png'),
        POR: require('../assets/jogos/portugal.png'),
        UZB: require('../assets/jogos/uzbekistán.png')
    }

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
                   <Text>{formatDate(game.data_brasilia)}</Text>
                    <Text style={styles.subTitulo}>VS</Text>
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
                <Text style={styles.subTitulo}>{game.estadio}</Text>
                <Text style={styles.subTitulo}>
                    {game.cidade} • {game.pais}
                </Text>
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
    justifyContent: 'space-between'
  },
  subTitulo: {
    color: '#8fa3b8',
    fontSize: 12
  }
});