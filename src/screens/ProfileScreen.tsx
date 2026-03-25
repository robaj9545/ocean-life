import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useGameStore } from '../store/useGameStore'

export default function ProfileScreen() {
  const coins = useGameStore(state => state.coins)
  const fishes = useGameStore(state => state.fishes)
  const lastTimestamp = useGameStore(state => state.lastTimestamp)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil 👤</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.statLine}>Total de Moedas: {Math.floor(coins)} 🪙</Text>
        <Text style={styles.statLine}>Peixes no Aquário: {fishes.length} 🐟</Text>
      </View>

      <Text style={styles.subtitle}>Supabase Status</Text>
      <View style={styles.statsCard}>
        <Text style={styles.statLine}>🟢 Conexão Armada</Text>
        <Text style={styles.statLine}>Usuário: Anônimo (Local)</Text>
      </View>

      <TouchableOpacity style={styles.syncBtn} onPress={() => alert('Em breve: Sync com Supabase!')}>
        <Text style={styles.syncText}>Salvar Progresso na Nuvem</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  statsCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2
  },
  statLine: {
    fontSize: 18,
    marginBottom: 8
  },
  syncBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  syncText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
})
