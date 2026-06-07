import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { supabase } from '../utils/supabase';
import { formatDate } from '../utils/formatDate';

export default function MeusPalpites({ palpites = [], jogosById = {}, onBack, fetchPalpites }) {
  const [filter, setFilter] = useState('todos'); // todos | pendentes | confirmados

  const handleDelete = async (jogoId) => {
    const { data: sessionData } = await supabase.auth.getUser();
    const userId = sessionData?.user?.id ?? sessionData?.id ?? null;
    if (!userId) return;
    const { error } = await supabase.from('palpites').delete().match({ user_id: userId, jogo_id: jogoId });
    if (error) {
      console.error('Erro ao deletar palpite:', error);
    }
    fetchPalpites();
  };

  const filtered = palpites.filter((p) => {
    if (filter === 'pendentes') return !p.confirmado;
    if (filter === 'confirmados') return p.confirmado;
    return true;
  });

  const isJogoStarted = (jogo) => {
    try {
      const dt = new Date(`${jogo.data_brasilia}T${jogo.hora_brasilia}:00`);
      return new Date() >= dt;
    } catch (e) {
      return false;
    }
  };

  // Agrupa palpites por data do jogo (data_brasilia)
  const palpitesAgrupados = filtered.reduce((acc, p) => {
    const jogo = jogosById[p.jogo_id] || {};
    const data = jogo.data_brasilia || 'sem-data';
    if (!acc[data]) acc[data] = [];
    acc[data].push({ palpite: p, jogo });
    return acc;
  }, {});

  const datasOrdenadas = Object.keys(palpitesAgrupados).sort();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>Voltar</Text></Pressable>
        <Text style={styles.title}>Meus Palpites</Text>
      </View>
      <View style={styles.filterRow}>
        <Pressable onPress={() => setFilter('todos')} style={[styles.filterBtn, filter === 'todos' && styles.filterActive]}><Text style={styles.filterText}>Todos</Text></Pressable>
        <Pressable onPress={() => setFilter('pendentes')} style={[styles.filterBtn, filter === 'pendentes' && styles.filterActive]}><Text style={styles.filterText}>Pendentes</Text></Pressable>
        <Pressable onPress={() => setFilter('confirmados')} style={[styles.filterBtn, filter === 'confirmados' && styles.filterActive]}><Text style={styles.filterText}>Confirmados</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>Você ainda não cadastrou palpites</Text></View>
        ) : (
          datasOrdenadas.map((data) => {
            const items = palpitesAgrupados[data].sort((a, b) => (a.jogo.hora_brasilia || '').localeCompare(b.jogo.hora_brasilia || ''));
            return (
              <View key={data} style={{ width: '100%', alignItems: 'center' }}>
                <View style={styles.dateHeader}><Text style={styles.dateHeaderText}>{data === 'sem-data' ? 'Sem data' : formatDate(data)}</Text></View>
                {items.map(({ palpite: p, jogo }) => {
                  const started = jogo && isJogoStarted(jogo);
                  return (
                    <View key={`${p.user_id}-${p.jogo_id}`} style={[styles.card, started && styles.cardStarted]}>
                      <Text style={styles.titleSmall}>{jogo.confronto || `Jogo ${p.jogo_id}`}</Text>
                      <Text style={styles.sub}>{jogo.data_brasilia} {jogo.hora_brasilia}</Text>
                      <Text style={styles.sub}>Palpite: {p.gols_casa ?? '-'} x {p.gols_fora ?? '-'}</Text>
                      <Text style={styles.sub}>Status: {p.confirmado ? 'Confirmado' : 'Pendente'}</Text>
                      {started ? <Text style={styles.startedText}>Iniciado</Text> : null}
                      <View style={styles.actions}>
                        <Pressable disabled={started} onPress={() => handleDelete(p.jogo_id)} style={[styles.deleteBtn, started && styles.deleteBtnDisabled]}>
                          <Text style={styles.deleteText}>{started ? 'Bloqueado' : 'Remover'}</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
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
  filterRow: { width: '90%', maxWidth: 360, flexDirection: 'row', gap: 8, marginTop: 12 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#08111d' },
  filterActive: { backgroundColor: '#f2cc2f' },
  filterText: { color: '#8fa3b8' },
  card: { width: 320, backgroundColor: '#0c1b2a', borderRadius: 12, padding: 12, marginTop: 14 },
  titleSmall: { color: 'white', fontWeight: '700' },
  sub: { color: '#8fa3b8', marginTop: 6 },
  actions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#d9534f' },
  deleteText: { color: 'white' },
  emptyCard: { marginTop: 20, width: 320, padding: 25, borderRadius: 12, backgroundColor: '#0c1b2a', alignItems: 'center' },
  emptyText: { color: '#8fa3b8' },
  dateHeader: { width: 320, marginTop: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: '#08111d', alignItems: 'center' },
  dateHeaderText: { color: '#f2cc2f', fontWeight: '700' },
  cardStarted: { opacity: 0.8, borderWidth: 1, borderColor: '#f2cc2f' },
  startedText: { color: '#f2cc2f', marginTop: 6, fontWeight: '700' },
  deleteBtnDisabled: { backgroundColor: '#6c757d' },
});
