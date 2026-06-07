import React from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { flags } from './flags';

export default function PalpitesScreen({ jogos, palpiteDrafts, setPalpiteDrafts, savePalpite, confirmAllDrafts, isJogoStarted, onBack }) {
  const handleChange = (jogoId, field, value) => {
    setPalpiteDrafts((prev) => ({
      ...prev,
      [jogoId]: { ...(prev[jogoId] || {}), [field]: value === '' ? null : Number(value) },
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>Voltar</Text></Pressable>
        <Text style={styles.title}>Palpites</Text>
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        {jogos.map((jogo) => {
          const started = isJogoStarted(jogo);
          const draft = palpiteDrafts[jogo.id] || {};
          return (
            <View key={jogo.id} style={styles.card}>
              <Text style={styles.grupo}>GRUPO {jogo.grupo} • {jogo.confronto}</Text>
              <View style={styles.row}>
                <View style={styles.team}>
                  <Image style={styles.flag} source={flags[jogo.sigla_casa]} />
                  <Text style={styles.sigla}>{jogo.sigla_casa}</Text>
                </View>
                <View style={styles.inputs}>
                  <TextInput
                    value={draft.gols_casa != null ? String(draft.gols_casa) : ''}
                    onChangeText={(t) => handleChange(jogo.id, 'gols_casa', t)}
                    style={styles.input}
                    keyboardType="numeric"
                    editable={!started}
                    placeholder="Gols"
                    placeholderTextColor="#8fa3b8"
                  />
                </View>
                <View style={styles.teamRight}>
                  <Text style={styles.sigla}>{jogo.sigla_fora}</Text>
                  <Image style={styles.flag} source={flags[jogo.sigla_fora]} />
                </View>
                <View style={styles.inputs}>
                  <TextInput
                    value={draft.gols_fora != null ? String(draft.gols_fora) : ''}
                    onChangeText={(t) => handleChange(jogo.id, 'gols_fora', t)}
                    style={styles.input}
                    keyboardType="numeric"
                    editable={!started}
                    placeholder="Gols"
                    placeholderTextColor="#8fa3b8"
                  />
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => savePalpite(jogo.id)} style={styles.saveButton}>
                  <Text style={styles.saveText}>Salvar</Text>
                </Pressable>
                {started && <Text style={styles.lockText}>Bloqueado (jogo iniciado)</Text>}
              </View>
            </View>
          );
        })}

        <Pressable onPress={confirmAllDrafts} style={styles.confirmAllButton}><Text style={styles.confirmAllText}>Revisar e Confirmar Todos</Text></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', alignItems: 'center', backgroundColor: '#040b13' },
  header: { width: '90%', maxWidth: 360, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 8 },
  backText: { color: '#f2cc2f' },
  title: { color: 'white', fontSize: 20, fontWeight: '700' },
  card: { width: 320, backgroundColor: '#0c1b2a', borderRadius: 12, padding: 12, marginTop: 14 },
  grupo: { color: '#8fa3b8', fontSize: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flag: { width: 28, height: 28, borderRadius: 14 },
  sigla: { color: 'white', fontWeight: '700' },
  inputs: { width: 56, alignItems: 'center' },
  input: { width: 56, height: 36, borderRadius: 8, backgroundColor: '#06111b', color: 'white', textAlign: 'center', borderWidth: 1, borderColor: '#203246' },
  actions: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f2cc2f' },
  saveText: { color: '#040b13', fontWeight: '700' },
  lockText: { color: '#8fa3b8', fontSize: 12 },
  confirmAllButton: { marginTop: 18, marginBottom: 40, paddingVertical: 12, paddingHorizontal: 18, backgroundColor: '#1e90ff', borderRadius: 999 },
  confirmAllText: { color: 'white', fontWeight: '700' },
});
