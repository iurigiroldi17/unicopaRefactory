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
import PalpitesScreen from './components/PalpitesScreen';
import MeusPalpites from './components/MeusPalpites';
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
  const [currentScreen, setCurrentScreen] = useState('main'); // main | register | palpites | meusPalpites
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [palpiteDrafts, setPalpiteDrafts] = useState({}); // { jogoId: { gols_casa, gols_fora }}
  const [palpites, setPalpites] = useState([]);

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao ler sess�o:', error);
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
      setStatusMessage('Fa�a login para favoritar jogos.');
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
      setStatusMessage('Fa�a login para importar jogos.');
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
      setStatusMessage('Importa��o finalizada.');
      fetchJogos();
    }
  };

  const handleLogin = async () => {
    setStatusMessage('');

    if (!email.trim() || !password) {
      setStatusMessage('E-mail e senha s�o obrigat�rios.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage('Informe um e-mail v�lido.');
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
      setStatusMessage('Erro ao encerrar sess�o: ' + error.message);
    } else {
      setUser(null);
      setJogos([]);
      setFavoritos([]);
      setSelectedGroup('TODOS');
      setStatusMessage('Sess�o encerrada.');
    }
  };

  const handleShowRegister = () => {
    setStatusMessage('');
    setCurrentScreen('register');
  };

  const handleRegister = async () => {
    setStatusMessage('');

    if (!regEmail.trim() || !regPassword) {
      setStatusMessage('E-mail e senha s�o obrigat�rios.');
      return;
    }
    if (regPassword.length < 6) {
      setStatusMessage('Senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setStatusMessage('Senha e confirmar senha n�o conferem.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: { name: regName || null } },
    });
    setAuthLoading(false);

    if (error) {
      console.error('Erro ao registrar:', error);
      setStatusMessage('Erro ao registrar: ' + error.message);
    } else {
      setStatusMessage('Cadastro realizado. Verifique seu e-mail se houver confirma��o.');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setCurrentScreen('main');
    }
  };

  const jogosById = useMemo(() => {
    return jogos.reduce((acc, j) => {
      acc[j.id] = j;
      return acc;
    }, {});
  }, [jogos]);

  const isJogoStarted = (jogo) => {
    try {
      const dt = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}:00`);
      return new Date() >= dt;
    } catch (e) {
      return false;
    }
  };

  const savePalpite = async (jogoId) => {
    if (!user) {
      setStatusMessage('Fa�a login para enviar palpites.');
      return;
    }
    const draft = palpiteDrafts[jogoId];
    if (!draft) return;

    const payload = {
      user_id: user.id,
      jogo_id: jogoId,
      gols_casa: draft.gols_casa ?? null,
      gols_fora: draft.gols_fora ?? null,
      confirmado: false,
    };

    const { error } = await supabase.from('palpites').upsert([payload], { onConflict: ['user_id', 'jogo_id'] });
    if (error) {
      console.error('Erro ao salvar palpite:', error);
      setStatusMessage('Erro ao salvar palpite: ' + error.message);
    } else {
      setStatusMessage('Palpite salvo.');
      fetchPalpites();
    }
  };

  const fetchPalpites = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('palpites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar palpites:', error);
      setStatusMessage('Erro ao buscar palpites: ' + error.message);
      setPalpites([]);
    } else {
      setPalpites(data ?? []);
    }
  };

  const confirmAllDrafts = async () => {
    if (!user) return;
    const entries = Object.keys(palpiteDrafts).map((jogoId) => ({
      user_id: user.id,
      jogo_id: Number(jogoId),
      gols_casa: palpiteDrafts[jogoId].gols_casa ?? null,
      gols_fora: palpiteDrafts[jogoId].gols_fora ?? null,
      confirmado: true,
    }));

    if (entries.length === 0) {
      setStatusMessage('N�o h� palpites para confirmar.');
      return;
    }

    const { error } = await supabase.from('palpites').upsert(entries, { onConflict: ['user_id', 'jogo_id'] });
    if (error) {
      console.error('Erro ao confirmar palpites:', error);
      setStatusMessage('Erro ao confirmar palpites: ' + error.message);
    } else {
      setStatusMessage('Palpites confirmados.');
      setPalpiteDrafts({});
      fetchPalpites();
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
      <Text style={styles.title}>CALEND�RIO</Text>
      <View style={styles.authBar}>
        <Text style={styles.userText}>{user.email}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setCurrentScreen('palpites')} style={[styles.importButton, { paddingVertical: 6, marginRight: 6 }]}>
            <Text style={[styles.importButtonText, { fontSize: 12 }]}>Palpites</Text>
          </Pressable>
          <Pressable onPress={() => { fetchPalpites(); setCurrentScreen('meusPalpites'); }} style={[styles.importButton, { paddingVertical: 6 }]}>
            <Text style={[styles.importButtonText, { fontSize: 12 }]}>Meus Palpites</Text>
          </Pressable>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </Pressable>
        </View>
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
      {currentScreen === 'register' ? (
        <ImageBackground style={styles.container} source={require('./assets/bg-overlay.png')}>
          <View style={styles.loginBox}>
            <Text style={[styles.title, { marginBottom: 8 }]}>Registrar-se</Text>
            <TextInput style={styles.input} placeholder="Nome (opcional)" placeholderTextColor="#8fa3b8" value={regName} onChangeText={setRegName} />
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#8fa3b8" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#8fa3b8" value={regPassword} onChangeText={setRegPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirmar senha" placeholderTextColor="#8fa3b8" value={regConfirmPassword} onChangeText={setRegConfirmPassword} secureTextEntry />
            <Pressable style={styles.loginButton} onPress={handleRegister}><Text style={styles.loginButtonText}>{authLoading ? 'Registrando...' : 'Registrar'}</Text></Pressable>
            <Pressable style={[styles.refreshButton, { marginTop: 8 }]} onPress={() => setCurrentScreen('main')}><Text style={styles.refreshButtonText}>Voltar</Text></Pressable>
            {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          </View>
        </ImageBackground>
      ) : currentScreen === 'palpites' ? (
        <PalpitesScreen
          jogos={jogos}
          palpiteDrafts={palpiteDrafts}
          setPalpiteDrafts={setPalpiteDrafts}
          savePalpite={savePalpite}
          confirmAllDrafts={confirmAllDrafts}
          isJogoStarted={isJogoStarted}
          onBack={() => setCurrentScreen('main')}
        />
      ) : currentScreen === 'meusPalpites' ? (
        <MeusPalpites
          palpites={palpites}
          jogosById={jogosById}
          onBack={() => setCurrentScreen('main')}
          fetchPalpites={fetchPalpites}
        />
      ) : (
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
      )}
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
