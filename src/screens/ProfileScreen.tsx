import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useGameStore } from '../store/useGameStore'
import { supabase } from '../services/supabase'

export default function ProfileScreen() {
  const coins = useGameStore(state => state.coins)
  const fishes = useGameStore(state => state.fishes)
  const deadFishes = useGameStore(state => state.deadFishes)
  const level = useGameStore(state => state.level)
  const xp = useGameStore(state => state.xp)
  
  const [email, setEmail] = useState<string | null>('Carregando...')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || 'Mergulhador Misterioso')
    })
  }, [])

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => await supabase.auth.signOut() }
    ])
  }

  const xpNeeded = level * 1000;
  const xpPercent = Math.min(100, (xp / xpNeeded) * 100);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4B0082', '#483D8B', '#800080']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.title}>Perfil 👤</Text>
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.levelCircle}><Text style={styles.levelText}>{level}</Text></View>
        <Text style={styles.xpTitle}>Nível Mestre dos Mares</Text>
        
        <View style={styles.xpBarContainer}>
           <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
        </View>
        <Text style={styles.xpLabel}>{Math.floor(xp)} / {xpNeeded} XP</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.floor(coins)} 💰</Text>
          <Text style={styles.statLabel}>Fortuna</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{fishes.length} 🐟</Text>
          <Text style={styles.statLabel}>Vivos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{deadFishes.length} 👻</Text>
          <Text style={styles.statLabel}>Necrotério</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Desconectar do Servidor</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  emailText: { color: '#bbb', fontSize: 16, marginTop: 5, fontWeight: 'bold' },
  card: { margin: 20, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  levelCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFD700', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFA500', marginBottom: 15, shadowColor: '#FF8C00', shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 },
  levelText: { fontSize: 36, fontWeight: '900', color: '#8B4513' },
  xpTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  xpBarContainer: { width: '100%', height: 15, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8, overflow: 'hidden', marginBottom: 5 },
  xpBarFill: { height: '100%', backgroundColor: '#32CD32', borderRadius: 8 },
  xpLabel: { color: '#666', fontSize: 14, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  statBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: 5, paddingVertical: 20, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 5 },
  statLabel: { color: '#ddd', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  logoutBtn: { margin: 20, backgroundColor: '#DC143C', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 'auto', marginBottom: 40 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: '900' }
})
