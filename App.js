import { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import DiaCard from './components/DiaCard';
import { agruparPorData } from './utils/agruparPorData';
import dados from './assets/dados.json';
import { supabase } from './utils/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jogos, setJogos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('TODOS');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao ler sessão:', error);
      }
      setUser(data?.session?.user ?? null);
      setSessionLoading(false);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setJogos([]);
        setFavoritos([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchJogos();
      fetchFavoritos();
    }
  }, [user]);

  const fetchJogos = async () => {
    setStatusMessage('Carregando jogos...');

    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .order('data_brasilia', { ascending: true })
      .order('hora_brasilia', { ascending: true });

    if (error) {
      console.error('Erro ao buscar jogos:', error);
      setStatusMessage('Erro ao carregar jogos: ' + error.message);
      setJogos([]);
    } else {
      setJogos(data ?? []);
      setStatusMessage(data?.length === 0 ? 'Nenhum jogo carregado' : '');
    }
  };

  const fetchFavoritos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favoritos')
      .select('jogo_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      return;
    }

    setFavoritos(data?.map((item) => item.jogo_id) ?? []);
  };

  const handleToggleFavorito = async (jogoId) => {
    if (!user) {
      setStatusMessage('Faça login para favoritar jogos.');
      return;
    }

    const jaFavorito = favoritos.includes(jogoId);

    if (jaFavorito) {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .match({ user_id: user.id, jogo_id: jogoId });

      if (error) {
        console.error('Erro ao remover favorito:', error);
        setStatusMessage('Erro ao remover favorito: ' + error.message);
      } else {
        setFavoritos((prev) => prev.filter((id) => id !== jogoId));
        setStatusMessage('Favorito removido.');
      }
    } else {
      const { error } = await supabase
        .from('favoritos')
        .insert([{ user_id: user.id, jogo_id: jogoId }]);

      if (error) {
        console.error('Erro ao favoritar:', error);
        setStatusMessage('Erro ao favoritar jogo: ' + error.message);
      } else {
        setFavoritos((prev) => [...prev, jogoId]);
        setStatusMessage('Jogo favoritado.');
      }
    }
  };

  const importarJogos = async () => {
    if (!user) {
      setStatusMessage('Faça login para importar jogos.');
      return;
    }

    setStatusMessage('Importando jogos...');

    const jogosParaImportar = dados.jogos.map((jogo) => ({
      id: jogo.id,
      fase: jogo.fase,
      grupo: jogo.grupo,
      data_et: jogo.data_et,
      hora_et: jogo.hora_et,
      data_brasilia: jogo.data_brasilia,
      hora_brasilia: jogo.hora_brasilia,
      time_casa: jogo.time_casa,
      sigla_casa: jogo.sigla_casa,
      time_fora: jogo.time_fora,
      sigla_fora: jogo.sigla_fora,
      confronto: jogo.confronto,
      estadio: jogo.estadio,
      cidade: jogo.cidade,
      pais: jogo.pais,
    }));

    const { error } = await supabase
      .from('jogos')
      .upsert(jogosParaImportar, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      console.error('Erro ao importar jogos:', error);
      setStatusMessage('Erro ao importar jogos: ' + error.message);
    } else {
      setStatusMessage('Importação finalizada.');
      fetchJogos();
    }
  };

  const handleLogin = async () => {
    setStatusMessage('');

    if (!email.trim() || !password) {
      setStatusMessage('E-mail e senha são obrigatórios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage('Informe um e-mail válido.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);

    if (error) {
      console.error('Erro de login:', error);
      setStatusMessage('Erro ao fazer login: ' + error.message);
    } else if (data?.session?.user) {
      setUser(data.session.user);
      setStatusMessage('Login realizado com sucesso!');
      setEmail('');
      setPassword('');
      fetchJogos();
      fetchFavoritos();
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao sair:', error);
      setStatusMessage('Erro ao encerrar sessão: ' + error.message);
    } else {
      setUser(null);
      setJogos([]);
      setFavoritos([]);
      setSelectedGroup('TODOS');
      setStatusMessage('Sessão encerrada.');
    }
  };

  const grupos = useMemo(
    () => ['TODOS', ...Array.from(new Set(jogos.map((jogo) => jogo.grupo))).sort()],
    [jogos]
  );

  const jogosFiltrados =
    selectedGroup === 'TODOS'
      ? jogos
      : jogos.filter((jogo) => jogo.grupo === selectedGroup);

  const jogosAgrupados = agruparPorData(jogosFiltrados);

  const jogosTratados = Object.keys(jogosAgrupados)
    .sort()
    .map((data) => ({ title: data, data: jogosAgrupados[data] }));

  if (sessionLoading) {
    return (
      <ImageBackground style={styles.container} source={require('./assets/bg-overlay.png')}>
        <Text style={styles.title}>Carregando...</Text>
      </ImageBackground>
    );
  }

  if (!user) {
    return (
      <ImageBackground style={styles.container} source={require('./assets/bg-overlay.png')}>
        <Image style={styles.logo} source={require('./assets/unicopa.png')} />
        <Text style={styles.title}>Login</Text>
        <View style={styles.loginBox}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#8fa3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#8fa3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{authLoading ? 'Entrando...' : 'Entrar'}</Text>
          </Pressable>
          {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          <Text style={styles.helpText}>Use a conta criada no Supabase para acessar.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground style={styles.container} source={require('./assets/bg-overlay.png')}>
      <Image style={styles.logo} source={require('./assets/unicopa.png')} />
      <Text style={styles.title}>CALENDÁRIO</Text>
      <View style={styles.authBar}>
        <Text style={styles.userText}>{user.email}</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.importButton} onPress={importarJogos}>
          <Text style={styles.importButtonText}>Importar jogos</Text>
        </Pressable>
        <Pressable style={styles.refreshButton} onPress={fetchJogos}>
          <Text style={styles.refreshButtonText}>Atualizar</Text>
        </Pressable>
      </View>
      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
      <View style={styles.groupFilterContainer}>
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
      </View>
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {jogosTratados.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhum jogo carregado</Text>
          </View>
        ) : (
          jogosTratados.map((dia) => (
            <DiaCard
              key={dia.title}
              data={dia.title}
              jogos={dia.data}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
            />
          ))
        )}
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
    resizeMode: 'contain',
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  loginBox: {
    width: '90%',
    maxWidth: 360,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(12, 27, 42, 0.95)',
  },
  input: {
    width: '100%',
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#06111b',
    color: 'white',
    borderWidth: 1,
    borderColor: '#203246',
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#f2cc2f',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#040b13',
    fontWeight: '700',
  },
  helpText: {
    marginTop: 12,
    color: '#8fa3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  authBar: {
    width: '90%',
    maxWidth: 360,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    color: '#ffffff',
    fontSize: 14,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#d9534f',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actionRow: {
    width: '90%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  importButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
  },
  refreshButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f2cc2f',
    alignItems: 'center',
  },
  importButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  refreshButtonText: {
    color: '#040b13',
    fontWeight: '700',
  },
  statusText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 20,
    width: 320,
    padding: 25,
    borderRadius: 12,
    backgroundColor: '#0c1b2a',
    alignItems: 'center',
  },
  emptyText: {
    color: '#8fa3b8',
    fontSize: 16,
    textAlign: 'center',
  },
  groupFilterContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2b3c52',
    backgroundColor: '#08111d',
    marginRight: 10,
    marginBottom: 10,
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
});
